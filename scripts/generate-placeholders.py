"""
Placeholder imagery.

Real artwork is supplied separately. These exist so components can reference a
stable local path today and have it swapped for the real photograph later -
never a remote URL from a stock site, which would break the moment the app runs
somewhere without that host.

Each one is labelled so nobody mistakes it for final art.

Run: python3 scripts/generate-placeholders.py
"""
from PIL import Image, ImageDraw
import os

OUT = os.path.join(os.path.dirname(__file__), "..", "public", "images")

# Divotz palette anchors.
GREEN_DARK = (0x30, 0x48, 0x32)
GREEN = (0x5E, 0x76, 0x5A)
SAND = (0xD6, 0xC1, 0x9B)
CREAM = (0xF5, 0xF2, 0xE9)
GREY = (0x34, 0x37, 0x32)


def gradient(size, top, bottom):
    image = Image.new("RGB", size)
    draw = ImageDraw.Draw(image)
    for y in range(size[1]):
        t = y / max(1, size[1] - 1)
        draw.line(
            [(0, y), (size[0], y)],
            fill=tuple(round(top[i] + (bottom[i] - top[i]) * t) for i in range(3)),
        )
    return image


def placeholder(name, size, top, bottom, label):
    image = gradient(size, top, bottom)
    draw = ImageDraw.Draw(image)

    # A soft horizon so the image reads as a course rather than a colour block.
    horizon = int(size[1] * 0.62)
    draw.rectangle([0, horizon, size[0], size[1]], fill=GREEN_DARK)
    draw.ellipse(
        [-size[0] * 0.2, horizon - size[1] * 0.18, size[0] * 1.2, horizon + size[1] * 0.3],
        fill=GREEN,
    )

    draw.text((24, size[1] - 34), label, fill=CREAM)
    path = os.path.join(OUT, name)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    image.save(path, "JPEG", quality=82)
    print("wrote", os.path.relpath(path, os.path.join(os.path.dirname(__file__), "..")))


placeholder("club-hero-placeholder.jpg", (1920, 720), (0x6F, 0x8E, 0x9E), (0xDC, 0xE7, 0xEC),
            "PLACEHOLDER - club hero")
placeholder("tournament-placeholder.jpg", (1600, 640), (0x8A, 0xA5, 0xB3), (0xF1, 0xE9, 0xD7),
            "PLACEHOLDER - tournament")
placeholder("course-placeholder.jpg", (1600, 900), (0x7C, 0x9A, 0xAB), (0xDD, 0xE8, 0xDC),
            "PLACEHOLDER - course")
