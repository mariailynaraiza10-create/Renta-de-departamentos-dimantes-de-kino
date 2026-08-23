const mongoose = require("mongoose");

const ClienteSchema = new mongoose.Schema(
    {
        nombre: {
            type: String,
            required: true,
            trim: true
        },

        telefono: {
            type: String,
            required: true,
            trim: true
        },

        reservas: {
            type: Number,
            default: 0
        },

        tipo: {
            type: String,
            enum: [
                "Normal",
                "Frecuente"
            ],
            default: "Normal"
        }
    },
    {
        timestamps: true
    }
);

module.exports =
    mongoose.model(
        "Cliente",
        ClienteSchema
    );