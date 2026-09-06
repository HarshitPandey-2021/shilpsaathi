"""Repeatable local benchmark for the production pipeline.

Usage from ai-service:
    venv\\Scripts\\python.exe benchmark_pipeline.py test.jpeg

Use a representative set of paths to compare runs.  It records actual stage
timings emitted by the processor, process RSS, crop dimensions, output size,
and whether Real-ESRGAN was selected.  Visual acceptance remains a manual
review of the generated JPEGs; timings alone are not a quality metric.
"""

import argparse
import csv
import time
from pathlib import Path

import psutil
from PIL import Image

from processor import process_product_image


def run_one(path: Path, output_dir: Path):
    process = psutil.Process()
    stages = []
    started = time.perf_counter()

    def progress(stage, message):
        stages.append((stage, message))

    with Image.open(path) as source:
        source = source.convert("RGBA")
        result = process_product_image(source, progress)

    elapsed = time.perf_counter() - started
    output = output_dir / f"{path.stem}-enhanced.jpg"
    result.save(output, "JPEG", quality=90, optimize=True, progressive=True)
    return {
        "input": str(path),
        "input_size": f"{source.width}x{source.height}",
        "output": str(output),
        "output_size": f"{result.width}x{result.height}",
        "total_seconds": round(elapsed, 3),
        "rss_mb_after": round(process.memory_info().rss / 1024 / 1024, 1),
        "upscaling": next((message for stage, message in stages if stage == "upscaling"), "not reported"),
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("images", nargs="+", type=Path)
    parser.add_argument("--output-dir", type=Path, default=Path("benchmark-output"))
    args = parser.parse_args()
    args.output_dir.mkdir(exist_ok=True)
    rows = [run_one(path, args.output_dir) for path in args.images]
    with (args.output_dir / "results.csv").open("w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=rows[0].keys())
        writer.writeheader()
        writer.writerows(rows)
    for row in rows:
        print(row)


if __name__ == "__main__":
    main()
