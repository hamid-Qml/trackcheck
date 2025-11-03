from fastapi import FastAPI
from .api import router as v1_router

def create_app() -> FastAPI:
    app = FastAPI(
        title="TrackCheck ML Backend (mlend)",
        version="1.0.0",
        description="Audio feature extraction + GPT prompt engine for feedback.",
    )
    app.include_router(v1_router)
    return app

app = create_app()