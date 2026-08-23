// ==========================================
// CONFIGURACIÓN
// ==========================================

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const departamento = require("./models/departamento");
const Reserva = require("./models/Reserva");
const Cliente = require("./models/Cliente");
const Pago = require("./models/Pago");
const Limpieza = require("./models/Limpieza");
const Inventario = require("./models/Inventario");
const Documento = require("./models/Documento");
const Configuracion = require("./models/Configuracion");
const PDFDocument = require("pdfkit");
const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;


// ==========================================
// CONEXIÓN A MONGODB
// ==========================================

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {

        console.log("=================================");
        console.log(" MONGODB CONECTADO CORRECTAMENTE");
        console.log("=================================");

    })
    .catch((error) => {

        console.error(
            "❌ Error conectando a MongoDB:"
        );

        console.error(error.message);

    });


// ==========================================
// INICIO
// ==========================================

app.get("/", (req, res) => {

    res.json({
        ok: true,
        sistema: "Departamentos Diamantes de Kino",
        mensaje: "Backend funcionando correctamente"
    });

});


// ======================================================
//                     DEPARTAMENTOS
// ======================================================


// ==========================================
// OBTENER TODOS LOS DEPARTAMENTOS
// ==========================================

app.get("/api/departamentos", async (req, res) => {

    try {

        const departamentos =
            await Departamento
                .find()
                .sort({ codigo: 1 });


        res.json({

            ok: true,

            total: departamentos.length,

            departamentos

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            ok: false,

            mensaje:
                "Error obteniendo departamentos",

            error: error.message

        });

    }

});


// ==========================================
// OBTENER UN DEPARTAMENTO
// ==========================================

app.get(
    "/api/departamentos/:id",
    async (req, res) => {

        try {

            const departamento =
                await Departamento.findById(
                    req.params.id
                );


            if (!departamento) {

                return res.status(404).json({

                    ok: false,

                    mensaje:
                        "Departamento no encontrado"

                });

            }


            res.json({

                ok: true,

                departamento

            });

        } catch (error) {

            console.error(error);

            res.status(500).json({

                ok: false,

                mensaje:
                    "Error obteniendo departamento",

                error: error.message

            });

        }

    }
);


// ==========================================
// DEPARTAMENTOS DISPONIBLES
// ==========================================

app.get(
    "/api/disponibilidad",
    async (req, res) => {

        try {

            const departamentos =
                await Departamento
                    .find({
                        estado: "disponible"
                    })
                    .sort({
                        codigo: 1
                    });


            res.json({

                ok: true,

                disponibles:
                    departamentos.length,

                departamentos

            });

        } catch (error) {

            console.error(error);

            res.status(500).json({

                ok: false,

                mensaje:
                    "Error obteniendo disponibilidad",

                error: error.message

            });

        }

    }
);


// ==========================================
// CREAR DEPARTAMENTO
// ==========================================

app.post(
    "/api/departamentos",
    async (req, res) => {

        try {

            const departamento =
                new Departamento(req.body);


            await departamento.save();


            res.status(201).json({

                ok: true,

                mensaje:
                    "Departamento creado correctamente",

                departamento

            });

        } catch (error) {

            console.error(error);

            res.status(400).json({

                ok: false,

                mensaje:
                    "No se pudo crear el departamento",

                error: error.message

            });

        }

    }
);


// ======================================================
//                        RESERVAS
// ======================================================


// ==========================================
// OBTENER TODAS LAS RESERVAS
// ==========================================

app.get("/api/reservas", async (req, res) => {

    try {

        const reservas =
            await Reserva
                .find()
                .sort({
                    numeroReserva: -1,
                    createdAt: -1
                });


        res.json({

            ok: true,

            total: reservas.length,

            reservas

        });

    } catch (error) {

        console.error(
            "❌ Error obteniendo reservas:",
            error
        );

        res.status(500).json({

            ok: false,

            mensaje:
                "Error obteniendo reservas",

            error: error.message

        });

    }

});


// ==========================================
// OBTENER UNA RESERVA
// ==========================================

app.get(
    "/api/reservas/:id",
    async (req, res) => {

        try {

            const reserva =
                await Reserva.findById(
                    req.params.id
                );


            if (!reserva) {

                return res.status(404).json({

                    ok: false,

                    mensaje:
                        "Reserva no encontrada"

                });

            }


            res.json({

                ok: true,

                reserva

            });

        } catch (error) {

            console.error(error);

            res.status(500).json({

                ok: false,

                mensaje:
                    "Error obteniendo reserva",

                error: error.message

            });

        }

    }
);


// ==========================================
// CREAR RESERVA
// ==========================================

app.post(
    "/api/reservas",
    async (req, res) => {

        try {

            let numeroReserva =
                req.body.numeroReserva;


            if (!numeroReserva) {

                const ultimaReserva =
                    await Reserva
                        .findOne()
                        .sort({
                            numeroReserva: -1
                        });


                numeroReserva =
                    ultimaReserva
                        ? Number(
                            ultimaReserva.numeroReserva
                          ) + 1
                        : 1;

            }


            const reserva =
                new Reserva({

                    ...req.body,

                    numeroReserva

                });


            await reserva.save();


            // ======================================
            // ACTUALIZAR CONTADOR DEL CLIENTE
            // ======================================

            if (req.body.clienteId) {

                await Cliente.findByIdAndUpdate(
                    req.body.clienteId,
                    {
                        $inc: {
                            reservas: 1
                        }
                    }
                );

            }


            res.status(201).json({

                ok: true,

                mensaje:
                    "Reserva creada correctamente",

                reserva

            });

        } catch (error) {

            console.error(error);

            res.status(400).json({

                ok: false,

                mensaje:
                    "No se pudo crear la reserva",

                error: error.message

            });

        }

    }
);


