const wppconnect = require("@wppconnect-team/wppconnect");

// ======================================================
// CONFIGURACIÓN
// ======================================================

const API_URL = "https://renta-de-departamentos-dimantes-de-kino.onrender.com/";


// ======================================================
// FUNCIONES AUXILIARES
// ======================================================

async function apiFetch(ruta, opciones = {}) {

    const respuesta = await fetch(
        `${API_URL}${ruta}`,
        opciones
    );

    const texto = await respuesta.text();

    let datos;

    try {
        datos = JSON.parse(texto);
    } catch {
        throw new Error(
            `El servidor respondió algo que no es JSON: ${texto.slice(0, 200)}`
        );
    }

    if (!respuesta.ok) {

        throw new Error(
            datos.mensaje ||
            datos.error ||
            `Error HTTP ${respuesta.status}`
        );

    }

    return datos;

}


function limpiarTelefono(telefono) {

    return String(
        telefono || ""
    ).replace(
        /\D/g,
        ""
    );

}


function dinero(valor) {

    return Number(
        valor || 0
    ).toLocaleString(
        "es-MX",
        {
            style: "currency",
            currency: "MXN"
        }
    );

}


function fecha(valor) {

    if (!valor) {
        return "---";
    }

    const f = new Date(valor);

    if (isNaN(f.getTime())) {
        return String(valor);
    }

    return f.toLocaleDateString(
        "es-MX"
    );

}


function textoEstado(estado) {

    switch (estado) {

        case "confirmada":
            return "🔵 Confirmada";

        case "anticipo":
            return "🟠 Con anticipo";

        case "cancelada":
            return "🔴 Cancelada";

        case "completada":
            return "🟢 Completada";

        default:
            return estado || "---";

    }

}


// ======================================================
// MENÚ
// ======================================================

function menu() {

    return `
🏖️ *DEPARTAMENTOS DIAMANTES DE KINO*

¿Qué deseas consultar?

📊 *CONSULTAS*

1️⃣ Panel de control
2️⃣ Departamentos
3️⃣ Reservas
4️⃣ Clientes
5️⃣ Pagos
6️⃣ Inventario
7️⃣ Limpieza
8️⃣ Configuración
9️⃣ Documentos
🔟 Formulario de reserva

⚙️ *ACCIONES*

➕ Crear cliente
🔎 Buscar cliente
🗑️ Eliminar cliente
📲 Enviar formulario

━━━━━━━━━━━━━━━━━━

También puedes escribir comandos como:

• panel
• departamentos
• reservas
• clientes
• pagos
• inventario
• limpieza
• configuracion
• documentos
• formulario

🔎 Buscar:
*buscar cliente | Juan Pérez*

➕ Crear:
*crear cliente | Juan Pérez | 6621234567*

🗑️ Eliminar:
*eliminar cliente | 6621234567*

📲 Enviar formulario:
*enviar formulario | 6621234567*
`;


}


// ======================================================
// PANEL DE CONTROL
// ======================================================

async function consultarPanel() {

    try {

        const [
            reservasDatos,
            clientesDatos,
            departamentosDatos,
            pagosDatos
        ] = await Promise.all([

            apiFetch("/api/reservas"),

            apiFetch("/api/clientes"),

            apiFetch("/api/departamentos"),

            apiFetch("/api/pagos")

        ]);


        const reservas =
            reservasDatos.reservas || [];

        const clientes =
            clientesDatos.clientes || [];

        const departamentos =
            departamentosDatos.departamentos || [];

        const pagos =
            pagosDatos.pagos || [];


        const reservasActivas =
            reservas.filter(
                reserva =>
                    reserva.estado !== "cancelada" &&
                    reserva.estado !== "completada"
            );


        const ingresos =
            pagos.reduce(
                (
                    total,
                    pago
                ) =>
                    total +
                    Number(
                        pago.monto || 0
                    ),
                0
            );


        return `
📊 *PANEL DE CONTROL*

🏠 Departamentos:
${departamentos.length}

👤 Clientes:
${clientes.length}

📅 Reservas totales:
${reservas.length}

🟢 Reservas activas:
${reservasActivas.length}

💰 Pagos registrados:
${pagos.length}

💵 Ingresos registrados:
${dinero(ingresos)}

━━━━━━━━━━━━━━━━━━
🏖️ Departamentos Diamantes de Kino
`;

    } catch (error) {

        return `
❌ *No se pudo cargar el Panel de Control.*

${error.message}
`;

    }

}


