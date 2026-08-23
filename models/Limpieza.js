const mongoose = require("mongoose");

const LimpiezaSchema = new mongoose.Schema(
    {
        departamentoNumero: {
            type: Number,
            required: true
        },

        departamentoNombre: {
            type: String,
            default: ""
        },

        responsable: {
            type: String,
            default: ""
        },

        estado: {
            type: String,
            enum: [
                "pendiente",
                "progreso",
                "completada",
                "incidencia"
            ],
            default: "pendiente"
        },

        tareas: [
            {
                nombre: {
                    type: String,
                    required: true
                },

                completada: {
                    type: Boolean,
                    default: false
                }
            }
        ],

        notas: {
            type: String,
            default: ""
        },

        reservaId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Reserva",
            default: null
        },

        clienteNombre: {
            type: String,
            default: ""
        },

        fecha: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

module.exports =
    mongoose.model("Limpieza", LimpiezaSchema);
    