// ==========================================
// CAMBIAR ESTADO
// ==========================================

app.put(
    "/api/reservas/:id/estado",
    async (req, res) => {

        try {

            const estadosPermitidos = [
                "confirmada",
                "anticipo",
                "cancelada",
                "completada"
            ];


            const estado =
                req.body.estado;


            if (
                !estadosPermitidos.includes(
                    estado
                )
            ) {

                return res.status(400).json({

                    ok: false,

                    mensaje:
                        "Estado no válido"

                });

            }


            const reserva =
                await Reserva.findByIdAndUpdate(

                    req.params.id,

                    {
                        estado
                    },

                    {
                        new: true,
                        runValidators: true
                    }

                );


            if (!reserva) {

                return res.status(404).json({

                    ok: false,

                    mensaje:
                        "Reserva no encontrada"

                });

            }


            res.json({

                ok: true,

                mensaje:
                    "Estado actualizado correctamente",

                reserva

            });

        } catch (error) {

            console.error(error);

            res.status(500).json({

                ok: false,

                mensaje:
                    "Error actualizando estado",

                error: error.message

            });

        }

    }
);


// ==========================================
// EDITAR RESERVA
// ==========================================

app.put(
    "/api/reservas/:id",
    async (req, res) => {

        try {

            const reserva =
                await Reserva.findByIdAndUpdate(

                    req.params.id,

                    req.body,

                    {
                        new: true,
                        runValidators: true
                    }

                );


            if (!reserva) {

                return res.status(404).json({

                    ok: false,

                    mensaje:
                        "Reserva no encontrada"

                });

            }


            res.json({

                ok: true,

                mensaje:
                    "Reserva actualizada correctamente",

                reserva

            });

        } catch (error) {

            console.error(error);

            res.status(400).json({

                ok: false,

                mensaje:
                    "No se pudo actualizar la reserva",

                error: error.message

            });

        }

    }
);


// ==========================================
// ELIMINAR RESERVA
// ==========================================

app.delete(
    "/api/reservas/:id",
    async (req, res) => {

        try {

            const reserva =
                await Reserva.findByIdAndDelete(
                    req.params.id
                );


            if (!reserva) {

                return res.status(404).json({

                    ok: false,

                    mensaje:
                        "Reserva no encontrada"

                });

            }


            // Reducir contador del cliente

            if (reserva.clienteId) {

                await Cliente.findByIdAndUpdate(
                    reserva.clienteId,
                    {
                        $inc: {
                            reservas: -1
                        }
                    }
                );

            }


            res.json({

                ok: true,

                mensaje:
                    "Reserva eliminada correctamente"

            });

        } catch (error) {

            console.error(error);

            res.status(500).json({

                ok: false,

                mensaje:
                    "Error eliminando reserva",

                error: error.message

            });

        }

    }
);


// ======================================================
//                        CLIENTES
// ======================================================


// ==========================================
// OBTENER TODOS LOS CLIENTES
// ==========================================

app.get("/api/clientes", async (req, res) => {

    try {

        const clientes =
            await Cliente
                .find()
                .sort({
                    nombre: 1
                });


        res.json({

            ok: true,

            total: clientes.length,

            clientes

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            ok: false,

            mensaje:
                "Error obteniendo clientes",

            error: error.message

        });

    }

});


// ==========================================
// OBTENER UN CLIENTE
// ==========================================

app.get(
    "/api/clientes/:id",
    async (req, res) => {

        try {

            const cliente =
                await Cliente.findById(
                    req.params.id
                );


            if (!cliente) {

                return res.status(404).json({

                    ok: false,

                    mensaje:
                        "Cliente no encontrado"

                });

            }


            res.json({

                ok: true,

                cliente

            });

        } catch (error) {

            console.error(error);

            res.status(500).json({

                ok: false,

                mensaje:
                    "Error obteniendo cliente",

                error: error.message

            });

        }

    }
);


// ==========================================
// CREAR CLIENTE
// ==========================================

app.post(
    "/api/clientes",
    async (req, res) => {

        try {

            const nombre =
                String(
                    req.body.nombre || ""
                ).trim();


            const telefono =
                String(
                    req.body.telefono || ""
                ).trim();


            const tipo =
                req.body.tipo ||
                "Normal";


            if (!nombre || !telefono) {

                return res.status(400).json({

                    ok: false,

                    mensaje:
                        "El nombre y teléfono son obligatorios"

                });

            }


            const cliente =
                new Cliente({

                    nombre,

                    telefono,

                    tipo,

                    reservas: 0

                });


            await cliente.save();


            res.status(201).json({

                ok: true,

                mensaje:
                    "Cliente creado correctamente",

                cliente

            });

        } catch (error) {

            console.error(error);

            res.status(400).json({

                ok: false,

                mensaje:
                    "No se pudo crear el cliente",

                error: error.message

            });

        }

    }
);


// ==========================================
// EDITAR CLIENTE
// ==========================================

app.put(
    "/api/clientes/:id",
    async (req, res) => {

        try {

            const cliente =
                await Cliente.findByIdAndUpdate(

                    req.params.id,

                    {
                        nombre:
                            req.body.nombre,

                        telefono:
                            req.body.telefono,

                        tipo:
                            req.body.tipo
                    },

                    {
                        new: true,
                        runValidators: true
                    }

                );


            if (!cliente) {

                return res.status(404).json({

                    ok: false,

                    mensaje:
                        "Cliente no encontrado"

                });

            }


            res.json({

                ok: true,

                mensaje:
                    "Cliente actualizado correctamente",

                cliente

            });

        } catch (error) {

            console.error(error);

            res.status(400).json({

                ok: false,

                mensaje:
                    "No se pudo actualizar el cliente",

                error: error.message

            });

        }

    }
);


