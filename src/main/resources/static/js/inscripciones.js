
document.addEventListener("DOMContentLoaded", () => {

    // ==========================================
    // AUTENTICACIÓN Y SESIÓN
    // ==========================================

    const username = sessionStorage.getItem("kihonUsername");
    const rol = sessionStorage.getItem("kihonRol");

    if (!username || !rol || !["ADMIN", "SECRETARIA"].includes(rol)) {
        window.location.replace("/login");
        return;
    }

    // ==========================================
    // CSRF Y PETICIONES API
    // ==========================================

    async function obtenerTokenCSRF() {

        const response = await window.fetch("/api/auth/csrf", {
            method: "GET",
            credentials: "same-origin",
            headers: {
                Accept: "application/json"
            }
        });

        if (!response.ok) {
            throw new Error("No se pudo obtener el token CSRF.");
        }

        const data = await response.json();

        return data.token;

    }


    async function solicitar(url, opciones = {}) {

        const metodo = (opciones.method || "GET").toUpperCase();

        const headersPeticion = new Headers(opciones.headers || {});

        headersPeticion.delete("Authorization");

        headersPeticion.set("Accept", "application/json");

        if (!["GET", "HEAD", "OPTIONS", "TRACE"].includes(metodo)) {

            const csrfToken = await obtenerTokenCSRF();

            headersPeticion.set("X-CSRF-TOKEN", csrfToken);

        }

        const response = await window.fetch(url, {
            ...opciones,
            method: metodo,
            credentials: "same-origin",
            headers: headersPeticion
        });

        if (response.status === 401 || response.status === 403) {

            sessionStorage.removeItem("kihonUsername");
            sessionStorage.removeItem("kihonRol");
            sessionStorage.removeItem("kihonAuth");

            window.location.replace("/login");

            throw new Error(
                response.status === 401
                    ? "La sesión ha expirado."
                    : "No tienes autorización para realizar esta operación."
            );

        }

        const texto = await response.text();

        let data = null;

        if (texto) {

            try {
                data = JSON.parse(texto);
            } catch {
                data = texto;
            }

        }

        if (!response.ok) {

            const mensaje =
                typeof data === "string"
                    ? data
                    : data?.message || data?.error || "Ocurrió un error.";

            throw new Error(mensaje);

        }

        return data;

    }


    // ==========================================
    // ELEMENTOS DEL DOM
    // ==========================================

    const elementos = {

        // Navegación
        tabs: document.querySelectorAll("[data-tab]"),
        listadoView: document.getElementById("listadoView"),
        gruposView: document.getElementById("gruposView"),
        nuevaView: document.getElementById("nuevaInscripcionView"),
        editarView: document.getElementById("editarInscripcionView"),

        // Encabezado
        newButton: document.getElementById("newInscripcionButton"),
        newFromGroupButton: document.getElementById("newInscripcionFromGroupButton"),

        // Estadísticas
        totalEstudiantes: document.getElementById("totalEstudiantesInscritos"),
        totalAsignaciones: document.getElementById("totalAsignaciones"),
        totalGrupos: document.getElementById("totalGruposInscritos"),
        totalCupos: document.getElementById("totalCuposDisponibles"),

        // Listado general
        search: document.getElementById("searchInscripciones"),
        filterGroup: document.getElementById("filterGrupo"),
        filterStatus: document.getElementById("filterEstado"),
        counter: document.getElementById("inscripcionesCounter"),
        listMessage: document.getElementById("inscripcionesMessage"),
        tableBody: document.getElementById("inscripcionesTableBody"),
        pagination: document.getElementById("inscripcionesPagination"),
        previousPage: document.getElementById("previousInscripcionesPage"),
        nextPage: document.getElementById("nextInscripcionesPage"),
        pageInfo: document.getElementById("inscripcionesPageInfo"),

        // Nueva inscripción
        form: document.getElementById("inscripcionForm"),
        studentSearch: document.getElementById("studentSearch"),
        studentSearchResults: document.getElementById("studentSearchResults"),
        studentSearchMessage: document.getElementById("studentSearchMessage"),

        groupsList: document.getElementById("inscripcionGroupsList"),

        studentInfo: document.getElementById("selectedStudentInfo"),
        studentAvatar: document.getElementById("studentAvatar"),
        studentName: document.getElementById("studentInfoName"),
        studentDni: document.getElementById("studentInfoDni"),
        studentAge: document.getElementById("studentInfoAge"),
        studentBelt: document.getElementById("studentInfoBelt"),
        studentGuardian: document.getElementById("studentInfoGuardian"),
        studentPhone: document.getElementById("studentInfoPhone"),

        selectedCount: document.getElementById("selectedGroupsCount"),
        selectedSummary: document.getElementById("selectedGroupsSummary"),
        currentDate: document.getElementById("inscripcionCurrentDate"),

        formMessage: document.getElementById("inscripcionFormMessage"),
        cancelButton: document.getElementById("cancelInscripcionButton"),
        confirmButton: document.getElementById("confirmInscripcionButton"),

        // Inscritos por grupo
        groupsViewList: document.getElementById("inscripcionesGroupsList"),
        selectedGroupInfo: document.getElementById("selectedGroupInfo"),
        selectedGroupName: document.getElementById("selectedGroupName"),
        selectedGroupSchedule: document.getElementById("selectedGroupSchedule"),
        selectedGroupAvailability: document.getElementById("selectedGroupAvailability"),
        selectedGroupSensei: document.getElementById("selectedGroupSensei"),
        selectedGroupCapacity: document.getElementById("selectedGroupCapacity"),
        selectedGroupCapacityBar: document.getElementById("selectedGroupCapacityBar"),

        searchGroupStudents: document.getElementById("searchGroupStudents"),
        filterGroupStudentStatus: document.getElementById("filterGroupStudentStatus"),
        groupStudentsTableBody: document.getElementById("groupStudentsTableBody"),
        groupStudentsPagination: document.getElementById("groupStudentsPagination"),
        previousGroupStudentsPage: document.getElementById("previousGroupStudentsPage"),
        nextGroupStudentsPage: document.getElementById("nextGroupStudentsPage"),
        groupStudentsPageInfo: document.getElementById("groupStudentsPageInfo"),

        // Edición
        editStudentAvatar: document.getElementById("editStudentAvatar"),
        editStudentName: document.getElementById("editStudentName"),
        editStudentDni: document.getElementById("editStudentDni"),
        editStudentAge: document.getElementById("editStudentAge"),
        editStudentBelt: document.getElementById("editStudentBelt"),

        currentStudentGroups: document.getElementById("currentStudentGroups"),
        newStudentGroups: document.getElementById("newStudentGroups"),
        editGroupsSummary: document.getElementById("editGroupsSummary"),

        cancelEditButton: document.getElementById("cancelEditInscripcionButton"),
        saveEditButton: document.getElementById("saveEditInscripcionButton"),

        // Modal
        removeModal: document.getElementById("removeInscripcionModal"),
        removeTitle: document.getElementById("removeInscripcionTitle"),
        removeMessage: document.getElementById("removeInscripcionMessage"),
        cancelRemoveButton: document.getElementById("cancelRemoveInscripcionButton"),
        confirmRemoveButton: document.getElementById("confirmRemoveInscripcionButton"),

    };


    // ==========================================
    // VARIABLES
    // ==========================================

    let estudiantes = [];
    let grupos = [];
    let inscripciones = [];

    let horariosPorGrupo = {};
    let apoderadosPorEstudiante = {};

    let paginaActual = 1;
    let paginaGrupoActual = 1;

    const registrosPorPagina = 8;

    let estudianteSeleccionado = null;
    let gruposSeleccionados = new Set();
    let asignacionesEstudianteActual = [];

    let grupoSeleccionado = null;
    let estudiantesGrupoActual = [];

    let estudianteEdicion = null;
    let asignacionesEdicion = [];
    let gruposEdicionSeleccionados = new Set();

    let asignacionPendienteRetiro = null;

    let temporizadorBusqueda = null;
    let temporizadorBusquedaGrupo = null;


    // ==========================================
    // UTILIDADES
    // ==========================================

    function escaparHTML(valor) {

        return String(valor ?? "").replace(/[&<>"']/g, (caracter) => {

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


    function obtenerNombreCompleto(estudiante) {

        return `${estudiante?.nombre || ""} ${estudiante?.apellido || ""}`.trim();

    }


    function obtenerEdad(fechaNacimiento) {

        if (!fechaNacimiento) return "-";

        const nacimiento = new Date(`${fechaNacimiento}T00:00:00`);

        if (Number.isNaN(nacimiento.getTime())) return "-";

        const hoy = new Date();

        let edad = hoy.getFullYear() - nacimiento.getFullYear();

        const diferenciaMes = hoy.getMonth() - nacimiento.getMonth();

        if (
            diferenciaMes < 0 ||
            (diferenciaMes === 0 && hoy.getDate() < nacimiento.getDate())
        ) {
            edad--;
        }

        return edad >= 0 ? `${edad} años` : "-";

    }


    function formatearHora(hora) {

        if (!hora) return "-";

        return String(hora).substring(0, 5);

    }


    function formatearFecha(fecha) {

        if (!fecha) return "No disponible";

        // Spring Boot puede devolver LocalDate o LocalDateTime.
        // Tomamos YYYY-MM-DD directamente para evitar desfases de zona horaria.
        const fechaTexto = String(fecha).trim();
        const coincidencia = fechaTexto.match(/^(\d{4})-(\d{2})-(\d{2})/);

        if (!coincidencia) return "No disponible";

        const anio = Number(coincidencia[1]);
        const mes = Number(coincidencia[2]);
        const dia = Number(coincidencia[3]);

        const valor = new Date(anio, mes - 1, dia);

        if (
            Number.isNaN(valor.getTime()) ||
            valor.getFullYear() !== anio ||
            valor.getMonth() !== mes - 1 ||
            valor.getDate() !== dia
        ) {
            return "No disponible";
        }

        return valor.toLocaleDateString("es-PE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });

    }


    function obtenerFechaActual() {

        return new Date().toLocaleDateString("es-PE", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });

    }


    function mostrarMensaje(elemento, mensaje, tipo = "error") {

        if (!elemento) return;

        elemento.textContent = mensaje;

        elemento.className =
            `inscripciones-message inscripciones-message--${tipo}`;

        elemento.hidden = false;

    }


    function ocultarMensaje(elemento) {

        if (!elemento) return;

        elemento.textContent = "";
        elemento.hidden = true;
        elemento.className = "inscripciones-message";

    }


    function mostrarErrorTabla(mensaje) {

        elementos.tableBody.innerHTML = `
            <tr>
                <td colspan="6">${escaparHTML(mensaje)}</td>
            </tr>
        `;

    }


    function obtenerGrupo(grupoId) {

        return grupos.find(
            (grupo) => Number(grupo.id) === Number(grupoId)
        );

    }


    function obtenerEstudiante(estudianteId) {

        return estudiantes.find(
            (estudiante) => Number(estudiante.id) === Number(estudianteId)
        );

    }


    // ==========================================
    // CARGAR INFORMACIÓN
    // ==========================================

    async function cargarEstudiantes() {

        const respuesta = await solicitar("/api/estudiantes");

        estudiantes = (Array.isArray(respuesta) ? respuesta : [])
            .filter((estudiante) => estudiante.estado === "ACTIVO");

    }


    async function cargarGrupos() {

        const respuesta = await solicitar("/api/grupos");

        grupos = (Array.isArray(respuesta) ? respuesta : [])
            .filter((grupo) => grupo.estado === "ACTIVO");

        cargarFiltroGrupos();

        await cargarHorarios();
    }

    async function cargarHorarios() {

        const resultados = await Promise.all(

            grupos.map(async (grupo) => {

                try {

                    const horarios = await solicitar(
                        `/api/grupo-horarios/grupo/${grupo.id}`
                    );

                    return [
                        grupo.id,
                        Array.isArray(horarios) ? horarios : [],
                    ];

                } catch (error) {

                    console.error(
                        `Error al cargar horarios del grupo ${grupo.id}:`,
                        error
                    );

                    return [grupo.id, []];

                }

            })

        );

        horariosPorGrupo = Object.fromEntries(resultados);

    }


    async function cargarInscripciones() {

        elementos.tableBody.innerHTML = `
            <tr>
                <td colspan="6">Cargando inscripciones...</td>
            </tr>
        `;

        const respuesta = await solicitar("/api/estudiantes-grupos");

        inscripciones = Array.isArray(respuesta) ? respuesta : [];

        actualizarEstadisticas();

        renderizarInscripciones();

    }


    function cargarFiltroGrupos() {

        elementos.filterGroup.innerHTML = `
            <option value="">Todos los grupos</option>
        `;

        grupos.forEach((grupo) => {

            const option = document.createElement("option");

            option.value = grupo.id;
            option.textContent = grupo.nombre;

            elementos.filterGroup.appendChild(option);

        });

    }


    // ==========================================
    // ESTADÍSTICAS
    // ==========================================

    function actualizarEstadisticas() {

        const activas = inscripciones.filter(
            (item) => item.estado === "ACTIVO"
        );

        const estudiantesUnicos = new Set(
            activas.map((item) => item.estudianteId)
        );

        const gruposUnicos = new Set(
            activas.map((item) => item.grupoId)
        );

        const cuposDisponibles = grupos.reduce(
            (total, grupo) =>
                total + Number(grupo.cuposDisponibles || 0),
            0
        );

        elementos.totalEstudiantes.textContent =
            estudiantesUnicos.size;

        elementos.totalAsignaciones.textContent =
            activas.length;

        elementos.totalGrupos.textContent =
            gruposUnicos.size;

        elementos.totalCupos.textContent =
            `${cuposDisponibles} cupos disponibles`;

    }


    // ==========================================
    // LISTADO GENERAL
    // ==========================================

    function obtenerInscripcionesAgrupadas() {

        const agrupadas = new Map();

        inscripciones.forEach((inscripcion) => {

            const estudianteId = Number(inscripcion.estudianteId);

            if (!agrupadas.has(estudianteId)) {

                const estudiante = obtenerEstudiante(estudianteId);

                agrupadas.set(estudianteId, {

                    estudianteId,

                    nombre:
                        estudiante
                            ? obtenerNombreCompleto(estudiante)
                            : inscripcion.estudianteNombre || "Estudiante",

                    documento: estudiante?.documento || "-",

                    asignaciones: [],

                });

            }

            agrupadas.get(estudianteId).asignaciones.push(inscripcion);

        });

        return [...agrupadas.values()];

    }


    function renderizarInscripciones() {

        const busqueda = elementos.search.value.trim().toLowerCase();

        const grupoFiltro = elementos.filterGroup.value;

        const estadoFiltro = elementos.filterStatus.value;

        let registros = obtenerInscripcionesAgrupadas();

        registros = registros.filter((registro) => {

            const coincideBusqueda =
                registro.nombre.toLowerCase().includes(busqueda) ||
                String(registro.documento).toLowerCase().includes(busqueda);

            const asignacionesFiltradas =
                registro.asignaciones.filter((asignacion) => {

                    const coincideGrupo =
                        !grupoFiltro ||
                        Number(asignacion.grupoId) === Number(grupoFiltro);

                    const coincideEstado =
                        !estadoFiltro ||
                        asignacion.estado === estadoFiltro;

                    return coincideGrupo && coincideEstado;

                });

            registro.asignacionesVisibles = asignacionesFiltradas;

            return coincideBusqueda && asignacionesFiltradas.length > 0;

        });

        elementos.counter.textContent =
            `${registros.length} estudiantes`;

        if (registros.length === 0) {

            elementos.tableBody.innerHTML = `
                <tr>
                    <td colspan="6">No se encontraron inscripciones.</td>
                </tr>
            `;

            actualizarPaginacion(0);

            return;

        }

        const totalPaginas = Math.ceil(
            registros.length / registrosPorPagina
        );

        paginaActual = Math.min(paginaActual, totalPaginas);

        const inicio = (paginaActual - 1) * registrosPorPagina;

        const registrosPagina = registros.slice(
            inicio,
            inicio + registrosPorPagina
        );

        elementos.tableBody.innerHTML = registrosPagina.map((registro) => {

            const gruposHTML = registro.asignacionesVisibles
                .map((asignacion) => {

                    const activo = asignacion.estado === "ACTIVO";

                    return `

                        <div class="inscripciones-assignment-item">

                            <span>
                                ${escaparHTML(asignacion.grupoNombre)}
                            </span>

                            <span class="inscripcion-status ${activo
                            ? "inscripcion-status--active"
                            : "inscripcion-status--inactive"
                        }">
                                ${activo ? "Activo" : "Inactivo"}
                            </span>

                            <button
                                type="button"
                                class="btn btn--outline"
                                data-action="toggle-status"
                                data-id="${Number(asignacion.id)}"
                                data-status="${escaparHTML(asignacion.estado)}"
                            >
                                ${activo ? "Inactivar" : "Activar"}
                            </button>

                        </div>

                    `;

                })
                .join("");

            const estados = registro.asignacionesVisibles.map(
                (item) => item.estado
            );

            const fechasInscripcion = registro.asignacionesVisibles
                .map((item) => item.fechaInscripcion)
                .filter(Boolean)
                .sort((a, b) => String(a).localeCompare(String(b)));

            // La tabla agrupa varios grupos por estudiante: se muestra
            // la fecha más antigua entre las asignaciones visibles.
            const fechaInscripcion = fechasInscripcion.length > 0
                ? formatearFecha(fechasInscripcion[0])
                : "No disponible";

            const estadoGeneral = estados.every(
                (estado) => estado === "ACTIVO"
            )
                ? "Activo"
                : estados.every(
                    (estado) => estado === "INACTIVO"
                )
                    ? "Inactivo"
                    : "Mixto";

            return `

                <tr>

                    <td>${escaparHTML(registro.nombre)}</td>

                    <td>${escaparHTML(registro.documento)}</td>

                    <td>
                        <div class="inscripciones-assignment-list">
                            ${gruposHTML}
                        </div>
                    </td>

                    <td>${escaparHTML(fechaInscripcion)}</td>

                    <td>${estadoGeneral}</td>

                    <td>

                        <button
                            type="button"
                            class="btn btn--outline"
                            data-action="edit"
                            data-student-id="${Number(registro.estudianteId)}"
                        >
                            Editar grupos
                        </button>

                    </td>

                </tr>

            `;

        }).join("");

        actualizarPaginacion(registros.length);

    }


    function actualizarPaginacion(total) {

        const totalPaginas = Math.max(
            1,
            Math.ceil(total / registrosPorPagina)
        );

        elementos.pageInfo.textContent =
            `Página ${paginaActual} de ${totalPaginas}`;

        elementos.previousPage.disabled =
            paginaActual <= 1;

        elementos.nextPage.disabled =
            paginaActual >= totalPaginas;

        elementos.pagination.hidden =
            total <= registrosPorPagina;

    }


    // ==========================================
    // BUSCADOR DINÁMICO DE ESTUDIANTES
    // ==========================================

    function buscarEstudiantes(termino) {

        const busqueda = termino.trim().toLowerCase();

        if (!busqueda) return [];

        return estudiantes.filter((estudiante) => {

            const nombre = obtenerNombreCompleto(estudiante).toLowerCase();

            const documento = String(
                estudiante.documento || ""
            ).toLowerCase();

            return (
                nombre.includes(busqueda) ||
                documento.includes(busqueda)
            );

        }).slice(0, 8);

    }


    function renderizarResultadosEstudiantes(resultados) {

        const contenedor = elementos.studentSearchResults;

        if (!elementos.studentSearch.value.trim()) {

            contenedor.innerHTML = "";
            contenedor.hidden = true;

            return;

        }

        if (resultados.length === 0) {

            contenedor.innerHTML = `
                <div class="inscripciones-student-search__empty">
                    No se encontraron estudiantes.
                </div>
            `;

            contenedor.hidden = false;

            return;

        }

        contenedor.innerHTML = resultados.map((estudiante) => `

            <button
                type="button"
                class="inscripciones-student-search__option"
                data-student-id="${Number(estudiante.id)}"
            >

                <strong>
                    ${escaparHTML(obtenerNombreCompleto(estudiante))}
                </strong>

                <span>
                    Documento: ${escaparHTML(estudiante.documento || "Sin documento")}
                </span>

            </button>

        `).join("");

        contenedor.hidden = false;

    }


    async function seleccionarEstudiante(estudianteId) {

        const estudiante = obtenerEstudiante(estudianteId);

        if (!estudiante) return;

        elementos.studentSearch.value =
            `${obtenerNombreCompleto(estudiante)} - ${estudiante.documento || "Sin documento"}`;

        elementos.studentSearchResults.hidden = true;

        ocultarMensaje(elementos.formMessage);

        await mostrarPerfilEstudiante(estudiante.id);

    }


    // ==========================================
    // VALIDACIÓN DE HORARIOS
    // ==========================================

    function normalizarDia(dia) {

        return String(dia || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim()
            .toUpperCase();

    }


    function convertirHoraAMinutos(hora) {

        if (!hora) return null;

        const partes = String(hora).split(":");

        if (partes.length < 2) return null;

        const horas = Number(partes[0]);
        const minutos = Number(partes[1]);

        if (
            !Number.isInteger(horas) ||
            !Number.isInteger(minutos) ||
            horas < 0 ||
            horas > 23 ||
            minutos < 0 ||
            minutos > 59
        ) {
            return null;
        }

        return horas * 60 + minutos;

    }


    function existeCruceEntreGrupos(grupoAId, grupoBId) {

        const horariosA = horariosPorGrupo[grupoAId] || [];
        const horariosB = horariosPorGrupo[grupoBId] || [];

        if (horariosA.length === 0 || horariosB.length === 0) {

            return {
                existe: false,
                horarioNoRegistrado: true,
            };

        }

        for (const horarioA of horariosA) {

            for (const horarioB of horariosB) {

                const mismoDia =
                    normalizarDia(horarioA.diaSemana) ===
                    normalizarDia(horarioB.diaSemana);

                if (!mismoDia) continue;

                const inicioA = convertirHoraAMinutos(horarioA.horaInicio);
                const finA = convertirHoraAMinutos(horarioA.horaFin);

                const inicioB = convertirHoraAMinutos(horarioB.horaInicio);
                const finB = convertirHoraAMinutos(horarioB.horaFin);

                if (
                    inicioA === null ||
                    finA === null ||
                    inicioB === null ||
                    finB === null
                ) {
                    return {
                        existe: false,
                        horarioNoRegistrado: true,
                    };
                }

                if (inicioA >= finA || inicioB >= finB) continue;

                if (inicioA < finB && inicioB < finA) {

                    return {

                        existe: true,

                        dia: horarioA.diaSemana,

                        horarioA:
                            `${formatearHora(horarioA.horaInicio)} - ${formatearHora(horarioA.horaFin)}`,

                        horarioB:
                            `${formatearHora(horarioB.horaInicio)} - ${formatearHora(horarioB.horaFin)}`,

                    };

                }

            }

        }

        return {
            existe: false,
            horarioNoRegistrado: false,
        };

    }


    function validarCruceGrupo(grupoId) {

        const grupoCandidato = obtenerGrupo(grupoId);

        if (!grupoCandidato) {

            return {
                valido: false,
                mensaje: "El grupo seleccionado no existe.",
            };

        }

        const horariosCandidato = horariosPorGrupo[grupoId] || [];

        if (horariosCandidato.length === 0) {

            return {
                valido: false,
                mensaje: `El grupo ${grupoCandidato.nombre} no tiene horarios registrados.`,
            };

        }

        // Comprobar grupos que el estudiante ya tiene activos.

        for (const asignacion of asignacionesEstudianteActual) {

            if (asignacion.estado !== "ACTIVO") continue;

            const grupoExistenteId = Number(asignacion.grupoId);

            if (grupoExistenteId === Number(grupoId)) continue;

            const cruce = existeCruceEntreGrupos(
                grupoId,
                grupoExistenteId
            );

            const grupoExistente = obtenerGrupo(grupoExistenteId);

            if (cruce.horarioNoRegistrado) {

                return {
                    valido: false,
                    mensaje: `No se puede comprobar el horario de ${grupoExistente?.nombre || "un grupo activo"}.`,
                };

            }

            if (cruce.existe) {

                return {
                    valido: false,
                    mensaje: `El horario de ${grupoCandidato.nombre} se cruza con ${grupoExistente?.nombre || "otro grupo"} el ${cruce.dia}.`,
                };

            }

        }

        // Comprobar grupos seleccionados en el formulario.

        for (const seleccionadoId of gruposSeleccionados) {

            if (Number(seleccionadoId) === Number(grupoId)) continue;

            const cruce = existeCruceEntreGrupos(
                grupoId,
                seleccionadoId
            );

            const grupoSeleccionado = obtenerGrupo(seleccionadoId);

            if (cruce.horarioNoRegistrado) {

                return {
                    valido: false,
                    mensaje: `No se puede comprobar el horario de ${grupoSeleccionado?.nombre || "otro grupo"}.`,
                };

            }

            if (cruce.existe) {

                return {
                    valido: false,
                    mensaje: `El horario de ${grupoCandidato.nombre} se cruza con ${grupoSeleccionado?.nombre || "otro grupo"} el ${cruce.dia}.`,
                };

            }

        }

        return {
            valido: true,
        };

    }


    // ==========================================
    // PERFIL DEL ESTUDIANTE
    // ==========================================

    async function cargarApoderado(estudianteId) {

        try {

            const respuesta = await solicitar(
                `/api/apoderados/estudiante/${estudianteId}`
            );

            const relaciones = Array.isArray(respuesta)
                ? respuesta
                : [];

            if (relaciones.length === 0) {

                elementos.studentGuardian.textContent = "Sin apoderado";
                elementos.studentPhone.textContent = "-";

                return;

            }

            const relacion = relaciones[0];

            const apoderado = relacion.apoderado || relacion;

            const persona = apoderado.persona || apoderado;

            elementos.studentGuardian.textContent =
                `${persona.nombre || ""} ${persona.apellido || ""}`.trim() ||
                "Sin apoderado";

            elementos.studentPhone.textContent =
                persona.telefono || apoderado.telefono || "-";

        } catch (error) {

            console.error("Error al cargar apoderado:", error);

            elementos.studentGuardian.textContent = "No disponible";
            elementos.studentPhone.textContent = "-";

        }

    }


    async function mostrarPerfilEstudiante(estudianteId) {

        const estudiante = obtenerEstudiante(estudianteId);

        estudianteSeleccionado = estudiante || null;

        if (!estudiante) {

            elementos.studentInfo.hidden = true;

            elementos.groupsList.innerHTML = `
                <p>Selecciona un estudiante para consultar los grupos disponibles.</p>
            `;

            gruposSeleccionados.clear();

            asignacionesEstudianteActual = [];

            actualizarResumenGrupos();

            return;

        }

        elementos.studentInfo.hidden = false;

        const nombre = obtenerNombreCompleto(estudiante);

        elementos.studentName.textContent = nombre;

        elementos.studentDni.textContent =
            `Documento: ${estudiante.documento || "-"}`;

        elementos.studentAge.textContent =
            obtenerEdad(estudiante.fechaNacimiento);

        elementos.studentBelt.textContent =
            estudiante.cinturon || "Sin cinturón";

        elementos.studentAvatar.textContent =
            nombre.charAt(0).toUpperCase();

        if (estudiante.fotoUrl || estudiante.foto) {

            const foto = estudiante.fotoUrl || estudiante.foto;

            elementos.studentAvatar.innerHTML = `
                <img
                    src="${escaparHTML(foto)}"
                    alt="Foto de ${escaparHTML(nombre)}"
                >
            `;

        }

        gruposSeleccionados.clear();

        asignacionesEstudianteActual = [];

        actualizarResumenGrupos();

        await cargarApoderado(estudiante.id);

        await cargarGruposDisponibles(estudiante.id);

    }


    // ==========================================
    // NUEVA INSCRIPCIÓN: GRUPOS DISPONIBLES
    // ==========================================

    async function cargarGruposDisponibles(estudianteId) {

        elementos.groupsList.innerHTML = `
            <p>Consultando grupos disponibles...</p>
        `;

        try {

            const respuesta = await solicitar(
                `/api/estudiantes-grupos/estudiante/${estudianteId}`
            );

            asignacionesEstudianteActual =
                Array.isArray(respuesta) ? respuesta : [];

            const activas = asignacionesEstudianteActual.filter(
                (item) => item.estado === "ACTIVO"
            );

            const inactivas = asignacionesEstudianteActual.filter(
                (item) => item.estado === "INACTIVO"
            );

            const gruposDisponibles = grupos.filter((grupo) => {

                const yaInscrito = activas.some(
                    (item) =>
                        Number(item.grupoId) === Number(grupo.id)
                );

                return !yaInscrito;

            });

            if (gruposDisponibles.length === 0) {

                elementos.groupsList.innerHTML = `
                    <p>El estudiante ya está inscrito en todos los grupos activos disponibles.</p>
                `;

                actualizarResumenGrupos();

                return;

            }

            elementos.groupsList.innerHTML = gruposDisponibles.map((grupo) => {

                const asignacionInactiva = inactivas.find(
                    (item) =>
                        Number(item.grupoId) === Number(grupo.id)
                );

                const horarios = horariosPorGrupo[grupo.id] || [];

                const horariosHTML = horarios.length > 0
                    ? horarios.map((horario) => `

                        <span>
                            ${escaparHTML(horario.diaSemana)}
                            ${formatearHora(horario.horaInicio)}
                            -
                            ${formatearHora(horario.horaFin)}
                        </span>

                    `).join("")
                    : "<span>Horario no registrado</span>";

                const sinCupos =
                    Number(grupo.cuposDisponibles) <= 0 &&
                    !asignacionInactiva;

                return `

                    <label class="inscripciones-group-checkbox ${sinCupos ? "inscripciones-group-checkbox--disabled" : ""
                    }">

                        <input
                            type="checkbox"
                            name="grupos"
                            value="${Number(grupo.id)}"
                            ${sinCupos ? "disabled" : ""}
                        >

                        <div class="inscripciones-group-checkbox__content">

                            <strong>
                                ${escaparHTML(grupo.nombre)}
                            </strong>

                            <span>
                                Sensei: ${escaparHTML(grupo.senseiNombre || "Sin asignar")}
                            </span>

                            <span>
                                Ocupación:
                                ${Number(grupo.estudiantesActivos || 0)}/
                                ${Number(grupo.capacidad || 0)}
                            </span>

                            <span>
                                ${sinCupos
                        ? "Sin cupos disponibles"
                        : `${Number(grupo.cuposDisponibles)} cupos disponibles`
                    }
                            </span>

                            <span>
                                ${horariosHTML}
                            </span>

                            ${asignacionInactiva
                        ? `<small>Existe una inscripción inactiva. Se reactivará al confirmar.</small>`
                        : ""
                    }

                        </div>

                    </label>

                `;

            }).join("");

            actualizarResumenGrupos();

        } catch (error) {

            elementos.groupsList.innerHTML = `
                <p>No se pudieron cargar los grupos: ${escaparHTML(error.message)}</p>
            `;

        }

    }


    // ==========================================
    // RESUMEN DE GRUPOS
    // ==========================================

    function actualizarResumenGrupos() {

        const seleccionados = grupos.filter(
            (grupo) => gruposSeleccionados.has(Number(grupo.id))
        );

        elementos.selectedCount.textContent =
            seleccionados.length;

        if (seleccionados.length === 0) {

            elementos.selectedSummary.innerHTML = `
                <p>Aún no has seleccionado grupos.</p>
            `;

            return;

        }

        elementos.selectedSummary.innerHTML =
            seleccionados.map((grupo) => `

                <div class="inscripciones-summary-item">

                    <span>${escaparHTML(grupo.nombre)}</span>

                    <strong>
                        ${Number(grupo.cuposDisponibles)} cupos
                    </strong>

                </div>

            `).join("");

    }


    // ==========================================
    // REGISTRAR INSCRIPCIÓN MÚLTIPLE
    // ==========================================

    async function inscribirEstudiante(event) {

        event.preventDefault();

        ocultarMensaje(elementos.formMessage);

        if (!estudianteSeleccionado) {

            mostrarMensaje(
                elementos.formMessage,
                "Selecciona un estudiante."
            );

            return;

        }

        if (gruposSeleccionados.size === 0) {

            mostrarMensaje(
                elementos.formMessage,
                "Selecciona al menos un grupo."
            );

            return;

        }

        // Validar todos los horarios antes de enviar peticiones.

        for (const grupoId of gruposSeleccionados) {

            const validacion = validarCruceGrupo(grupoId);

            if (!validacion.valido) {

                mostrarMensaje(
                    elementos.formMessage,
                    validacion.mensaje
                );

                return;

            }

        }

        elementos.confirmButton.disabled = true;

        elementos.confirmButton.textContent = "Registrando...";

        let exitosas = 0;

        const errores = [];

        try {

            for (const grupoId of gruposSeleccionados) {

                const grupo = obtenerGrupo(grupoId);

                if (!grupo) {

                    errores.push(`Grupo ${grupoId}: no encontrado.`);

                    continue;

                }

                const asignacionInactiva =
                    asignacionesEstudianteActual.find(
                        (item) =>
                            Number(item.grupoId) === Number(grupoId) &&
                            item.estado === "INACTIVO"
                    );

                if (
                    !asignacionInactiva &&
                    Number(grupo.cuposDisponibles) <= 0
                ) {

                    errores.push(
                        `${grupo.nombre}: sin cupos disponibles.`
                    );

                    continue;

                }

                try {

                    if (asignacionInactiva) {

                        await solicitar(
                            `/api/estudiantes-grupos/${asignacionInactiva.id}/estado?estado=ACTIVO`,
                            {
                                method: "PATCH",
                            }
                        );

                    } else {

                        await solicitar("/api/estudiantes-grupos", {

                            method: "POST",

                            headers: {
                                "Content-Type": "application/json",
                            },

                            body: JSON.stringify({

                                estudianteId: estudianteSeleccionado.id,

                                grupoId: Number(grupoId),

                            }),

                        });

                    }

                    exitosas++;

                } catch (error) {

                    errores.push(
                        `${grupo.nombre}: ${error.message}`
                    );

                }

            }

            await cargarGrupos();

            await cargarInscripciones();

            if (errores.length > 0) {

                const mensaje =
                    `${exitosas} asignación(es) realizada(s). ` +
                    `No se completaron ${errores.length}: ${errores.join(" ")}`;

                mostrarMensaje(
                    elementos.formMessage,
                    mensaje,
                    exitosas > 0 ? "success" : "error"
                );

                if (exitosas > 0) {

                    await mostrarPerfilEstudiante(
                        estudianteSeleccionado.id
                    );

                }

            } else {

                mostrarMensaje(
                    elementos.formMessage,
                    "El estudiante fue inscrito correctamente en los grupos seleccionados.",
                    "success"
                );

                limpiarFormulario();

                setTimeout(() => {
                    mostrarVista("listado");
                }, 1000);

            }

        } catch (error) {

            mostrarMensaje(
                elementos.formMessage,
                error.message
            );

        } finally {

            elementos.confirmButton.disabled = false;

            elementos.confirmButton.textContent =
                "Confirmar inscripción";

        }

    }


    // ==========================================
    // CAMBIAR ESTADO DE ASIGNACIÓN
    // ==========================================

    async function cambiarEstadoAsignacion(id, estadoActual) {

        const nuevoEstado =
            estadoActual === "ACTIVO"
                ? "INACTIVO"
                : "ACTIVO";

        try {

            await solicitar(
                `/api/estudiantes-grupos/${id}/estado?estado=${nuevoEstado}`,
                {
                    method: "PATCH",
                }
            );

            mostrarMensaje(
                elementos.listMessage,
                `La asignación ahora está ${nuevoEstado.toLowerCase()}.`,
                "success"
            );

            await cargarGrupos();

            await cargarInscripciones();

        } catch (error) {

            mostrarMensaje(
                elementos.listMessage,
                error.message
            );

        }

    }


    // ==========================================
    // INSCRITOS POR GRUPO
    // ==========================================

    function renderizarListaGrupos() {

        if (grupos.length === 0) {

            elementos.groupsViewList.innerHTML = `
                <p>No hay grupos activos registrados.</p>
            `;

            return;

        }

        elementos.groupsViewList.innerHTML = grupos.map((grupo) => {

            const activo =
                Number(grupoSeleccionado) === Number(grupo.id);

            const horarios = horariosPorGrupo[grupo.id] || [];

            return `

                <button
                    type="button"
                    class="inscripciones-group-option ${activo ? "inscripciones-group-option--active" : ""
                }"
                    data-group-id="${Number(grupo.id)}"
                >

                    <strong>
                        ${escaparHTML(grupo.nombre)}
                    </strong>

                    <span>
                        ${Number(grupo.estudiantesActivos || 0)}
                        /
                        ${Number(grupo.capacidad || 0)}
                        estudiantes
                    </span>

                    <span>
                        ${horarios.length} horario(s)
                    </span>

                </button>

            `;

        }).join("");

    }


    async function seleccionarGrupo(grupoId) {

        const grupo = obtenerGrupo(grupoId);

        if (!grupo) return;

        grupoSeleccionado = Number(grupoId);

        renderizarListaGrupos();

        elementos.selectedGroupInfo.hidden = false;

        elementos.selectedGroupName.textContent = grupo.nombre;

        elementos.selectedGroupSensei.textContent =
            `Sensei: ${grupo.senseiNombre || "Sin asignar"}`;

        const horarios = horariosPorGrupo[grupoId] || [];

        elementos.selectedGroupSchedule.textContent =
            horarios.length > 0
                ? horarios.map((horario) =>
                    `${horario.diaSemana}: ${formatearHora(horario.horaInicio)} - ${formatearHora(horario.horaFin)}`
                ).join(" | ")
                : "Sin horarios registrados";

        const ocupados = Number(grupo.estudiantesActivos || 0);

        const capacidad = Number(grupo.capacidad || 0);

        const disponibles = Number(grupo.cuposDisponibles || 0);

        elementos.selectedGroupAvailability.textContent =
            `${disponibles} cupos disponibles`;

        elementos.selectedGroupCapacity.textContent =
            `${ocupados}/${capacidad}`;

        const porcentaje = capacidad > 0
            ? Math.min((ocupados / capacidad) * 100, 100)
            : 0;

        elementos.selectedGroupCapacityBar.style.width =
            `${porcentaje}%`;

        await cargarEstudiantesGrupo(grupoId);

    }


    async function cargarEstudiantesGrupo(grupoId) {

        elementos.groupStudentsTableBody.innerHTML = `
            <tr>
                <td colspan="5">Cargando estudiantes...</td>
            </tr>
        `;

        try {

            const respuesta = await solicitar(
                `/api/estudiantes-grupos/grupo/${grupoId}`
            );

            estudiantesGrupoActual =
                Array.isArray(respuesta) ? respuesta : [];

            paginaGrupoActual = 1;

            renderizarEstudiantesGrupo();

        } catch (error) {

            elementos.groupStudentsTableBody.innerHTML = `
                <tr>
                    <td colspan="5">
                        ${escaparHTML(error.message)}
                    </td>
                </tr>
            `;

        }

    }


    function renderizarEstudiantesGrupo() {

        const busqueda =
            elementos.searchGroupStudents.value.trim().toLowerCase();

        const estado =
            elementos.filterGroupStudentStatus.value;

        // ==========================================
        // FILTRAR REGISTROS
        // ==========================================

        let registros = estudiantesGrupoActual.filter((asignacion) => {

            const estudiante = obtenerEstudiante(
                asignacion.estudianteId
            );

            const nombre = estudiante
                ? obtenerNombreCompleto(estudiante)
                : asignacion.estudianteNombre || "";

            const documento = estudiante?.documento || "";

            const coincideBusqueda =
                nombre.toLowerCase().includes(busqueda) ||
                String(documento).toLowerCase().includes(busqueda);

            const coincideEstado =
                !estado || asignacion.estado === estado;

            return coincideBusqueda && coincideEstado;

        });

        const totalRegistros = registros.length;

        // ==========================================
        // SIN RESULTADOS
        // ==========================================

        if (totalRegistros === 0) {

            elementos.groupStudentsTableBody.innerHTML = `
            <tr>
                <td colspan="5">No se encontraron estudiantes.</td>
            </tr>
        `;

            paginaGrupoActual = 1;

            actualizarPaginacionGrupo(0);

            return;

        }

        // ==========================================
        // PAGINACIÓN
        // ==========================================

        const totalPaginas = Math.ceil(
            totalRegistros / registrosPorPagina
        );

        paginaGrupoActual = Math.min(
            Math.max(1, paginaGrupoActual),
            totalPaginas
        );

        const inicio =
            (paginaGrupoActual - 1) * registrosPorPagina;

        registros = registros.slice(
            inicio,
            inicio + registrosPorPagina
        );

        // ==========================================
        // RENDERIZAR TABLA
        // ==========================================

        elementos.groupStudentsTableBody.innerHTML =
            registros.map((asignacion) => {

                const estudiante = obtenerEstudiante(
                    asignacion.estudianteId
                );

                const nombre = estudiante
                    ? obtenerNombreCompleto(estudiante)
                    : asignacion.estudianteNombre || "Estudiante";

                const estadoActivo =
                    asignacion.estado === "ACTIVO";

                // Fecha de inscripción
                const fechaInscripcion = asignacion.fechaInscripcion
                    ? formatearFecha(asignacion.fechaInscripcion)
                    : "No disponible";

                return `

                <tr>

                    <td>
                        ${escaparHTML(nombre)}
                    </td>

                    <td>
                        ${obtenerEdad(estudiante?.fechaNacimiento)}
                    </td>

                    <td>
                        ${escaparHTML(estudiante?.cinturon || "Sin cinturón")}
                    </td>

                    <td>
                        ${escaparHTML(fechaInscripcion)}
                    </td>

                    <td>

                        <span class="inscripcion-status ${estadoActivo
                        ? "inscripcion-status--active"
                        : "inscripcion-status--inactive"
                    }">
                            ${estadoActivo ? "Activo" : "Inactivo"}
                        </span>

                        <button
                            type="button"
                            class="btn btn--outline"
                            data-action="group-toggle-status"
                            data-id="${Number(asignacion.id)}"
                            data-status="${escaparHTML(asignacion.estado)}"
                        >
                            ${estadoActivo ? "Retirar" : "Reactivar"}
                        </button>

                    </td>

                </tr>

            `;

            }).join("");

        // ==========================================
        // ACTUALIZAR PAGINACIÓN
        // ==========================================

        actualizarPaginacionGrupo(totalRegistros);

    }


    function actualizarPaginacionGrupo(total) {

        const totalPaginas = Math.max(
            1,
            Math.ceil(total / registrosPorPagina)
        );

        elementos.groupStudentsPageInfo.textContent =
            `Página ${paginaGrupoActual} de ${totalPaginas}`;

        elementos.previousGroupStudentsPage.disabled =
            paginaGrupoActual <= 1;

        elementos.nextGroupStudentsPage.disabled =
            paginaGrupoActual >= totalPaginas;

        elementos.groupStudentsPagination.hidden =
            total <= registrosPorPagina;

    }


    // ==========================================
    // EDICIÓN DE GRUPOS
    // ==========================================

    async function abrirEdicion(estudianteId) {

        const estudiante = obtenerEstudiante(estudianteId);

        if (!estudiante) {

            mostrarMensaje(
                elementos.listMessage,
                "No se encontró el estudiante."
            );

            return;

        }

        estudianteEdicion = estudiante;

        ocultarNotificacionEdicion();

        gruposEdicionSeleccionados.clear();

        elementos.editStudentName.textContent =
            obtenerNombreCompleto(estudiante);

        elementos.editStudentDni.textContent =
            `Documento: ${estudiante.documento || "-"}`;

        elementos.editStudentAge.textContent =
            obtenerEdad(estudiante.fechaNacimiento);

        elementos.editStudentBelt.textContent =
            estudiante.cinturon || "Sin cinturón";

        elementos.editStudentAvatar.textContent =
            obtenerNombreCompleto(estudiante).charAt(0).toUpperCase();

        if (estudiante.fotoUrl || estudiante.foto) {

            elementos.editStudentAvatar.innerHTML = `
                <img
                    src="${escaparHTML(estudiante.fotoUrl || estudiante.foto)}"
                    alt="Foto del estudiante"
                >
            `;

        }

        elementos.currentStudentGroups.innerHTML = `
            <p>Cargando grupos actuales...</p>
        `;

        elementos.newStudentGroups.innerHTML = `
            <p>Cargando grupos disponibles...</p>
        `;

        try {

            const respuesta = await solicitar(
                `/api/estudiantes-grupos/estudiante/${estudianteId}`
            );

            asignacionesEdicion =
                Array.isArray(respuesta) ? respuesta : [];

            asignacionesEdicion
                .filter((item) => item.estado === "ACTIVO")
                .forEach((item) => {
                    gruposEdicionSeleccionados.add(
                        Number(item.grupoId)
                    );
                });

            renderizarGruposEdicion();

            actualizarResumenEdicion();

            mostrarVista("editar");

        } catch (error) {

            mostrarMensaje(
                elementos.listMessage,
                error.message
            );

        }

    }


    function renderizarGruposEdicion() {

        const activas = asignacionesEdicion.filter(
            (item) => item.estado === "ACTIVO"
        );

        if (activas.length === 0) {

            elementos.currentStudentGroups.innerHTML = `
                <p>El estudiante no tiene grupos activos.</p>
            `;

        } else {

            elementos.currentStudentGroups.innerHTML =
                activas.map((asignacion) => {

                    const grupo = obtenerGrupo(asignacion.grupoId);

                    return `

                        <label class="inscripciones-group-checkbox">

                            <input
                                type="checkbox"
                                name="editGroups"
                                value="${Number(asignacion.grupoId)}"
                                checked
                            >

                            <div class="inscripciones-group-checkbox__content">

                                <strong>
                                    ${escaparHTML(grupo?.nombre || asignacion.grupoNombre)}
                                </strong>

                                <span>
                                    Grupo actualmente asignado.
                                    Desmarca para retirar la asignación.
                                </span>

                            </div>

                        </label>

                    `;

                }).join("");

        }

        const disponibles = grupos.filter((grupo) => {

            return !activas.some(
                (item) => Number(item.grupoId) === Number(grupo.id)
            );

        });

        if (disponibles.length === 0) {

            elementos.newStudentGroups.innerHTML = `
                <p>No hay grupos adicionales disponibles.</p>
            `;

            return;

        }

        elementos.newStudentGroups.innerHTML =
            disponibles.map((grupo) => {

                const inactiva = asignacionesEdicion.find(
                    (item) =>
                        Number(item.grupoId) === Number(grupo.id) &&
                        item.estado === "INACTIVO"
                );

                const sinCupos =
                    Number(grupo.cuposDisponibles) <= 0 && !inactiva;

                const horarios = horariosPorGrupo[grupo.id] || [];

                return `

                    <label class="inscripciones-group-checkbox ${sinCupos ? "inscripciones-group-checkbox--disabled" : ""
                    }">

                        <input
                            type="checkbox"
                            name="editGroups"
                            value="${Number(grupo.id)}"
                            ${sinCupos ? "disabled" : ""}
                        >

                        <div class="inscripciones-group-checkbox__content">

                            <strong>
                                ${escaparHTML(grupo.nombre)}
                            </strong>

                            <span>
                                ${inactiva
                        ? "Existe una asignación inactiva. Se puede reactivar."
                        : "Grupo adicional."
                    }
                            </span>

                            <span>
                                ${sinCupos
                        ? "Sin cupos disponibles"
                        : `${Number(grupo.cuposDisponibles)} cupos disponibles`
                    }
                            </span>

                            <span>
                                ${horarios.length > 0
                        ? horarios.map((horario) =>
                            `${escaparHTML(horario.diaSemana)} ${formatearHora(horario.horaInicio)} - ${formatearHora(horario.horaFin)}`
                        ).join(" | ")
                        : "Horario no registrado"
                    }
                            </span>

                        </div>

                    </label>

                `;

            }).join("");

    }


    function obtenerNotificacionEdicion() {

        let notificacion = document.getElementById("editGroupsNotification");

        if (!notificacion) {

            notificacion = document.createElement("div");
            notificacion.id = "editGroupsNotification";
            notificacion.className = "inscripciones-message";
            notificacion.hidden = true;
            notificacion.setAttribute("role", "alert");
            notificacion.setAttribute("aria-live", "polite");

            elementos.editGroupsSummary.parentElement.insertBefore(
                notificacion,
                elementos.editGroupsSummary
            );

        }

        return notificacion;

    }


    function mostrarNotificacionEdicion(mensaje, tipo = "error") {

        const notificacion = obtenerNotificacionEdicion();
        notificacion.textContent = mensaje;
        notificacion.className = `inscripciones-message inscripciones-message--${tipo}`;
        notificacion.hidden = false;

    }


    function ocultarNotificacionEdicion() {

        const notificacion = document.getElementById("editGroupsNotification");

        if (!notificacion) return;

        notificacion.textContent = "";
        notificacion.hidden = true;
        notificacion.className = "inscripciones-message";

    }


    function validarHorarioCompletoGrupo(grupoId) {

        const grupo = obtenerGrupo(grupoId);
        const horarios = horariosPorGrupo[grupoId] || [];

        if (!grupo) {
            return { valido: false, mensaje: "El grupo seleccionado no existe." };
        }

        if (horarios.length === 0) {
            return {
                valido: false,
                mensaje: `No se puede seleccionar ${grupo.nombre}: no tiene horarios registrados.`,
            };
        }

        for (const horario of horarios) {

            const dia = normalizarDia(horario.diaSemana);
            const inicio = convertirHoraAMinutos(horario.horaInicio);
            const fin = convertirHoraAMinutos(horario.horaFin);

            if (!dia || inicio === null || fin === null || inicio >= fin) {
                return {
                    valido: false,
                    mensaje: `No se puede validar el horario de ${grupo.nombre}. Revisa el día y las horas registrados.`,
                };
            }

        }

        return { valido: true };

    }


    function validarSeleccionGrupoEdicion(grupoId) {

        const grupo = obtenerGrupo(grupoId);

        const validacionHorario = validarHorarioCompletoGrupo(grupoId);

        if (!validacionHorario.valido) return validacionHorario;

        const yaEstabaActivo = asignacionesEdicion.some(
            (item) =>
                Number(item.grupoId) === Number(grupoId) &&
                item.estado === "ACTIVO"
        );

        if (
            !yaEstabaActivo &&
            Number(grupo.cuposDisponibles) <= 0
        ) {
            return {
                valido: false,
                mensaje: `${grupo.nombre} no tiene cupos disponibles. No se puede agregar al estudiante.`,
            };
        }

        for (const seleccionadoId of gruposEdicionSeleccionados) {

            if (Number(seleccionadoId) === Number(grupoId)) continue;

            const validacionSeleccionado = validarHorarioCompletoGrupo(seleccionadoId);

            if (!validacionSeleccionado.valido) {
                return validacionSeleccionado;
            }

            const cruce = existeCruceEntreGrupos(grupoId, seleccionadoId);
            const grupoSeleccionado = obtenerGrupo(seleccionadoId);

            if (cruce.horarioNoRegistrado) {
                return {
                    valido: false,
                    mensaje: `No se puede comprobar el horario de ${grupoSeleccionado?.nombre || "el otro grupo"}.`,
                };
            }

            if (cruce.existe) {
                return {
                    valido: false,
                    mensaje: `No se puede seleccionar ${grupo.nombre}: su horario se cruza con ${grupoSeleccionado?.nombre || "otro grupo"} el ${cruce.dia}.`,
                };
            }

        }

        return { valido: true };

    }


    function actualizarResumenEdicion() {

        const seleccionados = grupos.filter(
            (grupo) =>
                gruposEdicionSeleccionados.has(Number(grupo.id))
        );

        if (seleccionados.length === 0) {

            elementos.editGroupsSummary.innerHTML = `
                <p>El estudiante no tendrá grupos activos.</p>
            `;

            return;

        }

        elementos.editGroupsSummary.innerHTML =
            seleccionados.map((grupo) => `

                <div class="inscripciones-summary-item">

                    <span>${escaparHTML(grupo.nombre)}</span>

                </div>

            `).join("");

    }


    function validarCrucesEdicion() {

        const ids = [...gruposEdicionSeleccionados];

        for (let i = 0; i < ids.length; i++) {

            const validacionHorario = validarHorarioCompletoGrupo(ids[i]);

            if (!validacionHorario.valido) {
                return validacionHorario;
            }

            for (let j = i + 1; j < ids.length; j++) {

                const cruce = existeCruceEntreGrupos(
                    ids[i],
                    ids[j]
                );

                if (cruce.horarioNoRegistrado) {

                    return {
                        valido: false,
                        mensaje: "No se puede comprobar el horario de uno de los grupos seleccionados.",
                    };

                }

                if (cruce.existe) {

                    return {
                        valido: false,
                        mensaje: `Hay un cruce de horarios entre ${obtenerGrupo(ids[i])?.nombre} y ${obtenerGrupo(ids[j])?.nombre}, el ${cruce.dia}.`,
                    };

                }

            }

        }

        return {
            valido: true,
        };

    }


    async function guardarEdicion() {

        if (!estudianteEdicion) return;

        ocultarNotificacionEdicion();

        const validacion = validarCrucesEdicion();

        if (!validacion.valido) {

            mostrarNotificacionEdicion(validacion.mensaje);

            return;

        }

        elementos.saveEditButton.disabled = true;

        elementos.saveEditButton.textContent = "Guardando...";

        const errores = [];

        try {

            const activasActuales = asignacionesEdicion.filter(
                (item) => item.estado === "ACTIVO"
            );

            // Retirar grupos desmarcados.

            for (const asignacion of activasActuales) {

                const grupoId = Number(asignacion.grupoId);

                if (gruposEdicionSeleccionados.has(grupoId)) continue;

                try {

                    await solicitar(
                        `/api/estudiantes-grupos/${asignacion.id}/estado?estado=INACTIVO`,
                        {
                            method: "PATCH",
                        }
                    );

                } catch (error) {

                    errores.push(error.message);

                }

            }

            // Activar o crear los grupos adicionales.

            for (const grupoId of gruposEdicionSeleccionados) {

                const yaActivo = activasActuales.some(
                    (item) => Number(item.grupoId) === Number(grupoId)
                );

                if (yaActivo) continue;

                const grupo = obtenerGrupo(grupoId);

                const inactiva = asignacionesEdicion.find(
                    (item) =>
                        Number(item.grupoId) === Number(grupoId) &&
                        item.estado === "INACTIVO"
                );

                if (!inactiva && Number(grupo?.cuposDisponibles) <= 0) {

                    errores.push(
                        `${grupo?.nombre || "Grupo"}: sin cupos disponibles.`
                    );

                    continue;

                }

                try {

                    if (inactiva) {

                        await solicitar(
                            `/api/estudiantes-grupos/${inactiva.id}/estado?estado=ACTIVO`,
                            {
                                method: "PATCH",
                            }
                        );

                    } else {

                        await solicitar("/api/estudiantes-grupos", {

                            method: "POST",

                            headers: {
                                "Content-Type": "application/json",
                            },

                            body: JSON.stringify({
                                estudianteId: estudianteEdicion.id,
                                grupoId,
                            }),

                        });

                    }

                } catch (error) {

                    errores.push(
                        `${grupo?.nombre || "Grupo"}: ${error.message}`
                    );

                }

            }

            await cargarGrupos();

            await cargarInscripciones();

            if (errores.length > 0) {

                mostrarNotificacionEdicion(
                    `No se pudieron completar todos los cambios: ${errores.join(" ")}`
                );

                return;

            }

            mostrarVista("listado");

            mostrarMensaje(
                elementos.listMessage,
                "Los grupos del estudiante fueron actualizados correctamente.",
                "success"
            );

        } catch (error) {

            mostrarNotificacionEdicion(error.message);

        } finally {

            elementos.saveEditButton.disabled = false;

            elementos.saveEditButton.textContent =
                "Guardar cambios";

        }

    }


    // ==========================================
    // MODAL DE RETIRO
    // ==========================================

    function abrirModalRetiro(asignacion) {

        asignacionPendienteRetiro = asignacion;

        const grupo = obtenerGrupo(asignacion.grupoId);

        elementos.removeTitle.textContent =
            "¿Retirar inscripción?";

        elementos.removeMessage.textContent =
            `Se retirará al estudiante de ${grupo?.nombre || asignacion.grupoNombre || "este grupo"}.`;

        elementos.removeModal.hidden = false;

    }


    function cerrarModalRetiro() {

        elementos.removeModal.hidden = true;

        asignacionPendienteRetiro = null;

    }


    async function confirmarRetiro() {

        if (!asignacionPendienteRetiro) return;

        elementos.confirmRemoveButton.disabled = true;

        elementos.confirmRemoveButton.textContent = "Procesando...";

        try {

            await cambiarEstadoAsignacion(
                asignacionPendienteRetiro.id,
                "ACTIVO"
            );

            if (grupoSeleccionado) {

                await seleccionarGrupo(grupoSeleccionado);

            }

            cerrarModalRetiro();

        } finally {

            elementos.confirmRemoveButton.disabled = false;

            elementos.confirmRemoveButton.textContent =
                "Retirar de este grupo";

        }

    }


    // ==========================================
    // NAVEGACIÓN
    // ==========================================

    function mostrarVista(nombre) {

        elementos.listadoView.hidden =
            nombre !== "listado";

        elementos.gruposView.hidden =
            nombre !== "grupos";

        elementos.nuevaView.hidden =
            nombre !== "nueva";

        elementos.editarView.hidden =
            nombre !== "editar";

        elementos.tabs.forEach((tab) => {

            const activo = tab.dataset.tab === nombre;

            tab.classList.toggle(
                "inscripciones-tab--active",
                activo
            );

            tab.setAttribute(
                "aria-selected",
                String(activo)
            );

        });

        ocultarMensaje(elementos.formMessage);

        ocultarMensaje(elementos.listMessage);

        if (nombre === "grupos") {

            renderizarListaGrupos();

        }

    }


    function abrirNuevaInscripcion() {

        limpiarFormulario();

        mostrarVista("nueva");

    }


    function limpiarFormulario() {

        elementos.form.reset();

        estudianteSeleccionado = null;

        gruposSeleccionados.clear();

        asignacionesEstudianteActual = [];

        elementos.studentSearch.value = "";

        elementos.studentSearchResults.innerHTML = "";

        elementos.studentSearchResults.hidden = true;

        elementos.studentInfo.hidden = true;

        elementos.groupsList.innerHTML = `
            <p>Selecciona un estudiante para consultar los grupos disponibles.</p>
        `;

        elementos.currentDate.textContent =
            obtenerFechaActual();

        elementos.studentGuardian.textContent = "-";

        elementos.studentPhone.textContent = "-";

        actualizarResumenGrupos();

        ocultarMensaje(elementos.formMessage);

    }


    // ==========================================
    // EVENTOS: NAVEGACIÓN
    // ==========================================

    elementos.tabs.forEach((tab) => {

        tab.addEventListener("click", () => {

            mostrarVista(tab.dataset.tab);

        });

    });


    elementos.newButton.addEventListener(
        "click",
        abrirNuevaInscripcion
    );


    elementos.newFromGroupButton.addEventListener(
        "click",
        abrirNuevaInscripcion
    );


    elementos.cancelButton.addEventListener("click", () => {

        limpiarFormulario();

        mostrarVista("listado");

    });


    // ==========================================
    // EVENTOS: BUSCADOR DE ESTUDIANTES
    // ==========================================

    elementos.studentSearch.addEventListener("input", () => {

        clearTimeout(temporizadorBusqueda);

        estudianteSeleccionado = null;

        asignacionesEstudianteActual = [];

        gruposSeleccionados.clear();

        elementos.studentInfo.hidden = true;

        elementos.groupsList.innerHTML = `
            <p>Selecciona un estudiante para consultar los grupos disponibles.</p>
        `;

        actualizarResumenGrupos();

        const termino = elementos.studentSearch.value;

        temporizadorBusqueda = setTimeout(() => {

            renderizarResultadosEstudiantes(
                buscarEstudiantes(termino)
            );

        }, 200);

    });


    elementos.studentSearchResults.addEventListener("click", async (event) => {

        const opcion = event.target.closest("[data-student-id]");

        if (!opcion) return;

        await seleccionarEstudiante(
            Number(opcion.dataset.studentId)
        );

    });


    document.addEventListener("click", (event) => {

        if (
            !event.target.closest(".inscripciones-student-search")
        ) {

            elementos.studentSearchResults.hidden = true;

        }

    });


    // ==========================================
    // EVENTOS: SELECCIÓN DE GRUPOS
    // ==========================================

    elementos.groupsList.addEventListener("change", (event) => {

        const checkbox = event.target.closest(
            'input[name="grupos"]'
        );

        if (!checkbox) return;

        const grupoId = Number(checkbox.value);

        if (checkbox.checked) {

            const validacion = validarCruceGrupo(grupoId);

            if (!validacion.valido) {

                checkbox.checked = false;

                mostrarMensaje(
                    elementos.formMessage,
                    validacion.mensaje
                );

                return;

            }

            gruposSeleccionados.add(grupoId);

        } else {

            gruposSeleccionados.delete(grupoId);

        }

        ocultarMensaje(elementos.formMessage);

        actualizarResumenGrupos();

    });


    elementos.form.addEventListener(
        "submit",
        inscribirEstudiante
    );


    // ==========================================
    // EVENTOS: LISTADO GENERAL
    // ==========================================

    elementos.search.addEventListener("input", () => {

        paginaActual = 1;

        renderizarInscripciones();

    });


    elementos.filterGroup.addEventListener("change", () => {

        paginaActual = 1;

        renderizarInscripciones();

    });


    elementos.filterStatus.addEventListener("change", () => {

        paginaActual = 1;

        renderizarInscripciones();

    });


    elementos.previousPage.addEventListener("click", () => {

        if (paginaActual > 1) {

            paginaActual--;

            renderizarInscripciones();

        }

    });


    elementos.nextPage.addEventListener("click", () => {

        paginaActual++;

        renderizarInscripciones();

    });


    elementos.tableBody.addEventListener("click", async (event) => {

        const button = event.target.closest("button[data-action]");

        if (!button) return;

        const action = button.dataset.action;

        if (action === "toggle-status") {

            await cambiarEstadoAsignacion(
                Number(button.dataset.id),
                button.dataset.status
            );

        }

        if (action === "edit") {

            await abrirEdicion(
                Number(button.dataset.studentId)
            );

        }

    });


    // ==========================================
    // EVENTOS: INSCRITOS POR GRUPO
    // ==========================================

    elementos.groupsViewList.addEventListener("click", async (event) => {

        const button = event.target.closest("[data-group-id]");

        if (!button) return;

        await seleccionarGrupo(
            Number(button.dataset.groupId)
        );

    });


    elementos.searchGroupStudents.addEventListener("input", () => {

        clearTimeout(temporizadorBusquedaGrupo);

        temporizadorBusquedaGrupo = setTimeout(() => {

            paginaGrupoActual = 1;

            renderizarEstudiantesGrupo();

        }, 200);

    });


    elementos.filterGroupStudentStatus.addEventListener("change", () => {

        paginaGrupoActual = 1;

        renderizarEstudiantesGrupo();

    });


    elementos.previousGroupStudentsPage.addEventListener("click", () => {

        if (paginaGrupoActual > 1) {

            paginaGrupoActual--;

            renderizarEstudiantesGrupo();

        }

    });


    elementos.nextGroupStudentsPage.addEventListener("click", () => {

        paginaGrupoActual++;

        renderizarEstudiantesGrupo();

    });


    elementos.groupStudentsTableBody.addEventListener("click", (event) => {

        const button = event.target.closest(
            'button[data-action="group-toggle-status"]'
        );

        if (!button) return;

        const id = Number(button.dataset.id);

        const asignacion = estudiantesGrupoActual.find(
            (item) => Number(item.id) === id
        );

        if (!asignacion) return;

        if (asignacion.estado === "ACTIVO") {

            abrirModalRetiro(asignacion);

        } else {

            cambiarEstadoAsignacion(
                asignacion.id,
                asignacion.estado
            ).then(() => {

                if (grupoSeleccionado) {
                    seleccionarGrupo(grupoSeleccionado);
                }

            });

        }

    });


    // ==========================================
    // EVENTOS: EDICIÓN
    // ==========================================

    function manejarCambioGrupoEdicion(event) {

        const checkbox = event.target.closest('input[name="editGroups"]');

        if (!checkbox) return;

        const grupoId = Number(checkbox.value);

        if (checkbox.checked) {

            const validacion = validarSeleccionGrupoEdicion(grupoId);

            if (!validacion.valido) {

                checkbox.checked = false;
                gruposEdicionSeleccionados.delete(grupoId);
                mostrarNotificacionEdicion(validacion.mensaje);
                actualizarResumenEdicion();
                return;

            }

            gruposEdicionSeleccionados.add(grupoId);
            ocultarNotificacionEdicion();

        } else {

            gruposEdicionSeleccionados.delete(grupoId);
            ocultarNotificacionEdicion();

        }

        actualizarResumenEdicion();

    }


    elementos.currentStudentGroups.addEventListener(
        "change",
        manejarCambioGrupoEdicion
    );


    elementos.newStudentGroups.addEventListener(
        "change",
        manejarCambioGrupoEdicion
    );


    elementos.cancelEditButton.addEventListener("click", () => {

        estudianteEdicion = null;

        gruposEdicionSeleccionados.clear();

        ocultarNotificacionEdicion();

        mostrarVista("listado");

    });


    elementos.saveEditButton.addEventListener(
        "click",
        guardarEdicion
    );


    // ==========================================
    // EVENTOS: MODAL
    // ==========================================

    elementos.cancelRemoveButton.addEventListener(
        "click",
        cerrarModalRetiro
    );


    elementos.confirmRemoveButton.addEventListener(
        "click",
        confirmarRetiro
    );


    elementos.removeModal.addEventListener("click", (event) => {

        if (event.target.matches("[data-close-modal]")) {

            cerrarModalRetiro();

        }

    });


    // ==========================================
    // INICIALIZACIÓN
    // ==========================================

    async function inicializar() {

        elementos.currentDate.textContent =
            obtenerFechaActual();

        elementos.selectedGroupInfo.hidden = true;

        try {

            await Promise.all([
                cargarEstudiantes(),
                cargarGrupos(),
            ]);

            await cargarInscripciones();

            renderizarListaGrupos();

            actualizarResumenGrupos();

        } catch (error) {

            console.error(
                "Error al inicializar inscripciones:",
                error
            );

            mostrarErrorTabla(error.message);

            mostrarMensaje(
                elementos.listMessage,
                `No se pudo cargar la información: ${error.message}`
            );

        }

    }


    inicializar();

});
