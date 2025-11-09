import json
import os
import glob
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

# --- Configuración ---
app = FastAPI()

# Habilitar CORS para permitir que el frontend (incluso si se sirve desde otro origen) haga peticiones
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite todos los orígenes
    allow_credentials=True,
    allow_methods=["*"],  # Permite todos los métodos
    allow_headers=["*"],  # Permite todas las cabeceras
)

# Directorio donde el notebook guarda los resultados
DATA_DIR = "ArchivosPython"

# --- API Endpoints (El Backend) ---

@app.get("/api/periods")
async def get_available_periods():
    """
    Escanea el directorio de datos y devuelve una lista de los períodos de análisis
    disponibles (ej: ["2015-2016", "2017", "2018", "Total"]).
    """
    try:
        # Busca todos los archivos JSON que siguen el patrón
        json_files = glob.glob(os.path.join(DATA_DIR, "datos_analisis_*.json"))
        
        # Extrae el nombre del período de cada nombre de archivo
        # ej: "ArchivosPython/datos_analisis_2015-2016.json" -> "2015-2016"
        periods = [
            os.path.basename(f).replace("datos_analisis_", "").replace(".json", "")
            for f in json_files
        ]
        
        if not periods:
            raise HTTPException(status_code=404, detail="No se encontraron archivos de datos de análisis.")
            
        # Devolverlos ordenados es una buena práctica para el frontend
        return {"periods": sorted(periods)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno del servidor al leer los períodos: {e}")

@app.get("/api/data/{period_name}")
async def get_analysis_data(period_name: str):
    """
    Devuelve los datos de análisis para un período específico solicitado en la URL.
    """
    json_file_path = os.path.join(DATA_DIR, f"datos_analisis_{period_name}.json")
    
    if not os.path.exists(json_file_path):
        raise HTTPException(status_code=404, detail=f"Datos para el período '{period_name}' no encontrados.")
    
    with open(json_file_path, 'r') as f:
        data = json.load(f)
    return data

# --- Servidor de Archivos (El Frontend) ---
# Esto sirve el index.html y otros archivos estáticos (JS, CSS) desde la carpeta 'Front/'
app.mount("/", StaticFiles(directory="Front", html=True), name="static")

print("Servidor FastAPI listo. Accede a la UI en http://127.0.0.1:8000")