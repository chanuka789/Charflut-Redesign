"""
Cuts each product colour out of the model photo as a "ghost" garment
(the clothes without the person), for the hanger rails, product cards and
the product gallery:

    public/garments/<product>/<variant>.webp       (transparent, 640 px wide)
    public/garments/<product>/<variant>-sm.webp    (320 px wide)

It also dresses the models for each look in src/data/looks.json (the top in
the hoodie colour, the trousers in the cargo colour):

    public/looks/<look>.webp      (600 x 1500, like the model photos)
    public/looks/<look>-sm.webp   (360 x 900)

Run it after adding colours:  python3 scripts/process-garments.py
It reuses the masks and recolouring from process-models.py, and the men's
photo (assets/models-src/men.png), whose top has no hair over it.
Like the model photos, this is a demo stand-in for real product shots: put a
real photo at the same path and the site uses it instead.
"""

import importlib.util
import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "garments"
WIDTH, SMALL_WIDTH = 640, 320

spec = importlib.util.spec_from_file_location("process_models", ROOT / "scripts" / "process-models.py")
pm = importlib.util.module_from_spec(spec)
spec.loader.exec_module(pm)


def fill_holes(mask):
    """Fills every gap the border can't reach (seams, hand shadows) so the garment is solid."""
    solid = Image.fromarray(((mask > 0.35) * 255).astype(np.uint8))
    solid = solid.filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.MinFilter(9))
    padded = Image.new("L", (solid.width + 2, solid.height + 2), 0)
    padded.paste(solid, (1, 1))
    ImageDraw.floodfill(padded, (0, 0), 128)
    outside = np.asarray(padded)[1:-1, 1:-1] == 128
    # Fill only the inside; the outer edge keeps the original soft mask.
    inside = Image.fromarray(((~outside) * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(5))
    inside = np.asarray(inside.filter(ImageFilter.GaussianBlur(1.0))).astype(np.float32) / 255
    return np.maximum(mask, inside)


def inner_collar(rgb, alpha, hex_colour):
    """Paints the inside back of the neck in a shade of the garment colour, where the head was."""
    h, w = alpha.shape
    rows = np.nonzero(alpha.max(1) > 0.5)[0]
    top = rows[0]
    cols = np.nonzero(alpha[top + 4] > 0.5)[0]
    cx = int((cols.min() + cols.max()) / 2) if len(cols) else w // 2
    target = np.array([int(hex_colour[i : i + 2], 16) for i in (1, 3, 5)], dtype=np.float32)
    shade = target * 0.55
    layer = Image.new("L", (w, h), 0)
    rx, ry = int(w * 0.13), int(h * 0.045)
    ImageDraw.Draw(layer).ellipse((cx - rx, top + ry, cx + rx, top + ry * 2 + ry // 2), fill=255)
    m = np.asarray(layer.filter(ImageFilter.GaussianBlur(2))).astype(np.float32) / 255
    m = m * (1 - alpha)  # only where the garment isn't
    rgb = rgb * (1 - m[..., None]) + shade * m[..., None]
    return rgb, np.maximum(alpha, m)


def blur(channel, radius=14):
    img = Image.fromarray(np.clip(channel, 0, 255).astype(np.uint8))
    return np.asarray(img.filter(ImageFilter.GaussianBlur(radius)), dtype=np.float32)


def main():
    rgba = np.array(Image.open(pm.SRC / "men.png").convert("RGBA"))
    a = rgba[..., 3].astype(np.float32)
    rgba[..., 3] = np.clip(a * 255 / max(1, a.max()), 0, 255).astype(np.uint8)
    top, bottom = pm.garment_masks(rgba)
    base = rgba[..., :3].astype(np.float32)
    lum = base @ np.array([0.299, 0.587, 0.114], dtype=np.float32)
    # The grey test also catches near-white skin and the undershirt at the hem; drop those.
    top = top * (lum < np.median(lum[top > 0.8]) * 1.22)
    masks = {"top": fill_holes(top), "bottom": fill_holes(bottom)}
    # Gaps the fill closed take a blurred copy of the garment around them, so
    # recolouring doesn't show skin or a flat patch through it.
    for raw, part in ((top, "top"), (bottom, "bottom")):
        holes = (masks[part] > 0.3) & (raw < 0.6)
        weight = (raw > 0.6).astype(np.float32)
        w = blur(weight * 255)
        for c in range(3):
            smooth = blur(base[..., c] * weight) * 255 / np.maximum(w, 1)
            base[..., c][holes] = smooth[holes]
    rgba[..., :3] = np.clip(base, 0, 255).astype(np.uint8)

    sizes = {}
    for slug, garment, variants in pm.load_variants():
        (OUT / slug).mkdir(parents=True, exist_ok=True)
        part = "bottom" if garment == "cargo" else "top"
        mask = masks[part]
        ys, xs = np.nonzero(mask > 0.05)
        y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
        for variant_id, hex_colour in variants:
            rgb = pm.recolour(rgba[..., :3].astype(np.float32), mask, hex_colour)[y0:y1, x0:x1]
            alpha = mask[y0:y1, x0:x1]
            if part == "top":
                rgb, alpha = inner_collar(rgb, alpha, hex_colour)
            out = Image.fromarray(np.dstack([np.clip(rgb, 0, 255), alpha * 255]).astype(np.uint8), "RGBA")
            big = out.resize((WIDTH, round(out.height * WIDTH / out.width)), Image.LANCZOS)
            big.save(OUT / slug / f"{variant_id}.webp", "WEBP", quality=78, method=6)
            small = out.resize((SMALL_WIDTH, round(out.height * SMALL_WIDTH / out.width)), Image.LANCZOS)
            small.save(OUT / slug / f"{variant_id}-sm.webp", "WEBP", quality=74, method=6)
            sizes[f"{slug}/{variant_id}"] = [big.width, big.height]
    print(json.dumps(sizes, indent=2))
    dress_looks()


def dress_looks():
    colours = {(slug, vid): hex_colour for slug, _, variants in pm.load_variants() for vid, hex_colour in variants}
    kinds = {slug: garment for slug, garment, _ in pm.load_variants()}
    looks = json.loads((ROOT / "src" / "data" / "looks.json").read_text())
    out_dir = ROOT / "public" / "looks"
    out_dir.mkdir(parents=True, exist_ok=True)
    models = {}
    for look in looks:
        gender = look["gender"]
        if gender not in models:
            rgba = np.array(Image.open(pm.SRC / f"{gender}.png").convert("RGBA"))
            a = rgba[..., 3].astype(np.float32)
            rgba[..., 3] = np.clip(a * 255 / max(1, a.max()), 0, 255).astype(np.uint8)
            models[gender] = (rgba, *pm.garment_masks(rgba))
        rgba, top, bottom = models[gender]
        rgb = rgba[..., :3].astype(np.float32)
        for piece in look["pieces"]:
            kind = kinds[piece["slug"]]
            hex_colour = colours[(piece["slug"], piece["variant"])]
            if kind == "hoodie":
                rgb = pm.recolour(rgb, top, hex_colour)
            elif kind == "cargo":
                rgb = pm.recolour(rgb, bottom, hex_colour)
        framed = pm.frame(np.dstack([rgb.astype(np.uint8), rgba[..., 3]]))
        framed.save(out_dir / f"{look['id']}.webp", "WEBP", quality=72, method=6)
        framed.resize(pm.SMALL, Image.LANCZOS).save(out_dir / f"{look['id']}-sm.webp", "WEBP", quality=70, method=6)


if __name__ == "__main__":
    main()
