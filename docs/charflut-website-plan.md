# Charflut Website Plan

**Product page template with a colour-variant model carousel**

Version 1.0 · 29 October 2026 · Owner: Chanuka Kanishka Nawarathna

Live site: https://web-production-3fb4d.up.railway.app/products/loop-hoodie

Code: github.com/chanuka789/Charflut-Redesign (branch `ccr-3ad7c8cf-6983gb`)

---

## 1. Summary

Charflut is a streetwear brand for men and women. This plan describes the **product page template** we designed and built together.

The idea comes from a "Try the Look" style website: a row of real models stands on a soft studio floor. **Each model wears the same product in a different colour.** The visitor moves the row **left or right**, and the model in the centre becomes the selected colour. The panel on the right then shows that colour's price, sizes and stock, and the "Add to bag" button.

The page is **one template for every product**. A new product needs only a data file and model photos, not new design work.

**Status:** built, tested and live on Railway.

---

## 2. Goals

| Goal | How the page meets it |
|---|---|
| Show every colour on a real person | One model photo per colour, in a moving row |
| Make choosing a colour fun and clear | Drag, swipe, arrow buttons, keyboard, colour circles or the colour bar |
| Sell more per order | "Complete the look" bundle with 10% off |
| Work on every screen | Separate layouts for desktop, tablet and mobile |
| Be accessible to everyone | Keyboard use, screen reader labels, pause button, reduced motion |
| Cost little to host | Static pages, edge cache, app sleeping, low memory |
| Be easy to grow | One data file per product, automatic photo processing |

---

## 3. Design direction

**Style:** a calm, premium studio look, like the reference video. There's a lot of white space, a soft studio floor, thin elegant headlines and soft shadows. The model row is the one bold element; everything around it is quiet.

### Colours

| Name | Hex | Use |
|---|---|---|
| Paper | `#EEEEEB` | Page background (a cool off-white, not cream) |
| Paper raised | `#F7F7F5` | Panels, drawers |
| Paper sunk | `#E4E4E0` | Thumbnails, hover backgrounds |
| Ink | `#1D1E20` | Main text, buttons |
| Ink soft | `#5B5D61` | Secondary text |
| Ink faint | `#65676B` | Small labels (passes 4.5:1 contrast) |
| Line | `#D5D5D0` | Dividers |
| Signal (cobalt) | `#2B3CE0` | Used only for focus, low stock, sale price and savings |
| Danger | `#B3261E` | Error messages |

### Typography

- **Headlines:** Bricolage Grotesque, light weight, condensed width, tight letter spacing.
- **Body text:** Hanken Grotesk, 16 px base, 1.25 type scale.
- Sentence case everywhere. No all-caps labels.

### Motion

- The carousel slides with momentum and settles on the nearest colour.
- The panel text fades between colours (about 0.25 s).
- Autoplay moves one colour every 5 seconds, **stops for good when the visitor touches anything**, and has a pause button.
- With "reduce motion" switched on in the visitor's system settings, there is no autoplay and no sliding, only instant changes.

---

## 4. Page structure

1. **Header:** logo, menu (Shop all, Hoodies, T-shirts, Trousers), bag with item count.
2. **Title area:** breadcrumb, product name, short summary, **Men / Women** switch.
3. **Model carousel (the main feature)**
   - Up to 5 models visible on desktop, 3 on tablet, 1 on phones with the neighbours peeking in.
   - Centre model: full size and sharp. Side models: smaller, faded and blurred, which creates depth.
   - Below the row: previous and next buttons, a colour bar with colour names and progress, and a pause button.
4. **Buy panel:** price (sale prices shown in cobalt with the old price struck through), selected colour name, colour circles, size buttons (sold-out sizes crossed out, "Only 2 left" warning), size guide, Add to bag, wishlist, delivery and returns notes, and details sections that open and close.
5. **Complete the look:** two matching products with size choices, a bundle price with 10% off, and "Add the full look to bag".
6. **You may also like:** cards for the other products.
7. **Bag drawer:** slides in from the right, with photo, colour and size, quantity, remove, bundle savings, subtotal and a free-delivery message.
8. **Footer:** brand line, shop links and help information.

---

## 5. Responsive layouts

