# KIRI

Aplicación móvil minimalista para aprender inglés (y otros idiomas) fotografiando objetos reales con tu cámara. Un modelo de visión por computadora (**Google Gemini Flash**) analiza cada foto desde una **Supabase Edge Function**, identifica el objeto principal en el idioma objetivo con su fonética IPA y una frase natural de ejemplo, y lo guarda junto con tu fotografía en tu colección personal.

## Stack

- **Mobile & Web**: [Expo SDK 58](https://expo.dev) + React Native + [Expo Router](https://docs.expo.dev/router/introduction/) (`NativeTabs` en iOS/Android, barra inferior en móvil web y riel lateral vertical en tablet/web expandido)
- **Estilos y Animaciones**: [NativeWind v4](https://www.nativewind.dev/) (Tailwind CSS) + [React Native Reanimated v4](https://docs.swmansion.com/react-native-reanimated/) + `@expo-google-fonts/geist` (`Geist_600SemiBold` y `Geist_500Medium`)
- **Backend, Auth y Storage**: [Supabase](https://supabase.com) (Auth anónima automática con vinculación opcional de correo, Postgres con RLS, bucket privado `objects` con URLs firmadas)
- **Visión IA**: Supabase Edge Function (`supabase/functions/analyze-object/index.ts`) conectada a **Google Gemini Flash** (`gemini-flash-latest`) con `responseSchema` JSON estructurado y límite de 60 análisis diarios por usuario
- **Hosting Web & Distribución Móvil**: [Vercel](https://vercel.com) (`mobile/vercel.json`) para la versión web exportada con Expo y **EAS Build / Submit** para compilaciones nativas iOS y Android

## Estructura del proyecto

```text
KIRI-AI/
├── PRODUCT.md                         # Contexto de producto y decisiones de arquitectura
├── DESIGN.md                          # Sistema de diseño (Monochrome Product)
├── supabase/
│   ├── config.toml                    # Configuración local de Supabase
│   ├── migrations/
│   │   └── 0001_init.sql              # Tablas profiles, objects, analysis_log, RLS y Storage
│   └── functions/
│       └── analyze-object/index.ts    # Edge Function con Gemini Flash Vision
└── mobile/
    ├── app/                           # Rutas de Expo Router (_layout, onboarding, (tabs), object/[id])
    ├── components/                    # Reticle, WordReveal, ResultPanel, ObjectTile, RadialGround, Button, Icon
    ├── lib/                           # Tema, cliente Supabase, análisis de imagen, TTS (expo-speech), estado
    ├── assets/                        # Fotografías de estudio para modo local/demo
    └── vercel.json                    # Configuración de despliegue estático para Vercel
```

## 1. Ejecutar la app móvil en local

```bash
cd mobile
npm install
cp .env.example .env
npx expo start
```

- Presiona `i` para abrir en **iOS Simulator**, `a` para **Android Emulator**, `w` para **Web**, o escanea el código QR con **Expo Go** / un Development Build.
- Si aún no configuras las variables de Supabase en `.env`, la app funciona automáticamente en **modo local** (persistiendo tu colección en `AsyncStorage` con fotografías de estudio de demostración).

## 2. Configurar Supabase y Gemini Vision

1. Crea un proyecto en [Supabase](https://supabase.com/dashboard) y activa **Anonymous Sign-Ins** en **Authentication → Providers → Anonymous**.
2. Ejecuta la migración SQL en el **SQL Editor** de Supabase o mediante la CLI:
   ```bash
   supabase db push
   ```
   (El archivo `supabase/migrations/0001_init.sql` crea las tablas `profiles`, `objects`, `analysis_log`, sus políticas RLS y el bucket privado `objects`).
3. Configura tu clave de API de Google AI Studio (`GEMINI_API_KEY`) y despliega la Edge Function:
   ```bash
   supabase secrets set GEMINI_API_KEY=tu_clave_de_gemini
   supabase functions deploy analyze-object
   ```
4. Copia la URL y la Anon Key de tu proyecto en `mobile/.env`:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
   ```

## 3. Desplegar en Vercel (Web) y EAS (iOS / Android)

### Web en Vercel
El directorio `mobile/` incluye `vercel.json` listo para exportar la aplicación Expo como SPA estática:
1. Importa el repositorio en **Vercel** y selecciona `mobile` como **Root Directory**.
2. Añade `EXPO_PUBLIC_SUPABASE_URL` y `EXPO_PUBLIC_SUPABASE_ANON_KEY` en **Environment Variables**.
3. Vercel ejecutará automáticamente `npx expo export --platform web` y servirá `dist/`.

### iOS y Android con EAS Build
```bash
cd mobile
npm install -g eas-cli
eas login
eas build:configure
eas build --platform all
```