// ======================================================
// DEPARTAMENTOS
// ======================================================

async function consultarDepartamentos() {

    try {

        const datos =
            await apiFetch(
                "/api/departamentos"
            );


        const departamentos =
            datos.departamentos || [];


        if (!departamentos.length) {

            return "🏠 No hay departamentos registrados.";

        }


        let mensaje =
            "🏠 *DEPARTAMENTOS*\n\n";


        departamentos.forEach(
            (depto, index) => {

                mensaje +=
                    `${index + 1}️⃣ *${depto.nombre || "Departamento"}*\n`;

                mensaje +=
                    `🆔 ${depto._id}\n`;

                if (
                    depto.numero !== undefined
                ) {

                    mensaje +=
                        `🔢 Número: ${depto.numero}\n`;

                }

                if (
                    depto.precio !== undefined
                ) {

                    mensaje +=
                        `💰 Precio: ${dinero(depto.precio)}\n`;

                }

                if (
                    depto.estado
                ) {

                    mensaje +=
                        `📌 Estado: ${depto.estado}\n`;

                }

                mensaje += "\n";

            }
        );


        return mensaje;

    } catch (error) {

        return `
❌ No se pudieron cargar los departamentos.

${error.message}
`;

    }

}


// ======================================================
// RESERVAS
// ======================================================

async function consultarReservas() {

    try {

        const datos =
            await apiFetch(
                "/api/reservas"
            );


        const reservas =
            datos.reservas || [];


        if (!reservas.length) {

            return "📅 No hay reservas registradas.";

        }


        let mensaje =
            `📅 *RESERVAS (${reservas.length})*\n\n`;


        reservas
            .slice(
                0,
                20
            )
            .forEach(
                (reserva, index) => {

                    mensaje +=
                        `*${index + 1}. ${reserva.nombre || "Sin nombre"}*\n`;

                    mensaje +=
                        `🏠 ${reserva.departamento || `Depto ${reserva.departamentoNumero || "---"}`}\n`;

                    mensaje +=
                        `📅 ${fecha(reserva.fechaEntrada)} → ${fecha(reserva.fechaSalida)}\n`;

                    mensaje +=
                        `👥 ${reserva.personas || 0} huéspedes\n`;

                    mensaje +=
                        `💰 Total: ${dinero(reserva.total)}\n`;

                    mensaje +=
                        `💵 Saldo: ${dinero(reserva.saldo)}\n`;

                    mensaje +=
                        `📌 ${textoEstado(reserva.estado)}\n`;

                    if (
                        reserva.folio
                    ) {

                        mensaje +=
                            `📋 Folio: ${reserva.folio}\n`;

                    }

                    mensaje += "\n";

                }
            );


        if (reservas.length > 20) {

            mensaje +=
                `\nMostrando las primeras 20 de ${reservas.length}.`;

        }


        return mensaje;

    } catch (error) {

        return `
❌ No se pudieron cargar las reservas.

${error.message}
`;

    }

}


// ======================================================
// CLIENTES
// ======================================================

