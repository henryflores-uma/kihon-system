document.addEventListener("DOMContentLoaded", async function () {

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


    /*
     * ==========================================
     * VERIFICAR SESIÓN
     * ==========================================
     */

    if (!auth || !username) {

        window.location.href =
            "/login";

        return;
    }


    /*
     * ==========================================
     * VERIFICAR ROL
     * ==========================================
     */

    if (rol !== "ADMIN") {

        window.location.href =
            "/login";

        return;
    }


    usernameDisplay.textContent =
        username;


    /*
     * ==========================================
     * ESPERAR A EVENTOS.JS
     * ==========================================
     */

    await esperarModuloEventos();


    /*
     * ==========================================
     * EXPONER API DEL CALENDARIO
     * ==========================================
     */

    window.KihonHorario = {

        recargarCalendario:
            cargarDatosCalendario,

        obtenerFechaSemana:
            function () {
                return new Date(fechaSemana);
            },

        obtenerFechaActual:
            function () {
                return new Date(fechaActual);
            },

        obtenerFechaISO:
            obtenerFechaISO
    };


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
     * ESPERAR MÓDULO DE EVENTOS
     * ==========================================
     */

    function esperarModuloEventos() {

        return new Promise(
            resolve => {

                if (
                    window.KihonEventos &&
                    window.KihonEventos.ready
                ) {

                    resolve();

                    return;
                }


                window.addEventListener(
                    "kihonEventosReady",
                    function () {

                        resolve();

                    },
                    {
                        once: true
                    }
                );

            }
        );
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

                window.KihonEventos.cargarEventos(
                    fechaSemana
                )

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

                        html +=
                            crearBloqueClase(
                                clase,
                                hora
                            );

                    }
                );


                const eventosCelda =
                    window.KihonEventos
                        .obtenerEventosParaCelda(
                            fecha,
                            hora
                        );


                eventosCelda.forEach(
                    evento => {

                        html +=
                            window.KihonEventos
                                .crearBloqueEvento(
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


            window.KihonEventos
                .mostrarDetalleEvento(
                    eventoId
                );
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
     * SEMANA ANTERIOR
     * ==========================================
     */

    previousWeekButton.addEventListener(
        "click",
        async function () {

            fechaSemana.setDate(
                fechaSemana.getDate() - 7
            );


            window.KihonEventos
                .ocultarDetalle();


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


            window.KihonEventos
                .ocultarDetalle();


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


            window.KihonEventos
                .ocultarDetalle();


            await cargarDatosCalendario();

        }
    );


    /*
     * ==========================================
     * CARGA INICIAL
     * ==========================================
     */

    await cargarDatosCalendario();

});