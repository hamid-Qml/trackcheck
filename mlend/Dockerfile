# mlend/Dockerfile
FROM python:3.11-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

# --- system deps for webrtcvad, soundfile/librosa, uvloop, etc.
RUN apt-get update && apt-get install -y --no-install-recommends \
      build-essential \
      gcc \
      libsndfile1 \
      ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# upgrade pip first; then install Python deps
COPY requirements.txt .
RUN python -m pip install --upgrade pip setuptools wheel \
 && pip install -r requirements.txt

# app code
COPY . .

EXPOSE 5000
# adjust to your entrypoint/module
CMD ["uvicorn", "app.api:app", "--host", "0.0.0.0", "--port", "5000"]
