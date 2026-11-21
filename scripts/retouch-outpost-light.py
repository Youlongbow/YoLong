#!/usr/bin/env python3
"""Retouch one daylight floodlight on the approved RAVEN perimeter photograph.

Keep the original photograph, position, guard tower, mountains and fencing intact.
Only the blown-out optical glass is replaced by its unpowered appearance.
"""
from pathlib import Path
import cv2
import numpy as np
import pillow_avif  # noqa: F401 - registers AVIF with Pillow
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets/media/editorial/fortified-outpost-approved.avif"
TARGET = ROOT / "assets/media/editorial/fortified-outpost-light-off.avif"

rgb = np.asarray(Image.open(SOURCE).convert("RGB")).copy()
height, width = rgb.shape[:2]
sx, sy = width / 1122.0, height / 1402.0
center = (int(round(894 * sx)), int(round(508 * sy)))
radius = (max(3, int(round(15 * sx))), max(3, int(round(13 * sy))))

mask = np.zeros((height, width), dtype=np.uint8)
cv2.ellipse(mask, center, radius, 0, 0, 360, 255, -1)
repaired = cv2.cvtColor(
    cv2.inpaint(cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR), mask,
                max(2, round(4 * sx)), cv2.INPAINT_TELEA),
    cv2.COLOR_BGR2RGB
).astype(np.float32)

yy, xx = np.ogrid[:height, :width]
xc, yc = 893.3 * sx, 508.4 * sy
rx, ry = 12.8 * sx, 11.6 * sy
dist = ((xx - xc) / rx) ** 2 + ((yy - yc) / ry) ** 2
alpha = (np.clip((1.24 - dist) / 0.38, 0, 1) * 0.88)[..., None]
sky = np.clip(0.45 - (yy - yc) / (60 * sy), 0, 1)
glass = np.empty((height, width, 3), dtype=np.float32)
glass[:, :, 0] = 69 + 12 * sky
glass[:, :, 1] = 76 + 13 * sky
glass[:, :, 2] = 80 + 14 * sky
result = repaired * (1 - alpha) + glass * alpha
reflection = np.exp(-0.5 * (((xx - 888.8 * sx) / (6 * sx)) ** 2 +
                              ((yy - 502.8 * sy) / (2.5 * sy)) ** 2))
reflection = reflection[..., None] * alpha * 0.19
result = result * (1 - reflection) + np.array([141,148,151]) * reflection

Image.fromarray(result.clip(0,255).astype(np.uint8)).save(
    TARGET, format="AVIF", quality=52, speed=5
)
print(f"RETUCHED_OUTPOST_OK {TARGET.relative_to(ROOT)} {width}x{height} {TARGET.stat().st_size} bytes")
