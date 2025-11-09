document.addEventListener('DOMContentLoaded', () => {
    const periodSelector = document.getElementById('period-selector');
    const chartInfo = document.getElementById('chart-info');
    const ctx = document.getElementById('analysis-chart').getContext('2d');
    let analysisChart = null;

    /**
     * Función principal que se ejecuta al cargar la página.
     * Obtiene los períodos disponibles y carga los datos del primero.
     */
    const initializeApp = async () => {
        try {
            const response = await fetch('/api/periods');
            if (!response.ok) {
                throw new Error(`Error al cargar períodos: ${response.statusText}`);
            }
            const data = await response.json();
            const periods = data.periods;

            if (periods && periods.length > 0) {
                createPeriodButtons(periods);
                // Cargar automáticamente los datos del último período (generalmente 'Total')
                loadChartData(periods[periods.length - 1]);
            } else {
                periodSelector.innerHTML = '<p>No se encontraron períodos de análisis.</p>';
            }
        } catch (error) {
            console.error('Error de inicialización:', error);
            periodSelector.innerHTML = `<p style="color: #ff6b6b;">Error al conectar con el servidor.</p>`;
        }
    };

    /**
     * Crea los botones de selección para cada período de datos.
     * @param {string[]} periods - Un array con los nombres de los períodos.
     */
    const createPeriodButtons = (periods) => {
        periodSelector.innerHTML = ''; // Limpiar el mensaje de "cargando"
        periods.forEach(period => {
            const button = document.createElement('button');
            button.textContent = period.replace('-', '–'); // Usar un guion más largo para rangos
            button.dataset.period = period;
            button.addEventListener('click', () => loadChartData(period));
            periodSelector.appendChild(button);
        });
    };

    /**
     * Obtiene los datos de un período específico desde la API y actualiza el gráfico.
     * @param {string} period - El nombre del período a cargar.
     */
    const loadChartData = async (period) => {
        try {
            const response = await fetch(`/api/data/${period}`);
            if (!response.ok) {
                throw new Error(`No se pudieron cargar los datos para ${period}`);
            }
            const data = await response.json();
            
            updateActiveButton(period);
            updateChartInfo(data);
            renderChart(data);

        } catch (error) {
            console.error('Error al cargar datos del gráfico:', error);
            chartInfo.textContent = `Error al cargar datos para ${period}.`;
        }
    };
    
    /**
     * Actualiza el estado visual de los botones para resaltar el activo.
     * @param {string} activePeriod - El período que está actualmente seleccionado.
     */
    const updateActiveButton = (activePeriod) => {
        const buttons = periodSelector.querySelectorAll('button');
        buttons.forEach(button => {
            if (button.dataset.period === activePeriod) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    };

    /**
     * Muestra información relevante sobre el gráfico, como la luminosidad.
     * @param {object} data - El objeto de datos completo de la API.
     */
    const updateChartInfo = (data) => {
        chartInfo.innerHTML = `<strong>Período:</strong> ${data.period} | <strong>Luminosidad Integrada:</strong> ${data.lumi} fb⁻¹`;
    };

    /**
     * Dibuja o actualiza el gráfico utilizando Chart.js.
     * @param {object} data - El objeto de datos completo de la API.
     */
    const renderChart = (data) => {
        // Destruir el gráfico anterior si existe para evitar solapamientos
        if (analysisChart) {
            analysisChart.destroy();
        }

        // Preparar los datasets para los fondos (backgrounds)
        const backgroundDatasets = data.backgrounds.map(bg => ({
            type: 'bar',
            label: bg.label,
            data: bg.counts,
            backgroundColor: bg.color,
            borderColor: 'rgba(0,0,0,0.2)',
            borderWidth: 1,
        }));

        // Preparar el dataset para la señal (signal)
        const signalDataset = {
            type: 'line',
            label: data.signal.label,
            data: data.signal.counts,
            borderColor: data.signal.color,
            backgroundColor: 'rgba(0,0,0,0)', // Sin relleno
            borderWidth: 3,
            pointRadius: 0,
            stepped: true, // Dibuja una línea escalonada, típico de histogramas
        };

        // Preparar el dataset para los datos reales (data)
        const dataDataset = {
            type: 'scatter',
            label: data.data.label,
            data: data.data.counts.map((count, index) => ({
                x: (data.bins[index] + data.bins[index+1]) / 2, // Centrar el punto en el bin
                y: count
            })),
            backgroundColor: '#000000',
            // Aquí se podrían añadir las barras de error si se usa un plugin
        };

        // Los 'labels' del eje X son los centros de los bines del histograma
        const chartLabels = data.bins.slice(0, -1).map((bin, index) => {
            return (bin + data.bins[index+1]) / 2;
        });

        analysisChart = new Chart(ctx, {
            data: {
                labels: chartLabels,
                datasets: [...backgroundDatasets, signalDataset, dataDataset]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Distribución de Masa Invariante de 4 Leptones',
                        color: '#f0f0f0',
                        font: { size: 18 }
                    },
                    legend: {
                        labels: { color: '#f0f0f0' }
                    }
                },
                scales: {
                    x: {
                        type: 'linear', // El eje X es numérico (masa)
                        title: {
                            display: true,
                            text: data.x_axis_label,
                            color: '#ccc'
                        },
                        ticks: { color: '#ccc' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        stacked: true, // Apila las barras en el eje X
                    },
                    y: {
                        title: {
                            display: true,
                            text: data.y_axis_label,
                            color: '#ccc'
                        },
                        ticks: { color: '#ccc' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        stacked: true, // Apila las barras en el eje Y
                        beginAtZero: true
                    }
                }
            }
        });
    };

    // Iniciar la aplicación
    initializeApp();
});