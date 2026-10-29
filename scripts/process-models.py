"""
Turns the source model photos into the carousel images.

For every product colour it recolours the garment the product page sells
(the top for hoodies and tees, the jeans for trousers), trims the person
to a 2:5 frame with the feet on the bottom edge, and writes a small WebP:

    public/models/<product>/<variant>-<gender>.webp      (600 x 1500)
    public/models/<product>/<variant>-<gender>-sm.webp   (360 x 900, phones)

Run it after adding photos or colours:  python3 scripts/process-models.py
Source photos live in assets/models-src/<gender>.png (transparent PNG,
full body, grey crew-neck sweatshirt and light blue jeans).

This is a demo stand-in for real product photos: the recolouring keeps
the photo's shading, but the garment shape is the sweatshirt in the photo.
"""

import json
import re
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets" / "models-src"
OUT = ROOT / "public" / "models"
OUT_W, OUT_H = 600, 1500  # 2:5, matches the slide box
SMALL = (360, 900)
TOP_MARGIN, BOTTOM_MARGIN = 0.02, 0.008


def load_variants():
    """Reads slug, garment and variant colours straight from the product data files."""
    products = []
    for f in sorted((ROOT / "src" / "data" / "products").glob("*.ts")):
        text = f.read_text()
        slug = re.search(r'slug: "([^"]+)"', text).group(1)
        garment = re.search(r'garment: "([^"]+)"', text).group(1)
        variants = re.findall(r'\{ id: "([^"]+)", name: "[^"]+", hex: "(#[0-9a-fA-F]{6})"', text)
        products.append((slug, garment, variants))
    return products


def garment_masks(rgba):
    """Soft masks for the top (grey sweatshirt) and bottom (blue jeans)."""
    a = rgba.astype(np.int32)
    r, g, b, alpha = a[..., 0], a[..., 1], a[..., 2], a[..., 3]
    opaque = alpha > 128
    hi = np.maximum(np.maximum(r, g), b)
    lo = np.minimum(np.minimum(r, g), b)
    grey = opaque & ((hi - lo) < 24) & (np.abs(b - r) < 18) & (hi > 40)
    blue = opaque & ((b - r) > 12) & (b > 60)

    rows_grey = grey.sum(1)
    rows_blue = blue.sum(1)
    top_start = int(np.argmax(rows_grey > 100))
    jeans_start = int(np.argmax(rows_blue > 100))
    # Shoes: the white rows below the jeans.
    # Search well below the waist, where the grey top no longer overlaps.
    below = np.nonzero((rows_grey > 100) & (np.arange(len(rows_grey)) > jeans_start + 300))[0]
    shoes_start = int(below[0]) if len(below) else len(rows_grey)

    rows = np.arange(a.shape[0])[:, None]
    top = grey & (rows >= top_start - 6) & (rows < jeans_start + 12)
    # The blue test already skips the white shoes, so let the hem overlap them.
    bottom = blue & (rows >= jeans_start - 12) & (rows < shoes_start + 80)

    def soften(mask):
        # Close small holes (folds, seams), then feather the edge.
        img = Image.fromarray((mask * 255).astype(np.uint8))
        img = img.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.MinFilter(5))
        img = img.filter(ImageFilter.GaussianBlur(1.2))
        return np.asarray(img).astype(np.float32) / 255 * opaque

    return soften(top), soften(bottom)


def recolour(rgb, mask, hex_colour):
    """Shading-preserving tint: the garment's own light and shadow, in the new colour."""
    target = np.array([int(hex_colour[i : i + 2], 16) for i in (1, 3, 5)], dtype=np.float32)
    lum = rgb @ np.array([0.299, 0.587, 0.114], dtype=np.float32)
    weights = mask > 0.5
    base = float(np.median(lum[weights])) if weights.any() else 128.0
    rel = (lum / base)[..., None]
    darker = target * rel
    lighter = target + (255 - target) * np.clip((lum[..., None] - base) / (255 - base), 0, 1) * 0.6
    tinted = np.where(rel <= 1, darker, lighter)
    m = mask[..., None]
    return np.clip(rgb * (1 - m) + tinted * m, 0, 255)


def frame(rgba):
    """Trims to the person and places them in a 2:5 canvas, feet on the bottom edge."""
    alpha = rgba[..., 3]
    ys, xs = np.nonzero(alpha > 8)
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    person = Image.fromarray(rgba[y0:y1, x0:x1])
    h = y1 - y0
    canvas_h = int(round(h / (1 - TOP_MARGIN - BOTTOM_MARGIN)))
    canvas_w = int(round(canvas_h * OUT_W / OUT_H))
    canvas = Image.new("RGBA", (canvas_w, canvas_h), (0, 0, 0, 0))
    canvas.paste(person, ((canvas_w - (x1 - x0)) // 2, int(canvas_h * TOP_MARGIN)))
    return canvas.resize((OUT_W, OUT_H), Image.LANCZOS)


def main():
    manifest = {}
    sources = {}
    for gender in ("men", "women"):
        src = SRC / f"{gender}.png"
        if not src.exists():
            continue
        rgba = np.array(Image.open(src).convert("RGBA"))
        # The generator left alpha at ~253 inside the person; make it fully opaque.
        alpha = rgba[..., 3].astype(np.float32)
        rgba[..., 3] = np.clip(alpha * 255 / max(1, alpha.max()), 0, 255).astype(np.uint8)
        sources[gender] = (rgba, *garment_masks(rgba))

    for slug, garment, variants in load_variants():
        (OUT / slug).mkdir(parents=True, exist_ok=True)
        for variant_id, hex_colour in variants:
            for gender, (rgba, top, bottom) in sources.items():
                mask = bottom if garment == "cargo" else top
                rgb = recolour(rgba[..., :3].astype(np.float32), mask, hex_colour)
                out = np.dstack([rgb.astype(np.uint8), rgba[..., 3]])
                framed = frame(out)
                path = OUT / slug / f"{variant_id}-{gender}.webp"
                framed.save(path, "WEBP", quality=72, method=6)
                # Phone-sized copy, picked by src/lib/image-loader.ts for small slots.
                small = OUT / slug / f"{variant_id}-{gender}-sm.webp"
                framed.resize(SMALL, Image.LANCZOS).save(small, "WEBP", quality=70, method=6)
                manifest[f"{slug}/{variant_id}-{gender}"] = path.stat().st_size + small.stat().st_size
    total = sum(manifest.values())
    print(json.dumps({"files": len(manifest), "totalKB": round(total / 1024)}, indent=2))


if __name__ == "__main__":
    main()
