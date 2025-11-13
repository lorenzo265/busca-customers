# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import api_router


def create_app() -> FastAPI:
    app = FastAPI(
        title="Variable Search API",
        version="0.1.0",
    )

    # 🔐 libera o frontend (Next.js em 3000)
    origins = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # suas rotas
    app.include_router(api_router)

    return app


app = create_app()
