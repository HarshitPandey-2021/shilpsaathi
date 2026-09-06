from PIL import Image, ImageEnhance, ImageFilter
import numpy as np

_upsampler = None
_model_failed = False

def _get_upsampler():
    global _upsampler, _model_failed
    if _upsampler is not None or _model_failed:
        return _upsampler

    try:
        import torch
        from basicsr.archs.rrdbnet_arch import RRDBNet
        from realesrgan import RealESRGANer

        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        print(f"[Upscaler] Initializing Real-ESRGAN on device: {device}")

        model = RRDBNet(
            num_in_ch=3,
            num_out_ch=3,
            num_feat=64,
            num_block=23,
            num_grow_ch=32,
            scale=4
        )

        _upsampler = RealESRGANer(
            scale=4,
            model_path="weights/RealESRGAN_x4plus.pth",
            model=model,
            tile=256,
            tile_pad=10,
            pre_pad=0,
            half=False,
            device=device
        )
    except Exception as e:
        print(f"[Upscaler] Real-ESRGAN not available ({e}). Using Lanczos/sharpness fallback.")
        _model_failed = True

    return _upsampler

def upscale_image(image, outscale=2):
    # Make sure input is RGBA
    image = image.convert("RGBA")
    upsampler = _get_upsampler()

    if upsampler is not None:
        try:
            rgb = image.convert("RGB")
            alpha = image.getchannel("A")
            rgb_np = np.array(rgb)

            output, _ = upsampler.enhance(rgb_np, outscale=outscale)
            enhanced_rgb = Image.fromarray(output).convert("RGBA")
            enhanced_alpha = alpha.resize(enhanced_rgb.size, Image.Resampling.BILINEAR)
            enhanced_rgb.putalpha(enhanced_alpha)
            return enhanced_rgb
        except Exception as e:
            print(f"[Upscaler] Real-ESRGAN inference error: {e}. Falling back to PIL resize.")

    # High-quality fallback
    target_w = int(image.width * outscale)
    target_h = int(image.height * outscale)
    resized = image.resize((target_w, target_h), Image.Resampling.LANCZOS)
    enhancer = ImageEnhance.Sharpness(resized)
    return enhancer.enhance(1.25)