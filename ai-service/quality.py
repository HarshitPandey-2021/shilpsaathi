import cv2
import numpy as np
from PIL import Image


def check_resolution(image):
    width, height = image.size

    min_dimension = min(width, height)
    total_pixels = width * height

    if min_dimension < 400:
        status = "poor"
    elif min_dimension < 700:
        status = "low"
    elif min_dimension < 1000:
        status = "good"
    else:
        status = "excellent"

    return {
        "width": width,
        "height": height,
        "pixels": total_pixels,
        "min_dimension": min_dimension,
        "status": status
    }


def calculate_blur_score(image):
    rgb = image.convert("RGB")
    image_np = np.array(rgb)

    gray = cv2.cvtColor(
        image_np,
        cv2.COLOR_RGB2GRAY
    )

    score = cv2.Laplacian(
        gray,
        cv2.CV_64F
    ).var()

    return float(score)


def check_blur(image):
    score = calculate_blur_score(image)

    if score < 50:
        status = "very_blurry"
    elif score < 100:
        status = "blurry"
    elif score < 200:
        status = "acceptable"
    else:
        status = "sharp"

    return {
        "score": round(score, 2),
        "status": status
    }


def check_brightness(image):
    """
    Calculate image brightness.

    For RGBA images (e.g. cropped products), brightness is
    computed from visible product pixels only (alpha > 30)
    to avoid transparent pixels skewing the result.
    """

    if image.mode == "RGBA":
        # Handle RGBA: use only visible product pixels
        image_rgba = np.array(image)
        rgb = image_rgba[:, :, :3]
        alpha = image_rgba[:, :, 3]

        gray = cv2.cvtColor(
            rgb,
            cv2.COLOR_RGB2GRAY
        )

        visible_mask = alpha > 30

        if visible_mask.sum() > 0:
            brightness = float(
                np.mean(gray[visible_mask])
            )
        else:
            brightness = float(np.mean(gray))

    else:
        # Handle RGB/L: use all pixels
        rgb = image.convert("RGB")
        image_np = np.array(rgb)

        gray = cv2.cvtColor(
            image_np,
            cv2.COLOR_RGB2GRAY
        )

        brightness = float(np.mean(gray))

    if brightness < 50:
        status = "very_dark"
    elif brightness < 90:
        status = "dark"
    elif brightness <= 210:
        status = "good"
    elif brightness <= 235:
        status = "bright"
    else:
        status = "overexposed"

    return {
        "average": round(brightness, 2),
        "status": status
    }


def calculate_quality_score(
    resolution,
    blur,
    brightness
):
    score = 100

    if resolution["status"] == "poor":
        score -= 35
    elif resolution["status"] == "low":
        score -= 20
    elif resolution["status"] == "good":
        score -= 5

    if blur["status"] == "very_blurry":
        score -= 40
    elif blur["status"] == "blurry":
        score -= 25
    elif blur["status"] == "acceptable":
        score -= 5

    if brightness["status"] == "very_dark":
        score -= 25
    elif brightness["status"] == "dark":
        score -= 12
    elif brightness["status"] == "bright":
        score -= 5
    elif brightness["status"] == "overexposed":
        score -= 20

    score = max(
        0,
        min(100, score)
    )

    return score


def analyze_image_quality(image):

    resolution = check_resolution(image)

    blur = check_blur(image)

    brightness = check_brightness(image)

    score = calculate_quality_score(
        resolution,
        blur,
        brightness
    )

    return {
        "score": score,
        "resolution": resolution,
        "blur": blur,
        "brightness": brightness
    }