| Screen | Layout |
|---|---|
| **Desktop** (1280 px and wider) | Two columns. The carousel stays fixed on the left while the buy panel scrolls on the right. 5 models visible. |
| **Laptop / landscape tablet** (1024–1279 px) | Same two columns with a narrower panel. 3 to 5 models visible, depending on width. |
| **Portrait tablet** (768–1023 px) | Carousel full width, buy panel below in two columns. |
| **Mobile** (under 768 px) | One model with neighbours peeking in, swipe to change. Touch targets at least 44 px. A sticky "Add to bag" bar appears after the visitor scrolls past the main button. |

---

## 6. Accessibility (WCAG 2.2 AA)

- Everything works with the keyboard. The left and right arrow keys move the carousel.
- Colours and sizes are proper radio groups, and screen readers hear "Rust, 2 of 6".
- The selected colour and price changes are announced politely.
- Focus is always visible with a cobalt outline. Text contrast is at least 4.5:1.
- The bag and size guide trap focus and close with Esc.
- Autoplay can be paused, and the reduced-motion setting is respected.
- **Tested:** axe scan with 0 serious issues, Lighthouse accessibility score 98.

---

## 7. How a product is set up

Each product is one file in `src/data/products/`. It holds:

- name, category, garment type (hoodie, tee or cargo), price and optional sale price
- summary, description, fit notes, details, materials, care
- **colours**, each with its name, colour code, optional own price, and sizes with stock
- optional "Complete the look" products and discount

The data is checked automatically when the site is built (Zod schema). A mistake stops the build instead of breaking the live page.

**Demo products:** Loop Hoodie ($128, 6 colours), Heavy Tee ($58, 6 colours), Utility Cargo ($142, 5 colours).

**Shareable links:** the address keeps the colour and model, for example `/products/loop-hoodie?color=rust&model=women`.

---

## 8. Model photos

### Rules for every photo

| Item | Requirement |
|---|---|
| Background | Transparent PNG (or plain light grey, removed afterwards) |
| Shadow | None. The page adds a soft floor shadow |
| Framing | Full body, head to shoes. Shoes almost touch the bottom edge |
| Pose | Standing, both feet on the floor, arms close to the body |
| Camera | Straight on, chest height, 85 mm look, no distortion |
| Light | Soft, even studio light from the front |
| Size | Portrait, at least 1024 × 1536 px |

### Photo workflow

1. Create base models with ChatGPT using the men's and women's prompts (20 poses each, see Appendix A).
2. Save them in `assets/models-src/` as transparent PNG files.
3. Run `python3 scripts/process-models.py`. For every product colour, the script:
   - recolours the garment the product sells (the top for hoodies and tees, the jeans for trousers), keeping the photo's folds and shading
   - trims the person to a narrow 2:5 frame with the feet on the bottom edge
   - saves a sharp 600 × 1500 WebP (about 100 KB) and a phone-sized 360 × 900 WebP (about 43 KB)
4. The page picks the right file for each screen automatically.

**Important:** recoloured photos are a **preview only**. The garment shape is still the sweatshirt from the photo. Before selling, use photos of the real product in each colour (Appendix A, Prompt 2), so customers get exactly what they see.

---

## 9. Technology

| Part | Choice |
|---|---|
| Framework | Next.js 16 (App Router), TypeScript in strict mode |
| Styling | Tailwind CSS 4 with design tokens |
| Animation | GSAP with Draggable and Inertia (all plugins free) |
| Accessible parts | Radix UI: drawers, dialogs, radio groups, accordions, popovers |
| Bag and wishlist | Zustand, saved in the visitor's browser |
| Data checks | Zod |
| Icons and fonts | Lucide icons, Google Fonts through next/font |
| Tests | Vitest (logic), Playwright (browser, desktop and mobile), axe (accessibility), Lighthouse |
| Hosting | Railway, using a Docker image |

**Claude Code skills used** (reviewed and stored in `.claude/skills/`):
- frontend-design (Anthropic)
- the official GSAP skills (GreenSock)
- ui-ux-pro-max (community)

---

## 10. Hosting and cost (Railway)

| Item | Setting |
|---|---|
| Project / service | `charflut` / `web` |
| Public address | `web-production-3fb4d.up.railway.app` |
| Deploys | Automatic on every push to the branch `ccr-3ad7c8cf-6983gb` |
| Health check | `/api/health` |
| Build | Dockerfile, Node 22 Alpine, standalone server |
| Resource limit | 0.5 GB memory, 1 vCPU |
| App sleeping | On: the server stops when nobody visits (the first visit after a quiet period takes a few seconds) |
| Edge cache | On: Railway serves pages and photos without waking the server |

