"""Background-removal boundary for the stateless image service.

The model session is deliberately created on first use.  This keeps FastAPI
startup responsive and retains one reusable, in-process session afterwards.
"""

from functools import lru_cache

from PIL import Image
from rembg import new_session, remove


MODEL_NAME = "bria-rmbg"


@lru_cache(maxsize=1)
def _session():
    """Return the currently approved local segmentation session."""
    return new_session(MODEL_NAME)


def remove_background(image: Image.Image) -> Image.Image:
    """Remove the background while retaining the product's alpha channel."""
    return remove(
        image,
        session=_session(),
        alpha_matting=False,
        post_process_mask=True,
    ).convert("RGBA")
