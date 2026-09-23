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
     * FRECUENCIAS
     */

    const frecuenciaSelect =
        document.getElementById("groupFrecuenciaId");

    const editFrecuenciaSelect =
        document.getElementById("editFrecuenciaId");

    let frecuenciasDisponibles = [];


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


        if (groupMessage) {

            ocultarMensaje(
                groupMessage
            );
        }


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
     * CARGAR FRECUENCIAS
     * =========================================================
     */

    async function cargarFrecuencias() {

        try {

            const response =
                await fetch(
                    "/api/frecuencias-grupo",
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
                    "No tienes permisos para consultar las frecuencias."
                );
            }


            if (!response.ok) {

                throw new Error(
                    "No se pudieron obtener las frecuencias."
                );
            }


            const frecuencias =
                await response.json();


            frecuenciasDisponibles =
                frecuencias;


            if (frecuenciaSelect) {

                frecuenciaSelect.innerHTML = `
                    <option value="">
                        Selecciona una frecuencia
                    </option>
                `;


                frecuencias.forEach(
                    frecuencia => {

                        const option =
                            document.createElement(
                                "option"
                            );


                        option.value =
                            frecuencia.id;


                        option.textContent =
                            frecuencia.nombre;


                        option.dataset.frecuenciaSemanal =
                            frecuencia.frecuenciaSemanal;


                        frecuenciaSelect.appendChild(
                            option
                        );

                    }
                );
            }


            if (editFrecuenciaSelect) {

                editFrecuenciaSelect.innerHTML = `
                    <option value="">
                        Selecciona una frecuencia
                    </option>
                `;


                frecuencias.forEach(
                    frecuencia => {

                        const option =
                            document.createElement(
                                "option"
                            );


                        option.value =
                            frecuencia.id;


                        option.textContent =
                            frecuencia.nombre;


                        option.dataset.frecuenciaSemanal =
                            frecuencia.frecuenciaSemanal;


                        editFrecuenciaSelect.appendChild(
                            option
                        );

                    }
                );
            }


        } catch (error) {

            console.error(
                "Error cargando frecuencias:",
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
     * OBTENER FRECUENCIA SELECCIONADA
     * =========================================================
     */

    function obtenerFrecuenciaSeleccionada() {

        if (
            !frecuenciaSelect ||
            !frecuenciaSelect.value
        ) {

            return null;
        }


        const option =
            frecuenciaSelect.options[
            frecuenciaSelect.selectedIndex
            ];


        if (!option) {
            return null;
        }


        return {

            id:
                Number(
                    frecuenciaSelect.value
                ),

            frecuenciaSemanal:
                Number(
                    option.dataset.frecuenciaSemanal
                )

        };
    }


    /*
     * =========================================================
     * OBTENER FRECUENCIA DE EDICIÓN
     * =========================================================
     */

    function obtenerFrecuenciaEdicion() {

        if (
            !editFrecuenciaSelect ||
            !editFrecuenciaSelect.value
        ) {

            return null;
        }


        const option =
            editFrecuenciaSelect.options[
            editFrecuenciaSelect.selectedIndex
            ];


        if (!option) {
            return null;
        }


        return {

            id:
                Number(
                    editFrecuenciaSelect.value
                ),

            frecuenciaSemanal:
                Number(
                    option.dataset.frecuenciaSemanal
                )

        };
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


            if (senseiSelect) {

                senseiSelect.innerHTML = `
                    <option value="">
                        Sin asignar
                    </option>
                `;


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
                            option
                        );

                    }
                );
            }


            if (editSenseiSelect) {

                editSenseiSelect.innerHTML = `
                    <option value="">
                        Sin asignar
                    </option>
                `;


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


                        editSenseiSelect.appendChild(
                            option
                        );

                    }
                );
            }


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
     *
     * CAMBIO:
     *
     * Los grupos ahora se muestran agrupados por frecuencia.
     *
     * La frecuencia NO está hardcodeada.
     * Se obtiene de grupo.frecuenciaId,
     * grupo.frecuenciaNombre y grupo.frecuenciaSemanal.
     *
     * Cada categoría puede expandirse/contraerse.
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
             * AGRUPAR POR FRECUENCIA
             * =====================================================
             */

            const gruposPorFrecuencia =
                new Map();


            gruposConHorarios.forEach(
                grupo => {

                    const frecuenciaId =
                        grupo.frecuenciaId != null
                            ? String(grupo.frecuenciaId)
                            : "sin-frecuencia";


                    if (
                        !gruposPorFrecuencia.has(
                            frecuenciaId
                        )
                    ) {

                        gruposPorFrecuencia.set(
                            frecuenciaId,
                            {

                                id:
                                    grupo.frecuenciaId,

                                nombre:
                                    grupo.frecuenciaNombre ||
                                    "Sin frecuencia",

                                frecuenciaSemanal:
                                    grupo.frecuenciaSemanal ??
                                    null,

                                grupos:
                                    []

                            }
                        );
                    }


                    gruposPorFrecuencia
                        .get(frecuenciaId)
                        .grupos
                        .push(grupo);

                }
            );


            /*
             * =====================================================
             * ORDENAR CATEGORÍAS
             * =====================================================
             */

            const categorias =
                Array.from(
                    gruposPorFrecuencia.values()
                ).sort(
                    (a, b) => {

                        if (
                            a.frecuenciaSemanal == null
                        ) {

                            return 1;
                        }


                        if (
                            b.frecuenciaSemanal == null
                        ) {

                            return -1;
                        }


                        return (
                            a.frecuenciaSemanal -
                            b.frecuenciaSemanal
                        );
                    }
                );


            /*
             * =====================================================
             * TABLA
             * =====================================================
             */

            groupsList.innerHTML = `

            <table class="grupos-table">

                <tbody>

                    ${categorias.map(
                (categoria, categoriaIndex) => {

                    const categoriaId =
                        `frecuencia-${categoria.id ?? "sin"}-${categoriaIndex}`;


                    /*
                     * =================================================
                     * RESUMEN DE LA CATEGORÍA
                     * =================================================
                     */

                    const capacidadTotal =
                        categoria.grupos.reduce(
                            (total, grupo) =>
                                total +
                                (Number(grupo.capacidad) || 0),
                            0
                        );


                    const inscritosTotal =
                        categoria.grupos.reduce(
                            (total, grupo) =>
                                total +
                                (Number(grupo.estudiantesActivos) || 0),
                            0
                        );


                    const cuposTotal =
                        categoria.grupos.reduce(
                            (total, grupo) =>
                                total +
                                (Number(grupo.cuposDisponibles) || 0),
                            0
                        );


                    return `

                    <!-- ==========================================
                         ENCABEZADO DE FRECUENCIA
                         ========================================== -->

                    <tr
                        class="grupo-frecuencia-header"
                        data-frecuencia-toggle="${categoriaId}"
                    >

                        <td colspan="9">

                            <div class="grupo-frecuencia-titulo">

                                <strong>
                                    ${categoria.nombre}
                                </strong>

                                <span>
                                    (${categoria.grupos.length}
                                    grupo${categoria.grupos.length !== 1 ? "s" : ""})
                                </span>

                            </div>


                            <div class="grupo-frecuencia-resumen">

                                <span>
                                    Capacidad:
                                    <strong>
                                        ${capacidadTotal}
                                    </strong>
                                </span>


                                <span>
                                    Inscritos:
                                    <strong>
                                        ${inscritosTotal}
                                    </strong>
                                </span>


                                <span>
                                    Cupos:
                                    <strong>
                                        ${cuposTotal}
                                    </strong>
                                </span>

                            </div>

                        </td>

                    </tr>


                    <!-- ==========================================
                         ENCABEZADO DE COLUMNAS
                         ========================================== -->

                    <tr
                        class="grupo-columnas-header"
                        data-frecuencia-columnas="${categoriaId}"
                    >

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


                    <!-- ==========================================
                         GRUPOS DE LA FRECUENCIA
                         ========================================== -->

                    ${categoria.grupos.map(
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

                                LUNES: "Lunes",
                                MARTES: "Martes",
                                MIERCOLES: "Miércoles",
                                JUEVES: "Jueves",
                                VIERNES: "Viernes",
                                SABADO: "Sábado",
                                DOMINGO: "Domingo"

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


                            const diasMostrar =
                                diasIniciales ||
                                "Sin días";


                            /*
                             * =================================================
                             * CONSTRUIR HORARIO
                             * =================================================
                             */

                            let horarioMostrar =
                                "Sin horario";


                            if (
                                dias.length > 0
                            ) {

                                const horarios =
                                    dias.map(
                                        horario => ({

                                            dia:
                                                inicialesDias[
                                                horario.diaSemana
                                                ] ||
                                                horario.diaSemana,

                                            hora:
                                                `${formatearHora(
                                                    horario.horaInicio
                                                )} - ${formatearHora(
                                                    horario.horaFin
                                                )}`

                                        })
                                    );


                                const primeraHora =
                                    horarios[0].hora;


                                const todosMismaHora =
                                    horarios.every(
                                        horario =>
                                            horario.hora ===
                                            primeraHora
                                    );


                                if (
                                    todosMismaHora
                                ) {

                                    horarioMostrar =
                                        primeraHora;

                                } else {

                                    horarioMostrar =
                                        horarios
                                            .map(
                                                horario =>
                                                    `${horario.dia}: ${horario.hora}`
                                            )
                                            .join(" / ");

                                }

                            }


                            return `

                            <tr
                                class="grupo-frecuencia-item"
                                data-frecuencia-parent="${categoriaId}"
                            >

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

                `;

                }
            ).join("")}

                </tbody>

            </table>

        `;


            /*
             * =====================================================
             * EXPANDIR / CONTRAER CATEGORÍAS
             * =====================================================
             */

            document
                .querySelectorAll(
                    "[data-frecuencia-toggle]"
                )
                .forEach(
                    categoriaHeader => {

                        categoriaHeader.addEventListener(
                            "click",
                            function () {

                                const categoriaId =
                                    this.dataset
                                        .frecuenciaToggle;


                                const gruposCategoria =
                                    document.querySelectorAll(
                                        `[data-frecuencia-parent="${categoriaId}"]`
                                    );


                                const encabezadoColumnas =
                                    document.querySelector(
                                        `[data-frecuencia-columnas="${categoriaId}"]`
                                    );


                                const actualmenteVisible =
                                    Array.from(
                                        gruposCategoria
                                    ).some(
                                        fila =>
                                            fila.hidden === false
                                    );


                                gruposCategoria.forEach(
                                    fila => {

                                        fila.hidden =
                                            actualmenteVisible;

                                    }
                                );


                                if (
                                    encabezadoColumnas
                                ) {

                                    encabezadoColumnas.hidden =
                                        actualmenteVisible;

                                }

                            }
                        );

                    }
                );


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

                        <div
                            class="grupo-horario-item"
                            data-id="${horario.id}"
                        >

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


                            <div class="grupo-horario-acciones">

                                <button
                                    type="button"
                                    class="btn btn--secondary btn-editar-horario"
                                    data-id="${horario.id}"
                                    data-grupo-id="${horario.grupoId}"
                                    data-dia="${horario.diaSemana}"
                                    data-hora-inicio="${formatearHora(horario.horaInicio)}"
                                    data-hora-fin="${formatearHora(horario.horaFin)}">

                                    Editar

                                </button>


                                <button
                                    type="button"
                                    class="btn btn--secondary btn-eliminar-horario"
                                    data-id="${horario.id}">

                                    Eliminar

                                </button>

                            </div>

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


            const frecuencia =
                obtenerFrecuenciaSeleccionada();


            if (!frecuencia) {

                mostrarMensaje(
                    groupMessage,
                    "Debes seleccionar la frecuencia semanal del grupo.",
                    "error"
                );

                return;
            }


            if (
                frecuencia.frecuenciaSemanal > 7
            ) {

                mostrarMensaje(
                    groupMessage,
                    "La frecuencia semanal no puede superar los 7 días.",
                    "error"
                );

                return;
            }


            if (
                diasSeleccionados.length !==
                frecuencia.frecuenciaSemanal
            ) {

                mostrarMensaje(
                    groupMessage,
                    `La frecuencia seleccionada requiere exactamente ${frecuencia.frecuenciaSemanal} día${frecuencia.frecuenciaSemanal !== 1 ? "s" : ""} de entrenamiento.`,
                    "error"
                );

                return;
            }


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


            const grupo = {

                nombre:
                    nombre,

                descripcion:
                    descripcion,

                capacidad:
                    capacidad,

                senseiId:
                    senseiValue
                        ? Number(senseiValue)
                        : null,

                frecuenciaId:
                    frecuencia.id

            };


            const submitButton =
                groupForm.querySelector(
                    'button[type="submit"]'
                );


            submitButton.disabled =
                true;

            submitButton.textContent =
                "Registrando...";


            try {

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


                await crearHorariosGrupo(
                    nuevoGrupo.id,
                    diasSeleccionados,
                    horaInicio,
                    horaFin
                );


                groupForm.reset();

                limpiarDiasSeleccionados();


                if (frecuenciaSelect) {

                    frecuenciaSelect.value =
                        "";
                }


                mostrarMensaje(
                    groupMessage,
                    "Grupo y horarios registrados correctamente.",
                    "success"
                );


                await cargarGrupos();


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
                    "editCapacidad"
                ).value =
                    grupo.capacidad;


                if (editFrecuenciaSelect) {

                    editFrecuenciaSelect.value =
                        grupo.frecuenciaId
                            ? String(
                                grupo.frecuenciaId
                            )
                            : "";
                }


                const editHoraInicio =
                    document.getElementById(
                        "editHoraInicio"
                    );

                const editHoraFin =
                    document.getElementById(
                        "editHoraFin"
                    );


                if (editHoraInicio) {

                    editHoraInicio.value =
                        "";

                    editHoraInicio.required =
                        false;
                }


                if (editHoraFin) {

                    editHoraFin.value =
                        "";

                    editHoraFin.required =
                        false;
                }


                if (editSenseiSelect) {

                    editSenseiSelect.value =
                        grupo.senseiId
                            ? String(
                                grupo.senseiId
                            )
                            : "";
                }


                if (scheduleDay) {

                    scheduleDay.value =
                        "";
                }


                if (scheduleStart) {

                    scheduleStart.value =
                        "";
                }


                if (scheduleEnd) {

                    scheduleEnd.value =
                        "";
                }


                ocultarMensaje(
                    scheduleMessage
                );


                editGroupSection.hidden =
                    false;


                ocultarMensaje(
                    editGroupMessage
                );


                await cargarHorariosGrupo(
                    grupo.id
                );


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
     * OBTENER HORARIOS ACTUALES
     * =========================================================
     */

    async function obtenerHorariosGrupo(
        grupoId
    ) {

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

            throw new Error(
                "La sesión ha expirado."
            );
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


        return await response.json();
    }


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


            const capacidad =
                Number(
                    document.getElementById(
                        "editCapacidad"
                    ).value
                );


            const senseiValue =
                editSenseiSelect.value;


            const frecuencia =
                obtenerFrecuenciaEdicion();


            if (!frecuencia) {

                mostrarMensaje(
                    editGroupMessage,
                    "Debes seleccionar la frecuencia semanal del grupo.",
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


            try {

                const horarios =
                    await obtenerHorariosGrupo(
                        Number(id)
                    );


                if (
                    horarios.length !==
                    frecuencia.frecuenciaSemanal
                ) {

                    mostrarMensaje(
                        editGroupMessage,
                        `La frecuencia seleccionada requiere exactamente ${frecuencia.frecuenciaSemanal} horario${frecuencia.frecuenciaSemanal !== 1 ? "s" : ""}. Actualmente el grupo tiene ${horarios.length}. Agrega o elimina horarios antes de guardar.`,
                        "error"
                    );

                    return;
                }


            } catch (error) {

                console.error(
                    "Error validando horarios:",
                    error
                );


                mostrarMensaje(
                    editGroupMessage,
                    error.message,
                    "error"
                );

                return;
            }


            const grupo = {

                nombre:
                    nombre,

                descripcion:
                    descripcion,

                capacidad:
                    capacidad,

                senseiId:
                    senseiValue
                        ? Number(
                            senseiValue
                        )
                        : null,

                frecuenciaId:
                    frecuencia.id

            };


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


            const frecuencia =
                obtenerFrecuenciaEdicion();


            if (!frecuencia) {

                mostrarMensaje(
                    scheduleMessage,
                    "El grupo no tiene una frecuencia semanal seleccionada.",
                    "error"
                );

                return;
            }


            try {

                const horarios =
                    await obtenerHorariosGrupo(
                        Number(grupoId)
                    );


                if (
                    horarios.length >=
                    frecuencia.frecuenciaSemanal
                ) {

                    mostrarMensaje(
                        scheduleMessage,
                        `Este grupo ya tiene ${horarios.length} horario${horarios.length !== 1 ? "s" : ""} registrado${horarios.length !== 1 ? "s" : ""}. La frecuencia permite un máximo de ${frecuencia.frecuenciaSemanal}.`,
                        "error"
                    );

                    return;
                }


                const diaYaRegistrado =
                    horarios.some(
                        horario =>
                            horario.diaSemana?.toUpperCase()
                            === dia.toUpperCase()
                    );


                if (diaYaRegistrado) {

                    mostrarMensaje(
                        scheduleMessage,
                        "El grupo ya tiene un horario registrado para ese día.",
                        "error"
                    );

                    return;
                }


            } catch (error) {

                mostrarMensaje(
                    scheduleMessage,
                    error.message,
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


                await cargarGrupos();


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

    /* =========================================================
 * EDITAR HORARIO
 * ========================================================= */

    groupSchedulesList.addEventListener(
        "click",
        async function (event) {

            const botonEditar =
                event.target.closest(
                    ".btn-editar-horario"
                );


            if (!botonEditar) {
                return;
            }


            const horarioId =
                botonEditar.dataset.id;

            const grupoId =
                botonEditar.dataset.grupoId;

            const diaSemana =
                botonEditar.dataset.dia;

            const horaInicioActual =
                botonEditar.dataset.horaInicio;

            const horaFinActual =
                botonEditar.dataset.horaFin;


            const item =
                botonEditar.closest(
                    ".grupo-horario-item"
                );


            if (!item) {
                return;
            }


            const info =
                item.querySelector(
                    ".grupo-horario-info"
                );


            const acciones =
                item.querySelector(
                    ".grupo-horario-acciones"
                );


            if (!info || !acciones) {
                return;
            }


            info.innerHTML = `

            <strong>
                ${obtenerNombreDia(diaSemana)}
            </strong>

            <div class="grupo-horario-edicion">

                <input
                    type="time"
                    class="editar-hora-inicio"
                    value="${horaInicioActual}"
                >

                <span>-</span>

                <input
                    type="time"
                    class="editar-hora-fin"
                    value="${horaFinActual}"
                >

            </div>

        `;


            acciones.innerHTML = `

            <button
                type="button"
                class="btn btn--primary btn-guardar-horario">

                Guardar

            </button>

            <button
                type="button"
                class="btn btn--secondary btn-cancelar-edicion-horario">

                Cancelar

            </button>

        `;


            const inputInicio =
                item.querySelector(
                    ".editar-hora-inicio"
                );

            const inputFin =
                item.querySelector(
                    ".editar-hora-fin"
                );


            const botonGuardar =
                item.querySelector(
                    ".btn-guardar-horario"
                );

            const botonCancelar =
                item.querySelector(
                    ".btn-cancelar-edicion-horario"
                );


            botonCancelar.addEventListener(
                "click",
                function () {

                    cargarHorariosGrupo(
                        Number(grupoId)
                    );

                }
            );


            botonGuardar.addEventListener(
                "click",
                async function () {

                    const horaInicio =
                        inputInicio.value;

                    const horaFin =
                        inputFin.value;


                    if (
                        !horaInicio ||
                        !horaFin
                    ) {

                        mostrarMensaje(
                            scheduleMessage,
                            "Debes ingresar la hora de inicio y la hora de fin.",
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


                    botonGuardar.disabled = true;

                    botonCancelar.disabled = true;


                    try {

                        const response =
                            await fetch(
                                `/api/grupo-horarios/${horarioId}`,
                                {
                                    method: "PUT",

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
                                            diaSemana,

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
                                "No tienes permisos para modificar este horario."
                            );
                        }


                        if (!response.ok) {

                            throw new Error(
                                await obtenerMensajeError(
                                    response,
                                    "No se pudo actualizar el horario."
                                )
                            );
                        }


                        mostrarMensaje(
                            scheduleMessage,
                            "Horario actualizado correctamente.",
                            "success"
                        );


                        await cargarHorariosGrupo(
                            Number(grupoId)
                        );


                        await cargarGrupos();


                    } catch (error) {

                        console.error(
                            "Error actualizando horario:",
                            error
                        );


                        mostrarMensaje(
                            scheduleMessage,
                            error.message,
                            "error"
                        );


                        botonGuardar.disabled = false;

                        botonCancelar.disabled = false;

                    }

                }
            );

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


                await cargarGrupos();


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

    if (cancelEditButton) {

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
    }


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
     * EVITAR VALIDACIÓN DE HORARIOS ANTIGUOS
     * =========================================================
     *
     * Los campos editHoraInicio y editHoraFin todavía existen
     * en tu HTML, pero ya no pertenecen al modelo de grupos.
     * =========================================================
     */

    const editHoraInicioInicial =
        document.getElementById(
            "editHoraInicio"
        );

    const editHoraFinInicial =
        document.getElementById(
            "editHoraFin"
        );


    if (editHoraInicioInicial) {

        editHoraInicioInicial.required =
            false;
    }


    if (editHoraFinInicial) {

        editHoraFinInicial.required =
            false;
    }


    /*
     * =========================================================
     * CARGA INICIAL
     * =========================================================
     */

    cargarFrecuencias();

    cargarSenseis();

    cargarGrupos();

});