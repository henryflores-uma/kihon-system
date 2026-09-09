const auth = sessionStorage.getItem("kihonAuth");
const username = sessionStorage.getItem("kihonUsername");

if (!auth) {
    window.location.href = "/login";
}

document.getElementById("usernameDisplay").textContent =
    username || "Usuario";


const tipoReporte =
    document.getElementById("tipoReporte");

const reporteFiltros =
    document.getElementById("reporteFiltros");

const generarReporteBtn =
    document.getElementById("generarReporteBtn");

const reporteMessage =
    document.getElementById("reporteMessage");

const reporteResultado =
    document.getElementById("reporteResultado");

const reportePeriodo =
    document.getElementById("reportePeriodo");

const reporteResumen =
    document.getElementById("reporteResumen");

const reporteDetalle =
    document.getElementById("reporteDetalle");


let estudiantes = [];
let grupos = [];

let estudianteSeleccionado = null;
let grupoSeleccionado = null;


/* ================================
   UTILIDADES
================================ */

function mostrarMensaje(mensaje, tipo = "error") {

    reporteMessage.textContent = mensaje;

    reporteMessage.hidden = false;

    reporteMessage.className =
        `reportes-message reportes-message--${tipo}`;
}


function ocultarMensaje() {

    reporteMessage.textContent = "";

    reporteMessage.hidden = true;

}


