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

    const asistenciasPagination = document.getElementById(
        "asistenciasPagination"
    );
    const asistenciasPageInfo = document.getElementById(
        "asistenciasPageInfo"
    );
    const btnPaginaAnterior = document.getElementById(
        "btnPaginaAnterior"
    );
    const asistenciasPageNumbers = document.getElementById(
        "asistenciasPageNumbers"
    );
    const btnPaginaSiguiente = document.getElementById(
        "btnPaginaSiguiente"
    );

    // =========================================================
    // CONFIGURACIÓN Y ESTADO DE PAGINACIÓN
    // =========================================================

    const API_ASISTENCIAS = "/api/estudiante/asistencias";
    const TAMANIO_PAGINA = 10;

    let paginaActual = 0;
    let tamanioPagina = TAMANIO_PAGINA;
    let totalPaginas = 0;

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
    // INDICADORES GLOBALES
    // =========================================================

    function actualizarIndicadores(resumen) {
        const r = resumen || {
            total: 0,
            presentes: 0,
            tardanzas: 0,
            ausencias: 0,
            justificados: 0,
        };

        if (asistenciasTotal) asistenciasTotal.textContent = r.total ?? 0;
        if (asistenciasPresentes) asistenciasPresentes.textContent = r.presentes ?? 0;
        if (asistenciasTardanzas) asistenciasTardanzas.textContent = r.tardanzas ?? 0;
        if (asistenciasAusencias) asistenciasAusencias.textContent = r.ausencias ?? 0;
        if (asistenciasJustificados) asistenciasJustificados.textContent = r.justificados ?? 0;

        const totalRegistros = r.total ?? 0;
        if (asistenciasCantidad) {
            asistenciasCantidad.textContent =
                `${totalRegistros} ${totalRegistros === 1 ? "registro" : "registros"}`;
        }
    }

    // =========================================================
    // CONTROLES DE PAGINACIÓN CLÁSICA
    // =========================================================

    function ocultarPaginacion() {
        if (!asistenciasPagination) return;
        asistenciasPagination.hidden = true;
        if (asistenciasPageNumbers) {
            asistenciasPageNumbers.innerHTML = "";
        }
    }

    /**
     * Genera la lista de ítems a mostrar (índices base 0 o "..." como separador).
     * Ejemplo con 15 páginas (0..14):
     * - En página 0: [0, 1, 2, 3, "...", 14] -> 1 | 2 | 3 | 4 | ... | 15
     * - En página 6: [0, "...", 5, 6, 7, "...", 14] -> 1 | ... | 6 | 7 | 8 | ... | 15
     */
    function construirRangoPaginas(actual, total) {
        if (total <= 1) {
            return total === 1 ? [0] : [];
        }

        const delta = 1;
        const rango = [];
        const rangoConSaltos = [];
        let anterior;

        for (let i = 0; i < total; i++) {
            const esPrimera = i === 0;
            const esUltima = i === total - 1;
            const dentroDeVentana = i >= actual - delta && i <= actual + delta;

            if (esPrimera || esUltima || dentroDeVentana) {
                rango.push(i);
            }
        }

        for (const i of rango) {
            if (anterior !== undefined) {
                if (i - anterior === 2) {
                    rangoConSaltos.push(anterior + 1);
                } else if (i - anterior > 2) {
                    rangoConSaltos.push("...");
                }
            }
            rangoConSaltos.push(i);
            anterior = i;
        }

        return rangoConSaltos;
    }

    function renderizarBotonesPagina(actual, total) {
        if (!asistenciasPageNumbers) return;

        asistenciasPageNumbers.innerHTML = "";

        const items = construirRangoPaginas(actual, total);
        const fragmento = document.createDocumentFragment();

        items.forEach((item) => {
            if (item === "...") {
                const puntos = crearElemento(
                    "span",
                    "asistencias-pagination__ellipsis",
                    "..."
                );
                puntos.setAttribute("aria-hidden", "true");
                fragmento.appendChild(puntos);
                return;
            }

            const numeroVisible = item + 1;
            const esActiva = item === actual;

            const boton = crearElemento(
                "button",
                esActiva
                    ? "asistencias-pagination__page is-active"
                    : "asistencias-pagination__page",
                String(numeroVisible)
            );
            boton.type = "button";
            boton.setAttribute(
                "aria-label",
                `Ir a la página ${numeroVisible}`
            );

            if (esActiva) {
                boton.setAttribute("aria-current", "page");
                boton.disabled = true;
            } else {
                boton.addEventListener("click", function () {
                    cargarAsistencias(item, tamanioPagina);
                });
            }

            fragmento.appendChild(boton);
        });

        asistenciasPageNumbers.appendChild(fragmento);
    }

    function actualizarPaginacion(data) {
        paginaActual = data.page ?? 0;
        tamanioPagina = TAMANIO_PAGINA;
        totalPaginas = data.totalPages ?? 0;

        if (!asistenciasPagination) return;

        const totalElements = data.totalElements ?? 0;

        if (totalElements === 0) {
            ocultarPaginacion();
            return;
        }

        asistenciasPagination.hidden = false;

        const paginaVisible = totalPaginas === 0 ? 1 : paginaActual + 1;
        const totalPaginasVisible = Math.max(totalPaginas, 1);

        if (asistenciasPageInfo) {
            asistenciasPageInfo.textContent =
                `Página ${paginaVisible} de ${totalPaginasVisible} (${totalElements} ${totalElements === 1 ? "registro" : "registros"})`;
        }

        if (btnPaginaAnterior) {
            btnPaginaAnterior.disabled = Boolean(data.first);
        }

        if (btnPaginaSiguiente) {
            btnPaginaSiguiente.disabled = Boolean(data.last);
        }

        renderizarBotonesPagina(paginaActual, totalPaginas);
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

    const celdaFecha = crearElemento(
        "td",
        "asistencias-table__date",
        formatearFecha(asistencia.fecha)
    );

    const celdaGrupo = crearElemento(
        "td",
        "asistencias-table__group",
        asistencia.grupoNombre || "Sin grupo"
    );

    const celdaHora = crearElemento(
        "td",
        "asistencias-table__time",
        formatearHora(asistencia.horaLlegada)
    );

    const celdaEstado = document.createElement("td");
    celdaEstado.appendChild(
        crearBadgeEstado(asistencia.estado)
    );

    const celdaObservacion = crearElemento(
        "td",
        "asistencias-table__observation",
        asistencia.observacion || "—"
    );

    const celdaEvidencias = crearElemento(
        "td",
        "asistencias-table__evidence"
    );

    // El botón se agregará posteriormente si existen evidencias.
    celdaEvidencias.dataset.asistenciaId = asistencia.id;

    fila.append(
        celdaFecha,
        celdaGrupo,
        celdaHora,
        celdaEstado,
        celdaObservacion,
        celdaEvidencias
    );

    return fila;
}



