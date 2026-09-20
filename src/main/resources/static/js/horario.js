document.addEventListener("DOMContentLoaded", function () {

    /*
     * ==========================================
     * AUTENTICACIÓN
     * ==========================================
     */

    const auth =
        sessionStorage.getItem("kihonAuth");

    const username =
        sessionStorage.getItem("kihonUsername");

    const rol =
        sessionStorage.getItem("kihonRol");


    /*
     * ==========================================
     * ELEMENTOS DEL DOM
     * ==========================================
     */

    const usernameDisplay =
        document.getElementById("usernameDisplay");

    const previousWeekButton =
        document.getElementById("previousWeekButton");

    const nextWeekButton =
        document.getElementById("nextWeekButton");

    const todayButton =
        document.getElementById("todayButton");

    const weekLabel =
        document.getElementById("weekLabel");

    const scheduleCalendar =
        document.getElementById("scheduleCalendar");

    const scheduleMessage =
        document.getElementById("scheduleMessage");


    /*
     * ==========================================
     * ELEMENTOS DE EVENTOS
     * ==========================================
     */

    const showEventFormButton =
        document.getElementById("showEventFormButton");

    const eventFormSection =
        document.getElementById("eventFormSection");

    const eventForm =
        document.getElementById("eventForm");

    const cancelEventButton =
        document.getElementById("cancelEventButton");

    const eventFormMessage =
        document.getElementById("eventFormMessage");

    const eventResponsible =
        document.getElementById("eventResponsible");


    /*
     * ==========================================
     * ELEMENTOS DEL DETALLE DEL EVENTO
     * ==========================================
     */

    const eventDetailSection =
        document.getElementById("eventDetailSection");

    const closeEventDetailButton =
        document.getElementById("closeEventDetailButton");

    const eventDetailTitle =
        document.getElementById("eventDetailTitle");

    const eventDetailType =
        document.getElementById("eventDetailType");

    const eventDetailDate =
        document.getElementById("eventDetailDate");

    const eventDetailTime =
        document.getElementById("eventDetailTime");

    const eventDetailPlace =
        document.getElementById("eventDetailPlace");

    const eventDetailResponsible =
        document.getElementById("eventDetailResponsible");

    const eventDetailDescription =
        document.getElementById("eventDetailDescription");

    const eventDetailStatus =
        document.getElementById("eventDetailStatus");

    const editEventButton =
        document.getElementById("editEventButton");

    const toggleEventStatusButton =
        document.getElementById("toggleEventStatusButton");

    const deleteEventButton =
        document.getElementById("deleteEventButton");

    const eventDetailMessage =
        document.getElementById("eventDetailMessage");


    /*
     * ==========================================
     * ESTADO
     * ==========================================
     */

    let eventoSeleccionado = null;

    let modoEdicion = false;


    /*
     * ==========================================
     * VERIFICAR SESIÓN
     * ==========================================
     */

    if (!auth || !username) {

        window.location.href = "/login";

        return;
    }


    /*
     * ==========================================
     * VERIFICAR ROL
     * ==========================================
     */

    if (rol !== "ADMIN") {

        window.location.href = "/login";

        return;
    }


    usernameDisplay.textContent =
        username;


    /*
     * ==========================================
     * CONFIGURACIÓN
     * ==========================================
     */

    const DIAS = [
        "LUNES",
        "MARTES",
        "MIERCOLES",
        "JUEVES",
        "VIERNES",
        "SABADO",
        "DOMINGO"
    ];

    const NOMBRES_DIAS = [
        "Lun",
        "Mar",
        "Mié",
        "Jue",
        "Vie",
        "Sáb",
        "Dom"
    ];

    const HORA_INICIO = 8;

    const HORA_FIN = 21;


    /*
     * ==========================================
     * ESTADO DEL CALENDARIO
     * ==========================================
     */

    let fechaActual =
        new Date();

    let fechaSemana =
        obtenerLunes(fechaActual);

    let horarios = [];

    let eventos = [];


    /*
     * ==========================================
     * OBTENER LUNES DE LA SEMANA
     * ==========================================
     */

    function obtenerLunes(fecha) {

        const resultado =
            new Date(fecha);

        const dia =
            resultado.getDay();

        const diferencia =
            dia === 0
                ? -6
                : 1 - dia;

        resultado.setDate(
            resultado.getDate() + diferencia
        );

        resultado.setHours(
            0,
            0,
            0,
            0
        );

        return resultado;
    }


    /*
     * ==========================================
     * FORMATEAR FECHA CORTA
     * ==========================================
     */

    function formatearFechaCorta(fecha) {

        return fecha.toLocaleDateString(
            "es-PE",
            {
                day: "numeric"
            }
        );
    }


    /*
     * ==========================================
     * FORMATO ISO
     * ==========================================
     */

    function obtenerFechaISO(fecha) {

        const year =
            fecha.getFullYear();

        const month =
            String(
                fecha.getMonth() + 1
            ).padStart(2, "0");

        const day =
            String(
                fecha.getDate()
            ).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }


    /*
     * ==========================================
     * MOSTRAR MENSAJE DEL CALENDARIO
     * ==========================================
     */

    function mostrarMensaje(
        mensaje,
        tipo = "error"
    ) {

        scheduleMessage.textContent =
            mensaje;

        scheduleMessage.hidden =
            false;

        scheduleMessage.className =
            tipo === "success"
                ? "horario-message horario-message--success"
                : "horario-message horario-message--error";
    }


    /*
     * ==========================================
     * OCULTAR MENSAJE DEL CALENDARIO
     * ==========================================
     */

    function ocultarMensaje() {

        scheduleMessage.hidden =
            true;

        scheduleMessage.textContent =
            "";

        scheduleMessage.className =
            "horario-message";
    }


    /*
     * ==========================================
     * MOSTRAR MENSAJE DEL FORMULARIO
     * ==========================================
     */

    function mostrarMensajeFormulario(
        mensaje,
        tipo = "error"
    ) {

        eventFormMessage.textContent =
            mensaje;

        eventFormMessage.hidden =
            false;

        eventFormMessage.className =
            tipo === "success"
                ? "horario-message horario-message--success"
                : "horario-message horario-message--error";
    }


    /*
     * ==========================================
     * OCULTAR MENSAJE DEL FORMULARIO
     * ==========================================
     */

    function ocultarMensajeFormulario() {

        eventFormMessage.textContent =
            "";

        eventFormMessage.hidden =
            true;

        eventFormMessage.className =
            "horario-message";
    }


    /*
     * ==========================================
     * MOSTRAR MENSAJE DEL DETALLE
     * ==========================================
     */

    function mostrarMensajeDetalle(
        mensaje,
        tipo = "error"
    ) {

        eventDetailMessage.textContent =
            mensaje;

        eventDetailMessage.hidden =
            false;

        eventDetailMessage.className =
            tipo === "success"
                ? "horario-message horario-message--success"
                : "horario-message horario-message--error";
    }


    /*
     * ==========================================
     * OCULTAR MENSAJE DEL DETALLE
     * ==========================================
     */

    function ocultarMensajeDetalle() {

        eventDetailMessage.textContent =
            "";

        eventDetailMessage.hidden =
            true;

        eventDetailMessage.className =
            "horario-message";
    }


    /*
     * ==========================================
     * CARGAR HORARIOS
     * ==========================================
     */

    async function cargarHorarios() {

        try {

            const response =
                await fetch(
                    "/api/grupo-horarios",
                    {
                        method: "GET",

                        headers: {
                            "Authorization":
                                "Basic " + auth
                        }
                    }
                );


            if (response.status === 401) {

                sessionStorage.clear();

                window.location.href =
                    "/login";

                return;
            }


            if (response.status === 403) {

                throw new Error(
                    "No tienes permisos para consultar el horario."
                );
            }


            if (!response.ok) {

                throw new Error(
                    "No se pudo obtener el horario."
                );
            }


            horarios =
                await response.json();

        } catch (error) {

            console.error(
                "Error cargando horario:",
                error
            );

            throw error;
        }
    }


    /*
     * ==========================================
     * CARGAR EVENTOS
     * ==========================================
     */

    async function cargarEventos() {

        try {

            const fechaInicio =
                obtenerFechaISO(
                    fechaSemana
                );

            const fechaFin =
                new Date(fechaSemana);

            fechaFin.setDate(
                fechaFin.getDate() + 6
            );


            const response =
                await fetch(
                    `/api/eventos?fechaInicio=${fechaInicio}&fechaFin=${obtenerFechaISO(fechaFin)}`,
                    {
                        method: "GET",

                        headers: {
                            "Authorization":
                                "Basic " + auth
                        }
                    }
                );


            if (response.status === 401) {

                sessionStorage.clear();

                window.location.href =
                    "/login";

                return;
            }


            if (response.status === 403) {

                throw new Error(
                    "No tienes permisos para consultar los eventos."
                );
            }


            if (!response.ok) {

                throw new Error(
                    "No se pudieron obtener los eventos."
                );
            }


            eventos =
                await response.json();

        } catch (error) {

            console.error(
                "Error cargando eventos:",
                error
            );

            throw error;
        }
    }


    /*
     * ==========================================
     * CARGAR RESPONSABLES
     * ==========================================
     */

    async function cargarResponsables() {

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


            if (response.status === 401) {

                sessionStorage.clear();

                window.location.href =
                    "/login";

                return;
            }


            if (response.status === 403) {

                throw new Error(
                    "No tienes permisos para consultar los Senseis."
                );
            }


            if (!response.ok) {

                throw new Error(
                    "No se pudieron obtener los responsables."
                );
            }


            const responsables =
                await response.json();


            eventResponsible.innerHTML = `

                <option value="">
                    Sin responsable
                </option>

            `;


            responsables.forEach(
                responsable => {

                    const option =
                        document.createElement(
                            "option"
                        );

                    option.value =
                        responsable.id;

                    option.textContent =
                        `${responsable.nombre} ${responsable.apellido}`;

                    eventResponsible.appendChild(
                        option
                    );
                }
            );

        } catch (error) {

            console.error(
                "Error cargando responsables:",
                error
            );

            eventResponsible.innerHTML = `

                <option value="">
                    No se pudieron cargar
                </option>

            `;
        }
    }


    /*
     * ==========================================
     * CARGAR TODO
     * ==========================================
     */

    async function cargarDatosCalendario() {

        try {

            ocultarMensaje();


            scheduleCalendar.innerHTML = `

                <div class="horario-loading">

                    Cargando horario...

                </div>

            `;


            await Promise.all([
                cargarHorarios(),
                cargarEventos()
            ]);


            renderizarCalendario();

        } catch (error) {

            console.error(
                "Error cargando calendario:",
                error
            );


            scheduleCalendar.innerHTML = `

                <div class="horario-empty">

                    ${error.message}

                </div>

            `;
        }
    }


    /*
     * ==========================================
     * CREAR CALENDARIO
     * ==========================================
     */

    function renderizarCalendario() {

        const diasSemana = [];


        for (
            let i = 0;
            i < 7;
            i++
        ) {

            const fecha =
                new Date(fechaSemana);

            fecha.setDate(
                fechaSemana.getDate() + i
            );

            diasSemana.push(fecha);
        }


        const inicio =
            diasSemana[0];

        const fin =
            diasSemana[6];


        weekLabel.textContent =
            `${formatearFechaCorta(inicio)} - ${formatearFechaCorta(fin)} de ${fin.toLocaleDateString(
                "es-PE",
                {
                    month: "long",
                    year: "numeric"
                }
            )}`;


        let html = `

            <div class="horario-grid">

                <div class="
                    horario-grid__header
                    horario-grid__time
                ">
                </div>

        `;


        diasSemana.forEach(
            (fecha, indice) => {

                const esHoy =
                    obtenerFechaISO(fecha) ===
                    obtenerFechaISO(
                        new Date()
                    );


                html += `

                    <div class="
                        horario-grid__header
                        horario-grid__day
                        ${esHoy
                        ? "horario-grid__day--today"
                        : ""}
                    ">

                        <span class="horario-day-name">

                            ${NOMBRES_DIAS[indice]}

                        </span>

                        <span class="horario-day-number">

                            ${fecha.getDate()}

                        </span>

                    </div>

                `;
            }
        );


        for (
            let hora = HORA_INICIO;
            hora <= HORA_FIN;
            hora++
        ) {

            html += `

                <div class="
                    horario-grid__time
                    horario-grid__row
                ">

                    ${String(hora).padStart(2, "0")}:00

                </div>

            `;


            for (
                let dia = 0;
                dia < 7;
                dia++
            ) {

                const fecha =
                    diasSemana[dia];

                const esHoy =
                    obtenerFechaISO(fecha) ===
                    obtenerFechaISO(
                        new Date()
                    );


                html += `

                    <div
                        class="
                            horario-grid__cell
                            ${esHoy
                        ? "horario-grid__cell--today"
                        : ""}
                        "
                        data-dia="${DIAS[dia]}"
                        data-hora="${hora}">

                `;


                const clases =
                    obtenerClasesParaCelda(
                        DIAS[dia],
                        hora
                    );


                clases.forEach(
                    clase => {

                        html += crearBloqueClase(
                            clase,
                            hora
                        );

                    }
                );


                const eventosCelda =
                    obtenerEventosParaCelda(
                        fecha,
                        hora
                    );


                eventosCelda.forEach(
                    evento => {

                        html += crearBloqueEvento(
                            evento,
                            hora
                        );

                    }
                );


                html += `

                    </div>

                `;
            }
        }


        html += `

            </div>

        `;


        scheduleCalendar.innerHTML =
            html;
    }


    /*
     * ==========================================
     * CLIC EN EVENTOS
     * ==========================================
     */

    scheduleCalendar.addEventListener(
        "click",
        function (event) {

            const eventoElement =
                event.target.closest(
                    "[data-evento-id]"
                );


            if (!eventoElement) {
                return;
            }


            const eventoId =
                Number(
                    eventoElement.dataset.eventoId
                );


            const evento =
                eventos.find(
                    item =>
                        item.id === eventoId
                );


            if (!evento) {
                return;
            }


            mostrarDetalleEvento(
                evento
            );
        }
    );


    /*
     * ==========================================
     * CERRAR DETALLE
     * ==========================================
     */

    closeEventDetailButton.addEventListener(
        "click",
        function () {

            eventDetailSection.hidden =
                true;

            eventoSeleccionado =
                null;

            ocultarMensajeDetalle();
        }
    );


    /*
     * ==========================================
     * OBTENER CLASES PARA UNA CELDA
     * ==========================================
     */

    function obtenerClasesParaCelda(
        diaSemana,
        hora
    ) {

        return horarios.filter(
            horario => {

                if (
                    horario.diaSemana !==
                    diaSemana
                ) {

                    return false;
                }


                const horaInicio =
                    parseInt(
                        horario.horaInicio
                            .substring(0, 2),
                        10
                    );


                const horaFin =
                    parseInt(
                        horario.horaFin
                            .substring(0, 2),
                        10
                    );


                return (
                    hora >= horaInicio &&
                    hora < horaFin
                );
            }
        );
    }


    /*
     * ==========================================
     * CREAR BLOQUE DE CLASE
     * ==========================================
     */

    function crearBloqueClase(
        clase,
        horaActual
    ) {

        const horaInicio =
            clase.horaInicio
                .substring(0, 5);

        const horaFin =
            clase.horaFin
                .substring(0, 5);


        const inicioHora =
            parseInt(
                clase.horaInicio
                    .substring(0, 2),
                10
            );


        if (
            horaActual !==
            inicioHora
        ) {

            return "";
        }


        return `

            <div
                class="horario-evento"
                data-horario-id="${clase.id}">

                <strong
                    class="horario-evento__nombre">

                    ${clase.grupoNombre}

                </strong>

                <span
                    class="horario-evento__hora">

                    ${horaInicio} -
                    ${horaFin}

                </span>

                <span
                    class="horario-evento__sensei">

                    ${clase.senseiNombre
            || "Sin Sensei"}

                </span>

            </div>

        `;
    }


    /*
     * ==========================================
     * OBTENER EVENTOS PARA UNA CELDA
     * ==========================================
     */

    function obtenerEventosParaCelda(
        fecha,
        hora
    ) {

        const fechaISO =
            obtenerFechaISO(fecha);


        return eventos.filter(
            evento => {

                if (
                    evento.estado !==
                    "ACTIVO"
                ) {

                    return false;
                }


                if (
                    evento.fecha !==
                    fechaISO
                ) {

                    return false;
                }


                const horaInicio =
                    parseInt(
                        evento.horaInicio
                            .substring(0, 2),
                        10
                    );


                const horaFin =
                    parseInt(
                        evento.horaFin
                            .substring(0, 2),
                        10
                    );


                return (
                    hora >= horaInicio &&
                    hora < horaFin
                );
            }
        );
    }


    /*
     * ==========================================
     * CREAR BLOQUE DE EVENTO
     * ==========================================
     */

    function crearBloqueEvento(
        evento,
        horaActual
    ) {

        const horaInicio =
            evento.horaInicio
                .substring(0, 5);

        const horaFin =
            evento.horaFin
                .substring(0, 5);


        const inicioHora =
            parseInt(
                evento.horaInicio
                    .substring(0, 2),
                10
            );


        if (
            horaActual !==
            inicioHora
        ) {

            return "";
        }


        return `

            <div
                class="horario-evento horario-evento--especial"
                data-evento-id="${evento.id}"
                title="Ver detalles del evento">

                <strong
                    class="horario-evento__nombre">

                    ${evento.titulo}

                </strong>

                <span
                    class="horario-evento__hora">

                    ${horaInicio} -
                    ${horaFin}

                </span>

                <span
                    class="horario-evento__sensei">

                    ${evento.tipo}

                    ${evento.responsableNombre
                ? " · " + evento.responsableNombre
                : ""}

                </span>

            </div>

        `;
    }


    /*
     * ==========================================
     * MOSTRAR DETALLE DEL EVENTO
     * ==========================================
     */

    function mostrarDetalleEvento(evento) {

        eventoSeleccionado =
            evento;


        eventDetailTitle.textContent =
            evento.titulo;

        eventDetailType.textContent =
            evento.tipo;

        eventDetailDate.textContent =
            formatearFechaEvento(
                evento.fecha
            );

        eventDetailTime.textContent =
            `${evento.horaInicio.substring(0, 5)} - ${evento.horaFin.substring(0, 5)}`;

        eventDetailPlace.textContent =
            evento.lugar ||
            "Sin lugar indicado";

        eventDetailResponsible.textContent =
            evento.responsableNombre ||
            "Sin responsable";

        eventDetailDescription.textContent =
            evento.descripcion ||
            "Sin descripción";

        eventDetailStatus.textContent =
            evento.estado;


        if (
            evento.estado ===
            "ACTIVO"
        ) {

            toggleEventStatusButton.textContent =
                "Cancelar evento";

        } else {

            toggleEventStatusButton.textContent =
                "Activar evento";
        }


        ocultarMensajeDetalle();


        eventDetailSection.hidden =
            false;


        eventDetailSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }


    /*
     * ==========================================
     * FORMATEAR FECHA DEL EVENTO
     * ==========================================
     */

    function formatearFechaEvento(
        fechaISO
    ) {

        const partes =
            fechaISO.split("-");


        const fecha =
            new Date(
                Number(partes[0]),
                Number(partes[1]) - 1,
                Number(partes[2])
            );


        return fecha.toLocaleDateString(
            "es-PE",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }
        );
    }


    /*
     * ==========================================
     * MOSTRAR FORMULARIO DE CREACIÓN
     * ==========================================
     */

    showEventFormButton.addEventListener(
        "click",
        async function () {

            modoEdicion =
                false;

            eventForm.reset();

            eventFormSection.hidden =
                false;

            ocultarMensajeFormulario();

            await cargarResponsables();


            const fecha =
                obtenerFechaISO(
                    fechaActual
                );


            document.getElementById(
                "eventDate"
            ).value = fecha;
        }
    );


    /*
     * ==========================================
     * CANCELAR FORMULARIO
     * ==========================================
     */

    cancelEventButton.addEventListener(
        "click",
        function () {

            eventForm.reset();

            modoEdicion =
                false;

            ocultarMensajeFormulario();

            eventFormSection.hidden =
                true;
        }
    );


    /*
     * ==========================================
     * EDITAR EVENTO
     * ==========================================
     */

    editEventButton.addEventListener(
        "click",
        async function () {

            if (!eventoSeleccionado) {

                return;
            }


            modoEdicion =
                true;


            const evento =
                eventoSeleccionado;


            await cargarResponsables();


            document.getElementById(
                "eventTitle"
            ).value =
                evento.titulo || "";


            document.getElementById(
                "eventType"
            ).value =
                evento.tipo || "";


            document.getElementById(
                "eventDate"
            ).value =
                evento.fecha || "";


            document.getElementById(
                "eventStart"
            ).value =
                evento.horaInicio
                    ? evento.horaInicio.substring(0, 5)
                    : "";


            document.getElementById(
                "eventEnd"
            ).value =
                evento.horaFin
                    ? evento.horaFin.substring(0, 5)
                    : "";


            document.getElementById(
                "eventPlace"
            ).value =
                evento.lugar || "";


            document.getElementById(
                "eventDescription"
            ).value =
                evento.descripcion || "";


            eventResponsible.value =
                evento.responsableId
                    ? evento.responsableId
                    : "";


            ocultarMensajeFormulario();


            eventFormSection.hidden =
                false;


            eventFormSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    );


    /*
     * ==========================================
     * CREAR / ACTUALIZAR EVENTO
     * ==========================================
     */

    eventForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            ocultarMensajeFormulario();


            const titulo =
                document.getElementById(
                    "eventTitle"
                ).value.trim();


            const tipo =
                document.getElementById(
                    "eventType"
                ).value;


            const fecha =
                document.getElementById(
                    "eventDate"
                ).value;


            const horaInicio =
                document.getElementById(
                    "eventStart"
                ).value;


            const horaFin =
                document.getElementById(
                    "eventEnd"
                ).value;


            const lugar =
                document.getElementById(
                    "eventPlace"
                ).value.trim();


            const descripcion =
                document.getElementById(
                    "eventDescription"
                ).value.trim();


            const responsableId =
                eventResponsible.value;


            /*
             * ======================================
             * VALIDACIONES
             * ======================================
             */

            if (!titulo) {

                mostrarMensajeFormulario(
                    "El título del evento es obligatorio."
                );

                return;
            }


            if (!tipo) {

                mostrarMensajeFormulario(
                    "Debes seleccionar el tipo de evento."
                );

                return;
            }


            if (!fecha) {

                mostrarMensajeFormulario(
                    "La fecha del evento es obligatoria."
                );

                return;
            }


            if (
                !horaInicio ||
                !horaFin
            ) {

                mostrarMensajeFormulario(
                    "Debes indicar la hora de inicio y la hora de fin."
                );

                return;
            }


            if (
                horaInicio >=
                horaFin
            ) {

                mostrarMensajeFormulario(
                    "La hora de inicio debe ser anterior a la hora de fin."
                );

                return;
            }


            const datos = {

                titulo: titulo,

                tipo: tipo,

                descripcion:
                    descripcion ||
                    null,

                fecha: fecha,

                horaInicio:
                    horaInicio,

                horaFin:
                    horaFin,

                lugar:
                    lugar ||
                    null,

                responsableId:
                    responsableId
                        ? Number(
                            responsableId
                        )
                        : null
            };


            try {

                /*
                 * ==================================
                 * CREAR
                 * ==================================
                 */

                if (!modoEdicion) {

                    const response =
                        await fetch(
                            "/api/eventos",
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
                                        datos
                                    )
                            }
                        );


                    if (
                        response.status ===
                        401
                    ) {

                        sessionStorage.clear();

                        window.location.href =
                            "/login";

                        return;
                    }


                    if (
                        response.status ===
                        403
                    ) {

                        throw new Error(
                            "No tienes permisos para crear eventos."
                        );
                    }


                    if (!response.ok) {

                        let mensaje =
                            "No se pudo crear el evento.";

                        try {

                            const errorData =
                                await response.json();

                            if (
                                errorData.message
                            ) {

                                mensaje =
                                    errorData.message;
                            }

                        } catch {
                            // Mantener mensaje genérico
                        }

                        throw new Error(
                            mensaje
                        );
                    }


                    const eventoCreado =
                        await response.json();


                    console.log(
                        "Evento creado:",
                        eventoCreado
                    );


                    mostrarMensajeFormulario(
                        "Evento creado correctamente.",
                        "success"
                    );

                }


                /*
                 * ==================================
                 * ACTUALIZAR
                 * ==================================
                 */

                else {

                    if (!eventoSeleccionado) {

                        throw new Error(
                            "No se encontró el evento que deseas editar."
                        );
                    }


                    const response =
                        await fetch(
                            `/api/eventos/${eventoSeleccionado.id}`,
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
                                        datos
                                    )
                            }
                        );


                    if (
                        response.status ===
                        401
                    ) {

                        sessionStorage.clear();

                        window.location.href =
                            "/login";

                        return;
                    }


                    if (
                        response.status ===
                        403
                    ) {

                        throw new Error(
                            "No tienes permisos para actualizar eventos."
                        );
                    }


                    if (!response.ok) {

                        let mensaje =
                            "No se pudo actualizar el evento.";

                        try {

                            const errorData =
                                await response.json();

                            if (
                                errorData.message
                            ) {

                                mensaje =
                                    errorData.message;
                            }

                        } catch {
                            // Mantener mensaje genérico
                        }

                        throw new Error(
                            mensaje
                        );
                    }


                    const eventoActualizado =
                        await response.json();


                    console.log(
                        "Evento actualizado:",
                        eventoActualizado
                    );


                    mostrarMensajeFormulario(
                        "Evento actualizado correctamente.",
                        "success"
                    );


                    eventoSeleccionado =
                        eventoActualizado;
                }


                /*
                 * ==================================
                 * LIMPIAR FORMULARIO
                 * ==================================
                 */

                eventForm.reset();


                /*
                 * ==================================
                 * RECARGAR CALENDARIO
                 * ==================================
                 */

                await cargarDatosCalendario();


                /*
                 * ==================================
                 * CERRAR FORMULARIO
                 * ==================================
                 */

                setTimeout(
                    function () {

                        eventFormSection.hidden =
                            true;

                        ocultarMensajeFormulario();

                    },
                    1000
                );


                /*
                 * ==================================
                 * ACTUALIZAR DETALLE
                 * ==================================
                 */

                if (
                    modoEdicion &&
                    eventoSeleccionado
                ) {

                    mostrarDetalleEvento(
                        eventoSeleccionado
                    );
                }


                modoEdicion =
                    false;


            } catch (error) {

                console.error(
                    "Error procesando evento:",
                    error
                );


                mostrarMensajeFormulario(
                    error.message
                );
            }

        }
    );


    /*
     * ==========================================
     * CAMBIAR ESTADO
     * ==========================================
     */

    toggleEventStatusButton.addEventListener(
        "click",
        async function () {

            if (!eventoSeleccionado) {

                return;
            }


            const evento =
                eventoSeleccionado;


            const nuevoEstado =
                evento.estado === "ACTIVO"
                    ? "CANCELADO"
                    : "ACTIVO";


            const confirmacion =
                nuevoEstado === "CANCELADO"
                    ? "¿Seguro que deseas cancelar este evento?"
                    : "¿Deseas activar nuevamente este evento?";


            if (!confirm(confirmacion)) {

                return;
            }


            try {

                const response =
                    await fetch(
                        `/api/eventos/${evento.id}/estado?estado=${nuevoEstado}`,
                        {
                            method: "PATCH",

                            headers: {

                                "Authorization":
                                    "Basic " + auth
                            }
                        }
                    );


                if (
                    response.status ===
                    401
                ) {

                    sessionStorage.clear();

                    window.location.href =
                        "/login";

                    return;
                }


                if (
                    response.status ===
                    403
                ) {

                    throw new Error(
                        "No tienes permisos para cambiar el estado del evento."
                    );
                }


                if (!response.ok) {

                    let mensaje =
                        "No se pudo cambiar el estado del evento.";

                    try {

                        const errorData =
                            await response.json();

                        if (
                            errorData.message
                        ) {

                            mensaje =
                                errorData.message;
                        }

                    } catch {
                        // Mantener mensaje genérico
                    }

                    throw new Error(
                        mensaje
                    );
                }


                const eventoActualizado =
                    await response.json();


                console.log(
                    "Estado actualizado:",
                    eventoActualizado
                );


                eventoSeleccionado =
                    eventoActualizado;


                mostrarDetalleEvento(
                    eventoActualizado
                );


                mostrarMensajeDetalle(
                    nuevoEstado === "CANCELADO"
                        ? "Evento cancelado correctamente."
                        : "Evento activado correctamente.",
                    "success"
                );


                await cargarDatosCalendario();


            } catch (error) {

                console.error(
                    "Error cambiando estado:",
                    error
                );


                mostrarMensajeDetalle(
                    error.message
                );
            }
        }
    );


    /*
     * ==========================================
     * ELIMINAR EVENTO
     * ==========================================
     */

    deleteEventButton.addEventListener(
        "click",
        async function () {

            if (!eventoSeleccionado) {

                return;
            }


            const evento =
                eventoSeleccionado;


            const confirmacion =
                confirm(
                    `¿Seguro que deseas eliminar el evento "${evento.titulo}"? Esta acción no se puede deshacer.`
                );


            if (!confirmacion) {

                return;
            }


            try {

                const response =
                    await fetch(
                        `/api/eventos/${evento.id}`,
                        {
                            method: "DELETE",

                            headers: {

                                "Authorization":
                                    "Basic " + auth
                            }
                        }
                    );


                if (
                    response.status ===
                    401
                ) {

                    sessionStorage.clear();

                    window.location.href =
                        "/login";

                    return;
                }


                if (
                    response.status ===
                    403
                ) {

                    throw new Error(
                        "No tienes permisos para eliminar eventos."
                    );
                }


                if (!response.ok) {

                    let mensaje =
                        "No se pudo eliminar el evento.";

                    try {

                        const errorData =
                            await response.json();

                        if (
                            errorData.message
                        ) {

                            mensaje =
                                errorData.message;
                        }

                    } catch {
                        // Mantener mensaje genérico
                    }

                    throw new Error(
                        mensaje
                    );
                }


                /*
                 * ==================================
                 * EVENTO ELIMINADO
                 * ==================================
                 */

                eventoSeleccionado =
                    null;


                eventDetailSection.hidden =
                    true;


                ocultarMensajeDetalle();


                mostrarMensaje(
                    "Evento eliminado correctamente.",
                    "success"
                );


                await cargarDatosCalendario();


            } catch (error) {

                console.error(
                    "Error eliminando evento:",
                    error
                );


                mostrarMensajeDetalle(
                    error.message
                );
            }
        }
    );


    /*
     * ==========================================
     * SEMANA ANTERIOR
     * ==========================================
     */

    previousWeekButton.addEventListener(
        "click",
        async function () {

            fechaSemana.setDate(
                fechaSemana.getDate() - 7
            );

            eventDetailSection.hidden =
                true;

            eventoSeleccionado =
                null;

            await cargarDatosCalendario();

        }
    );


    /*
     * ==========================================
     * SEMANA SIGUIENTE
     * ==========================================
     */

    nextWeekButton.addEventListener(
        "click",
        async function () {

            fechaSemana.setDate(
                fechaSemana.getDate() + 7
            );

            eventDetailSection.hidden =
                true;

            eventoSeleccionado =
                null;

            await cargarDatosCalendario();

        }
    );


    /*
     * ==========================================
     * HOY
     * ==========================================
     */

    todayButton.addEventListener(
        "click",
        async function () {

            fechaActual =
                new Date();

            fechaSemana =
                obtenerLunes(
                    fechaActual
                );


            eventDetailSection.hidden =
                true;

            eventoSeleccionado =
                null;


            await cargarDatosCalendario();

        }
    );


    /*
     * ==========================================
     * CARGAR RESPONSABLES INICIALMENTE
     * ==========================================
     */

    cargarResponsables();


    /*
     * ==========================================
     * CARGA INICIAL
     * ==========================================
     */

    cargarDatosCalendario();

});