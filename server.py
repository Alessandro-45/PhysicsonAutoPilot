import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

app = FastAPI()

# --- API Endpoint para obtener los datos de los gráficos ---
@app.get("/api/periods")
def get_periods():
    data_dir = "ArchivosPython"
    if not os.path.isdir(data_dir):
        raise HTTPException(status_code=404, detail="Directorio de datos no encontrado.")

    json_files = [f for f in os.listdir(data_dir) if f.endswith('.json')]
    if not json_files:
        raise HTTPException(status_code=404, detail="No se encontraron archivos JSON de datos.")

    all_periods_data = {}
    for file_name in json_files:
        try:
            with open(os.path.join(data_dir, file_name), 'r') as f:
                data = json.load(f)
                period_name = data.get("period", "unknown")
                all_periods_data[period_name] = data
        except Exception as e:
            # Ignorar archivos mal formados o continuar según sea necesario
            print(f"Error al leer {file_name}: {e}")
            continue
            
    print("Servidor FastAPI listo. Accede a la UI en http://127.0.0.1:8000")
    return all_periods_data

# --- Montar los archivos estáticos del Frontend ---
# Esta línea le dice a FastAPI que sirva los archivos de la carpeta "Front".
# html=True hace que sirva index.html para la ruta raíz "/".
# ¡IMPORTANTE! Esta debe ser la última ruta que se monta.
app.mount("/", StaticFiles(directory="Front", html=True), name="static")

# Opcional: Una ruta explícita para el favicon para evitar errores 404 en la consola.
@app.get('/favicon.ico', include_in_schema=False)
async def favicon():
    return FileResponse(os.path.join("Front", "favicon.ico"))