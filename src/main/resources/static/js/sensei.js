
document.addEventListener("DOMContentLoaded", async function () {

    /*
     * =========================================================
     * CONFIGURACIÓN Y ELEMENTOS DEL DOM
     * =========================================================
     */

    const username = sessionStorage.getItem("kihonUsername");

    const rol = (sessionStorage.getItem("kihonRol") || "")
        .trim()
        .toUpperCase()
        .replace("PROFESOR", "SENSEI");

    const elementos = {
        usernameDisplay: document.getElementById("usernameDisplay"),
        welcomeTitle: document.getElementById("welcomeTitle"),
        profileRoleDisplay: document.getElementById("profileRoleDisplay"),
        userAvatarInitial: document.getElementById("userAvatarInitial"),
        senseiSessionUsername: document.getElementById("senseiSessionUsername"),
        senseiSessionInitial: document.getElementById("senseiSessionInitial"),

        totalEstudiantes: document.getElementById("totalEstudiantes"),
        totalGrupos: document.getElementById("totalGrupos"),
        totalClasesHoy: document.getElementById("totalClasesHoy"),
        totalAsistenciasHoy: document.getElementById("totalAsistenciasHoy"),

        clasesHoyContainer: document.getElementById("clasesHoyContainer"),
        gruposContainer: document.getElementById("gruposContainer"),

        statusMessage: document.getElementById("senseiStatusMessage")
    };

    /*
     * =========================================================
     * VALIDACIÓN DE SESIÓN
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
     * MENSAJES DEL DASHBOARD
     * =========================================================
     */

    function mostrarMensaje(mensaje, tipo = "info") {

        const contenedor = elementos.statusMessage;

        if (!contenedor) {
            return;
        }

        contenedor.textContent = mensaje;
        contenedor.className = `sensei-status-message sensei-status-message--${tipo}`;
        contenedor.hidden = false;
    }

    function ocultarMensaje() {

        if (!elementos.statusMessage) {
            return;
        }

        elementos.statusMessage.hidden = true;
        elementos.statusMessage.textContent = "";
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
     * ACTUALIZAR INFORMACIÓN DEL PERFIL
     * =========================================================
     */

    function actualizarPerfil(nombreUsuario) {

        const nombre = nombreUsuario || "Sensei";

        const inicial = nombre
            .trim()
            .charAt(0)
            .toUpperCase() || "S";

        if (elementos.usernameDisplay) {
            elementos.usernameDisplay.textContent = nombre;
        }

        if (elementos.welcomeTitle) {
            elementos.welcomeTitle.textContent = `Bienvenido, ${nombre}`;
        }

        if (elementos.profileRoleDisplay) {
            elementos.profileRoleDisplay.textContent = "Sensei";
        }

        if (elementos.userAvatarInitial) {
            elementos.userAvatarInitial.textContent = inicial;
        }

        if (elementos.senseiSessionUsername) {
            elementos.senseiSessionUsername.textContent = nombre;
        }

        if (elementos.senseiSessionInitial) {
            elementos.senseiSessionInitial.textContent = inicial;
        }
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

        actualizarPerfil(nombreUsuario);

        sessionStorage.setItem("kihonUsername", nombreUsuario);
        sessionStorage.setItem("kihonRol", rolServidor);
    }

    /*
     * =========================================================
     * FORMATO DE FECHA
     * =========================================================
     */

    function formatearFecha(fecha) {

        if (!fecha || typeof fecha !== "string") {
            return "Fecha no disponible";
        }

        const partes = fecha.split("-").map(Number);

        if (partes.length !== 3 || partes.some(Number.isNaN)) {
            return "Fecha no disponible";
        }

        const [anio, mes, dia] = partes;

        const fechaLocal = new Date(anio, mes - 1, dia);

        if (Number.isNaN(fechaLocal.getTime())) {
            return "Fecha no disponible";
        }

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

        if (!hora || typeof hora !== "string") {
            return "--:--";
        }

        return hora.substring(0, 5);
    }

    /*
     * =========================================================
     * CREAR ELEMENTOS HTML DE FORMA SEGURA
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

        const indicadores = [
            ["totalEstudiantes", datos.totalEstudiantes],
            ["totalGrupos", datos.totalGrupos],
            ["totalClasesHoy", datos.totalClasesHoy],
            ["totalAsistenciasHoy", datos.totalAsistenciasHoy]
        ];

        indicadores.forEach(([elemento, valor]) => {

            if (elementos[elemento]) {
                elementos[elemento].textContent = valor ?? 0;
            }
        });
    }

    /*
     * =========================================================
     * ACTUALIZAR FECHA DEL DASHBOARD
     * =========================================================
     */

    function actualizarFechaDashboard(fecha) {

        const parrafo = document.querySelector(
            ".sensei-welcome .sensei-welcome__content p"
        );

        if (!parrafo || !fecha) {
            return;
        }

        parrafo.textContent =
            `Desde este panel puedes consultar tus actividades y gestionar el seguimiento de tus estudiantes. Hoy es ${formatearFecha(fecha)}.`;
    }

    /*
     * =========================================================
     * MOSTRAR CLASES DEL DÍA
     * =========================================================
     */

    function mostrarClasesHoy(clases) {

        const contenedor = elementos.clasesHoyContainer;

        if (!contenedor) {
            return;
        }

        contenedor.replaceChildren();

        if (!Array.isArray(clases) || clases.length === 0) {

            contenedor.appendChild(
                crearElemento(
                    "p",
                    "sensei-empty-message",
                    "No tienes clases programadas para hoy."
                )
            );

            return;
        }

        clases.forEach(clase => {

            const tarjeta = document.createElement("article");
            tarjeta.className = "card sensei-class-card";

            const encabezado = document.createElement("div");
            encabezado.className = "sensei-class-card__header";

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
                    "sensei-class-card__time",
                    `${formatearHora(clase.horaInicio)} - ${formatearHora(clase.horaFin)}`
                )
            );

            const informacion = document.createElement("div");
            informacion.className = "sensei-class-card__info";

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

            tarjeta.appendChild(encabezado);
            tarjeta.appendChild(informacion);

            if (clase.grupoId != null) {

                const acciones = document.createElement("div");
                acciones.className = "sensei-class-card__actions";

                const botonAsistencia = document.createElement("a");

                botonAsistencia.className = "btn btn--accent";
                botonAsistencia.href =
                    `/sensei/asistencias?grupoId=${encodeURIComponent(clase.grupoId)}`;

                botonAsistencia.textContent = "Registrar asistencia";

                acciones.appendChild(botonAsistencia);
                tarjeta.appendChild(acciones);
            }

            contenedor.appendChild(tarjeta);
        });
    }

    /*
     * =========================================================
     * MOSTRAR GRUPOS ASIGNADOS
     * =========================================================
     */

    function mostrarGrupos(grupos) {

        const contenedor = elementos.gruposContainer;

        if (!contenedor) {
            return;
        }

        contenedor.replaceChildren();

        if (!Array.isArray(grupos) || grupos.length === 0) {

            contenedor.appendChild(
                crearElemento(
                    "p",
                    "sensei-empty-message",
                    "Actualmente no tienes grupos activos asignados."
                )
            );

            return;
        }

        grupos.forEach(grupo => {

            const tarjeta = document.createElement("article");
            tarjeta.className = "card sensei-group-card";

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

            if (grupo.grupoId != null) {

                const enlace = document.createElement("a");

                enlace.className = "btn btn--secondary";

                enlace.href =
                    `/sensei/estudiantes?grupoId=${encodeURIComponent(grupo.grupoId)}`;

                enlace.textContent = "Consultar estudiantes";

                tarjeta.appendChild(enlace);
            }

            contenedor.appendChild(tarjeta);
        });
    }

    /*
     * =========================================================
     * ESTADO DE CARGA
     * =========================================================
     */

    function mostrarCargando() {

        if (elementos.clasesHoyContainer) {
            elementos.clasesHoyContainer.textContent =
                "Cargando clases...";
        }

        if (elementos.gruposContainer) {
            elementos.gruposContainer.textContent =
                "Cargando grupos...";
        }
    }

    function mostrarErrorCarga(mensaje) {

        const texto = mensaje || "No se pudo cargar la información.";

        if (elementos.clasesHoyContainer) {
            elementos.clasesHoyContainer.textContent = texto;
        }

        if (elementos.gruposContainer) {
            elementos.gruposContainer.textContent = texto;
        }

        const indicadores = [
            elementos.totalEstudiantes,
            elementos.totalGrupos,
            elementos.totalClasesHoy,
            elementos.totalAsistenciasHoy
        ];

        indicadores.forEach(elemento => {

            if (elemento) {
                elemento.textContent = "—";
            }
        });
    }

    /*
     * =========================================================
     * CARGAR DASHBOARD
     * =========================================================
     */

    async function cargarDashboard() {

        mostrarCargando();
        ocultarMensaje();

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

            actualizarFechaDashboard(datos.fecha);

        } catch (error) {

            console.error(
                "Error al cargar el dashboard del Sensei:",
                error
            );

            mostrarErrorCarga(
                error.message || "No se pudo cargar el dashboard."
            );

            mostrarMensaje(
                error.message || "Ocurrió un error al cargar el dashboard.",
                "error"
            );
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

        mostrarMensaje(
            error.message || "No se pudo iniciar el panel del Sensei.",
            "error"
        );
    }

});
