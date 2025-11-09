// DEJA SOLO LAS FUNCIONES QUE NECESITAS.
// Por ejemplo, si tienes una clase 'Organizador' o funciones para dibujar, déjalas.

class Organizador {
    constructor(diccionario) {
        this.diccionario = diccionario;
    }
    getValues(clave) {
        return this.diccionario[clave];
    }
    getClaves() {
        return Object.keys(this.diccionario);
    }
}

// ELIMINA CUALQUIER CÓDIGO QUE SE EJECUTE SOLO, COMO ESTE:
/*
d3.json("...").then( datos => {
    function intentarGraficar(){
        // ...
    }
    // ...
});
*/