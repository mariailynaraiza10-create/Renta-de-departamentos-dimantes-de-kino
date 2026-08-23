// ==========================================
// CONFIGURACIÓN
// ==========================================

const API_URL = "https://renta-de-departamentos-dimantes-de-kino.onrender.com";


// ==========================================
// VARIABLES GLOBALES
// ==========================================

let todasLasReservas = [];
let clientesGlobal = [];

let fechaCalendario = new Date(2026, 7, 20);


// ==========================================
// RELOJ
// ==========================================

function actualizarFechaHora() {

    const ahora = new Date();

    const horas =
        String(ahora.getHours()).padStart(2, "0");

    const minutos =
        String(ahora.getMinutes()).padStart(2, "0");

    const segundos =
        String(ahora.getSeconds()).padStart(2, "0");

    const elementoHora =
        document.getElementById("hora");

    const elementoFecha =
        document.getElementById("fecha");


    if (elementoHora) {

        elementoHora.textContent =
            `${horas}:${minutos}:${segundos}`;

    }


    if (elementoFecha) {

        let fecha =
            ahora.toLocaleDateString(
                "es-MX",
                {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                }
            );


        fecha =
            fecha.charAt(0).toUpperCase() +
            fecha.slice(1);


        elementoFecha.textContent = fecha;

    }
}


actualizarFechaHora();

setInterval(
    actualizarFechaHora,
    1000
);


// ======================================================
// MENÚ
// ======================================================

function alternarMenu() {

    const menu =
        document.getElementById("menuLateral");

    const fondo =
        document.getElementById("fondoMenu");


    if (!menu || !fondo) {

        console.error(
            "No se encontró el menú."
        );

        return;
    }


    menu.classList.toggle("abierto");

    fondo.classList.toggle("abierto");
}


function cerrarMenu() {

    const menu =
        document.getElementById("menuLateral");

    const fondo =
        document.getElementById("fondoMenu");


    if (menu) {
        menu.classList.remove("abierto");
    }


    if (fondo) {
        fondo.classList.remove("abierto");
    }
}


// ======================================================
// UTILIDADES DE SECCIONES
// ======================================================

function obtenerSeccionesPanel() {

    return [

        document.querySelector(".resumen-seccion"),

        document.querySelector(".departamentos-seccion"),

        document.querySelector(".ocupacion-seccion"),

        document.querySelector(".reservas-seccion")

    ].filter(Boolean);
}


function ocultarContenidoPanel() {

    const secciones =
        obtenerSeccionesPanel();


    secciones.forEach(
        seccion => {
            seccion.style.display = "none";
        }
    );
}


function mostrarContenidoPanel() {

    const secciones =
        obtenerSeccionesPanel();


    secciones.forEach(
        seccion => {
            seccion.style.display = "";
        }
    );
}


// ======================================================
// INICIO / PANEL DE CONTROL
// ======================================================

function mostrarInicio() {

    const encabezado =
        document.querySelector(".encabezado");

    const calendario =
        document.getElementById("seccionCalendario");

    const reservas =
        document.getElementById("seccionReservas");

    const clientes =
        document.getElementById("seccionClientes");

const limpieza =
    document.getElementById(
        "seccionLimpieza"
    );

if (limpieza) {
    limpieza.style.display = "none";
}

    if (encabezado) {
        encabezado.style.display = "flex";
    }


    mostrarContenidoPanel();


    if (calendario) {
        calendario.style.display = "none";
    }


    if (reservas) {
        reservas.style.display = "none";
    }


    if (clientes) {
        clientes.style.display = "none";
    }


    cerrarMenu();

    cargarDepartamentos();

    actualizarResumenGeneral();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// ======================================================
// NAVEGACIÓN
// ======================================================

function irASeccion(seccion) {

    cerrarMenu();


    if (seccion === "inicio") {

        mostrarInicio();

        return;
    }


    if (seccion === "calendario") {

        mostrarCalendario();

        return;
    }


    if (seccion === "reservas") {

        mostrarReservas();

        return;
    }


    if (seccion === "clientes") {

        mostrarClientesSeccion();

        return;

    }

if (seccion === "pagos") {

    mostrarPagos();

    return;
}

if (seccion === "limpieza") {

    mostrarLimpieza();

    return;
}

if (seccion === "inventario") {

    mostrarInventario();

    return;
}

if (seccion === "documentos") {

    mostrarDocumentos();

    return;
}

if (seccion === "configuracion") {

    mostrarConfiguracion();

    return;
}

if (seccion === "formulario") {

    mostrarFormularioReserva();

    return;
}

if (seccion === "whatsapp") {

    mostrarWhatsApp();

    return;
}
}

// ======================================================
// DEPARTAMENTOS
// ======================================================

async function cargarDepartamentos() {

    const contenedor =
        document.getElementById(
            "listaDepartamentos"
        );


    if (!contenedor) {
        return;
    }


    try {

        const respuesta =
            await fetch(
                `${API_URL}/api/departamentos`
            );


        if (!respuesta.ok) {
            throw new Error(
                `HTTP ${respuesta.status}`
            );
        }


        const datos =
            await respuesta.json();


        if (!datos.ok) {

            throw new Error(
                datos.mensaje ||
                "No se pudieron obtener los departamentos"
            );
        }


        const departamentos =
            datos.departamentos || [];


        const totalElemento =
            document.getElementById(
                "totalDepartamentos"
            );


        if (totalElemento) {

            totalElemento.textContent =
                departamentos.length;

        }


        const ocupados =
            departamentos.filter(
                departamento =>
                    departamento.estado === "ocupado"
            ).length;


        const ocupadosElemento =
            document.getElementById(
                "departamentosOcupados"
            );


        if (ocupadosElemento) {

            ocupadosElemento.textContent =
                `${ocupados} ocupados`;

        }


        contenedor.innerHTML = "";


        if (departamentos.length === 0) {

            contenedor.innerHTML = `
                <div class="cargando">
                    Todavía no hay departamentos registrados.
                </div>
            `;

            crearGrafica([]);

            return;
        }


        departamentos.forEach(
            (departamento, indice) => {

                const tarjeta =
                    document.createElement("article");


                tarjeta.className =
                    "departamento-card";


                const estadoTexto =
                    obtenerTextoEstado(
                        departamento.estado
                    );


                const claseEstado =
                    obtenerClaseEstado(
                        departamento.estado
                    );


                const foto =
                    Array.isArray(
                        departamento.fotos
                    ) &&
                    departamento.fotos.length > 0
                        ? departamento.fotos[0]
                        : null;


                tarjeta.innerHTML = `

                    <div class="departamento-foto">

                        ${
                            foto
                                ? `
                                    <img
                                        src="${escapeHTML(
                                            foto
                                        )}"
                                        alt="${escapeHTML(
                                            departamento.nombre || ""
                                        )}"
                                    >
                                `
                                : `
                                    <div class="foto-vacia">
                                        📷
                                    </div>
                                `
                        }

<button
    class="btn-foto"
    onclick='abrirEditorFotos(${JSON.stringify(departamento)})'
    title="Editar fotos"
>
    📷
</button>
                    
                    </div>


                    <div class="departamento-info">

                        <span
                            class="estado ${claseEstado}"
                        >
                            ${estadoTexto}
                        </span>


                        <div class="departamento-nombre">

                            ${indice + 1}.
                            ${escapeHTML(
                                departamento.nombre || ""
                            )}

                        </div>


                        <div class="departamento-precio">

                            $${Number(
                                departamento.precioNoche || 0
                            ).toLocaleString(
                                "es-MX"
                            )}/noche

                        </div>


                        <button
                            class="btn-reservar"
                            onclick="reservarDepartamento(
                                '${departamento._id}'
                            )"
                        >
                            + Reservar
                        </button>

                    </div>

                `;


                contenedor.appendChild(
                    tarjeta
                );

            }
        );


        crearGrafica(
            departamentos
        );


    } catch (error) {

        console.error(
            "Error cargando departamentos:",
            error
        );


        contenedor.innerHTML = `

            <div class="cargando">

                ❌ No se pudieron cargar
                los departamentos.

                <br><br>

                Verifica que
                <strong>server.js</strong>
                esté ejecutándose.

            </div>

        `;
    }
}


// ======================================================
// ESTADOS DE DEPARTAMENTOS
// ======================================================

function obtenerTextoEstado(estado) {

    switch (estado) {

        case "ocupado":
            return "🔴 Ocupado";

        case "mantenimiento":
            return "🔧 Mantenimiento";

        default:
            return "🟢 Libre";
    }
}


function obtenerClaseEstado(estado) {

    switch (estado) {

        case "ocupado":
            return "estado-ocupado";

        case "mantenimiento":
            return "estado-mantenimiento";

        default:
            return "estado-libre";
    }
}


// ======================================================
// GRÁFICA DEL PANEL
// ======================================================

function crearGrafica(departamentos) {

    const contenedor =
        document.getElementById(
            "barrasGrafica"
        );


    if (!contenedor) {
        return;
    }


    contenedor.innerHTML = "";


    departamentos
        .slice(0, 6)
        .forEach(
            departamento => {

                const barra =
                    document.createElement("div");


                barra.className =
                    "barra";


                let altura = 0;


                if (
                    departamento.estado === "ocupado"
                ) {

                    altura = 25;

                }


                barra.style.height =
                    `${altura}%`;


                contenedor.appendChild(
                    barra
                );

            }
        );


    while (
        contenedor.children.length < 6
    ) {

        const barra =
            document.createElement("div");


        barra.className =
            "barra";


        barra.style.height =
            "0%";


        contenedor.appendChild(
            barra
        );

    }
}


// ======================================================
// CALENDARIO
// ======================================================

