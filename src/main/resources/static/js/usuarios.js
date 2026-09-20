document.addEventListener("DOMContentLoaded", async function () {

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
    // ELEMENTOS
    // ==========================================

    const usernameDisplay =
        document.getElementById("usernameDisplay");

    const usuariosTableBody =
        document.getElementById("usuariosTableBody");

    const usuariosMessage =
        document.getElementById("usuariosMessage");

    const estadoFiltro =
        document.getElementById("estadoFiltro");


    // ==========================================
    // VERIFICAR SESIÓN
    // ==========================================

    if (!auth || !username || !rol) {

        window.location.href = "/login";

        return;
    }


    usernameDisplay.textContent = username;


    // ==========================================
    // VERIFICAR ROL
    // ==========================================

    if (rol !== "ADMIN") {

        usuariosMessage.textContent =
            "No tienes permisos para acceder a esta sección.";

        return;
    }


    // ==========================================
    // CARGAR ESTUDIANTES
    // ==========================================

    async function cargarEstudiantes() {

        const response =
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


        if (response.status === 401) {

            sessionStorage.clear();

            window.location.href = "/login";

            return [];
        }


        if (response.status === 403) {

            throw new Error(
                "No tienes permisos para consultar estudiantes."
            );
        }


        if (!response.ok) {

            throw new Error(
                "No se pudieron obtener los estudiantes."
            );
        }


        return await response.json();

    }


    // ==========================================
    // CREAR SELECTOR DE ESTUDIANTE
    // ==========================================

    function crearSelectorEstudiante(usuario, estudiantes) {

        let opciones = `
            <option value="">
                Seleccionar estudiante
            </option>
        `;


        estudiantes.forEach(function (estudiante) {

            opciones += `
                <option value="${estudiante.id}">
                    ${estudiante.nombre} ${estudiante.apellido}
                    (ID: ${estudiante.id})
                </option>
            `;

        });


        return `
            <select
                class="estudiante-select"
                data-id="${usuario.id}">

                ${opciones}

            </select>

            <button
                type="button"
                class="btn btn--primary btn-vincular"
                data-id="${usuario.id}">
                Vincular
            </button>
        `;

    }


    // ==========================================
    // CARGAR USUARIOS
    // ==========================================

    async function cargarUsuarios() {

        try {

            const estado =
                estadoFiltro.value;

            let url = "/api/usuarios";

            if (estado) {

                url +=
                    "?estado=" +
                    encodeURIComponent(estado);
            }


            // ==========================================
            // OBTENER USUARIOS
            // ==========================================

            const response =
                await fetch(
                    url,
                    {
                        method: "GET",

                        headers: {
                            "Authorization":
                                "Basic " + auth
                        }
                    }
                );


            console.log(
                "Usuarios status:",
                response.status
            );


            if (response.status === 401) {

                sessionStorage.clear();

                window.location.href = "/login";

                return;
            }


            if (response.status === 403) {

                usuariosMessage.textContent =
                    "No tienes permisos para ver los usuarios.";

                return;
            }


            if (!response.ok) {

                throw new Error(
                    "No se pudieron obtener los usuarios."
                );
            }


            const usuarios =
                await response.json();


            console.log(
                "Usuarios:",
                usuarios
            );


            usuariosTableBody.innerHTML = "";


            if (usuarios.length === 0) {

                usuariosMessage.textContent =
                    "No hay usuarios con este estado.";

                return;
            }


            usuariosMessage.textContent =
                `Usuarios encontrados: ${usuarios.length}`;


            // ==========================================
            // OBTENER ESTUDIANTES
            // ==========================================

            const estudiantes =
                await cargarEstudiantes();


            console.log(
                "Estudiantes:",
                estudiantes
            );


            // ==========================================
            // CREAR FILAS
            // ==========================================

            usuarios.forEach(function (usuario) {

                const fila =
                    document.createElement("tr");


                // ==========================================
                // BOTÓN ESTADO
                // ==========================================

                let botonEstado = "";

                if (usuario.estado === "ACTIVO") {

                    botonEstado = `
                        <button
                            type="button"
                            class="btn btn--logout btn-estado"
                            data-id="${usuario.id}"
                            data-estado="INACTIVO">
                            Desactivar
                        </button>
                    `;

                } else {

                    botonEstado = `
                        <button
                            type="button"
                            class="btn btn--primary btn-estado"
                            data-id="${usuario.id}"
                            data-estado="ACTIVO">
                            Activar
                        </button>
                    `;
                }


                // ==========================================
                // SELECTOR DE ROL
                // ==========================================

                const selectorRol = `
                    <select
                        class="rol-select"
                        data-id="${usuario.id}">

                        <option
                            value="ADMIN"
                            ${usuario.rol === "ADMIN" ? "selected" : ""}>
                            ADMIN
                        </option>

                        <option
                            value="SECRETARIA"
                            ${usuario.rol === "SECRETARIA" ? "selected" : ""}>
                            SECRETARIA
                        </option>

                        <option
                            value="SENSEI"
                            ${usuario.rol === "SENSEI" ? "selected" : ""}>
                            SENSEI
                        </option>

                        <option
                            value="ESTUDIANTE"
                            ${usuario.rol === "ESTUDIANTE" ? "selected" : ""}>
                            ESTUDIANTE
                        </option>

                    </select>

                    <button
                        type="button"
                        class="btn btn--accent btn-rol"
                        data-id="${usuario.id}">
                        Cambiar
                    </button>
                `;


                // ==========================================
                // VINCULAR ESTUDIANTE
                // ==========================================

                let vinculacion = "-";


                if (usuario.rol === "ESTUDIANTE") {

                    vinculacion =
                        crearSelectorEstudiante(
                            usuario,
                            estudiantes
                        );
                }


                // ==========================================
                // FILA
                // ==========================================

                fila.innerHTML = `
                    <td>${usuario.id}</td>

                    <td>${usuario.username}</td>

                    <td>
                        ${usuario.nombre}
                        ${usuario.apellido}
                    </td>

                    <td>${usuario.correo}</td>

                    <td>
                        ${selectorRol}
                    </td>

                    <td>${usuario.estado}</td>

                    <td>
                        ${vinculacion}
                    </td>

                    <td>
                        ${botonEstado}
                    </td>
                `;


                usuariosTableBody.appendChild(fila);

            });


            // ==========================================
            // EVENTOS DE ESTADO
            // ==========================================

            const botonesEstado =
                document.querySelectorAll(".btn-estado");


            botonesEstado.forEach(function (boton) {

                boton.addEventListener(
                    "click",
                    cambiarEstadoUsuario
                );

            });


            // ==========================================
            // EVENTOS DE ROL
            // ==========================================

            const botonesRol =
                document.querySelectorAll(".btn-rol");


            botonesRol.forEach(function (boton) {

                boton.addEventListener(
                    "click",
                    cambiarRolUsuario
                );

            });


            // ==========================================
            // EVENTOS DE VINCULACIÓN
            // ==========================================

            const botonesVincular =
                document.querySelectorAll(".btn-vincular");


            botonesVincular.forEach(function (boton) {

                boton.addEventListener(
                    "click",
                    vincularEstudiante
                );

            });


        } catch (error) {

            console.error(
                "Error cargando usuarios:",
                error
            );

            usuariosMessage.textContent =
                "No se pudieron cargar los usuarios.";

        }

    }


    // ==========================================
    // CAMBIAR ESTADO
    // ==========================================

    async function cambiarEstadoUsuario(event) {

        const boton =
            event.currentTarget;

        const usuarioId =
            boton.dataset.id;

        const nuevoEstado =
            boton.dataset.estado;


        try {

            boton.disabled = true;


            const response =
                await fetch(
                    `/api/usuarios/${usuarioId}/estado?estado=${nuevoEstado}`,
                    {
                        method: "PATCH",

                        headers: {
                            "Authorization":
                                "Basic " + auth
                        }
                    }
                );


            console.log(
                "Cambiar estado status:",
                response.status
            );


            if (response.status === 401) {

                sessionStorage.clear();

                window.location.href = "/login";

                return;
            }


            if (response.status === 403) {

                alert(
                    "No tienes permisos para cambiar el estado."
                );

                boton.disabled = false;

                return;
            }


            if (!response.ok) {

                alert(
                    "No se pudo cambiar el estado del usuario."
                );

                boton.disabled = false;

                return;
            }


            const usuarioActualizado =
                await response.json();


            console.log(
                "Usuario actualizado:",
                usuarioActualizado
            );


            await cargarUsuarios();


        } catch (error) {

            console.error(
                "Error cambiando estado:",
                error
            );

            alert(
                "No se pudo conectar con el servidor."
            );

            boton.disabled = false;

        }

    }


    // ==========================================
    // CAMBIAR ROL
    // ==========================================

    async function cambiarRolUsuario(event) {

        const boton =
            event.currentTarget;

        const usuarioId =
            boton.dataset.id;

        const selector =
            document.querySelector(
                `.rol-select[data-id="${usuarioId}"]`
            );

        const nuevoRol =
            selector.value;


        const confirmar =
            confirm(
                `¿Cambiar el rol de este usuario a ${nuevoRol}?`
            );


        if (!confirmar) {

            return;
        }


        try {

            boton.disabled = true;


            const response =
                await fetch(
                    `/api/usuarios/${usuarioId}/rol?rol=${nuevoRol}`,
                    {
                        method: "PATCH",

                        headers: {
                            "Authorization":
                                "Basic " + auth
                        }
                    }
                );


            console.log(
                "Cambiar rol status:",
                response.status
            );


            if (response.status === 401) {

                sessionStorage.clear();

                window.location.href = "/login";

                return;
            }


            if (response.status === 403) {

                alert(
                    "No tienes permisos para cambiar el rol."
                );

                boton.disabled = false;

                return;
            }


            if (!response.ok) {

                const errorText =
                    await response.text();

                console.error(
                    "Error:",
                    errorText
                );

                alert(
                    "No se pudo cambiar el rol del usuario."
                );

                boton.disabled = false;

                return;
            }


            const usuarioActualizado =
                await response.json();


            console.log(
                "Usuario con rol actualizado:",
                usuarioActualizado
            );


            alert(
                `Rol actualizado a ${usuarioActualizado.rol}.`
            );


            await cargarUsuarios();


        } catch (error) {

            console.error(
                "Error cambiando rol:",
                error
            );

            alert(
                "No se pudo conectar con el servidor."
            );

            boton.disabled = false;

        }

    }


    // ==========================================
    // VINCULAR ESTUDIANTE
    // ==========================================

    async function vincularEstudiante(event) {

        const boton =
            event.currentTarget;

        const usuarioId =
            boton.dataset.id;

        const selector =
            document.querySelector(
                `.estudiante-select[data-id="${usuarioId}"]`
            );


        const estudianteId =
            selector.value;


        // ==========================================
        // VALIDACIÓN
        // ==========================================

        if (!estudianteId) {

            alert(
                "Selecciona un estudiante."
            );

            return;
        }


        const confirmar =
            confirm(
                "¿Deseas vincular este usuario con el estudiante seleccionado?"
            );


        if (!confirmar) {

            return;
        }


        try {

            boton.disabled = true;


            const response =
                await fetch(
                    `/api/usuarios/${usuarioId}/estudiante/${estudianteId}`,
                    {
                        method: "PATCH",

                        headers: {
                            "Authorization":
                                "Basic " + auth
                        }
                    }
                );


            console.log(
                "Vincular estudiante status:",
                response.status
            );


            // ==========================================
            // NO AUTENTICADO
            // ==========================================

            if (response.status === 401) {

                sessionStorage.clear();

                window.location.href = "/login";

                return;
            }


            // ==========================================
            // SIN PERMISOS
            // ==========================================

            if (response.status === 403) {

                alert(
                    "No tienes permisos para vincular estudiantes."
                );

                boton.disabled = false;

                return;
            }


            // ==========================================
            // ERROR
            // ==========================================

            if (!response.ok) {

                const errorText =
                    await response.text();

                console.error(
                    "Error:",
                    errorText
                );

                alert(
                    "No se pudo vincular el estudiante."
                );

                boton.disabled = false;

                return;
            }


            // ==========================================
            // ÉXITO
            // ==========================================

            const usuarioActualizado =
                await response.json();


            console.log(
                "Usuario vinculado:",
                usuarioActualizado
            );


            alert(
                "Estudiante vinculado correctamente."
            );


            await cargarUsuarios();


        } catch (error) {

            console.error(
                "Error vinculando estudiante:",
                error
            );

            alert(
                "No se pudo conectar con el servidor."
            );

            boton.disabled = false;

        }

    }


    // ==========================================
    // FILTRO
    // ==========================================

    estadoFiltro.addEventListener(
        "change",
        cargarUsuarios
    );


    // ==========================================
    // CARGA INICIAL
    // ==========================================

    await cargarUsuarios();

});