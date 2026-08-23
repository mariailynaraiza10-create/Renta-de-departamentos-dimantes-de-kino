const mongoose = require("mongoose");

const ReservaSchema = new mongoose.Schema(
    {
        numeroReserva: {
            type: Number,
            required: true
        },

        nombre: {
            type: String,
            required: true,
            trim: true
        },

        telefono: {
            type: String,
            default: ""
        },

        departamento: {
            type: String,
            default: ""
        },

        fechaEntrada: {
            type: Date,
            required: true
        },

        fechaSalida: {
            type: Date,
            required: true
        },

        personas: {
            type: Number,
            default: 1
        },

        total: {
            type: Number,
            default: 0
        },

        agente: {
            type: String,
            default: ""
        },

        estado: {
            type: String,
            enum: [
                "confirmada",
                "anticipo",
                "cancelada",
                "completada"
            ],
            default: "anticipo"
        },

        comprobante: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "Reserva",
    ReservaSchema
);