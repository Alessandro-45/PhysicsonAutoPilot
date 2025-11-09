import json
import os
import matplotlib.pyplot as plt
import numpy as np

def generate_all_plots():
    json_dir = '.'  # El script se ejecutará desde ArchivosPython
    output_dir = '../Front/plots' # Guardaremos las imágenes en una nueva carpeta 'plots' en el Front

    # Crear el directorio de salida si no existe
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    json_files = [f for f in os.listdir(json_dir) if f.endswith('.json')]

    for file_name in json_files:
        with open(os.path.join(json_dir, file_name), 'r') as f:
            period_data = json.load(f)
        
        period_name = period_data.get("period", "unknown")
        print(f"Generando gráfica para: {period_name}")

        # --- LÓGICA DE MATPLOTLIB ---
        plt.style.use('dark_background')
        fig, ax = plt.subplots(figsize=(12, 6))

        bins = period_data['bins']
        bin_centers = (np.array(bins[:-1]) + np.array(bins[1:])) / 2
        bin_widths = np.diff(bins)

        # 1. Dibujar los fondos (backgrounds) apilados
        bottom_counts = np.zeros(len(period_data['backgrounds'][0]['counts']))
        for bg in period_data['backgrounds']:
            ax.bar(bin_centers, bg['counts'], width=bin_widths, bottom=bottom_counts, label=bg['label'], color=bg['color'])
            bottom_counts += np.array(bg['counts'])

        # 2. Dibujar los datos reales con barras de error
        data = period_data['data']
        ax.errorbar(bin_centers, data['counts'], yerr=data['errors'], fmt='o', color='white', label=data['label'])

        # 3. Configurar etiquetas y títulos
        ax.set_xlabel(period_data['x_axis_label'], fontsize=14)
        ax.set_ylabel(period_data['y_axis_label'], fontsize=14)
        ax.set_title(f"Masa Invariante de 4 Leptones ({period_name.replace('_', '-')})", fontsize=16)
        ax.legend()
        ax.set_xlim(bins[0], bins[-1])
        ax.set_ylim(bottom=0)

        # Guardar la figura
        output_path = os.path.join(output_dir, f"{period_name}.png")
        plt.savefig(output_path, bbox_inches='tight')
        plt.close(fig) # Cerrar la figura para liberar memoria

if __name__ == '__main__':
    generate_all_plots()