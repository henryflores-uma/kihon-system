document.addEventListener("DOMContentLoaded", function () {

    // ==========================================
    // DATOS DE SESIÓN
    // ==========================================

    const auth =
        sessionStorage.getItem("kihonAuth");

    const username =
        sessionStorage.getItem("kihonUsername");

    const rol =
        sessionStorage.getItem("kihonRol");


    // ==========================================
    // ELEMENTOS DE SESIÓN
    // ==========================================

    const usernameDisplay =
        document.getElementById("usernameDisplay");

    const roleDisplay =
        document.getElementById("roleDisplay");

    const profileRoleDisplay =
        document.getElementById("profileRoleDisplay");

    const userAvatarInitial =
        document.getElementById("userAvatarInitial");


    // ==========================================
    // VERIFICAR SESIÓN
    // ==========================================

    if (!auth || !username || !rol) {

        window.location.href = "/login";

        return;
    }


    // ==========================================
    // VERIFICAR ROL
    // ==========================================

    if (rol !== "ADMIN") {

        window.location.href = "/login";

        return;
    }


    // ==========================================
    // MOSTRAR INFORMACIÓN DEL USUARIO
    // ==========================================

    if (usernameDisplay) {

        usernameDisplay.textContent =
            username;

    }


    if (roleDisplay) {

        roleDisplay.textContent =
            "Administrador";

    }


    if (profileRoleDisplay) {

        profileRoleDisplay.textContent =
            "Administrador";

    }


    if (userAvatarInitial) {

        userAvatarInitial.textContent =
            username.charAt(0).toUpperCase();

    }


    // ==========================================
    // CONFIGURACIÓN GENERAL
    // ==========================================

    const API_BASE =
        "/api";


    // ==========================================
    // VARIABLES DE GRÁFICOS
    // ==========================================

    let weeklyAttendanceChart = null;

    let beltDistributionChart = null;


    // ==========================================
    // ELEMENTOS DEL DASHBOARD
    // ==========================================

    const totalStudents =
        document.getElementById("totalStudents");

    const activeStudents =
        document.getElementById("activeStudents");

    const activeGroups =
        document.getElementById("activeGroups");

    const attendanceGroupFilter =
        document.getElementById("attendanceGroupFilter");

    const currentClassStatus =
        document.getElementById("currentClassStatus");

    const currentClassName =
        document.getElementById("currentClassName");

    const currentClassTime =
        document.getElementById("currentClassTime");

    const currentClassGroup =
        document.getElementById("currentClassGroup");

    const nextClassName =
        document.getElementById("nextClassName");

    const nextClassTime =
        document.getElementById("nextClassTime");

    const nextClassGroup =
        document.getElementById("nextClassGroup");

    const scheduleDate =
        document.getElementById("scheduleDate");

    const todaySchedule =
        document.getElementById("todaySchedule");


    // ==========================================
    // VERIFICAR QUE ESTAMOS EN EL DASHBOARD
    // ==========================================

    if (!totalStudents) {

        return;
    }


    // ==========================================
    // FETCH AUTENTICADO
    // ==========================================

    async function apiFetch(url, options = {}) {

        const headers = {
            ...(options.headers || {}),
            "Authorization": "Basic " + auth
        };


        const response = await fetch(
            url,
            {
                ...options,
                headers
            }
        );


        // --------------------------------------
        // SESIÓN NO AUTORIZADA
        // --------------------------------------

        if (response.status === 401) {

            sessionStorage.clear();

            window.location.href = "/login";

            return null;
        }


        // --------------------------------------
        // SIN PERMISOS
        // --------------------------------------

        if (response.status === 403) {

            console.error(
                "No tienes permisos para acceder a:",
                url
            );

            return null;
        }


        // --------------------------------------
        // OTROS ERRORES
        // --------------------------------------

        if (!response.ok) {

            throw new Error(
                `Error ${response.status} en ${url}`
            );

        }


        return response.json();
    }


    // ==========================================
    // FECHA LOCAL
    // ==========================================

    function obtenerFechaLocal(fecha = new Date()) {

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


    // ==========================================
    // FORMATEAR FECHA
    // ==========================================

    function formatearFecha(fecha) {

        const opciones = {

            weekday: "long",

            day: "numeric",

            month: "long",

            year: "numeric"

        };


        return new Date(
            fecha + "T00:00:00"
        ).toLocaleDateString(
            "es-PE",
            opciones
        );
    }


    // ==========================================
    // FORMATEAR HORA
    // ==========================================

    function formatearHora(hora) {

        if (!hora) {

            return "—";
        }


        const partes =
            hora.split(":");


        const horas =
            Number(partes[0]);


        const minutos =
            partes[1];


        const sufijo =
            horas >= 12
                ? "PM"
                : "AM";


        const hora12 =
            horas % 12 || 12;


        return `${hora12}:${minutos} ${sufijo}`;
    }


    // ==========================================
    // OBTENER MINUTOS DE UNA HORA
    // ==========================================

    function horaAMinutos(hora) {

        if (!hora) {

            return null;
        }


        const partes =
            hora.split(":");


        return (
            Number(partes[0]) * 60 +
            Number(partes[1])
        );
    }


    // ==========================================
    // CARGAR ESTUDIANTES
    // ==========================================

    async function cargarEstudiantes() {

        try {

            const estudiantes =
                await apiFetch(
                    `${API_BASE}/estudiantes`
                );


            if (!estudiantes) {

                return [];
            }


            // --------------------------------------
            // TOTAL
            // --------------------------------------

            totalStudents.textContent =
                estudiantes.length;


            // --------------------------------------
            // ACTIVOS
            // --------------------------------------

            const activos =
                estudiantes.filter(
                    estudiante =>
                        String(
                            estudiante.estado
                        ).toUpperCase() === "ACTIVO"
                );


            activeStudents.textContent =
                activos.length;


            return estudiantes;

        } catch (error) {

            console.error(
                "Error al cargar estudiantes:",
                error
            );


            totalStudents.textContent =
                "—";


            activeStudents.textContent =
                "—";


            return [];
        }
    }


    // ==========================================
    // CARGAR GRUPOS
    // ==========================================

    async function cargarGrupos() {

        try {

            const grupos =
                await apiFetch(
                    `${API_BASE}/grupos?estado=ACTIVO`
                );


            if (!grupos) {

                return [];
            }


            // --------------------------------------
            // TOTAL DE GRUPOS ACTIVOS
            // --------------------------------------

            activeGroups.textContent =
                grupos.length;


            // --------------------------------------
            // LLENAR FILTRO
            // --------------------------------------

            if (attendanceGroupFilter) {

                attendanceGroupFilter.innerHTML =
                    `
                    <option value="TODOS">
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


                        attendanceGroupFilter.appendChild(
                            option
                        );

                    }
                );

            }


            return grupos;

        } catch (error) {

            console.error(
                "Error al cargar grupos:",
                error
            );


            activeGroups.textContent =
                "—";


            return [];
        }
    }


    // ==========================================
    // OBTENER FECHAS DE LA SEMANA
    // ==========================================

    function obtenerSemana() {

        const hoy =
            new Date();


        const dia =
            hoy.getDay();


        /*
         * Domingo = 0
         * Lunes = 1
         */

        const diferencia =
            dia === 0
                ? -6
                : 1 - dia;


        const lunes =
            new Date(hoy);


        lunes.setDate(
            hoy.getDate() + diferencia
        );


        const fechas = [];


        for (let i = 0; i < 7; i++) {

            const fecha =
                new Date(lunes);


            fecha.setDate(
                lunes.getDate() + i
            );


            fechas.push(fecha);

        }


        return fechas;
    }


    // ==========================================
    // CARGAR ASISTENCIA SEMANAL
    // ==========================================

    async function cargarAsistenciaSemanal(
        grupoSeleccionado = "TODOS"
    ) {

        try {

            const fechas =
                obtenerSemana();


            // --------------------------------------
            // OBTENER ASISTENCIAS DE LOS 7 DÍAS
            // --------------------------------------

            const resultados =
                await Promise.all(

                    fechas.map(
                        async fecha => {

                            const fechaString =
                                obtenerFechaLocal(
                                    fecha
                                );


                            const asistencias =
                                await apiFetch(
                                    `${API_BASE}/asistencias/fecha/${fechaString}`
                                );


                            return {

                                fecha,

                                asistencias:
                                    asistencias || []

                            };

                        }
                    )

                );


            // --------------------------------------
            // OBTENER GRUPOS REGISTRADOS
            // --------------------------------------

            const gruposMap =
                new Map();


            resultados.forEach(
                resultado => {

                    resultado.asistencias.forEach(
                        asistencia => {

                            if (
                                asistencia.grupoId === null ||
                                asistencia.grupoId === undefined
                            ) {

                                return;
                            }


                            if (
                                !gruposMap.has(
                                    asistencia.grupoId
                                )
                            ) {

                                gruposMap.set(

                                    asistencia.grupoId,

                                    asistencia.grupoNombre ||
                                    `Grupo ${asistencia.grupoId}`

                                );

                            }

                        }
                    );

                }
            );


            // --------------------------------------
            // FILTRAR GRUPO
            // --------------------------------------

            let grupos =
                Array.from(
                    gruposMap.entries()
                );


            if (
                grupoSeleccionado !==
                "TODOS"
            ) {

                grupos =
                    grupos.filter(
                        ([grupoId]) =>
                            String(grupoId) ===
                            String(grupoSeleccionado)
                    );

            }


            // --------------------------------------
            // ETIQUETAS DE LOS DÍAS
            // --------------------------------------

            const etiquetas =
                resultados.map(
                    resultado => {

                        return resultado.fecha
                            .toLocaleDateString(
                                "es-PE",
                                {
                                    weekday: "short"
                                }
                            )
                            .replace(".", "")
                            .toUpperCase();

                    }
                );


            // --------------------------------------
            // COLORES PARA LOS GRUPOS
            // --------------------------------------

            const colores = [

                "#FF2400",

                "#FFD700",

                "#2563EB",

                "#16A34A",

                "#9333EA",

                "#EA580C",

                "#0891B2",

                "#DB2777",

                "#65A30D",

                "#4F46E5"

            ];


            // --------------------------------------
            // CREAR DATASET POR CADA GRUPO
            // --------------------------------------

            const datasets =
                grupos.map(
                    ([grupoId, grupoNombre], index) => {

                        const datos =
                            resultados.map(
                                resultado => {

                                    return resultado
                                        .asistencias
                                        .filter(
                                            asistencia =>
                                                String(
                                                    asistencia.grupoId
                                                ) ===
                                                String(
                                                    grupoId
                                                )
                                        )
                                        .length;

                                }
                            );


                        const color =
                            colores[
                            index %
                            colores.length
                            ];


                        return {

                            label:
                                grupoNombre,

                            data:
                                datos,

                            backgroundColor:
                                color,

                            borderColor:
                                color,

                            borderWidth: 1

                        };

                    }
                );


            // --------------------------------------
            // CREAR GRÁFICO
            // --------------------------------------

            crearGraficoAsistencia(
                etiquetas,
                datasets
            );


        } catch (error) {

            console.error(
                "Error al cargar asistencia semanal:",
                error
            );

        }

    }


    // ==========================================
    // CREAR GRÁFICO DE ASISTENCIA
    // ==========================================

    function crearGraficoAsistencia(
        etiquetas,
        datasets
    ) {

        const canvas =
            document.getElementById(
                "weeklyAttendanceChart"
            );


        if (!canvas) {

            return;
        }


        // --------------------------------------
        // DESTRUIR GRÁFICO ANTERIOR
        // --------------------------------------

        if (weeklyAttendanceChart) {

            weeklyAttendanceChart.destroy();

        }


        // --------------------------------------
        // CREAR GRÁFICO
        // --------------------------------------

        weeklyAttendanceChart =
            new Chart(
                canvas,
                {

                    type: "bar",


                    data: {

                        labels:
                            etiquetas,

                        datasets:
                            datasets

                    },


                    options: {

                        responsive: true,

                        maintainAspectRatio: false,


                        scales: {

                            y: {

                                beginAtZero: true,

                                ticks: {

                                    precision: 0

                                },

                                title: {

                                    display: true,

                                    text:
                                        "Cantidad de asistencias"

                                }

                            },


                            x: {

                                title: {

                                    display: true,

                                    text:
                                        "Día de la semana"

                                }

                            }

                        },


                        plugins: {

                            legend: {

                                display: true,

                                position: "bottom"

                            },


                            tooltip: {

                                callbacks: {

                                    label:
                                        function (
                                            context
                                        ) {

                                            return (
                                                context.dataset.label +
                                                ": " +
                                                context.parsed.y +
                                                " asistencias"
                                            );

                                        }

                                }

                            }

                        }

                    }

                }
            );

    }


    // ==========================================
    // DISTRIBUCIÓN POR CINTURÓN
    // ==========================================

    function cargarDistribucionCinturones(
        estudiantes
    ) {

        const conteo = {};


        estudiantes.forEach(
            estudiante => {

                const cinturon =
                    estudiante.cinturon ||
                    "SIN CINTURÓN";


                if (!conteo[cinturon]) {

                    conteo[cinturon] = 0;

                }


                conteo[cinturon]++;

            }
        );


        const etiquetas =
            Object.keys(conteo);


        const datos =
            Object.values(conteo);


        crearGraficoCinturones(
            etiquetas,
            datos
        );

    }


    // ==========================================
    // CREAR GRÁFICO DE CINTURONES
    // ==========================================

    function crearGraficoCinturones(
        etiquetas,
        datos
    ) {

        const canvas =
            document.getElementById(
                "beltDistributionChart"
            );


        if (!canvas) {

            return;
        }


        if (beltDistributionChart) {

            beltDistributionChart.destroy();

        }


        beltDistributionChart =
            new Chart(
                canvas,
                {

                    type: "doughnut",


                    data: {

                        labels:
                            etiquetas,

                        datasets: [

                            {

                                data:
                                    datos,

                                borderWidth: 1

                            }

                        ]

                    },


                    options: {

                        responsive: true,

                        maintainAspectRatio: false,


                        plugins: {

                            legend: {

                                position: "bottom"

                            }

                        }

                    }

                }
            );

    }


    // ==========================================
    // CARGAR EVENTOS DEL DÍA
    // ==========================================

    async function cargarEventosHoy() {

        try {

            const hoy =
                obtenerFechaLocal();


            const eventos =
                await apiFetch(
                    `${API_BASE}/eventos?fechaInicio=${hoy}&fechaFin=${hoy}`
                );


            if (!eventos) {

                return;
            }


            mostrarEstadoClases(
                eventos
            );


            mostrarHorarioHoy(
                eventos
            );


        } catch (error) {

            console.error(
                "Error al cargar eventos:",
                error
            );

        }

    }


    // ==========================================
    // MOSTRAR ESTADO DE LAS CLASES
    // ==========================================

    function mostrarEstadoClases(
        eventos
    ) {

        const ahora =
            new Date();


        const minutosActuales =
            ahora.getHours() * 60 +
            ahora.getMinutes();


        const eventosOrdenados =
            [...eventos].sort(
                (a, b) =>
                    horaAMinutos(a.horaInicio) -
                    horaAMinutos(b.horaInicio)
            );


        let claseActual = null;

        let proximaClase = null;


        // --------------------------------------
        // BUSCAR CLASE ACTUAL
        // --------------------------------------

        for (
            const evento
            of eventosOrdenados
        ) {

            const inicio =
                horaAMinutos(
                    evento.horaInicio
                );


            const fin =
                horaAMinutos(
                    evento.horaFin
                );


            if (
                inicio !== null &&
                fin !== null &&
                minutosActuales >= inicio &&
                minutosActuales < fin
            ) {

                claseActual =
                    evento;

                break;
            }

        }


        // --------------------------------------
        // BUSCAR PRÓXIMA CLASE
        // --------------------------------------

        if (!claseActual) {

            proximaClase =
                eventosOrdenados.find(
                    evento => {

                        const inicio =
                            horaAMinutos(
                                evento.horaInicio
                            );


                        return (
                            inicio !== null &&
                            inicio >
                            minutosActuales
                        );

                    }
                );

        } else {

            const indice =
                eventosOrdenados.indexOf(
                    claseActual
                );


            proximaClase =
                eventosOrdenados[
                indice + 1
                ] || null;

        }


        // --------------------------------------
        // MOSTRAR CLASE ACTUAL
        // --------------------------------------

        if (claseActual) {

            currentClassStatus.textContent =
                "En curso";


            currentClassStatus.classList.remove(
                "class-status-badge--idle"
            );


            currentClassStatus.classList.add(
                "class-status-badge--active"
            );


            currentClassName.textContent =
                claseActual.titulo ||
                "Clase";


            currentClassTime.textContent =
                `${formatearHora(
                    claseActual.horaInicio
                )} - ${formatearHora(
                    claseActual.horaFin
                )}`;


            currentClassGroup.textContent =
                claseActual.lugar ||
                "Lugar no especificado";

        } else {

            currentClassStatus.textContent =
                "Sin clase";


            currentClassStatus.classList.remove(
                "class-status-badge--active"
            );


            currentClassStatus.classList.add(
                "class-status-badge--idle"
            );


            currentClassName.textContent =
                "No hay clase en curso";


            currentClassTime.textContent =
                "—";


            currentClassGroup.textContent =
                "—";

        }


        // --------------------------------------
        // MOSTRAR PRÓXIMA CLASE
        // --------------------------------------

        if (proximaClase) {

            nextClassName.textContent =
                proximaClase.titulo ||
                "Clase";


            nextClassTime.textContent =
                `${formatearHora(
                    proximaClase.horaInicio
                )} - ${formatearHora(
                    proximaClase.horaFin
                )}`;


            nextClassGroup.textContent =
                proximaClase.lugar ||
                "Lugar no especificado";

        } else {

            nextClassName.textContent =
                "Sin clases próximas";


            nextClassTime.textContent =
                "—";


            nextClassGroup.textContent =
                "—";

        }

    }


    // ==========================================
    // MOSTRAR HORARIO DEL DÍA
    // ==========================================

    function mostrarHorarioHoy(
        eventos
    ) {

        const hoy =
            obtenerFechaLocal();


        if (scheduleDate) {

            scheduleDate.textContent =
                formatearFecha(hoy);

        }


        if (!todaySchedule) {

            return;
        }


        const eventosOrdenados =
            [...eventos].sort(
                (a, b) =>
                    horaAMinutos(a.horaInicio) -
                    horaAMinutos(b.horaInicio)
            );


        if (eventosOrdenados.length === 0) {

            todaySchedule.innerHTML =
                `
                <div class="dashboard-schedule__empty">

                    No hay clases programadas para hoy.

                </div>
                `;

            return;
        }


        todaySchedule.innerHTML =
            "";


        eventosOrdenados.forEach(
            evento => {

                const item =
                    document.createElement(
                        "article"
                    );


                item.className =
                    "dashboard-schedule__item";


                item.innerHTML =
                    `
                    <div class="dashboard-schedule__time">

                        <strong>
                            ${formatearHora(
                        evento.horaInicio
                    )}
                        </strong>

                        <span>
                            ${formatearHora(
                        evento.horaFin
                    )}
                        </span>

                    </div>


                    <div class="dashboard-schedule__info">

                        <strong>
                            ${escapeHtml(
                        evento.titulo ||
                        "Clase"
                    )}
                        </strong>

                        <span>
                            ${escapeHtml(
                        evento.lugar ||
                        "Lugar no especificado"
                    )}
                        </span>

                    </div>


                    <span class="dashboard-schedule__status">

                        ${escapeHtml(
                        evento.estado ||
                        ""
                    )}

                    </span>
                    `;


                todaySchedule.appendChild(
                    item
                );

            }
        );

    }


    // ==========================================
    // ESCAPAR HTML
    // ==========================================

    function escapeHtml(valor) {

        if (
            valor === null ||
            valor === undefined
        ) {

            return "";
        }


        return String(valor)

            .replace(
                /&/g,
                "&amp;"
            )

            .replace(
                /</g,
                "&lt;"
            )

            .replace(
                />/g,
                "&gt;"
            )

            .replace(
                /"/g,
                "&quot;"
            )

            .replace(
                /'/g,
                "&#039;"
            );

    }


    // ==========================================
    // FILTRO DE ASISTENCIA
    // ==========================================

    if (attendanceGroupFilter) {

        attendanceGroupFilter.addEventListener(
            "change",
            function () {

                cargarAsistenciaSemanal(
                    this.value
                );

            }
        );

    }


    // ==========================================
    // MENÚ DEL PERFIL
    // ==========================================

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


                const abierto =
                    !profileMenu.hasAttribute(
                        "hidden"
                    );


                if (abierto) {

                    profileMenu.setAttribute(
                        "hidden",
                        ""
                    );


                    profileMenuButton.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                } else {

                    profileMenu.removeAttribute(
                        "hidden"
                    );


                    profileMenuButton.setAttribute(
                        "aria-expanded",
                        "true"
                    );

                }

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

                    profileMenu.setAttribute(
                        "hidden",
                        ""
                    );


                    profileMenuButton.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                }

            }
        );

    }


    // ==========================================
    // INICIALIZAR DASHBOARD
    // ==========================================

    async function inicializarDashboard() {

        try {

            /*
             * Cargar estudiantes y grupos
             * en paralelo.
             */

            const [
                estudiantes,
                grupos
            ] = await Promise.all([

                cargarEstudiantes(),

                cargarGrupos()

            ]);


            // ----------------------------------
            // GRÁFICO DE CINTURONES
            // ----------------------------------

            cargarDistribucionCinturones(
                estudiantes
            );


            // ----------------------------------
            // ASISTENCIA SEMANAL
            // ----------------------------------

            await cargarAsistenciaSemanal(
                "TODOS"
            );


            // ----------------------------------
            // EVENTOS DEL DÍA
            // ----------------------------------

            await cargarEventosHoy();


        } catch (error) {

            console.error(
                "Error al inicializar dashboard:",
                error
            );

        }

    }


    // ==========================================
    // INICIAR DASHBOARD
    // ==========================================

    inicializarDashboard();

});