import time

import cv2
import numpy as np

from PIL import (
    Image,
    ImageEnhance,
    ImageFilter
)

from upscaler import upscale_image
from quality import analyze_image_quality
from background_remover import remove_background


# ============================================================
# RESIZE
# ============================================================

def resize_for_processing(
    image,
    max_size=1600
):
    image = image.copy()

    image.thumbnail(
        (max_size, max_size),
        Image.Resampling.LANCZOS
    )

    return image


# ============================================================
# ALPHA MASK REFINEMENT
# ============================================================
def refine_alpha_mask(image):

    image = image.convert("RGBA")

    alpha = np.array(
        image.getchannel("A"),
        dtype=np.uint8
    )

    # --------------------------------------------------------
    # Remove tiny isolated noise
    # --------------------------------------------------------

    kernel = np.ones(
        (2, 2),
        np.uint8
    )

    alpha = cv2.morphologyEx(
        alpha,
        cv2.MORPH_OPEN,
        kernel,
        iterations=1
    )

    # --------------------------------------------------------
    # Very small edge smoothing
    # --------------------------------------------------------

    alpha = cv2.GaussianBlur(
        alpha,
        (3, 3),
        0
    )

    # --------------------------------------------------------
    # Remove almost invisible pixels
    # --------------------------------------------------------

    alpha[alpha < 8] = 0

    # --------------------------------------------------------
    # Reduce weak semi-transparent halo
    #
    # Keep strong pixels untouched.
    # --------------------------------------------------------

    weak_edge = (
        (alpha > 8)
        & (alpha < 70)
    )

    alpha[weak_edge] = (
        alpha[weak_edge] * 0.55
    ).astype(np.uint8)

    # --------------------------------------------------------
    # Rebuild RGBA
    # --------------------------------------------------------

    refined_alpha = Image.fromarray(
        alpha,
        mode="L"
    )

    result = image.copy()

    result.putalpha(
        refined_alpha
    )

    return result


# ============================================================
# CROP PRODUCT
# ============================================================

def crop_product(image):

    image = image.convert("RGBA")

    alpha = image.getchannel("A")

    bbox = alpha.getbbox()

    if bbox:
        return image.crop(bbox)

    return image


# ============================================================
# UPSCALE DECISION
# ============================================================

def should_upscale(
    image,
    quality
):
    """Choose the least invasive enlargement for the cropped product.

    The canvas displays a product at most 82% of 1080px (886px).  A crop whose
    longest edge already meets that requirement must not be sent to ESRGAN.
    Small, required enlargements are better served by Lanczos: neural
    restoration cannot recover source detail and costs substantially more on
    CPU.  Larger required enlargements use the existing x4plus model at 2x.
    """
    target_edge = int(1080 * 0.82)
    required_scale = target_edge / max(image.width, image.height)

    if required_scale <= 1.0:
        return "skip", required_scale
    if required_scale <= 1.35:
        return "lanczos", required_scale
    return "esrgan", required_scale


def upscale_if_needed(
    image,
    quality
):

    decision, required_scale = should_upscale(image, quality)

    if decision == "skip":
        print("Upscale decision: skip; crop already meets final canvas size")
        return image, decision

    if decision == "lanczos":
        new_size = (
            max(image.width, round(image.width * required_scale)),
            max(image.height, round(image.height * required_scale)),
        )
        print(f"Upscale decision: Lanczos to {new_size[0]}x{new_size[1]}")
        return image.resize(new_size, Image.Resampling.LANCZOS), decision

    print(
        f"Real-ESRGAN: upscaling "
        f"{image.width}x{image.height}"
    )

    upscaled = upscale_image(
        image,
        outscale=2
    )

    print(
        f"Real-ESRGAN: output "
        f"{upscaled.width}x"
        f"{upscaled.height}"
    )

    return upscaled, decision


# ============================================================
# LIGHTING HELPERS
# ============================================================

