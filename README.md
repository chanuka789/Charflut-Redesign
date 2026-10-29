# Charflut

Product page template for a streetwear store. Models stand in a row, each wearing the same product in a different colour. Drag, swipe, use the arrows, or pick a colour, and the buy panel follows.

## Run it

```bash
npm install
npm run dev          # http://localhost:3000
npm run build && npm start   # production build (standalone server)
```

## Checks

```bash
npm run lint && npm run typecheck && npm test   # ESLint, TypeScript, Vitest
npm run build && npm run e2e                    # Playwright (desktop + mobile), axe, screenshots
BASE_URL=https://your-app.up.railway.app npm run e2e   # same suite against a live deployment
```

## Adding a product

1. Add a file in `src/data/products/` (copy `loop-hoodie.ts`) and list it in `src/data/catalog.ts`.
2. Data is validated with Zod (`src/lib/schema.ts`), so a mistake fails the build.
3. Model photos: put cut-out images (transparent background, 2:5 portrait, feet at the bottom) at
   `public/models/<product>/<variant>-<gender>.webp` and add them to the variant's `images.men` / `images.women`.
   Until then the page draws an illustrated placeholder model in the variant's colour.

## Stack

Next.js 16 (App Router, standalone output), TypeScript, Tailwind CSS 4, GSAP (Draggable + Inertia) for the carousel,
Radix primitives for accessible dialogs, radio groups, popovers and accordions, Zustand for the persisted bag.

## Deploy

`railway.json` builds the `Dockerfile` and health-checks `/api/health`. The server listens on `$PORT`.

## Claude Code skills

`.claude/skills/` holds the reviewed design and GSAP skills used to build this. See `.claude/skills/SOURCES.md`.
