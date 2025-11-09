# --- STAGE 1: Backend Builder ---
# Instala dependencias y genera los archivos necesarios
FROM python:3.10-slim as backend-builder

WORKDIR /app

# Instalar dependencias (incluyendo matplotlib para generar plots)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar los archivos de Python y el Frontend a esta etapa
COPY ArchivosPython/ ./ArchivosPython/
COPY Front/ ./Front/

# Ejecutar el script para generar las gráficas. Esto creará la carpeta /app/Front/plots
RUN python ArchivosPython/script.py

# --- STAGE 2: Final Image ---
# Construye la imagen final y ligera
FROM python:3.10-slim

WORKDIR /app

# Copiar las librerías de Python desde la etapa de construcción
COPY --from=backend-builder /usr/local/lib/python3.10/site-packages /usr/local/lib/python3.10/site-packages
# Copiar los ejecutables (como uvicorn) desde la etapa de construcción
COPY --from=backend-builder /usr/local/bin /usr/local/bin

# Copiar el servidor y la carpeta Front MODIFICADA (que ahora contiene las gráficas)
COPY server.py .
COPY --from=backend-builder /app/Front ./Front

EXPOSE 8000

# Ejecutar el servidor
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]