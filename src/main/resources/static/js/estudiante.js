
document.addEventListener("DOMContentLoaded", async function () {

    // =====================================================
    // ELEMENTOS DEL DOM
    // =====================================================

    const elementos = {
        welcomeTitle: document.getElementById("estudianteWelcomeTitle"),
        grupo: document.getElementById("estudianteGrupo"),
        cinturon: document.getElementById("estudianteCinturon"),
        asistencias: document.getElementById("estudianteAsistencias"),
        progreso: document.getElementById("estudianteProgreso"),

        grupoContainer: document.getElementById("estudianteGrupoContainer"),
        actividadContainer: document.getElementById("estudianteActividadContainer"),

        statusMessage: document.getElementById("estudianteStatusMessage"),

        sessionInitial: document.getElementById("estudianteSessionInitial"),
        sessionUsername: document.getElementById("estudianteSessionUsername")
    };

    // =====================================================
    // CONFIGURACIÓN
    // =====================================================

    const API = {
        resumen: "/api/estudiante/resumen",
        grupos: "/api/estudiante/grupos",
        asistencias: "/api/estudiante/asistencias",
        asistenciasRecientes: "/api/estudiante/asistencias/recientes"
    };

    // =====================================================
    // UTILIDADES
    // =====================================================

    function crearElemento(etiqueta, clase, texto) {

        const elemento = document.createElement(etiqueta);

        if (clase) {
            elemento.className = clase;
        }

        if (texto !== undefined && texto !== null) {
            elemento.textContent = texto;
        }

        return elemento;
    }

    function mostrarMensaje(mensaje, tipo = "info") {

        if (!elementos.statusMessage) return;

        elementos.statusMessage.textContent = mensaje;
        elementos.statusMessage.className =
            `estudiante-status-message estudiante-status-message--${tipo}`;

        elementos.statusMessage.hidden = false;
    }

    function ocultarMensaje() {

        if (!elementos.statusMessage) return;

        elementos.statusMessage.hidden = true;
        elementos.statusMessage.textContent = "";
    }

    async function obtenerDatos(url) {

        const respuesta = await fetch(url, {
            method: "GET",
            credentials: "same-origin",
            headers: {
                "Accept": "application/json"
            }
        });

        if (!respuesta.ok) {

            if (respuesta.status === 401 || respuesta.status === 403) {
                throw new Error("No tienes autorización para consultar esta información.");
            }

            throw new Error(`Error al consultar ${url}: ${respuesta.status}`);
        }

        return respuesta.json();
    }

    function obtenerNombreCompleto(datos) {

        return `${datos.nombre || ""} ${datos.apellido || ""}`.trim();
    }

    function obtenerInicial(nombre) {

        return nombre && nombre.length > 0
            ? nombre.charAt(0).toUpperCase()
            : "E";
    }

    function formatearFecha(fecha) {

        if (!fecha) return "Fecha no disponible";

        const partes = fecha.split("-");

        if (partes.length !== 3) return fecha;

        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }

    function formatearHora(hora) {

        if (!hora) return "No registrada";

        return hora.substring(0, 5);
    }

    function normalizarEstado(estado) {

        return (estado || "").toUpperCase().trim();
    }

    function obtenerClaseEstado(estado) {

        const clases = {
            PRESENTE: "presente",
            AUSENTE: "ausente",
            TARDANZA: "tardanza",
            JUSTIFICADO: "justificado"
        };

        return clases[normalizarEstado(estado)] || "desconocido";
    }

    function obtenerTextoEstado(estado) {

        const textos = {
            PRESENTE: "Presente",
            AUSENTE: "Ausente",
            TARDANZA: "Tardanza",
            JUSTIFICADO: "Justificado"
        };

        return textos[normalizarEstado(estado)] || "Sin estado";
    }

    function mostrarSinDatos(contenedor, mensaje) {

        if (!contenedor) return;

        contenedor.replaceChildren(
            crearElemento("p", "estudiante-empty-message", mensaje)
        );
    }

    // =====================================================
    // INFORMACIÓN DE SESIÓN
    // =====================================================

    function cargarInformacionSesion(nombreCompleto) {

        const username = sessionStorage.getItem("kihonUsername") || "Estudiante";

        if (elementos.sessionUsername) {
            elementos.sessionUsername.textContent = username;
        }

        if (elementos.sessionInitial) {
            elementos.sessionInitial.textContent =
                obtenerInicial(nombreCompleto || username);
        }
    }

    // =====================================================
    // RESUMEN DEL ESTUDIANTE
    // =====================================================

    async function cargarResumen() {

        const estudiante = await obtenerDatos(API.resumen);

        const nombreCompleto = obtenerNombreCompleto(estudiante);

        if (elementos.welcomeTitle) {

            elementos.welcomeTitle.textContent = nombreCompleto
                ? `¡Hola, ${nombreCompleto}!`
                : "Bienvenido a Kihon";
        }

        if (elementos.cinturon) {

            elementos.cinturon.textContent =
                estudiante.cinturon || "Sin cinturón registrado";
        }

        cargarInformacionSesion(nombreCompleto);

        return estudiante;
    }

    // =====================================================
    // GRUPOS DEL ESTUDIANTE
    // =====================================================

    async function cargarGrupos() {

        const grupos = await obtenerDatos(API.grupos);

        if (!Array.isArray(grupos)) {
            throw new Error("La respuesta de grupos no tiene un formato válido.");
        }

        if (elementos.grupo) {

            if (grupos.length === 0) {

                elementos.grupo.textContent = "Sin grupo";

            } else {

                elementos.grupo.textContent = grupos.length > 1
                    ? `${grupos[0].nombre} (+${grupos.length - 1})`
                    : grupos[0].nombre;
            }
        }

        renderizarGrupos(grupos);

        return grupos;
    }

    function renderizarGrupos(grupos) {

        const contenedor = elementos.grupoContainer;

        if (!contenedor) return;

        if (grupos.length === 0) {

            mostrarSinDatos(
                contenedor,
                "Actualmente no tienes grupos activos asignados."
            );

            return;
        }

        const fragmento = document.createDocumentFragment();

        grupos.forEach(grupo => {

            const tarjeta = crearElemento(
                "article",
                "estudiante-group-card"
            );

            const nombre = crearElemento(
                "h3",
                "estudiante-group-card__title",
                grupo.nombre || "Grupo sin nombre"
            );

            tarjeta.appendChild(nombre);

            if (grupo.descripcion) {

                tarjeta.appendChild(
                    crearElemento(
                        "p",
                        "estudiante-group-card__description",
                        grupo.descripcion
                    )
                );
            }

            const estado = crearElemento(
                "span",
                "estudiante-group-card__status",
                grupo.estado || "Sin estado"
            );

            tarjeta.appendChild(estado);

            const tituloHorarios = crearElemento(
                "h4",
                "estudiante-group-card__subtitle",
                "Horarios de entrenamiento"
            );

            tarjeta.appendChild(tituloHorarios);

            if (Array.isArray(grupo.horarios) && grupo.horarios.length > 0) {

                const lista = crearElemento(
                    "ul",
                    "estudiante-group-card__schedule"
                );

                grupo.horarios.forEach(horario => {

                    const texto = `${horario.diaSemana || "Día no especificado"}: ${formatearHora(horario.horaInicio)} - ${formatearHora(horario.horaFin)}`;

                    lista.appendChild(
                        crearElemento("li", "", texto)
                    );
                });

                tarjeta.appendChild(lista);

            } else {

                tarjeta.appendChild(
                    crearElemento(
                        "p",
                        "estudiante-empty-message",
                        "Este grupo todavía no tiene horarios registrados."
                    )
                );
            }

            fragmento.appendChild(tarjeta);
        });

        contenedor.replaceChildren(fragmento);
    }

    // =====================================================
    // INDICADORES DE ASISTENCIA
    // =====================================================

    async function cargarAsistencias() {

        const asistencias = await obtenerDatos(API.asistencias);

        if (!Array.isArray(asistencias)) {
            throw new Error("La respuesta de asistencias no tiene un formato válido.");
        }

        calcularIndicadores(asistencias);

        return asistencias;
    }

    function calcularIndicadores(asistencias) {

        const total = asistencias.length;

        let presentes = 0;
        let tardanzas = 0;
        let justificados = 0;

        asistencias.forEach(asistencia => {

            const estado = normalizarEstado(asistencia.estado);

            if (estado === "PRESENTE") {
                presentes++;
            }

            if (estado === "TARDANZA") {
                tardanzas++;
            }

            if (estado === "JUSTIFICADO") {
                justificados++;
            }
        });

        const totalEvaluable = total - justificados;

        const porcentaje = totalEvaluable > 0
            ? ((presentes + tardanzas) / totalEvaluable) * 100
            : null;

        if (elementos.asistencias) {
            elementos.asistencias.textContent = total;
        }

        if (elementos.progreso) {

            elementos.progreso.textContent = porcentaje === null
                ? "—"
                : `${porcentaje.toFixed(1)}%`;
        }
    }

    // =====================================================
    // ACTIVIDAD RECIENTE
    // =====================================================

    async function cargarAsistenciasRecientes() {

        const asistencias = await obtenerDatos(API.asistenciasRecientes);

        if (!Array.isArray(asistencias)) {
            throw new Error("La respuesta de actividad reciente no tiene un formato válido.");
        }

        renderizarActividad(asistencias);
    }

    function renderizarActividad(asistencias) {

        const contenedor = elementos.actividadContainer;

        if (!contenedor) return;

        if (asistencias.length === 0) {

            mostrarSinDatos(
                contenedor,
                "Todavía no tienes registros de asistencia."
            );

            return;
        }

        const tabla = crearElemento(
            "div",
            "estudiante-activity-list"
        );

        asistencias.forEach(asistencia => {

            const fila = crearElemento(
                "article",
                "estudiante-activity-item"
            );

            const informacion = crearElemento(
                "div",
                "estudiante-activity-item__info"
            );

            informacion.appendChild(
                crearElemento(
                    "strong",
                    "estudiante-activity-item__group",
                    asistencia.grupoNombre || "Grupo no disponible"
                )
            );

            informacion.appendChild(
                crearElemento(
                    "span",
                    "estudiante-activity-item__date",
                    formatearFecha(asistencia.fecha)
                )
            );

            const detalle = asistencia.horaLlegada
                ? `Hora: ${formatearHora(asistencia.horaLlegada)}`
                : "Sin hora registrada";

            informacion.appendChild(
                crearElemento(
                    "small",
                    "estudiante-activity-item__time",
                    detalle
                )
            );

            const estado = normalizarEstado(asistencia.estado);

            const etiqueta = crearElemento(
                "span",
                `estudiante-activity-item__status estudiante-activity-item__status--${obtenerClaseEstado(estado)}`,
                obtenerTextoEstado(estado)
            );

            fila.appendChild(informacion);
            fila.appendChild(etiqueta);

            tabla.appendChild(fila);
        });

        contenedor.replaceChildren(tabla);
    }

    // =====================================================
    // INICIALIZACIÓN DEL DASHBOARD
    // =====================================================

    async function inicializarDashboard() {

        ocultarMensaje();

        const resultados = await Promise.allSettled([

            cargarResumen(),
            cargarGrupos(),
            cargarAsistencias(),
            cargarAsistenciasRecientes()

        ]);

        const errores = resultados.filter(
            resultado => resultado.status === "rejected"
        );

        if (errores.length > 0) {

            console.error(
                "Errores al cargar el dashboard del estudiante:",
                errores.map(resultado => resultado.reason)
            );

            const errorAutorizacion = errores.some(resultado =>
                resultado.reason?.message?.includes("autorización")
            );

            mostrarMensaje(
                errorAutorizacion
                    ? "Tu sesión no tiene autorización para consultar algunos datos. Vuelve a iniciar sesión."
                    : "No fue posible cargar toda tu información. Algunas secciones podrían estar incompletas.",
                "error"
            );
        }
    }

    // =====================================================
    // INICIAR
    // =====================================================

    await inicializarDashboard();

});
