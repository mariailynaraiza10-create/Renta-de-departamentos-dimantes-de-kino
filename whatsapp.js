// ============================================================
// WHATSAPP - DEPARTAMENTOS DIAMANTES DE KINO
// ============================================================

require("dotenv").config();

const wppconnect = require("@wppconnect-team/wppconnect");
const axios = require("axios");

// ============================================================
// CONFIGURACIÓN
// ============================================================

const API_URL =
    process.env.API_URL ||
    "https://renta-de-departamentos-dimantes-de-kino.onrender.com";

const SESSION_NAME =
    process.env.WHATSAPP_SESSION || "departamentos-kino";

// ============================================================
// NORMALIZAR TEXTO
// ============================================================

function normalizarTexto(texto) {
    return String(texto || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

// ============================================================
// TELÉFONOS
// ============================================================

function limpiarTelefono(numero) {
    return String(numero || "").replace(/\D/g, "");
}

function telefonoValido(numero) {
    const telefono = limpiarTelefono(numero);

    return (
        telefono.length === 10 ||
        telefono.length === 12 ||
        telefono.length === 13
    );
}

function convertirAWhatsApp(numero) {
    let telefono = limpiarTelefono(numero);

    // México: 10 dígitos
    if (telefono.length === 10) {
        telefono = "52" + telefono;
    }

    // Formato antiguo 521XXXXXXXXXX
    if (
        telefono.length === 13 &&
        telefono.startsWith("521")
    ) {
        telefono = "52" + telefono.substring(3);
    }

    return telefono + "@c.us";
}

// ============================================================
// FECHA ACTUAL DE MÉXICO
// ============================================================

function obtenerFechaActualMexico() {
    const ahora = new Date();

    const partes = new Intl.DateTimeFormat("es-MX", {
        timeZone: "America/Hermosillo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).formatToParts(ahora);

    const valores = {};

    for (const parte of partes) {
        valores[parte.type] = parte.value;
    }

    return {
        dia: Number(valores.day),
        mes: Number(valores.month),
        anio: Number(valores.year)
    };
}

// ============================================================
// CREAR FECHA ISO
// ============================================================

function crearFechaISO(dia, mes, anio) {
    if (!anio) {
        anio = obtenerFechaActualMexico().anio;
    }

    if (anio < 100) {
        anio += 2000;
    }

    const fecha = new Date(anio, mes - 1, dia);

    if (
        fecha.getFullYear() !== anio ||
        fecha.getMonth() !== mes - 1 ||
        fecha.getDate() !== dia
    ) {
        return null;
    }

    return (
        anio +
        "-" +
        String(mes).padStart(2, "0") +
        "-" +
        String(dia).padStart(2, "0")
    );
}

// ============================================================
// MESES
// ============================================================

const MESES = {
    enero: 1,
    febrero: 2,
    marzo: 3,
    abril: 4,
    mayo: 5,
    junio: 6,
    julio: 7,
    agosto: 8,
    septiembre: 9,
    setiembre: 9,
    octubre: 10,
    noviembre: 11,
    diciembre: 12
};

// ============================================================
// EXTRAER FECHA
// ============================================================

function extraerFecha(texto) {
    const original = normalizarTexto(texto);

    let match;

    // ----------------------------------------------------------
    // 25/08/2026
    // 25-08-2026
    // 25.08.2026
    // ----------------------------------------------------------

    match = original.match(
        /(?:^|\s|\|)(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})(?=\s|$)/
    );

    if (match) {
        return crearFechaISO(
            Number(match[1]),
            Number(match[2]),
            Number(match[3])
        );
    }

    // ----------------------------------------------------------
    // 25/08
    // 25-08
    // 25.08
    // ----------------------------------------------------------

    match = original.match(
        /(?:^|\s|\|)(\d{1,2})[\/\-.](\d{1,2})(?=\s|$)/
    );

    if (match) {
        const dia = Number(match[1]);
        const mes = Number(match[2]);

        const actual = obtenerFechaActualMexico();

        let anio = actual.anio;

        let fecha = crearFechaISO(
            dia,
            mes,
            anio
        );

        if (fecha) {
            const fechaObj = new Date(
                fecha + "T00:00:00"
            );

            const hoy = new Date(
                actual.anio +
                "-" +
                String(actual.mes).padStart(2, "0") +
                "-" +
                String(actual.dia).padStart(2, "0") +
                "T00:00:00"
            );

            // Si ya pasó este año, usamos el próximo
            if (fechaObj < hoy) {
                anio++;
                fecha = crearFechaISO(
                    dia,
                    mes,
                    anio
                );
            }
        }

        return fecha;
    }

    // ----------------------------------------------------------
    // 25 de agosto
    // 25 de agosto de 2026
    // ----------------------------------------------------------

    match = original.match(
        /(\d{1,2})\s+de\s+([a-z]+)(?:\s+de\s+(\d{2,4}))?/
    );

    if (match) {
        const dia = Number(match[1]);
        const mes = MESES[match[2]];

        if (!mes) {
            return null;
        }

        const actual = obtenerFechaActualMexico();

        let anio = match[3]
            ? Number(match[3])
            : actual.anio;

        if (anio < 100) {
            anio += 2000;
        }

        let fecha = crearFechaISO(
            dia,
            mes,
            anio
        );

        // Si no especificaron año y la fecha ya pasó,
        // usamos el siguiente año.
        if (fecha && !match[3]) {
            const fechaObj = new Date(
                fecha + "T00:00:00"
            );

            const hoy = new Date(
                actual.anio +
                "-" +
                String(actual.mes).padStart(2, "0") +
                "-" +
                String(actual.dia).padStart(2, "0") +
                "T00:00:00"
            );

            if (fechaObj < hoy) {
                fecha = crearFechaISO(
                    dia,
                    mes,
                    anio + 1
                );
            }
        }

        return fecha;
    }

    return null;
}

// ============================================================
// FORMATEAR FECHA
// ============================================================

function formatearFecha(fecha) {
    if (!fecha) {
        return "sin fecha";
    }

    const partes = String(fecha).split("-");

    if (partes.length !== 3) {
        return fecha;
    }

    const fechaObj = new Date(
        Number(partes[0]),
        Number(partes[1]) - 1,
        Number(partes[2])
    );

    return fechaObj.toLocaleDateString(
        "es-MX",
        {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );
}

// ============================================================
// CONSULTAR DISPONIBILIDAD
// ============================================================

async function consultarDisponibilidad(fecha) {
    let url = API_URL + "/api/disponibilidad";

    if (fecha) {
        url +=
            "?fecha=" +
            encodeURIComponent(fecha);
    }

    console.log("🔎 Consultando:", url);

    const respuesta = await axios.get(
        url,
        {
            timeout: 30000
        }
    );

    return respuesta.data;
}

// ============================================================
// RESPUESTA DE DISPONIBILIDAD
// ============================================================

function construirRespuestaDisponibilidad(
    datos,
    fecha
) {
    if (!datos || datos.ok !== true) {
        return "❌ No pude consultar la disponibilidad.";
    }

    let mensaje =
        "🏖️ *DEPARTAMENTOS DIAMANTES DE KINO*\n\n";

    if (fecha) {
        mensaje +=
            "📅 *Fecha:* " +
            formatearFecha(fecha) +
            "\n\n";
    } else {
        mensaje +=
            "📅 *Disponibilidad actual*\n\n";
    }

    mensaje +=
        "🏠 Disponibles: *" +
        datos.disponibles +
        " de " +
        datos.total +
        "*\n\n";

    const departamentos =
        Array.isArray(datos.departamentos)
            ? datos.departamentos
            : [];

    if (departamentos.length === 0) {
        mensaje +=
            "No hay departamentos registrados.";

        return mensaje;
    }

    for (const departamento of departamentos) {
        const nombre =
            departamento.nombre ||
            departamento.codigo ||
            "Departamento";

        const precio = Number(
            departamento.precioNoche || 0
        );

        if (departamento.disponible) {
            mensaje +=
                "🟢 *" +
                nombre +
                "* — Disponible";

            if (precio > 0) {
                mensaje +=
                    " — $" +
                    precio.toLocaleString("es-MX") +
                    "/noche";
            }

            mensaje += "\n";
        } else {
            mensaje +=
                "🔴 *" +
                nombre +
                "* — No disponible\n";
        }
    }

    return mensaje.trim();
}

// ============================================================
// BUSCAR CLIENTE
// ============================================================

async function obtenerClientes() {
    try {
        const respuesta = await axios.get(
            API_URL + "/api/clientes",
            {
                timeout: 30000
            }
        );

        if (
            Array.isArray(
                respuesta.data?.clientes
            )
        ) {
            return respuesta.data.clientes;
        }

        if (Array.isArray(respuesta.data)) {
            return respuesta.data;
        }

        return [];
    } catch (error) {
        console.error(
            "❌ Error obteniendo clientes:",
            error.message
        );

        return [];
    }
}

async function buscarClientePorTelefono(
    telefono
) {
    const clientes = await obtenerClientes();

    const buscado =
        limpiarTelefono(telefono).slice(-10);

    return (
        clientes.find(cliente => {
            const telefonoCliente =
                limpiarTelefono(
                    cliente.telefono
                ).slice(-10);

            return (
                telefonoCliente === buscado
            );
        }) || null
    );
}

// ============================================================
// ENVIAR PAGO
// ============================================================

async function enviarPago(
    client,
    numero
) {
    if (!telefonoValido(numero)) {
        return {
            ok: false,
            mensaje:
                "❌ El número no parece válido."
        };
    }

    const telefono =
        limpiarTelefono(numero);

    const chatId =
        convertirAWhatsApp(telefono);

    console.log(
        "📤 Enviando pago a:",
        chatId
    );

    // Buscar cliente únicamente para obtener
    // su nombre. NO es obligatorio.
    const cliente =
        await buscarClientePorTelefono(
            telefono
        );

    let mensaje =
        "💳 *PAGO - DEPARTAMENTOS DIAMANTES DE KINO*\n\n";

    if (
        cliente &&
        cliente.nombre
    ) {
        mensaje +=
            "Hola *" +
            cliente.nombre +
            "*.\n\n";
    } else {
        mensaje +=
            "Hola.\n\n";
    }

    mensaje +=
        "Te compartimos la información para realizar tu pago.\n\n";

    mensaje +=
        "Si ya realizaste el pago, por favor envía tu comprobante por este medio.\n\n";

    mensaje +=
        "🏖️ *Departamentos Diamantes de Kino*";

    try {
        await client.sendText(
            chatId,
            mensaje
        );

        return {
            ok: true,
            telefono: telefono,
            cliente: cliente
                ? cliente.nombre
                : null
        };

    } catch (error) {
        console.error(
            "❌ Error enviando pago:",
            error.message
        );

        return {
            ok: false,
            mensaje:
                "❌ No se pudo enviar el mensaje a ese número.",
            error: error.message
        };
    }
}

// ============================================================
// MENÚ PRINCIPAL
// ============================================================

function mensajeMenu() {
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

📅 *DISPONIBILIDAD*

Puedes escribir:

• disponibilidad
• disponibilidad 25/08
• disponibilidad 25-08
• disponibilidad 25/08/26
• disponibilidad 25-08-26
• disponibilidad 25/08/2026
• disponibilidad 25 de agosto
• disponibilidad 25 de agosto de 2026
• disponibilidad | 25/08/2026

💳 *ENVIAR PAGO*

• enviar pago a 6621234567
• enviar pago al 6621234567
• enviar pago a +52 662 123 4567
• enviar pago al +52 662 123 4567
• enviar pago a 662-123-4567

El número no necesita estar guardado como cliente.

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

🔎 *Buscar:*
*buscar cliente | Juan Pérez*

➕ *Crear:*
*crear cliente | Juan Pérez | 6621234567*

🗑️ *Eliminar:*
*eliminar cliente | 6621234567*

📲 *Enviar formulario:*
*enviar formulario | 6621234567*
`.trim();
}

// ============================================================
// PROCESAR DISPONIBILIDAD
// ============================================================

async function procesarDisponibilidad(
    client,
    message
) {
    const cuerpo =
        String(message.body || "").trim();

    const texto =
        normalizarTexto(cuerpo);

    const fecha =
        extraerFecha(texto);

    const contieneNumero =
        /\d/.test(texto);

    if (
        contieneNumero &&
        !fecha
    ) {
        await client.sendText(
            message.from,
            `❌ No pude interpretar la fecha.

Ejemplos:

• disponibilidad 25/08
• disponibilidad 25-08-26
• disponibilidad 25/08/2026
• disponibilidad 25 de agosto`
        );

        return;
    }

    await client.sendText(
        message.from,
        "🔎 Consultando disponibilidad..."
    );

    try {
        const datos =
            await consultarDisponibilidad(
                fecha
            );

        const respuesta =
            construirRespuestaDisponibilidad(
                datos,
                fecha
            );

        await client.sendText(
            message.from,
            respuesta
        );

    } catch (error) {
        console.error(
            "❌ Error consultando disponibilidad:",
            error.message
        );

        await client.sendText(
            message.from,
            `❌ No pude conectarme con el sistema de departamentos.

Intenta nuevamente en unos segundos.`
        );
    }
}

// ============================================================
// PROCESAR ENVIAR PAGO
// ============================================================

async function procesarEnviarPago(
    client,
    message
) {
    const texto =
        String(message.body || "").trim();

    const match =
        texto.match(
            /^enviar\s+pago\s+a(?:l)?\s+(.+)$/i
        );

    if (!match) {
        await client.sendText(
            message.from,
            `❌ Especifica el número.

Ejemplo:

*enviar pago a 6621234567*`
        );

        return;
    }

    const numero =
        match[1].trim();

    if (!telefonoValido(numero)) {
        await client.sendText(
            message.from,
            `❌ El número no parece válido.

Ejemplo:

*enviar pago a 6621234567*`
        );

        return;
    }

    await client.sendText(
        message.from,
        "📤 Enviando información de pago a *" +
        numero +
        "*..."
    );

    const resultado =
        await enviarPago(
            client,
            numero
        );

    if (resultado.ok) {
        let respuesta =
            "✅ *Pago enviado correctamente.*\n\n" +
            "📱 Número: *" +
            numero +
            "*";

        if (resultado.cliente) {
            respuesta +=
                "\n👤 Cliente: *" +
                resultado.cliente +
                "*";
        } else {
            respuesta +=
                "\n👤 El número no estaba registrado como cliente.";
        }

        await client.sendText(
            message.from,
            respuesta
        );

    } else {
        await client.sendText(
            message.from,
            resultado.mensaje ||
            "❌ No se pudo enviar el mensaje."
        );
    }
}

// ============================================================
// PROCESAR COMANDOS GENERALES
// ============================================================

async function procesarComandoGeneral(
    client,
    message,
    texto
) {
    // --------------------------------------------------------
    // PANEL
    // --------------------------------------------------------

    if (texto === "panel") {
        await client.sendText(
            message.from,
            "📊 *PANEL DE CONTROL*\n\nConsulta el panel de control desde el sistema de administración."
        );
        return true;
    }

    // --------------------------------------------------------
    // DEPARTAMENTOS
    // --------------------------------------------------------

    if (
        texto === "departamentos" ||
        texto === "departamento"
    ) {
        await client.sendText(
            message.from,
            "🏠 *DEPARTAMENTOS*\n\nPuedes consultar la disponibilidad escribiendo:\n\n*disponibilidad*"
        );
        return true;
    }

    // --------------------------------------------------------
    // RESERVAS
    // --------------------------------------------------------

    if (
        texto === "reservas" ||
        texto === "reserva"
    ) {
        await client.sendText(
            message.from,
            "📅 *RESERVAS*\n\nConsulta las reservas desde el sistema de administración."
        );
        return true;
    }

    // --------------------------------------------------------
    // CLIENTES
    // --------------------------------------------------------

    if (
        texto === "clientes" ||
        texto === "cliente"
    ) {
        await client.sendText(
            message.from,
            `👥 *CLIENTES*

Puedes utilizar:

🔎 *buscar cliente | Juan Pérez*

➕ *crear cliente | Juan Pérez | 6621234567*

🗑️ *eliminar cliente | 6621234567*`
        );
        return true;
    }

    // --------------------------------------------------------
    // PAGOS
    // --------------------------------------------------------

    if (
        texto === "pagos" ||
        texto === "pago"
    ) {
        await client.sendText(
            message.from,
            `💳 *PAGOS*

Para enviar información de pago:

*enviar pago a 6621234567*

También puedes utilizar:

*enviar pago al +52 662 123 4567*`
        );
        return true;
    }

    // --------------------------------------------------------
    // INVENTARIO
    // --------------------------------------------------------

    if (texto === "inventario") {
        await client.sendText(
            message.from,
            "📦 *INVENTARIO*\n\nConsulta el inventario desde el sistema de administración."
        );
        return true;
    }

    // --------------------------------------------------------
    // LIMPIEZA
    // --------------------------------------------------------

    if (texto === "limpieza") {
        await client.sendText(
            message.from,
            "🧹 *LIMPIEZA*\n\nConsulta las tareas de limpieza desde el sistema."
        );
        return true;
    }

    // --------------------------------------------------------
    // CONFIGURACIÓN
    // --------------------------------------------------------

    if (
        texto === "configuracion" ||
        texto === "configuración"
    ) {
        await client.sendText(
            message.from,
            "⚙️ *CONFIGURACIÓN*\n\nConsulta la configuración desde el sistema de administración."
        );
        return true;
    }

    // --------------------------------------------------------
    // DOCUMENTOS
    // --------------------------------------------------------

    if (texto === "documentos") {
        await client.sendText(
            message.from,
            "📄 *DOCUMENTOS*\n\nConsulta los documentos desde el sistema de administración."
        );
        return true;
    }

    // --------------------------------------------------------
    // FORMULARIO
    // --------------------------------------------------------

    if (
        texto === "formulario" ||
        texto === "formulario de reserva"
    ) {
        await client.sendText(
            message.from,
            `📲 *FORMULARIO DE RESERVA*

Para enviar el formulario utiliza:

*enviar formulario | 6621234567*`
        );
        return true;
    }

    return false;
}

// ============================================================
// PROCESAR MENSAJES
// ============================================================

async function procesarMensaje(
    client,
    message
) {
    try {
        // Ignorar mensajes propios
        if (message.fromMe) {
            return;
        }

        // Ignorar grupos
        if (
            message.isGroupMsg ||
            String(message.from || "")
                .endsWith("@g.us")
        ) {
            return;
        }

        const cuerpo =
            String(message.body || "").trim();

        if (!cuerpo) {
            return;
        }

        const texto =
            normalizarTexto(cuerpo);

        console.log(
            "📩 WhatsApp:",
            cuerpo
        );

        // ====================================================
        // MENÚ
        // ====================================================

        if (
            texto === "ayuda" ||
            texto === "comandos" ||
            texto === "menu"
        ) {
            await client.sendText(
                message.from,
                mensajeMenu()
            );

            return;
        }

        // ====================================================
        // DISPONIBILIDAD
        // ====================================================

        if (
            /^disponibilidad\b/i.test(
                cuerpo
            )
        ) {
            await procesarDisponibilidad(
                client,
                message
            );

            return;
        }

        // ====================================================
        // ENVIAR PAGO
        // ====================================================

        if (
            /^enviar\s+pago\b/i.test(
                cuerpo
            )
        ) {
            await procesarEnviarPago(
                client,
                message
            );

            return;
        }

        // ====================================================
        // SALUDOS
        // ====================================================

        if (
            texto === "hola" ||
            texto === "buenas" ||
            texto === "buenos dias" ||
            texto === "buenas tardes" ||
            texto === "buenas noches"
        ) {
            await client.sendText(
                message.from,
                `👋 Hola.

🏖️ *Departamentos Diamantes de Kino*

¿Qué deseas consultar?

Escribe *menu* para ver todas las opciones.`
            );

            return;
        }

        // ====================================================
        // COMANDOS GENERALES
        // ====================================================

        const comandoProcesado =
            await procesarComandoGeneral(
                client,
                message,
                texto
            );

        if (comandoProcesado) {
            return;
        }

    } catch (error) {
        console.error(
            "❌ Error procesando mensaje:",
            error
        );
    }
}

// ============================================================
// INICIAR WHATSAPP
// ============================================================

async function iniciarWhatsApp() {
    console.log("");

    console.log(
        "============================================="
    );

    console.log(
        "🏖️ DEPARTAMENTOS DIAMANTES DE KINO"
    );

    console.log(
        "============================================="
    );

    console.log(
        "API:",
        API_URL
    );

    console.log(
        "Sesión:",
        SESSION_NAME
    );

    console.log(
        "============================================="
    );

    console.log("");

    try {
        const client =
            await wppconnect.create({
                session: SESSION_NAME,

                catchQR: (
                    base64Qr,
                    asciiQR
                ) => {
                    console.log("");

                    console.log(
                        "============================================="
                    );

                    console.log(
                        "📱 ESCANEA ESTE QR CON WHATSAPP"
                    );

                    console.log(
                        "============================================="
                    );

                    if (asciiQR) {
                        console.log(
                            asciiQR
                        );
                    }

                    console.log(
                        "============================================="
                    );

                    console.log("");
                },

                statusFind:
                    statusSession => {
                        console.log(
                            "📱 Estado WhatsApp:",
                            statusSession
                        );
                    },

                headless: true,

                logQR: true,

                autoClose: 0,

                disableWelcome: true,

                updatesLog: true,

                browserArgs: [
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-dev-shm-usage",
                    "--disable-gpu",
                    "--no-first-run",
                    "--no-default-browser-check"
                ]
            });

        console.log("");

        console.log(
            "============================================="
        );

        console.log(
            "✅ WHATSAPP CONECTADO"
        );

        console.log(
            "============================================="
        );

        console.log("");

        // ====================================================
        // MENSAJES
        // ====================================================

        client.onMessage(
            async message => {
                await procesarMensaje(
                    client,
                    message
                );
            }
        );

        // ====================================================
        // ESTADO
        // ====================================================

        client.onStateChange(
            state => {
                console.log(
                    "🔄 Estado:",
                    state
                );
            }
        );

        // ====================================================
        // STREAM
        // ====================================================

        client.onStreamChange(
            state => {
                console.log(
                    "🌐 Stream:",
                    state
                );
            }
        );

        return client;

    } catch (error) {
        console.error("");

        console.error(
            "❌ ERROR INICIANDO WHATSAPP"
        );

        console.error(error);

        console.error("");

        console.log(
            "🔄 Reintentando en 10 segundos..."
        );

        setTimeout(
            iniciarWhatsApp,
            10000
        );
    }
}

// ============================================================
// EVITAR QUE EL PROCESO MUERA
// ============================================================

process.on(
    "uncaughtException",
    error => {
        console.error(
            "❌ uncaughtException:",
            error
        );
    }
);

process.on(
    "unhandledRejection",
    error => {
        console.error(
            "❌ unhandledRejection:",
            error
        );
    }
);

// ============================================================
// INICIAR
// ============================================================

iniciarWhatsApp();
