const fs = require("fs");
const path = require("path");

// Ruta de la carpeta donde están los JSON
const carpeta = "C:\\Users\\César\\Desktop\\Reto Coafina\\RetoCoafina\\Frontd\\Manejo de Datos\\Data";

// Función para unir varios JSON CERN
function unirCERN(jsons) {
    const combinado = {
        bins: [],
        data: { counts: [], errors: [] },
        signal: { counts: [] },
        backgrounds: [],
        period: "",
        lumi: 0,
        x_axis_label: "",
        y_axis_label: ""
    };

    jsons.forEach((json, idx) => {
        combinado.bins = combinado.bins.concat(json.bins);
        combinado.data.counts = combinado.data.counts.concat(json.data.counts);
        combinado.data.errors = combinado.data.errors.concat(json.data.errors);
        combinado.signal.counts = combinado.signal.counts.concat(json.signal.counts);

        json.backgrounds.forEach((bg, i) => {
            if (!combinado.backgrounds[i]) {
                combinado.backgrounds[i] = { label: bg.label, counts: [] };
            }
            combinado.backgrounds[i].counts = combinado.backgrounds[i].counts.concat(bg.counts);
        });

        if (idx === 0) {
            combinado.period = json.period;
            combinado.lumi = json.lumi;
            combinado.x_axis_label = json.x_axis_label;
            combinado.y_axis_label = json.y_axis_label;
        }
    });

    return combinado;
}

// Leer todos los archivos .json de la carpeta
const archivos = fs.readdirSync(carpeta).filter(f => f.endsWith(".json"));
const jsons = archivos.map(f => JSON.parse(fs.readFileSync(path.join(carpeta, f), "utf8")));

// Unirlos
const combinado = unirCERN(jsons);

// Guardar el resultado en un nuevo archivo
fs.writeFileSync(path.join(carpeta, "combinado.json"), JSON.stringify(combinado, null, 2));

console.log("✅ Archivo combinado.json generado en la carpeta:", carpeta);