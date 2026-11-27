
document.addEventListener("DOMContentLoaded", function () {
    // =========================================================
    // ELEMENTOS DEL DOM
    // =========================================================

    const asistenciasStatusMessage = document.getElementById(
        "asistenciasStatusMessage"
    );

    const asistenciasTotal = document.getElementById("asistenciasTotal");
    const asistenciasPresentes = document.getElementById(
        "asistenciasPresentes"
    );
    const asistenciasTardanzas = document.getElementById(
        "asistenciasTardanzas"
    );
    const asistenciasAusencias = document.getElementById(
        "asistenciasAusencias"
    );
    const asistenciasJustificados = document.getElementById(
        "asistenciasJustificados"
    );

    const asistenciasCantidad = document.getElementById(
        "asistenciasCantidad"
    );

    const asistenciasTableBody = document.getElementById(
        "asistenciasTableBody"
    );

    const asistenciasEmptyMessage = document.getElementById(
        "asistenciasEmptyMessage"
    );

    // =========================================================
    // CONFIGURACIÓN
    // =========================================================

    const API_ASISTENCIAS = "/api/estudiante/asistencias";

    // =========================================================
    // UTILIDADES
    // =========================================================

    function crearElemento(etiqueta, clase, contenido) {
        const elemento = document.createElement(etiqueta);

        if (clase) {
            elemento.className = clase;
        }

        if (contenido !== undefined && contenido !== null) {
            elemento.textContent = contenido;
        }

        return elemento;
    }

    function mostrarMensaje(mensaje, tipo = "info") {
        if (!asistenciasStatusMessage) return;

        asistenciasStatusMessage.textContent = mensaje;
        asistenciasStatusMessage.className =
            `estudiante-status-message estudiante-status-message--${tipo}`;

        asistenciasStatusMessage.hidden = false;
    }

    function ocultarMensaje() {
        if (!asistenciasStatusMessage) return;

        asistenciasStatusMessage.hidden = true;
        asistenciasStatusMessage.textContent = "";
    }

    function normalizarEstado(estado) {
        return String(estado || "")
            .trim()
            .toUpperCase();
    }

    function formatearEstado(estado) {
        const estados = {
            PRESENTE: "Presente",
            AUSENTE: "Ausente",
            TARDANZA: "Tardanza",
            JUSTIFICADO: "Justificado",
        };

        const estadoNormalizado = normalizarEstado(estado);

        return estados[estadoNormalizado] || "Sin estado";
    }

    function formatearFecha(fecha) {
        if (!fecha) return "No registrada";

        const partes = String(fecha).split("-");

        if (partes.length !== 3) {
            return fecha;
        }

        const [anio, mes, dia] = partes;

        return `${dia}/${mes}/${anio}`;
    }

    function formatearHora(hora) {
        if (!hora) return "No registrada";

        const partes = String(hora).split(":");

        if (partes.length < 2) {
            return hora;
        }

        return `${partes[0]}:${partes[1]}`;
    }

    // =========================================================
    // INDICADORES
    // =========================================================

    function actualizarIndicadores(asistencias) {
        const indicadores = {
            total: asistencias.length,
            presentes: 0,
            tardanzas: 0,
            ausencias: 0,
            justificados: 0,
        };

        asistencias.forEach((asistencia) => {
            const estado = normalizarEstado(asistencia.estado);

            switch (estado) {
                case "PRESENTE":
                    indicadores.presentes++;
                    break;

                case "TARDANZA":
                    indicadores.tardanzas++;
                    break;

                case "AUSENTE":
                    indicadores.ausencias++;
                    break;

                case "JUSTIFICADO":
                    indicadores.justificados++;
                    break;
            }
        });

        asistenciasTotal.textContent = indicadores.total;
        asistenciasPresentes.textContent = indicadores.presentes;
        asistenciasTardanzas.textContent = indicadores.tardanzas;
        asistenciasAusencias.textContent = indicadores.ausencias;
        asistenciasJustificados.textContent = indicadores.justificados;

        asistenciasCantidad.textContent =
            `${indicadores.total} ${indicadores.total === 1 ? "registro" : "registros"
            }`;
    }

    // =========================================================
    // ESTADOS VISUALES
    // =========================================================

    function crearBadgeEstado(estado) {
        const estadoNormalizado = normalizarEstado(estado);

        const clases = {
            PRESENTE: "presente",
            AUSENTE: "ausente",
            TARDANZA: "tardanza",
            JUSTIFICADO: "justificado",
        };

        const claseEstado = clases[estadoNormalizado] || "desconocido";

        return crearElemento(
            "span",
            `asistencias-badge asistencias-badge--${claseEstado}`,
            formatearEstado(estado)
        );
    }


    // =========================================================
    // CONSTRUCCIÓN DE FILAS
    // =========================================================

    function crearFilaAsistencia(asistencia) {
        const fila = document.createElement("tr");

        // Fecha
        const celdaFecha = crearElemento(
            "td",
            "asistencias-table__date",
            formatearFecha(asistencia.fecha)
        );

        // Grupo
        const celdaGrupo = crearElemento(
            "td",
            "asistencias-table__group",
            asistencia.grupoNombre || "Sin grupo"
        );

        // Hora de llegada
        const celdaHora = crearElemento(
            "td",
            "asistencias-table__time",
            formatearHora(asistencia.horaLlegada)
        );

        // Estado
        const celdaEstado = document.createElement("td");
        celdaEstado.appendChild(
            crearBadgeEstado(asistencia.estado)
        );

        // Observación
        const celdaObservacion = crearElemento(
            "td",
            "asistencias-table__observation",
            asistencia.observacion || "—"
        );

        fila.append(
            celdaFecha,
            celdaGrupo,
            celdaHora,
            celdaEstado,
            celdaObservacion
        );

        return fila;
    }

    // =========================================================
    // RENDERIZADO DEL HISTORIAL
    // =========================================================

    function mostrarEstadoVacio() {
        asistenciasTableBody.innerHTML = "";

        if (asistenciasEmptyMessage) {
            asistenciasEmptyMessage.hidden = false;
        }

        const fila = document.createElement("tr");
        const celda = crearElemento(
            "td",
            "asistencias-table__empty",
            "No hay registros de asistencia disponibles."
        );

        celda.colSpan = 5;
        fila.appendChild(celda);

        asistenciasTableBody.appendChild(fila);
    }


    function renderizarAsistencias(asistencias) {
        asistenciasTableBody.innerHTML = "";

        if (asistenciasEmptyMessage) {
            asistenciasEmptyMessage.hidden = true;
        }

        if (!Array.isArray(asistencias) || asistencias.length === 0) {
            actualizarIndicadores([]);
            mostrarEstadoVacio();

            ocultarMensaje();

            return;
        }

        actualizarIndicadores(asistencias);

        const fragmento = document.createDocumentFragment();

        asistencias.forEach((asistencia) => {
            fragmento.appendChild(
                crearFilaAsistencia(asistencia)
            );
        });

        asistenciasTableBody.appendChild(fragmento);

        ocultarMensaje();
    }

    // =========================================================
    // CARGA DE ASISTENCIAS
    // =========================================================

    async function cargarAsistencias() {
        try {
            mostrarMensaje(
                "Cargando tu historial de asistencias...",
                "info"
            );

            const response = await fetch(API_ASISTENCIAS, {
                method: "GET",
                credentials: "same-origin",
                headers: {
                    Accept: "application/json",
                },
            });

            if (response.status === 401) {
                mostrarMensaje(
                    "Tu sesión ha expirado. Inicia sesión nuevamente.",
                    "error"
                );
                return;
            }

            if (response.status === 403) {
                mostrarMensaje(
                    "No tienes permiso para consultar estas asistencias.",
                    "error"
                );
                return;
            }

            if (!response.ok) {
                throw new Error(
                    `Error HTTP: ${response.status}`
                );
            }

            const asistencias = await response.json();

            if (!Array.isArray(asistencias)) {
                throw new Error(
                    "La respuesta del servidor no tiene el formato esperado."
                );
            }

            renderizarAsistencias(asistencias);

        } catch (error) {
            console.error(
                "Error al cargar las asistencias:",
                error
            );

            asistenciasTableBody.innerHTML = "";

            actualizarIndicadores([]);

            mostrarMensaje(
                "No fue posible cargar tu historial de asistencias. Intenta nuevamente.",
                "error"
            );

            const fila = document.createElement("tr");
            const celda = crearElemento(
                "td",
                "asistencias-table__empty",
                "Ocurrió un error al consultar los registros."
            );

            celda.colSpan = 5;
            fila.appendChild(celda);

            asistenciasTableBody.appendChild(fila);

            if (asistenciasEmptyMessage) {
                asistenciasEmptyMessage.hidden = true;
            }
        }
    }

    // =========================================================
    // INICIALIZACIÓN
    // =========================================================

    cargarAsistencias();
});