async function consultarClientes() {

    try {

        const datos =
            await apiFetch(
                "/api/clientes"
            );


        const clientes =
            datos.clientes || [];


        if (!clientes.length) {

            return "👤 No hay clientes registrados.";

        }


        let mensaje =
            `👤 *CLIENTES (${clientes.length})*\n\n`;


        clientes
            .slice(
                0,
                30
            )
            .forEach(
                (cliente, index) => {

                    mensaje +=
                        `*${index + 1}. ${cliente.nombre || "Sin nombre"}*\n`;

                    mensaje +=
                        `📱 ${cliente.telefono || "---"}\n`;

                    mensaje +=
                        `📋 Tipo: ${cliente.tipo || "Normal"}\n`;

                    if (
                        cliente.reservas !== undefined
                    ) {

                        mensaje +=
                            `📅 Reservas: ${cliente.reservas}\n`;

                    }

                    mensaje += "\n";

                }
            );


        return mensaje;

    } catch (error) {

        return `
❌ No se pudieron cargar los clientes.

${error.message}
`;

    }

}


// ======================================================
// BUSCAR CLIENTE
// ======================================================

async function buscarCliente(
    busqueda
) {

    const termino =
        String(
            busqueda || ""
        ).trim().toLowerCase();


    if (!termino) {

        return `
🔎 *BUSCAR CLIENTE*

Ejemplo:

buscar cliente | Juan Pérez

o:

buscar cliente | 6621234567
`;

    }


    try {

        const datos =
            await apiFetch(
                "/api/clientes"
            );


        const clientes =
            datos.clientes || [];


        const terminoTelefono =
            limpiarTelefono(
                termino
            );


        const encontrados =
            clientes.filter(
                cliente => {

                    const nombre =
                        String(
                            cliente.nombre || ""
                        ).toLowerCase();


                    const telefono =
                        limpiarTelefono(
                            cliente.telefono
                        );


                    return (

                        nombre.includes(
                            termino
                        )

                        ||

                        (
                            terminoTelefono &&
                            telefono.includes(
                                terminoTelefono
                            )
                        )

                    );

                }
            );


        if (!encontrados.length) {

            return `
🔎 No encontré ningún cliente con:

*${busqueda}*
`;

        }


        let mensaje =
            `🔎 *CLIENTES ENCONTRADOS: ${encontrados.length}*\n\n`;


        encontrados.forEach(
            cliente => {

                mensaje +=
                    `👤 *${cliente.nombre || "---"}*\n`;

                mensaje +=
                    `📱 ${cliente.telefono || "---"}\n`;

                mensaje +=
                    `📋 Tipo: ${cliente.tipo || "Normal"}\n`;

                mensaje +=
                    `📅 Reservas: ${cliente.reservas || 0}\n`;

                if (
                    cliente._id
                ) {

                    mensaje +=
                        `🆔 ${cliente._id}\n`;

                }

                mensaje += "\n";

            }
        );


        return mensaje;

    } catch (error) {

        return `
❌ Error buscando cliente.

${error.message}
`;

    }

}


// ======================================================
// CREAR CLIENTE
// ======================================================

async function crearCliente(
    nombre,
    telefono,
    tipo = "Normal"
) {

    nombre =
        String(
            nombre || ""
        ).trim();

    telefono =
        limpiarTelefono(
            telefono
        );


    if (!nombre || !telefono) {

        return `
➕ *CREAR CLIENTE*

Formato:

crear cliente | Nombre | Teléfono

Ejemplo:

crear cliente | Juan Pérez | 6621234567
`;

    }


    try {

        const clientesDatos =
            await apiFetch(
                "/api/clientes"
            );


        const clientes =
            clientesDatos.clientes || [];


        const existente =
            clientes.find(
                cliente =>
                    limpiarTelefono(
                        cliente.telefono
                    ) === telefono
            );


        if (existente) {

            return `
⚠️ *EL CLIENTE YA EXISTE*

👤 ${existente.nombre}
📱 ${existente.telefono}
🆔 ${existente._id}
`;

        }


        const datos =
            await apiFetch(
                "/api/clientes",
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            nombre,

                            telefono,

                            tipo

                        })

                }
            );


        const cliente =
            datos.cliente || {};


        return `
✅ *CLIENTE CREADO*

👤 ${cliente.nombre || nombre}
📱 ${cliente.telefono || telefono}
📋 Tipo: ${cliente.tipo || tipo}
🆔 ${cliente._id || "---"}
`;

    } catch (error) {

        return `
❌ No se pudo crear el cliente.

${error.message}
`;

    }

}