function mostrarCalendario() {

    const encabezado =
        document.querySelector(".encabezado");

    const calendario =
        document.getElementById(
            "seccionCalendario"
        );

    const reservas =
        document.getElementById(
            "seccionReservas"
        );

    const clientes =
        document.getElementById(
            "seccionClientes"
        );


    if (encabezado) {
        encabezado.style.display = "none";
    }


    ocultarContenidoPanel();


    if (calendario) {
        calendario.style.display = "block";
    }


    if (reservas) {
        reservas.style.display = "none";
    }


    if (clientes) {
        clientes.style.display = "none";
    }


    cerrarMenu();

    generarCalendario();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


function generarCalendario() {

    const grid =
        document.getElementById(
            "calendarioGrid"
        );

    const titulo =
        document.getElementById(
            "mesActual"
        );


    if (!grid || !titulo) {
        return;
    }


    grid.innerHTML = "";


    const año =
        fechaCalendario.getFullYear();

    const mes =
        fechaCalendario.getMonth();


    let nombreMes =
        fechaCalendario.toLocaleDateString(
            "es-MX",
            {
                month: "long",
                year: "numeric"
            }
        );


    nombreMes =
        nombreMes.charAt(0).toUpperCase() +
        nombreMes.slice(1);


    titulo.textContent =
        nombreMes;


    let primerDia =
        new Date(
            año,
            mes,
            1
        ).getDay();


    primerDia =
        primerDia === 0
            ? 6
            : primerDia - 1;


    const diasMes =
        new Date(
            año,
            mes + 1,
            0
        ).getDate();


    const diasMesAnterior =
        new Date(
            año,
            mes,
            0
        ).getDate();


    for (
        let i = primerDia - 1;
        i >= 0;
        i--
    ) {

        const dia =
            document.createElement("div");


        dia.className =
            "dia-calendario dia-vacio";


        const numero =
            document.createElement("div");


        numero.className =
            "numero-dia";


        numero.textContent =
            diasMesAnterior - i;


        dia.appendChild(
            numero
        );


        grid.appendChild(
            dia
        );
    }


    const hoy =
        new Date();


    for (
        let diaNumero = 1;
        diaNumero <= diasMes;
        diaNumero++
    ) {

        const dia =
            document.createElement("div");


        dia.className =
            "dia-calendario";


        const numero =
            document.createElement("div");


        numero.className =
            "numero-dia";


        numero.textContent =
            diaNumero;


        dia.appendChild(
            numero
        );


        if (

            diaNumero === hoy.getDate()
            &&
            mes === hoy.getMonth()
            &&
            año === hoy.getFullYear()

        ) {

            dia.classList.add(
                "dia-hoy"
            );

        }


        grid.appendChild(
            dia
        );

    }


    const totalCeldas =
        grid.children.length;


    const restantes =
        42 - totalCeldas;


    for (
        let i = 1;
        i <= restantes;
        i++
    ) {

        const dia =
            document.createElement("div");


        dia.className =
            "dia-calendario dia-vacio";


        const numero =
            document.createElement("div");


        numero.className =
            "numero-dia";


        numero.textContent =
            i;


        dia.appendChild(
            numero
        );


        grid.appendChild(
            dia
        );
    }
}


function mesAnterior() {

    fechaCalendario.setMonth(
        fechaCalendario.getMonth() - 1
    );


    generarCalendario();
}


function mesSiguiente() {

    fechaCalendario.setMonth(
        fechaCalendario.getMonth() + 1
    );


    generarCalendario();
}


// ======================================================
// RESERVAS
// ======================================================

async function mostrarReservas() {

    const encabezado =
        document.querySelector(".encabezado");

    const calendario =
        document.getElementById(
            "seccionCalendario"
        );

    const reservas =
        document.getElementById(
            "seccionReservas"
        );

    const clientes =
        document.getElementById(
            "seccionClientes"
        );


    if (encabezado) {
        encabezado.style.display = "none";
    }


    ocultarContenidoPanel();


    if (calendario) {
        calendario.style.display = "none";
    }


    if (clientes) {
        clientes.style.display = "none";
    }


    if (reservas) {
        reservas.style.display = "block";
    }


    cerrarMenu();

    await cargarReservas();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


async function cargarReservas() {

    const contenedor =
        document.getElementById(
            "listaReservas"
        );


    if (!contenedor) {
        return;
    }


    contenedor.innerHTML = `
        <div class="cargando">
            Cargando reservas...
        </div>
    `;


    try {

        const respuesta =
            await fetch(
                `${API_URL}/api/reservas`
            );


        if (!respuesta.ok) {
            throw new Error(
                `HTTP ${respuesta.status}`
            );
        }


        const datos =
            await respuesta.json();


        if (!datos.ok) {

            throw new Error(
                datos.mensaje ||
                "No se pudieron cargar las reservas"
            );
        }


        todasLasReservas =
            datos.reservas || [];


        filtrarReservas();


    } catch (error) {

        console.error(
            "Error cargando reservas:",
            error
        );


        contenedor.innerHTML = `
            <div class="sin-reservas">

                ❌ No se pudieron cargar
                las reservas.

                <br><br>

                Verifica que el servidor
                esté funcionando.

            </div>
        `;
    }
}


function filtrarReservas() {

    const buscador =
        document.getElementById(
            "buscarReserva"
        );

    const filtroEstado =
        document.getElementById(
            "filtroEstadoReserva"
        );

    const filtroDepartamento =
        document.getElementById(
            "filtroDepartamentoReserva"
        );


    const texto =
        buscador
            ? buscador.value
                .trim()
                .toLowerCase()
            : "";


    const estado =
        filtroEstado
            ? filtroEstado.value
            : "todos";


    const departamento =
        filtroDepartamento
            ? filtroDepartamento.value
            : "todos";


    const resultado =
        todasLasReservas.filter(
            reserva => {

                const nombre =
                    String(
                        reserva.nombre || ""
                    ).toLowerCase();


                const telefono =
                    String(
                        reserva.telefono || ""
                    ).toLowerCase();


                const coincideBusqueda =
                    !texto ||
                    nombre.includes(texto) ||
                    telefono.includes(texto);


                const estadoReserva =
                    obtenerEstadoReserva(
                        reserva
                    );


                const coincideEstado =
                    estado === "todos" ||
                    estado === estadoReserva;


                const numeroDepartamento =
                    Number(
                        reserva.departamentoNumero || 1
                    );


                const coincideDepartamento =
                    departamento === "todos" ||
                    String(
                        numeroDepartamento
                    ) === String(
                        departamento
                    );


                return (
                    coincideBusqueda &&
                    coincideEstado &&
                    coincideDepartamento
                );
            }
        );


    mostrarListaReservas(
        resultado
    );
}


function mostrarListaReservas(
    reservas
) {

    const contenedor =
        document.getElementById(
            "listaReservas"
        );


    const contador =
        document.getElementById(
            "contadorReservas"
        );


    if (!contenedor) {
        return;
    }


    if (contador) {

        contador.textContent =
            `${reservas.length} reservas encontradas`;

    }


    contenedor.innerHTML = "";


    if (reservas.length === 0) {

        contenedor.innerHTML = `
            <div class="sin-reservas">
                No se encontraron reservas.
            </div>
        `;

        return;
    }


    reservas.forEach(
        (reserva, indice) => {

            contenedor.appendChild(
                crearTarjetaReserva(
                    reserva,
                    indice
                )
            );

        }
    );
}


function crearTarjetaReserva(
    reserva,
    indice
) {

    const tarjeta =
        document.createElement("article");


    const estado =
        obtenerEstadoReserva(
            reserva
        );


    tarjeta.className =
        `reserva-card estado-${estado}`;


    const nombre =
        reserva.nombre ||
        "Cliente sin nombre";


    const telefono =
        reserva.telefono ||
        "";


    const personas =
        reserva.personas ||
        reserva.huespedes ||
        1;


    const total =
        Number(
            reserva.total || 0
        );


    const saldo =
        Number(
            reserva.saldo || 0
        );


    const agente =
        reserva.agente ||
        "Sin agente";


    const departamento =
        reserva.departamento ||
        `Depto ${Number(
            reserva.departamentoNumero || 1
        )}`;


    const fechaEntrada =
        formatearFecha(
            reserva.fechaEntrada
        );


    const fechaSalida =
        formatearFecha(
            reserva.fechaSalida
        );


    const numero =
        reserva.numeroReserva ||
        indice + 1;


    tarjeta.innerHTML = `

        <div class="reserva-superior">

            <div class="reserva-cliente">

                <span class="reserva-referencia">
                    🟠 ${numero}
                </span>

                <span class="reserva-nombre">
                    ${escapeHTML(nombre)}
                </span>

                ${obtenerEtiquetasEstado(
                    estado
                )}

            </div>


            <div class="reserva-acciones">

                <select
                    class="selector-estado"
                    onchange="cambiarEstadoReserva(
                        '${reserva._id}',
                        this.value
                    )"
                    title="Cambiar estado"
                >

                    <option
                        value="anticipo"
                        ${estado === "anticipo"
                            ? "selected"
                            : ""}
                    >
                        Con anticipo
                    </option>

                    <option
                        value="confirmada"
                        ${estado === "confirmada"
                            ? "selected"
                            : ""}
                    >
                        Confirmada
                    </option>

                    <option
                        value="cancelada"
                        ${estado === "cancelada"
                            ? "selected"
                            : ""}
                    >
                        Cancelada
                    </option>

                    <option
                        value="completada"
                        ${estado === "completada"
                            ? "selected"
                            : ""}
                    >
                        Completada
                    </option>

                </select>


                <button
                    class="btn-accion-reserva"
                    onclick="verComprobante(
                        '${reserva._id}'
                    )"
                    title="Ver comprobante"
                >
                    📄
                </button>


                <button
                    class="btn-accion-reserva"
                    onclick="abrirWhatsAppReserva(
                        '${escapeHTML(telefono)}',
                        '${escapeHTML(nombre)}'
                    )"
                    title="WhatsApp"
                >
                    💬
                </button>


                <button
                    class="btn-accion-reserva"
                    onclick="editarReserva(
                        '${reserva._id}'
                    )"
                    title="Editar reserva"
                >
                    ✏️
                </button>


                <button
                    class="btn-accion-reserva"
                    onclick="eliminarReserva(
                        '${reserva._id}'
                    )"
                    title="Eliminar reserva"
                >
                    🗑️
                </button>

            </div>

        </div>


        <div class="reserva-datos">

            <span>
                🗓️ ${fechaEntrada} - ${fechaSalida}
            </span>

            <span>
                👤 ${personas}
                ${Number(personas) === 1
                    ? "persona"
                    : "personas"}
            </span>

            <span>
                📞 ${escapeHTML(telefono)}
            </span>

            <span class="reserva-total">
                💰 $${total.toLocaleString("es-MX")}
            </span>

            <span>
                🏠 ${escapeHTML(departamento)}
            </span>

        </div>


        <div class="reserva-agente">

            Agente:
            <strong>
                ${escapeHTML(agente)}
            </strong>

            ${
                saldo > 0
                    ? `
                        <span style="margin-left:15px;">
                            Saldo: $${saldo.toLocaleString(
                                "es-MX"
                            )}
                        </span>
                      `
                    : ""
            }

        </div>

    `;


    return tarjeta;
}


function obtenerEstadoReserva(
    reserva
) {

    const estado =
        String(
            reserva.estado ||
            "anticipo"
        ).toLowerCase();


    if (
        estado.includes("complet")
    ) {
        return "completada";
    }


    if (
        estado.includes("cancel")
    ) {
        return "cancelada";
    }


    if (
        estado.includes("confirm")
    ) {
        return "confirmada";
    }


    return "anticipo";
}


function obtenerEtiquetasEstado(
    estado
) {

    switch (estado) {

        case "confirmada":

            return `
                <span
                    class="
                        estado-etiqueta
                        etiqueta-confirmada
                    "
                >
                    Confirmada
                </span>
            `;


        case "cancelada":

            return `
                <span
                    class="
                        estado-etiqueta
                        etiqueta-cancelada
                    "
                >
                    Cancelada
                </span>
            `;


        case "completada":

            return `
                <span
                    class="
                        estado-etiqueta
                        etiqueta-completada
                    "
                >
                    Completada
                </span>
            `;


        default:

            return `
                <span
                    class="
                        estado-etiqueta
                        etiqueta-anticipo
                    "
                >
                    Con anticipo
                </span>

                <span
                    class="
                        estado-etiqueta
                        etiqueta-pendiente
                    "
                >
                    Pendiente
                </span>
            `;
    }
}


function formatearFecha(
    fecha
) {

    if (!fecha) {
        return "--";
    }


    const objeto =
        new Date(fecha);


    if (
        Number.isNaN(
            objeto.getTime()
        )
    ) {

        return String(fecha);
    }


    return objeto.toLocaleDateString(
        "es-MX",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


// ======================================================
// ESTADO DE RESERVA
// ======================================================

async function cambiarEstadoReserva(
    id,
    nuevoEstado
) {

    try {

        const respuesta =
            await fetch(
                `${API_URL}/api/reservas/${id}/estado`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        estado: nuevoEstado
                    })
                }
            );


        const datos =
            await respuesta.json();


        if (!datos.ok) {

            throw new Error(
                datos.mensaje ||
                "No se pudo actualizar el estado"
            );
        }


        await cargarReservas();

    } catch (error) {

        console.error(error);

        alert(
            "❌ No se pudo actualizar el estado."
        );

        await cargarReservas();
    }
}


// ======================================================
// WHATSAPP RESERVA
// ======================================================

function abrirWhatsAppReserva(
    telefono,
    nombre
) {

    let numero =
        String(
            telefono || ""
        ).replace(
            /\D/g,
            ""
        );


    if (!numero) {

        alert(
            "Esta reserva no tiene teléfono."
        );

        return;
    }


    if (numero.length === 10) {

        numero =
            "52" + numero;

    }


    const mensaje =
        `Hola ${nombre}, te contacto por tu reserva en Departamentos Diamantes de Kino. 😊`;


    const url =
        `https://wa.me/${numero}?text=${encodeURIComponent(
            mensaje
        )}`;


    window.open(
        url,
        "_blank"
    );
}


// ======================================================
// COMPROBANTE
// ======================================================

function verComprobante(id) {

    const reserva =
        todasLasReservas.find(
            item =>
                String(item._id) ===
                String(id)
        );


    if (!reserva) {

        alert(
            "No se encontró la reserva."
        );

        return;
    }


    if (reserva.comprobante) {

        window.open(
            reserva.comprobante,
            "_blank"
        );

        return;
    }


    alert(
        "Esta reserva todavía no tiene comprobante."
    );
}


// ======================================================
// EDITAR RESERVA
// ======================================================

function editarReserva(id) {

    alert(
        "El formulario para editar reservas se agregará después."
    );
}


// ======================================================
// ELIMINAR RESERVA
// ======================================================

async function eliminarReserva(id) {

    const confirmar =
        confirm(
            "¿Seguro que deseas eliminar esta reserva?"
        );


    if (!confirmar) {
        return;
    }


    try {

        const respuesta =
            await fetch(
                `${API_URL}/api/reservas/${id}`,
                {
                    method: "DELETE"
                }
            );


        const datos =
            await respuesta.json();


        if (!datos.ok) {

            throw new Error(
                datos.mensaje ||
                "No se pudo eliminar"
            );
        }


        await cargarReservas();

    } catch (error) {

        console.error(error);

        alert(
            "❌ No se pudo eliminar la reserva."
        );
    }
}


function nuevaReserva() {

    alert(
        "El formulario de Nueva Reserva se agregará después."
    );
}


// ======================================================
// CLIENTES
// ======================================================

async function mostrarClientesSeccion() {

    const encabezado =
        document.querySelector(".encabezado");

    const calendario =
        document.getElementById(
            "seccionCalendario"
        );

    const reservas =
        document.getElementById(
            "seccionReservas"
        );

    const clientes =
        document.getElementById(
            "seccionClientes"
        );


    if (encabezado) {
        encabezado.style.display = "none";
    }


    ocultarContenidoPanel();


    if (calendario) {
        calendario.style.display = "none";
    }


    if (reservas) {
        reservas.style.display = "none";
    }


    if (clientes) {
        clientes.style.display = "block";
    }


    cerrarMenu();

    await cargarClientes();


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


async function cargarClientes() {

    const contenedor =
        document.getElementById(
            "listaClientes"
        );


    if (!contenedor) {
        return;
    }


    contenedor.innerHTML = `
        <div class="cargando">
            Cargando clientes...
        </div>
    `;


    try {

        const respuesta =
            await fetch(
                `${API_URL}/api/clientes`
            );


        if (!respuesta.ok) {
            throw new Error(
                `HTTP ${respuesta.status}`
            );
        }


        const datos =
            await respuesta.json();


        if (!datos.ok) {

            throw new Error(
                datos.mensaje ||
                "Error obteniendo clientes"
            );
        }


        clientesGlobal =
            datos.clientes || [];


        mostrarClientes(
            clientesGlobal
        );


    } catch (error) {

        console.error(
            "Error cargando clientes:",
            error
        );


        contenedor.innerHTML = `
            <div class="cargando">

                ❌ No se pudieron cargar
                los clientes.

                <br><br>

                Verifica que el servidor
                esté funcionando.

            </div>
        `;
    }
}


function mostrarClientes(
    clientes
) {

    const contenedor =
        document.getElementById(
            "listaClientes"
        );

    const contador =
        document.getElementById(
            "totalClientesTexto"
        );


    if (!contenedor) {
        return;
    }


    if (contador) {

        contador.textContent =
            `${clientes.length} clientes registrados`;

    }


    contenedor.innerHTML = "";


    if (clientes.length === 0) {

        contenedor.innerHTML = `
            <div class="cargando">
                No hay clientes registrados.
            </div>
        `;

        return;
    }


    clientes.forEach(
        cliente => {

            const tarjeta =
                document.createElement(
                    "article"
                );


            tarjeta.className =
                "cliente-card";


            const inicial =
                cliente.nombre
                    ? cliente.nombre
                        .charAt(0)
                        .toUpperCase()
                    : "?";


            tarjeta.style.borderLeftColor =
                cliente.tipo === "Frecuente"
                    ? "#e7b52f"
                    : "#ddd";


            tarjeta.innerHTML = `

                <div class="cliente-avatar">
                    ${escapeHTML(inicial)}
                </div>


                <div class="cliente-info">

                    <div class="cliente-nombre">
                        ${escapeHTML(
                            cliente.nombre || ""
                        )}
                    </div>


                    <div class="cliente-telefono">
                        📞 ${escapeHTML(
                            cliente.telefono || ""
                        )}
                    </div>


                    <div class="cliente-reservas">

                        ${Number(
                            cliente.reservas || 0
                        )}

                        ${
                            Number(
                                cliente.reservas || 0
                            ) === 1
                                ? "reserva"
                                : "reservas"
                        }

                    </div>


                    ${
                        cliente.tipo === "Frecuente"
                            ? `
                                <div class="cliente-frecuente">
                                    ⭐ Frecuente
                                </div>
                              `
                            : ""
                    }

                </div>


                <div class="cliente-acciones">

                    <button
                        onclick="abrirWhatsAppCliente(
                            '${escapeHTML(
                                cliente.telefono || ""
                            )}',
                            '${escapeHTML(
                                cliente.nombre || ""
                            )}'
                        )"
                        title="WhatsApp"
                    >
                        💬
                    </button>


                    <button
                        onclick="editarCliente(
                            '${cliente._id}'
                        )"
                        title="Editar cliente"
                    >
                        ✏️
                    </button>


                    <button
                        onclick="eliminarCliente(
                            '${cliente._id}'
                        )"
                        title="Eliminar cliente"
                    >
                        🗑️
                    </button>

                </div>

            `;


            contenedor.appendChild(
                tarjeta
            );
        }
    );
}


function filtrarClientes() {

    const input =
        document.getElementById(
            "buscarCliente"
        );


    const texto =
        input
            ? input.value
                .toLowerCase()
                .trim()
            : "";


    const resultados =
        clientesGlobal.filter(
            cliente => {

                const nombre =
                    String(
                        cliente.nombre || ""
                    ).toLowerCase();


                const telefono =
                    String(
                        cliente.telefono || ""
                    ).toLowerCase();


                return (
                    nombre.includes(texto) ||
                    telefono.includes(texto)
                );
            }
        );


    mostrarClientes(
        resultados
    );
}


// ======================================================
// WHATSAPP CLIENTE
// ======================================================

function abrirWhatsAppCliente(
    telefono,
    nombre
) {

    let numero =
        String(
            telefono || ""
        ).replace(
            /\D/g,
            ""
        );


    if (!numero) {

        alert(
            "Este cliente no tiene teléfono registrado."
        );

        return;
    }


    if (numero.length === 10) {

        numero =
            "52" + numero;

    }


    const mensaje =
        `Hola ${nombre}, ¿cómo estás? 😊`;


    const url =
        `https://wa.me/${numero}?text=${encodeURIComponent(
            mensaje
        )}`;


    window.open(
        url,
        "_blank"
    );
}


// ======================================================
// MODAL CLIENTE
// ======================================================

function abrirFormularioCliente() {

    const modal =
        document.getElementById(
            "modalCliente"
        );

    const formulario =
        document.getElementById(
            "formCliente"
        );


    if (!modal || !formulario) {
        return;
    }


    formulario.reset();


    const id =
        document.getElementById(
            "clienteId"
        );


    if (id) {
        id.value = "";
    }


    const titulo =
        document.getElementById(
            "tituloModalCliente"
        );


    if (titulo) {

        titulo.textContent =
            "Nuevo Cliente";

    }


    modal.classList.add(
        "abierto"
    );
}


function cerrarFormularioCliente() {

    const modal =
        document.getElementById(
            "modalCliente"
        );


    if (modal) {

        modal.classList.remove(
            "abierto"
        );
    }
}


// ======================================================
// GUARDAR CLIENTE
// ======================================================

async function guardarCliente(event) {

    event.preventDefault();


    const id =
        document.getElementById(
            "clienteId"
        ).value.trim();


    const nombre =
        document.getElementById(
            "clienteNombre"
        ).value.trim();


    const telefono =
        document.getElementById(
            "clienteTelefono"
        ).value.trim();


    const tipo =
        document.getElementById(
            "clienteTipo"
        ).value;


    try {

        const respuesta =
            await fetch(

                id
                    ? `${API_URL}/api/clientes/${id}`
                    : `${API_URL}/api/clientes`,

                {

                    method:
                        id
                            ? "PUT"
                            : "POST",

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


        const datos =
            await respuesta.json();


        if (!datos.ok) {

            throw new Error(
                datos.mensaje ||
                "No se pudo guardar el cliente"
            );
        }


        cerrarFormularioCliente();

        await cargarClientes();


        alert(
            id
                ? "Cliente actualizado correctamente."
                : "Cliente creado correctamente."
        );


    } catch (error) {

        console.error(
            "Error guardando cliente:",
            error
        );


        alert(
            "❌ " +
            error.message
        );
    }
}


// ======================================================
// EDITAR CLIENTE
// ======================================================

function editarCliente(id) {

    const cliente =
        clientesGlobal.find(
            item =>
                String(item._id) ===
                String(id)
        );


    if (!cliente) {
        return;
    }


    document.getElementById(
        "clienteId"
    ).value =
        cliente._id;


    document.getElementById(
        "clienteNombre"
    ).value =
        cliente.nombre || "";


    document.getElementById(
        "clienteTelefono"
    ).value =
        cliente.telefono || "";


    document.getElementById(
        "clienteTipo"
    ).value =
        cliente.tipo || "Normal";


    document.getElementById(
        "tituloModalCliente"
    ).textContent =
        "Editar Cliente";


    document.getElementById(
        "modalCliente"
    ).classList.add(
        "abierto"
    );
}


// ======================================================
// ELIMINAR CLIENTE
// ======================================================

async function eliminarCliente(id) {

    const cliente =
        clientesGlobal.find(
            item =>
                String(item._id) ===
                String(id)
        );


    if (!cliente) {
        return;
    }


    const confirmar =
        confirm(
            `¿Quieres eliminar a ${cliente.nombre}?`
        );


    if (!confirmar) {
        return;
    }


    try {

        const respuesta =
            await fetch(
                `${API_URL}/api/clientes/${id}`,
                {
                    method: "DELETE"
                }
            );


        const datos =
            await respuesta.json();


        if (!datos.ok) {

            throw new Error(
                datos.mensaje ||
                "No se pudo eliminar el cliente"
            );
        }


        await cargarClientes();


    } catch (error) {

        console.error(
            "Error eliminando cliente:",
            error
        );


        alert(
            "❌ " +
            error.message
        );
    }
}


// ======================================================
// ACCIONES PENDIENTES
// ======================================================

function reservarDepartamento(id) {

    alert(
        "El formulario de reserva se agregará después."
    );
}


function editarFotos(id) {

    alert(
        "La edición de fotos se agregará después."
    );
}


// ======================================================
// RESUMEN GENERAL
// ======================================================

async function actualizarResumenGeneral() {

    try {

        const reservasRespuesta =
            await fetch(
                `${API_URL}/api/reservas`
            );


        if (
            reservasRespuesta.ok
        ) {

            const reservasDatos =
                await reservasRespuesta.json();


            if (reservasDatos.ok) {

                const reservas =
                    reservasDatos.reservas || [];


                const activas =
                    reservas.filter(
                        reserva =>
                            ![
                                "cancelada",
                                "completada"
                            ].includes(
                                obtenerEstadoReserva(
                                    reserva
                                )
                            )
                    ).length;


                const reservasActivas =
                    document.getElementById(
                        "reservasActivas"
                    );


                const reservasTotales =
                    document.getElementById(
                        "reservasTotales"
                    );


                if (reservasActivas) {

                    reservasActivas.textContent =
                        activas;

                }


                if (reservasTotales) {

                    reservasTotales.textContent =
                        `${reservas.length} totales`;

                }

            }
        }


        const clientesRespuesta =
            await fetch(
                `${API_URL}/api/clientes`
            );


        if (
            clientesRespuesta.ok
        ) {

            const clientesDatos =
                await clientesRespuesta.json();


            if (clientesDatos.ok) {

                const clientesElemento =
                    document.getElementById(
                        "clientes"
                    );


                if (clientesElemento) {

                    clientesElemento.textContent =
                        clientesDatos.total || 0;

                }

            }
        }


    } catch (error) {

        console.error(
            "No se pudo actualizar el resumen:",
            error
        );

    }
}


// ======================================================
// SEGURIDAD HTML
// ======================================================

function escapeHTML(texto) {

    if (
        texto === null ||
        texto === undefined
    ) {

        return "";
    }


    return String(texto)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );
}

// ======================================================
//                         PAGOS
// ======================================================

let pagosGlobal = [];


// ==========================================
// MOSTRAR PAGOS
// ==========================================

async function mostrarPagos() {

    const encabezado =
        document.querySelector(".encabezado");

    const reservas =
        document.getElementById(
            "seccionReservas"
        );

    const calendario =
        document.getElementById(
            "seccionCalendario"
        );

    const clientes =
        document.getElementById(
            "seccionClientes"
        );

    const pagos =
        document.getElementById(
            "seccionPagos"
        );


    if (encabezado) {
        encabezado.style.display = "none";
    }


    ocultarContenidoPanel();


    if (reservas) {
        reservas.style.display = "none";
    }


    if (calendario) {
        calendario.style.display = "none";
    }


    if (clientes) {
        clientes.style.display = "none";
    }


    if (pagos) {
        pagos.style.display = "block";
    }


    cerrarMenu();

    await cargarPagos();


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


// ==========================================
// CARGAR PAGOS
// ==========================================

async function cargarPagos() {

    const contenedor =
        document.getElementById(
            "listaPagos"
        );


    if (!contenedor) {
        return;
    }


    contenedor.innerHTML = `
        <div class="cargando">
            Cargando pagos...
        </div>
    `;


    try {

        const respuesta =
            await fetch(
                `${API_URL}/api/pagos`
            );


        if (!respuesta.ok) {

            throw new Error(
                `HTTP ${respuesta.status}`
            );

        }


        const datos =
            await respuesta.json();


        if (!datos.ok) {

            throw new Error(
                datos.mensaje ||
                "No se pudieron cargar los pagos"
            );

        }


        pagosGlobal =
            datos.pagos || [];


        const total =
            Number(
                datos.total || 0
            );


        const totalElemento =
            document.getElementById(
                "totalPagos"
            );


        if (totalElemento) {

            totalElemento.textContent =
                `$${total.toLocaleString(
                    "es-MX"
                )}`;

        }


        mostrarListaPagos(
            pagosGlobal
        );


    } catch (error) {

        console.error(
            "Error cargando pagos:",
            error
        );


        contenedor.innerHTML = `
            <div class="sin-pagos">

                ❌ No se pudieron cargar
                los pagos.

                <br><br>

                Verifica que el servidor
                esté funcionando.

            </div>
        `;

    }

}


// ==========================================
// MOSTRAR PAGOS
// ==========================================

function mostrarListaPagos(
    pagos
) {

    const contenedor =
        document.getElementById(
            "listaPagos"
        );


    if (!contenedor) {
        return;
    }


    contenedor.innerHTML = "";


    if (pagos.length === 0) {

        contenedor.innerHTML = `
            <div class="sin-pagos">
                No hay pagos registrados.
            </div>
        `;

        return;
    }


    pagos.forEach(
        pago => {

            contenedor.appendChild(
                crearTarjetaPago(
                    pago
                )
            );

        }
    );

}


// ==========================================
// CREAR TARJETA
// ==========================================

function crearTarjetaPago(
    pago
) {

    const tarjeta =
        document.createElement(
            "article"
        );


    tarjeta.className =
        "pago-card";


    const nombre =
        pago.nombreCliente ||
        "Cliente";


    const metodo =
        pago.metodo ||
        "Efectivo";


    const tipo =
        pago.tipoPago ||
        "Anticipo";


    const monto =
        Number(
            pago.monto || 0
        );


    const fecha =
        formatearFechaHora(
            pago.fechaPago
        );


    const verificadoTexto =
        pago.verificado
            ? "✅ Verificado"
            : "No verificado";


    tarjeta.innerHTML = `

        <!-- PRIMERA LÍNEA -->

        <div class="pago-linea-superior">

            <div class="pago-nombre">

                ${escapeHTML(nombre)}

            </div>


            <div
                class="
                    pago-verificado-texto
                    ${
                        pago.verificado
                            ? "activo"
                            : ""
                    }
                "
            >

                ${
                    pago.verificado
                        ? "✅ Verificado"
                        : "No verificado"
                }

            </div>

        </div>


        <!-- SEGUNDA LÍNEA -->

        <div class="pago-linea-datos">

            <span>
                ${
                    metodo === "Transferencia"
                        ? "💳"
                        : "💵"
                }
                ${escapeHTML(metodo)}
            </span>


            <span>
                ${escapeHTML(tipo)}
            </span>


            <span>
                🕐 ${escapeHTML(fecha)}
            </span>


            <strong class="pago-monto">
                $${monto.toLocaleString(
                    "es-MX"
                )}
            </strong>


            <button
                class="btn-verificar-pago"
                onclick="alternarVerificacionPago(
                    '${pago._id}'
                )"
                title="${
                    pago.verificado
                        ? "Quitar verificado"
                        : "Marcar como verificado"
                }"
            >
                ✅
            </button>


            <button
                class="btn-eliminar-pago"
                onclick="eliminarPago(
                    '${pago._id}'
                )"
                title="Eliminar pago"
            >
                🗑️
            </button>

        </div>


        <!-- TERCERA LÍNEA -->

        <div class="pago-verificado-por">

            ${
                pago.verificado
                    ? `
                        Verificado por
                        <strong>
                            ${escapeHTML(
                                pago.verificadoPor ||
                                "Pitic Keys"
                            )}
                        </strong>
                      `
                    : `
                        No verificado
                      `
            }

        </div>

    `;


    return tarjeta;

}


// ==========================================
// CAMBIAR VERIFICACIÓN
// ==========================================

async function alternarVerificacionPago(
    id
) {

    const pago =
        pagosGlobal.find(
            item =>
                String(item._id) ===
                String(id)
        );


    if (!pago) {
        return;
    }


    const nuevoEstado =
        !pago.verificado;


    let verificadoPor = "";


    if (nuevoEstado) {

        verificadoPor =
            prompt(
                "¿Quién verificó este pago?",
                pago.verificadoPor ||
                "Pitic Keys"
            );


        if (
            verificadoPor === null
        ) {

            return;

        }

    }


    try {

        const respuesta =
            await fetch(
                `${API_URL}/api/pagos/${id}/verificado`,
                {

                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            verificado:
                                nuevoEstado,

                            verificadoPor

                        })

                }
            );


        const datos =
            await respuesta.json();


        if (!datos.ok) {

            throw new Error(
                datos.mensaje ||
                "No se pudo actualizar"
            );

        }


        await cargarPagos();


    } catch (error) {

        console.error(error);


        alert(
            "❌ No se pudo cambiar la verificación."
        );

    }

}


// ==========================================
// ELIMINAR PAGO
// ==========================================

async function eliminarPago(
    id
) {

    const pago =
        pagosGlobal.find(
            item =>
                String(item._id) ===
                String(id)
        );


    if (!pago) {
        return;
    }


    const confirmar =
        confirm(
            `¿Eliminar el pago de $${Number(
                pago.monto || 0
            ).toLocaleString(
                "es-MX"
            )}?`
        );


    if (!confirmar) {
        return;
    }


    try {

        const respuesta =
            await fetch(
                `${API_URL}/api/pagos/${id}`,
                {
                    method:
                        "DELETE"
                }
            );


        const datos =
            await respuesta.json();


        if (!datos.ok) {

            throw new Error(
                datos.mensaje ||
                "No se pudo eliminar"
            );

        }


        await cargarPagos();


    } catch (error) {

        console.error(error);


        alert(
            "❌ No se pudo eliminar el pago."
        );

    }

}


// ==========================================
// FORMULARIO NUEVO PAGO
// ==========================================

function abrirFormularioPago() {

    const modal =
        document.getElementById(
            "modalPago"
        );


    const formulario =
        document.getElementById(
            "formPago"
        );


    if (!modal || !formulario) {
        return;
    }


    formulario.reset();


    modal.classList.add(
        "abierto"
    );

}


function cerrarFormularioPago() {

    const modal =
        document.getElementById(
            "modalPago"
        );


    if (modal) {

        modal.classList.remove(
            "abierto"
        );

    }

}


// ==========================================
// GUARDAR PAGO
// ==========================================

async function guardarPago(
    event
) {

    event.preventDefault();


    const nombreCliente =
        document.getElementById(
            "pagoCliente"
        ).value.trim();


    const metodo =
        document.getElementById(
            "pagoMetodo"
        ).value;


    const tipoPago =
        document.getElementById(
            "pagoTipo"
        ).value;


    const monto =
        Number(
            document.getElementById(
                "pagoMonto"
            ).value
        );


    const verificadoPor =
        document.getElementById(
            "pagoVerificadoPor"
        ).value.trim();


    try {

        const respuesta =
            await fetch(
                `${API_URL}/api/pagos`,
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            nombreCliente,

                            metodo,

                            tipoPago,

                            monto,

                            verificado: false,

                            verificadoPor: ""

                        })

                }
            );


        const datos =
            await respuesta.json();


        if (!datos.ok) {

            throw new Error(
                datos.mensaje ||
                "No se pudo registrar el pago"
            );

        }


        cerrarFormularioPago();


        await cargarPagos();


        alert(
            "✅ Pago registrado correctamente."
        );


    } catch (error) {

        console.error(error);


        alert(
            "❌ " +
            error.message
        );

    }

}


