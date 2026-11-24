
document.addEventListener("DOMContentLoaded", async function () {

    // =====================================================
    // ELEMENTOS DEL DOM
    // =====================================================

    const gruposContainer = document.getElementById("gruposContainer");
    const gruposTotal = document.getElementById("gruposTotal");
    const gruposStatusMessage = document.getElementById("gruposStatusMessage");

    // =====================================================
    // CONFIGURACIÓN
    // =====================================================

    const API_GRUPOS = "/api/estudiante/grupos";

    // =====================================================
    // UTILIDADES
    // =====================================================

    function crearElemento(etiqueta, clase, texto = "") {
        const elemento = document.createElement(etiqueta);

        if (clase) {
            elemento.className = clase;
        }

        elemento.textContent = texto;

        return elemento;
    }

    function mostrarMensaje(texto, tipo = "info") {
        if (!gruposStatusMessage) {
            return;
        }

        gruposStatusMessage.textContent = texto;
        gruposStatusMessage.className =
            `estudiante-status-message estudiante-status-message--${tipo}`;

        gruposStatusMessage.hidden = false;
    }

    function ocultarMensaje() {
        if (!gruposStatusMessage) {
            return;
        }

        gruposStatusMessage.hidden = true;
        gruposStatusMessage.textContent = "";
    }

    function mostrarEstadoVacio(texto) {
        if (!gruposContainer) {
            return;
        }

        gruposContainer.replaceChildren(
            crearElemento("p", "estudiante-empty-message", texto)
        );
    }

    // =====================================================
    // FORMATEAR HORARIOS
    // =====================================================

    function formatearDia(diaSemana) {
        if (!diaSemana) {
            return "Día no especificado";
        }

        const dias = {
            LUNES: "Lunes",
            MARTES: "Martes",
            MIERCOLES: "Miércoles",
            MIÉRCOLES: "Miércoles",
            JUEVES: "Jueves",
            VIERNES: "Viernes",
            SABADO: "Sábado",
            SÁBADO: "Sábado",
            DOMINGO: "Domingo"
        };

        const diaNormalizado = String(diaSemana)
            .trim()
            .toUpperCase();

        return dias[diaNormalizado] || diaSemana;
    }

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

    // =====================================================
    // CREAR HORARIOS
    // =====================================================

    function crearListaHorarios(horarios) {
        const lista = crearElemento("ul", "estudiante-group-card__schedule");

        if (!Array.isArray(horarios) || horarios.length === 0) {
            lista.appendChild(
                crearElemento("li", "", "No hay horarios registrados.")
            );

            return lista;
        }

        horarios.forEach(function (horario) {
            const item = crearElemento("li", "");

            const dia = formatearDia(horario.diaSemana);
            const horaInicio = formatearHora(horario.horaInicio);
            const horaFin = formatearHora(horario.horaFin);

            item.textContent = `${dia}: ${horaInicio} - ${horaFin}`;

            lista.appendChild(item);
        });

        return lista;
    }

    // =====================================================
    // CREAR TARJETA DE GRUPO
    // =====================================================

    function crearTarjetaGrupo(grupo) {
        const tarjeta = crearElemento("article", "estudiante-group-card");

        // Nombre del grupo
        const titulo = crearElemento(
            "h3",
            "estudiante-group-card__title",
            grupo.nombre || "Grupo sin nombre"
        );

        tarjeta.appendChild(titulo);

        // Estado del grupo
        if (grupo.estado) {
            const estado = String(grupo.estado).toUpperCase();

            const estadoTexto = crearElemento(
                "span",
                "estudiante-group-card__status",
                estado
            );

            tarjeta.appendChild(estadoTexto);
        }

        // Descripción
        if (grupo.descripcion && grupo.descripcion.trim()) {
            tarjeta.appendChild(
                crearElemento(
                    "p",
                    "estudiante-group-card__description",
                    grupo.descripcion
                )
            );
        }

        // Sección de horarios
        tarjeta.appendChild(
            crearElemento(
                "h4",
                "estudiante-group-card__subtitle",
                "Horarios de entrenamiento"
            )
        );

        tarjeta.appendChild(
            crearListaHorarios(grupo.horarios)
        );

        return tarjeta;
    }

    // =====================================================
    // RENDERIZAR GRUPOS
    // =====================================================

    function renderizarGrupos(grupos) {
        if (!gruposContainer) {
            return;
        }

        gruposContainer.replaceChildren();

        if (!Array.isArray(grupos) || grupos.length === 0) {
            gruposTotal.textContent = "0";

            mostrarEstadoVacio(
                "Actualmente no tienes grupos de entrenamiento asignados."
            );

            mostrarMensaje(
                "Cuando tengas una inscripción activa, tu grupo aparecerá en esta sección.",
                "info"
            );

            return;
        }

        gruposTotal.textContent = grupos.length;

        const fragmento = document.createDocumentFragment();

        grupos.forEach(function (grupo) {
            fragmento.appendChild(crearTarjetaGrupo(grupo));
        });

        gruposContainer.appendChild(fragmento);
    }

    // =====================================================
    // CARGAR GRUPOS DESDE EL BACKEND
    // =====================================================

    async function cargarGrupos() {
        if (!gruposContainer || !gruposTotal) {
            console.error("No se encontraron los elementos de la vista Mis grupos.");
            return;
        }

        gruposTotal.textContent = "—";

        mostrarEstadoVacio("Cargando tus grupos...");

        ocultarMensaje();

        try {
            const response = await fetch(API_GRUPOS, {
                method: "GET",
                credentials: "same-origin",
                headers: {
                    Accept: "application/json"
                }
            });

            if (response.status === 401 || response.status === 403) {
                mostrarEstadoVacio(
                    "No tienes autorización para consultar tus grupos."
                );

                mostrarMensaje(
                    "Tu sesión puede haber expirado. Vuelve a iniciar sesión.",
                    "error"
                );

                return;
            }

            if (!response.ok) {
                throw new Error(
                    `Error al consultar los grupos. Código HTTP: ${response.status}`
                );
            }

            const grupos = await response.json();

            renderizarGrupos(grupos);

        } catch (error) {
            console.error("Error cargando los grupos del estudiante:", error);

            gruposTotal.textContent = "—";

            mostrarEstadoVacio(
                "No fue posible cargar la información de tus grupos."
            );

            mostrarMensaje(
                "Ocurrió un problema al consultar tus grupos. Intenta nuevamente.",
                "error"
            );
        }
    }

    // =====================================================
    // INICIALIZAR
    // =====================================================

    await cargarGrupos();

});
