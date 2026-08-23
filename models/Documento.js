const mongoose = require("mongoose");

const DocumentoSchema = new mongoose.Schema(
    {
        tipo: {
            type: String,
            default: "Comprobante de Reserva"
        },

        titulo: {
            type: String,
            required: true,
            trim: true
        },

        folio: {
            type: String,
            default: ""
        },

        reservaId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Reserva",
            default: null
        },

        clienteId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Cliente",
            default: null
        },

        clienteNombre: {
            type: String,
            default: ""
        },

        telefono: {
            type: String,
            default: ""
        },

        departamento: {
            type: String,
            default: ""
        },

        entrada: {
            type: Date,
            default: null
        },

        salida: {
            type: Date,
            default: null
        },

        huespedes: {
            type: Number,
            default: 1
        },

        total: {
            type: Number,
            default: 0
        },

        saldo: {
            type: Number,
            default: 0
        },

        estado: {
            type: String,
            default: "anticipo"
        },

        notas: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

module.exports =
    mongoose.model(
        "Documento",
        DocumentoSchema
    );
    