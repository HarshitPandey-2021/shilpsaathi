# AI model inventory and commercial-license gate

This service must not automatically download or deploy a replacement model
until its **weight** license has been approved.  A Python package license is
not a license for the model it downloads.

| Model | Source / version in this project | Weight size | Weight license / commercial status | Decision |
| --- | --- | ---: | --- | --- |
| BRIA RMBG 2.0 | `rembg 2.0.83`, `bria-rmbg-2.0.onnx` fetched by rembg | Not bundled; size must be recorded from the deployed cache | CC BY-NC 4.0 according to BRIA's model card; self-hosted commercial use requires a separate BRIA agreement. The rembg package does not change this. | Current technical baseline only; **not approved for a commercial deployment** without that agreement. |
| RealESRGAN x4plus | local `weights/RealESRGAN_x4plus.pth` | 67,040,989 bytes (63.9 MiB) | Model project is commonly distributed under BSD-3-Clause; verify the exact weight release and include notices before redistribution. | Retained; used only for crop enlargements above 1.35x. |
| BiRefNet_lite (`ZhengPeng7/BiRefNet_lite`) | Candidate only; not downloaded or enabled | 178 MB on its Hugging Face repository | The Hugging Face model card declares MIT, but the upstream BiRefNet repository cautions that its weights are non-commercial. This conflict must be resolved in writing with the publisher. | Not enabled or downloaded; rejected pending license clarification and visual regression tests. |

## Deployment record required before changing a model

Record the exact repository/release URL, commit or weight checksum, downloaded
file size, model-weight license text, commercial-use permission, attribution,
and redistribution obligations.  Run `benchmark_pipeline.py` over approved
representative images and retain a human visual review (edges, logos, fine
details, dark/light products, jewellery, and cluttered backgrounds).
