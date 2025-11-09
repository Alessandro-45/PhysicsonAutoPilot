# --- Etapa 1: Construcción del Frontend (Node.js) ---
FROM node:22-alpine AS frontend-builder
WORKDIR /app/Front
COPY Front/package.json Front/package-lock.json ./
RUN npm install
COPY Front/ ./
RUN npm run build

# --- Etapa 2: Construcción del Backend (Python) ---
FROM python:3.10 AS backend-builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY ArchivosPython/ ./ArchivosPython/
RUN python ArchivosPython/analysis.py

# --- Etapa 3: Imagen Final ---
FROM python:3.10-slim
WORKDIR /app
RUN pip install --no-cache-dir "fastapi[all]" uvicorn
COPY server.py .
RUN mkdir -p ./ArchivosPython
COPY --from=backend-builder /app/*.json ./ArchivosPython/

# ¡IMPORTANTE! Revisa esta línea.
# Si el frontend crea una carpeta 'dist', cambia 'build' por 'dist'.
COPY --from=frontend-builder /app/Front/build ./Front

EXPOSE 8000
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]