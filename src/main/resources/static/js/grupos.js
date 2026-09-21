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

    const rol =
        sessionStorage.getItem("kihonRol");


    /*
     * =========================================================
     * ELEMENTOS DEL DOM
     * =========================================================
     */

    const usernameDisplay =
        document.getElementById("usernameDisplay");

    const roleDisplay =
        document.getElementById("roleDisplay");

    const profileRoleDisplay =
        document.getElementById("profileRoleDisplay");

    const userAvatarInitial =
        document.getElementById("userAvatarInitial");


    /*
     * FORMULARIO DE GRUPO
     */

    const groupForm =
        document.getElementById("groupForm");

    const groupMessage =
        document.getElementById("groupMessage");


    /*
     * LISTA DE GRUPOS
     */

    const groupsList =
        document.getElementById("groupsList");

    const groupsCount =
        document.getElementById("groupsCount");


    /*
     * EDICIÓN
     */

    const editGroupSection =
        document.getElementById("editGroupSection");

    const editGroupForm =
        document.getElementById("editGroupForm");

    const editGroupMessage =
        document.getElementById("editGroupMessage");

    const cancelEditButton =
        document.getElementById("cancelEditButton");


    /*
     * SENSEIS
     */

    const senseiSelect =
        document.getElementById("groupSenseiId");

    const editSenseiSelect =
        document.getElementById("editSenseiId");


    /*
     * HORARIOS
     */

    const groupSchedulesList =
        document.getElementById("groupSchedulesList");

    const scheduleDay =
        document.getElementById("scheduleDay");

    const scheduleStart =
        document.getElementById("scheduleStart");

    const scheduleEnd =
        document.getElementById("scheduleEnd");

    const addScheduleButton =
        document.getElementById("addScheduleButton");

    const scheduleMessage =
        document.getElementById("scheduleMessage");


    /*
     * =========================================================
     * MODAL REGISTRAR GRUPO
     * =========================================================
     */

    const groupModal =
        document.getElementById("groupModal");

    const openGroupModalButton =
        document.getElementById("openGroupModalButton");

    const closeGroupModalButton =
        document.getElementById("closeGroupModalButton");

    const cancelGroupModalButton =
        document.getElementById("cancelGroupModalButton");

    const groupModalOverlay =
        document.getElementById("groupModalOverlay");


    /*
     * =========================================================
     * VERIFICAR SESIÓN
     * =========================================================
     */

    if (!auth || !username) {

        window.location.href =
            "/login";

        return;
    }


    /*
     * =========================================================
     * INFORMACIÓN DEL USUARIO
     * =========================================================
     */

    if (usernameDisplay) {

        usernameDisplay.textContent =
            username;
    }


    if (roleDisplay) {

        roleDisplay.textContent =
            rol === "ADMIN"
                ? "Administrador"
                : rol || "Usuario";
    }


    if (profileRoleDisplay) {

        profileRoleDisplay.textContent =
            rol === "ADMIN"
                ? "Administrador"
                : rol || "Usuario";
    }


    if (userAvatarInitial) {

        userAvatarInitial.textContent =
            username.charAt(0).toUpperCase();
    }


    /*
     * =========================================================
     * MENÚ DE PERFIL
     * =========================================================
     */

    const profileMenuButton =
        document.getElementById(
            "profileMenuButton"
        );

    const profileMenu =
        document.getElementById(
            "profileMenu"
        );

    const profileMenuContainer =
        document.getElementById(
            "profileMenuContainer"
        );


    if (
        profileMenuButton &&
        profileMenu
    ) {

        profileMenuButton.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();

                profileMenu.hidden =
                    !profileMenu.hidden;
            }
        );


        document.addEventListener(
            "click",
            function (event) {

                if (
                    profileMenuContainer &&
                    !profileMenuContainer.contains(
                        event.target
                    )
                ) {

                    profileMenu.hidden =
                        true;
                }

            }
        );
    }


    /*
     * =========================================================
     * MODAL - ABRIR
     * =========================================================
     */

    function abrirModalGrupo() {

        if (!groupModal) {
            return;
        }


        groupModal.hidden =
            false;


        document.body.classList.add(
            "modal-open"
        );


        /*
         * Ocultar mensajes anteriores
         */

        if (groupMessage) {

            ocultarMensaje(
                groupMessage
            );
        }


        /*
         * Enfocar primer campo
         */

        const nombreInput =
            document.getElementById(
                "groupNombre"
            );


        if (nombreInput) {

            setTimeout(
                function () {

                    nombreInput.focus();

                },
                100
            );
        }
    }


    /*
     * =========================================================
     * MODAL - CERRAR
     * =========================================================
     */

    function cerrarModalGrupo() {

        if (!groupModal) {
            return;
        }


        groupModal.hidden =
            true;


        document.body.classList.remove(
            "modal-open"
        );
    }


    /*
     * =========================================================
     * MODAL - BOTONES
     * =========================================================
     */

    if (openGroupModalButton) {

        openGroupModalButton.addEventListener(
            "click",
            function () {

                abrirModalGrupo();

            }
        );
    }


    if (closeGroupModalButton) {

        closeGroupModalButton.addEventListener(
            "click",
            function () {

                cerrarModalGrupo();

            }
        );
    }


    if (cancelGroupModalButton) {

        cancelGroupModalButton.addEventListener(
            "click",
            function () {

                cerrarModalGrupo();

            }
        );
    }


    if (groupModalOverlay) {

        groupModalOverlay.addEventListener(
            "click",
            function () {

                cerrarModalGrupo();

            }
        );
    }


    /*
     * =========================================================
     * CERRAR MODAL CON ESC
     * =========================================================
     */

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape" &&
                groupModal &&
                !groupModal.hidden
            ) {

                cerrarModalGrupo();
            }

        }
    );


    /*
     * =========================================================
     * FUNCIONES DE MENSAJES
     * =========================================================
     */

    function mostrarMensaje(
        elemento,
        mensaje,
        tipo
    ) {

        if (!elemento) {
            return;
        }


        elemento.textContent =
            mensaje;

        elemento.hidden =
            false;


        if (tipo === "success") {

            elemento.className =
                "grupos-message grupos-message--success";

        } else {

            elemento.className =
                "grupos-message grupos-message--error";
        }
    }


    function ocultarMensaje(elemento) {

        if (!elemento) {
            return;
        }


        elemento.hidden =
            true;

        elemento.textContent =
            "";

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


        return hora.substring(
            0,
            5
        );
    }


    /*
     * =========================================================
     * NOMBRE DEL DÍA
     * =========================================================
     */

    function obtenerNombreDia(dia) {

        const dias = {

            LUNES:
                "Lunes",

            MARTES:
                "Martes",

            MIERCOLES:
                "Miércoles",

            JUEVES:
                "Jueves",

            VIERNES:
                "Viernes",

            SABADO:
                "Sábado",

            DOMINGO:
                "Domingo"

        };


        return dias[dia] || dia;
    }


    /*
     * =========================================================
     * ORDEN DE LOS DÍAS
     * =========================================================
     */

    function obtenerOrdenDia(dia) {

        const orden = {

            LUNES:
                1,

            MARTES:
                2,

            MIERCOLES:
                3,

            JUEVES:
                4,

            VIERNES:
                5,

            SABADO:
                6,

            DOMINGO:
                7

        };


        return orden[dia] || 99;
    }


    /*
     * =========================================================
     * MANEJAR 401
     * =========================================================
     */

    function manejarNoAutorizado(
        response
    ) {

        if (
            response.status === 401
        ) {

            sessionStorage.clear();

            window.location.href =
                "/login";

            return true;
        }


        return false;
    }


    /*
     * =========================================================
     * OBTENER MENSAJE DE ERROR
     * =========================================================
     */

    async function obtenerMensajeError(
        response,
        mensajeDefecto
    ) {

        try {

            const errorData =
                await response.json();


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
     * OBTENER DÍAS SELECCIONADOS
     * =========================================================
     */

    function obtenerDiasSeleccionados() {

        const checkboxes =
            document.querySelectorAll(
                'input[name="dias"]:checked'
            );


        return Array.from(
            checkboxes
        ).map(
            checkbox =>
                checkbox.value
        );
    }


    /*
     * =========================================================
     * LIMPIAR DÍAS
     * =========================================================
     */

    function limpiarDiasSeleccionados() {

        const checkboxes =
            document.querySelectorAll(
                'input[name="dias"]'
            );


        checkboxes.forEach(
            checkbox => {

                checkbox.checked =
                    false;

            }
        );
    }


    /*
     * =========================================================
     * CARGAR SENSEIS
     * =========================================================
     */

    async function cargarSenseis() {

        try {

            const response =
                await fetch(
                    "/api/usuarios/senseis",
                    {
                        method: "GET",

                        headers: {

                            "Authorization":
                                "Basic " + auth

                        }
                    }
                );


            if (
                manejarNoAutorizado(
                    response
                )
            ) {

                return;
            }


            if (
                response.status === 403
            ) {

                throw new Error(
                    "No tienes permisos para consultar los senseis."
                );
            }


            if (!response.ok) {

                throw new Error(
                    "No se pudieron obtener los senseis."
                );
            }


            const senseis =
                await response.json();


            /*
             * LIMPIAR SELECTORES
             */

            senseiSelect.innerHTML = `
                <option value="">
                    Sin asignar
                </option>
            `;


            editSenseiSelect.innerHTML = `
                <option value="">
                    Sin asignar
                </option>
            `;


            /*
             * AGREGAR SENSEIS
             */

            senseis.forEach(
                sensei => {

                    const nombreCompleto =
                        `${sensei.nombre} ${sensei.apellido}`;


                    const option =
                        document.createElement(
                            "option"
                        );


                    option.value =
                        sensei.id;


                    option.textContent =
                        nombreCompleto;


                    senseiSelect.appendChild(
                        option.cloneNode(true)
                    );


                    editSenseiSelect.appendChild(
                        option
                    );

                }
            );


        } catch (error) {

            console.error(
                "Error cargando senseis:",
                error
            );


            mostrarMensaje(
                groupMessage,
                error.message,
                "error"
            );
        }
    }


    /*
     * =========================================================
     * CARGAR GRUPOS
     * =========================================================
     */

    async function cargarGrupos() {

        groupsList.innerHTML = `

            <div class="grupos-loading">

                <div class="grupos-loading__spinner"></div>

                <span>
                    Cargando grupos...
                </span>

            </div>

        `;


        try {

            const response =
                await fetch(
                    "/api/grupos",
                    {
                        method: "GET",

                        headers: {

                            "Authorization":
                                "Basic " + auth

                        }
                    }
                );


            if (
                manejarNoAutorizado(
                    response
                )
            ) {

                return;
            }


            if (
                response.status === 403
            ) {

                throw new Error(
                    "No tienes permisos para consultar grupos."
                );
            }


            if (!response.ok) {

                throw new Error(
                    "No se pudieron obtener los grupos."
                );
            }


            const grupos =
                await response.json();


            groupsCount.textContent =
                `${grupos.length} grupo${grupos.length !== 1 ? "s" : ""}`;


            if (
                grupos.length === 0
            ) {

                groupsList.innerHTML = `

                    <div class="grupos-empty">

                        No hay grupos registrados.

                    </div>

                `;

                return;
            }


            /*
             * =====================================================
             * OBTENER HORARIOS
             * =====================================================
             */

            const gruposConHorarios =
                await Promise.all(

                    grupos.map(
                        async grupo => {

                            try {

                                const horariosResponse =
                                    await fetch(
                                        `/api/grupo-horarios/grupo/${grupo.id}`,
                                        {
                                            method: "GET",

                                            headers: {

                                                "Authorization":
                                                    "Basic " + auth

                                            }
                                        }
                                    );


                                if (
                                    horariosResponse.status === 401
                                ) {

                                    manejarNoAutorizado(
                                        horariosResponse
                                    );


                                    return {

                                        ...grupo,

                                        horarios: []

                                    };
                                }


                                if (
                                    !horariosResponse.ok
                                ) {

                                    return {

                                        ...grupo,

                                        horarios: []

                                    };
                                }


                                const horarios =
                                    await horariosResponse.json();


                                return {

                                    ...grupo,

                                    horarios:
                                        horarios

                                };


                            } catch (error) {

                                console.error(
                                    `Error cargando horarios del grupo ${grupo.id}:`,
                                    error
                                );


                                return {

                                    ...grupo,

                                    horarios: []

                                };

                            }

                        }
                    )
                );


            /*
             * =====================================================
             * TABLA
             * =====================================================
             */

            groupsList.innerHTML = `

                <table class="grupos-table">

                    <thead>

                        <tr>

                            <th>
                                Grupo
                            </th>

                            <th>
                                Sensei
                            </th>

                            <th>
                                Días
                            </th>

                            <th>
                                Horario
                            </th>

                            <th>
                                Capacidad
                            </th>

                            <th>
                                Inscritos
                            </th>

                            <th>
                                Cupos disponibles
                            </th>

                            <th>
                                Estado
                            </th>

                            <th>
                                Acciones
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        ${gruposConHorarios.map(
                grupo => {

                    const ordenDias = {

                        LUNES: 1,
                        MARTES: 2,
                        MIERCOLES: 3,
                        JUEVES: 4,
                        VIERNES: 5,
                        SABADO: 6,
                        DOMINGO: 7

                    };


                    const inicialesDias = {

                        LUNES: "L",
                        MARTES: "M",
                        MIERCOLES: "X",
                        JUEVES: "J",
                        VIERNES: "V",
                        SABADO: "S",
                        DOMINGO: "D"

                    };


                    const dias =
                        [...grupo.horarios]
                            .sort(
                                (a, b) =>
                                    (
                                        ordenDias[
                                        a.diaSemana
                                        ] || 99
                                    )
                                    -
                                    (
                                        ordenDias[
                                        b.diaSemana
                                        ] || 99
                                    )
                            );


                    const diasIniciales =
                        dias
                            .map(
                                horario =>
                                    inicialesDias[
                                    horario.diaSemana
                                    ] ||
                                    horario.diaSemana
                            )
                            .filter(
                                (dia, index, array) =>
                                    array.indexOf(dia) === index
                            )
                            .join(" - ");


                    const horariosTexto =
                        dias
                            .map(
                                horario =>
                                    `${formatearHora(
                                        horario.horaInicio
                                    )} - ${formatearHora(
                                        horario.horaFin
                                    )}`
                            );


                    const diasMostrar =
                        diasIniciales ||
                        "Sin días";


                    const horarioMostrar =
                        horariosTexto.length > 0
                            ? horariosTexto.join(" / ")
                            : `${formatearHora(
                                grupo.horaInicio
                            )} - ${formatearHora(
                                grupo.horaFin
                            )}`;


                    return `

                                    <tr>

                                        <td>

                                            <div class="grupo-info">

                                                <span class="grupo-nombre">
                                                    ${grupo.nombre}
                                                </span>

                                                <span class="grupo-descripcion">
                                                    ${grupo.descripcion ||
                        "Sin descripción"
                        }
                                                </span>

                                            </div>

                                        </td>


                                        <td>

                                            <span class="grupo-sensei">

                                                ${grupo.senseiNombre ||
                        "Sin asignar"
                        }

                                            </span>

                                        </td>


                                        <td>

                                            <span class="grupo-dias">

                                                ${diasMostrar}

                                            </span>

                                        </td>


                                        <td>

                                            <span class="grupo-horario">

                                                ${horarioMostrar}

                                            </span>

                                        </td>


                                        <td>

                                            <span class="grupo-capacidad">

                                                ${grupo.capacidad}

                                            </span>

                                        </td>


                                        <td>

                                            <span class="grupo-inscritos">

                                                ${grupo.estudiantesActivos}

                                            </span>

                                        </td>


                                        <td>

                                            <span class="
                                                grupo-cupos
                                                ${grupo.cuposDisponibles === 0
                            ? "grupo-cupos--lleno"
                            : ""
                        }
                                            ">

                                                ${grupo.cuposDisponibles}

                                            </span>

                                        </td>


                                        <td>

                                            <span class="
                                                grupo-estado
                                                ${grupo.estado === "ACTIVO"
                            ? "grupo-estado--activo"
                            : "grupo-estado--inactivo"
                        }
                                            ">

                                                ${grupo.estado}

                                            </span>

                                        </td>


                                        <td>

                                            <div class="grupo-acciones">


                                                <button
                                                    type="button"
                                                    class="btn btn--outline btn-editar-grupo"
                                                    data-id="${grupo.id}">

                                                    Editar

                                                </button>


                                                <button
                                                    type="button"
                                                    class="btn btn--secondary btn-estado-grupo"
                                                    data-id="${grupo.id}"
                                                    data-estado="${grupo.estado}">

                                                    ${grupo.estado === "ACTIVO"
                            ? "Desactivar"
                            : "Activar"
                        }

                                                </button>


                                                <button
                                                    type="button"
                                                    class="btn btn--secondary btn-eliminar-grupo"
                                                    data-id="${grupo.id}"
                                                    data-nombre="${grupo.nombre}">

                                                    Eliminar

                                                </button>


                                            </div>

                                        </td>

                                    </tr>

                                `;
                }
            ).join("")}

                    </tbody>

                </table>

            `;


        } catch (error) {

            console.error(
                "Error cargando grupos:",
                error
            );


            groupsList.innerHTML = `

                <div class="grupos-empty">

                    ${error.message}

                </div>

            `;
        }
    }


    /*
     * =========================================================
     * CREAR HORARIOS DEL GRUPO
     * =========================================================
     */

    async function crearHorariosGrupo(
        grupoId,
        dias,
        horaInicio,
        horaFin
    ) {

        for (
            const dia of dias
        ) {

            const response =
                await fetch(
                    "/api/grupo-horarios",
                    {
                        method: "POST",

                        headers: {

                            "Authorization":
                                "Basic " + auth,

                            "Content-Type":
                                "application/json"

                        },

                        body: JSON.stringify({

                            grupoId:
                                Number(grupoId),

                            diaSemana:
                                dia,

                            horaInicio:
                                horaInicio,

                            horaFin:
                                horaFin

                        })
                    }
                );


            if (
                manejarNoAutorizado(
                    response
                )
            ) {

                throw new Error(
                    "La sesión ha expirado."
                );
            }


            if (
                response.status === 403
            ) {

                throw new Error(
                    "No tienes permisos para registrar horarios."
                );
            }


            if (!response.ok) {

                throw new Error(
                    await obtenerMensajeError(
                        response,
                        `No se pudo registrar el horario del día ${obtenerNombreDia(dia)}.`
                    )
                );
            }
        }
    }


    /*
     * =========================================================
     * CARGAR HORARIOS DE UN GRUPO
     * =========================================================
     */

    async function cargarHorariosGrupo(
        grupoId
    ) {

        groupSchedulesList.innerHTML = `

            <div class="grupos-loading">

                <div class="grupos-loading__spinner"></div>

                <span>
                    Cargando horarios...
                </span>

            </div>

        `;


        try {

            const response =
                await fetch(
                    `/api/grupo-horarios/grupo/${grupoId}`,
                    {
                        method: "GET",

                        headers: {

                            "Authorization":
                                "Basic " + auth

                        }
                    }
                );


            if (
                manejarNoAutorizado(
                    response
                )
            ) {

                return;
            }


            if (
                response.status === 403
            ) {

                throw new Error(
                    "No tienes permisos para consultar los horarios."
                );
            }


            if (!response.ok) {

                throw new Error(
                    await obtenerMensajeError(
                        response,
                        "No se pudieron obtener los horarios."
                    )
                );
            }


            const horarios =
                await response.json();


            if (
                horarios.length === 0
            ) {

                groupSchedulesList.innerHTML = `

                    <div class="grupos-empty">

                        Este grupo todavía no tiene horarios registrados.

                    </div>

                `;

                return;
            }


            horarios.sort(
                (a, b) => {

                    const diaA =
                        obtenerOrdenDia(
                            a.diaSemana
                        );

                    const diaB =
                        obtenerOrdenDia(
                            b.diaSemana
                        );


                    if (
                        diaA !== diaB
                    ) {

                        return diaA - diaB;
                    }


                    return a.horaInicio.localeCompare(
                        b.horaInicio
                    );
                }
            );


            groupSchedulesList.innerHTML =
                horarios
                    .map(
                        horario => `

                            <div class="grupo-horario-item">

                                <div class="grupo-horario-info">

                                    <strong>

                                        ${obtenerNombreDia(
                            horario.diaSemana
                        )}

                                    </strong>

                                    <span>

                                        ${formatearHora(
                            horario.horaInicio
                        )}

                                        -

                                        ${formatearHora(
                            horario.horaFin
                        )}

                                    </span>

                                </div>


                                <button
                                    type="button"
                                    class="btn btn--secondary btn-eliminar-horario"
                                    data-id="${horario.id}">

                                    Eliminar

                                </button>

                            </div>

                        `
                    )
                    .join("");


        } catch (error) {

            console.error(
                "Error cargando horarios:",
                error
            );


            groupSchedulesList.innerHTML = `

                <div class="grupos-empty">

                    ${error.message}

                </div>

            `;
        }
    }


    /*
     * =========================================================
     * CREAR GRUPO
     * =========================================================
     */

    groupForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            ocultarMensaje(
                groupMessage
            );


            /*
             * CAMPOS
             */

            const nombre =
                document
                    .getElementById("groupNombre")
                    .value
                    .trim();


            const descripcion =
                document
                    .getElementById("groupDescripcion")
                    .value
                    .trim();


            const horaInicio =
                document
                    .getElementById("groupHoraInicio")
                    .value;


            const horaFin =
                document
                    .getElementById("groupHoraFin")
                    .value;


            const capacidad =
                Number(
                    document
                        .getElementById("groupCapacidad")
                        .value
                );


            const senseiValue =
                senseiSelect.value;


            const diasSeleccionados =
                obtenerDiasSeleccionados();


            /*
             * VALIDAR HORAS
             */

            if (
                !horaInicio ||
                !horaFin
            ) {

                mostrarMensaje(
                    groupMessage,
                    "Debes seleccionar la hora de inicio y la hora de fin.",
                    "error"
                );

                return;
            }


            if (
                horaInicio >= horaFin
            ) {

                mostrarMensaje(
                    groupMessage,
                    "La hora de inicio debe ser anterior a la hora de fin.",
                    "error"
                );

                return;
            }


            /*
             * VALIDAR DÍAS
             */

            if (
                diasSeleccionados.length === 0
            ) {

                mostrarMensaje(
                    groupMessage,
                    "Debes seleccionar al menos un día de entrenamiento.",
                    "error"
                );

                return;
            }


            /*
             * VALIDAR CAPACIDAD
             */

            if (
                !capacidad ||
                capacidad <= 0
            ) {

                mostrarMensaje(
                    groupMessage,
                    "La capacidad debe ser mayor que 0.",
                    "error"
                );

                return;
            }


            /*
             * OBJETO
             */

            const grupo = {

                nombre:
                    nombre,

                descripcion:
                    descripcion,

                horaInicio:
                    horaInicio,

                horaFin:
                    horaFin,

                capacidad:
                    capacidad,

                senseiId:
                    senseiValue
                        ? Number(senseiValue)
                        : null

            };


            /*
             * BOTÓN
             */

            const submitButton =
                groupForm.querySelector(
                    'button[type="submit"]'
                );


            submitButton.disabled =
                true;

            submitButton.textContent =
                "Registrando...";


            try {

                /*
                 * CREAR GRUPO
                 */

                const response =
                    await fetch(
                        "/api/grupos",
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
                                    grupo
                                )
                        }
                    );


                if (
                    manejarNoAutorizado(
                        response
                    )
                ) {

                    return;
                }


                if (
                    response.status === 403
                ) {

                    throw new Error(
                        "No tienes permisos para registrar grupos."
                    );
                }


                if (!response.ok) {

                    throw new Error(
                        await obtenerMensajeError(
                            response,
                            "No se pudo registrar el grupo."
                        )
                    );
                }


                const nuevoGrupo =
                    await response.json();


                /*
                 * CREAR HORARIOS
                 */

                await crearHorariosGrupo(
                    nuevoGrupo.id,
                    diasSeleccionados,
                    horaInicio,
                    horaFin
                );


                /*
                 * LIMPIAR FORMULARIO
                 */

                groupForm.reset();

                limpiarDiasSeleccionados();


                /*
                 * MENSAJE
                 */

                mostrarMensaje(
                    groupMessage,
                    "Grupo y horarios registrados correctamente.",
                    "success"
                );


                /*
                 * RECARGAR
                 */

                await cargarGrupos();


                /*
                 * CERRAR MODAL DESPUÉS
                 * DE UN MOMENTO
                 */

                setTimeout(
                    function () {

                        cerrarModalGrupo();

                        ocultarMensaje(
                            groupMessage
                        );

                    },
                    800
                );


            } catch (error) {

                console.error(
                    "Error registrando grupo:",
                    error
                );


                mostrarMensaje(
                    groupMessage,
                    error.message,
                    "error"
                );


            } finally {

                submitButton.disabled =
                    false;

                submitButton.textContent =
                    "Registrar grupo";

            }

        }
    );


    /*
     * =========================================================
     * EDITAR GRUPO
     * =========================================================
     */

    document.addEventListener(
        "click",
        async function (event) {

            if (
                !event.target.classList.contains(
                    "btn-editar-grupo"
                )
            ) {

                return;
            }


            const id =
                event.target.dataset.id;


            try {

                const response =
                    await fetch(
                        `/api/grupos/${id}`,
                        {
                            method: "GET",

                            headers: {

                                "Authorization":
                                    "Basic " + auth

                            }
                        }
                    );


                if (
                    manejarNoAutorizado(
                        response
                    )
                ) {

                    return;
                }


                if (
                    response.status === 403
                ) {

                    throw new Error(
                        "No tienes permisos para editar grupos."
                    );
                }


                if (!response.ok) {

                    throw new Error(
                        await obtenerMensajeError(
                            response,
                            "No se pudo obtener el grupo."
                        )
                    );
                }


                const grupo =
                    await response.json();


                /*
                 * DATOS
                 */

                document.getElementById(
                    "editId"
                ).value =
                    grupo.id;


                document.getElementById(
                    "editNombre"
                ).value =
                    grupo.nombre;


                document.getElementById(
                    "editDescripcion"
                ).value =
                    grupo.descripcion || "";


                document.getElementById(
                    "editHoraInicio"
                ).value =
                    formatearHora(
                        grupo.horaInicio
                    );


                document.getElementById(
                    "editHoraFin"
                ).value =
                    formatearHora(
                        grupo.horaFin
                    );


                document.getElementById(
                    "editCapacidad"
                ).value =
                    grupo.capacidad;


                /*
                 * SENSEI
                 */

                editSenseiSelect.value =
                    grupo.senseiId
                        ? String(
                            grupo.senseiId
                        )
                        : "";


                /*
                 * LIMPIAR HORARIO
                 */

                scheduleDay.value =
                    "";

                scheduleStart.value =
                    "";

                scheduleEnd.value =
                    "";


                ocultarMensaje(
                    scheduleMessage
                );


                /*
                 * MOSTRAR EDICIÓN
                 */

                editGroupSection.hidden =
                    false;


                ocultarMensaje(
                    editGroupMessage
                );


                /*
                 * CARGAR HORARIOS
                 */

                await cargarHorariosGrupo(
                    grupo.id
                );


                /*
                 * SCROLL
                 */

                editGroupSection.scrollIntoView({
                    behavior:
                        "smooth"
                });


            } catch (error) {

                console.error(
                    "Error obteniendo grupo:",
                    error
                );


                alert(
                    error.message
                );
            }

        }
    );


    /*
     * =========================================================
     * GUARDAR CAMBIOS
     * =========================================================
     */

    editGroupForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            ocultarMensaje(
                editGroupMessage
            );


            const id =
                document.getElementById(
                    "editId"
                ).value;


            const nombre =
                document.getElementById(
                    "editNombre"
                ).value.trim();


            const descripcion =
                document.getElementById(
                    "editDescripcion"
                ).value.trim();


            const horaInicio =
                document.getElementById(
                    "editHoraInicio"
                ).value;


            const horaFin =
                document.getElementById(
                    "editHoraFin"
                ).value;


            const capacidad =
                Number(
                    document.getElementById(
                        "editCapacidad"
                    ).value
                );


            const senseiValue =
                editSenseiSelect.value;


            /*
             * VALIDACIONES
             */

            if (
                !horaInicio ||
                !horaFin
            ) {

                mostrarMensaje(
                    editGroupMessage,
                    "Debes seleccionar la hora de inicio y la hora de fin.",
                    "error"
                );

                return;
            }


            if (
                horaInicio >= horaFin
            ) {

                mostrarMensaje(
                    editGroupMessage,
                    "La hora de inicio debe ser anterior a la hora de fin.",
                    "error"
                );

                return;
            }


            if (
                !capacidad ||
                capacidad <= 0
            ) {

                mostrarMensaje(
                    editGroupMessage,
                    "La capacidad debe ser mayor que 0.",
                    "error"
                );

                return;
            }


            /*
             * OBJETO
             */

            const grupo = {

                nombre:
                    nombre,

                descripcion:
                    descripcion,

                horaInicio:
                    horaInicio,

                horaFin:
                    horaFin,

                capacidad:
                    capacidad,

                senseiId:
                    senseiValue
                        ? Number(
                            senseiValue
                        )
                        : null

            };


            /*
             * BOTÓN
             */

            const submitButton =
                editGroupForm.querySelector(
                    'button[type="submit"]'
                );


            submitButton.disabled =
                true;

            submitButton.textContent =
                "Guardando...";


            try {

                const response =
                    await fetch(
                        `/api/grupos/${id}`,
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
                                    grupo
                                )
                        }
                    );


                if (
                    manejarNoAutorizado(
                        response
                    )
                ) {

                    return;
                }


                if (
                    response.status === 403
                ) {

                    throw new Error(
                        "No tienes permisos para editar grupos."
                    );
                }


                if (!response.ok) {

                    throw new Error(
                        await obtenerMensajeError(
                            response,
                            "No se pudo actualizar el grupo."
                        )
                    );
                }


                await response.json();


                mostrarMensaje(
                    editGroupMessage,
                    "Grupo actualizado correctamente.",
                    "success"
                );


                await cargarGrupos();


                await cargarHorariosGrupo(
                    Number(id)
                );


            } catch (error) {

                console.error(
                    "Error actualizando grupo:",
                    error
                );


                mostrarMensaje(
                    editGroupMessage,
                    error.message,
                    "error"
                );


            } finally {

                submitButton.disabled =
                    false;

                submitButton.textContent =
                    "Guardar cambios";

            }

        }
    );


    /*
     * =========================================================
     * AGREGAR HORARIO
     * =========================================================
     */

    addScheduleButton.addEventListener(
        "click",
        async function () {

            ocultarMensaje(
                scheduleMessage
            );


            const grupoId =
                document.getElementById(
                    "editId"
                ).value;


            const dia =
                scheduleDay.value;


            const horaInicio =
                scheduleStart.value;


            const horaFin =
                scheduleEnd.value;


            if (!grupoId) {

                mostrarMensaje(
                    scheduleMessage,
                    "No se ha seleccionado ningún grupo.",
                    "error"
                );

                return;
            }


            if (!dia) {

                mostrarMensaje(
                    scheduleMessage,
                    "Selecciona un día de la semana.",
                    "error"
                );

                return;
            }


            if (
                !horaInicio ||
                !horaFin
            ) {

                mostrarMensaje(
                    scheduleMessage,
                    "Selecciona la hora de inicio y la hora de fin.",
                    "error"
                );

                return;
            }


            if (
                horaInicio >= horaFin
            ) {

                mostrarMensaje(
                    scheduleMessage,
                    "La hora de inicio debe ser anterior a la hora de fin.",
                    "error"
                );

                return;
            }


            addScheduleButton.disabled =
                true;

            addScheduleButton.textContent =
                "Guardando...";


            try {

                const response =
                    await fetch(
                        "/api/grupo-horarios",
                        {
                            method: "POST",

                            headers: {

                                "Authorization":
                                    "Basic " + auth,

                                "Content-Type":
                                    "application/json"

                            },

                            body: JSON.stringify({

                                grupoId:
                                    Number(grupoId),

                                diaSemana:
                                    dia,

                                horaInicio:
                                    horaInicio,

                                horaFin:
                                    horaFin

                            })
                        }
                    );


                if (
                    manejarNoAutorizado(
                        response
                    )
                ) {

                    return;
                }


                if (
                    response.status === 403
                ) {

                    throw new Error(
                        "No tienes permisos para registrar horarios."
                    );
                }


                if (!response.ok) {

                    throw new Error(
                        await obtenerMensajeError(
                            response,
                            "No se pudo registrar el horario."
                        )
                    );
                }


                scheduleDay.value =
                    "";

                scheduleStart.value =
                    "";

                scheduleEnd.value =
                    "";


                mostrarMensaje(
                    scheduleMessage,
                    "Horario agregado correctamente.",
                    "success"
                );


                await cargarHorariosGrupo(
                    Number(grupoId)
                );


            } catch (error) {

                console.error(
                    "Error agregando horario:",
                    error
                );


                mostrarMensaje(
                    scheduleMessage,
                    error.message,
                    "error"
                );


            } finally {

                addScheduleButton.disabled =
                    false;

                addScheduleButton.textContent =
                    "+ Agregar horario";

            }

        }
    );


    /*
     * =========================================================
     * ELIMINAR HORARIO
     * =========================================================
     */

    document.addEventListener(
        "click",
        async function (event) {

            if (
                !event.target.classList.contains(
                    "btn-eliminar-horario"
                )
            ) {

                return;
            }


            const button =
                event.target;


            const horarioId =
                button.dataset.id;


            const grupoId =
                document.getElementById(
                    "editId"
                ).value;


            const confirmar =
                confirm(
                    "¿Deseas eliminar este horario?"
                );


            if (!confirmar) {

                return;
            }


            button.disabled =
                true;

            button.textContent =
                "Eliminando...";


            try {

                const response =
                    await fetch(
                        `/api/grupo-horarios/${horarioId}`,
                        {
                            method: "DELETE",

                            headers: {

                                "Authorization":
                                    "Basic " + auth

                            }
                        }
                    );


                if (
                    manejarNoAutorizado(
                        response
                    )
                ) {

                    return;
                }


                if (
                    response.status === 403
                ) {

                    throw new Error(
                        "No tienes permisos para eliminar horarios."
                    );
                }


                if (!response.ok) {

                    throw new Error(
                        await obtenerMensajeError(
                            response,
                            "No se pudo eliminar el horario."
                        )
                    );
                }


                mostrarMensaje(
                    scheduleMessage,
                    "Horario eliminado correctamente.",
                    "success"
                );


                await cargarHorariosGrupo(
                    Number(grupoId)
                );


            } catch (error) {

                console.error(
                    "Error eliminando horario:",
                    error
                );


                mostrarMensaje(
                    scheduleMessage,
                    error.message,
                    "error"
                );


                button.disabled =
                    false;

                button.textContent =
                    "Eliminar";

            }

        }
    );


    /*
     * =========================================================
     * ELIMINAR GRUPO
     * =========================================================
     */

    document.addEventListener(
        "click",
        async function (event) {

            if (
                !event.target.classList.contains(
                    "btn-eliminar-grupo"
                )
            ) {

                return;
            }


            const button =
                event.target;


            const id =
                button.dataset.id;


            const nombre =
                button.dataset.nombre;


            const confirmar =
                confirm(
                    `¿Deseas eliminar el grupo "${nombre}"?\n\nTambién se eliminarán sus horarios habituales.\n\nEsta acción no se puede deshacer.`
                );


            if (!confirmar) {

                return;
            }


            button.disabled =
                true;

            button.textContent =
                "Eliminando...";


            try {

                const response =
                    await fetch(
                        `/api/grupos/${id}`,
                        {
                            method: "DELETE",

                            headers: {

                                "Authorization":
                                    "Basic " + auth

                            }
                        }
                    );


                if (
                    manejarNoAutorizado(
                        response
                    )
                ) {

                    return;
                }


                if (
                    response.status === 403
                ) {

                    throw new Error(
                        "No tienes permisos para eliminar grupos."
                    );
                }


                if (!response.ok) {

                    throw new Error(
                        await obtenerMensajeError(
                            response,
                            "No se pudo eliminar el grupo."
                        )
                    );
                }


                const grupoEditado =
                    document.getElementById(
                        "editId"
                    ).value;


                if (
                    grupoEditado ===
                    String(id)
                ) {

                    editGroupSection.hidden =
                        true;

                    editGroupForm.reset();


                    ocultarMensaje(
                        editGroupMessage
                    );


                    ocultarMensaje(
                        scheduleMessage
                    );


                    groupSchedulesList.innerHTML = `

                        <div class="grupos-empty">

                            Selecciona un grupo para gestionar sus horarios.

                        </div>

                    `;
                }


                await cargarGrupos();


                mostrarMensaje(
                    groupMessage,
                    `El grupo "${nombre}" fue eliminado correctamente.`,
                    "success"
                );


            } catch (error) {

                console.error(
                    "Error eliminando grupo:",
                    error
                );


                mostrarMensaje(
                    groupMessage,
                    error.message,
                    "error"
                );


                button.disabled =
                    false;

                button.textContent =
                    "Eliminar";

            }

        }
    );


    /*
     * =========================================================
     * CANCELAR EDICIÓN
     * =========================================================
     */

    cancelEditButton.addEventListener(
        "click",
        function () {

            editGroupSection.hidden =
                true;


            editGroupForm.reset();


            ocultarMensaje(
                editGroupMessage
            );


            ocultarMensaje(
                scheduleMessage
            );


            groupSchedulesList.innerHTML = `

                <div class="grupos-empty">

                    Selecciona un grupo para gestionar sus horarios.

                </div>

            `;

        }
    );


    /*
     * =========================================================
     * ACTIVAR / DESACTIVAR GRUPO
     * =========================================================
     */

    document.addEventListener(
        "click",
        async function (event) {

            if (
                !event.target.classList.contains(
                    "btn-estado-grupo"
                )
            ) {

                return;
            }


            const button =
                event.target;


            const id =
                button.dataset.id;


            const estadoActual =
                button.dataset.estado;


            const nuevoEstado =
                estadoActual === "ACTIVO"
                    ? "INACTIVO"
                    : "ACTIVO";


            try {

                const response =
                    await fetch(
                        `/api/grupos/${id}/estado?estado=${nuevoEstado}`,
                        {
                            method: "PATCH",

                            headers: {

                                "Authorization":
                                    "Basic " + auth

                            }
                        }
                    );


                if (
                    manejarNoAutorizado(
                        response
                    )
                ) {

                    return;
                }


                if (
                    response.status === 403
                ) {

                    throw new Error(
                        "No tienes permisos para cambiar el estado del grupo."
                    );
                }


                if (!response.ok) {

                    throw new Error(
                        await obtenerMensajeError(
                            response,
                            "No se pudo cambiar el estado del grupo."
                        )
                    );
                }


                await cargarGrupos();


            } catch (error) {

                console.error(
                    "Error cambiando estado:",
                    error
                );


                alert(
                    error.message
                );
            }

        }
    );


    /*
     * =========================================================
     * CARGA INICIAL
     * =========================================================
     */

    cargarSenseis();

    cargarGrupos();

});