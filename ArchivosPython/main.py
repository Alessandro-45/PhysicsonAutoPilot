# analisis.py (MOCK)
import matplotlib.pyplot as plt
import os

print("--- Iniciando MOCK del análisis ---")

# Simular datos
datos_simulados = [1, 2, 2, 3, 3, 3, 4, 4, 5]

plt.figure(figsize=(10, 6))
plt.hist(datos_simulados, bins=5, color='blue', alpha=0.7)
plt.title("Histograma de Masa (MOCK)")
plt.xlabel("Masa (GeV) - Simulado")
plt.ylabel("Eventos - Simulado")

script_dir = os.path.dirname(__file__)
output_dir = os.path.abspath(os.path.join(script_dir, "..", "Front"))
os.makedirs(output_dir, exist_ok=True)

nombre_archivo = "histograma_masa.png"
ruta_salida = os.path.join(output_dir, nombre_archivo)
plt.savefig(ruta_salida)
plt.close()

print(f"Gráfico guardado como: {nombre_archivo}")
print("--- MOCK del análisis terminado ---")