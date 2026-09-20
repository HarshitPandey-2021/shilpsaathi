FROM python:3.11-slim

WORKDIR /app

# PYTHONUNBUFFERED is critical — without it your print() logs never
# reach Azure's log stream and you'll be debugging blind.
ENV PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    U2NET_HOME=/app/.rembg

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Download the segmentation model at BUILD time, not on first request.
# Azure's filesystem is ephemeral — without this it re-downloads on every restart.
RUN python -c "from rembg import new_session; new_session('u2netp')"

ENV PORT=8000
EXPOSE 8000

CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 1 --timeout-keep-alive 75"]