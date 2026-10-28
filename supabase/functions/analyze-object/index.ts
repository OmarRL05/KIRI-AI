// Supabase Edge Function: analyze-object
// Receives a photo, asks Gemini Flash to name the main object in the
// learning language, returns structured JSON. The Gemini key never leaves
// the server. Requires a signed-in user (anonymous sign-ins count).

import { createClient } from 'npm:@supabase/supabase-js@2';

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const GEMINI_MODEL = Deno.env.get('GEMINI_MODEL') ?? 'gemini-flash-lite-latest';
const DAILY_LIMIT = Number(Deno.env.get('DAILY_ANALYSIS_LIMIT') ?? '60');
const MAX_BASE64_CHARS = 4_000_000; // ~3 MB of image

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  pt: 'Brazilian Portuguese',
  ja: 'Japanese',
};

const CATEGORIES = [
  'Hogar', 'Cocina', 'Comida', 'Tecnología', 'Oficina', 'Ropa',
  'Naturaleza', 'Transporte', 'Cuerpo', 'Ciudad', 'Otro',
];

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

const responseSchema = {
  type: 'OBJECT',
  properties: {
    identifiable: { type: 'BOOLEAN' },
    word: { type: 'STRING' },
    translation: { type: 'STRING' },
    phonetic: { type: 'STRING' },
    example: { type: 'STRING' },
    exampleTranslation: { type: 'STRING' },
    category: { type: 'STRING', enum: CATEGORIES },
    confidence: { type: 'NUMBER' },
  },
  required: [
    'identifiable', 'word', 'translation', 'phonetic',
    'example', 'exampleTranslation', 'category', 'confidence',
  ],
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
  if (!GEMINI_API_KEY) return json({ error: 'server_misconfigured' }, 500);

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const authHeader = req.headers.get('Authorization') ?? '';

  // Identify the caller.
  const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user) return json({ error: 'unauthorized' }, 401);
  const userId = userData.user.id;

  let payload: { image?: string; mimeType?: string; language?: string; nativeLanguage?: string };
  try {
    payload = await req.json();
  } catch {
    return json({ error: 'bad_request' }, 400);
  }
  const { image, mimeType = 'image/jpeg', language = 'en' } = payload;
  if (!image || image.length > MAX_BASE64_CHARS) return json({ error: 'bad_image' }, 400);
  const languageName = LANGUAGE_NAMES[language];
  if (!languageName) return json({ error: 'bad_language' }, 400);

  // Daily cap per user (service role writes the log).
  const admin = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count } = await admin
    .from('analysis_log')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', since);
  if ((count ?? 0) >= DAILY_LIMIT) return json({ error: 'limit' }, 429);
  await admin.from('analysis_log').insert({ user_id: userId });

  const systemPrompt = [
    'You are the vision engine of a language-learning app for Spanish speakers.',
    'Look at the photo and identify the single most prominent physical object.',
    `Return its everyday name in ${languageName}: lowercase, no article, the most common word a learner should know (a compound like "coffee cup" is fine, never a sentence).`,
    'translation: that same object in natural Spanish, lowercase, no article.',
    `phonetic: IPA between slashes for ${languageName}; for Japanese use rōmaji instead.`,
    `example: one short, simple sentence in ${languageName} using the word (A1-A2 level). exampleTranslation: its Spanish translation.`,
    `category: pick exactly one of: ${CATEGORIES.join(', ')}.`,
    'confidence: 0 to 1.',
    'If the photo is blurry, empty, only shows people, or no single object is clear, set identifiable=false and fill the other fields with empty strings, category "Otro", confidence 0.',
  ].join('\n');

  const geminiRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GEMINI_API_KEY },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [
          {
            role: 'user',
            parts: [
              { inline_data: { mime_type: mimeType, data: image } },
              { text: 'Identify the main object.' },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json',
          responseSchema,
        },
      }),
    },
  );

  if (!geminiRes.ok) {
    console.error('gemini error', geminiRes.status, await geminiRes.text());
    return json({ error: 'upstream' }, 502);
  }

  try {
    const result = await geminiRes.json();
    const text = result?.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';
    const parsed = JSON.parse(text);
    if (!parsed.identifiable || !parsed.word || parsed.confidence < 0.35) {
      return json({ error: 'no_object' });
    }
    return json({
      word: String(parsed.word).trim().toLowerCase(),
      translation: String(parsed.translation).trim().toLowerCase(),
      phonetic: String(parsed.phonetic ?? ''),
      example: String(parsed.example ?? ''),
      exampleTranslation: String(parsed.exampleTranslation ?? ''),
      category: CATEGORIES.includes(parsed.category) ? parsed.category : 'Otro',
      confidence: Number(parsed.confidence) || 0,
    });
  } catch (e) {
    console.error('parse error', e);
    return json({ error: 'upstream' }, 502);
  }
});
