import torch
import numpy as np

from PIL import Image

from basicsr.archs.rrdbnet_arch import RRDBNet
from realesrgan import RealESRGANer


device = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)

print(f"Real-ESRGAN device: {device}")


model = RRDBNet(
    num_in_ch=3,
    num_out_ch=3,
    num_feat=64,
    num_block=23,
    num_grow_ch=32,
    scale=4
)


upsampler = RealESRGANer(
    scale=4,
    model_path="weights/RealESRGAN_x4plus.pth",
    model=model,
    tile=256,
    tile_pad=10,
    pre_pad=0,
    half=False,
    device=device
)


def upscale_image(image, outscale=2):

    # Make sure input is RGBA
    image = image.convert("RGBA")

    # ---------------------------------------------
    # Separate RGB and Alpha
    # ---------------------------------------------

    rgb = image.convert("RGB")
    alpha = image.getchannel("A")

    rgb_np = np.array(rgb)

    # ---------------------------------------------
    # Upscale RGB using Real-ESRGAN
    # ---------------------------------------------

    output, _ = upsampler.enhance(
        rgb_np,
        outscale=outscale
    )

    enhanced_rgb = Image.fromarray(output)

    # ---------------------------------------------
    # Upscale alpha mask separately
    # ---------------------------------------------

    new_size = enhanced_rgb.size

    enhanced_alpha = alpha.resize(
        new_size,
        Image.Resampling.BILINEAR
    )

    # ---------------------------------------------
    # Recombine RGB + original transparency
    # ---------------------------------------------

    enhanced_rgb = enhanced_rgb.convert("RGBA")

    enhanced_rgb.putalpha(
        enhanced_alpha
    )

    return enhanced_rgb