// ======================================================
// ELIMINAR CLIENTE
// ======================================================

async function prepararEliminarCliente(
    busqueda
) {

    const termino =
        String(
            busqueda || ""
        ).trim().toLowerCase();


    if (!termino) {

        return `
🗑️ *ELIMINAR CLIENTE*

Formato:

eliminar cliente | Nombre

o:

eliminar cliente | Teléfono
`;

    }


    try {

        const datos =
            await apiFetch(
                "/api/clientes"
            );


        const clientes =
            datos.clientes || [];


        const terminoTelefono =
            limpiarTelefono(
                termino
            );


        const encontrados =
            clientes.filter(
                cliente => {

                    const nombre =
                        String(
                            cliente.nombre || ""
                        ).toLowerCase();


                    const telefono =
                        limpiarTelefono(
                            cliente.telefono
                        );


                    return (

                        nombre === termino

                        ||

                        telefono ===
                        terminoTelefono

                    );

                }
            );


        if (!encontrados.length) {

            return `
❌ No encontré el cliente:

${busqueda}
`;

        }


        if (encontrados.length > 1) {

            return `
⚠️ Encontré varios clientes.

Usa el teléfono exacto para eliminarlo:

eliminar cliente | 6621234567
`;

        }


        const cliente =
            encontrados[0];


        eliminacionPendiente =
            cliente;


        return `
⚠️ *CONFIRMAR ELIMINACIÓN*

👤 ${cliente.nombre}
📱 ${cliente.telefono}
📋 Reservas: ${cliente.reservas || 0}

Esta acción puede ser permanente.

Escribe:

*CONFIRMAR*

o:

*CANCELAR*
`;

    } catch (error) {

        return `
❌ Error buscando el cliente.

${error.message}
`;

    }

}


let eliminacionPendiente = null;


// ======================================================
// CONFIRMAR ELIMINACIÓN
// ======================================================

async function confirmarEliminacion() {

    if (!eliminacionPendiente) {

        return `
ℹ️ No hay ninguna eliminación pendiente.
`;

    }


    const cliente =
        eliminacionPendiente;


    eliminacionPendiente =
        null;


    try {

        const datos =
            await apiFetch(
                `/api/clientes/${cliente._id}`,
                {
                    method: "DELETE"
                }
            );


        if (!datos.ok) {

            throw new Error(
                datos.mensaje ||
                "No se pudo eliminar"
            );

        }


        return `
✅ *CLIENTE ELIMINADO*

👤 ${cliente.nombre}
📱 ${cliente.telefono}
`;

    } catch (error) {

        return `
❌ No se pudo eliminar el cliente.

${error.message}
`;

    }

}


// ======================================================
// PAGOS
// ======================================================

async function consultarPagos() {

    try {

        const datos =
            await apiFetch(
                "/api/pagos"
            );


        const pagos =
            datos.pagos || [];


        if (!pagos.length) {

            return "💰 No hay pagos registrados.";

        }


        let total =
            0;


        let mensaje =
            `💰 *PAGOS (${pagos.length})*\n\n`;


        pagos
            .slice(
                0,
                30
            )
            .forEach(
                (pago, index) => {

                    const monto =
                        Number(
                            pago.monto || 0
                        );


                    total +=
                        monto;


                    mensaje +=
                        `*${index + 1}. ${pago.nombreCliente || "Cliente"}*\n`;

                    mensaje +=
                        `💵 ${dinero(monto)}\n`;

                    mensaje +=
                        `💳 ${pago.metodo || "---"}\n`;

                    mensaje +=
                        `📋 ${pago.tipoPago || "---"}\n`;

                    mensaje +=
                        `📅 ${fecha(pago.fechaPago)}\n\n`;

                }
            );


        mensaje +=
            `💵 *TOTAL: ${dinero(total)}*`;


        return mensaje;

    } catch (error) {

        return `
❌ No se pudieron cargar los pagos.

${error.message}
`;

    }

}