// ==========================================
// ELIMINAR CLIENTE
// ==========================================

app.delete(
    "/api/clientes/:id",
    async (req, res) => {

        try {

            const cliente =
                await Cliente.findByIdAndDelete(
                    req.params.id
                );


            if (!cliente) {

                return res.status(404).json({

                    ok: false,

                    mensaje:
                        "Cliente no encontrado"

                });

            }


            res.json({

                ok: true,

                mensaje:
                    "Cliente eliminado correctamente"

            });

        } catch (error) {

            console.error(error);

            res.status(500).json({

                ok: false,

                mensaje:
                    "No se pudo eliminar el cliente",

                error: error.message

            });

        }

    }
);

// ======================================================
//                         PAGOS
// ======================================================

// ==========================================
// OBTENER TODOS LOS PAGOS
// ==========================================

app.get("/api/pagos", async (req, res) => {

    try {

        const pagos =
            await Pago.find()
                .sort({
                    fechaPago: -1,
                    createdAt: -1
                });

        const total =
            pagos.reduce(
                (suma, pago) =>
                    suma + Number(pago.monto || 0),
                0
            );

        res.json({
            ok: true,
            total,
            pagos
        });

    } catch (error) {

        console.error(
            "Error obteniendo pagos:",
            error
        );

        res.status(500).json({
            ok: false,
            mensaje: "Error obteniendo pagos",
            error: error.message
        });

    }

});


// ==========================================
// OBTENER UN PAGO
// ==========================================

app.get("/api/pagos/:id", async (req, res) => {

    try {

        const pago =
            await Pago.findById(
                req.params.id
            );

        if (!pago) {

            return res.status(404).json({
                ok: false,
                mensaje: "Pago no encontrado"
            });

        }

        res.json({
            ok: true,
            pago
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            ok: false,
            mensaje: "Error obteniendo pago",
            error: error.message
        });

    }

});


// ==========================================
// CREAR PAGO
// ==========================================

app.post("/api/pagos", async (req, res) => {

    try {

        const pago =
            new Pago({

                clienteId:
                    req.body.clienteId || null,

                reservaId:
                    req.body.reservaId || null,

                nombreCliente:
                    req.body.nombreCliente,

                metodo:
                    req.body.metodo,

                tipoPago:
                    req.body.tipoPago,

                monto:
                    Number(req.body.monto || 0),

                fechaPago:
                    req.body.fechaPago || new Date(),

                verificado:
                    Boolean(
                        req.body.verificado
                    ),

                verificadoPor:
                    req.body.verificadoPor || ""

            });


        await pago.save();


        res.status(201).json({

            ok: true,

            mensaje:
                "Pago registrado correctamente",

            pago

        });

    } catch (error) {

        console.error(error);

        res.status(400).json({

            ok: false,

            mensaje:
                "No se pudo registrar el pago",

            error: error.message

        });

    }

});


// ==========================================
// CAMBIAR VERIFICACIÓN
// ==========================================

app.put(
    "/api/pagos/:id/verificado",
    async (req, res) => {

        try {

            const verificado =
                Boolean(
                    req.body.verificado
                );

            const verificadoPor =
                verificado
                    ? (
                        req.body.verificadoPor ||
                        "Pitic Keys"
                    )
                    : "";


            const pago =
                await Pago.findByIdAndUpdate(

                    req.params.id,

                    {
                        verificado,
                        verificadoPor
                    },

                    {
                        new: true
                    }

                );


            if (!pago) {

                return res.status(404).json({
                    ok: false,
                    mensaje: "Pago no encontrado"
                });

            }


            res.json({

                ok: true,

                mensaje:
                    verificado
                        ? "Pago verificado"
                        : "Verificación retirada",

                pago

            });

        } catch (error) {

            console.error(error);

            res.status(500).json({

                ok: false,

                mensaje:
                    "No se pudo actualizar la verificación",

                error: error.message

            });

        }

    }
);


// ==========================================
// EDITAR PAGO
// ==========================================

app.put("/api/pagos/:id", async (req, res) => {

    try {

        const pago =
            await Pago.findByIdAndUpdate(

                req.params.id,

                req.body,

                {
                    new: true,
                    runValidators: true
                }

            );


        if (!pago) {

            return res.status(404).json({
                ok: false,
                mensaje: "Pago no encontrado"
            });

        }


        res.json({

            ok: true,

            mensaje:
                "Pago actualizado correctamente",

            pago

        });

    } catch (error) {

        console.error(error);

        res.status(400).json({

            ok: false,

            mensaje:
                "No se pudo actualizar el pago",

            error: error.message

        });

    }

});


// ==========================================
// ELIMINAR PAGO
// ==========================================

app.delete("/api/pagos/:id", async (req, res) => {

    try {

        const pago =
            await Pago.findByIdAndDelete(
                req.params.id
            );


        if (!pago) {

            return res.status(404).json({

                ok: false,

                mensaje:
                    "Pago no encontrado"

            });

        }


        res.json({

            ok: true,

            mensaje:
                "Pago eliminado correctamente"

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            ok: false,

            mensaje:
                "No se pudo eliminar el pago",

            error: error.message

        });

    }

});
// ======================================================
//                       LIMPIEZA
// ======================================================

// ==========================================
// OBTENER TODAS LAS TAREAS
// ==========================================

app.get("/api/limpieza", async (req, res) => {

    try {

        const tareas =
            await Limpieza.find()
                .sort({
                    fecha: -1,
                    createdAt: -1
                });

        res.json({
            ok: true,
            total: tareas.length,
            tareas
        });

    } catch (error) {

        console.error(
            "Error obteniendo limpieza:",
            error
        );

        res.status(500).json({
            ok: false,
            mensaje: "Error obteniendo tareas de limpieza",
            error: error.message
        });

    }

});


