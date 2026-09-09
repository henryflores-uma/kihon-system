document.addEventListener("DOMContentLoaded", function () {

    /*
     * AUTENTICACIÓN
     */

    const auth = sessionStorage.getItem("kihonAuth");
    const username = sessionStorage.getItem("kihonUsername");


    /*
     * ELEMENTOS DEL DOM
     */

    const usernameDisplay =
        document.getElementById("usernameDisplay");

    const attendanceForm =
        document.getElementById("attendanceForm");

    const attendanceMessage =
        document.getElementById("attendanceMessage");

    const studentSelect =
        document.getElementById("estudianteId");

    const groupSelect =
        document.getElementById("grupoId");

    const stateSelect =
        document.getElementById("estado");

    const timeInput =
        document.getElementById("horaLlegada");

    const attendanceList =
        document.getElementById("attendanceList");

    const attendanceCount =
        document.getElementById("attendanceCount");


    /*
     * VERIFICAR SESIÓN
     */

    if (!auth || !username) {

        window.location.href = "/login";

        return;
    }


    usernameDisplay.textContent = username;


    /*
     * FECHA ACTUAL
     */

    const today =
        new Date().toISOString().split("T")[0];

    document.getElementById("fechaConsulta").value =
        today;


    /*
     * MOSTRAR MENSAJE
     */

    function mostrarMensaje(mensaje, tipo) {

        attendanceMessage.textContent =
            mensaje;

        attendanceMessage.hidden =
            false;

        if (tipo === "success") {

            attendanceMessage.className =
                "asistencia-message asistencia-message--success";

        } else {

            attendanceMessage.className =
                "asistencia-message asistencia-message--error";
        }
    }


    /*
     * LIMPIAR MENSAJE
     */

    function ocultarMensaje() {

        attendanceMessage.hidden =
            true;

        attendanceMessage.textContent =
            "";
    }


    /*
     * MANEJAR RESPUESTAS DE AUTENTICACIÓN
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
     * CARGAR ESTUDIANTES
     */

    async function cargarEstudiantes() {

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


            if (response.status === 403) {

                throw new Error(
                    "No tienes permisos para consultar estudiantes."
                );
            }


            if (!response.ok) {

                throw new Error(
                    "No se pudieron cargar los estudiantes."
                );
            }


            const estudiantes =
                await response.json();


            studentSelect.innerHTML = `
                <option value="">
                    Selecciona un estudiante
                </option>
            `;


            estudiantes.forEach(estudiante => {

                const option =
                    document.createElement("option");

                option.value =
                    estudiante.id;

                option.textContent =
                    `${estudiante.nombre} ${estudiante.apellido}`;

                studentSelect.appendChild(
                    option
                );

            });


        } catch (error) {

            console.error(
                "Error cargando estudiantes:",
                error
            );

            mostrarMensaje(
                error.message,
                "error"
            );
        }
    }


    /*
     * CARGAR GRUPOS
     */

    async function cargarGrupos() {

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


            if (response.status === 403) {

                throw new Error(
                    "No tienes permisos para consultar grupos."
                );
            }


            if (!response.ok) {

                throw new Error(
                    "No se pudieron cargar los grupos."
                );
            }


            const grupos =
                await response.json();


            groupSelect.innerHTML = `
                <option value="">
                    Selecciona un grupo
                </option>
            `;


            grupos.forEach(grupo => {

                const option =
                    document.createElement("option");

                option.value =
                    grupo.id;

                option.textContent =
                    `${grupo.nombre} (${grupo.horaInicio.substring(0, 5)} - ${grupo.horaFin.substring(0, 5)})`;

                groupSelect.appendChild(
                    option
                );

            });


        } catch (error) {

            console.error(
                "Error cargando grupos:",
                error
            );

            mostrarMensaje(
                error.message,
                "error"
            );
        }
    }


    /*
     * CAMBIAR HORA SEGÚN ESTADO
     */

    function actualizarCampoHora() {

        if (
            stateSelect.value === "AUSENTE"
        ) {

            timeInput.value = "";

            timeInput.disabled = true;

            timeInput.required = false;

        } else {

            timeInput.disabled = false;

            timeInput.required = true;
        }
    }


    stateSelect.addEventListener(
        "change",
        actualizarCampoHora
    );


    /*
     * REGISTRAR ASISTENCIA
     */

    attendanceForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            ocultarMensaje();


            const asistencia = {

                estudianteId:
                    Number(
                        studentSelect.value
                    ),

                grupoId:
                    Number(
                        groupSelect.value
                    ),

                fecha:
                    document
                        .getElementById("fecha")
                        .value,

                horaLlegada:
                    timeInput.value || null,

                estado:
                    stateSelect.value,

                observacion:
                    document
                        .getElementById("observacion")
                        .value
                        .trim()
            };


            /*
             * VALIDACIÓN BÁSICA
             */

            if (
                !asistencia.estudianteId ||
                !asistencia.grupoId ||
                !asistencia.fecha ||
                !asistencia.estado
            ) {

                mostrarMensaje(
                    "Completa todos los campos obligatorios.",
                    "error"
                );

                return;
            }


            try {

                const response =
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
                                JSON.stringify(asistencia)
                        }
                    );


                /*
                 * AUTENTICACIÓN
                 */

                if (
                    !verificarAutorizacion(
                        response
                    )
                ) {

                    return;
                }


                /*
                 * PERMISOS
                 */

                if (response.status === 403) {

                    throw new Error(
                        "No tienes permisos para registrar asistencias."
                    );
                }


                /*
                 * ERROR DEL BACKEND
                 */

                if (!response.ok) {

                    const errorData =
                        await response.json();

                    throw new Error(
                        errorData.mensaje ||
                        "No se pudo registrar la asistencia."
                    );
                }


                const nuevaAsistencia =
                    await response.json();


                console.log(
                    "Asistencia registrada:",
                    nuevaAsistencia
                );


                /*
                 * MENSAJE
                 */

                mostrarMensaje(
                    "Asistencia registrada correctamente.",
                    "success"
                );


                /*
                 * LIMPIAR CAMPOS
                 */

                studentSelect.value = "";

                groupSelect.value = "";

                stateSelect.value =
                    "PRESENTE";

                timeInput.disabled =
                    false;

                timeInput.required =
                    true;

                timeInput.value = "";

                document.getElementById(
                    "observacion"
                ).value = "";


                /*
                 * ACTUALIZAR LISTA
                 */

                await cargarAsistencias();


            } catch (error) {

                console.error(
                    "Error registrando asistencia:",
                    error
                );


                mostrarMensaje(
                    error.message,
                    "error"
                );
            }

        }
    );


    /*
     * CARGAR ASISTENCIAS DEL DÍA
     */

    async function cargarAsistencias() {

        try {

            const fecha =
                document
                    .getElementById("fechaConsulta")
                    .value;


            if (!fecha) {
                return;
            }


            attendanceList.innerHTML = `

                <div class="asistencia-loading">

                    Cargando asistencias...

                </div>

            `;


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


            /*
             * AUTENTICACIÓN
             */

            if (
                !verificarAutorizacion(
                    response
                )
            ) {

                return;
            }


            if (response.status === 403) {

                throw new Error(
                    "No tienes permisos para consultar asistencias."
                );
            }


            if (!response.ok) {

                throw new Error(
                    "No se pudieron obtener las asistencias."
                );
            }


            const asistencias =
                await response.json();


            /*
             * CONTADOR
             */

            attendanceCount.textContent =
                `${asistencias.length} asistencia${asistencias.length !== 1 ? "s" : ""}`;


            /*
             * SIN REGISTROS
             */

            if (asistencias.length === 0) {

                attendanceList.innerHTML = `

                    <div class="asistencia-empty">

                        No hay asistencias registradas
                        para esta fecha.

                    </div>

                `;

                return;
            }


            /*
             * OBTENER NOMBRES
             *
             * El endpoint de asistencia devuelve
             * los IDs relacionados.
             */

            const estudiantesResponse =
                await fetch(
                    "/api/estudiantes",
                    {
                        method: "GET",

                        headers: {
                            "Authorization":
                                "Basic " + auth
                        }
                    }
                );


            if (!estudiantesResponse.ok) {

                throw new Error(
                    "No se pudieron obtener los estudiantes."
                );
            }


            const estudiantes =
                await estudiantesResponse.json();


            const gruposResponse =
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


            if (!gruposResponse.ok) {

                throw new Error(
                    "No se pudieron obtener los grupos."
                );
            }


            const grupos =
                await gruposResponse.json();


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

                        </tr>

                    </thead>


                    <tbody>

                        ${asistencias.map(asistencia => {

                const estudiante =
                    estudiantes.find(
                        estudiante =>
                            estudiante.id ===
                            asistencia.estudianteId
                    );


                const grupo =
                    grupos.find(
                        grupo =>
                            grupo.id ===
                            asistencia.grupoId
                    );


                return `

                                <tr>

                                    <td>

                                        ${estudiante
                        ? `${estudiante.nombre} ${estudiante.apellido}`
                        : `ID ${asistencia.estudianteId}`}

                                    </td>


                                    <td>

                                        ${grupo
                        ? grupo.nombre
                        : `ID ${asistencia.grupoId}`}

                                    </td>


                                    <td>

                                        ${asistencia.fecha}

                                    </td>


                                    <td>

                                        ${asistencia.horaLlegada
                        ? asistencia.horaLlegada.substring(0, 5)
                        : "-"}

                                    </td>


                                    <td>

                                        <span class="
                                            asistencia-estado
                                            asistencia-estado--${asistencia.estado.toLowerCase()}
                                        ">

                                            ${asistencia.estado}

                                        </span>

                                    </td>


                                    <td>

                                        ${asistencia.observacion || "-"}

                                    </td>

                                </tr>

                            `;

            }).join("")}

                    </tbody>

                </table>

            `;


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
     * CAMBIAR FECHA
     */

    document
        .getElementById("fechaConsulta")
        .addEventListener(
            "change",
            cargarAsistencias
        );


    /*
     * CARGA INICIAL
     */

    cargarEstudiantes();

    cargarGrupos();

    cargarAsistencias();

    actualizarCampoHora();

});