// ======================================================
// INVENTARIO
// ======================================================

async function consultarInventario() {

    try {

        const datos =
            await apiFetch(
                "/api/inventario"
            );


        const inventario =
            datos.inventario ||
            datos.items ||
            [];


        if (!inventario.length) {

            return "📦 No hay elementos de inventario registrados.";

        }


        let mensaje =
            `📦 *INVENTARIO (${inventario.length})*\n\n`;


        inventario
            .slice(
                0,
                50
            )
            .forEach(
                (item, index) => {

                    mensaje +=
                        `*${index + 1}. ${item.nombre || item.nombreItem || "Artículo"}*\n`;

                    mensaje +=
                        `🔢 Cantidad: ${item.cantidad ?? item.stock ?? 0}\n`;

                    if (
                        item.departamento
                    ) {

                        mensaje +=
                            `🏠 ${item.departamento}\n`;

                    }

                    mensaje += "\n";

                }
            );


        return mensaje;

    } catch (error) {

        return `
❌ No se pudo cargar el inventario.

${error.message}
`;

    }

}


// ======================================================
// LIMPIEZA
// ======================================================

async function consultarLimpieza() {

    try {

        const datos =
            await apiFetch(
                "/api/limpieza"
            );


        const tareas =
            datos.tareas ||
            datos.limpiezas ||
            [];


        if (!tareas.length) {

            return "🧹 No hay tareas de limpieza registradas.";

        }


        let mensaje =
            `🧹 *LIMPIEZA (${tareas.length})*\n\n`;


        tareas
            .slice(
                0,
                50
            )
            .forEach(
                (tarea, index) => {

                    mensaje +=
                        `*${index + 1}. ${tarea.departamento || tarea.departamentoNombre || "Departamento"}*\n`;

                    mensaje +=
                        `📌 ${tarea.estado || "Sin estado"}\n`;

                    if (
                        tarea.fecha
                    ) {

                        mensaje +=
                            `📅 ${fecha(tarea.fecha)}\n`;

                    }

                    mensaje += "\n";

                }
            );


        return mensaje;

    } catch (error) {

        return `
❌ No se pudo cargar limpieza.

${error.message}
`;

    }

}


// ======================================================
// CONFIGURACIÓN
// ======================================================

async function consultarConfiguracion() {

    try {

        const datos =
            await apiFetch(
                "/api/configuracion"
            );


        const configuracion =
            datos.configuracion || {};


        const precios =
            configuracion.precios || {};


        let mensaje =
            "⚙️ *CONFIGURACIÓN*\n\n";


        mensaje +=
            `🖼️ Logo: ${configuracion.logo || "---"}\n\n`;


        mensaje +=
            "*💰 PRECIOS*\n";


        Object.entries(
            precios
        ).forEach(
            ([nombre, precio]) => {

                mensaje +=
                    `• ${nombre}: ${dinero(precio)}\n`;

            }
        );


        mensaje += "\n*📋 REGLAS*\n";


        const reglas =
            configuracion.reglas || [];


        if (!reglas.length) {

            mensaje +=
                "No hay reglas.\n";

        } else {

            reglas.forEach(
                regla => {

                    mensaje +=
                        `${regla.activa ? "🟢" : "⚪"} ${regla.titulo}\n`;

                    mensaje +=
                        `${regla.descripcion || ""}\n\n`;

                }
            );

        }


        return mensaje;

    } catch (error) {

        return `
❌ No se pudo cargar la configuración.

${error.message}
`;

    }

}


