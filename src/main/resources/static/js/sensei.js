
document.addEventListener("DOMContentLoaded", async function () {

    /*
     * =========================================================
     * CONFIGURACIÓN Y SESIÓN
     * =========================================================
     */

    const username = sessionStorage.getItem("kihonUsername");
    const rol = (sessionStorage.getItem("kihonRol") || "")
        .trim()
        .toUpperCase()
        .replace("PROFESOR", "SENSEI");

    const usernameDisplay = document.getElementById("usernameDisplay");
    const welcomeTitle = document.getElementById("welcomeTitle");

    const totalEstudiantes = document.getElementById("totalEstudiantes");
    const totalGrupos = document.getElementById("totalGrupos");
    const totalClasesHoy = document.getElementById("totalClasesHoy");
    const totalAsistenciasHoy = document.getElementById("totalAsistenciasHoy");

    const clasesHoyContainer = document.getElementById("clasesHoyContainer");
    const gruposContainer = document.getElementById("gruposContainer");

    /*
     * =========================================================
     * VALIDAR SESIÓN LOCAL
     * =========================================================
     */

    function limpiarSesion() {
        sessionStorage.removeItem("kihonUsername");
        sessionStorage.removeItem("kihonRol");
        sessionStorage.removeItem("kihonAuth");
    }

    function redirigirLogin() {
        limpiarSesion();
        window.location.href = "/login";
    }

    if (!username || rol !== "SENSEI") {
        redirigirLogin();
        return;
    }

    /*
     * =========================================================
     * SOLICITUDES HTTP
     * =========================================================
     */

    async function solicitar(url, opciones = {}) {

        const response = await fetch(url, {
            ...opciones,
            credentials: "same-origin",
            headers: {
                Accept: "application/json",
                ...(opciones.headers || {})
            }
        });

        if (response.status === 401) {
            redirigirLogin();
            throw new Error("La sesión ha expirado.");
        }

        if (response.status === 403) {
            throw new Error(
                "No tienes permisos para consultar esta información."
            );
        }

        return response;
    }

    /*
     * =========================================================
     * VERIFICAR USUARIO AUTENTICADO
     * =========================================================
     */

    async function verificarSesion() {

        const response = await solicitar("/api/auth/me", {
            method: "GET"
        });

        if (!response.ok) {
            throw new Error("No se pudo verificar la sesión.");
        }

        const usuario = await response.json();

        const rolServidor = (usuario.rol || "")
            .trim()
            .toUpperCase()
            .replace("PROFESOR", "SENSEI");

        if (rolServidor !== "SENSEI") {
            redirigirLogin();
            throw new Error("El usuario no tiene el rol de Sensei.");
        }

        const nombreUsuario = usuario.username || username;

        if (usernameDisplay) {
            usernameDisplay.textContent = nombreUsuario;
        }

        if (welcomeTitle) {
            welcomeTitle.textContent = `Bienvenido, ${nombreUsuario}`;
        }

        sessionStorage.setItem("kihonUsername", nombreUsuario);
        sessionStorage.setItem("kihonRol", rolServidor);
    }

    /*
     * =========================================================
     * FORMATO DE FECHA
     * =========================================================
     */

    function formatearFecha(fecha) {

        if (!fecha) {
            return "Fecha no disponible";
        }

        const [anio, mes, dia] = fecha.split("-").map(Number);

        const fechaLocal = new Date(anio, mes - 1, dia);

        return fechaLocal.toLocaleDateString("es-PE", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    }

    /*
     * =========================================================
     * FORMATO DE HORA
     * =========================================================
     */

    function formatearHora(hora) {

        if (!hora) {
            return "--:--";
        }

        return hora.substring(0, 5);
    }

    /*
     * =========================================================
     * CREAR ELEMENTO DE TEXTO
     * =========================================================
     */

    function crearElemento(etiqueta, clase, contenido) {

        const elemento = document.createElement(etiqueta);

        if (clase) {
            elemento.className = clase;
        }

        elemento.textContent = contenido ?? "";

        return elemento;
    }

    /*
     * =========================================================
     * ACTUALIZAR INDICADORES
     * =========================================================
     */

    function actualizarIndicadores(datos) {

        if (totalEstudiantes) {
            totalEstudiantes.textContent =
                datos.totalEstudiantes ?? 0;
        }

        if (totalGrupos) {
            totalGrupos.textContent =
                datos.totalGrupos ?? 0;
        }

        if (totalClasesHoy) {
            totalClasesHoy.textContent =
                datos.totalClasesHoy ?? 0;
        }

        if (totalAsistenciasHoy) {
            totalAsistenciasHoy.textContent =
                datos.totalAsistenciasHoy ?? 0;
        }
    }

    /*
     * =========================================================
     * MOSTRAR CLASES DEL DÍA
     * =========================================================
     */

    function mostrarClasesHoy(clases) {

        if (!clasesHoyContainer) {
            return;
        }

        clasesHoyContainer.replaceChildren();

        if (!Array.isArray(clases) || clases.length === 0) {

            clasesHoyContainer.appendChild(
                crearElemento(
                    "p",
                    "",
                    "No tienes clases programadas para hoy."
                )
            );

            return;
        }

        clases.forEach(clase => {

            const tarjeta = document.createElement("article");
            tarjeta.className = "card";

            const encabezado = document.createElement("div");

            encabezado.appendChild(
                crearElemento(
                    "h3",
                    "",
                    clase.nombreGrupo || "Grupo sin nombre"
                )
            );

            encabezado.appendChild(
                crearElemento(
                    "p",
                    "",
                    `${formatearHora(clase.horaInicio)} - ${formatearHora(clase.horaFin)}`
                )
            );

            const informacion = document.createElement("div");

            informacion.appendChild(
                crearElemento(
                    "p",
                    "",
                    `Estudiantes activos: ${clase.estudiantesActivos ?? 0}`
                )
            );

            informacion.appendChild(
                crearElemento(
                    "p",
                    "",
                    `Asistencias registradas: ${clase.asistenciasRegistradas ?? 0}`
                )
            );

            const acciones = document.createElement("div");
            acciones.className = "dashboard-actions";

            const botonAsistencia = document.createElement("a");

            botonAsistencia.className = "btn btn--accent";
            botonAsistencia.href =
                `/sensei/asistencias?grupoId=${encodeURIComponent(clase.grupoId)}`;

            botonAsistencia.textContent = "Registrar asistencia";

            acciones.appendChild(botonAsistencia);

            tarjeta.appendChild(encabezado);
            tarjeta.appendChild(informacion);
            tarjeta.appendChild(acciones);

            clasesHoyContainer.appendChild(tarjeta);
        });
    }

    /*
     * =========================================================
     * MOSTRAR GRUPOS ASIGNADOS
     * =========================================================
     */

    function mostrarGrupos(grupos) {

        if (!gruposContainer) {
            return;
        }

        gruposContainer.replaceChildren();

        if (!Array.isArray(grupos) || grupos.length === 0) {

            gruposContainer.appendChild(
                crearElemento(
                    "p",
                    "",
                    "Actualmente no tienes grupos activos asignados."
                )
            );

            return;
        }

        grupos.forEach(grupo => {

            const tarjeta = document.createElement("article");
            tarjeta.className = "card";

            tarjeta.appendChild(
                crearElemento(
                    "h3",
                    "",
                    grupo.nombre || "Grupo sin nombre"
                )
            );

            tarjeta.appendChild(
                crearElemento(
                    "p",
                    "",
                    `Estudiantes activos: ${grupo.estudiantesActivos ?? 0}`
                )
            );

            const enlace = document.createElement("a");

            enlace.className = "btn btn--secondary";
            enlace.href =
                `/sensei/estudiantes?grupoId=${encodeURIComponent(grupo.grupoId)}`;

            enlace.textContent = "Consultar estudiantes";

            tarjeta.appendChild(enlace);

            gruposContainer.appendChild(tarjeta);
        });
    }

    /*
     * =========================================================
     * CARGAR DASHBOARD
     * =========================================================
     */

    async function cargarDashboard() {

        try {

            const response = await solicitar(
                "/api/sensei/dashboard",
                {
                    method: "GET"
                }
            );

            if (!response.ok) {
                throw new Error(
                    "No se pudo cargar el dashboard del Sensei."
                );
            }

            const datos = await response.json();

            actualizarIndicadores(datos);

            mostrarClasesHoy(datos.clasesHoy);

            mostrarGrupos(datos.grupos);

            if (datos.fecha) {

                const fechaElemento = document.querySelector(
                    ".dashboard-welcome p"
                );

                if (fechaElemento) {
                    fechaElemento.textContent =
                        `Consulta tus grupos, estudiantes y clases programadas. Hoy es ${formatearFecha(datos.fecha)}.`;
                }
            }

        } catch (error) {

            console.error(
                "Error al cargar el dashboard del Sensei:",
                error
            );

            if (clasesHoyContainer) {
                clasesHoyContainer.textContent =
                    error.message || "No se pudieron cargar las clases.";
            }

            if (gruposContainer) {
                gruposContainer.textContent =
                    "No se pudieron cargar los grupos.";
            }
        }
    }

    /*
     * =========================================================
     * INICIALIZACIÓN
     * =========================================================
     */

    try {

        await verificarSesion();

        await cargarDashboard();

    } catch (error) {

        console.error(
            "Error al inicializar el dashboard:",
            error
        );
    }

});
