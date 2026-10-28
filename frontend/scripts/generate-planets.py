"""Builds public/planets/<color>.svg from design_components/Planet Orbit.svg.

Each avatar colour gets the same animated planet with its own surface palette, cropped to the
planet and ring. The gold ring and plum stars stay, since they match the brand.
Run: python3 scripts/generate-planets.py
"""
import colorsys
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = (ROOT / "design_components" / "Planet Orbit.svg").read_text()
OUT = ROOT / "public" / "planets"
OUT.mkdir(parents=True, exist_ok=True)

# Body colours, matching AVATAR_HEX in src/components/ui/Avatar.tsx.
BODY = {
    "violet": "#7657d6", "lilac": "#b39cf5", "rose": "#e07ab8", "plum": "#8e4fa8", "peach": "#f4a582", "mint": "#5cc4a4",
    "sky": "#6aa7ef", "sun": "#f2bf4f", "coral": "#ee7a63", "teal": "#3aa5a0", "leaf": "#7cbf5e", "ink": "#3d3560",
}


def shade(hex_color: str, light: float, sat: float = 1.0) -> str:
    r, g, b = (int(hex_color[i : i + 2], 16) / 255 for i in (1, 3, 5))
    h, l, s = colorsys.rgb_to_hls(r, g, b)
    r, g, b = colorsys.hls_to_rgb(h, max(0.0, min(1.0, light)), max(0.0, min(1.0, s * sat)))
    return "#%02x%02x%02x" % (round(r * 255), round(g * 255), round(b * 255))


# Crop the 2050 x 2050 canvas to the planet, ring and orbiting stars.
svg = re.sub(r'viewBox="[^"]*"', 'viewBox="455 530 1140 1140"', SRC, count=1)
svg = svg.replace('height="100%" width="100%"', 'height="1140" width="1140"', 1)
# One decimal is plenty at this scale; only path data is rounded, so animation timing is untouched.
svg = re.sub(r' d="([^"]*)"', lambda m: ' d="' + re.sub(r"(\d+\.\d)\d+", r"\1", m.group(1)) + '"', svg)

for name, body in BODY.items():
    if name == "coral":
        palette = {}  # the original orange artwork
    else:
        palette = {
            "#ff6806": shade(body, 0.62, 1.1),  # lit surface
            "#df4c00": shade(body, 0.48, 1.05),  # surface
            "#2f160c": shade(body, 0.12, 0.8),  # surface shadow
            "#4c1d05": shade(body, 0.2, 0.9),  # planet body
        }
    out = svg
    for old, new in palette.items():
        out = out.replace(f'fill="{old}"', f'fill="{new}"')
    (OUT / f"{name}.svg").write_text(out)
print("wrote", len(BODY), "planets to", OUT)
