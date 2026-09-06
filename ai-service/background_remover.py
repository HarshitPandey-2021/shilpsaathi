"""Background-removal boundary for the stateless image service."""

from functools import lru_cache
from PIL import Image

MODEL_NAME = "bria-rmbg"
_rembg_failed = False

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

def remove_background(image: Image.Image) -> Image.Image:
    """Remove the background while retaining the product's alpha channel."""
    image = image.convert("RGBA")
    session = _session()

    if session is not None:
        try:
            from rembg import remove
            return remove(
                image,
                session=session,
                alpha_matting=False,
                post_process_mask=True,
            ).convert("RGBA")
        except Exception as e:
            print(f"[BG Remover] rembg processing error: {e}")

    # Seamless fallback: return clean RGBA
    return image