def _apply_gamma(image_rgb, gamma=1.0):
    """
    Apply gamma correction to an RGB image.

    gamma < 1.0  -> brightens shadows naturally
    gamma > 1.0  -> darkens highlights controllably
    gamma = 1.0  -> no change
    """
    table = np.array([
        ((i / 255.0) ** gamma) * 255
        for i in range(256)
    ]).astype("uint8")

    return cv2.LUT(image_rgb, table)


def _apply_clahe_rgb(image_rgb, clip_limit=2.0, tile_size=8):
    """
    Apply CLAHE to the L channel in LAB color space.

    This preserves product colors while adaptively improving
    local contrast/brightness. Works on local regions, so it
    does not over-amplify noise in flat areas.
    """
    lab = cv2.cvtColor(
        image_rgb,
        cv2.COLOR_RGB2LAB
    )

    l, a, b = cv2.split(lab)

    clahe = cv2.createCLAHE(
        clipLimit=clip_limit,
        tileGridSize=(tile_size, tile_size)
    )

    l_corrected = clahe.apply(l)

    lab_corrected = cv2.merge(
        [l_corrected, a, b]
    )

    return cv2.cvtColor(
        lab_corrected,
        cv2.COLOR_LAB2RGB
    )


# ============================================================
# LIGHTING
# ============================================================

def improve_lighting(image):
    """
    Adaptive lighting correction for product images.

    Uses CLAHE (LAB L-channel) + gamma correction.
    Strength is adaptive based on actual product brightness.
    Preserves colors. Preserves alpha/transparency.
    """

    image = image.convert("RGBA")

    alpha = image.getchannel("A")

    rgb = image.convert("RGB")

    # --------------------------------------------------------
    # Calculate brightness ONLY from visible product pixels
    # --------------------------------------------------------

    rgb_np = np.array(rgb)
    alpha_np = np.array(alpha)

    gray = cv2.cvtColor(
        rgb_np,
        cv2.COLOR_RGB2GRAY
    )

    # Use visible product pixels only
    # Ignore transparent/near-transparent pixels
    visible_mask = alpha_np > 30

    if visible_mask.sum() > 0:
        brightness = float(
            np.mean(gray[visible_mask])
        )
    else:
        brightness = float(np.mean(gray))

    print(
        f"Lighting brightness: "
        f"{brightness:.2f}"
    )

    # --------------------------------------------------------
    # Adaptive correction based on brightness level
    # --------------------------------------------------------

    if brightness < 40:

        # Very dark product:
        # strong CLAHE + strong gamma brightening
        correction_type = "very_strong"

        result = _apply_clahe_rgb(
            rgb_np,
            clip_limit=3.0,
            tile_size=8
        )

        result = _apply_gamma(
            result,
            gamma=0.65
        )

    elif brightness < 70:

        # Dark product:
        # moderate CLAHE + gamma brightening
        correction_type = "strong"

        result = _apply_clahe_rgb(
            rgb_np,
            clip_limit=2.5,
            tile_size=8
        )

        result = _apply_gamma(
            result,
            gamma=0.75
        )

    elif brightness < 100:

        # Somewhat dark product:
        # mild CLAHE + mild gamma brightening
        correction_type = "moderate"

        result = _apply_clahe_rgb(
            rgb_np,
            clip_limit=2.0,
            tile_size=8
        )

        result = _apply_gamma(
            result,
            gamma=0.85
        )

    elif brightness < 150:

        # Normal-dark product:
        # gentle CLAHE only
        correction_type = "mild"

        result = _apply_clahe_rgb(
            rgb_np,
            clip_limit=1.5,
            tile_size=8
        )

    elif brightness <= 210:

        # Good brightness:
        # no correction needed
        correction_type = "none"

        result = rgb_np.copy()

    elif brightness <= 235:

        # Bright product:
        # slight gamma darkening
        correction_type = "slight_reduction"

        result = _apply_gamma(
            rgb_np,
            gamma=1.1
        )

    else:

        # Overexposed product:
        # controlled gamma darkening
        correction_type = "controlled_reduction"

        result = _apply_gamma(
            rgb_np,
            gamma=1.2
        )

    print(
        f"Lighting correction: "
        f"{correction_type}"
    )

    # --------------------------------------------------------
    # Very mild sharpness (skip if no correction applied)
    # --------------------------------------------------------

    result_pil = Image.fromarray(result)

    if correction_type != "none":
        # Subtle sharpness to counteract any softness from CLAHE
        result_pil = ImageEnhance.Sharpness(
            result_pil
        ).enhance(1.03)

    result = np.array(result_pil)

    # --------------------------------------------------------
    # Calculate final brightness for logging
    # --------------------------------------------------------

    result_gray = cv2.cvtColor(
        result,
        cv2.COLOR_RGB2GRAY
    )

    if visible_mask.sum() > 0:
        final_brightness = float(
            np.mean(result_gray[visible_mask])
        )
    else:
        final_brightness = float(
            np.mean(result_gray)
        )

    print(
        f"Final lighting brightness: "
        f"{final_brightness:.2f}"
    )

    # --------------------------------------------------------
    # Restore original alpha
    # --------------------------------------------------------

    result_pil = Image.fromarray(result)

    result_pil = result_pil.convert("RGBA")

    result_pil.putalpha(alpha)

    return result_pil

