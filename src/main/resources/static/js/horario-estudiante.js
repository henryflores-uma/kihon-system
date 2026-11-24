
document.addEventListener("DOMContentLoaded", function () {

    // ==========================================
    // ELEMENTOS DEL DOM
    // ==========================================

    const horarioStatusMessage = document.getElementById(
        "horarioStatusMessage"
    );

    const horarioTotalGrupos = document.getElementById(
        "horarioTotalGrupos"
    );

    const horarioTotalClases = document.getElementById(
        "horarioTotalClases"
    );

    const horarioTotalDias = document.getElementById(
        "horarioTotalDias"
    );

    const horarioSemanaContainer = document.getElementById(
        "horarioSemanaContainer"
    );

    const horarioEmptyMessage = document.getElementById(
        "horarioEmptyMessage"
    );


    // ==========================================
    // CONFIGURACIÓN DE LOS DÍAS
    // ==========================================

    const DIAS_SEMANA = [
        { clave: "LUNES", nombre: "Lunes" },
        { clave: "MARTES", nombre: "Martes" },
        { clave: "MIERCOLES", nombre: "Miércoles" },
        { clave: "JUEVES", nombre: "Jueves" },
        { clave: "VIERNES", nombre: "Viernes" },
        { clave: "SABADO", nombre: "Sábado" },
        { clave: "DOMINGO", nombre: "Domingo" },
    ];


    // ==========================================
    // UTILIDADES DOM
    // ==========================================

    function crearElemento(tag, clase, texto = "") {

        const elemento = document.createElement(tag);

        if (clase) {
            elemento.className = clase;
        }

        elemento.textContent = texto;

        return elemento;
    }


    // ==========================================
    // NORMALIZAR DÍA
    // ==========================================

    function normalizarDia(dia) {

        if (!dia) {
            return "";
        }

        return String(dia)
            .trim()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toUpperCase();
    }


    // ==========================================
    // FORMATEAR HORA
    // ==========================================

    function formatearHora(hora) {

        if (!hora) {
            return "--:--";
        }

        const partes = String(hora).split(":");

        if (partes.length < 2) {
            return hora;
        }

        return `${partes[0].padStart(2, "0")}:${partes[1].padStart(2, "0")}`;
    }


    // ==========================================
    // MENSAJES DE ESTADO
    // ==========================================

    function mostrarMensaje(mensaje, tipo = "info") {

        if (!horarioStatusMessage) {
            return;
        }

        horarioStatusMessage.textContent = mensaje;

        horarioStatusMessage.className =
            `estudiante-status-message estudiante-status-message--${tipo}`;

        horarioStatusMessage.hidden = false;
    }


    function ocultarMensaje() {

        if (!horarioStatusMessage) {
            return;
        }

        horarioStatusMessage.textContent = "";
        horarioStatusMessage.hidden = true;
    }


    // ==========================================
    // LIMPIAR CONTENEDOR
    // ==========================================

    function limpiarHorario() {

        horarioSemanaContainer.innerHTML = "";
    }


    // ==========================================
    // ACTUALIZAR INDICADORES
    // ==========================================

    function actualizarResumen(grupos, horarios) {

        const diasConClases = new Set(
            horarios.map(horario => horario.dia)
        );

        horarioTotalGrupos.textContent = grupos.length;

        horarioTotalClases.textContent = horarios.length;

        horarioTotalDias.textContent = diasConClases.size;
    }


    // ==========================================
    // OBTENER HORARIOS DE LOS GRUPOS
    // ==========================================

    function obtenerHorarios(grupos) {

        const horarios = [];

        grupos.forEach(grupo => {

            if (!Array.isArray(grupo.horarios)) {
                return;
            }

            grupo.horarios.forEach(horario => {

                const diaNormalizado = normalizarDia(
                    horario.diaSemana
                );

                const diaEncontrado = DIAS_SEMANA.find(
                    dia => dia.clave === diaNormalizado
                );

                if (!diaEncontrado) {
                    return;
                }

                horarios.push({
                    grupoId: grupo.id,
                    grupoNombre: grupo.nombre || "Grupo sin nombre",
                    dia: diaEncontrado.clave,
                    diaNombre: diaEncontrado.nombre,
                    horaInicio: horario.horaInicio,
                    horaFin: horario.horaFin,
                });

            });

        });

        return horarios;
    }


    // ==========================================
    // ORDENAR HORARIOS
    // ==========================================

    function obtenerMinutos(hora) {

        if (!hora) {
            return 0;
        }

        const partes = String(hora).split(":");

        const horas = Number(partes[0]) || 0;
        const minutos = Number(partes[1]) || 0;

        return horas * 60 + minutos;
    }


    function ordenarHorarios(horarios) {

        const ordenDias = DIAS_SEMANA.map(
            dia => dia.clave
        );

        return horarios.sort((a, b) => {

            const diferenciaDia =
                ordenDias.indexOf(a.dia) -
                ordenDias.indexOf(b.dia);

            if (diferenciaDia !== 0) {
                return diferenciaDia;
            }

            return obtenerMinutos(a.horaInicio) -
                obtenerMinutos(b.horaInicio);

        });
    }


    // ==========================================
    // CREAR TARJETA DE CLASE
    // ==========================================

    function crearTarjetaClase(horario) {

        const tarjeta = crearElemento(
            "article",
            "horario-class-card"
        );

        const horarioInfo = crearElemento(
            "div",
            "horario-class-card__info"
        );

        const grupoNombre = crearElemento(
            "strong",
            "horario-class-card__group",
            horario.grupoNombre
        );

        const etiqueta = crearElemento(
            "span",
            "horario-class-card__label",
            "Entrenamiento de karate"
        );

        horarioInfo.appendChild(grupoNombre);
        horarioInfo.appendChild(etiqueta);

        const horarioTiempo = crearElemento(
            "div",
            "horario-class-card__time"
        );

        const horaInicio = crearElemento(
            "strong",
            "horario-class-card__start",
            formatearHora(horario.horaInicio)
        );

        const separador = crearElemento(
            "span",
            "horario-class-card__separator",
            "–"
        );

        const horaFin = crearElemento(
            "strong",
            "horario-class-card__end",
            formatearHora(horario.horaFin)
        );

        horarioTiempo.appendChild(horaInicio);
        horarioTiempo.appendChild(separador);
        horarioTiempo.appendChild(horaFin);

        tarjeta.appendChild(horarioInfo);
        tarjeta.appendChild(horarioTiempo);

        return tarjeta;
    }


    // ==========================================
    // CREAR SECCIÓN DE UN DÍA
    // ==========================================

    function crearSeccionDia(dia, horarios) {

        const seccion = crearElemento(
            "article",
            "horario-day"
        );

        const encabezado = crearElemento(
            "div",
            "horario-day__header"
        );

        const nombreDia = crearElemento(
            "h3",
            "horario-day__name",
            dia.nombre
        );

        const cantidad = crearElemento(
            "span",
            "horario-day__count",
            `${horarios.length} ${horarios.length === 1 ? "clase" : "clases"}`
        );

        encabezado.appendChild(nombreDia);
        encabezado.appendChild(cantidad);

        const lista = crearElemento(
            "div",
            "horario-day__classes"
        );

        horarios.forEach(horario => {

            lista.appendChild(
                crearTarjetaClase(horario)
            );

        });

        seccion.appendChild(encabezado);
        seccion.appendChild(lista);

        return seccion;
    }


    // ==========================================
    // RENDERIZAR HORARIO SEMANAL
    // ==========================================

    function renderizarHorario(horarios) {

        limpiarHorario();

        if (horarios.length === 0) {

            horarioEmptyMessage.hidden = false;

            return;
        }

        horarioEmptyMessage.hidden = true;

        DIAS_SEMANA.forEach(dia => {

            const horariosDelDia = horarios.filter(
                horario => horario.dia === dia.clave
            );

            if (horariosDelDia.length === 0) {
                return;
            }

            horarioSemanaContainer.appendChild(
                crearSeccionDia(dia, horariosDelDia)
            );

        });

    }


    // ==========================================
    // CARGAR HORARIO DEL ESTUDIANTE
    // ==========================================

    async function cargarHorario() {

        try {

            const response = await fetch(
                "/api/estudiante/grupos",
                {
                    method: "GET",
                    credentials: "same-origin",
                    headers: {
                        Accept: "application/json",
                    },
                }
            );

            if (response.status === 401) {

                mostrarMensaje(
                    "Tu sesión ha expirado. Inicia sesión nuevamente.",
                    "error"
                );

                return;
            }

            if (response.status === 403) {

                mostrarMensaje(
                    "No tienes permisos para consultar tu horario.",
                    "error"
                );

                return;
            }

            if (!response.ok) {

                throw new Error(
                    `Error al consultar los grupos: ${response.status}`
                );

            }

            const grupos = await response.json();

            if (!Array.isArray(grupos)) {

                throw new Error(
                    "La respuesta del servidor no tiene un formato válido."
                );

            }

            const horarios = obtenerHorarios(grupos);

            ordenarHorarios(horarios);

            actualizarResumen(grupos, horarios);

            renderizarHorario(horarios);

            ocultarMensaje();

        } catch (error) {

            console.error(
                "Error cargando el horario del estudiante:",
                error
            );

            limpiarHorario();

            horarioEmptyMessage.hidden = true;

            mostrarMensaje(
                "No se pudo cargar tu horario. Inténtalo nuevamente.",
                "error"
            );

        }

    }


    // ==========================================
    // INICIALIZAR
    // ==========================================

    cargarHorario();

});
