#!/usr/bin/env python3
# Generates UTZLINE Sub Orders' icon set: a simple delivery-box glyph (an
# open carton with a folded top flap) in this app's own accent color
# (#d1408f -- a magenta/rose hue, chosen because it's the one hue not
# already used by a sibling app: Site Measure/Viewer are orange-red
# (#c8391c/#ff6a3d), Install ITP green (#1f8a4c), Manufacture ITP purple
# (#7c3fd1), Delivery ITP amber (#f0b23e/#b8791a), UTZLINE Projects
# crimson (#ff3b3b), Scheduler blue/teal (#1f8fbf), Machine Schedule
# teal/cyan (#0e8f8a/#3fd9d0), Solid Surface Schedule indigo (#4f5fe0),
# $ Summary gold (#caa025)).
from PIL import Image, ImageDraw
import os

OUT = os.path.join(os.path.dirname(__file__), "icons")
os.makedirs(OUT, exist_ok=True)

BG = (26, 15, 22, 255)        # --bg
ACCENT = (209, 64, 143, 255)  # --accent #d1408f
WHITE = (247, 240, 244, 255)

def draw_box(d, cx, cy, size, line_color, flap_color):
    half = size * 0.42
    top_y = cy - half * 0.35
    bot_y = cy + half
    left_x = cx - half
    right_x = cx + half
    lw = max(2, int(size * 0.045))
    # box body
    d.rectangle([left_x, top_y, right_x, bot_y], outline=line_color, width=lw)
    # vertical center seam
    d.line([cx, top_y, cx, bot_y], fill=line_color, width=max(1, int(lw * 0.7)))
    # two open top flaps, each folded straight back and OUTWARD (away from
    # the other), with a clear gap between them at the top edge -- reads as
    # an opened carton, not a roof/house peak.
    flap_h = half * 0.62
    flap_w = half * 0.62
    gap = half * 0.16
    # left flap: a thin quad from the box's left edge, splayed up-left
    d.polygon([
        (left_x, top_y),
        (cx - gap, top_y),
        (cx - gap - flap_w * 0.25, top_y - flap_h),
        (left_x - flap_w * 0.55, top_y - flap_h * 0.72),
    ], outline=flap_color, width=lw)
    # right flap: mirrored, splayed up-right
    d.polygon([
        (right_x, top_y),
        (cx + gap, top_y),
        (cx + gap + flap_w * 0.25, top_y - flap_h),
        (right_x + flap_w * 0.55, top_y - flap_h * 0.72),
    ], outline=flap_color, width=lw)
    # packing tape strip down the front seam
    tape_w = half * 0.26
    d.rectangle([cx - tape_w / 2, top_y, cx + tape_w / 2, top_y + half * 0.34], fill=flap_color)

def make_icon(path, size, maskable):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    if maskable:
        d.rectangle([0, 0, size, size], fill=BG)
        glyph_size = size * 0.62
    else:
        d.rounded_rectangle([0, 0, size, size], radius=size * 0.18, fill=BG)
        glyph_size = size * 0.72
    cx, cy = size / 2, size / 2 + glyph_size * 0.06
    draw_box(d, cx, cy, glyph_size, WHITE, ACCENT)
    img.save(path)

make_icon(os.path.join(OUT, "icon-192.png"), 192, False)
make_icon(os.path.join(OUT, "icon-512.png"), 512, False)
make_icon(os.path.join(OUT, "icon-192-maskable.png"), 192, True)
make_icon(os.path.join(OUT, "icon-512-maskable.png"), 512, True)
print("done")
