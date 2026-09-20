document.addEventListener("DOMContentLoaded", () => {

    const auth = sessionStorage.getItem("kihonAuth");
    const username = sessionStorage.getItem("kihonUsername");
    const rol = sessionStorage.getItem("kihonRol");


    // ==========================================
    // VALIDAR SESIÓN
    // ==========================================

    if (!auth || !username || !rol) {

        window.location.href = "/login";

        return;
    }


    // ==========================================
    // VALIDAR ROL
    // ==========================================

    if (rol !== "ADMIN" && rol !== "SECRETARIA") {

        window.location.href = "/login";

        return;
    }


    // ==========================================
    // ELEMENTOS
    // ==========================================

    const usernameDisplay =
        document.getElementById("usernameDisplay");

    const studentSelect =
        document.getElementById("studentSelect");

    const groupSelect =
        document.getElementById("groupSelect");

    const inscripcionForm =
        document.getElementById("inscripcionForm");

    const clearFormButton =
        document.getElementById("clearFormButton");

    const groupInfo =
        document.getElementById("groupInfo");

    const groupInfoName =
        document.getElementById("groupInfoName");

    const groupInfoSensei =
        document.getElementById("groupInfoSensei");

    const groupInfoSchedule =
        document.getElementById("groupInfoSchedule");

    const groupInfoCapacity =
        document.getElementById("groupInfoCapacity");

    const groupInfoAvailable =
        document.getElementById("groupInfoAvailable");

    const groupInfoDescription =
        document.getElementById("groupInfoDescription");

    const inscripcionFormMessage =
        document.getElementById("inscripcionFormMessage");

    const inscripcionesMessage =
        document.getElementById("inscripcionesMessage");

    const inscripcionesTableBody =
        document.getElementById("inscripcionesTableBody");

    const changeGroupSection =
        document.getElementById("changeGroupSection");

    const changeGroupForm =
        document.getElementById("changeGroupForm");

    const changeStudentId =
        document.getElementById("changeStudentId");

    const changeGroupStudent =
        document.getElementById("changeGroupStudent");

    const newGroupSelect =
        document.getElementById("newGroupSelect");

    const cancelChangeGroupButton =
        document.getElementById("cancelChangeGroupButton");

    const changeGroupMessage =
        document.getElementById("changeGroupMessage");


    usernameDisplay.textContent = username;


    // ==========================================
    // VARIABLES
    // ==========================================

    let estudiantes = [];

    let grupos = [];

    let inscripciones = [];


    // ==========================================
    // CARGAR ESTUDIANTES
    // ==========================================

    async function cargarEstudiantes() {

        try {

            const response = await fetch(
                "/api/estudiantes",
                {
                    headers: {
                        "Authorization": `Basic ${auth}`
                    }
                }
            );


            if (!response.ok) {

                throw new Error(
                    "No se pudieron cargar los estudiantes"
                );
            }


            estudiantes = await response.json();


            const estudiantesActivos =
                estudiantes.filter(
                    estudiante =>
                        estudiante.estado === "ACTIVO"
                );


            studentSelect.innerHTML = `
                <option value="">
                    Seleccionar estudiante
                </option>
            `;


            estudiantesActivos.forEach(estudiante => {

                const option =
                    document.createElement("option");

                option.value = estudiante.id;

                option.textContent =
                    `${estudiante.nombre} ${estudiante.apellido}`;

                studentSelect.appendChild(option);

            });

        } catch (error) {

            mostrarMensaje(
                inscripcionFormMessage,
                error.message,
                "error"
            );
        }
    }


    // ==========================================
    // CARGAR GRUPOS
    // ==========================================

    async function cargarGrupos() {

        try {

            const response = await fetch(
                "/api/grupos",
                {
                    headers: {
                        "Authorization": `Basic ${auth}`
                    }
                }
            );


            if (!response.ok) {

                throw new Error(
                    "No se pudieron cargar los grupos"
                );
            }


            grupos = await response.json();


            cargarOpcionesGrupos();

        } catch (error) {

            mostrarMensaje(
                inscripcionFormMessage,
                error.message,
                "error"
            );
        }
    }


    // ==========================================
    // CARGAR OPCIONES DE GRUPOS
    // ==========================================

    function cargarOpcionesGrupos() {

        groupSelect.innerHTML = `
            <option value="">
                Seleccionar grupo
            </option>
        `;


        grupos
            .filter(grupo =>
                grupo.estado === "ACTIVO" &&
                grupo.cuposDisponibles > 0
            )
            .forEach(grupo => {

                const option =
                    document.createElement("option");

                option.value = grupo.id;

                option.textContent =
                    `${grupo.nombre} - ${grupo.senseiNombre}`;

                groupSelect.appendChild(option);

            });
    }


    // ==========================================
    // MOSTRAR INFORMACIÓN DEL GRUPO
    // ==========================================

    function mostrarInformacionGrupo() {

        const grupoId =
            Number(groupSelect.value);


        if (!grupoId) {

            groupInfo.hidden = true;

            return;
        }


        const grupo =
            grupos.find(
                item => item.id === grupoId
            );


        if (!grupo) {

            groupInfo.hidden = true;

            return;
        }


        groupInfoName.textContent =
            grupo.nombre;

        groupInfoSensei.textContent =
            grupo.senseiNombre || "Sin sensei";

        groupInfoSchedule.textContent =
            `${formatearHora(grupo.horaInicio)} - ${formatearHora(grupo.horaFin)}`;

        groupInfoCapacity.textContent =
            grupo.capacidad;

        groupInfoAvailable.textContent =
            grupo.cuposDisponibles;

        groupInfoDescription.textContent =
            grupo.descripcion || "Sin descripción";


        groupInfo.hidden = false;
    }


    // ==========================================
    // CARGAR INSCRIPCIONES
    // ==========================================

    async function cargarInscripciones() {

        try {

            inscripcionesTableBody.innerHTML = `
                <tr>
                    <td colspan="4">
                        Cargando inscripciones...
                    </td>
                </tr>
            `;


            const response = await fetch(
                "/api/estudiantes-grupos",
                {
                    headers: {
                        "Authorization": `Basic ${auth}`
                    }
                }
            );


            if (!response.ok) {

                throw new Error(
                    "No se pudieron cargar las inscripciones"
                );
            }


            inscripciones =
                await response.json();


            renderizarInscripciones();

        } catch (error) {

            inscripcionesTableBody.innerHTML = `
                <tr>
                    <td colspan="4">
                        ${error.message}
                    </td>
                </tr>
            `;
        }
    }


    // ==========================================
    // RENDERIZAR INSCRIPCIONES
    // ==========================================

    function renderizarInscripciones() {

        if (inscripciones.length === 0) {

            inscripcionesTableBody.innerHTML = `
                <tr>
                    <td colspan="4">
                        No hay inscripciones registradas.
                    </td>
                </tr>
            `;

            return;
        }


        inscripcionesTableBody.innerHTML = "";


        inscripciones.forEach(inscripcion => {

            const row =
                document.createElement("tr");


            const estado =
                inscripcion.estado;


            const estadoTexto =
                estado === "ACTIVO"
                    ? "Activo"
                    : "Inactivo";


            row.innerHTML = `

                <td>
                    ${inscripcion.estudianteNombre}
                </td>

                <td>
                    ${inscripcion.grupoNombre}
                </td>

                <td>
                    ${estadoTexto}
                </td>

                <td>

                    <button
                        type="button"
                        class="btn btn--outline"
                        data-action="change-group"
                        data-student-id="${inscripcion.estudianteId}"
                        data-student-name="${inscripcion.estudianteNombre}"
                    >
                        Cambiar grupo
                    </button>

                    <button
                        type="button"
                        class="btn ${estado === "ACTIVO"
                    ? "btn--logout"
                    : "btn--primary"}"
                        data-action="toggle-status"
                        data-id="${inscripcion.id}"
                        data-status="${estado}"
                    >
                        ${estado === "ACTIVO"
                    ? "Inactivar"
                    : "Activar"}
                    </button>

                </td>
            `;


            inscripcionesTableBody.appendChild(row);

        });
    }


    // ==========================================
    // INSCRIBIR ESTUDIANTE
    // ==========================================

    async function inscribirEstudiante(event) {

        event.preventDefault();


        const estudianteId =
            Number(studentSelect.value);

        const grupoId =
            Number(groupSelect.value);


        if (!estudianteId || !grupoId) {

            mostrarMensaje(
                inscripcionFormMessage,
                "Selecciona un estudiante y un grupo.",
                "error"
            );

            return;
        }


        try {

            const response = await fetch(
                "/api/estudiantes-grupos",
                {
                    method: "POST",

                    headers: {
                        "Authorization": `Basic ${auth}`,
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        estudianteId,
                        grupoId
                    })
                }
            );


            const data =
                await obtenerRespuesta(response);


            if (!response.ok) {

                throw new Error(
                    obtenerMensajeError(data)
                );
            }


            mostrarMensaje(
                inscripcionFormMessage,
                "Estudiante inscrito correctamente.",
                "success"
            );


            await cargarGrupos();

            await cargarInscripciones();

            limpiarFormulario();

        } catch (error) {

            mostrarMensaje(
                inscripcionFormMessage,
                error.message,
                "error"
            );
        }
    }


    // ==========================================
    // CAMBIAR GRUPO
    // ==========================================

    function abrirCambiarGrupo(
        estudianteId,
        estudianteNombre
    ) {

        changeStudentId.value =
            estudianteId;

        changeGroupStudent.textContent =
            `Selecciona un nuevo grupo para ${estudianteNombre}.`;


        cargarOpcionesNuevoGrupo(
            estudianteId
        );


        changeGroupSection.hidden = false;


        changeGroupSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }


    // ==========================================
    // OPCIONES NUEVO GRUPO
    // ==========================================

    function cargarOpcionesNuevoGrupo(
        estudianteId
    ) {

        newGroupSelect.innerHTML = `
            <option value="">
                Seleccionar grupo
            </option>
        `;


        const inscripcionActual =
            inscripciones.find(
                inscripcion =>
                    inscripcion.estudianteId ===
                    Number(estudianteId) &&
                    inscripcion.estado === "ACTIVO"
            );


        grupos
            .filter(grupo =>
                grupo.estado === "ACTIVO" &&
                grupo.cuposDisponibles > 0 &&
                (
                    !inscripcionActual ||
                    grupo.id !== inscripcionActual.grupoId
                )
            )
            .forEach(grupo => {

                const option =
                    document.createElement("option");

                option.value =
                    grupo.id;

                option.textContent =
                    `${grupo.nombre} - ${grupo.senseiNombre}`;

                newGroupSelect.appendChild(option);

            });
    }


    // ==========================================
    // PROCESAR CAMBIO DE GRUPO
    // ==========================================

    async function cambiarGrupo(event) {

        event.preventDefault();


        const estudianteId =
            Number(changeStudentId.value);

        const nuevoGrupoId =
            Number(newGroupSelect.value);


        if (!estudianteId || !nuevoGrupoId) {

            mostrarMensaje(
                changeGroupMessage,
                "Selecciona un nuevo grupo.",
                "error"
            );

            return;
        }


        try {

            const response = await fetch(
                `/api/estudiantes-grupos/estudiante/${estudianteId}/grupo/${nuevoGrupoId}`,
                {
                    method: "PATCH",

                    headers: {
                        "Authorization": `Basic ${auth}`
                    }
                }
            );


            const data =
                await obtenerRespuesta(response);


            if (!response.ok) {

                throw new Error(
                    obtenerMensajeError(data)
                );
            }


            mostrarMensaje(
                changeGroupMessage,
                "El grupo del estudiante se cambió correctamente.",
                "success"
            );


            await cargarGrupos();

            await cargarInscripciones();


            setTimeout(() => {

                cerrarCambiarGrupo();

            }, 800);

        } catch (error) {

            mostrarMensaje(
                changeGroupMessage,
                error.message,
                "error"
            );
        }
    }


    // ==========================================
    // CAMBIAR ESTADO
    // ==========================================

    async function cambiarEstado(
        id,
        estadoActual
    ) {

        const nuevoEstado =
            estadoActual === "ACTIVO"
                ? "INACTIVO"
                : "ACTIVO";


        try {

            const response = await fetch(
                `/api/estudiantes-grupos/${id}/estado?estado=${nuevoEstado}`,
                {
                    method: "PATCH",

                    headers: {
                        "Authorization": `Basic ${auth}`
                    }
                }
            );


            const data =
                await obtenerRespuesta(response);


            if (!response.ok) {

                throw new Error(
                    obtenerMensajeError(data)
                );
            }


            mostrarMensaje(
                inscripcionesMessage,
                `La inscripción ahora está ${nuevoEstado.toLowerCase()}.`,
                "success"
            );


            await cargarGrupos();

            await cargarInscripciones();

        } catch (error) {

            mostrarMensaje(
                inscripcionesMessage,
                error.message,
                "error"
            );
        }
    }


    // ==========================================
    // LIMPIAR FORMULARIO
    // ==========================================

    function limpiarFormulario() {

        inscripcionForm.reset();

        groupInfo.hidden = true;

        ocultarMensaje(
            inscripcionFormMessage
        );
    }


    // ==========================================
    // CERRAR CAMBIO DE GRUPO
    // ==========================================

    function cerrarCambiarGrupo() {

        changeGroupSection.hidden = true;

        changeGroupForm.reset();

        ocultarMensaje(
            changeGroupMessage
        );
    }


    // ==========================================
    // MENSAJES
    // ==========================================

    function mostrarMensaje(
        elemento,
        mensaje,
        tipo
    ) {

        elemento.textContent = mensaje;

        elemento.className =
            `inscripciones-message inscripciones-message--${tipo}`;

        elemento.hidden = false;
    }


    function ocultarMensaje(elemento) {

        elemento.hidden = true;

        elemento.textContent = "";

        elemento.className =
            "inscripciones-message";
    }


    // ==========================================
    // RESPUESTA API
    // ==========================================

    async function obtenerRespuesta(response) {

        const text =
            await response.text();


        if (!text) {

            return null;
        }


        try {

            return JSON.parse(text);

        } catch {

            return text;
        }
    }


    function obtenerMensajeError(data) {

        if (!data) {

            return "Ocurrió un error en la operación.";
        }


        if (typeof data === "string") {

            return data;
        }


        return data.message ||
            data.error ||
            "Ocurrió un error en la operación.";
    }


    // ==========================================
    // FORMATEAR HORA
    // ==========================================

    function formatearHora(hora) {

        if (!hora) {

            return "-";
        }


        return hora.substring(0, 5);
    }


    // ==========================================
    // EVENTOS
    // ==========================================

    studentSelect.addEventListener(
        "change",
        () => {

            ocultarMensaje(
                inscripcionFormMessage
            );

        }
    );


    groupSelect.addEventListener(
        "change",
        () => {

            mostrarInformacionGrupo();

            ocultarMensaje(
                inscripcionFormMessage
            );

        }
    );


    inscripcionForm.addEventListener(
        "submit",
        inscribirEstudiante
    );


    clearFormButton.addEventListener(
        "click",
        limpiarFormulario
    );


    inscripcionesTableBody.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest("button");


            if (!button) {

                return;
            }


            const action =
                button.dataset.action;


            if (action === "change-group") {

                abrirCambiarGrupo(
                    Number(button.dataset.studentId),
                    button.dataset.studentName
                );

                return;
            }


            if (action === "toggle-status") {

                cambiarEstado(
                    Number(button.dataset.id),
                    button.dataset.status
                );

            }

        }
    );


    changeGroupForm.addEventListener(
        "submit",
        cambiarGrupo
    );


    cancelChangeGroupButton.addEventListener(
        "click",
        cerrarCambiarGrupo
    );


    // ==========================================
    // INICIALIZAR
    // ==========================================

    async function inicializar() {

        await cargarEstudiantes();

        await cargarGrupos();

        await cargarInscripciones();

    }


    inicializar();

});