### Steps taken to lower CPU and memory

1. Product pages are **built once at deploy time** and served as files, so no rendering happens per visit.
2. **No image resizing on the server.** Photos are pre-sized, and a small loader only picks the file.
3. Photos are **cached for one week** in browsers and at Railway's edge.
4. The Node memory heap is **capped** (96 MB).
5. **Result:** about 45 MB of memory after deploy, and about 103 MB peak under 900 test requests (before: about 128 MB).

---

## 11. Quality results (live site)

| Check | Result |
|---|---|
| Unit tests | 14 passed |
| Browser tests, desktop and mobile, on the live site | 23 passed |
| Accessibility (axe) | 0 serious issues |
| Server errors on Railway | 0 |
| Lighthouse (mobile): Performance | about 78 |
| Lighthouse: Accessibility / Best Practices / SEO | 98 / 96 / 100 |
| Main photo on a real slow-4G test | 3.4 s (was 6.9 s) |

**Target not yet met:** a Lighthouse Performance score of at least 95. The main remaining cost is JavaScript work on slow phones.

---

## 12. Next steps

| Priority | Task |
|---|---|
| 1 | Generate new models with the 20-pose prompts (a different person per colour) |
| 2 | Replace preview photos with real product photos per colour |
| 3 | Reduce JavaScript to raise the Performance score toward 95 |
| 4 | Connect a real shop backend (for example Shopify, or a Railway PostgreSQL database with an admin page) |
| 5 | Add AI virtual try-on (FASHN, Gemini API or similar, about $0.04–$0.08 per image; check current prices) |
| 6 | Add more pages: shop listing with filters, search, checkout |
| 7 | Open a pull request, review and merge |

---

## 13. How to run and update the site

```bash
npm install
npm run dev                  # local preview at http://localhost:3000
npm run lint && npm run typecheck && npm test
npm run build && npm run e2e # full browser tests
python3 scripts/process-models.py   # after adding model photos or colours
```

**To add a product:**
1. Copy `src/data/products/loop-hoodie.ts`.
2. Change the details and colours.
3. Add the new file to `src/data/catalog.ts`.
4. Run the photo script.
5. Push to the branch.

Railway deploys it automatically.

---

## Appendix A: Image prompts

### Prompt 1: base model (men and women versions, 20 poses each)

Use the full men's and women's prompts from our conversation. Each prompt fixes the person, outfit, camera, light and transparent background, and lets you choose a **pose number from 1 to 20**.

**Men's poses:**
1. Hands in pockets
2. Arms loosely crossed
3. One hand in pocket
4. Big laugh
5. Adjusting cuff
6. Hands behind back
7. Thumbs in belt loops
8. Mid-step walk
9. Hand through hair
10. Slight turn
11. Peace sign
12. Holding hem
13. Weight on back leg
14. Friendly shrug
15. Hand on neck
16. Hands clasped
17. Sleeves pushed up
18. Side glance
19. Ankles crossed
20. Thumbs up

**Women's poses:**
1. Hands in pockets
2. Hair behind ear
3. Hands on hips
4. Laughing, hand at collar
5. Hip out
6. Sleeves over hands
7. Mid-step walk
8. Arms crossed at waist
9. Hands behind back
10. Playing with hair
11. Slight turn
12. Peace sign by cheek
13. Holding hem
14. Ankles crossed
15. Lifting hair
16. Hand on chest, laughing
17. Hand on back pocket
18. Sleeves pushed up
19. Shy pose
20. Hand under chin

**Pose rules:** standing, both feet on the floor, arms close to the body, clothes clearly visible, full body in the frame.

### Prompt 2: put a base model in your product

Upload the base model and a clear photo of the product in one colour, then ask ChatGPT to dress the same person in it. Keep the face, pose, light, framing and transparent background the same. The product must match the photo exactly: colour (with its hex code), fit, and details such as the hood, pockets and cuffs. No added logos or prints.

### File names

`<product>/<colour>-<men|women>.png`, for example `loop-hoodie/rust-women.png`.

**Before you use AI images:** check OpenAI's current terms for commercial use and any local rules on labelling AI images, and make sure no model looks like a real, famous person.
