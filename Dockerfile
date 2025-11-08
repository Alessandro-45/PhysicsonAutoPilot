# Dockerfile
# 1. Empezar desde una imagen oficial de Python
FROM python:3.10-slim

# 2. Establecer un directorio de trabajo dentro del contenedor
WORKDIR /app

# 3. Copiar e instalar SOLAMENTE los requisitos
# (Asumiendo que requirements.txt está en la raíz)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt


COPY . .

# Comando por defecto: ejecutar tu script
CMD ["python", "ArchivosPython/main.py"]
# ...existing code...
# --- FIN ---