// ==========================================
// FECHA Y HORA
// ==========================================

function formatearFechaHora(
    fecha
) {

    if (!fecha) {
        return "--";
    }


    const objeto =
        new Date(fecha);


    if (
        Number.isNaN(
            objeto.getTime()
        )
    ) {

        return String(fecha);

    }


    return objeto.toLocaleDateString(
        "es-MX",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    )
    + " "
    +
    objeto.toLocaleTimeString(
        "es-MX",
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}
// ======================================================
//                       LIMPIEZA
// ======================================================

let limpiezaGlobal = [];


// ==========================================
// MOSTRAR LIMPIEZA
// ==========================================

async function mostrarLimpieza() {

    const encabezado =
        document.querySelector(".encabezado");

    const calendario =
        document.getElementById(
            "seccionCalendario"
        );

    const reservas =
        document.getElementById(
            "seccionReservas"
        );

    const clientes =
        document.getElementById(
            "seccionClientes"
        );

    const pagos =
        document.getElementById(
            "seccionPagos"
        );

    const limpieza =
        document.getElementById(
            "seccionLimpieza"
        );


    if (encabezado) {
        encabezado.style.display = "none";
    }


    ocultarContenidoPanel();


    if (calendario) {
        calendario.style.display = "none";
    }


    if (reservas) {
        reservas.style.display = "none";
    }


    if (clientes) {
        clientes.style.display = "none";
    }


    if (pagos) {
        pagos.style.display = "none";
    }


    if (limpieza) {
        limpieza.style.display = "block";
    }


    cerrarMenu();

    await cargarLimpieza();


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


// ==========================================
// CARGAR LIMPIEZA
// ==========================================

async function cargarLimpieza() {

    const contenedor =
        document.getElementById(
            "listaLimpieza"
        );


    if (!contenedor) {
        return;
    }


    contenedor.innerHTML = `
        <div class="cargando">
            Cargando tareas...
        </div>
    `;


    try {

        const respuesta =
            await fetch(
                `${API_URL}/api/limpieza`
            );


        if (!respuesta.ok) {

            throw new Error(
                `HTTP ${respuesta.status}`
            );

        }


        const datos =
            await respuesta.json();


        if (!datos.ok) {

            throw new Error(
                datos.mensaje ||
                "No se pudieron cargar las tareas"
            );

        }


        limpiezaGlobal =
            datos.tareas || [];


        const contador =
            document.getElementById(
                "contadorLimpieza"
            );


        if (contador) {

            contador.textContent =
                `${limpiezaGlobal.length} tareas registradas`;

        }


        mostrarListaLimpieza(
            limpiezaGlobal
        );


    } catch (error) {

        console.error(
            "Error cargando limpieza:",
            error
        );


        contenedor.innerHTML = `

            <div class="sin-limpieza">

                ❌ No se pudieron cargar
                las tareas de limpieza.

                <br><br>

                Verifica que el servidor
                esté funcionando.

            </div>

        `;

    }

}


// ==========================================
// MOSTRAR LISTA
// ==========================================

function mostrarListaLimpieza(
    tareas
) {

    const contenedor =
        document.getElementById(
            "listaLimpieza"
        );


    if (!contenedor) {
        return;
    }


    contenedor.innerHTML = "";


    if (tareas.length === 0) {

        contenedor.innerHTML = `

            <div class="sin-limpieza">

                No hay tareas de limpieza registradas.

            </div>

        `;

        return;

    }


    tareas.forEach(
        tarea => {

            contenedor.appendChild(
                crearTarjetaLimpieza(
                    tarea
                )
            );

        }
    );

}


// ==========================================
// CREAR TARJETA
// ==========================================

function crearTarjetaLimpieza(
    tarea
) {

    const tarjeta =
        document.createElement(
            "article"
        );


    const estado =
        tarea.estado ||
        "pendiente";


    const completadas =
        (tarea.tareas || []).filter(
            item =>
                item.completada
        ).length;


    const total =
        (tarea.tareas || []).length;


    tarjeta.className =
        `limpieza-card estado-${estado}`;


    tarjeta.innerHTML = `

        <div class="limpieza-superior">

            <div class="limpieza-titulo">

                <span class="limpieza-numero">
                    🟠 ${tarea.departamentoNumero}
                </span>


                <span class="limpieza-departamento">
                    ${
                        escapeHTML(
                            tarea.departamentoNombre ||
                            `Depto #${tarea.departamentoNumero}`
                        )
                    }
                </span>

            </div>


            <div class="limpieza-controles">

                <select
                    id="estadoLimpieza-${tarea._id}"
                    class="limpieza-estado"
                >

                    <option
                        value="pendiente"
                        ${
                            estado === "pendiente"
                                ? "selected"
                                : ""
                        }
                    >
                        Pendiente
                    </option>

                    <option
                        value="progreso"
                        ${
                            estado === "progreso"
                                ? "selected"
                                : ""
                        }
                    >
                        Progreso
                    </option>

                    <option
                        value="completada"
                        ${
                            estado === "completada"
                                ? "selected"
                                : ""
                        }
                    >
                        Completada
                    </option>

                    <option
                        value="incidencia"
                        ${
                            estado === "incidencia"
                                ? "selected"
                                : ""
                        }
                    >
                        Incidencia
                    </option>

                </select>


                <button
                    class="btn-guardar-limpieza"
                    onclick="guardarTareaLimpieza(
                        '${tarea._id}'
                    )"
                >
                    💾 Guardar
                </button>

            </div>

        </div>


        <div class="limpieza-fecha">

            • ${formatearFechaHora(
                tarea.fecha
            )}

        </div>


        <div
            class="limpieza-contador"
            id="contador-${tarea._id}"
        >

            ${completadas}/${total}
            tareas completadas

        </div>


        <div class="limpieza-checklist">

            ${
                (tarea.tareas || [])
                    .map(
                        (item, indice) => `

                            <label
                                class="limpieza-check"
                            >

                                <input
                                    type="checkbox"
                                    data-limpieza-id="${tarea._id}"
                                    data-tarea-index="${indice}"
                                    ${
                                        item.completada
                                            ? "checked"
                                            : ""
                                    }
                                    onchange="actualizarContadorLimpieza(
                                        '${tarea._id}'
                                    )"
                                >

                                <span>
                                    ${obtenerIconoLimpieza(indice)}
                                    ${escapeHTML(
                                        item.nombre
                                    )}
                                </span>

                            </label>
                        `
                    )
                    .join("")
            }

        </div>


        <div class="limpieza-responsable">

            <strong>
                Responsable:
            </strong>

            <input
                type="text"
                id="responsable-${tarea._id}"
                value="${escapeHTML(
                    tarea.responsable || ""
                )}"
                placeholder="Nombre del responsable"
            >

        </div>


        <textarea
            id="notas-${tarea._id}"
            class="limpieza-notas"
            placeholder="Notas o incidencias..."
        >${escapeHTML(
            tarea.notas || ""
        )}</textarea>


        ${
            tarea.reservaId
                ? `
                    <div
                        style="
                            color:#777;
                            font-size:13px;
                            margin-bottom:10px;
                        "
                    >
                        Auto-generada al completar
                        reserva de
                        <strong>
                            ${escapeHTML(
                                tarea.clienteNombre || ""
                            )}
                        </strong>
                    </div>
                  `
                : ""
        }


        <button
            class="btn-pdf-limpieza"
            onclick="abrirPDFLimpieza(
                '${tarea._id}'
            )"
        >
            📄 Ver reporte PDF
        </button>

    `;


    return tarjeta;

}


// ==========================================
// ICONOS CHECKLIST
// ==========================================

function obtenerIconoLimpieza(
    indice
) {

    const iconos = [
        "🧹",
        "🛁",
        "🛏️",
        "🍳",
        "🗑️",
        "🪟",
        "📦",
        "🧴"
    ];


    return (
        iconos[indice] ||
        "☑️"
    );

}


// ==========================================
// CONTADOR CHECKLIST
// ==========================================

function actualizarContadorLimpieza(
    id
) {

    const checks =
        document.querySelectorAll(
            `input[data-limpieza-id="${id}"]`
        );


    let completadas = 0;


    checks.forEach(
        check => {

            if (check.checked) {
                completadas++;
            }

        }
    );


    const contador =
        document.getElementById(
            `contador-${id}`
        );


    if (contador) {

        contador.textContent =
            `${completadas}/${checks.length} tareas completadas`;

    }

}


// ==========================================
// GUARDAR TAREA
// ==========================================

async function guardarTareaLimpieza(
    id
) {

    const tarea =
        limpiezaGlobal.find(
            item =>
                String(item._id) ===
                String(id)
        );


    if (!tarea) {
        return;
    }


    const estado =
        document.getElementById(
            `estadoLimpieza-${id}`
        ).value;


    const responsable =
        document.getElementById(
            `responsable-${id}`
        ).value.trim();


    const notas =
        document.getElementById(
            `notas-${id}`
        ).value.trim();


    const checks =
        document.querySelectorAll(
            `input[data-limpieza-id="${id}"]`
        );


    const tareasActualizadas =
        Array.from(checks).map(
            check => {

                const indice =
                    Number(
                        check.dataset.tareaIndex
                    );


                return {

                    nombre:
                        tarea.tareas[indice].nombre,

                    completada:
                        check.checked

                };

            }
        );


    try {

        const respuesta =
            await fetch(
                `${API_URL}/api/limpieza/${id}`,
                {

                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            estado,

                            responsable,

                            notas,

                            tareas:
                                tareasActualizadas

                        })

                }
            );


        const datos =
            await respuesta.json();


        if (!datos.ok) {

            throw new Error(
                datos.mensaje ||
                "No se pudo guardar"
            );

        }


        await cargarLimpieza();


        // Abrir automáticamente el PDF

        abrirPDFLimpieza(
            id
        );


    } catch (error) {

        console.error(
            error
        );


        alert(
            "❌ No se pudo guardar la tarea."
        );

    }

}


// ==========================================
// ABRIR PDF
// ==========================================

function abrirPDFLimpieza(
    id
) {

    window.open(
        `${API_URL}/api/limpieza/${id}/pdf`,
        "_blank"
    );

}


// ==========================================
// NUEVA TAREA
// ==========================================

async function nuevaTareaLimpieza() {

    const numero =
        prompt(
            "Número del departamento (1-6):"
        );


    if (!numero) {
        return;
    }


    const departamento =
        obtenerNombreDepartamento(
            Number(numero)
        );


    if (!departamento) {

        alert(
            "Departamento no válido."
        );

        return;
    }


    const responsable =
        prompt(
            "Responsable:"
        ) || "";


    try {

        const respuesta =
            await fetch(
                `${API_URL}/api/limpieza`,
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            departamentoNumero:
                                Number(numero),

                            departamentoNombre:
                                departamento,

                            responsable,

                            estado:
                                "pendiente",

                            notas:
                                ""

                        })

                }
            );


        const datos =
            await respuesta.json();


        if (!datos.ok) {

            throw new Error(
                datos.mensaje ||
                "No se pudo crear"
            );

        }


        await cargarLimpieza();


    } catch (error) {

        console.error(
            error
        );


        alert(
            "❌ No se pudo crear la tarea."
        );

    }

}


// ==========================================
// NOMBRES DE DEPARTAMENTOS
// ==========================================

function obtenerNombreDepartamento(
    numero
) {

    const nombres = {

        1: "Carlos A02",
        2: "Carlos B02",
        3: "Gabriel C02",
        4: "Carlos A01",
        5: "Gabriel B01",
        6: "Gabriel C01"

    };


    return nombres[numero] || "";

}

// ======================================================
//                     INVENTARIO
// ======================================================

let inventarioGlobal = [];

let departamentoInventarioActual = 1;


// ==========================================
// MOSTRAR INVENTARIO
// ==========================================

async function mostrarInventario() {

    const encabezado =
        document.querySelector(".encabezado");

    const calendario =
        document.getElementById(
            "seccionCalendario"
        );

    const reservas =
        document.getElementById(
            "seccionReservas"
        );

    const clientes =
        document.getElementById(
            "seccionClientes"
        );

    const pagos =
        document.getElementById(
            "seccionPagos"
        );

    const limpieza =
        document.getElementById(
            "seccionLimpieza"
        );

   const inventario =
    document.getElementById(
        "seccionInventario"
    );

if (inventario) {
    inventario.style.display = "none";
}


    if (encabezado) {
        encabezado.style.display = "none";
    }


    ocultarContenidoPanel();


    if (calendario) {
        calendario.style.display = "none";
    }

    if (reservas) {
        reservas.style.display = "none";
    }

    if (clientes) {
        clientes.style.display = "none";
    }

    if (pagos) {
        pagos.style.display = "none";
    }

    if (limpieza) {
        limpieza.style.display = "none";
    }

    if (inventario) {
        inventario.style.display = "block";
    }


    cerrarMenu();


    marcarDepartamentoInventario();


    await cargarInventario();


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// ==========================================
// SELECCIONAR DEPARTAMENTO
// ==========================================

async function seleccionarDepartamentoInventario(
    numero
) {

    departamentoInventarioActual =
        Number(numero);


    marcarDepartamentoInventario();


    await cargarInventario();

}


// ==========================================
// MARCAR BOTÓN ACTIVO
// ==========================================

function marcarDepartamentoInventario() {

    document
        .querySelectorAll(
            ".depto-inventario"
        )
        .forEach(
            boton => {

                const numero =
                    Number(
                        boton.dataset.departamento
                    );


                boton.classList.toggle(
                    "activo",
                    numero ===
                        departamentoInventarioActual
                );

            }
        );
}


// ==========================================
// CARGAR INVENTARIO
// ==========================================

async function cargarInventario() {

    const contenedor =
        document.getElementById(
            "listaInventario"
        );


    if (!contenedor) {
        return;
    }


    contenedor.innerHTML = `
        <div class="cargando">
            Cargando inventario...
        </div>
    `;


    try {

        const respuesta =
            await fetch(
                `${API_URL}/api/inventario?departamento=${departamentoInventarioActual}`
            );


        if (!respuesta.ok) {

            throw new Error(
                `HTTP ${respuesta.status}`
            );

        }


        const datos =
            await respuesta.json();


        if (!datos.ok) {

            throw new Error(
                datos.mensaje ||
                "Error cargando inventario"
            );

        }


        inventarioGlobal =
            datos.articulos || [];


        const contador =
            document.getElementById(
                "contadorInventario"
            );


        if (contador) {

            contador.textContent =
                `${inventarioGlobal.length} ${
                    inventarioGlobal.length === 1
                        ? "artículo"
                        : "artículos"
                } en Depto ${departamentoInventarioActual}`;

        }


        mostrarListaInventario(
            inventarioGlobal
        );


    } catch (error) {

        console.error(
            "Error cargando inventario:",
            error
        );


        contenedor.innerHTML = `
            <div class="cargando">

                ❌ No se pudo cargar
                el inventario.

                <br><br>

                Verifica que el servidor
                esté funcionando.

            </div>
        `;

    }

}


// ==========================================
// MOSTRAR LISTA
// ==========================================

function mostrarListaInventario(
    articulos
) {

    const contenedor =
        document.getElementById(
            "listaInventario"
        );


    if (!contenedor) {
        return;
    }


    contenedor.innerHTML = "";


    if (articulos.length === 0) {

        contenedor.innerHTML = `
            <div class="sin-pagos">
                No hay artículos registrados
                en este departamento.
            </div>
        `;

        return;
    }


    articulos.forEach(
        articulo => {

            contenedor.appendChild(
                crearTarjetaInventario(
                    articulo
                )
            );

        }
    );

}


// ==========================================
// CREAR TARJETA
// ==========================================

function crearTarjetaInventario(
    articulo
) {

    const tarjeta =
        document.createElement(
            "article"
        );


    tarjeta.className =
        "inventario-card";


    const categoriaMostrada =
        articulo.categoria === "Otros"
            ? (
                articulo.categoriaPersonalizada ||
                "Otros"
            )
            : articulo.categoria;


    const claseEstado =
        obtenerClaseEstadoInventario(
            articulo.estado
        );


    tarjeta.innerHTML = `

        <div class="inventario-superior">

            <span class="inventario-nombre">

                📦
                ${escapeHTML(
                    articulo.nombre
                )}

            </span>


            <span
                class="
                    inventario-etiqueta
                    ${claseEstado}
                "
            >
                ${escapeHTML(
                    articulo.estado
                )}
            </span>


            <span
                class="
                    inventario-etiqueta
                    inventario-categoria
                "
            >
                ${escapeHTML(
                    categoriaMostrada
                )}
            </span>


            <div class="inventario-acciones">

                <button
                    class="btn-editar-inventario"
                    onclick="editarInventario(
                        '${articulo._id}'
                    )"
                    title="Editar"
                >
                    ✏️
                </button>


                <button
                    class="btn-eliminar-inventario"
                    onclick="eliminarInventario(
                        '${articulo._id}'
                    )"
                    title="Eliminar"
                >
                    🗑️
                </button>

            </div>

        </div>


        <div class="inventario-cantidad">

            Cantidad:
            <strong>
                ${Number(
                    articulo.cantidad || 0
                )}
            </strong>

        </div>


        ${
            articulo.notas
                ? `
                    <div class="inventario-notas">

                        📝
                        ${escapeHTML(
                            articulo.notas
                        )}

                    </div>
                  `
                : ""
        }

    `;


    return tarjeta;

}


// ==========================================
// ESTADO INVENTARIO
// ==========================================

function obtenerClaseEstadoInventario(
    estado
) {

    switch (estado) {

        case "Faltante":

            return "inventario-estado-faltante";

        case "Dañado":

            return "inventario-estado-danado";

        default:

            return "inventario-estado-bueno";
    }

}


// ==========================================
// ABRIR AGREGAR
// ==========================================

function abrirFormularioInventario() {

    const modal =
        document.getElementById(
            "modalInventario"
        );

    const formulario =
        document.getElementById(
            "formInventario"
        );


    if (!modal || !formulario) {
        return;
    }


    formulario.reset();


    document.getElementById(
        "inventarioId"
    ).value = "";


    document.getElementById(
        "inventarioCantidad"
    ).value = "0";


    document.getElementById(
        "inventarioDepartamento"
    ).value =
        String(
            departamentoInventarioActual
        );


    document.getElementById(
        "inventarioEstado"
    ).value =
        "Bueno";


    document.getElementById(
        "inventarioCategoria"
    ).value =
        "Muebles";


    document.getElementById(
        "contenedorCategoriaPersonalizada"
    ).style.display =
        "none";


    document.getElementById(
        "tituloModalInventario"
    ).textContent =
        "Agregar Artículo";


    document.getElementById(
        "btnGuardarInventario"
    ).textContent =
        "Guardar";


    modal.classList.add(
        "abierto"
    );

}


// ==========================================
// EDITAR
// ==========================================

function editarInventario(
    id
) {

    const articulo =
        inventarioGlobal.find(
            item =>
                String(
                    item._id
                ) ===
                String(id)
        );


    if (!articulo) {
        return;
    }


    document.getElementById(
        "inventarioId"
    ).value =
        articulo._id;


    document.getElementById(
        "inventarioNombre"
    ).value =
        articulo.nombre || "";


    document.getElementById(
        "inventarioCantidad"
    ).value =
        Math.max(
            0,
            Number(
                articulo.cantidad || 0
            )
        );


    document.getElementById(
        "inventarioEstado"
    ).value =
        articulo.estado || "Bueno";


    document.getElementById(
        "inventarioDepartamento"
    ).value =
        String(
            articulo.departamentoNumero
        );


    document.getElementById(
        "inventarioCategoria"
    ).value =
        articulo.categoria || "Otros";


    document.getElementById(
        "inventarioCategoriaPersonalizada"
    ).value =
        articulo.categoriaPersonalizada || "";


    document.getElementById(
        "inventarioNotas"
    ).value =
        articulo.notas || "";


    document.getElementById(
        "tituloModalInventario"
    ).textContent =
        "Editar Artículo";


    document.getElementById(
        "btnGuardarInventario"
    ).textContent =
        "Actualizar";


    mostrarCategoriaPersonalizada();


    document.getElementById(
        "modalInventario"
    ).classList.add(
        "abierto"
    );

}


// ==========================================
// MOSTRAR CATEGORÍA PERSONALIZADA
// ==========================================

function mostrarCategoriaPersonalizada() {

    const categoria =
        document.getElementById(
            "inventarioCategoria"
        );


    const contenedor =
        document.getElementById(
            "contenedorCategoriaPersonalizada"
        );


    if (!categoria || !contenedor) {
        return;
    }


    if (
        categoria.value ===
        "Otros"
    ) {

        contenedor.style.display =
            "block";

    } else {

        contenedor.style.display =
            "none";

        document.getElementById(
            "inventarioCategoriaPersonalizada"
        ).value = "";

    }

}


// ==========================================
// GUARDAR / ACTUALIZAR
// ==========================================

async function guardarInventario(
    event
) {

    event.preventDefault();


    const id =
        document.getElementById(
            "inventarioId"
        ).value;


    const nombre =
        document.getElementById(
            "inventarioNombre"
        ).value.trim();


    const cantidad =
        Math.max(
            0,
            Number(
                document.getElementById(
                    "inventarioCantidad"
                ).value || 0
            )
        );


    const estado =
        document.getElementById(
            "inventarioEstado"
        ).value;


    const categoria =
        document.getElementById(
            "inventarioCategoria"
        ).value;


    const categoriaPersonalizada =
        document.getElementById(
            "inventarioCategoriaPersonalizada"
        ).value.trim();


    const notas =
        document.getElementById(
            "inventarioNotas"
        ).value.trim();


    const departamentoNumero =
        Number(
            document.getElementById(
                "inventarioDepartamento"
            ).value
        );


    if (!nombre) {

        alert(
            "El nombre es obligatorio."
        );

        return;
    }


    if (
        cantidad < 0 ||
        !Number.isInteger(cantidad)
    ) {

        alert(
            "La cantidad debe ser un número entero desde 0."
        );

        return;
    }


    if (
        categoria === "Otros" &&
        !categoriaPersonalizada
    ) {

        alert(
            "Escribe la categoría personalizada."
        );

        return;
    }


    const datosEnviar = {

        departamentoNumero,

        nombre,

        cantidad,

        estado,

        categoria,

        categoriaPersonalizada:
            categoria === "Otros"
                ? categoriaPersonalizada
                : "",

        notas

    };


    try {

        const respuesta =
            await fetch(

                id
                    ? `${API_URL}/api/inventario/${id}`
                    : `${API_URL}/api/inventario`,

                {

                    method:
                        id
                            ? "PUT"
                            : "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            datosEnviar
                        )

                }

            );


        const datos =
            await respuesta.json();


        if (!datos.ok) {

            throw new Error(
                datos.mensaje ||
                "No se pudo guardar el artículo"
            );

        }


        cerrarFormularioInventario();


        departamentoInventarioActual =
            departamentoNumero;


        marcarDepartamentoInventario();


        await cargarInventario();


        alert(
            id
                ? "Artículo actualizado correctamente."
                : "Artículo agregado correctamente."
        );


    } catch (error) {

        console.error(
            "Error guardando inventario:",
            error
        );


        alert(
            "❌ " +
            error.message
        );

    }

}


// ==========================================
// CERRAR FORMULARIO
// ==========================================

function cerrarFormularioInventario() {

    const modal =
        document.getElementById(
            "modalInventario"
        );


    if (modal) {

        modal.classList.remove(
            "abierto"
        );

    }

}


// ==========================================
// ELIMINAR
// ==========================================

async function eliminarInventario(
    id
) {

    const articulo =
        inventarioGlobal.find(
            item =>
                String(
                    item._id
                ) ===
                String(id)
        );


    if (!articulo) {
        return;
    }


    const confirmar =
        confirm(
            `¿Quieres eliminar "${articulo.nombre}" del inventario?`
        );


    if (!confirmar) {
        return;
    }


    try {

        const respuesta =
            await fetch(
                `${API_URL}/api/inventario/${id}`,
                {
                    method:
                        "DELETE"
                }
            );


        const datos =
            await respuesta.json();


        if (!datos.ok) {

            throw new Error(
                datos.mensaje ||
                "No se pudo eliminar"
            );

        }


        await cargarInventario();


    } catch (error) {

        console.error(
            error
        );


        alert(
            "❌ No se pudo eliminar el artículo."
        );

    }

}

// ======================================================
//                    DOCUMENTOS
// ======================================================

let documentosGlobal = [];


// ==========================================
// MOSTRAR DOCUMENTOS
// ==========================================

async function mostrarDocumentos() {

    const encabezado =
        document.querySelector(".encabezado");

    const secciones = [
        "seccionReservas",
        "seccionCalendario",
        "seccionClientes",
        "seccionPagos",
        "seccionLimpieza",
        "seccionInventario",
        "seccionComprobante"
    ];


    if (encabezado) {
        encabezado.style.display = "none";
    }


    ocultarContenidoPanel();


    secciones.forEach(id => {

        const elemento =
            document.getElementById(id);

        if (elemento) {
            elemento.style.display = "none";
        }

    });


    const documentos =
        document.getElementById(
            "seccionDocumentos"
        );


    if (documentos) {
        documentos.style.display = "block";
    }


    cerrarMenu();

    await cargarDocumentos();


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


// ==========================================
// CARGAR DOCUMENTOS
// ==========================================

async function cargarDocumentos() {

    const contenedor =
        document.getElementById(
            "listaDocumentos"
        );


    if (!contenedor) {
        return;
    }


    try {

        const respuesta =
            await fetch(
                `${API_URL}/api/documentos`
            );


        const datos =
            await respuesta.json();


        if (!datos.ok) {

            throw new Error(
                datos.mensaje ||
                "Error obteniendo documentos"
            );

        }


        documentosGlobal =
            datos.documentos || [];


        const contador =
            document.getElementById(
                "contadorDocumentos"
            );


        if (contador) {

            contador.textContent =
                `${documentosGlobal.length} ${
                    documentosGlobal.length === 1
                        ? "documento"
                        : "documentos"
                } registrados`;

        }


        mostrarDocumentosLista(
            documentosGlobal
        );


    } catch (error) {

        console.error(error);

        contenedor.innerHTML = `
            <div class="sin-documentos">

                ❌ No se pudieron cargar
                los documentos.

            </div>
        `;

    }

}


// ==========================================
// LISTA
// ==========================================

function mostrarDocumentosLista(
    documentos
) {

    const contenedor =
        document.getElementById(
            "listaDocumentos"
        );


    if (!contenedor) {
        return;
    }


    contenedor.innerHTML = "";


    if (!documentos.length) {

        contenedor.innerHTML = `
            <div class="sin-documentos">
                No hay documentos registrados
            </div>
        `;

        return;
    }


    documentos.forEach(
        documento => {

            const tarjeta =
                document.createElement(
                    "article"
                );


            tarjeta.className =
                "documento-card";


            tarjeta.innerHTML = `

                <div class="documento-superior">

                    <div class="documento-titulo">

                        📄
                        ${escapeHTML(
                            documento.titulo
                        )}

                    </div>


                    <div class="documento-acciones">

                        <button
                            class="btn-documento"
                            onclick="editarDocumento(
                                '${documento._id}'
                            )"
                            title="Editar"
                        >
                            ✏️
                        </button>


                        <button
                            class="btn-documento"
                            onclick="abrirComprobantePorDocumento(
                                '${documento._id}'
                            )"
                            title="Guardar / ver documento"
                        >
                            💾
                        </button>


                        <button
                            class="btn-documento"
                            onclick="eliminarDocumento(
                                '${documento._id}'
                            )"
                            title="Eliminar"
                        >
                            🗑️
                        </button>

                    </div>

                </div>


                <div class="documento-info">

                    ${
                        documento.folio
                            ? `
                                <div>
                                    Folio:
                                    <strong>
                                        ${escapeHTML(
                                            documento.folio
                                        )}
                                    </strong>
                                </div>
                              `
                            : ""
                    }


                    ${
                        documento.clienteNombre
                            ? `
                                <div>
                                    Cliente:
                                    ${escapeHTML(
                                        documento.clienteNombre
                                    )}
                                </div>
                              `
                            : ""
                    }


                    ${
                        documento.departamento
                            ? `
                                <div>
                                    Departamento:
                                    ${escapeHTML(
                                        documento.departamento
                                    )}
                                </div>
                              `
                            : ""
                    }


                    ${
                        documento.entrada
                            ? `
                                <div>
                                    Entrada:
                                    ${formatearFecha(
                                        documento.entrada
                                    )}
                                </div>
                              `
                            : ""
                    }


                    ${
                        documento.salida
                            ? `
                                <div>
                                    Salida:
                                    ${formatearFecha(
                                        documento.salida
                                    )}
                                </div>
                              `
                            : ""
                    }

                </div>

            `;


            contenedor.appendChild(
                tarjeta
            );

        }
    );

}


// ==========================================
// NUEVO DOCUMENTO
// ==========================================

function abrirFormularioDocumento() {

    const modal =
        document.getElementById(
            "modalDocumento"
        );

    const formulario =
        document.getElementById(
            "formDocumento"
        );


    if (!modal || !formulario) {
        return;
    }


    formulario.reset();


    document.getElementById(
        "tituloModalDocumento"
    ).textContent =
        "Nuevo Documento";


    modal.classList.add(
        "abierto"
    );

}


// ==========================================
// CERRAR
// ==========================================

function cerrarFormularioDocumento() {

    const modal =
        document.getElementById(
            "modalDocumento"
        );


    if (modal) {

        modal.classList.remove(
            "abierto"
        );

    }

}


// ==========================================
// GUARDAR DOCUMENTO MANUAL
// ==========================================

async function guardarDocumento(
    event
) {

    event.preventDefault();


    const titulo =
        document.getElementById(
            "documentoTitulo"
        ).value.trim();


    const tipo =
        document.getElementById(
            "documentoTipo"
        ).value;


    const notas =
        document.getElementById(
            "documentoNotas"
        ).value.trim();


    try {

        const respuesta =
            await fetch(
                `${API_URL}/api/documentos`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            titulo,
                            tipo,
                            notas
                        })
                }
            );


        const datos =
            await respuesta.json();


        if (!datos.ok) {

            throw new Error(
                datos.mensaje
            );

        }


        cerrarFormularioDocumento();

        await cargarDocumentos();


    } catch (error) {

        console.error(error);

        alert(
            "❌ " +
            error.message
        );

    }

}


// ==========================================
// EDITAR DOCUMENTO
// ==========================================

function editarDocumento(
    id
) {

    const documento =
        documentosGlobal.find(
            item =>
                String(item._id) ===
                String(id)
        );


    if (!documento) {
        return;
    }


    document.getElementById(
        "documentoTitulo"
    ).value =
        documento.titulo || "";


    document.getElementById(
        "documentoTipo"
    ).value =
        documento.tipo ||
        "Comprobante de Reserva";


    document.getElementById(
        "documentoNotas"
    ).value =
        documento.notas || "";


    document.getElementById(
        "tituloModalDocumento"
    ).textContent =
        "Editar Documento";


    const formulario =
        document.getElementById(
            "formDocumento"
        );


    formulario.dataset.editarId =
        documento._id;


    document.getElementById(
        "modalDocumento"
    ).classList.add(
        "abierto"
    );

}


// ==========================================
// ELIMINAR
// ==========================================

async function eliminarDocumento(
    id
) {

    const documento =
        documentosGlobal.find(
            item =>
                String(item._id) ===
                String(id)
        );


    if (!documento) {
        return;
    }


    if (
        !confirm(
            `¿Eliminar "${documento.titulo}"?`
        )
    ) {
        return;
    }


    try {

        const respuesta =
            await fetch(
                `${API_URL}/api/documentos/${id}`,
                {
                    method: "DELETE"
                }
            );


        const datos =
            await respuesta.json();


        if (!datos.ok) {

            throw new Error(
                datos.mensaje
            );

        }


        await cargarDocumentos();


    } catch (error) {

        console.error(error);

        alert(
            "❌ No se pudo eliminar el documento."
        );

    }

}


// ======================================================
// COMPROBANTE DE RESERVA
// ======================================================

async function verComprobante(
    reservaId
) {

    try {

        const respuesta =
            await fetch(
                `${API_URL}/api/reservas/${reservaId}`
            );


        const datos =
            await respuesta.json();


        if (!datos.ok) {

            throw new Error(
                datos.mensaje ||
                "No se encontró la reserva"
            );

        }


        const reserva =
            datos.reserva;


        let documento =
            documentosGlobal.find(
                item =>
                    String(
                        item.reservaId
                    ) ===
                    String(
                        reserva._id
                    )
            );


        // Crear automáticamente el documento
        // si todavía no existe.

        if (!documento) {

            const folio =
                reserva.folio ||
                `RES-${String(
                    reserva._id
                ).slice(-8).toUpperCase()}`;


            const crear =
                await fetch(
                    `${API_URL}/api/documentos`,
                    {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({

                                tipo:
                                    "Comprobante de Reserva",

                                titulo:
                                    "Comprobante de Reserva",

                                folio,

                                reservaId:
                                    reserva._id,

                                clienteId:
                                    reserva.clienteId ||
                                    null,

                                clienteNombre:
                                    reserva.nombre ||
                                    "",

                                telefono:
                                    reserva.telefono ||
                                    "",

                                departamento:
                                    reserva.departamento ||
                                    "",

                                entrada:
                                    reserva.fechaEntrada ||
                                    null,

                                salida:
                                    reserva.fechaSalida ||
                                    null,

                                huespedes:
                                    reserva.personas ||
                                    1,

                                total:
                                    reserva.total ||
                                    0,

                                saldo:
                                    reserva.saldo ||
                                    0,

                                estado:
                                    reserva.estado ||
                                    "anticipo",

                                notas:
                                    reserva.notas ||
                                    ""

                            })

                    }
                );


            const crearDatos =
                await crear.json();


            if (!crearDatos.ok) {

                throw new Error(
                    crearDatos.mensaje ||
                    "No se pudo crear el comprobante"
                );

            }


            documento =
                crearDatos.documento;

        }


        mostrarVistaComprobante(
            documento
        );


    } catch (error) {

        console.error(error);

        alert(
            "❌ " +
            error.message
        );

    }

}


// ==========================================
// VISTA COMPROBANTE
// ==========================================

function mostrarVistaComprobante(
    documento
) {

    const vista =
        document.getElementById(
            "seccionComprobante"
        );

    const contenido =
        document.getElementById(
            "comprobanteContenido"
        );


    if (!vista || !contenido) {
        return;
    }


    document
        .querySelectorAll(
            "main > section"
        )
        .forEach(
            seccion => {
                seccion.style.display =
                    "none";
            }
        );


    vista.style.display =
        "block";


    const estado =
        textoEstadoFrontend(
            documento.estado
        );


    contenido.innerHTML = `

        <img
            src="logo.jpeg"
            class="comprobante-logo"
            alt="Diamantes de Kino"
        >


        <h1 class="comprobante-titulo">
            Comprobante de Reserva
        </h1>


        <p class="comprobante-subtitulo">
            Departamentos Diamantes de Kino
        </p>


        <div
            class="comprobante-estado"
            style="
                background:#fff3cd;
                color:#9a6b00;
            "
        >

            ${estado}

        </div>


        <div class="comprobante-datos">

            <div>
                📋 Folio:
                <strong>
                    ${escapeHTML(
                        documento.folio ||
                        "---"
                    )}
                </strong>
            </div>


            <div>
                Cliente:
                <strong>
                    ${escapeHTML(
                        documento.clienteNombre ||
                        "---"
                    )}
                </strong>
            </div>


            <div>
                Depto:
                <strong>
                    ${escapeHTML(
                        documento.departamento ||
                        "---"
                    )}
                </strong>
            </div>


            <div>
                Entrada:
                ${formatearFecha(
                    documento.entrada
                )}
            </div>


            <div>
                Salida:
                ${formatearFecha(
                    documento.salida
                )}
            </div>


            <div>
                Huéspedes:
                ${Number(
                    documento.huespedes || 1
                )}
            </div>

        </div>


        <div class="comprobante-total">

            <strong>
                Total
            </strong>

            <strong>
                $${Number(
                    documento.total || 0
                ).toLocaleString(
                    "es-MX"
                )}
            </strong>

        </div>


        <div
            class="comprobante-total"
            style="
                border-top:none;
                padding-top:8px;
            "
        >

            <strong>
                Saldo
            </strong>

            <strong>
                $${Number(
                    documento.saldo || 0
                ).toLocaleString(
                    "es-MX"
                )}
            </strong>

        </div>


        <div class="comprobante-botones">

            <button
                class="btn-comprobante"
                onclick="guardarComprobanteImagen()"
            >
                🖼️ Guardar imagen
            </button>


            <button
                class="btn-comprobante"
                onclick="guardarComprobantePDF(
                    '${documento._id}'
                )"
            >
                📄 Guardar PDF
            </button>


            <button
                class="btn-comprobante"
                onclick="enviarComprobanteWhatsApp(
                    '${escapeHTML(
                        documento.telefono || ""
                    )}',
                    '${escapeHTML(
                        documento.folio || ""
                    )}'
                )"
            >
                💬 WhatsApp
            </button>

        </div>

    `;

}


// ==========================================
// CERRAR COMPROBANTE
// ==========================================

function cerrarComprobante() {

    const vista =
        document.getElementById(
            "seccionComprobante"
        );


    if (vista) {

        vista.style.display =
            "none";

    }


    mostrarDocumentos();

}


// ==========================================
// DOCUMENTO DESDE DOCUMENTOS
// ==========================================

function abrirComprobantePorDocumento(
    id
) {

    const documento =
        documentosGlobal.find(
            item =>
                String(item._id) ===
                String(id)
        );


    if (!documento) {
        return;
    }


    mostrarVistaComprobante(
        documento
    );

}


// ==========================================
// GUARDAR PDF
// ==========================================

function guardarComprobantePDF(
    id
) {

    window.open(
        `${API_URL}/api/documentos/${id}/pdf`,
        "_blank"
    );

}


// ==========================================
// GUARDAR COMO IMAGEN
// ==========================================

function guardarComprobanteImagen() {

    const elemento =
        document.getElementById(
            "comprobanteContenido"
        );


    if (!elemento) {
        return;
    }


    if (
        typeof html2canvas ===
        "undefined"
    ) {

        alert(
            "Falta cargar html2canvas."
        );

        return;
    }


    html2canvas(
        elemento,
        {
            scale: 2,
            backgroundColor: "#ffffff"
        }
    )
    .then(
        canvas => {

            const enlace =
                document.createElement(
                    "a"
                );


            enlace.download =
                "comprobante-reserva.png";


            enlace.href =
                canvas.toDataURL(
                    "image/png"
                );


            enlace.click();

        }
    );

}


// ==========================================
// WHATSAPP DEL SISTEMA
// ==========================================

function enviarComprobanteWhatsApp(
    telefono,
    folio
) {

    const numero =
        String(
            telefono || ""
        ).replace(
            /\D/g,
            ""
        );


    if (!numero) {

        alert(
            "Este comprobante no tiene un teléfono."
        );

        return;
    }


    const mensaje =
        `Comprobante de reserva ${folio}. Departamentos Diamantes de Kino.`;


    window.open(
        `https://wa.me/${numero}?text=${encodeURIComponent(
            mensaje
        )}`,
        "_blank"
    );

}


// ==========================================
// ESTADO
// ==========================================

function textoEstadoFrontend(
    estado
) {

    switch (estado) {

        case "confirmada":
            return "🔵 Confirmada";

        case "cancelada":
            return "🔴 Cancelada";

        case "completada":
            return "🟢 Completada";

        default:
            return "🟠 Con anticipo";

    }

}

// ======================================================
//                    CONFIGURACIÓN
// ======================================================

let configuracionGlobal = null;


// ==========================================
// MOSTRAR CONFIGURACIÓN
// ==========================================

async function mostrarConfiguracion() {

    const encabezado =
        document.querySelector(".encabezado");

    const secciones = [
        "seccionReservas",
        "seccionCalendario",
        "seccionClientes",
        "seccionPagos",
        "seccionLimpieza",
        "seccionInventario",
        "seccionDocumentos",
        "seccionComprobante"
    ];


    if (encabezado) {
        encabezado.style.display = "none";
    }


    ocultarContenidoPanel();


    secciones.forEach(id => {

        const elemento =
            document.getElementById(id);

        if (elemento) {
            elemento.style.display = "none";
        }

    });


    const configuracion =
        document.getElementById(
            "seccionConfiguracion"
        );


    if (configuracion) {
        configuracion.style.display =
            "block";
    }


    cerrarMenu();

    await cargarConfiguracion();


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


// ==========================================
// CARGAR CONFIGURACIÓN
// ==========================================

async function cargarConfiguracion() {

    try {

        const respuesta =
            await fetch(
                `${API_URL}/api/configuracion`
            );


        const datos =
            await respuesta.json();


        if (!datos.ok) {

            throw new Error(
                datos.mensaje ||
                "No se pudo cargar configuración"
            );

        }


        configuracionGlobal =
            datos.configuracion;


        const precios =
            configuracionGlobal.precios ||
            {};


        document.getElementById(
            "precioCarlosA02"
        ).value =
            Number(
                precios.carlosA02 || 0
            );


        document.getElementById(
            "precioCarlosB02"
        ).value =
            Number(
                precios.carlosB02 || 0
            );


        document.getElementById(
            "precioGabrielC02"
        ).value =
            Number(
                precios.gabrielC02 || 0
            );


        document.getElementById(
            "precioCarlosA01"
        ).value =
            Number(
                precios.carlosA01 || 0
            );


        document.getElementById(
            "precioGabrielB01"
        ).value =
            Number(
                precios.gabrielB01 || 0
            );


        document.getElementById(
            "precioGabrielC01"
        ).value =
            Number(
                precios.gabrielC01 || 0
            );


        const logo =
            configuracionGlobal.logo ||
            "logo.jpeg";


        document.getElementById(
            "logoConfiguracionPreview"
        ).src = logo;


        document.getElementById(
            "logoConfiguracionUrl"
        ).value = logo;


        mostrarReglasConfiguracion(
            configuracionGlobal.reglas || []
        );


    } catch (error) {

        console.error(
            error
        );


        alert(
            "❌ No se pudo cargar la configuración."
        );

    }

}


// ==========================================
// GUARDAR PRECIOS
// ==========================================

async function guardarPreciosConfiguracion() {

    const precios = {

        carlosA02:
            obtenerNumeroPositivo(
                "precioCarlosA02"
            ),

        carlosB02:
            obtenerNumeroPositivo(
                "precioCarlosB02"
            ),

        gabrielC02:
            obtenerNumeroPositivo(
                "precioGabrielC02"
            ),

        carlosA01:
            obtenerNumeroPositivo(
                "precioCarlosA01"
            ),

        gabrielB01:
            obtenerNumeroPositivo(
                "precioGabrielB01"
            ),

        gabrielC01:
            obtenerNumeroPositivo(
                "precioGabrielC01"
            )

    };


    try {

        const respuesta =
            await fetch(
                `${API_URL}/api/configuracion/precios`,
                {

                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            precios
                        )

                }
            );


        const datos =
            await respuesta.json();


        if (!datos.ok) {

            throw new Error(
                datos.mensaje
            );

        }


        alert(
            "✅ Precios guardados correctamente."
        );


        await cargarConfiguracion();

        await cargarDepartamentos();


    } catch (error) {

        console.error(
            error
        );


        alert(
            "❌ " +
            error.message
        );

    }

}


// ==========================================
// GUARDAR LOGO
// ==========================================

async function guardarLogoConfiguracion() {

    const logo =
        document.getElementById(
            "logoConfiguracionUrl"
        ).value.trim();


    if (!logo) {

        alert(
            "Escribe la ruta o URL del logo."
        );

        return;
    }


    try {

        const respuesta =
            await fetch(
                `${API_URL}/api/configuracion/logo`,
                {

                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            logo
                        })

                }
            );


        const datos =
            await respuesta.json();


        if (!datos.ok) {

            throw new Error(
                datos.mensaje
            );

        }


        document.getElementById(
            "logoConfiguracionPreview"
        ).src = logo;


        alert(
            "✅ Logo guardado correctamente."
        );


    } catch (error) {

        console.error(error);

        alert(
            "❌ " +
            error.message
        );

    }

}


// ==========================================
// MOSTRAR REGLAS
// ==========================================

function mostrarReglasConfiguracion(
    reglas
) {

    const contenedor =
        document.getElementById(
            "listaReglasConfiguracion"
        );


    if (!contenedor) {
        return;
    }


    contenedor.innerHTML = "";


    if (!reglas.length) {

        contenedor.innerHTML = `
            <div class="sin-documentos">
                No hay reglas registradas.
            </div>
        `;

        return;
    }


    reglas.forEach(
        regla => {

            const tarjeta =
                document.createElement(
                    "div"
                );


            tarjeta.className =
                "regla-configuracion-card";


            tarjeta.innerHTML = `

                <div
                    class="regla-configuracion-info"
                >

                    <div
                        class="regla-configuracion-titulo"
                    >

                        ${
                            regla.activa
                                ? "🟢"
                                : "⚪"
                        }

                        ${escapeHTML(
                            regla.titulo
                        )}

                    </div>


                    <div
                        class="
                            regla-configuracion-descripcion
                        "
                    >

                        ${escapeHTML(
                            regla.descripcion
                        )}

                    </div>

                </div>


                <div
                    class="
                        regla-configuracion-acciones
                    "
                >

                    <label
                        class="switch"
                        title="${
                            regla.activa
                                ? "Desactivar"
                                : "Activar"
                        }"
                    >

                        <input
                            type="checkbox"
                            ${
                                regla.activa
                                    ? "checked"
                                    : ""
                            }
                            onchange="cambiarEstadoRegla(
                                '${regla._id}',
                                this.checked
                            )"
                        >

                        <span
                            class="slider"
                        ></span>

                    </label>


                    <button
                        class="btn-regla-accion"
                        onclick="editarRegla(
                            '${regla._id}'
                        )"
                        title="Editar"
                    >
                        ✏️
                    </button>


                    <button
                        class="btn-regla-accion"
                        onclick="eliminarRegla(
                            '${regla._id}'
                        )"
                        title="Eliminar"
                    >
                        🗑️
                    </button>

                </div>

            `;


            contenedor.appendChild(
                tarjeta
            );

        }
    );

}


// ==========================================
// NUEVA REGLA
// ==========================================

function abrirFormularioRegla() {

    const modal =
        document.getElementById(
            "modalRegla"
        );

    const formulario =
        document.getElementById(
            "formRegla"
        );


    if (!modal || !formulario) {
        return;
    }


    formulario.reset();


    document.getElementById(
        "reglaId"
    ).value = "";


    document.getElementById(
        "reglaActiva"
    ).checked = true;


    document.getElementById(
        "tituloModalRegla"
    ).textContent =
        "Agregar nueva regla";


    modal.classList.add(
        "abierto"
    );

}


// ==========================================
// EDITAR REGLA
// ==========================================

function editarRegla(
    id
) {

    const regla =
        (configuracionGlobal.reglas || [])
            .find(
                item =>
                    String(
                        item._id
                    ) ===
                    String(id)
            );


    if (!regla) {
        return;
    }


    document.getElementById(
        "reglaId"
    ).value =
        regla._id;


    document.getElementById(
        "reglaTitulo"
    ).value =
        regla.titulo || "";


    document.getElementById(
        "reglaDescripcion"
    ).value =
        regla.descripcion || "";


    document.getElementById(
        "reglaActiva"
    ).checked =
        regla.activa;


    document.getElementById(
        "tituloModalRegla"
    ).textContent =
        "Editar Regla";


    document.getElementById(
        "modalRegla"
    ).classList.add(
        "abierto"
    );

}


// ==========================================
// CERRAR MODAL REGLA
// ==========================================

function cerrarFormularioRegla() {

    const modal =
        document.getElementById(
            "modalRegla"
        );


    if (modal) {

        modal.classList.remove(
            "abierto"
        );

    }

}


// ==========================================
// GUARDAR REGLA
// ==========================================

async function guardarRegla(
    event
) {

    event.preventDefault();


    const id =
        document.getElementById(
            "reglaId"
        ).value;


    const titulo =
        document.getElementById(
            "reglaTitulo"
        ).value.trim();


    const descripcion =
        document.getElementById(
            "reglaDescripcion"
        ).value.trim();


    const activa =
        document.getElementById(
            "reglaActiva"
        ).checked;


    const url =
        id
            ? `${API_URL}/api/configuracion/reglas/${id}`
            : `${API_URL}/api/configuracion/reglas`;


    const metodo =
        id
            ? "PUT"
            : "POST";


    try {

        const respuesta =
            await fetch(
                url,
                {

                    method: metodo,

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            titulo,

                            descripcion,

                            activa

                        })

                }
            );


        const datos =
            await respuesta.json();


        if (!datos.ok) {

            throw new Error(
                datos.mensaje
            );

        }


        cerrarFormularioRegla();

        await cargarConfiguracion();


        alert(
            id
                ? "✅ Regla actualizada correctamente."
                : "✅ Regla agregada correctamente."
        );


    } catch (error) {

        console.error(error);

        alert(
            "❌ " +
            error.message
        );

    }

}


// ==========================================
// CAMBIAR ESTADO
// ==========================================

async function cambiarEstadoRegla(
    id,
    activa
) {

    try {

        const respuesta =
            await fetch(
                `${API_URL}/api/configuracion/reglas/${id}/estado`,
                {

                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            activa
                        })

                }
            );


        const datos =
            await respuesta.json();


        if (!datos.ok) {

            throw new Error(
                datos.mensaje
            );

        }


        await cargarConfiguracion();


    } catch (error) {

        console.error(error);

        alert(
            "❌ No se pudo cambiar la regla."
        );

        await cargarConfiguracion();

    }

}


// ==========================================
// ELIMINAR REGLA
// ==========================================

async function eliminarRegla(
    id
) {

    const regla =
        (configuracionGlobal.reglas || [])
            .find(
                item =>
                    String(
                        item._id
                    ) ===
                    String(id)
            );


    if (!regla) {
        return;
    }


    if (
        !confirm(
            `¿Eliminar la regla "${regla.titulo}"?`
        )
    ) {
        return;
    }


    try {

        const respuesta =
            await fetch(
                `${API_URL}/api/configuracion/reglas/${id}`,
                {
                    method:
                        "DELETE"
                }
            );


        const datos =
            await respuesta.json();


        if (!datos.ok) {

            throw new Error(
                datos.mensaje
            );

        }


        await cargarConfiguracion();


    } catch (error) {

        console.error(error);

        alert(
            "❌ No se pudo eliminar la regla."
        );

    }

}


// ==========================================
// NÚMEROS POSITIVOS
// ==========================================

function obtenerNumeroPositivo(
    id
) {

    const elemento =
        document.getElementById(id);


    if (!elemento) {
        return 0;
    }


    return Math.max(
        0,
        Number(
            elemento.value || 0
        )
    );


}

// ======================================================
//             FORMULARIO DE RESERVA
// ======================================================

let fechaCalendarioReserva =
    new Date(2026, 7, 20);

let reglasReservaGlobal = [];

let reglasAceptadasReserva = false;

let departamentosReservaGlobal = [];


// ==========================================
// MOSTRAR FORMULARIO
// ==========================================

async function mostrarFormularioReserva() {

    const encabezado =
        document.querySelector(".encabezado");

    const secciones = [

        "seccionReservas",
        "seccionCalendario",
        "seccionClientes",
        "seccionPagos",
        "seccionLimpieza",
        "seccionInventario",
        "seccionDocumentos",
        "seccionComprobante",
        "seccionConfiguracion"

    ];


    if (encabezado) {
        encabezado.style.display = "none";
    }


    ocultarContenidoPanel();


    secciones.forEach(
        id => {

            const elemento =
                document.getElementById(id);

            if (elemento) {
                elemento.style.display = "none";
            }

        }
    );


    const formulario =
        document.getElementById(
            "seccionFormularioReserva"
        );


    if (formulario) {
        formulario.style.display = "block";
    }


    cerrarMenu();


    reglasAceptadasReserva = false;

    actualizarBotonReglasReserva();

    generarCalendarioReserva();

    await cargarReglasParaReserva();

    await cargarDisponibilidadFormulario();


    // Logo de configuración

    cargarLogoFormularioReserva();


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


// ==========================================
// CARGAR LOGO
// ==========================================

async function cargarLogoFormularioReserva() {

    try {

        const respuesta =
            await fetch(
                `${API_URL}/api/configuracion`
            );


        const datos =
            await respuesta.json();


        if (
            datos.ok &&
            datos.configuracion &&
            datos.configuracion.logo
        ) {

            const logo =
                document.getElementById(
                    "logoFormularioReserva"
                );


            if (logo) {

                logo.src =
                    datos.configuracion.logo;

            }

        }

    } catch (error) {

        console.error(
            "No se pudo cargar el logo:",
            error
        );

    }

}


// ==========================================
// DEPARTAMENTO
// ==========================================

function cambiarDepartamentoReserva() {

    actualizarFormularioReserva();

    cargarDisponibilidadFormulario();

}


// ==========================================
// ACTUALIZAR DATOS
// ==========================================

function actualizarFormularioReserva() {

    const entrada =
        document.getElementById(
            "reservaFechaEntrada"
        ).value;

    const salida =
        document.getElementById(
            "reservaFechaSalida"
        ).value;


    let dias = 0;


    if (entrada && salida) {

        const fechaEntrada =
            new Date(
                `${entrada}T00:00:00`
            );

        const fechaSalida =
            new Date(
                `${salida}T00:00:00`
            );


        const diferencia =
            fechaSalida -
            fechaEntrada;


        dias =
            Math.max(
                0,
                Math.ceil(
                    diferencia /
                    (1000 * 60 * 60 * 24)
                )
            );

    }


    document.getElementById(
        "reservaDiasOcupados"
    ).textContent =
        `${dias} ${
            dias === 1
                ? "día"
                : "días"
        }`;


    validarFechasReserva();

    calcularSaldoReserva();

}


// ==========================================
// VALIDAR FECHAS
// ==========================================

function validarFechasReserva() {

    const entrada =
        document.getElementById(
            "reservaFechaEntrada"
        );

    const salida =
        document.getElementById(
            "reservaFechaSalida"
        );


    if (
        !entrada ||
        !salida ||
        !entrada.value ||
        !salida.value
    ) {
        return;
    }


    if (
        salida.value <=
        entrada.value
    ) {

        salida.setCustomValidity(
            "La fecha de salida debe ser posterior a la entrada."
        );

    } else {

        salida.setCustomValidity("");

    }

}


// ==========================================
// SALDO
// ==========================================

function calcularSaldoReserva() {

    const total =
        Math.max(
            0,
            Number(
                document.getElementById(
                    "reservaMontoTotal"
                ).value || 0
            )
        );


    let anticipo =
        Math.max(
            0,
            Number(
                document.getElementById(
                    "reservaAnticipo"
                ).value || 0
            )
        );


    if (anticipo > total) {
        anticipo = total;
    }


    document.getElementById(
        "reservaSaldo"
    ).value =
        total -
        anticipo;

}


// ==========================================
// OTRO MÉTODO
// ==========================================

function mostrarOtroMetodoReserva(
    tipo
) {

    const select =
        document.getElementById(
            tipo === "anticipo"
                ? "reservaMetodoAnticipo"
                : "reservaMetodoFinal"
        );


    const contenedor =
        document.getElementById(
            tipo === "anticipo"
                ? "otroAnticipo"
                : "otroFinal"
        );


    if (
        select.value ===
        "Otro"
    ) {

        contenedor.style.display =
            "flex";

    } else {

        contenedor.style.display =
            "none";

    }

}


function guardarOtroMetodoReserva(
    tipo
) {

    const input =
        document.getElementById(
            tipo === "anticipo"
                ? "otroAnticipoTexto"
                : "otroFinalTexto"
        );


    const select =
        document.getElementById(
            tipo === "anticipo"
                ? "reservaMetodoAnticipo"
                : "reservaMetodoFinal"
        );


    if (!input.value.trim()) {

        alert(
            "Escribe el método de pago."
        );

        return;
    }


    alert(
        `Método guardado: ${input.value.trim()}`
    );


    select.dataset.otro =
        input.value.trim();

}


// ==========================================
// REGLAS
// ==========================================

async function cargarReglasParaReserva() {

    const contenedor =
        document.getElementById(
            "reglasFormularioReserva"
        );


    if (!contenedor) {
        return;
    }


    try {

        const respuesta =
            await fetch(
                `${API_URL}/api/configuracion`
            );


        const datos =
            await respuesta.json();


        if (!datos.ok) {
            throw new Error(
                datos.mensaje
            );
        }


        reglasReservaGlobal =
            (
                datos.configuracion.reglas ||
                []
            ).filter(
                regla =>
                    regla.activa === true
            );


        contenedor.innerHTML = "";


        if (
            reglasReservaGlobal.length === 0
        ) {

            contenedor.innerHTML = `
                <p style="color:#777;">
                    No hay reglas activas.
                </p>
            `;

            return;
        }


        reglasReservaGlobal.forEach(
            regla => {

                const div =
                    document.createElement(
                        "div"
                    );


                div.className =
                    "regla-formulario-item";


                div.innerHTML = `

                    <strong>
                        • ${escapeHTML(
                            regla.titulo
                        )}
                    </strong>

                    <p>
                        ${escapeHTML(
                            regla.descripcion
                        )}
                    </p>

                `;


                contenedor.appendChild(
                    div
                );

            }
        );


    } catch (error) {

        console.error(error);


        contenedor.innerHTML = `
            <p style="color:#a00000;">
                No se pudieron cargar las reglas.
            </p>
        `;

    }

}


// ==========================================
// ACEPTAR REGLAS
// ==========================================

function aceptarReglasReserva() {

    reglasAceptadasReserva =
        !reglasAceptadasReserva;


    actualizarBotonReglasReserva();

}


function actualizarBotonReglasReserva() {

    const boton =
        document.getElementById(
            "btnAceptarReglasReserva"
        );


    if (!boton) {
        return;
    }


    if (reglasAceptadasReserva) {

        boton.classList.add(
            "aceptado"
        );


        boton.textContent =
            "☑ Aceptar reglas de hospedaje";

    } else {

        boton.classList.remove(
            "aceptado"
        );


        boton.textContent =
            "☐ Aceptar reglas de hospedaje";

    }

}


// ==========================================
// DISPONIBILIDAD
// ==========================================

async function cargarDisponibilidadFormulario() {

    const departamento =
        Number(
            document.getElementById(
                "reservaDepartamento"
            ).value
        );


    try {

        const respuesta =
            await fetch(
                `${API_URL}/api/reservas`
            );


        const datos =
            await respuesta.json();


        if (!datos.ok) {
            return;
        }


        const reservas =
            datos.reservas || [];


        const activas =
            reservas.filter(
                reserva => {

                    const depto =
                        Number(
                            reserva.departamentoNumero || 1
                        );


                    const estado =
                        obtenerEstadoReserva(
                            reserva
                        );


                    return (

                        depto === departamento

                        &&

                        estado !== "cancelada"

                    );

                }
            );


        document.getElementById(
            "reservaDisponibilidad"
        ).textContent =
            `${activas.length} ${
                activas.length === 1
                    ? "reserva"
                    : "reservas"
            } en Depto ${departamento}`;


        reservasGlobalFormulario =
            reservas;


        generarCalendarioReserva();

    } catch (error) {

        console.error(
            error
        );

    }

}


let reservasGlobalFormulario = [];


// ==========================================
// CALENDARIO
// ==========================================

function generarCalendarioReserva() {

    const grid =
        document.getElementById(
            "calendarioReservaGrid"
        );

    const titulo =
        document.getElementById(
            "mesReservaActual"
        );


    if (!grid || !titulo) {
        return;
    }


    grid.innerHTML = "";


    const año =
        fechaCalendarioReserva.getFullYear();

    const mes =
        fechaCalendarioReserva.getMonth();


    let textoMes =
        fechaCalendarioReserva.toLocaleDateString(
            "es-MX",
            {
                month: "long",
                year: "numeric"
            }
        );


    textoMes =
        textoMes.charAt(0).toUpperCase() +
        textoMes.slice(1);


    titulo.textContent =
        textoMes;


    let primerDia =
        new Date(
            año,
            mes,
            1
        ).getDay();


    primerDia =
        primerDia === 0
            ? 6
            : primerDia - 1;


    const diasMes =
        new Date(
            año,
            mes + 1,
            0
        ).getDate();


    for (
        let i = 0;
        i < primerDia;
        i++
    ) {

        const div =
            document.createElement(
                "div"
            );


        div.className =
            "dia-reserva vacio";


        grid.appendChild(
            div
        );

    }


    for (
        let dia = 1;
        dia <= diasMes;
        dia++
    ) {

        const div =
            document.createElement(
                "div"
            );


        div.className =
            "dia-reserva";


        div.textContent =
            dia;


        const fecha =
            `${año}-${String(
                mes + 1
            ).padStart(2, "0")}-${String(
                dia
            ).padStart(2, "0")}`;


        const ocupado =
            fechaEstaOcupadaFormulario(
                fecha
            );


        if (ocupado) {

            div.classList.add(
                "ocupado"
            );

        }


        div.addEventListener(
            "click",
            () => {

                if (ocupado) {
                    return;
                }


                seleccionarFechaCalendarioReserva(
                    fecha
                );

            }
        );


        grid.appendChild(
            div
        );

    }

}


function fechaEstaOcupadaFormulario(
    fecha
) {

    const departamento =
        Number(
            document.getElementById(
                "reservaDepartamento"
            ).value
        );


    return reservasGlobalFormulario.some(
        reserva => {

            if (
                Number(
                    reserva.departamentoNumero ||
                    1
                ) !== departamento
            ) {
                return false;
            }


            if (
                obtenerEstadoReserva(
                    reserva
                ) === "cancelada"
            ) {
                return false;
            }


            if (
                !reserva.fechaEntrada ||
                !reserva.fechaSalida
            ) {
                return false;
            }


            const entrada =
                String(
                    reserva.fechaEntrada
                ).substring(
                    0,
                    10
                );


            const salida =
                String(
                    reserva.fechaSalida
                ).substring(
                    0,
                    10
                );


            return (
                fecha >= entrada &&
                fecha < salida
            );

        }
    );

}


function seleccionarFechaCalendarioReserva(
    fecha
) {

    const entrada =
        document.getElementById(
            "reservaFechaEntrada"
        );

    const salida =
        document.getElementById(
            "reservaFechaSalida"
        );


    if (
        !entrada.value ||
        (
            entrada.value &&
            salida.value
        )
    ) {

        entrada.value =
            fecha;

        salida.value =
            "";

    } else {

        if (
            fecha <=
            entrada.value
        ) {

            alert(
                "La salida debe ser después de la entrada."
            );

            return;
        }


        salida.value =
            fecha;

    }


    actualizarFormularioReserva();

    marcarFechasCalendarioReserva();

}


function marcarFechasCalendarioReserva() {

    const entrada =
        document.getElementById(
            "reservaFechaEntrada"
        ).value;

    const salida =
        document.getElementById(
            "reservaFechaSalida"
        ).value;


    document
        .querySelectorAll(
            ".dia-reserva:not(.vacio)"
        )
        .forEach(
            elemento => {

                // Se vuelve a generar para mantener
                // la selección sincronizada.

            }
        );


    generarCalendarioReserva();

}


function mesReservaAnterior() {

    fechaCalendarioReserva.setMonth(
        fechaCalendarioReserva.getMonth() - 1
    );


    generarCalendarioReserva();

}


function mesReservaSiguiente() {

    fechaCalendarioReserva.setMonth(
        fechaCalendarioReserva.getMonth() + 1
    );


    generarCalendarioReserva();

}


// ==========================================
// ENVIAR RESERVA
// ==========================================

async function enviarReservaFormulario() {

    const nombre =
        document.getElementById(
            "reservaNombreCliente"
        ).value.trim();


    const telefono =
        document.getElementById(
            "reservaTelefono"
        ).value.trim();


    const departamentoNumero =
        Number(
            document.getElementById(
                "reservaDepartamento"
            ).value
        );


    const departamento =
        obtenerNombreDepartamento(
            departamentoNumero
        );


    const personas =
        Math.max(
            0,
            Number(
                document.getElementById(
                    "reservaHuespedes"
                ).value || 0
            )
        );


    const fechaEntrada =
        document.getElementById(
            "reservaFechaEntrada"
        ).value;


    const fechaSalida =
        document.getElementById(
            "reservaFechaSalida"
        ).value;


    const agente =
        document.getElementById(
            "reservaAgente"
        ).value.trim();


    const total =
        Math.max(
            0,
            Number(
                document.getElementById(
                    "reservaMontoTotal"
                ).value || 0
            )
        );


    const anticipo =
        Math.max(
            0,
            Number(
                document.getElementById(
                    "reservaAnticipo"
                ).value || 0
            )
        );


    const saldo =
        Math.max(
            0,
            total - anticipo
        );


    if (!nombre) {

        alert(
            "Escribe el nombre del cliente."
        );

        return;
    }


    if (!telefono) {

        alert(
            "Escribe el teléfono del cliente."
        );

        return;
    }


    if (!fechaEntrada) {

        alert(
            "Selecciona la fecha de entrada."
        );

        return;
    }


    if (!fechaSalida) {

        alert(
            "Selecciona la fecha de salida."
        );

        return;
    }


    if (
        fechaSalida <=
        fechaEntrada
    ) {

        alert(
            "La fecha de salida debe ser posterior a la entrada."
        );

        return;
    }


    if (!agente) {

        alert(
            "Escribe el nombre del agente."
        );

        return;
    }


    if (!reglasAceptadasReserva) {

        alert(
            "El cliente debe aceptar las reglas de hospedaje."
        );

        return;
    }


    if (anticipo > total) {

        alert(
            "El anticipo no puede ser mayor que el monto total."
        );

        return;
    }


    try {

        // ======================================
        // BUSCAR CLIENTE
        // ======================================

        const clientesRespuesta =
            await fetch(
                `${API_URL}/api/clientes`
            );


        const clientesDatos =
            await clientesRespuesta.json();


        let clienteExistente =
            null;


        if (
            clientesDatos.ok
        ) {

            clienteExistente =
                (
                    clientesDatos.clientes ||
                    []
                ).find(
                    cliente =>
                        String(
                            cliente.telefono
                        ).replace(
                            /\D/g,
                            ""
                        ) ===
                        String(
                            telefono
                        ).replace(
                            /\D/g,
                            ""
                        )
                );

        }


        // ======================================
        // CREAR CLIENTE SI NO EXISTE
        // ======================================

        let clienteId =
            clienteExistente
                ? clienteExistente._id
                : null;


        if (!clienteExistente) {

            const crearCliente =
                await fetch(
                    `${API_URL}/api/clientes`,
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

                                tipo:
                                    "Normal"

                            })

                    }
                );


            const clienteDatos =
                await crearCliente.json();


            if (!clienteDatos.ok) {

                throw new Error(
                    clienteDatos.mensaje ||
                    "No se pudo crear el cliente"
                );

            }


            clienteId =
                clienteDatos.cliente._id;

        }


        // ======================================
        // CREAR RESERVA
        // ======================================

        const reservaRespuesta =
            await fetch(
                `${API_URL}/api/reservas`,
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            clienteId,

                            nombre,

                            telefono,

                            departamento,

                            departamentoNumero,

                            fechaEntrada,

                            fechaSalida,

                            personas,

                            total,

                            saldo,

                            agente,

                            estado:
                                anticipo > 0
                                    ? "anticipo"
                                    : "confirmada"

                        })

                }
            );


        const reservaDatos =
            await reservaRespuesta.json();


        if (!reservaDatos.ok) {

            throw new Error(
                reservaDatos.mensaje ||
                "No se pudo crear la reserva"
            );

        }


        const reserva =
            reservaDatos.reserva;


        // ======================================
        // REGISTRAR ANTICIPO
        // ======================================

        if (
            anticipo > 0
        ) {

            const metodoAnticipoSelect =
                document.getElementById(
                    "reservaMetodoAnticipo"
                );


            let metodoAnticipo =
                metodoAnticipoSelect.value;


            if (
                metodoAnticipo ===
                "Otro"
            ) {

                metodoAnticipo =
                    metodoAnticipoSelect.dataset.otro ||
                    "Otro";

            }


            await fetch(
                `${API_URL}/api/pagos`,
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            clienteId,

                            reservaId:
                                reserva._id,

                            nombreCliente:
                                nombre,

                            metodo:
                                metodoAnticipo,

                            tipoPago:
                                anticipo >= total
                                    ? "Pago total"
                                    : "Anticipo",

                            monto:
                                anticipo,

                            fechaPago:
                                new Date(),

                            verificado:
                                false,

                            verificadoPor:
                                ""

                        })

                }
            );

        }


        // ======================================
        // ACTUALIZAR CONTADOR DEL CLIENTE
        // ======================================
        //
        // El backend ya incrementa reservas
        // al recibir clienteId.
        //


        // ======================================
        // CREAR DOCUMENTO / COMPROBANTE
        // ======================================

        const folio =
            `RES-${String(
                reserva._id
            ).slice(
                -8
            ).toUpperCase()}`;


        await fetch(
            `${API_URL}/api/documentos`,
            {

                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify({

                        tipo:
                            "Comprobante de Reserva",

                        titulo:
                            "Comprobante de Reserva",

                        folio,

                        reservaId:
                            reserva._id,

                        clienteId,

                        clienteNombre:
                            nombre,

                        telefono,

                        departamento,

                        entrada:
                            fechaEntrada,

                        salida:
                            fechaSalida,

                        huespedes:
                            personas,

                        total,

                        saldo,

                        estado:
                            reserva.estado,

                        notas:
                            "Comprobante generado automáticamente desde el Formulario de Reserva."

                    })

                }

            );


        alert(
            "✅ Reserva creada correctamente."
        );


        // Ir a Reservas

        mostrarReservas();


    } catch (error) {

        console.error(
            "Error creando reserva:",
            error
        );


        alert(
            "❌ " +
            error.message
        );

    }

}


// ==========================================
// NOMBRE DE DEPARTAMENTO
// ==========================================

function obtenerNombreDepartamento(
    numero
) {

    const nombres = {

        1: "Carlos A02",

        2: "Carlos B02",

        3: "Gabriel C02",

        4: "Carlos A01",

        5: "Gabriel B01",

        6: "Gabriel C01"

    };


    return (
        nombres[numero] ||
        `Depto ${numero}`
    );

}


// ======================================================
//             WHATSAPP / COMPARTIR FORMULARIO
// ======================================================

function mostrarWhatsApp() {

    const encabezado =
        document.querySelector(".encabezado");

    const secciones = [
        "seccionReservas",
        "seccionCalendario",
        "seccionClientes",
        "seccionPagos",
        "seccionLimpieza",
        "seccionInventario",
        "seccionDocumentos",
        "seccionConfiguracion",
        "seccionFormularioReserva",
        "seccionComprobante"
    ];


    if (encabezado) {
        encabezado.style.display = "none";
    }


    ocultarContenidoPanel();


    secciones.forEach(id => {

        const elemento =
            document.getElementById(id);

        if (elemento) {
            elemento.style.display = "none";
        }

    });


    const whatsapp =
        document.getElementById(
            "seccionWhatsApp"
        );


    if (whatsapp) {
        whatsapp.style.display = "block";
    }


    const enlace =
        `${window.location.origin}/formulario-reserva.html`;


    document.getElementById(
        "enlaceFormularioReserva"
    ).value = enlace;


    cerrarMenu();


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


// ==========================================
// COMPARTIR
// ==========================================

function compartirFormularioWhatsApp() {

    const enlace =
        document.getElementById(
            "enlaceFormularioReserva"
        ).value;


    const mensaje =
        document.getElementById(
            "mensajeCompartirWhatsApp"
        ).value.trim();


    const texto =
        `${mensaje}\n\n${enlace}`;


    const url =
        `https://web.whatsapp.com/send?text=${encodeURIComponent(
            texto
        )}`;


    window.open(
        url,
        "_blank"
    );

}


// ==========================================
// COPIAR ENLACE
// ==========================================

async function copiarEnlaceFormulario() {

    const enlace =
        document.getElementById(
            "enlaceFormularioReserva"
        ).value;


    try {

        await navigator.clipboard.writeText(
            enlace
        );


        alert(
            "✅ Enlace copiado."
        );

    } catch (error) {

        alert(
            "No se pudo copiar el enlace."
        );

    }

}

// ======================================================
//                 EDITOR DE FOTOS
// ======================================================

let departamentoFotosActual = null;

let fotosTemporales = [];

let fotoSeleccionadaIndex = null;


// ======================================================
// ABRIR EDITOR DE FOTOS
// ======================================================

function abrirEditorFotos(departamento) {

    departamentoFotosActual = departamento;

    fotosTemporales =
        Array.isArray(departamento.fotos)
            ? [...departamento.fotos]
            : [];

    fotoSeleccionadaIndex = null;


    const titulo =
        document.getElementById(
            "nombreDepartamentoFotos"
        );

    if (titulo) {

        titulo.textContent =
            departamento.nombre ||
            "Departamento";

    }


    const inputUrl =
        document.getElementById(
            "nuevaFotoUrl"
        );

    if (inputUrl) {

        inputUrl.value = "";

    }


    const inputArchivo =
        document.getElementById(
            "archivoNuevaFoto"
        );

    if (inputArchivo) {

        inputArchivo.value = "";

    }


    renderizarFotosDepartamento();


    const modal =
        document.getElementById(
            "modalFotosDepartamento"
        );

    if (modal) {

        modal.style.display = "flex";

    }

}


// ======================================================
// ABRIR EDITOR POR ID
// ======================================================

function abrirEditorFotosPorId(id) {

    try {

        const departamento =
            departamentosGlobal.find(
                item =>
                    String(item._id) ===
                    String(id)
            );


        if (!departamento) {

            alert(
                "❌ No se encontró el departamento."
            );

            return;

        }


        abrirEditorFotos(
            departamento
        );


    } catch (error) {

        console.error(
            "Error al abrir editor de fotos:",
            error
        );

        alert(
            "❌ Error al abrir el editor de fotos."
        );

    }

}


// ======================================================
// MOSTRAR FOTOS
// ======================================================

function renderizarFotosDepartamento() {

    const contenedor =
        document.getElementById(
            "listaFotosDepartamento"
        );


    if (!contenedor) {

        return;

    }


    if (!fotosTemporales.length) {

        contenedor.innerHTML = `
            <p class="sin-fotos">
                No hay fotos agregadas.
            </p>
        `;

        return;

    }


    contenedor.innerHTML =
        fotosTemporales
            .map(
                (foto, index) => {

                    const seleccionada =
                        fotoSeleccionadaIndex ===
                        index;


                    return `
                        <div
                            class="
                                foto-departamento-item
                                ${
                                    seleccionada
                                        ? "seleccionada"
                                        : ""
                                }
                            "
                            onclick="
                                seleccionarFotoDepartamento(
                                    ${index}
                                )
                            "
                        >

                            <img
                                src="${escapeHTML(foto)}"
                                alt="Foto"
                            >

                        </div>
                    `;

                }
            )
            .join("");

}


// ======================================================
// SELECCIONAR FOTO
// ======================================================

function seleccionarFotoDepartamento(index) {

    if (
        index < 0 ||
        index >= fotosTemporales.length
    ) {

        return;

    }


    fotoSeleccionadaIndex =
        index;


    renderizarFotosDepartamento();

}


// ======================================================
// AGREGAR FOTO POR URL
// ======================================================

function agregarFotoDepartamento() {

    const input =
        document.getElementById(
            "nuevaFotoUrl"
        );


    if (!input) {

        return;

    }


    const url =
        input.value.trim();


    if (!url) {

        alert(
            "Pega primero la URL de la imagen."
        );

        return;

    }


    fotosTemporales.push(
        url
    );


    fotoSeleccionadaIndex =
        fotosTemporales.length - 1;


    input.value = "";


    renderizarFotosDepartamento();

}


// ======================================================
// SUBIR ARCHIVO
// ======================================================

function seleccionarArchivoFoto(event) {

    const archivo =
        event.target.files[0];


    if (!archivo) {

        return;

    }


    if (
        !archivo.type.startsWith(
            "image/"
        )
    ) {

        alert(
            "❌ El archivo seleccionado no es una imagen."
        );

        event.target.value = "";

        return;

    }


    const lector =
        new FileReader();


    lector.onload =
        function(e) {

            const imagen =
                e.target.result;


            fotosTemporales.push(
                imagen
            );


            fotoSeleccionadaIndex =
                fotosTemporales.length - 1;


            renderizarFotosDepartamento();

        };


    lector.readAsDataURL(
        archivo
    );

}


// ======================================================
// ELIMINAR FOTO SELECCIONADA
// ======================================================

function eliminarFotoSeleccionada() {

    if (
        fotoSeleccionadaIndex ===
        null
    ) {

        alert(
            "Selecciona primero una foto para eliminarla."
        );

        return;

    }


    if (
        !confirm(
            "¿Eliminar la foto seleccionada?"
        )
    ) {

        return;

    }


    fotosTemporales.splice(
        fotoSeleccionadaIndex,
        1
    );


    fotoSeleccionadaIndex =
        null;


    renderizarFotosDepartamento();

}


// ======================================================
// CERRAR EDITOR
// ======================================================

function cerrarEditorFotos() {

    const modal =
        document.getElementById(
            "modalFotosDepartamento"
        );


    if (modal) {

        modal.style.display =
            "none";

    }


    departamentoFotosActual =
        null;


    fotosTemporales = [];

    fotoSeleccionadaIndex =
        null;

}


// ======================================================
// GUARDAR FOTOS
// ======================================================

async function guardarFotosDepartamento() {

    if (!departamentoFotosActual) {

        alert(
            "No se seleccionó ningún departamento."
        );

        return;

    }


    try {

        const respuesta =
            await fetch(
                `${API_URL}/api/departamentos/${departamentoFotosActual._id}/fotos`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            fotos:
                                fotosTemporales
                        })
                }
            );


        const datos =
            await respuesta.json();


        if (!respuesta.ok) {

            throw new Error(
                datos.error ||
                datos.mensaje ||
                "No se pudieron guardar las fotos"
            );

        }


        alert(
            "✅ Fotos guardadas correctamente."
        );


        cerrarEditorFotos();


        if (
            typeof cargarDepartamentos ===
            "function"
        ) {

            await cargarDepartamentos();

        }


    } catch (error) {

        console.error(
            "Error guardando fotos:",
            error
        );


        alert(
            "❌ No se pudieron guardar las fotos.\n\n" +
            error.message
        );

    }

}


// ======================================================
// ENTER EN URL
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const input =
            document.getElementById(
                "nuevaFotoUrl"
            );


        if (input) {

            input.addEventListener(
                "keydown",
                function(event) {

                    if (
                        event.key ===
                        "Enter"
                    ) {

                        event.preventDefault();

                        agregarFotoDepartamento();

                    }

                }
            );

        }

    }
);

document.addEventListener(
    "DOMContentLoaded",
    () => {

        actualizarFechaHora();

        cargarDepartamentos();

        actualizarResumenGeneral();

        generarCalendario();

    }
);