async function obtenerEvidenciasAsistencia(asistenciaId) {

    const responseJustificacion = await fetch(
        `/api/justificaciones-asistencia/asistencia/${asistenciaId}`,
        {
            method: "GET",
            credentials: "same-origin",
            headers: {
                Accept: "application/json"
            }
        }
    );

    if (responseJustificacion.status === 404) {
        return [];
    }

    if (!responseJustificacion.ok) {
        throw new Error("No se pudo consultar la justificación.");
    }

    const justificacion = await responseJustificacion.json();

    const responseEvidencias = await fetch(
        `/api/evidencias-asistencia/justificacion/${justificacion.id}`,
        {
            method: "GET",
            credentials: "same-origin",
            headers: {
                Accept: "application/json"
            }
        }
    );

    if (!responseEvidencias.ok) {
        throw new Error("No se pudieron consultar las evidencias.");
    }

    const evidencias = await responseEvidencias.json();

    return Array.isArray(evidencias) ? evidencias : [];
}



async function configurarBotonesJustificantes(asistencias) {

    for (const asistencia of asistencias) {

        if (normalizarEstado(asistencia.estado) !== "JUSTIFICADO") {
            continue;
        }

        try {

            const evidencias = await obtenerEvidenciasAsistencia(asistencia.id);

            if (evidencias.length === 0) {
                continue;
            }

            const celda = asistenciasTableBody.querySelector(
                `td[data-asistencia-id="${asistencia.id}"]`
            );

            if (!celda) continue;

            const boton = crearElemento(
                "button",
                "btn btn--secondary asistencia-view-evidence",
                "Ver justificantes"
            );

            boton.type = "button";

            boton.addEventListener("click", function () {
                window.KihonEvidencias.mostrarListaJustificantes(evidencias);
            });

            celda.appendChild(boton);

        } catch (error) {

            console.error(
                `Error consultando justificantes de asistencia ${asistencia.id}:`,
                error
            );
        }
    }
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

        celda.colSpan = 6;
        fila.appendChild(celda);

        asistenciasTableBody.appendChild(fila);
    }

    function mostrarFilaError(mensaje) {
        asistenciasTableBody.innerHTML = "";

        const fila = document.createElement("tr");
        const celda = crearElemento(
            "td",
            "asistencias-table__empty",
            mensaje
        );

        celda.colSpan = 6;
        fila.appendChild(celda);

        asistenciasTableBody.appendChild(fila);

        if (asistenciasEmptyMessage) {
            asistenciasEmptyMessage.hidden = true;
        }
    }

    function renderizarAsistencias(asistencias) {
        asistenciasTableBody.innerHTML = "";

        if (asistenciasEmptyMessage) {
            asistenciasEmptyMessage.hidden = true;
        }

        if (!Array.isArray(asistencias) || asistencias.length === 0) {
            mostrarEstadoVacio();
            ocultarMensaje();
            return;
        }

        const fragmento = document.createDocumentFragment();

        asistencias.forEach((asistencia) => {
            fragmento.appendChild(
                crearFilaAsistencia(asistencia)
            );
        });

        asistenciasTableBody.appendChild(fragmento);

configurarBotonesJustificantes(asistencias);

ocultarMensaje();
    }

    // =========================================================
    // CARGA DE ASISTENCIAS
    // =========================================================

    async function cargarAsistencias(page = paginaActual, size = TAMANIO_PAGINA) {
        try {
            mostrarMensaje(
                "Cargando tu historial de asistencias...",
                "info"
            );

            const params = new URLSearchParams({
                page: String(page),
                size: String(size),
            });

            const response = await fetch(`${API_ASISTENCIAS}?${params.toString()}`, {
                method: "GET",
                credentials: "same-origin",
                headers: {
                    Accept: "application/json",
                },
            });

            if (response.status === 401) {
                ocultarPaginacion();
                mostrarMensaje(
                    "Tu sesión ha expirado. Inicia sesión nuevamente.",
                    "error"
                );
                mostrarFilaError("Sesión no iniciada o expirada.");
                return;
            }

            if (response.status === 403) {
                ocultarPaginacion();
                mostrarMensaje(
                    "No tienes permiso para consultar estas asistencias.",
                    "error"
                );
                mostrarFilaError("Acceso denegado.");
                return;
            }

            if (!response.ok) {
                throw new Error(
                    `Error HTTP: ${response.status}`
                );
            }

            const data = await response.json();

            if (!data || !Array.isArray(data.content)) {
                throw new Error(
                    "La respuesta del servidor no tiene el formato esperado."
                );
            }

            actualizarIndicadores(data.resumen);
            actualizarPaginacion(data);
            renderizarAsistencias(data.content);

        } catch (error) {
            console.error(
                "Error al cargar las asistencias:",
                error
            );

            actualizarIndicadores(null);
            ocultarPaginacion();

            mostrarMensaje(
                "No fue posible cargar tu historial de asistencias. Intenta nuevamente.",
                "error"
            );

            mostrarFilaError(
                "Ocurrió un error al consultar los registros."
            );
        }
    }

    // =========================================================
    // EVENTOS DE PAGINACIÓN
    // =========================================================

    if (btnPaginaAnterior) {
        btnPaginaAnterior.addEventListener("click", function () {
            if (paginaActual > 0) {
                cargarAsistencias(paginaActual - 1, TAMANIO_PAGINA);
            }
        });
    }

    if (btnPaginaSiguiente) {
        btnPaginaSiguiente.addEventListener("click", function () {
            if (paginaActual + 1 < totalPaginas) {
                cargarAsistencias(paginaActual + 1, TAMANIO_PAGINA);
            }
        });
    }

    // =========================================================
    // INICIALIZACIÓN
    // =========================================================

    cargarAsistencias(0, TAMANIO_PAGINA);
});