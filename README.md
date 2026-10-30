# Charflut

Streetwear store front. Pages:

- `/` home: a curved hanging rail (drag it, click a piece for a closer look), a wall rail, "Try the Look" with
  six styled outfits, the Orbit wheel, an editorial slider and a gallery of looks.
- `/orbit`, `/hand-rail`, `/runway`: each of those sections on its own page.
- `/collections/all`: every colour of every product, with filters, sort and two grid sizes.
- `/products/<slug>`: photos on the left, colour, size and add to cart on the right.
- A "Shoot 3" basketball game opens once on a first visit; the discount it wins comes off the bag.

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
3. Model photos: run `python3 scripts/process-models.py`. It reads the source photos in
   `assets/models-src/<gender>.png` (transparent PNG, full body) and writes one 600×1500 WebP per colour and model
   to `public/models/<product>/<variant>-<gender>.webp`, recolouring the garment the product sells.
   To use a real product photo instead, put it at the same path, or set `images.men` / `images.women` on the variant.
4. Garment photos (the rails, cards and product gallery) and look photos: run `python3 scripts/process-garments.py`.
   It cuts each colour out of the model photo to `public/garments/<product>/<variant>.webp`, and dresses the
   models for each look in `src/data/looks.json` to `public/looks/<look>.webp`.

## Stack

Next.js 16 (App Router, standalone output), TypeScript, Tailwind CSS 4, GSAP (Draggable + Inertia) for the carousel,
Radix primitives for accessible dialogs, radio groups, popovers and accordions, Zustand for the persisted bag.

## Deploy

`railway.json` builds the `Dockerfile` and health-checks `/api/health`. The server listens on `$PORT`.

## Claude Code skills

`.claude/skills/` holds the reviewed design and GSAP skills used to build this. See `.claude/skills/SOURCES.md`.