// ==========================================
// OBTENER UNA TAREA
// ==========================================

app.get("/api/limpieza/:id", async (req, res) => {

    try {

        const tarea =
            await Limpieza.findById(
                req.params.id
            );

        if (!tarea) {

            return res.status(404).json({
                ok: false,
                mensaje: "Tarea de limpieza no encontrada"
            });

        }

        res.json({
            ok: true,
            tarea
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            ok: false,
            mensaje: "Error obteniendo tarea",
            error: error.message
        });

    }

});


// ==========================================
// CREAR TAREA
// ==========================================

app.post("/api/limpieza", async (req, res) => {

    try {

        const tareasBase = [
            "Barrer y trapear pisos",
            "Limpiar baños",
            "Cambiar sábanas y toallas",
            "Limpiar cocina",
            "Sacar basura",
            "Limpiar ventanas",
            "Revisar inventario",
            "Desinfectar superficies"
        ];


        const tareas =
            Array.isArray(req.body.tareas) &&
            req.body.tareas.length === 8

                ? req.body.tareas

                : tareasBase.map(nombre => ({
                    nombre,
                    completada: false
                }));


        const limpieza =
            new Limpieza({

                departamentoNumero:
                    Number(
                        req.body.departamentoNumero || 1
                    ),

                departamentoNombre:
                    req.body.departamentoNombre || "",

                responsable:
                    req.body.responsable || "",

                estado:
                    req.body.estado || "pendiente",

                tareas,

                notas:
                    req.body.notas || "",

                reservaId:
                    req.body.reservaId || null,

                clienteNombre:
                    req.body.clienteNombre || "",

                fecha:
                    req.body.fecha || new Date()

            });


        await limpieza.save();


        res.status(201).json({

            ok: true,

            mensaje:
                "Tarea de limpieza creada correctamente",

            tarea: limpieza

        });

    } catch (error) {

        console.error(error);

        res.status(400).json({

            ok: false,

            mensaje:
                "No se pudo crear la tarea de limpieza",

            error: error.message

        });

    }

});


// ==========================================
// ACTUALIZAR TAREA
// ==========================================

app.put("/api/limpieza/:id", async (req, res) => {

    try {

        const tarea =
            await Limpieza.findByIdAndUpdate(

                req.params.id,

                {

                    departamentoNumero:
                        req.body.departamentoNumero,

                    departamentoNombre:
                        req.body.departamentoNombre,

                    responsable:
                        req.body.responsable,

                    estado:
                        req.body.estado,

                    tareas:
                        req.body.tareas,

                    notas:
                        req.body.notas,

                    reservaId:
                        req.body.reservaId,

                    clienteNombre:
                        req.body.clienteNombre

                },

                {
                    new: true,
                    runValidators: true
                }

            );


        if (!tarea) {

            return res.status(404).json({

                ok: false,

                mensaje:
                    "Tarea de limpieza no encontrada"

            });

        }


        res.json({

            ok: true,

            mensaje:
                "Tarea actualizada correctamente",

            tarea

        });

    } catch (error) {

        console.error(error);

        res.status(400).json({

            ok: false,

            mensaje:
                "No se pudo actualizar la tarea",

            error: error.message

        });

    }

});


// ==========================================
// ELIMINAR TAREA
// ==========================================

app.delete("/api/limpieza/:id", async (req, res) => {

    try {

        const tarea =
            await Limpieza.findByIdAndDelete(
                req.params.id
            );


        if (!tarea) {

            return res.status(404).json({

                ok: false,

                mensaje:
                    "Tarea de limpieza no encontrada"

            });

        }


        res.json({

            ok: true,

            mensaje:
                "Tarea eliminada correctamente"

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            ok: false,

            mensaje:
                "No se pudo eliminar la tarea",

            error: error.message

        });

    }

});


// ==========================================
// GENERAR REPORTE PDF
// ==========================================

app.get("/api/limpieza/:id/pdf", async (req, res) => {

    try {

        const tarea =
            await Limpieza.findById(
                req.params.id
            );


        if (!tarea) {

            return res.status(404).json({

                ok: false,

                mensaje:
                    "Tarea de limpieza no encontrada"

            });

        }


        const doc =
            new PDFDocument({
                size: "LETTER",
                margin: 50
            });


        res.setHeader(
            "Content-Type",
            "application/pdf"
        );


        res.setHeader(
            "Content-Disposition",
            `inline; filename="reporte-limpieza-${tarea.departamentoNumero}.pdf"`
        );


        doc.pipe(res);


        // ======================================
        // TÍTULO
        // ======================================

        doc
            .fontSize(22)
            .font("Helvetica-Bold")
            .text(
                "REPORTE DE LIMPIEZA",
                {
                    align: "center"
                }
            );


        doc.moveDown(2);


        // ======================================
        // INFORMACIÓN
        // ======================================

        doc
            .fontSize(12)
            .font("Helvetica");


        doc.text(
            `Departamento: #${tarea.departamentoNumero}`
        );


        doc.text(
            `Responsable: ${
                tarea.responsable || "________________"
            }`
        );


        doc.text(
            `Estado: ${obtenerTextoEstadoPDF(
                tarea.estado
            )}`
        );


        doc.text(
            `Fecha: ${formatearFechaPDF(
                tarea.fecha
            )}`
        );


        if (tarea.departamentoNombre) {

            doc.text(
                `Departamento: ${tarea.departamentoNombre}`
            );

        }


        doc.moveDown();


        // ======================================
        // CHECKLIST
        // ======================================

        doc
            .fontSize(15)
            .font("Helvetica-Bold")
            .text("CHECKLIST");


        doc.moveDown(0.8);


        doc
            .fontSize(12)
            .font("Helvetica");


        tarea.tareas.forEach(
            item => {

                const simbolo =
                    item.completada
                        ? "☑"
                        : "☐";


                doc.text(
                    `${simbolo} ${item.nombre}`
                );

            }
        );


        doc.moveDown();


        // ======================================
        // NOTAS
        // ======================================

        doc
            .fontSize(15)
            .font("Helvetica-Bold")
            .text("Notas");


        doc.moveDown(0.5);


        doc
            .fontSize(12)
            .font("Helvetica")
            .text(
                tarea.notas ||
                "Sin notas."
            );


        doc.moveDown(2);


        // ======================================
        // TOTAL
        // ======================================

        const completadas =
            tarea.tareas.filter(
                item =>
                    item.completada
            ).length;


        doc
            .fontSize(11)
            .text(
                `Tareas completadas: ${completadas}/${tarea.tareas.length}`
            );


        doc.end();

    } catch (error) {

        console.error(
            "Error generando PDF:",
            error
        );

        res.status(500).json({

            ok: false,

            mensaje:
                "No se pudo generar el PDF",

            error: error.message

        });

    }

});


