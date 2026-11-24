
document.addEventListener("DOMContentLoaded", function () {
    /*
     * =========================================================
     * AUTENTICACIÓN Y PETICIONES HTTP
     * =========================================================
     */

    async function apiFetch(url, options = {}) {
        const headers = new Headers(options.headers || {});

        headers.delete("Authorization");
        headers.set("Accept", "application/json");

        return window.fetch(url, {
            ...options,
            credentials: "same-origin",
            headers,
        });
    }

    /*
     * =========================================================
     * ELEMENTOS DEL DOM
     * =========================================================
     */

    const groupsList = document.getElementById("groupsList");
    const groupsCount = document.getElementById("groupsCount");
    const groupsMessage = document.getElementById("groupsMessage");

    /*
     * =========================================================
     * MENSAJES
     * =========================================================
     */

    function mostrarMensaje(elemento, mensaje, tipo = "error") {
        if (!elemento) {
            return;
        }

        elemento.textContent = mensaje;
        elemento.hidden = false;

        elemento.className =
            tipo === "success"
                ? "grupos-message grupos-message--success"
                : "grupos-message grupos-message--error";
    }

    function ocultarMensaje(elemento) {
        if (!elemento) {
            return;
        }

        elemento.hidden = true;
        elemento.textContent = "";
    }

    /*
     * =========================================================
     * MANEJAR SESIÓN NO AUTORIZADA
     * =========================================================
     */

    function manejarNoAutorizado(response) {
        if (response.status === 401) {
            sessionStorage.removeItem("kihonUsername");
            sessionStorage.removeItem("kihonRol");
            sessionStorage.removeItem("kihonAuth");

            window.location.replace("/login");

            return true;
        }

        return false;
    }

    /*
     * =========================================================
     * OBTENER MENSAJE DE ERROR
     * =========================================================
     */

    async function obtenerMensajeError(response, mensajeDefecto) {
        try {
            const errorData = await response.json();

            return (
                errorData.mensaje ||
                errorData.message ||
                mensajeDefecto
            );
        } catch (error) {
            return mensajeDefecto;
        }
    }

    /*
     * =========================================================
     * FORMATEAR HORA
     * =========================================================
     */

    function formatearHora(hora) {
        if (!hora) {
            return "-";
        }

        return String(hora).substring(0, 5);
    }

    /*
     * =========================================================
     * NOMBRE DEL DÍA
     * =========================================================
     */

    function obtenerNombreDia(dia) {
        const dias = {
            LUNES: "Lunes",
            MARTES: "Martes",
            MIERCOLES: "Miércoles",
            JUEVES: "Jueves",
            VIERNES: "Viernes",
            SABADO: "Sábado",
            DOMINGO: "Domingo",
        };

        return dias[String(dia || "").toUpperCase()] || dia || "-";
    }

    /*
     * =========================================================
     * ORDEN DE LOS DÍAS
     * =========================================================
     */

    function obtenerOrdenDia(dia) {
        const orden = {
            LUNES: 1,
            MARTES: 2,
            MIERCOLES: 3,
            JUEVES: 4,
            VIERNES: 5,
            SABADO: 6,
            DOMINGO: 7,
        };

        return orden[String(dia || "").toUpperCase()] || 99;
    }

    /*
     * =========================================================
     * ESCAPAR HTML
     * =========================================================
     */

    function escaparHTML(valor) {
        return String(valor ?? "").replace(/[&<>"']/g, function (caracter) {
            const entidades = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;",
            };

            return entidades[caracter];
        });
    }

    /*
     * =========================================================
     * OBTENER HORARIOS DE UN GRUPO
     * =========================================================
     */

    async function cargarHorariosGrupo(grupoId) {
        const response = await apiFetch(
            `/api/grupo-horarios/grupo/${grupoId}`,
            {
                method: "GET",
            },
        );

        if (manejarNoAutorizado(response)) {
            throw new Error("La sesión ha expirado.");
        }

        if (response.status === 403) {
            throw new Error(
                "No tienes permisos para consultar los horarios de este grupo.",
            );
        }

        if (!response.ok) {
            throw new Error(
                await obtenerMensajeError(
                    response,
                    "No se pudieron obtener los horarios del grupo.",
                ),
            );
        }

        return await response.json();
    }

    /*
     * =========================================================
     * FORMATEAR DÍAS Y HORARIOS
     * =========================================================
     */

    function formatearDiasYHorarios(horarios) {
        if (!horarios || horarios.length === 0) {
            return {
                dias: "Sin días",
                horario: "Sin horario",
            };
        }

        const horariosOrdenados = [...horarios].sort((a, b) => {
            const ordenA = obtenerOrdenDia(a.diaSemana);
            const ordenB = obtenerOrdenDia(b.diaSemana);

            if (ordenA !== ordenB) {
                return ordenA - ordenB;
            }

            return String(a.horaInicio || "").localeCompare(
                String(b.horaInicio || ""),
            );
        });

        const dias = horariosOrdenados
            .map((horario) => obtenerNombreDia(horario.diaSemana))
            .filter((dia, index, array) => array.indexOf(dia) === index);

        const horariosFormateados = horariosOrdenados.map((horario) => ({
            dia: obtenerNombreDia(horario.diaSemana),
            hora: `${formatearHora(horario.horaInicio)} - ${formatearHora(
                horario.horaFin,
            )}`,
        }));

        const primeraHora = horariosFormateados[0].hora;

        const todosMismaHora = horariosFormateados.every(
            (horario) => horario.hora === primeraHora,
        );

        let horarioMostrar;

        if (todosMismaHora) {
            horarioMostrar = primeraHora;
        } else {
            horarioMostrar = horariosFormateados
                .map((horario) => `${horario.dia}: ${horario.hora}`)
                .join(" / ");
        }

        return {
            dias: dias.join(" - "),
            horario: horarioMostrar,
        };
    }

    /*
     * =========================================================
     * OBTENER GRUPOS DEL SENSEI
     * =========================================================
     */

    async function obtenerGrupos() {
        const response = await apiFetch("/api/grupos", {
            method: "GET",
        });

        if (manejarNoAutorizado(response)) {
            throw new Error("La sesión ha expirado.");
        }

        if (response.status === 403) {
            throw new Error(
                "No tienes permisos para consultar los grupos.",
            );
        }

        if (!response.ok) {
            throw new Error(
                await obtenerMensajeError(
                    response,
                    "No se pudieron obtener tus grupos.",
                ),
            );
        }

        return await response.json();
    }

    /*
     * =========================================================
     * CARGAR GRUPOS Y HORARIOS
     * =========================================================
     */

    async function cargarGrupos() {
        if (!groupsList) {
            return;
        }

        ocultarMensaje(groupsMessage);

        groupsList.innerHTML = `
      <div class="grupos-loading">
        <div class="grupos-loading__spinner"></div>
        <span>Cargando tus grupos...</span>
      </div>
    `;

        try {
            const grupos = await obtenerGrupos();

            if (!Array.isArray(grupos)) {
                throw new Error(
                    "La respuesta del servidor no tiene el formato esperado.",
                );
            }

            if (groupsCount) {
                groupsCount.textContent =
                    `${grupos.length} grupo${grupos.length !== 1 ? "s" : ""}`;
            }

            if (grupos.length === 0) {
                groupsList.innerHTML = `
          <div class="grupos-empty">
            No tienes grupos asignados actualmente.
          </div>
        `;

                return;
            }

            /*
             * =====================================================
             * CARGAR HORARIOS DE CADA GRUPO
             * =====================================================
             */

            const gruposConHorarios = await Promise.all(
                grupos.map(async (grupo) => {
                    try {
                        const horarios = await cargarHorariosGrupo(grupo.id);

                        return {
                            ...grupo,
                            horarios: Array.isArray(horarios) ? horarios : [],
                        };
                    } catch (error) {
                        if (error.message === "La sesión ha expirado.") {
                            throw error;
                        }

                        console.error(
                            `Error cargando horarios del grupo ${grupo.id}:`,
                            error,
                        );

                        return {
                            ...grupo,
                            horarios: [],
                            errorHorarios: true,
                        };
                    }
                }),
            );

            /*
             * =====================================================
             * AGRUPAR POR FRECUENCIA
             * =====================================================
             */

            const gruposPorFrecuencia = new Map();

            gruposConHorarios.forEach((grupo) => {
                const frecuenciaId =
                    grupo.frecuenciaId != null
                        ? String(grupo.frecuenciaId)
                        : "sin-frecuencia";

                if (!gruposPorFrecuencia.has(frecuenciaId)) {
                    gruposPorFrecuencia.set(frecuenciaId, {
                        id: grupo.frecuenciaId,
                        nombre: grupo.frecuenciaNombre || "Sin frecuencia",
                        frecuenciaSemanal: grupo.frecuenciaSemanal ?? null,
                        grupos: [],
                    });
                }

                gruposPorFrecuencia.get(frecuenciaId).grupos.push(grupo);
            });

            /*
             * =====================================================
             * ORDENAR FRECUENCIAS
             * =====================================================
             */

            const categorias = Array.from(
                gruposPorFrecuencia.values(),
            ).sort((a, b) => {
                if (a.frecuenciaSemanal == null) {
                    return 1;
                }

                if (b.frecuenciaSemanal == null) {
                    return -1;
                }

                return a.frecuenciaSemanal - b.frecuenciaSemanal;
            });

            /*
             * =====================================================
             * GENERAR TABLA DE CONSULTA
             * =====================================================
             */

            groupsList.innerHTML = `
        <table class="grupos-table">
          <tbody>
            ${categorias
                    .map((categoria, categoriaIndex) => {
                        const categoriaId =
                            `frecuencia-${categoria.id ?? "sin"}-${categoriaIndex}`;

                        const capacidadTotal = categoria.grupos.reduce(
                            (total, grupo) =>
                                total + (Number(grupo.capacidad) || 0),
                            0,
                        );

                        const inscritosTotal = categoria.grupos.reduce(
                            (total, grupo) =>
                                total + (Number(grupo.estudiantesActivos) || 0),
                            0,
                        );

                        const cuposTotal = categoria.grupos.reduce(
                            (total, grupo) =>
                                total + (Number(grupo.cuposDisponibles) || 0),
                            0,
                        );

                        return `
                  <tr
                    class="grupo-frecuencia-header"
                    data-frecuencia-toggle="${categoriaId}"
                  >
                    <td colspan="8">
                      <div class="grupo-frecuencia-titulo">
                        <strong>
                          ${escaparHTML(categoria.nombre)}
                        </strong>

                        <span>
                          (${categoria.grupos.length}
                          grupo${categoria.grupos.length !== 1 ? "s" : ""})
                        </span>
                      </div>

                      <div class="grupo-frecuencia-resumen">
                        <span>
                          Capacidad:
                          <strong>${capacidadTotal}</strong>
                        </span>

                        <span>
                          Inscritos:
                          <strong>${inscritosTotal}</strong>
                        </span>

                        <span>
                          Cupos:
                          <strong>${cuposTotal}</strong>
                        </span>
                      </div>
                    </td>
                  </tr>

                  <tr
                    class="grupo-columnas-header"
                    data-frecuencia-columnas="${categoriaId}"
                  >
                    <th>Grupo</th>
                    <th>Días</th>
                    <th>Horario</th>
                    <th>Capacidad</th>
                    <th>Inscritos</th>
                    <th>Cupos disponibles</th>
                    <th>Estado</th>
                    <th>Información</th>
                  </tr>

                  ${categoria.grupos
                                .map((grupo) => {
                                    const datosHorario = formatearDiasYHorarios(
                                        grupo.horarios,
                                    );

                                    const cuposLlenos =
                                        Number(grupo.cuposDisponibles) === 0;

                                    const grupoActivo = grupo.estado === "ACTIVO";

                                    return `
                        <tr
                          class="grupo-frecuencia-item"
                          data-frecuencia-parent="${categoriaId}"
                        >
                          <td>
                            <div class="grupo-info">
                              <span class="grupo-nombre">
                                ${escaparHTML(grupo.nombre)}
                              </span>

                              <span class="grupo-descripcion">
                                ${escaparHTML(
                                        grupo.descripcion || "Sin descripción",
                                    )}
                              </span>
                            </div>
                          </td>

                          <td>
                            <span class="grupo-dias">
                              ${escaparHTML(datosHorario.dias)}
                            </span>
                          </td>

                          <td>
                            <span class="grupo-horario">
                              ${escaparHTML(datosHorario.horario)}
                            </span>

                            ${grupo.errorHorarios
                                            ? `
                                  <span class="grupo-descripcion">
                                    No se pudieron cargar los horarios.
                                  </span>
                                `
                                            : ""
                                        }
                          </td>

                          <td>
                            <span class="grupo-capacidad">
                              ${Number(grupo.capacidad) || 0}
                            </span>
                          </td>

                          <td>
                            <span class="grupo-inscritos">
                              ${Number(grupo.estudiantesActivos) || 0}
                            </span>
                          </td>

                          <td>
                            <span class="
                              grupo-cupos
                              ${cuposLlenos ? "grupo-cupos--lleno" : ""}
                            ">
                              ${Number(grupo.cuposDisponibles) || 0}
                            </span>
                          </td>

                          <td>
                            <span class="
                              grupo-estado
                              ${grupoActivo
                                            ? "grupo-estado--activo"
                                            : "grupo-estado--inactivo"
                                        }
                            ">
                              ${escaparHTML(grupo.estado || "SIN ESTADO")}
                            </span>
                          </td>

                          <td>
                            <span class="grupo-descripcion">
                              ${grupoActivo
                                            ? "Grupo asignado"
                                            : "Grupo inactivo"
                                        }
                            </span>
                          </td>
                        </tr>
                      `;
                                })
                                .join("")}
                `;
                    })
                    .join("")}
          </tbody>
        </table>
      `;

            /*
             * =====================================================
             * EXPANDIR / CONTRAER CATEGORÍAS
             * =====================================================
             */

            groupsList
                .querySelectorAll("[data-frecuencia-toggle]")
                .forEach((categoriaHeader) => {
                    categoriaHeader.addEventListener("click", function () {
                        const categoriaId = this.dataset.frecuenciaToggle;

                        const gruposCategoria = groupsList.querySelectorAll(
                            `[data-frecuencia-parent="${categoriaId}"]`,
                        );

                        const encabezadoColumnas = groupsList.querySelector(
                            `[data-frecuencia-columnas="${categoriaId}"]`,
                        );

                        const actualmenteVisible = Array.from(
                            gruposCategoria,
                        ).some((fila) => !fila.hidden);

                        gruposCategoria.forEach((fila) => {
                            fila.hidden = actualmenteVisible;
                        });

                        if (encabezadoColumnas) {
                            encabezadoColumnas.hidden = actualmenteVisible;
                        }
                    });
                });
        } catch (error) {
            console.error("Error cargando grupos del Sensei:", error);

            if (groupsList) {
                groupsList.innerHTML = `
          <div class="grupos-empty">
            ${escaparHTML(error.message)}
          </div>
        `;
            }

            mostrarMensaje(groupsMessage, error.message, "error");
        }
    }

    /*
     * =========================================================
     * CARGA INICIAL
     * =========================================================
     */

    cargarGrupos();
});
