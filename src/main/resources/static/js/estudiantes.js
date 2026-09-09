document.addEventListener("DOMContentLoaded", function () {

    const auth = sessionStorage.getItem("kihonAuth");
    const username = sessionStorage.getItem("kihonUsername");


    /*
     * ELEMENTOS DEL DOM
     */

    const usernameDisplay =
        document.getElementById("usernameDisplay");

    const studentsList =
        document.getElementById("studentsList");

    const studentsCount =
        document.getElementById("studentsCount");

    const studentsMessage =
        document.getElementById("studentsMessage");

    const studentForm =
        document.getElementById("studentForm");

    const studentMessage =
        document.getElementById("studentMessage");

    const editStudentSection =
        document.getElementById("editStudentSection");

    const editStudentForm =
        document.getElementById("editStudentForm");

    const editStudentMessage =
        document.getElementById("editStudentMessage");

    const cancelEditButton =
        document.getElementById("cancelEditButton");


    /*
     * VERIFICAR AUTENTICACIÓN
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
                "estudiantes-message estudiantes-message--success";

        } else {

            elemento.className =
                "estudiantes-message estudiantes-message--error";
        }
    }


    /*
     * LISTAR ESTUDIANTES
     */

    async function cargarEstudiantes() {

        try {

            const response = await fetch(
                "/api/estudiantes",
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            "Basic " + auth
                    }
                }
            );


            /*
             * SESIÓN EXPIRADA / NO AUTORIZADO
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
                    "No tienes permisos para consultar estudiantes."
                );
            }


            /*
             * OTROS ERRORES
             */

            if (!response.ok) {

                throw new Error(
                    "No se pudieron obtener los estudiantes."
                );
            }


            const estudiantes =
                await response.json();


            /*
             * CONTADOR
             */

            studentsCount.textContent =
                `${estudiantes.length} estudiante${estudiantes.length !== 1 ? "s" : ""}`;


            /*
             * LISTA VACÍA
             */

            if (estudiantes.length === 0) {

                studentsList.innerHTML = `

                    <div class="estudiantes-empty">

                        No hay estudiantes registrados.

                    </div>

                `;

                return;
            }


            /*
             * TABLA
             */

            studentsList.innerHTML = `

                <table class="estudiantes-table">

                    <thead>

                        <tr>

                            <th>
                                Nombre
                            </th>

                            <th>
                                Documento
                            </th>

                            <th>
                                Contacto
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

                        ${estudiantes.map(estudiante => `

                            <tr>

                                <td>

                                    <span class="estudiante-nombre">

                                        ${estudiante.nombre}
                                        ${estudiante.apellido}

                                    </span>

                                </td>


                                <td>

                                    <span class="estudiante-documento">

                                        ${estudiante.documento}

                                    </span>

                                </td>


                                <td>

                                    <div class="estudiante-contacto">

                                        <span>
                                            ${estudiante.correo}
                                        </span>

                                        <span>
                                            ${estudiante.telefono || "Sin teléfono"}
                                        </span>

                                    </div>

                                </td>


                                <td>

                                    <span class="
                                        estudiante-estado
                                        ${estudiante.estado === "ACTIVO"
                    ? "estudiante-estado--activo"
                    : "estudiante-estado--inactivo"}
                                    ">

                                        ${estudiante.estado}

                                    </span>

                                </td>


                                <td>

                                    <div class="estudiante-acciones">


                                        <button
                                            type="button"
                                            class="btn btn--outline btn-editar"
                                            data-id="${estudiante.id}">

                                            Editar

                                        </button>


                                        <button
                                            type="button"
                                            class="btn btn--secondary btn-estado"
                                            data-id="${estudiante.id}"
                                            data-estado="${estudiante.estado}">

                                            ${estudiante.estado === "ACTIVO"
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
                "Error cargando estudiantes:",
                error
            );


            studentsList.innerHTML = `

                <div class="estudiantes-empty">

                    ${error.message}

                </div>

            `;
        }
    }


    /*
     * CREAR ESTUDIANTE
     */

    studentForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            studentMessage.hidden = true;


            const estudiante = {

                nombre:
                    document
                        .getElementById("nombre")
                        .value
                        .trim(),

                apellido:
                    document
                        .getElementById("apellido")
                        .value
                        .trim(),

                documento:
                    document
                        .getElementById("documento")
                        .value
                        .trim(),

                telefono:
                    document
                        .getElementById("telefono")
                        .value
                        .trim(),

                correo:
                    document
                        .getElementById("correo")
                        .value
                        .trim()
            };


            try {

                const response = await fetch(
                    "/api/estudiantes",
                    {
                        method: "POST",

                        headers: {

                            "Authorization":
                                "Basic " + auth,

                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(estudiante)
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
                        "No tienes permisos para registrar estudiantes."
                    );
                }


                if (!response.ok) {

                    const errorData =
                        await response.json();

                    throw new Error(
                        errorData.mensaje ||
                        "No se pudo registrar el estudiante."
                    );
                }


                const nuevoEstudiante =
                    await response.json();


                console.log(
                    "Estudiante creado:",
                    nuevoEstudiante
                );


                /*
                 * LIMPIAR FORMULARIO
                 */

                studentForm.reset();


                /*
                 * MOSTRAR MENSAJE
                 */

                mostrarMensaje(
                    studentMessage,
                    "Estudiante registrado correctamente.",
                    "success"
                );


                /*
                 * ACTUALIZAR TABLA
                 */

                await cargarEstudiantes();


            } catch (error) {

                console.error(
                    "Error registrando estudiante:",
                    error
                );


                mostrarMensaje(
                    studentMessage,
                    error.message,
                    "error"
                );
            }

        }
    );


    /*
     * BOTÓN EDITAR
     */

    document.addEventListener(
        "click",
        async function (event) {

            if (
                !event.target.classList
                    .contains("btn-editar")
            ) {

                return;
            }


            const id =
                event.target.dataset.id;


            try {

                const response =
                    await fetch(
                        `/api/estudiantes/${id}`,
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


                if (!response.ok) {

                    throw new Error(
                        "No se pudo obtener el estudiante."
                    );
                }


                const estudiante =
                    await response.json();


                /*
                 * CARGAR DATOS
                 */

                document.getElementById(
                    "editId"
                ).value =
                    estudiante.id;


                document.getElementById(
                    "editNombre"
                ).value =
                    estudiante.nombre;


                document.getElementById(
                    "editApellido"
                ).value =
                    estudiante.apellido;


                document.getElementById(
                    "editDocumento"
                ).value =
                    estudiante.documento;


                document.getElementById(
                    "editTelefono"
                ).value =
                    estudiante.telefono || "";


                document.getElementById(
                    "editCorreo"
                ).value =
                    estudiante.correo;


                /*
                 * MOSTRAR FORMULARIO
                 */

                editStudentSection.hidden =
                    false;


                editStudentMessage.hidden =
                    true;


                editStudentSection.scrollIntoView({
                    behavior: "smooth"
                });


            } catch (error) {

                console.error(
                    "Error obteniendo estudiante:",
                    error
                );


                alert(error.message);
            }

        }
    );


    /*
     * GUARDAR CAMBIOS
     */

    editStudentForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const id =
                document.getElementById(
                    "editId"
                ).value;


            const estudiante = {

                nombre:
                    document
                        .getElementById("editNombre")
                        .value
                        .trim(),

                apellido:
                    document
                        .getElementById("editApellido")
                        .value
                        .trim(),

                documento:
                    document
                        .getElementById("editDocumento")
                        .value
                        .trim(),

                telefono:
                    document
                        .getElementById("editTelefono")
                        .value
                        .trim(),

                correo:
                    document
                        .getElementById("editCorreo")
                        .value
                        .trim()
            };


            try {

                const response =
                    await fetch(
                        `/api/estudiantes/${id}`,
                        {
                            method: "PUT",

                            headers: {

                                "Authorization":
                                    "Basic " + auth,

                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(estudiante)
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
                        "No tienes permisos para editar estudiantes."
                    );
                }


                if (!response.ok) {

                    const errorData =
                        await response.json();

                    throw new Error(
                        errorData.mensaje ||
                        "No se pudo actualizar el estudiante."
                    );
                }


                const estudianteActualizado =
                    await response.json();


                console.log(
                    "Estudiante actualizado:",
                    estudianteActualizado
                );


                mostrarMensaje(
                    editStudentMessage,
                    "Estudiante actualizado correctamente.",
                    "success"
                );


                /*
                 * ACTUALIZAR TABLA
                 */

                await cargarEstudiantes();


            } catch (error) {

                console.error(
                    "Error actualizando estudiante:",
                    error
                );


                mostrarMensaje(
                    editStudentMessage,
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

            editStudentSection.hidden =
                true;

            editStudentForm.reset();

            editStudentMessage.hidden =
                true;

        }
    );


    /*
     * ACTIVAR / DESACTIVAR ESTUDIANTE
     */

    document.addEventListener(
        "click",
        async function (event) {

            if (
                !event.target.classList
                    .contains("btn-estado")
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
                        `/api/estudiantes/${id}/estado?estado=${nuevoEstado}`,
                        {
                            method: "PATCH",

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
                        "No tienes permisos para cambiar el estado."
                    );
                }


                if (!response.ok) {

                    const errorData =
                        await response.json();

                    throw new Error(
                        errorData.mensaje ||
                        "No se pudo cambiar el estado."
                    );
                }


                const estudiante =
                    await response.json();


                console.log(
                    "Estado actualizado:",
                    estudiante
                );


                /*
                 * ACTUALIZAR TABLA
                 */

                await cargarEstudiantes();


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

    cargarEstudiantes();

});