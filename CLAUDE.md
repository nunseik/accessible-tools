# AccessiTools — Claude Code guide

## What this project is

Mobile-first accessibility tools suite (calculator, notes, recipes, unit converter) built as an offline-first PWA. All data lives on the device via IndexedDB — no backend, no auth.

## Dev setup

```bash
npm install
npm run dev      # starts on http://localhost:3000
npm run build    # production build (Turbopack)
```

## Stack

- **Next.js 16** (App Router, Turbopack) + TypeScript
- **Tailwind CSS v4** + **shadcn/ui** for accessible components
- **Dexie.js** (IndexedDB) — notes, recipes, settings stored locally
- **Web Speech API** — voice input (`SpeechRecognition`) + TTS (`SpeechSynthesis`)
- **Service worker** at `public/sw.js` — offline caching (manual, avoids next-pwa webpack conflict)
- **npm** as package manager

## Key files

| File | Purpose |
|---|---|
| `lib/db.ts` | Dexie database schema — notes, recipes, settings |
| `lib/conversions.ts` | Pure unit conversion functions (no side effects, easy to test) |
| `hooks/useSpeechRecognition.ts` | Web Speech API voice input hook |
| `hooks/useTextToSpeech.ts` | SpeechSynthesis TTS hook |
| `hooks/useSettings.ts` | Live Dexie settings (font size, theme, speech rate) |
| `components/ThemeProvider.tsx` | Applies font-size CSS variable and theme class to `<html>` |
| `components/accessibility/` | VoiceInput, TTSButton, FontSizeControl, ThemeControl |
| `public/sw.js` | Service worker for offline support |
| `public/manifest.json` | PWA manifest |
| `next.config.ts` | Turbopack config (keep `turbopack: {}` — suppresses webpack/turbopack warning) |

## Accessibility standards

- **Touch targets**: 64px minimum (`min-h-[3rem]` or `min-h-[4rem]`)
- **Font sizes**: driven by `data-fontsize` attribute on `<html>` (see `globals.css`)
- **Themes**: `light` | `dark` | `high-contrast` classes on `<html>`
- **ARIA**: every interactive element needs `aria-label`; buttons toggled by state use `aria-pressed`
- **Voice**: wrap any input in `<VoiceInput onResult={...} />` — handles unsupported browser gracefully
- **TTS**: wrap any text block with `<TTSButton text={...} />` — noop on unsupported browsers

## Data layer

All CRUD goes through Dexie — no API routes needed for MVP. Pattern:

```ts
// Read (reactive)
const notes = useLiveQuery(() => db.notes.orderBy('updatedAt').reverse().toArray());

// Write
await db.notes.add({ title, content, createdAt: new Date(), updatedAt: new Date() });
await db.notes.update(id, { content, updatedAt: new Date() });
await db.notes.delete(id);
```

## Adding a new tool

1. Create `app/<tool>/page.tsx` — mark `"use client"` if it uses hooks or browser APIs
2. Add an entry to the `TOOLS` array in `app/page.tsx`
3. Add the route to `STATIC_ASSETS` in `public/sw.js` for offline support
4. If the tool stores data, add a table to `lib/db.ts` and bump the version

## PWA / offline

The service worker caches pages on first visit. After any route change, update `STATIC_ASSETS` in `public/sw.js` and bump `CACHE_NAME` to force users to get the new worker.

## Browser API hooks — SSR safety rule

Any hook that checks browser API availability (`speechSynthesis`, `SpeechRecognition`, etc.) **must not** compute `isSupported` inline during render. Doing so causes a hydration mismatch (server: `false`, client: `true`) that forces React to re-render the whole page, breaking event handlers.

**Always use this pattern:**

```ts
const [isSupported, setIsSupported] = useState(false);
useEffect(() => {
  setIsSupported("speechSynthesis" in window);
}, []);
```

Both server and client renders start with `false`; the client updates after mount. Applies to `useTextToSpeech`, `useSpeechRecognition`, and any future hook that touches browser-only APIs.

## Calculator — state update rules

The calculator in `app/calculator/page.tsx` uses several `useCallback` hooks that close over state. Two invariants to maintain:

1. **Never call a sibling state setter inside a `setDisplay` functional updater.** Set state in sequence at the top level of the callback instead (React 18 batches them).
2. **Never chain async state updates across callbacks.** If `setOperator` needs the result of a calculation to pass to `setPrev`, compute it synchronously with the pure `computeResult(prev, op, display)` helper — don't call `calculate()` and then read `display` from the closure.
3. **Fraction buttons must set `waitingForOperand = false`.** Setting it to `true` (same as after an operator press) causes the next operator to skip computing the pending operation. Fraction input is a value, not an operator.

## Deployment

```bash
npx vercel --prod
```

No environment variables required. The app is fully client-side — Vercel serves static HTML/JS/CSS.
