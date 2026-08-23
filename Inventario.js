const mongoose = require("mongoose");

const InventarioSchema = new mongoose.Schema(
    {
        departamentoNumero: {
            type: Number,
            required: true,
            min: 1,
            max: 6
        },

        nombre: {
            type: String,
            required: true,
            trim: true
        },

        cantidad: {
            type: Number,
            required: true,
            min: 0,
            default: 0
        },

        estado: {
            type: String,
            enum: [
                "Bueno",
                "Faltante",
                "Dañado"
            ],
            default: "Bueno"
        },

        categoria: {
            type: String,
            enum: [
                "Muebles",
                "Electrónicos",
                "Blancos",
                "Cocina",
                "Baño",
                "Otros"
            ],
            default: "Otros"
        },

        categoriaPersonalizada: {
            type: String,
            default: "",
            trim: true
        },

        notas: {
            type: String,
            default: "",
            trim: true
        }
    },
    {
        timestamps: true
    }
);

module.exports =
    mongoose.model(
        "Inventario",
        InventarioSchema
    );
    