function formatoFecha(fecha) {

    if (!fecha) {
        return "-";
    }

    const partes = fecha.split("-");

    if (partes.length !== 3) {
        return fecha;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}


function formatoPorcentaje(valor) {

    if (valor === null || valor === undefined) {
        return "0%";
    }

    return `${Number(valor).toFixed(2)}%`;
}


function obtenerFechaActual() {

    const ahora = new Date();

    const anio =
        ahora.getFullYear();

    const mes =
        String(ahora.getMonth() + 1)
            .padStart(2, "0");

    const dia =
        String(ahora.getDate())
            .padStart(2, "0");

    return `${anio}-${mes}-${dia}`;
}


/* ================================
   CARGAR ESTUDIANTES
================================ */

async function cargarEstudiantes() {

    try {

        const response =
            await fetch(
                "/api/estudiantes?estado=ACTIVO",
                {
                    method: "GET",
                    headers: {
                        "Authorization": `Basic ${auth}`
                    }
                }
            );


        if (response.status === 401) {

            sessionStorage.clear();

            window.location.href = "/login";

            return;
        }


        if (!response.ok) {

            throw new Error(
                "No se pudieron cargar los estudiantes."
            );

        }


        estudiantes =
            await response.json();

    } catch (error) {

        console.error(error);

    }

}


/* ================================
   CARGAR GRUPOS
================================ */

async function cargarGrupos() {

    try {

        const response =
            await fetch(
                "/api/grupos?estado=ACTIVO",
                {
                    method: "GET",
                    headers: {
                        "Authorization": `Basic ${auth}`
                    }
                }
            );


        if (response.status === 401) {

            sessionStorage.clear();

            window.location.href = "/login";

            return;
        }


        if (!response.ok) {

            throw new Error(
                "No se pudieron cargar los grupos."
            );

        }


        grupos =
            await response.json();

    } catch (error) {

        console.error(error);

    }

}


/* ================================
   NOMBRE ESTUDIANTE
================================ */

function obtenerNombreEstudiante(estudiante) {

    if (estudiante.nombreCompleto) {
        return estudiante.nombreCompleto;
    }

    const nombre =
        estudiante.nombre || "";

    const apellido =
        estudiante.apellido || "";

    return `${nombre} ${apellido}`.trim();

}


/* ================================
   NOMBRE GRUPO
================================ */

function obtenerNombreGrupo(grupo) {

    return grupo.nombre || "";

}


/* ================================
   CARGAR FILTROS
================================ */

async function cargarFiltros() {

    const tipo =
        tipoReporte.value;

    reporteFiltros.innerHTML = "";

    estudianteSeleccionado = null;
    grupoSeleccionado = null;


    /* ================================
       DIARIO
    ================================= */

    if (tipo === "diario") {

        reporteFiltros.innerHTML = `

            <div class="form-group">

                <label
                    for="fechaReporte"
                    class="form-label">

                    Fecha

                </label>

                <input
                    type="date"
                    id="fechaReporte"
                    class="form-input"
                    required>

            </div>

        `;

        document.getElementById(
            "fechaReporte"
        ).value =
            obtenerFechaActual();

    }


    /* ================================
       SEMANAL
    ================================= */

    if (tipo === "semanal") {

        reporteFiltros.innerHTML = `

            <div class="grid grid--2">

                <div class="form-group">

                    <label
                        for="fechaInicio"
                        class="form-label">

                        Fecha de inicio

                    </label>

                    <input
                        type="date"
                        id="fechaInicio"
                        class="form-input"
                        required>

                </div>


                <div class="form-group">

                    <label
                        for="fechaFin"
                        class="form-label">

                        Fecha de fin

                    </label>

                    <input
                        type="date"
                        id="fechaFin"
                        class="form-input"
                        required>

                </div>

            </div>

        `;


        const hoy =
            obtenerFechaActual();

        document.getElementById(
            "fechaInicio"
        ).value = hoy;

        document.getElementById(
            "fechaFin"
        ).value = hoy;

    }


    /* ================================
       MENSUAL
    ================================= */

    if (tipo === "mensual") {

        const fechaActual =
            new Date();

        const anioActual =
            fechaActual.getFullYear();

        const mesActual =
            fechaActual.getMonth() + 1;


        reporteFiltros.innerHTML = `

            <div class="grid grid--2">

                <div class="form-group">

                    <label
                        for="anioReporte"
                        class="form-label">

                        Año

                    </label>

                    <input
                        type="number"
                        id="anioReporte"
                        class="form-input"
                        min="2000"
                        max="2100"
                        required>

                </div>


                <div class="form-group">

                    <label
                        for="mesReporte"
                        class="form-label">

                        Mes

                    </label>

                    <select
                        id="mesReporte"
                        class="form-select"
                        required>

                        <option value="1">
                            Enero
                        </option>

                        <option value="2">
                            Febrero
                        </option>

                        <option value="3">
                            Marzo
                        </option>

                        <option value="4">
                            Abril
                        </option>

                        <option value="5">
                            Mayo
                        </option>

                        <option value="6">
                            Junio
                        </option>

                        <option value="7">
                            Julio
                        </option>

                        <option value="8">
                            Agosto
                        </option>

                        <option value="9">
                            Septiembre
                        </option>

                        <option value="10">
                            Octubre
                        </option>

                        <option value="11">
                            Noviembre
                        </option>

                        <option value="12">
                            Diciembre
                        </option>

                    </select>

                </div>

            </div>

        `;


        document.getElementById(
            "anioReporte"
        ).value =
            anioActual;

        document.getElementById(
            "mesReporte"
        ).value =
            mesActual;

    }


    /* ================================
       ESTUDIANTE
    ================================= */

    if (tipo === "estudiante") {

        await cargarEstudiantes();

        reporteFiltros.innerHTML = `

            <div class="form-group">

                <label
                    for="buscarEstudiante"
                    class="form-label">

                    Buscar estudiante

                </label>

                <input
                    type="text"
                    id="buscarEstudiante"
                    class="form-input"
                    placeholder="Escribe el nombre del estudiante..."
                    autocomplete="off">

            </div>


            <div
                id="estudiantesResultados"
                class="reporte-busqueda-resultados">

            </div>


            <div
                id="estudianteSeleccionado"
                class="reporte-seleccion">

                Ningún estudiante seleccionado.

            </div>

        `;


        const buscar =
            document.getElementById(
                "buscarEstudiante"
            );


        buscar.addEventListener(
            "input",
            filtrarEstudiantes
        );

    }


    /* ================================
       GRUPO
    ================================= */

    if (tipo === "grupo") {

        await cargarGrupos();

        reporteFiltros.innerHTML = `

            <div class="form-group">

                <label
                    for="buscarGrupo"
                    class="form-label">

                    Buscar grupo

                </label>

                <input
                    type="text"
                    id="buscarGrupo"
                    class="form-input"
                    placeholder="Escribe el nombre del grupo..."
                    autocomplete="off">

            </div>


            <div
                id="gruposResultados"
                class="reporte-busqueda-resultados">

            </div>


            <div
                id="grupoSeleccionado"
                class="reporte-seleccion">

                Ningún grupo seleccionado.

            </div>

        `;


        const buscar =
            document.getElementById(
                "buscarGrupo"
            );


        buscar.addEventListener(
            "input",
            filtrarGrupos
        );

    }

}


/* ================================
   FILTRAR ESTUDIANTES
================================ */

function filtrarEstudiantes() {

    const input =
        document.getElementById(
            "buscarEstudiante"
        );

    const resultados =
        document.getElementById(
            "estudiantesResultados"
        );


    const texto =
        input.value
            .trim()
            .toLowerCase();


    estudianteSeleccionado = null;


    document.getElementById(
        "estudianteSeleccionado"
    ).textContent =
        "Ningún estudiante seleccionado.";


    if (!texto) {

        resultados.innerHTML = "";

        return;
    }


    const encontrados =
        estudiantes.filter(estudiante => {

            const nombre =
                obtenerNombreEstudiante(
                    estudiante
                ).toLowerCase();

            return nombre.includes(texto);

        });


    if (encontrados.length === 0) {

        resultados.innerHTML = `

            <div class="reporte-busqueda-vacio">

                No se encontraron estudiantes.

            </div>

        `;

        return;
    }


    resultados.innerHTML =
        encontrados.map(estudiante => `

            <button
                type="button"
                class="reporte-busqueda-item"
                data-estudiante-id="${estudiante.id}">

                ${obtenerNombreEstudiante(estudiante)}

            </button>

        `).join("");


    resultados
        .querySelectorAll(
            ".reporte-busqueda-item"
        )
        .forEach(boton => {

            boton.addEventListener(
                "click",
                () => {

                    seleccionarEstudiante(
                        Number(
                            boton.dataset.estudianteId
                        )
                    );

                }
            );

        });

}


/* ================================
   SELECCIONAR ESTUDIANTE
================================ */

function seleccionarEstudiante(id) {

    estudianteSeleccionado =
        estudiantes.find(
            estudiante =>
                estudiante.id === id
        );


    if (!estudianteSeleccionado) {
        return;
    }


    const nombre =
        obtenerNombreEstudiante(
            estudianteSeleccionado
        );


    document.getElementById(
        "buscarEstudiante"
    ).value = nombre;


    document.getElementById(
        "estudianteSeleccionado"
    ).textContent =
        `Estudiante seleccionado: ${nombre}`;


    document.getElementById(
        "estudiantesResultados"
    ).innerHTML = "";

}


/* ================================
   FILTRAR GRUPOS
================================ */

function filtrarGrupos() {

    const input =
        document.getElementById(
            "buscarGrupo"
        );

    const resultados =
        document.getElementById(
            "gruposResultados"
        );


    const texto =
        input.value
            .trim()
            .toLowerCase();


    grupoSeleccionado = null;


    document.getElementById(
        "grupoSeleccionado"
    ).textContent =
        "Ningún grupo seleccionado.";


    if (!texto) {

        resultados.innerHTML = "";

        return;
    }


    const encontrados =
        grupos.filter(grupo => {

            const nombre =
                obtenerNombreGrupo(
                    grupo
                ).toLowerCase();

            return nombre.includes(texto);

        });


    if (encontrados.length === 0) {

        resultados.innerHTML = `

            <div class="reporte-busqueda-vacio">

                No se encontraron grupos.

            </div>

        `;

        return;
    }


    resultados.innerHTML =
        encontrados.map(grupo => `

            <button
                type="button"
                class="reporte-busqueda-item"
                data-grupo-id="${grupo.id}">

                ${obtenerNombreGrupo(grupo)}

            </button>

        `).join("");


    resultados
        .querySelectorAll(
            ".reporte-busqueda-item"
        )
        .forEach(boton => {

            boton.addEventListener(
                "click",
                () => {

                    seleccionarGrupo(
                        Number(
                            boton.dataset.grupoId
                        )
                    );

                }
            );

        });

}


/* ================================
   SELECCIONAR GRUPO
================================ */

function seleccionarGrupo(id) {

    grupoSeleccionado =
        grupos.find(
            grupo =>
                grupo.id === id
        );


    if (!grupoSeleccionado) {
        return;
    }


    const nombre =
        obtenerNombreGrupo(
            grupoSeleccionado
        );


    document.getElementById(
        "buscarGrupo"
    ).value = nombre;


    document.getElementById(
        "grupoSeleccionado"
    ).textContent =
        `Grupo seleccionado: ${nombre}`;


    document.getElementById(
        "gruposResultados"
    ).innerHTML = "";

}


/* ================================
   GENERAR REPORTE
================================ */

async function generarReporte() {

    ocultarMensaje();

    reporteResultado.hidden = true;


    const tipo =
        tipoReporte.value;

    let url = "";


    /* ================================
       DIARIO
    ================================= */

    if (tipo === "diario") {

        const fecha =
            document.getElementById(
                "fechaReporte"
            ).value;


        if (!fecha) {

            mostrarMensaje(
                "Selecciona una fecha."
            );

            return;
        }


        url =
            `/api/reportes/asistencias/diario?fecha=${fecha}`;

    }


    /* ================================
       SEMANAL
    ================================= */

    if (tipo === "semanal") {

        const inicio =
            document.getElementById(
                "fechaInicio"
            ).value;

        const fin =
            document.getElementById(
                "fechaFin"
            ).value;


        if (!inicio || !fin) {

            mostrarMensaje(
                "Selecciona las fechas de inicio y fin."
            );

            return;
        }


        if (inicio > fin) {

            mostrarMensaje(
                "La fecha de inicio no puede ser posterior a la fecha de fin."
            );

            return;
        }


        url =
            `/api/reportes/asistencias/semanal?inicio=${inicio}&fin=${fin}`;

    }


    /* ================================
       MENSUAL
    ================================= */

    if (tipo === "mensual") {

        const anio =
            document.getElementById(
                "anioReporte"
            ).value;

        const mes =
            document.getElementById(
                "mesReporte"
            ).value;


        if (!anio || !mes) {

            mostrarMensaje(
                "Selecciona el año y el mes."
            );

            return;
        }


        url =
            `/api/reportes/asistencias/mensual?anio=${anio}&mes=${mes}`;

    }


    /* ================================
       ESTUDIANTE
    ================================= */

    if (tipo === "estudiante") {

        if (!estudianteSeleccionado) {

            mostrarMensaje(
                "Selecciona un estudiante de la lista."
            );

            return;
        }


        url =
            `/api/reportes/asistencias/estudiante/${estudianteSeleccionado.id}`;

    }


    /* ================================
       GRUPO
    ================================= */

    if (tipo === "grupo") {

        if (!grupoSeleccionado) {

            mostrarMensaje(
                "Selecciona un grupo de la lista."
            );

            return;
        }


        url =
            `/api/reportes/asistencias/grupo/${grupoSeleccionado.id}`;

    }


    generarReporteBtn.disabled = true;

    generarReporteBtn.textContent =
        "Generando...";


    try {

        const response =
            await fetch(
                url,
                {
                    method: "GET",

                    headers: {
                        "Authorization": `Basic ${auth}`
                    }
                }
            );


        if (response.status === 401) {

            sessionStorage.clear();

            window.location.href =
                "/login";

            return;
        }


        if (response.status === 403) {

            mostrarMensaje(
                "No tienes permisos para consultar este reporte."
            );

            return;
        }


        if (!response.ok) {

            let mensaje =
                "No se pudo generar el reporte.";


            try {

                const error =
                    await response.json();


                if (error.mensaje) {
                    mensaje = error.mensaje;
                }

            } catch (e) {
                // Sin respuesta JSON
            }


            mostrarMensaje(mensaje);

            return;
        }


        const data =
            await response.json();


        mostrarReporte(
            data,
            tipo
        );

    } catch (error) {

        console.error(error);

        mostrarMensaje(
            "Error de conexión con el servidor."
        );

    } finally {

        generarReporteBtn.disabled = false;

        generarReporteBtn.textContent =
            "Generar reporte";

    }

}


/* ================================
   MOSTRAR REPORTE
================================ */

function mostrarReporte(
    data,
    tipo
) {

    reporteResultado.hidden = false;


    let periodo = "";


    if (tipo === "diario") {

        periodo =
            `Fecha: ${formatoFecha(data.fecha)}`;

    } else if (tipo === "semanal") {

        periodo =
            `Periodo: ${formatoFecha(data.fechaInicio)} - ${formatoFecha(data.fechaFin)}`;

    } else if (tipo === "mensual") {

        periodo =
            `Periodo: ${data.mes}/${data.anio}`;

    } else if (tipo === "estudiante") {

        periodo =
            `Estudiante: ${estudianteSeleccionado
                ? obtenerNombreEstudiante(estudianteSeleccionado)
                : data.estudianteId
            }`;

    } else if (tipo === "grupo") {

        periodo =
            `Grupo: ${grupoSeleccionado
                ? obtenerNombreGrupo(grupoSeleccionado)
                : data.grupoId
            }`;

    }


    reportePeriodo.textContent =
        periodo;


    /* ================================
       RESUMEN
    ================================= */

    reporteResumen.innerHTML = `

        <div class="reporte-stat">

            <span class="reporte-stat__label">
                Total
            </span>

            <strong class="reporte-stat__value">
                ${data.total}
            </strong>

        </div>


        <div class="reporte-stat">

            <span class="reporte-stat__label">
                Presentes
            </span>

            <strong class="reporte-stat__value">
                ${data.presentes}
            </strong>

        </div>


        <div class="reporte-stat">

            <span class="reporte-stat__label">
                Tardanzas
            </span>

            <strong class="reporte-stat__value">
                ${data.tardanzas}
            </strong>

        </div>


        <div class="reporte-stat">

            <span class="reporte-stat__label">
                Ausentes
            </span>

            <strong class="reporte-stat__value">
                ${data.ausentes}
            </strong>

        </div>


        <div class="reporte-stat reporte-stat--percentage">

            <span class="reporte-stat__label">
                Porcentaje de asistencia
            </span>

            <strong class="reporte-stat__value">
                ${formatoPorcentaje(
        data.porcentajeAsistencia
    )}
            </strong>

        </div>

    `;


    /* ================================
       DETALLE
    ================================= */

    const asistencias =
        data.asistencias || [];


    if (asistencias.length === 0) {

        reporteDetalle.innerHTML = `

            <div class="reportes-empty">

                No existen registros de asistencia
                para el periodo seleccionado.

            </div>

        `;

        return;
    }


    let filas = "";


    asistencias.forEach(
        asistencia => {

            filas += `

                <tr>

                    <td>
                        ${asistencia.estudianteNombre ||
                asistencia.estudianteId ||
                "-"
                }
                    </td>

                    <td>
                        ${asistencia.grupoNombre ||
                asistencia.grupoId ||
                "-"
                }
                    </td>

                    <td>
                        ${formatoFecha(
                    asistencia.fecha
                )}
                    </td>

                    <td>
                        ${asistencia.horaLlegada ||
                "-"
                }
                    </td>

                    <td>

                        <span class="
                            reporte-estado
                            reporte-estado--${asistencia.estado.toLowerCase()}
                        ">

                            ${asistencia.estado}

                        </span>

                    </td>

                    <td>
                        ${asistencia.observacion ||
                "-"
                }
                    </td>

                </tr>

            `;

        }
    );


    reporteDetalle.innerHTML = `

        <table class="reportes-table">

            <thead>

                <tr>

                    <th>
                        Estudiante
                    </th>

                    <th>
                        Grupo
                    </th>

                    <th>
                        Fecha
                    </th>

                    <th>
                        Hora
                    </th>

                    <th>
                        Estado
                    </th>

                    <th>
                        Observación
                    </th>

                </tr>

            </thead>


            <tbody>

                ${filas}

            </tbody>

        </table>

    `;

}


/* ================================
   EVENTOS
================================ */

tipoReporte.addEventListener(
    "change",
    cargarFiltros
);


generarReporteBtn.addEventListener(
    "click",
    generarReporte
);


/* ================================
   INICIALIZACIÓN
================================ */

cargarFiltros();