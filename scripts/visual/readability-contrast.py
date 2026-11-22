"""Check type, contrast, clipping and hit targets against a local mobile screenshot."""
import json
import re
import sys
from pathlib import Path

from PIL import Image


def luminance(rgb):
    def linear(value):
        srgb = value / 255
        return srgb / 12.92 if srgb <= 0.04045 else ((srgb + 0.055) / 1.055) ** 2.4
    return sum(linear(value) * weight for value, weight in zip(rgb, (0.2126, 0.7152, 0.0722)))


def contrast(rgb, alpha, background):
    blended = [alpha * fg + (1 - alpha) * bg for fg, bg in zip(rgb, background)]
    dark, light = sorted((luminance(blended), luminance(background)))
    return (light + 0.05) / (dark + 0.05)


def inspect_text(row, image, scale):
    color = [float(v) for v in re.findall(r'[\d.]+', row['c'])]
    alpha = row['op'] * (color[3] if len(color) == 4 else 1)
    samples = [image.getpixel((min(image.width - 1, int(x * scale)), min(image.height - 1, int(y * scale))))
               for x, y in row['points']]
    ratio = min(contrast(color[:3], alpha, pixel) for pixel in samples)
    large = row['fs'] >= 24 or (row['fs'] >= 18.66 and row['fw'] >= 700)
    minimum = 3 if large else 4.5
    if ratio < minimum:
        yield f'kontrast {ratio:.2f} < {minimum}'
    numeric_badge = row['badge'] and row['fw'] >= 800 and re.fullmatch(r'\d{1,2}', row['t']) and row['fs'] >= 12
    if row['fs'] < 13 and not numeric_badge:
        yield f"yazı {row['fs']} px"
    if row['clip']:
        yield 'metin kesilmiş'


def inspect_screen(name, metrics, directory):
    with Image.open(directory / f'{name}-background.png') as frame:
        image = frame.convert('RGB')
    scale = image.width / metrics['vw']
    for row in metrics['texts']:
        if not row['cell']:
            for issue in inspect_text(row, image, scale):
                yield f"{name} · {row['t']} · {issue}"
    for control in metrics['btns']:
        width, height = control['r'][2:]
        if control['t'] and not control['cell'] and min(width, height) < 44:
            yield f"{name} · {control['t']} · dokunma alanı {width}×{height}"


directory = Path(sys.argv[1]) / sys.argv[2]
metrics = json.loads((directory / 'metrics.json').read_text())
issues = [issue for name, screen in metrics.items() for issue in inspect_screen(name, screen, directory)]
print(f"{sys.argv[2]} px · {len(metrics)} ekran · {len(issues)} bulgu", flush=True)
for issue in issues:
    print(issue)
sys.exit(bool(issues))
