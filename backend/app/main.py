"""Kavana Calculadora API — asistente técnico RAG (FastAPI).

PWA de cálculo de producción industrial. Bot RAG sobre la documentación real
del repo (README, ADRs, guías técnicas). TF-IDF + OpenRouter.
"""

import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

app = FastAPI(
    title="Kavana Calculadora API",
    description="Asistente técnico RAG sobre documentación real del proyecto",
    version="1.0.0",
)

# CORS: la landing (www.kavanasystems.com) y el dominio propio pueden llamar
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://calculadora.kavanasystems.com",
        "https://www.kavanasystems.com",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------- asistente
class AskRequest(BaseModel):
    question: str = Field(min_length=4, max_length=500)


@app.post("/api/v1/assistant/ask-tech")
async def ask_tech(req: AskRequest, request: Request):
    from .assistant import enforce_rate_limit, responder

    ip = request.client.host if request.client else "unknown"
    try:
        enforce_rate_limit(ip)
    except Exception as e:
        return JSONResponse(status_code=429, content={"error": str(e)})

    import os

    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        return JSONResponse(
            status_code=500,
            content={"error": "Asistente no configurado (falta OPENROUTER_API_KEY en el servidor)"},
        )

    try:
        result = await responder(api_key, req.question.strip())
        return {"success": True, **result}
    except Exception as e:
        logger = logging.getLogger("calculadora.assistant")
        logger.error("Asistente: %s", e)
        return JSONResponse(
            status_code=500,
            content={"error": "El asistente falló al responder. Inténtalo de nuevo en un momento."},
        )


@app.get("/api/v1/assistant/stats")
def assistant_stats():
    from .assistant import estadisticas_corpus

    return estadisticas_corpus()


@app.get("/api/v1/health")
def health():
    return {"status": "ok"}