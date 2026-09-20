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
     * MOSTRAR MENSAJE
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
     * OCULTAR MENSAJE
     * ==========================================
     */

    function ocultarMensaje() {

        scheduleMessage.hidden =
            true;

        scheduleMessage.textContent =
            "";
    }


    /*
     * ==========================================
     * CARGAR HORARIOS
     * ==========================================
     */

    async function cargarHorarios() {

        try {

            ocultarMensaje();


            scheduleCalendar.innerHTML = `

                <div class="horario-loading">

                    Cargando horario...

                </div>

            `;


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


            /*
             * ======================================
             * SESIÓN NO AUTORIZADA
             * ======================================
             */

            if (response.status === 401) {

                sessionStorage.clear();

                window.location.href =
                    "/login";

                return;
            }


            /*
             * ======================================
             * SIN PERMISOS
             * ======================================
             */

            if (response.status === 403) {

                throw new Error(
                    "No tienes permisos para consultar el horario."
                );
            }


            /*
             * ======================================
             * OTROS ERRORES
             * ======================================
             */

            if (!response.ok) {

                throw new Error(
                    "No se pudo obtener el horario."
                );
            }


            horarios =
                await response.json();


            renderizarCalendario();


        } catch (error) {

            console.error(
                "Error cargando horario:",
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


        /*
         * ======================================
         * CREAR LOS 7 DÍAS
         * ======================================
         */

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


        /*
         * ======================================
         * ACTUALIZAR TÍTULO
         * ======================================
         */

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


        /*
         * ======================================
         * INICIO DEL GRID
         * ======================================
         */

        let html = `

            <div class="horario-grid">

                <div class="
                    horario-grid__header
                    horario-grid__time
                ">
                </div>

        `;


        /*
         * ======================================
         * CABECERA DE DÍAS
         * ======================================
         */

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


        /*
         * ======================================
         * FILAS HORARIAS
         * ======================================
         */

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


            /*
             * ==================================
             * COLUMNAS DE LOS DÍAS
             * ==================================
             */

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


                /*
                 * ==================================
                 * BUSCAR CLASES
                 * ==================================
                 */

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


                html += `

                    </div>

                `;
            }
        }


        /*
         * ======================================
         * CERRAR GRID
         * ======================================
         */

        html += `

            </div>

        `;


        scheduleCalendar.innerHTML =
            html;
    }


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


        /*
         * ======================================
         * EL BLOQUE SOLO SE DIBUJA
         * EN LA HORA DE INICIO
         * ======================================
         */

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
        function () {

            fechaSemana.setDate(
                fechaSemana.getDate() - 7
            );

            renderizarCalendario();
        }
    );


    /*
     * ==========================================
     * SEMANA SIGUIENTE
     * ==========================================
     */

    nextWeekButton.addEventListener(
        "click",
        function () {

            fechaSemana.setDate(
                fechaSemana.getDate() + 7
            );

            renderizarCalendario();
        }
    );


    /*
     * ==========================================
     * HOY
     * ==========================================
     */

    todayButton.addEventListener(
        "click",
        function () {

            fechaActual =
                new Date();

            fechaSemana =
                obtenerLunes(
                    fechaActual
                );

            renderizarCalendario();
        }
    );


    /*
     * ==========================================
     * CARGA INICIAL
     * ==========================================
     */

    cargarHorarios();

});