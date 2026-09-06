import asyncio

from fastapi import FastAPI, UploadFile, File
from fastapi.responses import StreamingResponse

from PIL import Image

import io
import json
import base64

from processor import process_product_image


app = FastAPI()


@app.get("/")
def root():
    return {
        "success": True,
        "message": "AI Image Service Running"
    }


@app.post("/enhance")
async def enhance_image(
    file: UploadFile = File(...)
):
    contents = await file.read()

    image = Image.open(
        io.BytesIO(contents)
    ).convert("RGBA")

    result = process_product_image(image)

    output = io.BytesIO()

    result.save(
        output,
        format="JPEG",
        quality=90,
        optimize=True,
        progressive=True
    )

    output.seek(0)

    return StreamingResponse(
        output,
        media_type="image/jpeg",
        headers={
            "Content-Disposition":
                'inline; filename="enhanced-product.jpg"'
        }
    )


def _encode_sse_event(stage, message, success=None, image_b64=None):
    payload = {"stage": stage, "message": message}
    if success is not None:
        payload["success"] = success
    if image_b64 is not None:
        payload["image_b64"] = image_b64
    return f"data: {json.dumps(payload)}\n\n"


@app.post("/enhance/stream")
async def enhance_image_stream(
    file: UploadFile = File(...)
):
    """SSE streaming endpoint that reports progress during enhancement
    and returns the enhanced image (base64) in the final 'complete' event."""

    contents = await file.read()

    async def event_generator():
        try:
            yield _encode_sse_event("starting", "Starting image processing...")

            image = Image.open(io.BytesIO(contents)).convert("RGBA")

            yield _encode_sse_event("loaded", "Image loaded")

            progress_queue = asyncio.Queue()
            event_loop = asyncio.get_running_loop()

            def progress_callback(stage, message):
                event_loop.call_soon_threadsafe(
                    progress_queue.put_nowait, (stage, message)
                )

            processing_task = asyncio.create_task(
                asyncio.to_thread(process_product_image, image, progress_callback)
            )

            while not processing_task.done():
                try:
                    stage, message = await asyncio.wait_for(progress_queue.get(), timeout=0.1)
                    yield _encode_sse_event(stage, message)
                except asyncio.TimeoutError:
                    # No artificial progress: wait for the next real stage.
                    pass

            result = await processing_task

            while not progress_queue.empty():
                stage, message = progress_queue.get_nowait()
                yield _encode_sse_event(stage, message)

            yield _encode_sse_event("enhancing", "Finalizing enhanced image...")

            output = io.BytesIO()
            result.save(
                output,
                format="JPEG",
                quality=90,
                optimize=True,
                progressive=True
            )
            output.seek(0)

            image_b64 = base64.b64encode(output.getvalue()).decode("ascii")

            yield _encode_sse_event(
                "complete",
                "Processing complete",
                success=True,
                image_b64=image_b64
            )

        except Exception as e:
            yield _encode_sse_event(
                "error",
                f"Processing failed: {str(e)}",
                success=False
            )

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
    )