// ======================================================
// DOCUMENTOS
// ======================================================

async function consultarDocumentos() {

    try {

        const datos =
            await apiFetch(
                "/api/documentos"
            );


        const documentos =
            datos.documentos || [];


        if (!documentos.length) {

            return "📄 No hay documentos registrados.";

        }


        let mensaje =
            `📄 *DOCUMENTOS (${documentos.length})*\n\n`;


        documentos
            .slice(
                0,
                30
            )
            .forEach(
                (documento, index) => {

                    mensaje +=
                        `*${index + 1}. ${documento.titulo || "Documento"}*\n`;

                    mensaje +=
                        `📋 Folio: ${documento.folio || "---"}\n`;

                    mensaje +=
                        `👤 ${documento.clienteNombre || "---"}\n`;

                    mensaje +=
                        `🏠 ${documento.departamento || "---"}\n`;

                    mensaje +=
                        `💰 ${dinero(documento.total)}\n\n`;

                }
            );


        return mensaje;

    } catch (error) {

        return `
❌ No se pudieron cargar los documentos.

${error.message}
`;

    }

}


// ======================================================
// FORMULARIO
// ======================================================

function obtenerEnlaceFormulario() {

    return `${API_URL}/formulario-reserva.html`;

}
// ======================================================
// ENVIAR FORMULARIO
// ======================================================

async function enviarFormulario(
    client,
    chatId,
    busqueda
) {

    const termino =
        String(
            busqueda || ""
        ).trim();


    if (!termino) {

        return `
📲 *ENVIAR FORMULARIO*

Ejemplos:

Enviar formulario | 6621234567

Enviar formulario | Juan Pérez
`;

    }


    // ==========================================
    // BUSCAR TELÉFONO O CLIENTE
    // ==========================================

    let telefono =
        limpiarTelefono(
            termino
        );


    if (!telefono) {

        try {

            const datos =
                await apiFetch(
                    "/api/clientes"
                );


            const clientes =
                datos.clientes || [];


            const encontrados =
                clientes.filter(
                    cliente =>
                        String(
                            cliente.nombre || ""
                        )
                        .toLowerCase()
                        .includes(
                            termino.toLowerCase()
                        )
                );


            if (!encontrados.length) {

                return `
❌ No encontré ningún cliente llamado:

*${termino}*
`;

            }


            if (encontrados.length > 1) {

                return `
⚠️ Encontré varios clientes con ese nombre.

Usa el teléfono:

Enviar formulario | 6621234567
`;

            }


            telefono =
                limpiarTelefono(
                    encontrados[0].telefono
                );


        } catch (error) {

            console.error(
                "Error buscando cliente:",
                error
            );


            return `
❌ No se pudo buscar el cliente.

${error.message}
`;

        }

    }


    if (!telefono) {

        return `
❌ El cliente no tiene un teléfono válido.
`;

    }


    // ==========================================
    // AGREGAR CÓDIGO DE PAÍS
    // ==========================================

    if (
        telefono.length === 10
    ) {

        telefono =
            "52" +
            telefono;

    }


    // ==========================================
    // FORMULARIO
    // ==========================================

    const enlace =
        obtenerEnlaceFormulario();


    const mensaje =
        `🏖️ *Departamentos Diamantes de Kino*

Hola, te comparto el formulario para realizar tu reserva:

${enlace}

Por favor llena todos los datos solicitados.`;


    try {

        console.log(
            "📱 Intentando enviar formulario a:",
            telefono
        );


        // ======================================
        // COMPROBAR NÚMERO
        // ======================================

        let numeroValido = null;


        try {

            numeroValido =
                await client.checkNumberStatus(
                    `${telefono}@c.us`
                );

        } catch (error) {

            console.log(
                "⚠️ checkNumberStatus no pudo comprobar el número:"
            );

            console.log(
                error.message
            );

        }


        console.log(
            "📱 Estado del número:",
            numeroValido
        );


        // ======================================
        // OBTENER ID REAL DE WHATSAPP
        // ======================================

        let destino =
            `${telefono}@c.us`;


        if (
            numeroValido &&
            numeroValido.id
        ) {

            destino =
                numeroValido.id._serialized ||
                numeroValido.id;

        }


        console.log(
            "📨 Destino utilizado:",
            destino
        );


        // ======================================
        // ENVIAR
        // ======================================

        await client.sendText(
            destino,
            mensaje
        );


        console.log(
            "✅ Formulario enviado correctamente a:",
            telefono
        );


        return `
✅ *FORMULARIO ENVIADO*

📱 ${telefono}

🔗 ${enlace}
`;


    } catch (error) {

        console.error(
            "❌ Error enviando formulario:",
            error
        );


        return `
❌ No se pudo enviar el formulario.

📱 Número:
${telefono}

⚠️ WhatsApp no pudo resolver este contacto.

${error.message}
`;

    }

}