# ============================================================
# SOFT CONTACT SHADOW
# ============================================================

def add_soft_shadow(
    product,
    canvas_size
):

    product = product.convert("RGBA")

    alpha = np.array(
        product.getchannel("A"),
        dtype=np.uint8
    )

    ys, xs = np.where(
        alpha > 30
    )

    if len(xs) == 0:
        return None

    product_width = (
        xs.max() - xs.min() + 1
    )

    product_height = (
        ys.max() - ys.min() + 1
    )

    # --------------------------------------------------------
    # Shadow dimensions
    # --------------------------------------------------------

    shadow_width = max(
        60,
        int(product_width * 0.55)
    )

    shadow_height = max(
        18,
        int(product_height * 0.055)
    )

    shadow_np = np.zeros(
        (
            shadow_height,
            shadow_width
        ),
        dtype=np.uint8
    )

    # --------------------------------------------------------
    # Main soft shadow
    # --------------------------------------------------------

    center = (
        shadow_width // 2,
        shadow_height // 2
    )

    axes = (
        max(1, int(shadow_width * 0.48)),
        max(1, int(shadow_height * 0.38))
    )

    cv2.ellipse(
        shadow_np,
        center,
        axes,
        0,
        0,
        360,
        65,
        -1
    )

    # --------------------------------------------------------
    # Stronger contact center
    # --------------------------------------------------------

    contact_height = max(
        6,
        int(shadow_height * 0.35)
    )

    contact = np.zeros(
        (
            contact_height,
            shadow_width
        ),
        dtype=np.uint8
    )

    cv2.ellipse(
        contact,
        (
            shadow_width // 2,
            contact_height // 2
        ),
        (
            max(1, int(shadow_width * 0.35)),
            max(1, contact_height // 2)
        ),
        0,
        0,
        360,
        45,
        -1
    )

    contact = cv2.GaussianBlur(
        contact,
        (0, 0),
        sigmaX=5,
        sigmaY=2
    )

    # Put contact shadow near bottom
    start_y = max(
        0,
        shadow_height - contact_height
    )

    shadow_np[
        start_y:,
        :
    ] = np.maximum(
        shadow_np[
            start_y:,
            :
        ],
        contact
    )

    # --------------------------------------------------------
    # Final blur
    # --------------------------------------------------------

    shadow_np = cv2.GaussianBlur(
        shadow_np,
        (0, 0),
        sigmaX=7,
        sigmaY=3
    )

    shadow = Image.fromarray(
        shadow_np,
        mode="L"
    )

    shadow_rgba = Image.new(
        "RGBA",
        shadow.size,
        (0, 0, 0, 0)
    )

    shadow_rgba.putalpha(
        shadow
    )

    return shadow_rgba



def add_soft_shadow(product):
    """
    Adds a soft natural shadow below the product.
    Keeps the product itself unchanged.
    """

    product = product.convert("RGBA")

    alpha = product.getchannel("A")

    # Shadow canvas
    shadow = Image.new(
        "RGBA",
        product.size,
        (0, 0, 0, 0)
    )

    # Create shadow from product alpha
    shadow_alpha = alpha.point(
        lambda p: int(p * 0.28)
    )

    shadow_layer = Image.new(
        "RGBA",
        product.size,
        (0, 0, 0, 0)
    )

    shadow_layer.putalpha(shadow_alpha)

    # Slightly blur shadow
    from PIL import ImageFilter

    shadow_layer = shadow_layer.filter(
        ImageFilter.GaussianBlur(radius=18)
    )

    shadow.alpha_composite(
        shadow_layer
    )

    return shadow


# ============================================================
# CANVAS
# ============================================================

def create_product_canvas(product, size=1080):

    canvas = Image.new(
        "RGBA",
        (size, size),
        (255, 255, 255, 255)
    )

    product = product.convert("RGBA")
    product = product.copy()

    # Product maximum area
    product.thumbnail(
        (int(size * 0.82), int(size * 0.82)),
        Image.Resampling.LANCZOS
    )

    x = (size - product.width) // 2

    # Slightly lower than exact center
    y = (size - product.height) // 2 - 20

    # -----------------------------
    # CREATE SOFT SHADOW
    # -----------------------------

    alpha = product.getchannel("A")

    shadow_alpha = alpha.point(
        lambda p: int(p * 0.25)
    )

    shadow = Image.new(
        "RGBA",
        product.size,
        (0, 0, 0, 0)
    )

    shadow.putalpha(
        shadow_alpha
    )

    from PIL import ImageFilter

    shadow = shadow.filter(
        ImageFilter.GaussianBlur(
            radius=18
        )
    )

    # Shadow offset
    shadow_x = x
    shadow_y = y + 18

    canvas.alpha_composite(
        shadow,
        (shadow_x, shadow_y)
    )

    # -----------------------------
    # PLACE PRODUCT
    # -----------------------------

    canvas.alpha_composite(
        product,
        (x, y)
    )

    # Convert final image to RGB
    return canvas.convert("RGB")



# ============================================================
# MAIN PIPELINE
# ============================================================

def process_product_image(
    image,
    progress_callback=None
):

    total_start = time.perf_counter()

    print("=" * 50)
    print("STARTING IMAGE PROCESSING")
    print("=" * 50)

    print(
        f"Input image: "
        f"{image.width}x"
        f"{image.height}"
    )

    if progress_callback:
        progress_callback("starting", "Image received")

    # ========================================================
    # 1. RESIZE
    # ========================================================

    start = time.perf_counter()

    image = resize_for_processing(
        image
    )

    resize_time = (
        time.perf_counter()
        - start
    )

    print(
        f"After resize: "
        f"{image.width}x"
        f"{image.height}"
    )

    print(
        f"⏱ Resize: "
        f"{resize_time:.2f} sec"
    )

    if progress_callback:
        progress_callback("resizing", "Resizing image...")

    # ========================================================
    # 2. INITIAL QUALITY ANALYSIS
    # ========================================================

    start = time.perf_counter()

    print(
        "Analyzing image quality..."
    )

    quality = analyze_image_quality(
        image
    )

    quality_time = (
        time.perf_counter()
        - start
    )

    print(
        f"Quality score: "
        f"{quality['score']}/100"
    )

    print(
        f"Resolution: "
        f"{quality['resolution']['status']} "
        f"("
        f"{quality['resolution']['width']}x"
        f"{quality['resolution']['height']}"
        f")"
    )

    print(
        f"Blur: "
        f"{quality['blur']['status']} "
        f"(score: "
        f"{quality['blur']['score']})"
    )

    print(
        f"Brightness: "
        f"{quality['brightness']['status']} "
        f"(average: "
        f"{quality['brightness']['average']})"
    )

    print(
        f"⏱ Quality analysis: "
        f"{quality_time:.2f} sec"
    )

    if progress_callback:
        progress_callback("quality", "Analyzing image quality...")

    # ========================================================
    # 3. BACKGROUND REMOVAL
    # ========================================================

    if progress_callback:
        progress_callback("background", "Removing background...")

    start = time.perf_counter()

    print(
        "Removing background..."
    )

    product = remove_background(
        image
    )

    background_time = (
        time.perf_counter()
        - start
    )

    print(
        f"⏱ Background removal: "
        f"{background_time:.2f} sec"
    )

    # ========================================================
    # 4. EDGE / MASK REFINEMENT
    # ========================================================

    start = time.perf_counter()

    print(
        "Refining product edges..."
    )

    product = refine_alpha_mask(
        product
    )

    edge_time = (
        time.perf_counter()
        - start
    )

    print(
        f"⏱ Edge refinement: "
        f"{edge_time:.2f} sec"
    )

    if progress_callback:
        progress_callback("edges", "Refining product edges...")

    # ========================================================
    # 5. CROP
    # ========================================================

    start = time.perf_counter()

    print(
        "Cropping product..."
    )

    product = crop_product(
        product
    )

    crop_time = (
        time.perf_counter()
        - start
    )

    print(
        f"Product crop: "
        f"{product.width}x"
        f"{product.height}"
    )

    print(
        f"⏱ Crop: "
        f"{crop_time:.2f} sec"
    )

    if progress_callback:
        progress_callback("cropping", "Preparing product...")

    # ========================================================
    # 6. PRODUCT QUALITY ANALYSIS
    # ========================================================

    start = time.perf_counter()

    print(
        "Analyzing product quality..."
    )

    product_quality = (
        analyze_image_quality(
            product
        )
    )

    product_quality_time = (
        time.perf_counter()
        - start
    )

    print(
        f"Product quality score: "
        f"{product_quality['score']}/100"
    )

    print(
        f"Product resolution: "
        f"{product_quality['resolution']['status']} "
        f"("
        f"{product_quality['resolution']['width']}x"
        f"{product_quality['resolution']['height']}"
        f")"
    )

    print(
        f"Product blur: "
        f"{product_quality['blur']['status']} "
        f"(score: "
        f"{product_quality['blur']['score']})"
    )

    print(
        f"Product brightness: "
        f"{product_quality['brightness']['status']} "
        f"(average: "
        f"{product_quality['brightness']['average']})"
    )

    print(
        f"⏱ Product quality analysis: "
        f"{product_quality_time:.2f} sec"
    )

    if progress_callback:
        progress_callback("product_quality", "Checking product quality...")

    # ========================================================
    # 7. CONDITIONAL UPSCALING
    # ========================================================

    if progress_callback:
        progress_callback("upscaling", "Enhancing image quality...")

    start = time.perf_counter()

    product, upscale_method = upscale_if_needed(
        product,
        product_quality
    )

    upscale_time = (
        time.perf_counter()
        - start
    )

    print(
        f"⏱ Upscaling stage: "
        f"{upscale_time:.2f} sec"
    )

    # ========================================================
    # 8. LIGHTING
    # ========================================================

    start = time.perf_counter()

    print(
        "Improving lighting..."
    )

    product = improve_lighting(
        product
    )

    lighting_time = (
        time.perf_counter()
        - start
    )

    print(
        f"⏱ Lighting: "
        f"{lighting_time:.2f} sec"
    )

    if progress_callback:
        progress_callback("lighting", "Improving lighting...")

    # ========================================================
    # 9. FINAL CANVAS + SHADOW
    # ========================================================

    start = time.perf_counter()

    print(
        "Creating 1080x1080 canvas..."
    )

    result = create_product_canvas(
        product
    )

    canvas_time = (
        time.perf_counter()
        - start
    )

    print(
        f"⏱ Canvas: "
        f"{canvas_time:.2f} sec"
    )

    if progress_callback:
        progress_callback("canvas", "Creating marketplace-ready image...")

    # ========================================================
    # TOTAL
    # ========================================================

    total_time = (
        time.perf_counter()
        - total_start
    )

    print("=" * 50)
    print("PROCESSING COMPLETE")
    print("=" * 50)

    print(
        f"⏱ TOTAL PROCESSING TIME: "
        f"{total_time:.2f} sec"
    )

    print(
        f"Final image: "
        f"{result.width}x"
        f"{result.height}"
    )

    print("=" * 50)

    return result
