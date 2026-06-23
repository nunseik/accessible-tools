# AccessiTools

A mobile-first, accessible web toolkit for people with special needs, elderly users, and workers who need hands-free or large-target interfaces (cooks, plumbers, construction workers).

All data is stored **privately on your device** — no accounts, no tracking, no network required after first load.

## Tools

| Tool | What it does |
|---|---|
| **Calculator** | Standard, Cooking (fractions), and Construction (ft/in) modes with 64px+ buttons |
| **Notes** | Voice dictation + typed notes with text-to-speech playback |
| **Recipes** | Store recipes, scale ingredient quantities (½× to 3×), hands-free cook mode with TTS step navigation |
| **Converter** | Instant multi-result conversion — Cooking, Length, Weight, Temperature, Volume |

## Accessibility features

- **Large touch targets** — 64px minimum on all interactive elements
- **4 font size presets** — Normal → Huge, applied globally in real time
- **3 themes** — Light, Dark, High Contrast
- **Voice input** — Web Speech API for notes, recipes, and calculator
- **Text-to-speech** — Read back any note, recipe step, or conversion result
- **Offline-first PWA** — install to home screen, works without internet
- **No account required** — zero friction, works immediately

## Stack

- [Next.js 16](https://nextjs.org/) (App Router) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- [Dexie.js](https://dexie.org/) — IndexedDB wrapper for local data persistence
- Web Speech API — browser-native voice input and TTS
- Progressive Web App — service worker + Web App Manifest

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) on your phone or in Chrome DevTools mobile emulation.

## Deployment

Deploy to Vercel in one step:

```bash
npx vercel --prod
```

No environment variables needed — the app is entirely client-side.

## Adding a tool

Each tool lives in `app/<tool-name>/page.tsx`. Shared accessibility components are in `components/accessibility/`. The Dexie schema is in `lib/db.ts`.