// ======================================================
// PROCESAR COMANDOS
// ======================================================

async function procesarMensaje(
    client,
    message
) {

    const texto =
        String(
            message.body || ""
        ).trim();


    if (!texto) {
        return;
    }


    const minusculas =
        texto.toLowerCase();


    // ==========================================
    // CONFIRMAR / CANCELAR ELIMINACIÓN
    // ==========================================

    if (
        minusculas === "confirmar"
    ) {

        return confirmarEliminacion();

    }


    if (
        minusculas === "cancelar"
    ) {

        eliminacionPendiente =
            null;

        return "❌ Eliminación cancelada.";

    }


    // ==========================================
    // MENÚ
    // ==========================================

    if (
        [
            "menu",
            "menú",
            "inicio",
            "ayuda",
            "help"
        ].includes(
            minusculas
        )
    ) {

        return menu();

    }


    // ==========================================
    // NÚMEROS DEL MENÚ
    // ==========================================

    if (minusculas === "1") {
        return consultarPanel();
    }

    if (minusculas === "2") {
        return consultarDepartamentos();
    }

    if (minusculas === "3") {
        return consultarReservas();
    }

    if (minusculas === "4") {
        return consultarClientes();
    }

    if (minusculas === "5") {
        return consultarPagos();
    }

    if (minusculas === "6") {
        return consultarInventario();
    }

    if (minusculas === "7") {
        return consultarLimpieza();
    }

    if (minusculas === "8") {
        return consultarConfiguracion();
    }

    if (minusculas === "9") {
        return consultarDocumentos();
    }

    if (minusculas === "10") {

        return `
📝 *FORMULARIO DE RESERVA*

🔗 ${obtenerEnlaceFormulario()}

Para enviarlo:

enviar formulario | teléfono

o:

enviar formulario | nombre
`;

    }


    // ==========================================
    // CONSULTAS
    // ==========================================

    if (
        [
            "panel",
            "panel de control",
            "resumen"
        ].includes(
            minusculas
        )
    ) {

        return consultarPanel();

    }


    if (
        [
            "departamentos",
            "departamento"
        ].includes(
            minusculas
        )
    ) {

        return consultarDepartamentos();

    }


    if (
        [
            "reservas",
            "reserva"
        ].includes(
            minusculas
        )
    ) {

        return consultarReservas();

    }


    if (
        [
            "clientes",
            "cliente"
        ].includes(
            minusculas
        )
    ) {

        return consultarClientes();

    }


    if (
        [
            "pagos",
            "pago"
        ].includes(
            minusculas
        )
    ) {

        return consultarPagos();

    }


    if (
        [
            "inventario"
        ].includes(
            minusculas
        )
    ) {

        return consultarInventario();

    }


    if (
        [
            "limpieza"
        ].includes(
            minusculas
        )
    ) {

        return consultarLimpieza();

    }


    if (
        [
            "configuracion",
            "configuración"
        ].includes(
            minusculas
        )
    ) {

        return consultarConfiguracion();

    }


    if (
        [
            "documentos",
            "documento"
        ].includes(
            minusculas
        )
    ) {

        return consultarDocumentos();

    }


    if (
        [
            "formulario",
            "link formulario",
            "enlace formulario"
        ].includes(
            minusculas
        )
    ) {

        return `
📝 *FORMULARIO DE RESERVA*

🔗 ${obtenerEnlaceFormulario()}
`;

    }


    // ==========================================
    // BUSCAR CLIENTE
    // ==========================================

    if (
        minusculas.startsWith(
            "buscar cliente"
        )
    ) {

        const partes =
            texto.split("|");


        const busqueda =
            partes
                .slice(1)
                .join("|")
                .trim();


        return buscarCliente(
            busqueda
        );

    }


    // ==========================================
    // CREAR CLIENTE
    // ==========================================

    if (
        minusculas.startsWith(
            "crear cliente"
        )
    ) {

        const partes =
            texto.split("|");


        const nombre =
            partes[1]
                ? partes[1].trim()
                : "";


        const telefono =
            partes[2]
                ? partes[2].trim()
                : "";


        const tipo =
            partes[3]
                ? partes[3].trim()
                : "Normal";


        return crearCliente(
            nombre,
            telefono,
            tipo
        );

    }


    // ==========================================
    // ELIMINAR CLIENTE
    // ==========================================

    if (
        minusculas.startsWith(
            "eliminar cliente"
        )
    ) {

        const partes =
            texto.split("|");


        const busqueda =
            partes
                .slice(1)
                .join("|")
                .trim();


        return prepararEliminarCliente(
            busqueda
        );

    }


    // ==========================================
    // ENVIAR FORMULARIO
    // ==========================================

    if (
        minusculas.startsWith(
            "enviar formulario"
        )
    ) {

        const partes =
            texto.split("|");


        const busqueda =
            partes
                .slice(1)
                .join("|")
                .trim();


        return enviarFormulario(
            client,
            message.from,
            busqueda
        );

    }


    // ==========================================
    // COMANDO NO RECONOCIDO
    // ==========================================

    return `
❓ No reconocí ese comando.

Escribe:

*menu*

para ver todas las opciones.
`;

}


