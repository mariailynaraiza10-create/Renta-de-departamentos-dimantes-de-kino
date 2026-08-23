const mongoose = require("mongoose");

const PagoSchema = new mongoose.Schema(
    {
        clienteId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Cliente",
            default: null
        },

        reservaId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Reserva",
            default: null
        },

        nombreCliente: {
            type: String,
            required: true,
            trim: true
        },

        metodo: {
            type: String,
            enum: [
                "Efectivo",
                "Transferencia"
            ],
            required: true
        },

        tipoPago: {
            type: String,
            enum: [
                "Anticipo",
                "Pago restante",
                "Pago total"
            ],
            required: true
        },

        monto: {
            type: Number,
            required: true,
            min: 0
        },

        fechaPago: {
            type: Date,
            default: Date.now
        },

        verificado: {
            type: Boolean,
            default: false
        },

        verificadoPor: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

module.exports =
    mongoose.model("Pago", PagoSchema);
    