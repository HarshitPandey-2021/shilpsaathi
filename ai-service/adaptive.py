"""Adaptive image correction — measure what the image needs, then apply only that."""

import cv2
import numpy as np
from PIL import Image


def _stats(gray, mask):
    """Exposure statistics from visible product pixels only."""
    px = gray[mask] if mask is not None and mask.sum() > 50 else gray.ravel()
    return {
        "p1": float(np.percentile(px, 1)),
        "p5": float(np.percentile(px, 5)),
        "p50": float(np.percentile(px, 50)),
        "p95": float(np.percentile(px, 95)),
        "p99": float(np.percentile(px, 99)),
        "std": float(np.std(px)),
        "mean": float(np.mean(px)),
    }


def analyze(image):
    """Return a diagnosis of what this image needs. No changes applied."""
    image = image.convert("RGBA")
    rgb = np.array(image.convert("RGB"))
    alpha = np.array(image.getchannel("A"))
    gray = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY)
    mask = alpha > 30

    s = _stats(gray, mask)

    # Sharpness: variance of Laplacian
    lap_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())

    # Noise: median absolute deviation of the high-frequency residual.
    # A blurred copy subtracted from the original leaves noise + edges;
    # the MEDIAN is dominated by noise, not by the few strong edges.
    blur = cv2.GaussianBlur(gray, (0, 0), 1.2)
    residual = gray.astype(np.float32) - blur.astype(np.float32)
    noise = float(np.median(np.abs(residual)))

    # Is the subject genuinely dark, or is the photo underexposed?
    # Genuinely dark = low tonal spread. Underexposed = wide spread, shifted down.
    # Better signal than std: what fraction of the object is actually dark?
    px = gray[mask] if mask.sum() > 50 else gray.ravel()
    dark_fraction = float((px < 60).mean())
    genuinely_dark = s["p50"] < 70 and dark_fraction > 0.55

    # Clipping
    shadow_clipped = s["p1"] < 4
    highlight_clipped = s["p99"] > 251

    return {
        **s,
        "dark_fraction": round(dark_fraction, 2),
        "sharpness": round(lap_var, 1),
        "noise": round(noise, 2),
        "genuinely_dark": genuinely_dark,
        "shadow_clipped": shadow_clipped,
        "highlight_clipped": highlight_clipped,
        "needs_denoise": noise > 3.0,
        "needs_sharpen": lap_var < 120,
        "needs_lift": s["p50"] < 95 and not genuinely_dark,
        "needs_pull": s["p50"] > 190,
    }


def _gamma(rgb, g):
    table = np.array([((i / 255.0) ** g) * 255 for i in range(256)]).astype("uint8")
    return cv2.LUT(rgb, table)


def _clahe(rgb, clip):
    lab = cv2.cvtColor(rgb, cv2.COLOR_RGB2LAB)
    l, a, b = cv2.split(lab)
    l = cv2.createCLAHE(clipLimit=clip, tileGridSize=(8, 8)).apply(l)
    return cv2.cvtColor(cv2.merge([l, a, b]), cv2.COLOR_LAB2RGB)


def correct(image, diag=None, verbose=True):
    """Apply only the corrections this image actually needs. Alpha preserved."""
    image = image.convert("RGBA")
    alpha = image.getchannel("A")
    rgb = np.array(image.convert("RGB"))

    d = diag or analyze(image)
    applied = []

    # 1. Denoise — bilateral is edge-preserving and ~10x faster than NLM
    if d["needs_denoise"]:
        strength = 9 if d["noise"] > 6 else 5
        rgb = cv2.bilateralFilter(rgb, 5, strength * 8, strength * 3)
        applied.append(f"denoise({d['noise']:.1f})")

    # 2. Exposure — never fight a genuinely dark object
    if d["genuinely_dark"]:
        # Only enough lift to reveal texture. The object stays dark.
        rgb = _clahe(rgb, 1.2)
        rgb = _gamma(rgb, 0.94)
        applied.append("dark-object-preserve")
    elif d["needs_lift"]:
        deficit = (95 - d["p50"]) / 95.0          # 0..1
        g = max(0.70, 1.0 - 0.32 * deficit)
        rgb = _clahe(rgb, 1.4 + 1.2 * deficit)
        rgb = _gamma(rgb, g)
        applied.append(f"lift(gamma={g:.2f})")
    elif d["needs_pull"]:
        excess = (d["p50"] - 190) / 65.0
        g = min(1.30, 1.0 + 0.28 * excess)
        rgb = _gamma(rgb, g)
        applied.append(f"pull(gamma={g:.2f})")

    # 3. Recover clipped highlights slightly
    if d["highlight_clipped"] and not d["genuinely_dark"]:
        rgb = _gamma(rgb, 1.04)
        applied.append("highlight-recover")

    # 4. Sharpen — unsharp mask, only if actually soft
    if d["needs_sharpen"]:
        amount = 0.6 if d["sharpness"] < 60 else 0.35
        blur = cv2.GaussianBlur(rgb, (0, 0), 1.0)
        rgb = cv2.addWeighted(rgb, 1 + amount, blur, -amount, 0)
        applied.append(f"sharpen({amount})")

    if verbose:
        print(f"Adaptive: p50={d['p50']:.0f} std={d['std']:.0f} "
              f"noise={d['noise']:.1f} sharp={d['sharpness']:.0f} "
              f"| applied: {', '.join(applied) or 'nothing needed'}")

    out = Image.fromarray(rgb).convert("RGBA")
    out.putalpha(alpha)
    return out, {"diagnosis": d, "applied": applied}