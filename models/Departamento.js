const mongoose = require("mongoose");

const departamentoSchema = new mongoose.Schema(
    {
        nombre: {
            type: String,
            required: true,
            trim: true
        },

        codigo: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        precioNoche: {
            type: Number,
            required: true,
            default: 2000
        },

        capacidad: {
            type: Number,
            default: 4
        },

        habitaciones: {
            type: Number,
            default: 1
        },

        camas: {
            type: String,
            default: ""
        },

        banos: {
            type: Number,
            default: 1
        },

        descripcion: {
            type: String,
            default: ""
        },

        amenidades: {
            type: [String],
            default: []
        },

        direccion: {
            type: String,
            default: ""
        },

        estado: {
            type: String,
            enum: [
                "disponible",
                "ocupado",
                "mantenimiento"
            ],
            default: "disponible"
        },

        fotos: {
            type: [String],
            default: []
        }
    },

    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "Departamento",
    departamentoSchema
);
