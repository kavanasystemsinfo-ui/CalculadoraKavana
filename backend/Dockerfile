# Dockerfile for Kavana Calculadora backend (FastAPI)
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Código + corpus (README, SECURITY, docs) para el RAG
COPY app ./app
COPY README.md ./README.md
COPY SECURITY.md ./SECURITY.md
COPY docs ./docs

ENV PYTHONUNBUFFERED=1

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]