// ==========================================
// FUNCIONES PDF
// ==========================================

function obtenerTextoEstadoPDF(
    estado
) {

    switch (estado) {

        case "progreso":
            return "Progreso";

        case "completada":
            return "Completada";

        case "incidencia":
            return "Incidencia";

        default:
            return "Pendiente";

    }

}


function formatearFechaPDF(
    fecha
) {

    const fechaObj =
        new Date(fecha);


    if (
        Number.isNaN(
            fechaObj.getTime()
        )
    ) {

        return String(fecha);

    }


    return fechaObj.toLocaleString(
        "es-MX",
        {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}

// ======================================================
//                     INVENTARIO
// ======================================================

// ==========================================
// OBTENER INVENTARIO
// ==========================================

app.get("/api/inventario", async (req, res) => {

    try {

        const filtro = {};

        if (req.query.departamento) {

            const numero =
                Number(
                    req.query.departamento
                );

            if (
                numero >= 1 &&
                numero <= 6
            ) {

                filtro.departamentoNumero =
                    numero;

            }

        }


        const articulos =
            await Inventario.find(filtro)
                .sort({
                    departamentoNumero: 1,
                    nombre: 1
                });


        res.json({

            ok: true,

            total: articulos.length,

            articulos

        });

    } catch (error) {

        console.error(
            "Error obteniendo inventario:",
            error
        );

        res.status(500).json({

            ok: false,

            mensaje:
                "Error obteniendo inventario",

            error:
                error.message

        });

    }

});


// ==========================================
// OBTENER UN ARTÍCULO
// ==========================================

app.get(
    "/api/inventario/:id",
    async (req, res) => {

        try {

            const articulo =
                await Inventario.findById(
                    req.params.id
                );


            if (!articulo) {

                return res.status(404).json({

                    ok: false,

                    mensaje:
                        "Artículo no encontrado"

                });

            }


            res.json({

                ok: true,

                articulo

            });

        } catch (error) {

            console.error(error);

            res.status(500).json({

                ok: false,

                mensaje:
                    "Error obteniendo artículo",

                error:
                    error.message

            });

        }

    }
);


// ==========================================
// CREAR ARTÍCULO
// ==========================================

app.post(
    "/api/inventario",
    async (req, res) => {

        try {

            const articulo =
                new Inventario({

                    departamentoNumero:
                        Number(
                            req.body.departamentoNumero
                        ),

                    nombre:
                        req.body.nombre,

                    cantidad:
                        Math.max(
                            0,
                            Number(
                                req.body.cantidad || 0
                            )
                        ),

                    estado:
                        req.body.estado ||
                        "Bueno",

                    categoria:
                        req.body.categoria ||
                        "Otros",

                    categoriaPersonalizada:
                        req.body.categoria === "Otros"
                            ? (
                                req.body.categoriaPersonalizada ||
                                ""
                            )
                            : "",

                    notas:
                        req.body.notas ||
                        ""

                });


            await articulo.save();


            res.status(201).json({

                ok: true,

                mensaje:
                    "Artículo agregado correctamente",

                articulo

            });

        } catch (error) {

            console.error(error);

            res.status(400).json({

                ok: false,

                mensaje:
                    "No se pudo agregar el artículo",

                error:
                    error.message

            });

        }

    }
);


// ==========================================
// EDITAR ARTÍCULO
// ==========================================

app.put(
    "/api/inventario/:id",
    async (req, res) => {

        try {

            const categoria =
                req.body.categoria ||
                "Otros";


            const categoriaPersonalizada =
                categoria === "Otros"
                    ? (
                        req.body.categoriaPersonalizada ||
                        ""
                    )
                    : "";


            const cantidad =
                Math.max(
                    0,
                    Number(
                        req.body.cantidad || 0
                    )
                );


            const articulo =
                await Inventario.findByIdAndUpdate(

                    req.params.id,

                    {

                        departamentoNumero:
                            Number(
                                req.body.departamentoNumero
                            ),

                        nombre:
                            req.body.nombre,

                        cantidad,

                        estado:
                            req.body.estado,

                        categoria,

                        categoriaPersonalizada,

                        notas:
                            req.body.notas || ""

                    },

                    {

                        new: true,

                        runValidators: true

                    }

                );


            if (!articulo) {

                return res.status(404).json({

                    ok: false,

                    mensaje:
                        "Artículo no encontrado"

                });

            }


            res.json({

                ok: true,

                mensaje:
                    "Artículo actualizado correctamente",

                articulo

            });

        } catch (error) {

            console.error(error);

            res.status(400).json({

                ok: false,

                mensaje:
                    "No se pudo actualizar el artículo",

                error:
                    error.message

            });

        }

    }
);


// ==========================================
// ELIMINAR ARTÍCULO
// ==========================================

app.delete(
    "/api/inventario/:id",
    async (req, res) => {

        try {

            const articulo =
                await Inventario.findByIdAndDelete(
                    req.params.id
                );


            if (!articulo) {

                return res.status(404).json({

                    ok: false,

                    mensaje:
                        "Artículo no encontrado"

                });

            }


            res.json({

                ok: true,

                mensaje:
                    "Artículo eliminado correctamente"

            });

        } catch (error) {

            console.error(error);

            res.status(500).json({

                ok: false,

                mensaje:
                    "No se pudo eliminar el artículo",

                error:
                    error.message

            });

        }

    }
);

// ======================================================
//                    DOCUMENTOS
// ======================================================

// ==========================================
// OBTENER DOCUMENTOS
// ==========================================

app.get("/api/documentos", async (req, res) => {

    try {

        const documentos =
            await Documento.find()
                .sort({
                    createdAt: -1
                });

        res.json({
            ok: true,
            total: documentos.length,
            documentos
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            ok: false,
            mensaje: "Error obteniendo documentos",
            error: error.message
        });

    }

});


// ==========================================
// OBTENER UN DOCUMENTO
// ==========================================

app.get(
    "/api/documentos/:id",
    async (req, res) => {

        try {

            const documento =
                await Documento.findById(
                    req.params.id
                );

            if (!documento) {

                return res.status(404).json({
                    ok: false,
                    mensaje: "Documento no encontrado"
                });

            }

            res.json({
                ok: true,
                documento
            });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                ok: false,
                mensaje: "Error obteniendo documento",
                error: error.message
            });

        }

    }
);


