"""Background-removal boundary for the stateless image service."""

from functools import lru_cache
from PIL import Image

# Using u2net for much faster CPU inference (~5-10x faster than BRIA RMBG)
# BRIA RMBG takes ~37s on CPU, u2net takes ~3-5s for same input
MODEL_NAME = "u2net"
_rembg_failed = False

# Optimal resolution for RMBG inference - balances speed and edge quality
# 768px provides good quality while being ~4x faster than 1600px on CPU
RMBG_MAX_RESOLUTION = 768


@lru_cache(maxsize=1)
def _session():
    global _rembg_failed
    try:
        from rembg import new_session
        return new_session(MODEL_NAME)
    except Exception as e:
        print(f"[BG Remover] rembg model initialization note: {e}")
        _rembg_failed = True
        return None


ENABLE_BACKGROUND_REMOVAL = True


def remove_background(image):
    """Remove background with optimized resolution for faster processing."""
    if not ENABLE_BACKGROUND_REMOVAL:
        return image.convert("RGBA")

    session = _session()
    if session is None:
        return image.convert("RGBA")

    try:
        from rembg import remove

        # Convert to RGBA once
        image = image.convert("RGBA")

        # Resize to optimal resolution for RMBG inference
        # This is the key optimization - RMBG time scales with pixel count
        width, height = image.size
        max_dim = max(width, height)

        if max_dim > RMBG_MAX_RESOLUTION:
            scale = RMBG_MAX_RESOLUTION / max_dim
            new_width = int(width * scale)
            new_height = int(height * scale)
            # Use BILINEAR for downscaling - fast and good quality for mask
            image = image.resize((new_width, new_height), Image.Resampling.BILINEAR)

        # Run RMBG with post_process_mask=False for speed
        # The mask refinement step later will handle edge quality
        result = remove(
            image,
            session=session,
            alpha_matting=False,
            post_process_mask=False,
        )

        return result.convert("RGBA")

    except Exception as e:
        print(f"[BG Remover] rembg processing error: {e}")
        return image.convert("RGBA")