// ======================================================
// CONECTAR WHATSAPP
// ======================================================

wppconnect
    .create({

        session:
            "departamentos-kino",

        catchQR:
            (
                base64Qr,
                asciiQR
            ) => {

                console.log(
                    asciiQR
                );

            },

        statusFind:
            (
                statusSession
            ) => {

                console.log(
                    "Estado WhatsApp:",
                    statusSession
                );

            },

        headless:
            true,

        logQR:
            true,

        autoClose:
            0,

        browserArgs: [

            "--no-sandbox",

            "--disable-setuid-sandbox"

        ]

    })

    .then(
        client => {

            console.log(
                "✅ WhatsApp conectado correctamente."
            );


            client.onMessage(
                async message => {

                    try {

                        console.log(
                            "📩 Mensaje recibido:",
                            message.body
                        );


                        /*
                         * Evitar responder mensajes
                         * enviados por el propio sistema.
                         */

                        if (
                            message.fromMe
                        ) {

                            return;

                        }


                        const respuesta =
                            await procesarMensaje(
                                client,
                                message
                            );


                        if (
                            respuesta
                        ) {

                            await client.sendText(
                                message.from,
                                respuesta
                            );

                        }

                    } catch (error) {

                        console.error(
                            "❌ Error procesando mensaje:",
                            error
                        );


                        try {

                            await client.sendText(
                                message.from,
                                `❌ Ocurrió un error:\n\n${error.message}`
                            );

                        } catch {}

                    }

                }
            );

        }
    )

    .catch(
        error => {

            console.error(
                "❌ Error conectando WhatsApp:",
                error
            );

        }
    );
