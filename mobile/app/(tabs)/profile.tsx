import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { getStoredGeminiKey, setStoredGeminiKey } from '@/lib/analyze';
import { useApp } from '@/lib/app-context';
import { isSupabaseConfigured } from '@/lib/supabase';
import { useTheme } from '@/lib/theme';
import { LANGUAGES } from '@/lib/types';

export default function ProfileScreen() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { profile, setLearning, resetOnboarding, objects, backend, linkEmail } = useApp();
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [geminiKey, setGeminiKey] = useState('');
  const [geminiSaved, setGeminiSaved] = useState(false);

  const learned = objects.filter((o) => o.learned).length;
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';

  useEffect(() => {
    getStoredGeminiKey().then((k) => {
      if (k) setGeminiKey(k);
    });
  }, []);

  const saveGemini = async () => {
    await setStoredGeminiKey(geminiKey);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setGeminiSaved(true);
    setTimeout(() => setGeminiSaved(false), 2200);
  };

  const submitEmail = async () => {
    setSending(true);
    setMessage(null);
    try {
      await linkEmail(email.trim());
      setMessage('Te enviamos un correo para confirmar.');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'No se pudo enviar el correo.');
    } finally {
      setSending(false);
    }
  };

  return (
    <ScrollView
      className="bg-ink-50 dark:bg-ink-950"
      contentContainerClassName="w-full max-w-[640px] self-center gap-9 px-5"
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 120 }}
      keyboardShouldPersistTaps="handled">
      <View className="gap-1">
        <Text
          accessibilityRole="header"
          className="font-display text-[34px] leading-[38px] tracking-tighter text-ink-950 dark:text-ink-50">
          Perfil
        </Text>
        <Text className="text-[15px] text-ink-500 dark:text-ink-400">
          {objects.length} {objects.length === 1 ? 'objeto' : 'objetos'} · {learned}{' '}
          {learned === 1 ? 'aprendido' : 'aprendidos'}
        </Text>
      </View>

      <View className="gap-3">
        <Text
          style={{ fontFamily: 'Geist_500Medium' }}
          className="font-sans text-xl tracking-tight text-ink-950 dark:text-ink-50">
          Estoy aprendiendo
        </Text>
        <View
          accessibilityRole="radiogroup"
          className="overflow-hidden rounded-card border border-ink-200 bg-white dark:border-ink-800 dark:bg-ink-900">
          {LANGUAGES.map((l, i) => {
            const on = profile.learning === l.code;
            return (
              <Pressable
                key={l.code}
                accessibilityRole="radio"
                accessibilityState={{ checked: on }}
                onPress={() => {
                  Haptics.selectionAsync();
                  setLearning(l.code);
                }}
                className={`min-h-[56px] flex-row items-center justify-between px-[18px] ${
                  i === 0 ? '' : 'border-t border-ink-200 dark:border-ink-800'
                }`}>
                <View>
                  <Text
                    className={`text-[17px] text-ink-950 dark:text-ink-50 ${
                      on ? 'font-semibold' : ''
                    }`}>
                    {l.name}
                  </Text>
                  <Text className="text-sm text-ink-500 dark:text-ink-400">{l.native}</Text>
                </View>
                {on && <Icon name="check" size={20} color={t.text} />}
              </Pressable>
            );
          })}
        </View>
      </View>

      <View className="gap-3">
        <Text
          style={{ fontFamily: 'Geist_500Medium' }}
          className="font-sans text-xl tracking-tight text-ink-950 dark:text-ink-50">
          Modelo de Visión IA (Gemini)
        </Text>
        <Text className="text-[15px] leading-[21px] text-ink-500 dark:text-ink-400">
          Clave activa desde <Text className="font-medium text-ink-950 dark:text-ink-50">.env.local</Text>{' '}
          (usando <Text className="font-medium text-ink-950 dark:text-ink-50">gemini-flash-lite-latest</Text>{' '}
          con respaldo automático).
        </Text>
        <TextInput
          value={geminiKey}
          onChangeText={setGeminiKey}
          placeholder="AIzaSy... o AQ..."
          placeholderTextColor={t.textSubtle}
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry
          accessibilityLabel="Clave de API de Gemini"
          selectionColor={t.accent}
          className="min-h-[52px] rounded-2xl border border-ink-200 bg-white px-4 text-base text-ink-950 dark:border-ink-800 dark:bg-ink-900 dark:text-ink-50"
        />
        <Button
          label={geminiSaved ? 'Clave guardada' : 'Guardar clave de IA'}
          variant="primary"
          onPress={saveGemini}
        />
      </View>

      <View className="gap-3">
        <Text
          style={{ fontFamily: 'Geist_500Medium' }}
          className="font-sans text-xl tracking-tight text-ink-950 dark:text-ink-50">
          Base de datos (Supabase)
        </Text>
        <View className="rounded-2xl border border-ink-200 bg-white p-4 dark:border-ink-800 dark:bg-ink-900" style={{ gap: 6 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: backend === 'remote' ? '#2F6BFF' : isSupabaseConfigured ? '#F59E0B' : t.textSubtle,
              }}
            />
            <Text style={{ color: t.text, fontFamily: 'Geist_600SemiBold', fontSize: 15 }}>
              {backend === 'remote'
                ? 'Conectada y sincronizando en la nube'
                : isSupabaseConfigured
                  ? 'URL configurada · Guardando en dispositivo'
                  : 'Modo local'}
            </Text>
          </View>
          {isSupabaseConfigured && (
            <Text numberOfLines={1} style={{ color: t.textMuted, fontSize: 14 }}>
              {supabaseUrl}
            </Text>
          )}
          <Text style={{ color: t.textMuted, fontSize: 14, lineHeight: 20 }}>
            {backend === 'remote'
              ? 'La tabla public.objects y el bucket objects están activos en tu proyecto de Supabase.'
              : 'Para activar el guardado en la nube, abre el SQL Editor de tu dashboard de Supabase y ejecuta supabase/migrations/0001_init.sql.'}
          </Text>
        </View>

        {backend === 'remote' && (
          <View style={{ gap: 10, marginTop: 6 }}>
            <Text style={{ color: t.textMuted, fontFamily: 'Geist_500Medium', fontSize: 14 }}>
              Vincular correo electrónico (opcional)
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="tu@correo.com (opcional para respaldar tu cuenta)"
              placeholderTextColor={t.textSubtle}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              textContentType="emailAddress"
              accessibilityLabel="Correo electrónico"
              selectionColor={t.accent}
              className="min-h-[52px] rounded-2xl border border-ink-200 bg-white px-4 text-base text-ink-950 dark:border-ink-800 dark:bg-ink-900 dark:text-ink-50"
            />
            <Button
              label="Vincular correo"
              loading={sending}
              disabled={!/.+@.+\..+/.test(email)}
              onPress={submitEmail}
            />
            {message && (
              <Text
                accessibilityLiveRegion="polite"
                className="text-sm text-ink-500 dark:text-ink-400">
                {message}
              </Text>
            )}
          </View>
        )}
      </View>

      <View className="gap-3">
        <Text
          style={{ fontFamily: 'Geist_500Medium' }}
          className="font-sans text-xl tracking-tight text-ink-950 dark:text-ink-50">
          Bienvenida
        </Text>
        <Button
          label="Ver pantalla inicial (Onboarding)"
          variant="ghost"
          onPress={() => {
            Haptics.selectionAsync();
            resetOnboarding();
          }}
        />
      </View>
    </ScrollView>
  );
}