// ==========================================
// CREAR DOCUMENTO
// ==========================================

app.post(
    "/api/documentos",
    async (req, res) => {

        try {

            const documento =
                new Documento(req.body);

            await documento.save();

            res.status(201).json({
                ok: true,
                mensaje:
                    "Documento creado correctamente",
                documento
            });

        } catch (error) {

            console.error(error);

            res.status(400).json({
                ok: false,
                mensaje:
                    "No se pudo crear el documento",
                error: error.message
            });

        }

    }
);


// ==========================================
// EDITAR DOCUMENTO
// ==========================================

app.put(
    "/api/documentos/:id",
    async (req, res) => {

        try {

            const documento =
                await Documento.findByIdAndUpdate(
                    req.params.id,
                    req.body,
                    {
                        new: true,
                        runValidators: true
                    }
                );

            if (!documento) {

                return res.status(404).json({
                    ok: false,
                    mensaje:
                        "Documento no encontrado"
                });

            }

            res.json({
                ok: true,
                mensaje:
                    "Documento actualizado correctamente",
                documento
            });

        } catch (error) {

            console.error(error);

            res.status(400).json({
                ok: false,
                mensaje:
                    "No se pudo actualizar el documento",
                error: error.message
            });

        }

    }
);


// ==========================================
// ELIMINAR DOCUMENTO
// ==========================================

app.delete(
    "/api/documentos/:id",
    async (req, res) => {

        try {

            const documento =
                await Documento.findByIdAndDelete(
                    req.params.id
                );

            if (!documento) {

                return res.status(404).json({
                    ok: false,
                    mensaje:
                        "Documento no encontrado"
                });

            }

            res.json({
                ok: true,
                mensaje:
                    "Documento eliminado correctamente"
            });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                ok: false,
                mensaje:
                    "No se pudo eliminar el documento",
                error: error.message
            });

        }

    }
);


// ==========================================
// PDF DE COMPROBANTE
// ==========================================

app.get(
    "/api/documentos/:id/pdf",
    async (req, res) => {

        try {

            const documento =
                await Documento.findById(
                    req.params.id
                );

            if (!documento) {

                return res.status(404).json({
                    ok: false,
                    mensaje:
                        "Documento no encontrado"
                });

            }

            const pdf =
                new PDFDocument({
                    size: "LETTER",
                    margin: 50
                });

            res.setHeader(
                "Content-Type",
                "application/pdf"
            );

            res.setHeader(
                "Content-Disposition",
                `attachment; filename="comprobante-${documento.folio || documento._id}.pdf"`
            );

            pdf.pipe(res);

            pdf
                .fontSize(22)
                .font("Helvetica-Bold")
                .text(
                    "COMPROBANTE DE RESERVA",
                    {
                        align: "center"
                    }
                );

            pdf.moveDown(1);

            pdf
                .fontSize(13)
                .font("Helvetica");

            pdf.text(
                `Estado: ${textoEstadoReserva(
                    documento.estado
                )}`
            );

            pdf.moveDown(0.5);

            pdf.text(
                `Folio: ${documento.folio || "---"}`
            );

            pdf.text(
                `Cliente: ${documento.clienteNombre || "---"}`
            );

            pdf.text(
                `Departamento: ${documento.departamento || "---"}`
            );

            pdf.text(
                `Entrada: ${formatearFechaDocumento(
                    documento.entrada
                )}`
            );

            pdf.text(
                `Salida: ${formatearFechaDocumento(
                    documento.salida
                )}`
            );

            pdf.text(
                `Huéspedes: ${documento.huespedes || 1}`
            );

            pdf.moveDown();

            pdf
                .font("Helvetica-Bold")
                .text(
                    `Total: $${Number(
                        documento.total || 0
                    ).toLocaleString("es-MX")}`
                );

            pdf.text(
                `Saldo: $${Number(
                    documento.saldo || 0
                ).toLocaleString("es-MX")}`
            );

            if (documento.notas) {

                pdf.moveDown();

                pdf
                    .font("Helvetica")
                    .text(
                        `Notas: ${documento.notas}`
                    );

            }

            pdf.moveDown(2);

            pdf
                .fontSize(10)
                .font("Helvetica")
                .text(
                    "Departamentos Diamantes de Kino",
                    {
                        align: "center"
                    }
                );

            pdf.end();

        } catch (error) {

            console.error(error);

            res.status(500).json({
                ok: false,
                mensaje:
                    "No se pudo generar el PDF",
                error: error.message
            });

        }

    }
);


