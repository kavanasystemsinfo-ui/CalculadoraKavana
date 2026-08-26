"""Tests del asistente técnico RAG de Calculadora (kavana-chatbot-standard)."""

import importlib
import os
import time as _t
from pathlib import Path
from unittest.mock import patch

import pytest

from app import assistant


@pytest.fixture()
def corpus_tmp(monkeypatch):
    """Corpus controlado: README + ADR real + plantilla + guía técnica."""
    tmp = Path("/tmp/calculadora_corpus_test")
    adr = tmp / "docs" / "adr"
    adr.mkdir(parents=True, exist_ok=True)
    (tmp / "README.md").write_text(
        "# Kavana Calculadora\n\nPWA de cálculo de producción industrial offline-first.\n"
        "Vanilla JavaScript modular, sin frameworks ni bundlers.\n"
    )
    (tmp / "SECURITY.md").write_text("# Seguridad\n\nModelo de datos en localStorage por origen.\n")
    (tmp / "docs").mkdir(exist_ok=True)
    (adr / "adr-001-persistencia.md").write_text(
        "## Decisión\n\nSe eligió persistencia offline en localStorage para funcionar sin red.\n"
    )
    (adr / "adr-002-template.md").write_text("## Plantilla\n\nNo debe indexarse.\n")
    (tmp / "docs" / "developer-guide.md").write_text(
        "## Guía de desarrollo\n\nArquitectura modular por dominio: temas, medidas, cálculos.\n"
    )

    monkeypatch.setenv("CALCULADORA_DOCS_ROOT", str(tmp))
    importlib.reload(assistant)
    yield tmp
    monkeypatch.delenv("CALCULADORA_DOCS_ROOT", raising=False)
    importlib.reload(assistant)


def test_corpus_excluye_plantillas(corpus_tmp):
    idx = assistant.construir_indice(assistant.cargar_corpus())
    fuentes = {c["fuente"] for c in idx["chunks"]}
    assert "docs/adr/adr-002-template.md" not in fuentes


def test_corpus_incluye_real(corpus_tmp):
    idx = assistant.construir_indice(assistant.cargar_corpus())
    fuentes = {c["fuente"] for c in idx["chunks"]}
    assert "README.md" in fuentes
    assert "docs/adr/adr-001-persistencia.md" in fuentes
    assert "docs/developer-guide.md" in fuentes


def test_pregunta_fuera_de_corpus(corpus_tmp):
    idx = assistant.construir_indice(assistant.cargar_corpus())
    docs = assistant.buscar(idx, "cuál es el color favorito del fundador")
    assert not docs or docs[0]["score"] < 0.02


def test_rate_limit_ventana():
    assistant._preguntas_ip.clear()
    with pytest.raises(assistant.RateLimitExceeded):
        for _ in range(assistant.MAX_PREGUNTAS_VENTANA + 1):
            assistant.enforce_rate_limit("1.2.3.4")


def test_rate_limit_diario():
    assistant._preguntas_ip.clear()
    assistant._dia_actual = _t.strftime("%Y-%m-%d")
    assistant._preguntas_dia = assistant.MAX_PREGUNTAS_DIA
    with pytest.raises(assistant.RateLimitExceeded):
        assistant.enforce_rate_limit("5.6.7.8")
    assistant._preguntas_dia = 0