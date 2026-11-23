
document.addEventListener("DOMContentLoaded", async function () {

    // ==========================================
    // ELEMENTOS DEL DOM
    // ==========================================

    const elementos = {

        usernameDisplay: document.getElementById("usernameDisplay"),
        profileRoleDisplay: document.getElementById("profileRoleDisplay"),
        roleDisplay: document.getElementById("roleDisplay"),
        userAvatarInitial: document.getElementById("userAvatarInitial"),

        secretariaCurrentDate: document.getElementById("secretariaCurrentDate"),

        totalStudents: document.getElementById("totalStudents"),
        activeStudents: document.getElementById("activeStudents"),
        activeGroups: document.getElementById("activeGroups"),
        todayAttendance: document.getElementById("todayAttendance"),

        secretariaSessionInitial: document.getElementById("secretariaSessionInitial"),
        secretariaSessionUsername: document.getElementById("secretariaSessionUsername"),

        statusMessage: document.getElementById("secretariaStatusMessage")

    };


    // ==========================================
    // CONFIGURACIÓN
    // ==========================================

    const API_BASE = "/api";

    const nombreRol = "Secretaria";

    let usuarioActual = null;


    // ==========================================
    // AUTENTICACIÓN Y VALIDACIÓN DE SESIÓN
    // ==========================================

    async function verificarSesion() {

        try {

            const respuesta = await fetch(`${API_BASE}/auth/me`, {
                method: "GET",
                credentials: "same-origin",
                headers: {
                    "Accept": "application/json"
                }
            });


            if (respuesta.status === 401) {

                sessionStorage.removeItem("kihonUsername");
                sessionStorage.removeItem("kihonRol");
                sessionStorage.removeItem("kihonAuth");

                window.location.replace("/login");

                return false;

            }


            if (!respuesta.ok) {

                throw new Error(
                    `No se pudo verificar la sesión (${respuesta.status}).`
                );

            }


            usuarioActual = await respuesta.json();

            const rolServidor = usuarioActual.rol;


            // ADMIN también puede acceder a las vistas compartidas.

            if (rolServidor !== "SECRETARIA" && rolServidor !== "ADMIN") {

                window.location.replace("/login");

                return false;

            }


            // Sincronizar información de la sesión.

            sessionStorage.setItem(
                "kihonUsername",
                usuarioActual.username
            );

            sessionStorage.setItem(
                "kihonRol",
                rolServidor
            );

            sessionStorage.removeItem("kihonAuth");


            return true;

        } catch (error) {

            console.error(
                "Error al verificar la sesión:",
                error
            );

            mostrarMensaje(
                "No se pudo verificar tu sesión. Intenta iniciar sesión nuevamente.",
                "error"
            );

            return false;

        }

    }


    // ==========================================
    // INFORMACIÓN DE USUARIO
    // ==========================================

    function inicializarUsuario() {

        const nombreUsuario = usuarioActual?.username || "Usuario";

        const inicial = nombreUsuario
            .trim()
            .charAt(0)
            .toUpperCase() || "U";


        if (elementos.usernameDisplay) {
            elementos.usernameDisplay.textContent = nombreUsuario;
        }

        if (elementos.profileRoleDisplay) {
            elementos.profileRoleDisplay.textContent = nombreRol;
        }

        if (elementos.roleDisplay) {
            elementos.roleDisplay.textContent = nombreRol;
        }

        if (elementos.userAvatarInitial) {
            elementos.userAvatarInitial.textContent = inicial;
        }

        if (elementos.secretariaSessionInitial) {
            elementos.secretariaSessionInitial.textContent = inicial;
        }

        if (elementos.secretariaSessionUsername) {
            elementos.secretariaSessionUsername.textContent = nombreUsuario;
        }

    }


    // ==========================================
    // FECHA LOCAL
    // ==========================================

    function obtenerFechaLocal() {

        const fecha = new Date();

        const anio = fecha.getFullYear();

        const mes = String(fecha.getMonth() + 1).padStart(2, "0");

        const dia = String(fecha.getDate()).padStart(2, "0");

        return `${anio}-${mes}-${dia}`;

    }


    // ==========================================
    // MOSTRAR FECHA ACTUAL
    // ==========================================

    function mostrarFechaActual() {

        if (!elementos.secretariaCurrentDate) {
            return;
        }

        const fecha = new Date();

        const fechaFormateada = fecha.toLocaleDateString("es-PE", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });

        elementos.secretariaCurrentDate.textContent =
            fechaFormateada.charAt(0).toUpperCase() +
            fechaFormateada.slice(1);

    }


    // ==========================================
    // MENSAJES DEL DASHBOARD
    // ==========================================

    function mostrarMensaje(mensaje, tipo = "info") {

        if (!elementos.statusMessage) {
            return;
        }

        elementos.statusMessage.textContent = mensaje;

        elementos.statusMessage.className =
            `secretaria-status-message secretaria-status-message--${tipo}`;

        elementos.statusMessage.hidden = false;

    }


    function ocultarMensaje() {

        if (!elementos.statusMessage) {
            return;
        }

        elementos.statusMessage.textContent = "";

        elementos.statusMessage.hidden = true;

    }


    // ==========================================
    // SOLICITUDES A LA API
    // ==========================================

    async function apiFetch(url, opciones = {}) {

        const headers = new Headers(opciones.headers || {});

        headers.set("Accept", "application/json");


        const respuesta = await fetch(url, {

            ...opciones,

            credentials: "same-origin",

            headers

        });


        // --------------------------------------
        // SESIÓN EXPIRADA
        // --------------------------------------

        if (respuesta.status === 401) {

            sessionStorage.removeItem("kihonUsername");
            sessionStorage.removeItem("kihonRol");
            sessionStorage.removeItem("kihonAuth");

            window.location.replace("/login");

            throw new Error("La sesión ha expirado.");

        }


        // --------------------------------------
        // ACCESO DENEGADO
        // --------------------------------------

        if (respuesta.status === 403) {

            throw new Error(
                "No tienes permisos para consultar esta información."
            );

        }


        // --------------------------------------
        // OTROS ERRORES
        // --------------------------------------

        if (!respuesta.ok) {

            throw new Error(
                `Error al consultar el servidor (${respuesta.status}).`
            );

        }


        // --------------------------------------
        // RESPUESTA SIN CONTENIDO
        // --------------------------------------

        if (respuesta.status === 204) {
            return null;
        }


        return await respuesta.json();

    }


    // ==========================================
    // NORMALIZAR LISTAS
    // ==========================================

    function obtenerLista(respuesta) {

        if (Array.isArray(respuesta)) {
            return respuesta;
        }

        if (Array.isArray(respuesta?.content)) {
            return respuesta.content;
        }

        if (Array.isArray(respuesta?.data)) {
            return respuesta.data;
        }

        return [];

    }


    // ==========================================
    // CARGAR ESTUDIANTES
    // ==========================================

    async function cargarEstudiantes() {

        try {

            const respuesta = await apiFetch(
                `${API_BASE}/estudiantes`
            );

            const estudiantes = obtenerLista(respuesta);


            const estudiantesActivos = estudiantes.filter(
                estudiante => estudiante.estado === "ACTIVO"
            );


            if (elementos.totalStudents) {

                elementos.totalStudents.textContent =
                    estudiantes.length;

            }


            if (elementos.activeStudents) {

                elementos.activeStudents.textContent =
                    estudiantesActivos.length;

            }


        } catch (error) {

            console.error(
                "Error al cargar estudiantes:",
                error
            );

            if (elementos.totalStudents) {
                elementos.totalStudents.textContent = "—";
            }

            if (elementos.activeStudents) {
                elementos.activeStudents.textContent = "—";
            }

            throw error;

        }

    }


    // ==========================================
    // CARGAR GRUPOS ACTIVOS
    // ==========================================

    async function cargarGrupos() {

        try {

            const respuesta = await apiFetch(
                `${API_BASE}/grupos?estado=ACTIVO`
            );

            const grupos = obtenerLista(respuesta);


            if (elementos.activeGroups) {

                elementos.activeGroups.textContent =
                    grupos.length;

            }


        } catch (error) {

            console.error(
                "Error al cargar grupos:",
                error
            );

            if (elementos.activeGroups) {
                elementos.activeGroups.textContent = "—";
            }

            throw error;

        }

    }


    // ==========================================
    // CARGAR ASISTENCIAS DEL DÍA
    // ==========================================

    async function cargarAsistenciasHoy() {

        try {

            const fecha = obtenerFechaLocal();

            const respuesta = await apiFetch(
                `${API_BASE}/reportes/asistencias/diario?fecha=${fecha}`
            );


            const total = Number(respuesta?.total ?? 0);


            if (elementos.todayAttendance) {

                elementos.todayAttendance.textContent =
                    Number.isFinite(total) ? total : "—";

            }


        } catch (error) {

            console.error(
                "Error al cargar asistencias:",
                error
            );

            if (elementos.todayAttendance) {
                elementos.todayAttendance.textContent = "—";
            }

            throw error;

        }

    }


    // ==========================================
    // CARGAR INDICADORES
    // ==========================================

    async function cargarDashboard() {

        ocultarMensaje();


        const resultados = await Promise.allSettled([

            cargarEstudiantes(),

            cargarGrupos(),

            cargarAsistenciasHoy()

        ]);


        const errores = resultados.filter(
            resultado => resultado.status === "rejected"
        );


        if (errores.length > 0) {

            const errorSesion = errores.some(
                resultado =>
                    resultado.reason?.message ===
                    "La sesión ha expirado."
            );

            if (errorSesion) {
                return;
            }


            const errorPermisos = errores.some(
                resultado =>
                    resultado.reason?.message?.includes(
                        "No tienes permisos"
                    )
            );


            if (errorPermisos) {

                mostrarMensaje(
                    "No tienes permisos para consultar algunos indicadores. Verifica los permisos de SECRETARIA en el servidor.",
                    "error"
                );

                return;

            }


            mostrarMensaje(
                "No se pudo cargar toda la información del dashboard. Algunos indicadores podrían no estar disponibles.",
                "error"
            );

        }

    }


    // ==========================================
    // INICIALIZAR DASHBOARD
    // ==========================================

    async function inicializarDashboard() {

        const sesionValida = await verificarSesion();

        if (!sesionValida) {
            return;
        }


        inicializarUsuario();

        mostrarFechaActual();

        await cargarDashboard();

    }


    // ==========================================
    // INICIO
    // ==========================================

    inicializarDashboard();

});
