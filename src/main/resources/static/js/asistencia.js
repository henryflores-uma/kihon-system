document.addEventListener("DOMContentLoaded", function () {


    /*
     * =========================================================
     * AUTENTICACIÓN
     * =========================================================
     */

    const auth =
        sessionStorage.getItem("kihonAuth");

    const username =
        sessionStorage.getItem("kihonUsername");


    if (!auth || !username) {

        window.location.href = "/login";

        return;
    }



    /*
     * =========================================================
     * ELEMENTOS DEL DOM
     * =========================================================
     */

    const usernameDisplay =
        document.getElementById("usernameDisplay");

    const profileMenuButton =
        document.getElementById("profileMenuButton");

    const profileMenu =
        document.getElementById("profileMenu");

    const profileArrow =
        document.querySelector(".topbar__profile-arrow");

    const topbarLogoutButton =
        document.getElementById("topbarLogoutButton");

    const fechaInput =
        document.getElementById("fecha");

    const grupoSelect =
        document.getElementById("grupoId");

    const grupoInfo =
        document.getElementById("grupoInfo");

    const grupoInfoNombre =
        document.getElementById("grupoInfoNombre");

    const grupoInfoHorario =
        document.getElementById("grupoInfoHorario");

    const grupoInfoSensei =
        document.getElementById("grupoInfoSensei");

    const grupoInfoCantidad =
        document.getElementById("grupoInfoCantidad");

    const attendanceRegister =
        document.getElementById("attendanceRegister");

    const saveAttendanceButton =
        document.getElementById("saveAttendanceButton");

    const attendanceMessage =
        document.getElementById("attendanceMessage");

    const fechaConsulta =
        document.getElementById("fechaConsulta");

    const grupoConsulta =
        document.getElementById("grupoConsulta");

    const estudianteConsulta =
        document.getElementById("estudianteConsulta");

    const attendanceList =
        document.getElementById("attendanceList");

    const attendanceCount =
        document.getElementById("attendanceCount");


    usernameDisplay.textContent =
        username;



    /*
     * =========================================================
     * ESTADO
     * =========================================================
     */

    let horariosDelDia = [];

    let estudiantesGrupo = [];

    let asistenciasGrupo = [];

    let asistenciasConsulta = [];



    /*
     * =========================================================
     * FECHA LOCAL
     * =========================================================
     */

    function obtenerFechaLocal() {

        const ahora = new Date();

        const year =
            ahora.getFullYear();

        const month =
            String(ahora.getMonth() + 1)
                .padStart(2, "0");

        const day =
            String(ahora.getDate())
                .padStart(2, "0");

        return `${year}-${month}-${day}`;
    }


    /*
     * =========================================================
     * DÍA DE LA SEMANA
     * =========================================================
     */

    function obtenerDiaSemana(fecha) {

        const partes =
            fecha.split("-");

        const fechaLocal =
            new Date(
                Number(partes[0]),
                Number(partes[1]) - 1,
                Number(partes[2])
            );

        const dias = [
            "DOMINGO",
            "LUNES",
            "MARTES",
            "MIERCOLES",
            "JUEVES",
            "VIERNES",
            "SABADO"
        ];

        return dias[fechaLocal.getDay()];
    }



    /*
     * =========================================================
     * MENÚ DE PERFIL
     * =========================================================
     */

    function configurarMenuPerfil() {

        if (
            profileMenuButton &&
            profileMenu
        ) {

            profileMenuButton.addEventListener(
                "click",
                function (event) {

                    event.stopPropagation();

                    const estaAbierto =
                        !profileMenu.hidden;

                    profileMenu.hidden =
                        estaAbierto;

                    profileMenuButton.setAttribute(
                        "aria-expanded",
                        String(!estaAbierto)
                    );

                    if (profileArrow) {

                        profileArrow.textContent =
                            estaAbierto
                                ? "▼"
                                : "▲";
                    }

                }
            );
        }


        document.addEventListener(
            "click",
            function (event) {

                const container =
                    document.getElementById(
                        "profileMenuContainer"
                    );

                if (
                    container &&
                    !container.contains(event.target)
                ) {

                    if (profileMenu) {
                        profileMenu.hidden = true;
                    }

                    if (profileMenuButton) {

                        profileMenuButton.setAttribute(
                            "aria-expanded",
                            "false"
                        );
                    }

                    if (profileArrow) {
                        profileArrow.textContent = "▼";
                    }
                }

            }
        );


        if (topbarLogoutButton) {

            topbarLogoutButton.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    cerrarSesion();

                }
            );
        }
    }



    /*
     * =========================================================
     * AUTORIZACIÓN
     * =========================================================
     */

    function verificarAutorizacion(response) {

        if (response.status === 401) {

            sessionStorage.clear();

            window.location.href =
                "/login";

            return false;
        }

        return true;
    }



    /*
     * =========================================================
     * ERROR DEL BACKEND
     * =========================================================
     */

    async function obtenerMensajeError(response, mensajePorDefecto) {

        try {

            const data =
                await response.json();

            return (
                data.mensaje ||
                data.message ||
                mensajePorDefecto
            );

        } catch (error) {

            return mensajePorDefecto;
        }
    }



    /*
     * =========================================================
     * MENSAJES
     * =========================================================
     */

    function mostrarMensaje(mensaje, tipo) {

        attendanceMessage.textContent =
            mensaje;

        attendanceMessage.hidden =
            false;

        attendanceMessage.className =
            "asistencia-message " +
            (
                tipo === "success"
                    ? "asistencia-message--success"
                    : "asistencia-message--error"
            );
    }


    function ocultarMensaje() {

        attendanceMessage.hidden =
            true;

        attendanceMessage.textContent =
            "";
    }



    /*
     * =========================================================
     * FORMATO DE HORA
     * =========================================================
     */

    function formatearHora(hora) {

        if (!hora) {
            return "-";
        }

        return hora.substring(0, 5);
    }



    /*
     * =========================================================
     * CARGAR GRUPOS DEL DÍA
     * =========================================================
     */

    async function cargarGruposDelDia() {

        const fecha =
            fechaInput.value;

        grupoSelect.innerHTML = `
            <option value="">
                Cargando grupos...
            </option>
        `;

        grupoSelect.disabled = true;

        limpiarEstudiantes();

        if (!fecha) {

            grupoSelect.innerHTML = `
                <option value="">
                    Selecciona una fecha primero
                </option>
            `;

            return;
        }


        const diaSemana =
            obtenerDiaSemana(fecha);


        try {

            const response =
                await fetch(
                    `/api/grupo-horarios/dia/${diaSemana}`,
                    {
                        method: "GET",

                        headers: {
                            "Authorization":
                                "Basic " + auth
                        }
                    }
                );


            if (!verificarAutorizacion(response)) {
                return;
            }


            if (response.status === 403) {

                throw new Error(
                    "No tienes permisos para consultar los horarios."
                );
            }


            if (!response.ok) {

                throw new Error(
                    await obtenerMensajeError(
                        response,
                        "No se pudieron obtener los grupos del día."
                    )
                );
            }


            horariosDelDia =
                await response.json();


            grupoSelect.innerHTML = `
                <option value="">
                    Selecciona un grupo
                </option>
            `;


            /*
             * Evitar grupos repetidos.
             */

            const gruposMostrados =
                new Set();


            horariosDelDia.forEach(
                horario => {

                    if (
                        gruposMostrados.has(
                            horario.grupoId
                        )
                    ) {
                        return;
                    }

                    gruposMostrados.add(
                        horario.grupoId
                    );


                    const option =
                        document.createElement(
                            "option"
                        );

                    option.value =
                        horario.grupoId;

                    option.textContent =
                        `${horario.grupoNombre} (${formatearHora(horario.horaInicio)} - ${formatearHora(horario.horaFin)})`;

                    grupoSelect.appendChild(
                        option
                    );
                }
            );


            if (horariosDelDia.length === 0) {

                grupoSelect.innerHTML = `
                    <option value="">
                        No hay grupos este día
                    </option>
                `;
            }


            grupoSelect.disabled =
                horariosDelDia.length === 0;


        } catch (error) {

            console.error(
                "Error cargando grupos del día:",
                error
            );


            grupoSelect.innerHTML = `
                <option value="">
                    Error al cargar grupos
                </option>
            `;


            mostrarMensaje(
                error.message,
                "error"
            );
        }
    }



    /*
     * =========================================================
     * LIMPIAR ESTUDIANTES
     * =========================================================
     */

    function limpiarEstudiantes() {

        estudiantesGrupo = [];

        asistenciasGrupo = [];

        grupoInfo.hidden = true;

        saveAttendanceButton.disabled =
            true;

        attendanceRegister.innerHTML = `
            <div class="asistencia-empty">

                Selecciona una fecha y un grupo
                para mostrar los estudiantes.

            </div>
        `;
    }



    /*
     * =========================================================
     * CARGAR ESTUDIANTES DEL GRUPO
     * =========================================================
     */

    async function cargarEstudiantesGrupo() {

        const grupoId =
            grupoSelect.value;

        const fecha =
            fechaInput.value;


        limpiarEstudiantes();


        if (!grupoId || !fecha) {
            return;
        }


        ocultarMensaje();


        try {

            /*
             * BUSCAR INFORMACIÓN DEL HORARIO
             */

            const horario =
                horariosDelDia.find(
                    item =>
                        Number(item.grupoId) ===
                        Number(grupoId)
                );


            if (horario) {

                grupoInfoNombre.textContent =
                    horario.grupoNombre;

                grupoInfoHorario.textContent =
                    `${formatearHora(horario.horaInicio)} - ${formatearHora(horario.horaFin)}`;

                grupoInfoSensei.textContent =
                    horario.senseiNombre || "-";
            }


            /*
             * ESTUDIANTES
             */

            const estudiantesResponse =
                await fetch(
                    `/api/estudiantes-grupos/grupo/${grupoId}`,
                    {
                        method: "GET",

                        headers: {
                            "Authorization":
                                "Basic " + auth
                        }
                    }
                );


            if (!verificarAutorizacion(
                estudiantesResponse
            )) {

                return;
            }


            if (
                estudiantesResponse.status ===
                403
            ) {

                throw new Error(
                    "No tienes permisos para consultar los estudiantes del grupo."
                );
            }


            if (!estudiantesResponse.ok) {

                throw new Error(
                    await obtenerMensajeError(
                        estudiantesResponse,
                        "No se pudieron obtener los estudiantes del grupo."
                    )
                );
            }


            const asignaciones =
                await estudiantesResponse.json();


            estudiantesGrupo =
                asignaciones.filter(
                    asignacion =>
                        String(
                            asignacion.estado
                        ).toUpperCase() === "ACTIVO"
                );


            /*
             * ASISTENCIAS EXISTENTES
             */

            const asistenciasResponse =
                await fetch(
                    `/api/asistencias/grupo/${grupoId}/fecha/${fecha}`,
                    {
                        method: "GET",

                        headers: {
                            "Authorization":
                                "Basic " + auth
                        }
                    }
                );


            if (!verificarAutorizacion(
                asistenciasResponse
            )) {

                return;
            }


            if (
                asistenciasResponse.status ===
                403
            ) {

                throw new Error(
                    "No tienes permisos para consultar las asistencias."
                );
            }


            if (!asistenciasResponse.ok) {

                throw new Error(
                    await obtenerMensajeError(
                        asistenciasResponse,
                        "No se pudieron obtener las asistencias del grupo."
                    )
                );
            }


            asistenciasGrupo =
                await asistenciasResponse.json();


            /*
             * INFORMACIÓN DEL GRUPO
             */

            grupoInfoCantidad.textContent =
                estudiantesGrupo.length;

            grupoInfo.hidden =
                false;


            /*
             * RENDERIZAR
             */

            renderizarEstudiantes();


        } catch (error) {

            console.error(
                "Error cargando estudiantes:",
                error
            );


            attendanceRegister.innerHTML = `
                <div class="asistencia-empty">
                    ${error.message}
                </div>
            `;
        }
    }



    /*
     * =========================================================
     * BUSCAR ASISTENCIA EXISTENTE
     * =========================================================
     */

    function buscarAsistencia(estudianteId) {

        return asistenciasGrupo.find(
            asistencia =>
                Number(
                    asistencia.estudianteId
                ) === Number(estudianteId)
        );
    }



    /*
     * =========================================================
     * RENDERIZAR ESTUDIANTES
     * =========================================================
     */

    function renderizarEstudiantes() {

        if (estudiantesGrupo.length === 0) {

            attendanceRegister.innerHTML = `
                <div class="asistencia-empty">

                    No hay estudiantes activos
                    en este grupo.

                </div>
            `;

            saveAttendanceButton.disabled =
                true;

            return;
        }


        attendanceRegister.innerHTML = `

            <div class="asistencia-register-header">

                <div>

                    <strong>
                        Estudiantes del grupo
                    </strong>

                    <span>
                        Selecciona el estado de cada estudiante.
                    </span>

                </div>

            </div>


            <div class="asistencia-student-list">

                ${estudiantesGrupo.map(
            asignacion => {

                const asistencia =
                    buscarAsistencia(
                        asignacion.estudianteId
                    );


                const estado =
                    asistencia
                        ? asistencia.estado
                        : "AUSENTE";


                const hora =
                    asistencia &&
                        asistencia.horaLlegada
                        ? asistencia.horaLlegada.substring(0, 5)
                        : "";


                const observacion =
                    asistencia &&
                        asistencia.observacion
                        ? asistencia.observacion
                        : "";


                return `

                            <div class="asistencia-student-row"
                                 data-estudiante-id="${asignacion.estudianteId}"
                                 data-asistencia-id="${asistencia ? asistencia.id : ""}">


                                <div class="asistencia-student-info">

                                    <strong>
                                        ${asignacion.estudianteNombre}
                                    </strong>

                                    <span>
                                        Estudiante
                                    </span>

                                </div>



                                <div class="asistencia-state-buttons">

                                    <button type="button"
                                            class="asistencia-state-button asistencia-state-button--presente ${estado === "PRESENTE" ? "is-active" : ""}"
                                            data-estado="PRESENTE">

                                        PRESENTE

                                    </button>


                                    <button type="button"
                                            class="asistencia-state-button asistencia-state-button--tardanza ${estado === "TARDANZA" ? "is-active" : ""}"
                                            data-estado="TARDANZA">

                                        TARDANZA

                                    </button>


                                    <button type="button"
                                            class="asistencia-state-button asistencia-state-button--ausente ${estado === "AUSENTE" ? "is-active" : ""}"
                                            data-estado="AUSENTE">

                                        AUSENTE

                                    </button>

                                </div>



                                <div class="asistencia-student-fields">

                                    <div class="form-group">

                                        <label class="form-label">
                                            Hora
                                        </label>

                                        <input type="time"
                                               class="form-input asistencia-hora"
                                               value="${hora}"
                                               ${estado === "AUSENTE" ? "disabled" : ""}>

                                    </div>


                                    <div class="form-group">

                                        <label class="form-label">
                                            Observación
                                        </label>

                                        <input type="text"
                                               class="form-input asistencia-observacion"
                                               value="${observacion}"
                                               placeholder="Opcional">

                                    </div>

                                </div>

                            </div>

                        `;

            }
        ).join("")}

            </div>
        `;


        configurarBotonesEstado();


        saveAttendanceButton.disabled =
            false;
    }



    /*
     * =========================================================
     * BOTONES DE ESTADO
     * =========================================================
     */

    function configurarBotonesEstado() {

        const botones =
            attendanceRegister.querySelectorAll(
                ".asistencia-state-button"
            );


        botones.forEach(
            boton => {

                boton.addEventListener(
                    "click",
                    function () {

                        const fila =
                            boton.closest(
                                ".asistencia-student-row"
                            );

                        const estado =
                            boton.dataset.estado;


                        fila
                            .querySelectorAll(
                                ".asistencia-state-button"
                            )
                            .forEach(
                                otroBoton => {

                                    otroBoton.classList.remove(
                                        "is-active"
                                    );

                                }
                            );


                        boton.classList.add(
                            "is-active"
                        );


                        const horaInput =
                            fila.querySelector(
                                ".asistencia-hora"
                            );


                        if (
                            estado === "AUSENTE"
                        ) {

                            horaInput.value =
                                "";

                            horaInput.disabled =
                                true;

                            horaInput.required =
                                false;

                        } else {

                            horaInput.disabled =
                                false;

                            horaInput.required =
                                true;


                            /*
                             * Si no existe una hora,
                             * colocar la hora actual.
                             */

                            if (!horaInput.value) {

                                const ahora =
                                    new Date();

                                const horas =
                                    String(
                                        ahora.getHours()
                                    ).padStart(
                                        2,
                                        "0"
                                    );

                                const minutos =
                                    String(
                                        ahora.getMinutes()
                                    ).padStart(
                                        2,
                                        "0"
                                    );

                                horaInput.value =
                                    `${horas}:${minutos}`;
                            }
                        }

                    }
                );
            }
        );
    }



    /*
     * =========================================================
     * OBTENER ESTADO DE UNA FILA
     * =========================================================
     */

    function obtenerDatosFila(fila) {

        const estudianteId =
            Number(
                fila.dataset.estudianteId
            );


        const asistenciaId =
            fila.dataset.asistenciaId
                ? Number(
                    fila.dataset.asistenciaId
                )
                : null;


        const botonActivo =
            fila.querySelector(
                ".asistencia-state-button.is-active"
            );


        const estado =
            botonActivo
                ? botonActivo.dataset.estado
                : "AUSENTE";


        const horaInput =
            fila.querySelector(
                ".asistencia-hora"
            );


        const observacionInput =
            fila.querySelector(
                ".asistencia-observacion"
            );


        return {

            asistenciaId,

            estudianteId,

            grupoId:
                Number(
                    grupoSelect.value
                ),

            fecha:
                fechaInput.value,

            horaLlegada:
                estado === "AUSENTE"
                    ? null
                    : horaInput.value || null,

            estado,

            observacion:
                observacionInput.value.trim()
                || null

        };
    }



    /*
     * =========================================================
     * GUARDAR ASISTENCIAS
     * =========================================================
     */

    async function guardarAsistencias() {

        const filas =
            attendanceRegister.querySelectorAll(
                ".asistencia-student-row"
            );


        if (filas.length === 0) {

            mostrarMensaje(
                "No hay estudiantes para registrar.",
                "error"
            );

            return;
        }


        const asistencias =
            Array.from(filas)
                .map(obtenerDatosFila);


        /*
         * VALIDAR HORAS
         */

        for (
            const asistencia of asistencias
        ) {

            if (
                (
                    asistencia.estado === "PRESENTE" ||
                    asistencia.estado === "TARDANZA"
                ) &&
                !asistencia.horaLlegada
            ) {

                mostrarMensaje(
                    "Los estudiantes PRESENTES o con TARDANZA deben tener una hora de llegada.",
                    "error"
                );

                return;
            }


            if (
                asistencia.estado === "AUSENTE" &&
                asistencia.horaLlegada
            ) {

                mostrarMensaje(
                    "Un estudiante AUSENTE no puede tener hora de llegada.",
                    "error"
                );

                return;
            }
        }


        saveAttendanceButton.disabled =
            true;

        saveAttendanceButton.textContent =
            "Guardando...";


        ocultarMensaje();


        try {

            let registrados =
                0;

            let actualizados =
                0;


            for (
                const asistencia of asistencias
            ) {

                let response;


                /*
                 * SI YA EXISTE → PUT
                 */

                if (
                    asistencia.asistenciaId
                ) {

                    response =
                        await fetch(
                            `/api/asistencias/${asistencia.asistenciaId}`,
                            {
                                method: "PUT",

                                headers: {

                                    "Authorization":
                                        "Basic " + auth,

                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify(
                                        {
                                            estudianteId:
                                                asistencia.estudianteId,

                                            grupoId:
                                                asistencia.grupoId,

                                            fecha:
                                                asistencia.fecha,

                                            horaLlegada:
                                                asistencia.horaLlegada,

                                            estado:
                                                asistencia.estado,

                                            observacion:
                                                asistencia.observacion
                                        }
                                    )
                            }
                        );

                } else {

                    /*
                     * NUEVA → POST
                     */

                    response =
                        await fetch(
                            "/api/asistencias",
                            {
                                method: "POST",

                                headers: {

                                    "Authorization":
                                        "Basic " + auth,

                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify(
                                        {
                                            estudianteId:
                                                asistencia.estudianteId,

                                            grupoId:
                                                asistencia.grupoId,

                                            fecha:
                                                asistencia.fecha,

                                            horaLlegada:
                                                asistencia.horaLlegada,

                                            estado:
                                                asistencia.estado,

                                            observacion:
                                                asistencia.observacion
                                        }
                                    )
                            }
                        );
                }


                if (
                    !verificarAutorizacion(
                        response
                    )
                ) {

                    return;
                }


                if (
                    response.status === 403
                ) {

                    throw new Error(
                        "No tienes permisos para modificar las asistencias."
                    );
                }


                if (!response.ok) {

                    throw new Error(
                        await obtenerMensajeError(
                            response,
                            "No se pudo guardar una de las asistencias."
                        )
                    );
                }


                if (
                    asistencia.asistenciaId
                ) {

                    actualizados++;

                } else {

                    registrados++;
                }
            }


            mostrarMensaje(
                `Asistencia guardada correctamente. ${registrados} registrada(s) y ${actualizados} actualizada(s).`,
                "success"
            );


            /*
             * RECARGAR LOS DATOS DEL GRUPO
             */

            await cargarEstudiantesGrupo();


            /*
             * ACTUALIZAR CONSULTA
             */

            await cargarAsistenciasConsulta();


        } catch (error) {

            console.error(
                "Error guardando asistencias:",
                error
            );


            mostrarMensaje(
                error.message,
                "error"
            );


        } finally {

            saveAttendanceButton.disabled =
                false;

            saveAttendanceButton.textContent =
                "Guardar asistencia";
        }
    }



    /*
     * =========================================================
     * CARGAR GRUPOS PARA CONSULTA
     * =========================================================
     */

    async function cargarGruposConsulta() {

        try {

            const response =
                await fetch(
                    "/api/grupos?estado=ACTIVO",
                    {
                        method: "GET",

                        headers: {
                            "Authorization":
                                "Basic " + auth
                        }
                    }
                );


            if (!verificarAutorizacion(response)) {
                return;
            }


            if (!response.ok) {

                throw new Error(
                    await obtenerMensajeError(
                        response,
                        "No se pudieron cargar los grupos."
                    )
                );
            }


            const grupos =
                await response.json();


            grupoConsulta.innerHTML = `
                <option value="">
                    Todos los grupos
                </option>
            `;


            grupos.forEach(
                grupo => {

                    const option =
                        document.createElement(
                            "option"
                        );

                    option.value =
                        grupo.id;

                    option.textContent =
                        grupo.nombre;

                    grupoConsulta.appendChild(
                        option
                    );
                }
            );

        } catch (error) {

            console.error(
                "Error cargando grupos de consulta:",
                error
            );
        }
    }



    /*
     * =========================================================
     * CARGAR ESTUDIANTES PARA CONSULTA
     * =========================================================
     */

    async function cargarEstudiantesConsulta() {

        try {

            const response =
                await fetch(
                    "/api/estudiantes?estado=ACTIVO",
                    {
                        method: "GET",

                        headers: {
                            "Authorization":
                                "Basic " + auth
                        }
                    }
                );


            if (!verificarAutorizacion(response)) {
                return;
            }


            if (!response.ok) {

                throw new Error(
                    await obtenerMensajeError(
                        response,
                        "No se pudieron cargar los estudiantes."
                    )
                );
            }


            const estudiantes =
                await response.json();


            estudianteConsulta.innerHTML = `
                <option value="">
                    Todos los estudiantes
                </option>
            `;


            estudiantes.forEach(
                estudiante => {

                    const option =
                        document.createElement(
                            "option"
                        );

                    option.value =
                        estudiante.id;

                    option.textContent =
                        `${estudiante.nombre} ${estudiante.apellido}`;

                    estudianteConsulta.appendChild(
                        option
                    );
                }
            );

        } catch (error) {

            console.error(
                "Error cargando estudiantes de consulta:",
                error
            );
        }
    }



    /*
     * =========================================================
     * CARGAR ASISTENCIAS PARA CONSULTA
     * =========================================================
     */

    async function cargarAsistenciasConsulta() {

        const fecha =
            fechaConsulta.value;


        if (!fecha) {

            attendanceList.innerHTML = `
                <div class="asistencia-empty">
                    Selecciona una fecha para consultar.
                </div>
            `;

            attendanceCount.textContent =
                "0 asistencias";

            return;
        }


        attendanceList.innerHTML = `
            <div class="asistencia-loading">
                Cargando asistencias...
            </div>
        `;


        try {

            const response =
                await fetch(
                    `/api/asistencias/fecha/${fecha}`,
                    {
                        method: "GET",

                        headers: {
                            "Authorization":
                                "Basic " + auth
                        }
                    }
                );


            if (!verificarAutorizacion(response)) {
                return;
            }


            if (response.status === 403) {

                throw new Error(
                    "No tienes permisos para consultar asistencias."
                );
            }


            if (!response.ok) {

                throw new Error(
                    await obtenerMensajeError(
                        response,
                        "No se pudieron obtener las asistencias."
                    )
                );
            }


            asistenciasConsulta =
                await response.json();


            /*
             * FILTRO POR GRUPO
             */

            const grupoId =
                grupoConsulta.value
                    ? Number(
                        grupoConsulta.value
                    )
                    : null;


            /*
             * FILTRO POR ESTUDIANTE
             */

            const estudianteId =
                estudianteConsulta.value
                    ? Number(
                        estudianteConsulta.value
                    )
                    : null;


            let resultados =
                asistenciasConsulta.filter(
                    asistencia => {

                        if (
                            grupoId &&
                            Number(
                                asistencia.grupoId
                            ) !== grupoId
                        ) {

                            return false;
                        }


                        if (
                            estudianteId &&
                            Number(
                                asistencia.estudianteId
                            ) !== estudianteId
                        ) {

                            return false;
                        }


                        return true;
                    }
                );


            attendanceCount.textContent =
                `${resultados.length} asistencia${resultados.length !== 1 ? "s" : ""}`;


            if (resultados.length === 0) {

                attendanceList.innerHTML = `
                    <div class="asistencia-empty">
                        No hay asistencias que coincidan
                        con los filtros seleccionados.
                    </div>
                `;

                return;
            }


            /*
             * TABLA
             */

            attendanceList.innerHTML = `

                <table class="asistencia-table">

                    <thead>

                        <tr>

                            <th>
                                Estudiante
                            </th>

                            <th>
                                Grupo
                            </th>

                            <th>
                                Fecha
                            </th>

                            <th>
                                Hora
                            </th>

                            <th>
                                Estado
                            </th>

                            <th>
                                Observación
                            </th>

                            <th>
                                Acción
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        ${resultados.map(
                asistencia => {

                    return `

                                    <tr data-consulta-id="${asistencia.id}">

                                        <td>
                                            ${asistencia.estudianteNombre}
                                        </td>


                                        <td>
                                            ${asistencia.grupoNombre}
                                        </td>


                                        <td>
                                            ${asistencia.fecha}
                                        </td>


                                        <td>
                                            ${asistencia.horaLlegada
                            ? asistencia.horaLlegada.substring(0, 5)
                            : "-"
                        }
                                        </td>


                                        <td>

                                            <span class="
                                                asistencia-estado
                                                asistencia-estado--${String(
                            asistencia.estado
                        ).toLowerCase()}
                                            ">

                                                ${asistencia.estado}

                                            </span>

                                        </td>


                                        <td>
                                            ${asistencia.observacion || "-"}
                                        </td>


                                        <td>

                                            <button type="button"
                                                    class="btn btn--secondary asistencia-edit-button"
                                                    data-id="${asistencia.id}">

                                                Editar

                                            </button>

                                        </td>

                                    </tr>

                                `;

                }
            ).join("")}

                    </tbody>

                </table>

            `;


            configurarBotonesEdicion();


        } catch (error) {

            console.error(
                "Error cargando asistencias:",
                error
            );


            attendanceList.innerHTML = `
                <div class="asistencia-empty">
                    ${error.message}
                </div>
            `;
        }
    }



    /*
     * =========================================================
     * EDITAR ASISTENCIA DESDE CONSULTA
     * =========================================================
     */

    function configurarBotonesEdicion() {

        const botones =
            document.querySelectorAll(
                ".asistencia-edit-button"
            );


        botones.forEach(
            boton => {

                boton.addEventListener(
                    "click",
                    function () {

                        const id =
                            Number(
                                boton.dataset.id
                            );


                        const asistencia =
                            asistenciasConsulta.find(
                                item =>
                                    Number(
                                        item.id
                                    ) === id
                            );


                        if (!asistencia) {
                            return;
                        }


                        abrirEditorConsulta(
                            asistencia
                        );
                    }
                );
            }
        );
    }



    /*
     * =========================================================
     * EDITOR DE CONSULTA
     * =========================================================
     */

    function abrirEditorConsulta(
        asistencia
    ) {

        const fila =
            document.querySelector(
                `tr[data-consulta-id="${asistencia.id}"]`
            );


        if (!fila) {
            return;
        }


        fila.innerHTML = `

            <td>
                ${asistencia.estudianteNombre}
            </td>


            <td>
                ${asistencia.grupoNombre}
            </td>


            <td>
                ${asistencia.fecha}
            </td>


            <td>

                <input type="time"
                       class="form-input asistencia-edit-hora"
                       value="${asistencia.horaLlegada
                ? asistencia.horaLlegada.substring(0, 5)
                : ""
            }">

            </td>


            <td>

                <select class="form-select asistencia-edit-estado">

                    <option value="PRESENTE"
                        ${asistencia.estado === "PRESENTE" ? "selected" : ""}>
                        PRESENTE
                    </option>

                    <option value="TARDANZA"
                        ${asistencia.estado === "TARDANZA" ? "selected" : ""}>
                        TARDANZA
                    </option>

                    <option value="AUSENTE"
                        ${asistencia.estado === "AUSENTE" ? "selected" : ""}>
                        AUSENTE
                    </option>

                </select>

            </td>


            <td>

                <input type="text"
                       class="form-input asistencia-edit-observacion"
                       value="${asistencia.observacion || ""}"
                       placeholder="Opcional">

            </td>


            <td>

                <div class="asistencia-edit-actions">

                    <button type="button"
                            class="btn btn--primary asistencia-save-edit">

                        Guardar

                    </button>


                    <button type="button"
                            class="btn btn--secondary asistencia-cancel-edit">

                        Cancelar

                    </button>

                </div>

            </td>

        `;


        const estadoSelect =
            fila.querySelector(
                ".asistencia-edit-estado"
            );

        const horaInput =
            fila.querySelector(
                ".asistencia-edit-hora"
            );


        function actualizarHoraEdicion() {

            if (
                estadoSelect.value ===
                "AUSENTE"
            ) {

                horaInput.value = "";

                horaInput.disabled =
                    true;

            } else {

                horaInput.disabled =
                    false;
            }
        }


        estadoSelect.addEventListener(
            "change",
            actualizarHoraEdicion
        );


        actualizarHoraEdicion();


        fila
            .querySelector(
                ".asistencia-save-edit"
            )
            .addEventListener(
                "click",
                function () {

                    guardarEdicionConsulta(
                        asistencia,
                        fila
                    );
                }
            );


        fila
            .querySelector(
                ".asistencia-cancel-edit"
            )
            .addEventListener(
                "click",
                function () {

                    cargarAsistenciasConsulta();
                }
            );
    }



    /*
     * =========================================================
     * GUARDAR EDICIÓN
     * =========================================================
     */

    async function guardarEdicionConsulta(
        asistencia,
        fila
    ) {

        const estadoSelect =
            fila.querySelector(
                ".asistencia-edit-estado"
            );

        const horaInput =
            fila.querySelector(
                ".asistencia-edit-hora"
            );

        const observacionInput =
            fila.querySelector(
                ".asistencia-edit-observacion"
            );


        const estado =
            estadoSelect.value;


        const horaLlegada =
            estado === "AUSENTE"
                ? null
                : horaInput.value || null;


        if (
            (
                estado === "PRESENTE" ||
                estado === "TARDANZA"
            ) &&
            !horaLlegada
        ) {

            alert(
                "Los estados PRESENTE y TARDANZA requieren hora de llegada."
            );

            return;
        }


        try {

            const response =
                await fetch(
                    `/api/asistencias/${asistencia.id}`,
                    {
                        method: "PUT",

                        headers: {

                            "Authorization":
                                "Basic " + auth,

                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({

                                estudianteId:
                                    asistencia.estudianteId,

                                grupoId:
                                    asistencia.grupoId,

                                fecha:
                                    asistencia.fecha,

                                horaLlegada,

                                estado,

                                observacion:
                                    observacionInput.value.trim()
                                    || null

                            })
                    }
                );


            if (
                !verificarAutorizacion(
                    response
                )
            ) {

                return;
            }


            if (response.status === 403) {

                throw new Error(
                    "No tienes permisos para modificar asistencias."
                );
            }


            if (!response.ok) {

                throw new Error(
                    await obtenerMensajeError(
                        response,
                        "No se pudo actualizar la asistencia."
                    )
                );
            }


            await cargarAsistenciasConsulta();


            /*
             * Si estamos editando la misma fecha
             * del registro actual, también actualizamos
             * la vista de registro.
             */

            if (
                fechaInput.value ===
                asistencia.fecha &&
                String(
                    grupoSelect.value
                ) === String(
                    asistencia.grupoId
                )
            ) {

                await cargarEstudiantesGrupo();
            }


        } catch (error) {

            console.error(
                "Error actualizando asistencia:",
                error
            );


            alert(
                error.message
            );
        }
    }



    /*
     * =========================================================
     * EVENTOS
     * =========================================================
     */

    fechaInput.addEventListener(
        "change",
        async function () {

            ocultarMensaje();

            await cargarGruposDelDia();
        }
    );


    grupoSelect.addEventListener(
        "change",
        cargarEstudiantesGrupo
    );


    saveAttendanceButton.addEventListener(
        "click",
        guardarAsistencias
    );


    fechaConsulta.addEventListener(
        "change",
        cargarAsistenciasConsulta
    );


    grupoConsulta.addEventListener(
        "change",
        cargarAsistenciasConsulta
    );


    estudianteConsulta.addEventListener(
        "change",
        cargarAsistenciasConsulta
    );



    /*
     * =========================================================
     * INICIALIZACIÓN
     * =========================================================
     */

    configurarMenuPerfil();


    const fechaActual =
        obtenerFechaLocal();


    fechaInput.value =
        fechaActual;

    fechaConsulta.value =
        fechaActual;


    /*
     * Cargar datos iniciales
     */

    cargarGruposDelDia();

    cargarGruposConsulta();

    cargarEstudiantesConsulta();

    cargarAsistenciasConsulta();

});