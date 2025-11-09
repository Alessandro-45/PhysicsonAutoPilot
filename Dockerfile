# --- Etapa 1: Builder ---
# Instala todas las dependencias y ejecuta el análisis que consume mucho tiempo.
FROM python:3.10 AS builder

WORKDIR /app

# Instalar dependencias para el análisis
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el código de análisis
COPY ArchivosPython/ ./ArchivosPython/

# Ejecutar el notebook para generar los archivos .json en el directorio de trabajo /app
RUN jupyter nbconvert --to notebook --execute ArchivosPython/analysis.ipynb --output-dir . --output analysis_executed.ipynb

# --- Etapa 2: Final ---
# Usa una imagen ligera de Python para ejecutar el servidor web.
FROM python:3.10-slim

WORKDIR /app

# Instalar solo las dependencias necesarias para el servidor
RUN pip install --no-cache-dir "fastapi[all]" uvicorn

# Copiar el frontend
COPY Front/ ./Front/

# Copiar el script del servidor
COPY server.py .

# Crear explícitamente el directorio de datos y luego copiar los archivos.
# Esto elimina cualquier ambigüedad.
RUN mkdir -p ./ArchivosPython
COPY --from=builder /app/*.json ./ArchivosPython/

# Expone el puerto que usará Uvicorn
EXPOSE 8000

# Comando para iniciar el servidor FastAPI
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]