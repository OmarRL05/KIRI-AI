# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

## Stack

User-specified: React Native + Expo (Expo Router), Tailwind via NativeWind, Supabase (auth, Postgres, Storage, Edge Functions). Vision model: Google Gemini Flash, called from a Supabase Edge Function so the API key never ships in the app. Hosting: delegated; recommended Vercel for the web/marketing + Expo web export, Supabase cloud for backend, EAS for native builds.

## Users

Spanish speakers learning English (first target), using their phone camera in everyday life (home, street, kitchen, office). The architecture supports more learning languages (French, German, Japanese...) chosen in onboarding.

## Product Purpose

Learn a language by pointing the camera at real things. A vision model identifies the main object in the photo and returns its name in the language being learned; the object is saved to a personal collection. Success: the user snaps objects daily and the collection becomes a visible, growing vocabulary.

## Positioning

Vocabulary tied to the user's own physical surroundings: every word in the collection is an object they photographed, not a generic flashcard deck.

## Operating Context

One-handed, on the move, variable light. Core loop: open straight into camera, shoot, see the word, hear it, save it, later browse the collection.

## Capabilities and Constraints

- Camera capture and gallery pick; image analysis via Edge Function (Gemini Flash, structured JSON: word, translation, article/phonetic, example sentence).
- Word pronunciation via on-device text-to-speech.
- Collection of captured objects (photo + word + translation) per user, in Supabase Postgres + Storage.
- Supabase auth (email magic link / anonymous first, upgradeable).
- Learning language selectable (English default); native language Spanish.
- Undecided: spaced-repetition/quiz mode, offline queue, monetization, social features.

## Brand Commitments

Product working name: KIRI. Very modern, very minimalist, smooth and fluid animations (user-pinned).

## Evidence on Hand

None: no existing assets, users, or content. No testimonials or metrics to be invented.

## Product Principles

- Camera first: the app opens into capture, everything else is secondary.
- The word is the reward: the moment of naming is the product.
- Collection is memory: every saved object should feel owned.
- Motion explains state; it never delays the loop.

## Accessibility & Inclusion

Spanish UI copy by default; large touch targets for one-handed use; reduced-motion respected; text-to-speech helps pronunciation.