// ==========================================
// FUNCIONES DOCUMENTOS
// ==========================================

function textoEstadoReserva(estado) {

    switch (estado) {

        case "confirmada":
            return "Confirmada";

        case "cancelada":
            return "Cancelada";

        case "completada":
            return "Completada";

        default:
            return "Con anticipo";

    }

}


function formatearFechaDocumento(
    fecha
) {

    if (!fecha) {
        return "---";
    }

    const fechaObj =
        new Date(fecha);

    if (
        Number.isNaN(
            fechaObj.getTime()
        )
    ) {
        return String(fecha);
    }

    return fechaObj.toLocaleDateString(
        "es-MX",
        {
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );

}
// ======================================================
//                    CONFIGURACIÓN
// ======================================================

// ==========================================
// OBTENER CONFIGURACIÓN
// ==========================================

app.get("/api/configuracion", async (req, res) => {

    try {

        let configuracion =
            await Configuracion.findOne();

        if (!configuracion) {

            configuracion =
                new Configuracion({
                    reglas: [
                        {
                            titulo: "No mascotas",
                            descripcion:
                                "No se permiten animales de ningún tipo en el departamento",
                            activa: true
                        },

                        {
                            titulo:
                                "No fiestas ni ruido excesivo",
                            descripcion:
                                "Música y ruido deben cesar a las 12:00 a.m.",
                            activa: true
                        },

                        {
                            titulo:
                                "Respetar número de huéspedes",
                            descripcion:
                                "No se permite exceder el número de personas registradas",
                            activa: true
                        },

                        {
                            titulo:
                                "No fumar dentro del departamento",
                            descripcion:
                                "Fumar solo en áreas designadas al exterior",
                            activa: true
                        },

                        {
                            titulo:
                                "Cuidar las instalaciones",
                            descripcion:
                                "Cualquier daño será cobrado al huésped",
                            activa: true
                        },

                        {
                            titulo:
                                "Horario de check-in/check-out",
                            descripcion:
                                "Check-in a partir de las 3:00 PM, Check-out antes de las 12:00 PM",
                            activa: true
                        }
                    ]
                });

            await configuracion.save();
        }


        res.json({
            ok: true,
            configuracion
        });

    } catch (error) {

        console.error(
            "Error obteniendo configuración:",
            error
        );

        res.status(500).json({
            ok: false,
            mensaje:
                "Error obteniendo configuración",
            error: error.message
        });

    }

});


// ==========================================
// GUARDAR PRECIOS
// ==========================================

app.put(
    "/api/configuracion/precios",
    async (req, res) => {

        try {

            let configuracion =
                await Configuracion.findOne();


            if (!configuracion) {

                configuracion =
                    new Configuracion();

            }


            const precios =
                req.body || {};


            configuracion.precios = {

                carlosA02:
                    Math.max(
                        0,
                        Number(
                            precios.carlosA02 || 0
                        )
                    ),

                carlosB02:
                    Math.max(
                        0,
                        Number(
                            precios.carlosB02 || 0
                        )
                    ),

                gabrielC02:
                    Math.max(
                        0,
                        Number(
                            precios.gabrielC02 || 0
                        )
                    ),

                carlosA01:
                    Math.max(
                        0,
                        Number(
                            precios.carlosA01 || 0
                        )
                    ),

                gabrielB01:
                    Math.max(
                        0,
                        Number(
                            precios.gabrielB01 || 0
                        )
                    ),

                gabrielC01:
                    Math.max(
                        0,
                        Number(
                            precios.gabrielC01 || 0
                        )
                    )

            };


            await configuracion.save();


            // Actualizar también los precios
            // de los departamentos

            const preciosDepartamentos = [
                {
                    nombre: "Carlos A02",
                    precio:
                        configuracion.precios.carlosA02
                },

                {
                    nombre: "Carlos B02",
                    precio:
                        configuracion.precios.carlosB02
                },

                {
                    nombre: "Gabriel C02",
                    precio:
                        configuracion.precios.gabrielC02
                },

                {
                    nombre: "Carlos A01",
                    precio:
                        configuracion.precios.carlosA01
                },

                {
                    nombre: "Gabriel B01",
                    precio:
                        configuracion.precios.gabrielB01
                },

                {
                    nombre: "Gabriel C01",
                    precio:
                        configuracion.precios.gabrielC01
                }
            ];


            for (
                const item of preciosDepartamentos
            ) {

                await Departamento.findOneAndUpdate(
                    {
                        nombre: item.nombre
                    },
                    {
                        precioNoche: item.precio
                    }
                );

            }


            res.json({
                ok: true,
                mensaje:
                    "Precios guardados correctamente",
                configuracion
            });

        } catch (error) {

            console.error(error);

            res.status(400).json({
                ok: false,
                mensaje:
                    "No se pudieron guardar los precios",
                error: error.message
            });

        }

    }
);


// ==========================================
// CAMBIAR LOGO
// ==========================================

app.put(
    "/api/configuracion/logo",
    async (req, res) => {

        try {

            let configuracion =
                await Configuracion.findOne();


            if (!configuracion) {

                configuracion =
                    new Configuracion();

            }


            configuracion.logo =
                req.body.logo || "logo.jpeg";


            await configuracion.save();


            res.json({
                ok: true,
                mensaje:
                    "Logo actualizado correctamente",
                logo:
                    configuracion.logo
            });

        } catch (error) {

            console.error(error);

            res.status(400).json({
                ok: false,
                mensaje:
                    "No se pudo actualizar el logo",
                error: error.message
            });

        }

    }
);


// ==========================================
// AGREGAR REGLA
// ==========================================

app.post(
    "/api/configuracion/reglas",
    async (req, res) => {

        try {

            let configuracion =
                await Configuracion.findOne();


            if (!configuracion) {

                configuracion =
                    new Configuracion();

            }


            if (!req.body.titulo) {

                return res.status(400).json({
                    ok: false,
                    mensaje:
                        "El título de la regla es obligatorio"
                });

            }


            configuracion.reglas.push({

                titulo:
                    req.body.titulo,

                descripcion:
                    req.body.descripcion || "",

                activa:
                    req.body.activa !== false

            });


            await configuracion.save();


            res.status(201).json({
                ok: true,
                mensaje:
                    "Regla agregada correctamente",
                configuracion
            });

        } catch (error) {

            console.error(error);

            res.status(400).json({
                ok: false,
                mensaje:
                    "No se pudo agregar la regla",
                error: error.message
            });

        }

    }
);


// ==========================================
// EDITAR REGLA
// ==========================================

app.put(
    "/api/configuracion/reglas/:id",
    async (req, res) => {

        try {

            const configuracion =
                await Configuracion.findOne();


            if (!configuracion) {

                return res.status(404).json({
                    ok: false,
                    mensaje:
                        "Configuración no encontrada"
                });

            }


            const regla =
                configuracion.reglas.id(
                    req.params.id
                );


            if (!regla) {

                return res.status(404).json({
                    ok: false,
                    mensaje:
                        "Regla no encontrada"
                });

            }


            regla.titulo =
                req.body.titulo;

            regla.descripcion =
                req.body.descripcion || "";

            regla.activa =
                req.body.activa !== false;


            await configuracion.save();


            res.json({
                ok: true,
                mensaje:
                    "Regla actualizada correctamente",
                regla
            });

        } catch (error) {

            console.error(error);

            res.status(400).json({
                ok: false,
                mensaje:
                    "No se pudo actualizar la regla",
                error: error.message
            });

        }

    }
);


// ==========================================
// ACTIVAR / DESACTIVAR REGLA
// ==========================================

app.put(
    "/api/configuracion/reglas/:id/estado",
    async (req, res) => {

        try {

            const configuracion =
                await Configuracion.findOne();


            if (!configuracion) {

                return res.status(404).json({
                    ok: false,
                    mensaje:
                        "Configuración no encontrada"
                });

            }


            const regla =
                configuracion.reglas.id(
                    req.params.id
                );


            if (!regla) {

                return res.status(404).json({
                    ok: false,
                    mensaje:
                        "Regla no encontrada"
                });

            }


            regla.activa =
                req.body.activa === true;


            await configuracion.save();


            res.json({
                ok: true,
                activa: regla.activa,
                mensaje:
                    regla.activa
                        ? "Regla activada"
                        : "Regla desactivada"
            });

        } catch (error) {

            console.error(error);

            res.status(400).json({
                ok: false,
                mensaje:
                    "No se pudo cambiar el estado de la regla",
                error: error.message
            });

        }

    }
);


// ==========================================
// ELIMINAR REGLA
// ==========================================

app.delete(
    "/api/configuracion/reglas/:id",
    async (req, res) => {

        try {

            const configuracion =
                await Configuracion.findOne();


            if (!configuracion) {

                return res.status(404).json({
                    ok: false,
                    mensaje:
                        "Configuración no encontrada"
                });

            }


            const regla =
                configuracion.reglas.id(
                    req.params.id
                );


            if (!regla) {

                return res.status(404).json({
                    ok: false,
                    mensaje:
                        "Regla no encontrada"
                });

            }


            regla.deleteOne();


            await configuracion.save();


            res.json({
                ok: true,
                mensaje:
                    "Regla eliminada correctamente"
            });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                ok: false,
                mensaje:
                    "No se pudo eliminar la regla",
                error: error.message
            });

        }

    }
);
// ==========================================
// DEPARTAMENTOS
// ==========================================

