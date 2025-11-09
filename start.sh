#!/bin/bash
set -euo pipefail

# Ir al directorio del repo (asegura rutas relativas)
cd "$(dirname "$0")"

NOTEBOOK="ArchivosPython/analysis.ipynb"
JSON_OUTPUT="ArchivosPython/datos_analisis.json" # El path que server.py espera 
FRONT_DIR="Front"
NB_TIMEOUT=600

echo "=== START.SH (Modo API+JSON) ==="
echo "Notebook: $NOTEBOOK"
echo "Salida JSON esperada en: $JSON_OUTPUT"

# Asegurar que el Front exista (para los archivos estáticos)
mkdir -p "$FRONT_DIR"

# --- PASO 1: FASE DE BUILD ---
# Ejecutar el notebook SOLAMENTE para generar el JSON
if [ -f "$NOTEBOOK" ]; then
  echo "Iniciando build: ejecutando notebook de análisis..."
  python -m nbconvert --to notebook --execute "$NOTEBOOK" --ExecutePreprocessor.timeout=$NB_TIMEOUT
  echo "Notebook ejecutado."
else
  echo "WARN: Notebook $NOTEBOOK no encontrado. Se salta la fase de build."
fi

# Verificar que el notebook haya creado el JSON
if [ ! -f "$JSON_OUTPUT" ]; then
  echo "ERROR: $JSON_OUTPUT no fue creado por el notebook. Abortando startup."
  exit 1
fi
echo "JSON para API generado exitosamente."

# --- PASO 2: INICIAR SERVIDOR ---
echo "Iniciando Web Service (uvicorn)..."
# Usamos exec para que uvicorn reciba PID 1
exec uvicorn server:app --host 0.0.0.0 --port ${PORT:-10000}