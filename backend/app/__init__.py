from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

VISUALIZATIONS_DIR = Path(__file__).resolve().parent.parent / "visualizations"
VISUALIZATIONS_DIR.mkdir(exist_ok=True)


def create_app() -> FastAPI:
    from app.routers import datasets, analysis, chat, telemetry

    app = FastAPI(title="InsightForge API", version="0.1.0")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173", "http://localhost:5174"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.mount("/static", StaticFiles(directory=str(VISUALIZATIONS_DIR)), name="static")

    app.include_router(datasets.router, prefix="/api")
    app.include_router(analysis.router, prefix="/api")
    app.include_router(chat.router, prefix="/api")
    app.include_router(telemetry.router, prefix="/api")

    return app