// Obtener todos los departamentos
app.get("/departamentos", async (req, res) => {

    try {

        const departamentos = await Departamento.find()
            .sort({ codigo: 1 });

        res.json(departamentos);

    } catch (error) {

        console.error(
            "Error obteniendo departamentos:",
            error
        );

        res.status(500).json({
            error: "Error al obtener departamentos"
        });

    }

});


// ==========================================
// ACTUALIZAR FOTOS
// ==========================================

app.put("/departamentos/:id/fotos", async (req, res) => {

    try {

        const { id } = req.params;
        const { fotos } = req.body;


        if (!Array.isArray(fotos)) {

            return res.status(400).json({
                error: "El campo fotos debe ser un arreglo"
            });

        }


        const departamento =
            await Departamento.findByIdAndUpdate(
                id,
                {
                    fotos: fotos
                },
                {
                    new: true
                }
            );


        if (!departamento) {

            return res.status(404).json({
                error: "Departamento no encontrado"
            });

        }


        res.json({
            mensaje: "Fotos actualizadas correctamente",
            departamento: departamento
        });


    } catch (error) {

        console.error(
            "Error actualizando fotos:",
            error
        );


        res.status(500).json({
            error: "Error al actualizar fotos"
        });

    }

});
// ======================================================
//                         SERVIDOR
// ======================================================

app.listen(
    PORT,
    () => {

        console.log("=================================");
        console.log(
            " SISTEMA DE DEPARTAMENTOS DIAMANTES DE KINO"
        );
        console.log("=================================");
        console.log(
            `Servidor: http://localhost:${PORT}`
        );

    }
);
