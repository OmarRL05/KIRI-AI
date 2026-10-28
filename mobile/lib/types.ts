export type LangCode = 'en' | 'fr' | 'de' | 'it' | 'pt' | 'ja';

export interface Language {
  code: LangCode;
  /** Name in Spanish, used in the UI. */
  name: string;
  /** Name in the language itself. */
  native: string;
  /** BCP-47 tag for text-to-speech. */
  speech: string;
}

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'Inglés', native: 'English', speech: 'en-US' },
  { code: 'fr', name: 'Francés', native: 'Français', speech: 'fr-FR' },
  { code: 'de', name: 'Alemán', native: 'Deutsch', speech: 'de-DE' },
  { code: 'it', name: 'Italiano', native: 'Italiano', speech: 'it-IT' },
  { code: 'pt', name: 'Portugués', native: 'Português', speech: 'pt-BR' },
  { code: 'ja', name: 'Japonés', native: '日本語', speech: 'ja-JP' },
];

export const DEFAULT_LANGUAGE: LangCode = 'en';

export function getLanguage(code: LangCode): Language {
  return LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0];
}

/** What the vision model returns for one photographed object. */
export interface Analysis {
  /** The object's name in the learning language. */
  word: string;
  /** Spanish translation. */
  translation: string;
  /** IPA, or romanization for Japanese. */
  phonetic: string;
  example: string;
  exampleTranslation: string;
  category: string;
  confidence: number;
  /** True when produced by the local development stub, never in production. */
  demo?: boolean;
}

export interface CollectedObject extends Analysis {
  id: string;
  language: LangCode;
  imageUri: string;
  /** Storage path when the object lives in Supabase. */
  imagePath?: string;
  createdAt: string;
  learned: boolean;
}

export interface Profile {
  learning: LangCode;
  onboarded: boolean;
}
