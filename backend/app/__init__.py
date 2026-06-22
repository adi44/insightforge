from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


def create_app() -> FastAPI:
    from app.routers import datasets, analysis, chat

    app = FastAPI(title="InsightForge API", version="0.1.0")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(datasets.router, prefix="/api")
    app.include_router(analysis.router, prefix="/api")
    app.include_router(chat.router, prefix="/api")

    return app
