"""Generate og-image.png (1200x630) in the repo root for link previews.

Usage: python tools/make_og_image.py
Requires Pillow (pip install pillow).
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

WIDTH, HEIGHT = 1200, 630
PADDING = 90

BG = (7, 10, 12)            # #070A0C
GREEN = (61, 220, 151)      # #3DDC97
TEXT = (232, 238, 240)      # #E8EEF0
MUTED = (154, 165, 170)     # #9AA5AA

TITLE = "Matchett Data Solutions"
TAGLINE = "Data cleanup, spreadsheet automation, and lead lists for small businesses"
URL = "matchettdata.com"

FONT_DIR = Path("C:/Windows/Fonts")
BOLD_FONTS = ["segoeuib.ttf", "seguibl.ttf", "arialbd.ttf"]
REGULAR_FONTS = ["segoeui.ttf", "arial.ttf"]


def load_font(candidates, size):
    """Try each Windows font in turn, then fall back to Pillow's default font."""
    for name in candidates:
        try:
            return ImageFont.truetype(str(FONT_DIR / name), size)
        except OSError:
            continue
    try:
        return ImageFont.load_default(size=size)
    except TypeError:  # older Pillow without a sized default font
        return ImageFont.load_default()


def make_glow():
    """Soft green radial glow, strongest in the top-right area and fading to nothing."""
    cx, cy, radius = 1060, 40, 300
    glow = Image.new("L", (WIDTH, HEIGHT), 0)
    ImageDraw.Draw(glow).ellipse((cx - radius, cy - radius, cx + radius, cy + radius), fill=255)
    glow = glow.filter(ImageFilter.GaussianBlur(radius * 0.4))
    glow = glow.point(lambda v: int(v * 0.4))  # cap the intensity so the text stays readable
    return glow


def wrap(draw, text, font, max_width):
    lines, line = [], ""
    for word in text.split():
        trial = f"{line} {word}".strip()
        if draw.textlength(trial, font=font) <= max_width:
            line = trial
        else:
            lines.append(line)
            line = word
    lines.append(line)
    return lines


def main():
    img = Image.new("RGB", (WIDTH, HEIGHT), BG)
    img.paste(Image.new("RGB", (WIDTH, HEIGHT), GREEN), mask=make_glow())

    # Thin border, white at ~8% opacity, drawn on an overlay so it blends over the glow
    overlay = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    ImageDraw.Draw(overlay).rounded_rectangle(
        (28, 28, WIDTH - 29, HEIGHT - 29), radius=20, outline=(255, 255, 255, 20), width=2
    )
    img = Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")

    draw = ImageDraw.Draw(img)
    title_font = load_font(BOLD_FONTS, 84)
    tagline_font = load_font(REGULAR_FONTS, 36)
    url_font = load_font(BOLD_FONTS, 34)

    max_width = WIDTH - 2 * PADDING - 60
    y = 170
    draw.text((PADDING, y), TITLE, font=title_font, fill=TEXT)
    y += 120
    for line in wrap(draw, TAGLINE, tagline_font, max_width):
        draw.text((PADDING, y), line, font=tagline_font, fill=MUTED)
        y += 54
    draw.text((PADDING, HEIGHT - PADDING - 34), URL, font=url_font, fill=GREEN)

    out = Path(__file__).resolve().parent.parent / "og-image.png"
    img.save(out, "PNG")
    print(f"Wrote {out} ({img.width}x{img.height})")


if __name__ == "__main__":
    main()
