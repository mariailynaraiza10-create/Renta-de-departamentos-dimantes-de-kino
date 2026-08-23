const mongoose = require("mongoose");

const ReglaSchema = new mongoose.Schema(
    {
        titulo: {
            type: String,
            required: true,
            trim: true
        },

        descripcion: {
            type: String,
            default: "",
            trim: true
        },

        activa: {
            type: Boolean,
            default: true
        }
    },
    {
        _id: true
    }
);


const ConfiguracionSchema = new mongoose.Schema(
    {
        precios: {
            carlosA02: {
                type: Number,
                min: 0,
                default: 2000
            },

            carlosB02: {
                type: Number,
                min: 0,
                default: 2000
            },

            gabrielC02: {
                type: Number,
                min: 0,
                default: 2000
            },

            carlosA01: {
                type: Number,
                min: 0,
                default: 2000
            },

            gabrielB01: {
                type: Number,
                min: 0,
                default: 2000
            },

            gabrielC01: {
                type: Number,
                min: 0,
                default: 2000
            }
        },

        logo: {
            type: String,
            default: "logo.jpeg"
        },

        reglas: {
            type: [ReglaSchema],
            default: []
        }
    },
    {
        timestamps: true
    }
);


module.exports =
    mongoose.model(
        "Configuracion",
        ConfiguracionSchema
    );
    