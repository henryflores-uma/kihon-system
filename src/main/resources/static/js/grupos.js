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

    const groupForm =
        document.getElementById("groupForm");

    const groupMessage =
        document.getElementById("groupMessage");

    const groupsList =
        document.getElementById("groupsList");

    const groupsCount =
        document.getElementById("groupsCount");

    const editGroupSection =
        document.getElementById("editGroupSection");

    const editGroupForm =
        document.getElementById("editGroupForm");

    const editGroupMessage =
        document.getElementById("editGroupMessage");

    const cancelEditButton =
        document.getElementById("cancelEditButton");


    /*
     * VERIFICAR SESIÓN
     */

    if (!auth || !username) {

        window.location.href = "/login";

        return;
    }


    usernameDisplay.textContent = username;


    /*
     * MOSTRAR MENSAJE
     */

    function mostrarMensaje(elemento, mensaje, tipo) {

        elemento.textContent = mensaje;

        elemento.hidden = false;

        if (tipo === "success") {

            elemento.className =
                "grupos-message grupos-message--success";

        } else {

            elemento.className =
                "grupos-message grupos-message--error";
        }
    }


    /*
     * FORMATEAR HORA
     */

    function formatearHora(hora) {

        if (!hora) {
            return "-";
        }

        return hora.substring(0, 5);
    }


    /*
     * CARGAR GRUPOS
     */

    async function cargarGrupos() {

        groupsList.innerHTML = `

            <div class="grupos-loading">

                Cargando grupos...

            </div>

        `;


        try {

            const response = await fetch(
                "/api/grupos",
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            "Basic " + auth
                    }
                }
            );


            /*
             * SESIÓN NO AUTORIZADA
             */

            if (response.status === 401) {

                sessionStorage.clear();

                window.location.href = "/login";

                return;
            }


            /*
             * SIN PERMISOS
             */

            if (response.status === 403) {

                throw new Error(
                    "No tienes permisos para consultar grupos."
                );
            }


            /*
             * OTROS ERRORES
             */

            if (!response.ok) {

                throw new Error(
                    "No se pudieron obtener los grupos."
                );
            }


            const grupos =
                await response.json();


            /*
             * CONTADOR
             */

            groupsCount.textContent =
                `${grupos.length} grupo${grupos.length !== 1 ? "s" : ""}`;


            /*
             * LISTA VACÍA
             */

            if (grupos.length === 0) {

                groupsList.innerHTML = `

                    <div class="grupos-empty">

                        No hay grupos registrados.

                    </div>

                `;

                return;
            }


            /*
             * TABLA
             */

            groupsList.innerHTML = `

                <table class="grupos-table">

                    <thead>

                        <tr>

                            <th>
                                Grupo
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

                        ${grupos.map(grupo => `

                            <tr>

                                <td>

                                    <div class="grupo-info">

                                        <span class="grupo-nombre">

                                            ${grupo.nombre}

                                        </span>

                                        <span class="grupo-descripcion">

                                            ${grupo.descripcion || "Sin descripción"}

                                        </span>

                                    </div>

                                </td>


                                <td>

                                    <span class="grupo-horario">

                                        ${formatearHora(grupo.horaInicio)}
                                        -
                                        ${formatearHora(grupo.horaFin)}

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
                    : ""}
                                    ">

                                        ${grupo.cuposDisponibles}

                                    </span>

                                </td>


                                <td>

                                    <span class="
                                        grupo-estado
                                        ${grupo.estado === "ACTIVO"
                    ? "grupo-estado--activo"
                    : "grupo-estado--inactivo"}
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
                    : "Activar"}

                                        </button>


                                    </div>

                                </td>

                            </tr>

                        `).join("")}

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
     * CREAR GRUPO
     */

    groupForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            groupMessage.hidden = true;


            const grupo = {

                nombre:
                    document
                        .getElementById("nombre")
                        .value
                        .trim(),

                descripcion:
                    document
                        .getElementById("descripcion")
                        .value
                        .trim(),

                horaInicio:
                    document
                        .getElementById("horaInicio")
                        .value,

                horaFin:
                    document
                        .getElementById("horaFin")
                        .value,

                capacidad:
                    Number(
                        document
                            .getElementById("capacidad")
                            .value
                    )
            };


            try {

                const response = await fetch(
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
                            JSON.stringify(grupo)
                    }
                );


                /*
                 * NO AUTORIZADO
                 */

                if (response.status === 401) {

                    sessionStorage.clear();

                    window.location.href =
                        "/login";

                    return;
                }


                /*
                 * SIN PERMISOS
                 */

                if (response.status === 403) {

                    throw new Error(
                        "No tienes permisos para registrar grupos."
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
                        "No se pudo registrar el grupo."
                    );
                }


                const nuevoGrupo =
                    await response.json();


                console.log(
                    "Grupo creado:",
                    nuevoGrupo
                );


                /*
                 * LIMPIAR FORMULARIO
                 */

                groupForm.reset();


                /*
                 * MENSAJE
                 */

                mostrarMensaje(
                    groupMessage,
                    "Grupo registrado correctamente.",
                    "success"
                );


                /*
                 * ACTUALIZAR TABLA
                 */

                await cargarGrupos();

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
            }

        }
    );


    /*
     * EDITAR GRUPO
     */

    document.addEventListener(
        "click",
        async function (event) {

            if (
                !event.target.classList
                    .contains("btn-editar-grupo")
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


                /*
                 * SESIÓN NO AUTORIZADA
                 */

                if (response.status === 401) {

                    sessionStorage.clear();

                    window.location.href =
                        "/login";

                    return;
                }


                if (response.status === 403) {

                    throw new Error(
                        "No tienes permisos para editar grupos."
                    );
                }


                if (!response.ok) {

                    const errorData =
                        await response.json();

                    throw new Error(
                        errorData.mensaje ||
                        "No se pudo obtener el grupo."
                    );
                }


                const grupo =
                    await response.json();


                /*
                 * CARGAR DATOS
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
                    formatearHora(grupo.horaInicio);


                document.getElementById(
                    "editHoraFin"
                ).value =
                    formatearHora(grupo.horaFin);


                document.getElementById(
                    "editCapacidad"
                ).value =
                    grupo.capacidad;


                /*
                 * MOSTRAR FORMULARIO
                 */

                editGroupSection.hidden =
                    false;


                editGroupMessage.hidden =
                    true;


                editGroupSection.scrollIntoView({
                    behavior: "smooth"
                });


            } catch (error) {

                console.error(
                    "Error obteniendo grupo:",
                    error
                );


                alert(error.message);
            }

        }
    );


    /*
     * GUARDAR CAMBIOS DEL GRUPO
     */

    editGroupForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const id =
                document.getElementById(
                    "editId"
                ).value;


            const grupo = {

                nombre:
                    document
                        .getElementById("editNombre")
                        .value
                        .trim(),

                descripcion:
                    document
                        .getElementById("editDescripcion")
                        .value
                        .trim(),

                horaInicio:
                    document
                        .getElementById("editHoraInicio")
                        .value,

                horaFin:
                    document
                        .getElementById("editHoraFin")
                        .value,

                capacidad:
                    Number(
                        document
                            .getElementById("editCapacidad")
                            .value
                    )
            };


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
                                JSON.stringify(grupo)
                        }
                    );


                /*
                 * NO AUTORIZADO
                 */

                if (response.status === 401) {

                    sessionStorage.clear();

                    window.location.href =
                        "/login";

                    return;
                }


                /*
                 * SIN PERMISOS
                 */

                if (response.status === 403) {

                    throw new Error(
                        "No tienes permisos para editar grupos."
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
                        "No se pudo actualizar el grupo."
                    );
                }


                const grupoActualizado =
                    await response.json();


                console.log(
                    "Grupo actualizado:",
                    grupoActualizado
                );


                /*
                 * MENSAJE
                 */

                mostrarMensaje(
                    editGroupMessage,
                    "Grupo actualizado correctamente.",
                    "success"
                );


                /*
                 * ACTUALIZAR TABLA
                 */

                await cargarGrupos();


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
            }

        }
    );


    /*
     * CANCELAR EDICIÓN
     */

    cancelEditButton.addEventListener(
        "click",
        function () {

            editGroupSection.hidden =
                true;

            editGroupForm.reset();

            editGroupMessage.hidden =
                true;

        }
    );


    /*
     * ACTIVAR / DESACTIVAR GRUPO
     */

    document.addEventListener(
        "click",
        async function (event) {

            if (
                !event.target.classList
                    .contains("btn-estado-grupo")
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


                /*
                 * NO AUTORIZADO
                 */

                if (response.status === 401) {

                    sessionStorage.clear();

                    window.location.href =
                        "/login";

                    return;
                }


                /*
                 * SIN PERMISOS
                 */

                if (response.status === 403) {

                    throw new Error(
                        "No tienes permisos para cambiar el estado del grupo."
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
                        "No se pudo cambiar el estado del grupo."
                    );
                }


                const grupo =
                    await response.json();


                console.log(
                    "Estado del grupo actualizado:",
                    grupo
                );


                /*
                 * ACTUALIZAR TABLA
                 */

                await cargarGrupos();


            } catch (error) {

                console.error(
                    "Error cambiando estado:",
                    error
                );


                alert(error.message);
            }

        }
    );


    /*
     * CARGA INICIAL
     */

    cargarGrupos();

});