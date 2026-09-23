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
    // ELEMENTOS - TOPBAR / PERFIL
    // ==========================================

    const usernameDisplay =
        document.getElementById("usernameDisplay");

    const roleDisplay =
        document.getElementById("roleDisplay");

    const profileRoleDisplay =
        document.getElementById("profileRoleDisplay");

    const profileMenuContainer =
        document.getElementById("profileMenuContainer");

    const profileMenuButton =
        document.getElementById("profileMenuButton");

    const profileMenu =
        document.getElementById("profileMenu");

    const topbarLogoutButton =
        document.getElementById("topbarLogoutButton");

    const userProfileAvatar =
        document.getElementById("userProfileAvatar");

    const userAvatarInitial =
        document.getElementById("userAvatarInitial");


    // ==========================================
    // ELEMENTOS - USUARIOS
    // ==========================================

    const usuariosTableBody =
        document.getElementById("usuariosTableBody");

    const usuariosMessage =
        document.getElementById("usuariosMessage");

    const usuariosSearch =
        document.getElementById("usuariosSearch");

    const estadoFiltro =
        document.getElementById("estadoFiltro");

    const registrarUsuarioButton =
        document.getElementById("registrarUsuarioButton");


    // ==========================================
    // ELEMENTOS - ESTUDIANTES
    // ==========================================

    const estudiantesSearch =
        document.getElementById("estudiantesSearch");

    const estudiantesMessage =
        document.getElementById("estudiantesMessage");

    const estudiantesSinCuentaTableBody =
        document.getElementById(
            "estudiantesSinCuentaTableBody"
        );


    // ==========================================
    // ELEMENTOS - MODAL CREAR CUENTA
    // ==========================================

    const crearUsuarioModal =
        document.getElementById("crearUsuarioModal");

    const crearUsuarioModalOverlay =
        document.getElementById(
            "crearUsuarioModalOverlay"
        );

    const cerrarCrearUsuarioModal =
        document.getElementById(
            "cerrarCrearUsuarioModal"
        );

    const cancelarCrearUsuario =
        document.getElementById(
            "cancelarCrearUsuario"
        );

    const crearUsuarioForm =
        document.getElementById(
            "crearUsuarioForm"
        );

    const modalEstudianteId =
        document.getElementById(
            "modalEstudianteId"
        );

    const modalEstudianteNombre =
        document.getElementById(
            "modalEstudianteNombre"
        );

    const modalEstudianteDocumento =
        document.getElementById(
            "modalEstudianteDocumento"
        );

    const modalEstudianteCorreo =
        document.getElementById(
            "modalEstudianteCorreo"
        );

    const modalUsername =
        document.getElementById(
            "modalUsername"
        );

    const modalPassword =
        document.getElementById(
            "modalPassword"
        );

    const modalGenero =
        document.getElementById(
            "modalGenero"
        );

    const crearUsuarioMessage =
        document.getElementById(
            "crearUsuarioMessage"
        );

    const crearUsuarioSubmit =
        document.getElementById(
            "crearUsuarioSubmit"
        );


    // ==========================================
    // ELEMENTOS - MODAL REGISTRAR USUARIO
    // ==========================================

    const registrarUsuarioModal =
        document.getElementById(
            "registrarUsuarioModal"
        );

    const registrarUsuarioModalOverlay =
        document.getElementById(
            "registrarUsuarioModalOverlay"
        );

    const cerrarRegistrarUsuarioModal =
        document.getElementById(
            "cerrarRegistrarUsuarioModal"
        );

    const cancelarRegistrarUsuario =
        document.getElementById(
            "cancelarRegistrarUsuario"
        );

    const registroUsuarioForm =
        document.getElementById(
            "registroUsuarioForm"
        );


    // ==========================================
    // ELEMENTOS - MODAL EDITAR USUARIO
    // ==========================================

    const editarUsuarioModal =
        document.getElementById(
            "editarUsuarioModal"
        );

    const editarUsuarioModalOverlay =
        document.getElementById(
            "editarUsuarioModalOverlay"
        );

    const cerrarEditarUsuarioModal =
        document.getElementById(
            "cerrarEditarUsuarioModal"
        );

    const cancelarEditarUsuario =
        document.getElementById(
            "cancelarEditarUsuario"
        );

    const editarUsuarioForm =
        document.getElementById(
            "editarUsuarioForm"
        );

    const editarUsuarioId =
        document.getElementById(
            "editarUsuarioId"
        );

    const editarFoto =
        document.getElementById(
            "editarFoto"
        );

    const editarUsuarioFoto =
        document.getElementById(
            "editarUsuarioFoto"
        );

    const editarFotoInput =
        document.getElementById(
            "editarFotoInput"
        );

    const cambiarEditarFotoBtn =
        document.getElementById(
            "cambiarEditarFotoBtn"
        );

    const editarUsername =
        document.getElementById(
            "editarUsername"
        );

    const editarNombre =
        document.getElementById(
            "editarNombre"
        );

    const editarApellido =
        document.getElementById(
            "editarApellido"
        );

    const editarTipoDocumento =
        document.getElementById(
            "editarTipoDocumento"
        );

    const editarNumeroDocumento =
        document.getElementById(
            "editarNumeroDocumento"
        );

    const editarCodigoPais =
        document.getElementById(
            "editarCodigoPais"
        );

    const editarTelefono =
        document.getElementById(
            "editarTelefono"
        );

    const editarFechaNacimiento =
        document.getElementById(
            "editarFechaNacimiento"
        );

    const editarGenero =
        document.getElementById(
            "editarGenero"
        );

    const editarCorreo =
        document.getElementById(
            "editarCorreo"
        );

    const editarUsuarioMessage =
        document.getElementById(
            "editarUsuarioMessage"
        );

    const editarUsuarioSubmit =
        document.getElementById(
            "editarUsuarioSubmit"
        );


    // ==========================================
    // DATOS EN MEMORIA
    // ==========================================

    let usuarios = [];

    let estudiantes = [];

    /*
     * Guarda únicamente la nueva foto seleccionada
     * en el modal de edición.
     */
    let editarFotoSeleccionada = null;


    // ==========================================
    // VERIFICAR SESIÓN
    // ==========================================

    if (!auth || !username || !rol) {

        window.location.href = "/login";

        return;
    }


    // ==========================================
    // MOSTRAR DATOS DEL USUARIO EN TOPBAR
    // ==========================================

    if (usernameDisplay) {

        usernameDisplay.textContent =
            username;
    }


    if (roleDisplay) {

        roleDisplay.textContent =
            rol === "ADMIN"
                ? "Administrador"
                : rol;

    }


    if (profileRoleDisplay) {

        profileRoleDisplay.textContent =
            rol === "ADMIN"
                ? "Administrador"
                : rol;

    }


    if (userAvatarInitial) {

        userAvatarInitial.textContent =
            username
                ? username.charAt(0).toUpperCase()
                : "U";

    }


    // ==========================================
    // MENÚ DE PERFIL
    // ==========================================

    function abrirCerrarMenuPerfil() {

        if (!profileMenu || !profileMenuButton) {

            return;
        }


        const estaAbierto =
            !profileMenu.hidden;


        profileMenu.hidden =
            estaAbierto;


        profileMenuButton.setAttribute(
            "aria-expanded",
            String(!estaAbierto)
        );

    }


    function cerrarMenuPerfil() {

        if (!profileMenu || !profileMenuButton) {

            return;
        }


        profileMenu.hidden =
            true;


        profileMenuButton.setAttribute(
            "aria-expanded",
            "false"
        );

    }


    if (profileMenuButton) {

        profileMenuButton.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();

                abrirCerrarMenuPerfil();

            }
        );

    }


    if (profileMenu) {

        profileMenu.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();

            }
        );

    }


    document.addEventListener(
        "click",
        function (event) {

            if (
                profileMenuContainer &&
                !profileMenuContainer.contains(
                    event.target
                )
            ) {

                cerrarMenuPerfil();

            }

        }
    );


    // ==========================================
    // CERRAR SESIÓN
    // ==========================================

    function cerrarSesion() {

        sessionStorage.removeItem("kihonAuth");
        sessionStorage.removeItem("kihonUsername");
        sessionStorage.removeItem("kihonRol");

        window.location.href =
            "/login";

    }


    if (topbarLogoutButton) {

        topbarLogoutButton.addEventListener(
            "click",
            function () {

                cerrarSesion();

            }
        );

    }


    // ==========================================
    // VERIFICAR ROL
    // ==========================================

    if (rol !== "ADMIN") {

        if (usuariosMessage) {

            usuariosMessage.textContent =
                "No tienes permisos para acceder a esta sección.";

        }

        return;
    }


    // ==========================================
    // PETICIONES AUTENTICADAS
    // ==========================================

    async function fetchAutenticado(
        url,
        opciones = {}
    ) {

        const headers = {
            ...(opciones.headers || {}),
            "Authorization": "Basic " + auth
        };


        const response =
            await fetch(
                url,
                {
                    ...opciones,
                    headers
                }
            );


        if (response.status === 401) {

            sessionStorage.clear();

            window.location.href =
                "/login";

            return null;
        }


        return response;

    }


    // ==========================================
    // CARGAR USUARIOS
    // ==========================================

    async function cargarUsuarios() {

        const response =
            await fetchAutenticado(
                "/api/usuarios"
            );


        if (!response) {

            return false;
        }


        if (response.status === 403) {

            usuariosMessage.textContent =
                "No tienes permisos para ver los usuarios.";

            return false;
        }


        if (!response.ok) {

            throw new Error(
                "No se pudieron obtener los usuarios."
            );
        }


        usuarios =
            await response.json();


        return true;

    }


    // ==========================================
    // CARGAR ESTUDIANTES
    // ==========================================

    async function cargarEstudiantes() {

        const response =
            await fetchAutenticado(
                "/api/estudiantes"
            );


        if (!response) {

            return false;
        }


        if (response.status === 403) {

            estudiantesMessage.textContent =
                "No tienes permisos para consultar estudiantes.";

            return false;
        }


        if (!response.ok) {

            throw new Error(
                "No se pudieron obtener los estudiantes."
            );
        }


        estudiantes =
            await response.json();


        return true;

    }


    // ==========================================
    // CARGAR TODOS LOS DATOS
    // ==========================================

    async function cargarDatos() {

        try {

            usuariosMessage.textContent =
                "Cargando usuarios...";

            estudiantesMessage.textContent =
                "Cargando estudiantes...";


            const usuariosCargados =
                await cargarUsuarios();


            if (!usuariosCargados) {

                return;
            }


            const estudiantesCargados =
                await cargarEstudiantes();


            if (!estudiantesCargados) {

                return;
            }


            renderizarUsuarios();

            renderizarEstudiantesSinCuenta();

            actualizarAvatarUsuarioActual();

        } catch (error) {

            console.error(
                "Error cargando datos:",
                error
            );


            usuariosMessage.textContent =
                "No se pudieron cargar los usuarios.";

            estudiantesMessage.textContent =
                "No se pudieron cargar los estudiantes.";

        }

    }


    // ==========================================
    // ESCAPAR HTML
    // ==========================================

    function escaparHtml(valor) {

        if (
            valor === null ||
            valor === undefined
        ) {

            return "";
        }


        return String(valor)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    // ==========================================
    // OBTENER NOMBRES
    // ==========================================

    function nombreCompletoUsuario(usuario) {

        return `${usuario.nombre || ""} ${usuario.apellido || ""}`
            .trim();

    }


    function nombreCompletoEstudiante(estudiante) {

        return `${estudiante.nombre || ""} ${estudiante.apellido || ""}`
            .trim();

    }


    // ==========================================
    // OBTENER ESTUDIANTE DE UN USUARIO
    // ==========================================

    function obtenerEstudianteDeUsuario(usuario) {

        if (!usuario.estudianteId) {

            return null;
        }


        return estudiantes.find(
            function (estudiante) {

                return Number(estudiante.id) ===
                    Number(usuario.estudianteId);

            }
        ) || null;

    }


    // ==========================================
    // OBTENER FOTO EFECTIVA DEL USUARIO
    // ==========================================

    function obtenerFotoUsuario(usuario) {

        const estudiante =
            obtenerEstudianteDeUsuario(
                usuario
            );


        if (estudiante) {

            return (
                estudiante.fotoUrl ||
                estudiante.foto ||
                usuario.foto ||
                null
            );

        }


        return usuario.foto || null;

    }


    // ==========================================
    // CREAR HTML DE FOTO
    // ==========================================

    function generarFotoHtml(
        fotoUrl,
        nombre
    ) {

        if (!fotoUrl) {

            return `
                <div
                    class="topbar__avatar"
                    aria-label="Sin foto">

                    <span>
                        ${escaparHtml(
                (nombre || "U")
                    .charAt(0)
                    .toUpperCase()
            )}
                    </span>

                </div>
            `;

        }


        return `
            <div class="topbar__avatar">

                <img
                    src="${escaparHtml(fotoUrl)}"
                    alt="Foto de ${escaparHtml(nombre || "usuario")}"
                    style="width:100%;height:100%;object-fit:cover;border-radius:50%;">

            </div>
        `;

    }


    // ==========================================
    // ACTUALIZAR AVATAR DEL USUARIO ACTUAL
    // ==========================================

    function actualizarAvatarUsuarioActual() {

        if (!userProfileAvatar) {

            return;
        }


        const usuarioActual =
            usuarios.find(
                function (usuario) {

                    return usuario.username ===
                        username;

                }
            );


        if (!usuarioActual) {

            return;
        }


        const fotoUrl =
            obtenerFotoUsuario(
                usuarioActual
            );


        if (fotoUrl) {

            userProfileAvatar.innerHTML = `
                <img
                    src="${escaparHtml(fotoUrl)}"
                    alt="Foto de perfil"
                    style="width:100%;height:100%;object-fit:cover;border-radius:50%;">
            `;

        } else {

            userProfileAvatar.innerHTML = `
                <span>
                    ${escaparHtml(
                username
                    .charAt(0)
                    .toUpperCase()
            )}
                </span>
            `;

        }

    }


    // ==========================================
    // RENDERIZAR USUARIOS
    // ==========================================

    function renderizarUsuarios() {

        const textoBusqueda =
            usuariosSearch.value
                .trim()
                .toLowerCase();


        const estadoSeleccionado =
            estadoFiltro.value;


        const usuariosFiltrados =
            usuarios.filter(
                function (usuario) {

                    if (
                        estadoSeleccionado &&
                        usuario.estado !== estadoSeleccionado
                    ) {

                        return false;
                    }


                    if (!textoBusqueda) {

                        return true;
                    }


                    const nombre =
                        nombreCompletoUsuario(
                            usuario
                        ).toLowerCase();


                    const usernameUsuario =
                        (usuario.username || "")
                            .toLowerCase();


                    return (
                        nombre.includes(textoBusqueda) ||
                        usernameUsuario.includes(textoBusqueda)
                    );

                }
            );


        usuariosTableBody.innerHTML =
            "";


        if (
            usuariosFiltrados.length ===
            0
        ) {

            usuariosMessage.textContent =
                "No se encontraron usuarios.";

            return;
        }


        usuariosMessage.textContent =
            `Usuarios encontrados: ${usuariosFiltrados.length}`;


        usuariosFiltrados.forEach(
            function (usuario) {

                const fila =
                    document.createElement("tr");


                const fotoUrl =
                    obtenerFotoUsuario(
                        usuario
                    );


                let botonEstado;


                if (
                    usuario.estado ===
                    "ACTIVO"
                ) {

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


                const acciones = `

                    <div class="usuarios-actions">

                        ${botonEstado}

                        <button
                            type="button"
                            class="btn btn--accent btn-editar"
                            data-id="${usuario.id}">

                            Editar

                        </button>

                        <button
                            type="button"
                            class="btn btn--logout btn-eliminar"
                            data-id="${usuario.id}">

                            Eliminar

                        </button>

                    </div>

                `;


                fila.innerHTML = `

                    <td>
                        ${generarFotoHtml(
                    fotoUrl,
                    nombreCompletoUsuario(usuario)
                )}
                    </td>

                    <td>
                        ${escaparHtml(
                    usuario.username
                )}
                    </td>

                    <td>
                        ${escaparHtml(
                    nombreCompletoUsuario(
                        usuario
                    )
                )}
                    </td>

                    <td>
                        ${escaparHtml(
                    usuario.correo
                )}
                    </td>

                    <td>
                        ${escaparHtml(
                    usuario.rol
                )}
                    </td>

                    <td>
                        ${escaparHtml(
                    usuario.estado
                )}
                    </td>

                    <td>
                        ${acciones}
                    </td>

                `;


                usuariosTableBody.appendChild(
                    fila
                );

            }
        );


        document
            .querySelectorAll(".btn-estado")
            .forEach(
                function (boton) {

                    boton.addEventListener(
                        "click",
                        cambiarEstadoUsuario
                    );

                }
            );


        document
            .querySelectorAll(".btn-editar")
            .forEach(
                function (boton) {

                    boton.addEventListener(
                        "click",
                        editarUsuario
                    );

                }
            );


        document
            .querySelectorAll(".btn-eliminar")
            .forEach(
                function (boton) {

                    boton.addEventListener(
                        "click",
                        eliminarUsuario
                    );

                }
            );

    }


    // ==========================================
    // OBTENER ESTUDIANTES SIN CUENTA
    // ==========================================

    function obtenerEstudiantesSinCuenta() {

        const estudiantesConCuenta =
            new Set();


        usuarios.forEach(
            function (usuario) {

                if (usuario.estudianteId) {

                    estudiantesConCuenta.add(
                        Number(
                            usuario.estudianteId
                        )
                    );

                }

            }
        );


        return estudiantes.filter(
            function (estudiante) {

                return !estudiantesConCuenta.has(
                    Number(estudiante.id)
                );

            }
        );

    }


    // ==========================================
    // RENDERIZAR ESTUDIANTES SIN CUENTA
    // ==========================================

    function renderizarEstudiantesSinCuenta() {

        const textoBusqueda =
            estudiantesSearch.value
                .trim()
                .toLowerCase();


        const estudiantesSinCuenta =
            obtenerEstudiantesSinCuenta();


        const estudiantesFiltrados =
            estudiantesSinCuenta.filter(
                function (estudiante) {

                    if (!textoBusqueda) {

                        return true;
                    }


                    const nombre =
                        nombreCompletoEstudiante(
                            estudiante
                        ).toLowerCase();


                    const documento =
                        (
                            estudiante.documento ||
                            ""
                        ).toLowerCase();


                    const correo =
                        (
                            estudiante.correo ||
                            ""
                        ).toLowerCase();


                    const telefono =
                        (
                            estudiante.telefono ||
                            ""
                        ).toLowerCase();


                    return (
                        nombre.includes(
                            textoBusqueda
                        ) ||
                        documento.includes(
                            textoBusqueda
                        ) ||
                        correo.includes(
                            textoBusqueda
                        ) ||
                        telefono.includes(
                            textoBusqueda
                        )
                    );

                }
            );


        estudiantesSinCuentaTableBody.innerHTML =
            "";


        if (
            estudiantesFiltrados.length ===
            0
        ) {

            estudiantesMessage.textContent =
                textoBusqueda
                    ? "No se encontraron estudiantes."
                    : "Todos los estudiantes tienen una cuenta.";

            return;
        }


        estudiantesMessage.textContent =
            `Estudiantes encontrados: ${estudiantesFiltrados.length}`;


        estudiantesFiltrados.forEach(
            function (estudiante) {

                const fila =
                    document.createElement("tr");


                const fotoUrl =
                    estudiante.fotoUrl ||
                    estudiante.foto ||
                    null;


                fila.innerHTML = `

                    <td>
                        ${generarFotoHtml(
                    fotoUrl,
                    nombreCompletoEstudiante(
                        estudiante
                    )
                )}
                    </td>

                    <td>
                        ${escaparHtml(
                    nombreCompletoEstudiante(
                        estudiante
                    )
                )}
                    </td>

                    <td>
                        ${escaparHtml(
                    estudiante.documento
                )}
                    </td>

                    <td>
                        ${escaparHtml(
                    estudiante.correo
                )}
                    </td>

                    <td>
                        ${escaparHtml(
                    estudiante.telefono
                )}
                    </td>

                    <td>

                        <button
                            type="button"
                            class="btn btn--primary btn-crear-cuenta"
                            data-id="${estudiante.id}">

                            Crear usuario

                        </button>

                    </td>

                `;


                estudiantesSinCuentaTableBody
                    .appendChild(
                        fila
                    );

            }
        );


        document
            .querySelectorAll(".btn-crear-cuenta")
            .forEach(
                function (boton) {

                    boton.addEventListener(
                        "click",
                        abrirModalCrearUsuario
                    );

                }
            );

    }


    // ==========================================
    // ABRIR MODAL CREAR CUENTA
    // ==========================================

    function abrirModalCrearUsuario(event) {

        const estudianteId =
            Number(
                event.currentTarget.dataset.id
            );


        const estudiante =
            estudiantes.find(
                function (item) {

                    return Number(item.id) ===
                        estudianteId;

                }
            );


        if (!estudiante) {

            alert(
                "No se encontró el estudiante."
            );

            return;
        }


        modalEstudianteId.value =
            estudiante.id;


        modalEstudianteNombre.textContent =
            nombreCompletoEstudiante(
                estudiante
            );


        modalEstudianteDocumento.textContent =
            `Documento: ${estudiante.documento || "-"}`;


        modalEstudianteCorreo.textContent =
            `Correo: ${estudiante.correo || "-"}`;


        modalUsername.value =
            "";

        modalPassword.value =
            "";

        modalGenero.value =
            "";


        crearUsuarioMessage.textContent =
            "";

        crearUsuarioMessage.hidden =
            true;


        crearUsuarioModal.hidden =
            false;


        setTimeout(
            function () {

                modalUsername.focus();

            },
            50
        );

    }


    // ==========================================
    // CERRAR MODAL CREAR CUENTA
    // ==========================================

    function cerrarModalCrearUsuario() {

        crearUsuarioModal.hidden =
            true;


        crearUsuarioForm.reset();


        modalEstudianteId.value =
            "";


        crearUsuarioMessage.textContent =
            "";

        crearUsuarioMessage.hidden =
            true;

    }


    // ==========================================
    // CREAR CUENTA PARA ESTUDIANTE
    // ==========================================

    async function crearCuentaParaEstudiante(
        event
    ) {

        event.preventDefault();


        const estudianteId =
            Number(
                modalEstudianteId.value
            );


        const nuevoUsername =
            modalUsername.value.trim();


        const nuevaPassword =
            modalPassword.value;


        const nuevoGenero =
            modalGenero.value;


        if (!estudianteId) {

            mostrarMensajeModal(
                "No se ha seleccionado un estudiante."
            );

            return;
        }


        if (
            nuevoUsername.length <
            4
        ) {

            mostrarMensajeModal(
                "El usuario debe tener al menos 4 caracteres."
            );

            modalUsername.focus();

            return;
        }


        if (
            !/^[a-zA-Z0-9._-]+$/.test(
                nuevoUsername
            )
        ) {

            mostrarMensajeModal(
                "El usuario solo puede contener letras, números, punto, guion y guion bajo."
            );

            modalUsername.focus();

            return;
        }


        if (
            nuevaPassword.length <
            8
        ) {

            mostrarMensajeModal(
                "La contraseña debe tener al menos 8 caracteres."
            );

            modalPassword.focus();

            return;
        }


        if (!nuevoGenero) {

            mostrarMensajeModal(
                "Selecciona el género."
            );

            modalGenero.focus();

            return;
        }


        crearUsuarioSubmit.disabled =
            true;

        crearUsuarioSubmit.textContent =
            "Creando...";


        try {

            const response =
                await fetchAutenticado(
                    "/api/usuarios/estudiante",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({

                                estudianteId:
                                    estudianteId,

                                username:
                                    nuevoUsername,

                                password:
                                    nuevaPassword,

                                genero:
                                    nuevoGenero

                            })
                    }
                );


            if (!response) {

                return;
            }


            if (response.status === 403) {

                mostrarMensajeModal(
                    "No tienes permisos para crear esta cuenta."
                );

                return;
            }


            if (!response.ok) {

                let mensaje =
                    "No se pudo crear la cuenta.";


                try {

                    const error =
                        await response.json();


                    if (error.message) {

                        mensaje =
                            error.message;

                    } else if (error.error) {

                        mensaje =
                            error.error;

                    }

                } catch (error) {

                    console.error(
                        "No se pudo leer el error:",
                        error
                    );

                }


                mostrarMensajeModal(
                    mensaje
                );

                return;
            }


            await response.json();


            cerrarModalCrearUsuario();


            await cargarDatos();


        } catch (error) {

            console.error(
                "Error creando cuenta:",
                error
            );


            mostrarMensajeModal(
                "No se pudo conectar con el servidor."
            );

        } finally {

            crearUsuarioSubmit.disabled =
                false;

            crearUsuarioSubmit.textContent =
                "Crear usuario";

        }

    }


    // ==========================================
    // MENSAJE MODAL CREAR
    // ==========================================

    function mostrarMensajeModal(
        mensaje
    ) {

        crearUsuarioMessage.textContent =
            mensaje;

        crearUsuarioMessage.hidden =
            false;

    }


    // ==========================================
    // CAMBIAR ESTADO
    // ==========================================

    async function cambiarEstadoUsuario(
        event
    ) {

        const boton =
            event.currentTarget;


        const usuarioId =
            boton.dataset.id;


        const nuevoEstado =
            boton.dataset.estado;


        try {

            boton.disabled =
                true;


            const response =
                await fetchAutenticado(
                    `/api/usuarios/${usuarioId}/estado?estado=${encodeURIComponent(nuevoEstado)}`,
                    {
                        method: "PATCH"
                    }
                );


            if (!response) {

                return;
            }


            if (response.status === 403) {

                alert(
                    "No tienes permisos para cambiar el estado."
                );

                boton.disabled =
                    false;

                return;
            }


            if (!response.ok) {

                alert(
                    "No se pudo cambiar el estado del usuario."
                );

                boton.disabled =
                    false;

                return;
            }


            await response.json();


            await cargarUsuarios();


            renderizarUsuarios();

            actualizarAvatarUsuarioActual();


        } catch (error) {

            console.error(
                "Error cambiando estado:",
                error
            );


            alert(
                "No se pudo conectar con el servidor."
            );


            boton.disabled =
                false;

        }

    }


    // ==========================================
    // ABRIR MODAL EDITAR USUARIO
    // ==========================================

    function editarUsuario(event) {

        const usuarioId =
            Number(
                event.currentTarget.dataset.id
            );


        if (!usuarioId) {

            return;
        }


        const usuario =
            usuarios.find(
                function (item) {

                    return Number(item.id) ===
                        usuarioId;

                }
            );


        if (!usuario) {

            alert(
                "No se encontró el usuario."
            );

            return;
        }


        editarUsuarioMessage.hidden =
            true;

        editarUsuarioMessage.textContent =
            "";


        cargarDatosEditarUsuario(
            usuario
        );


        editarUsuarioModal.hidden =
            false;


        setTimeout(
            function () {

                editarUsername.focus();

            },
            50
        );

    }


    // ==========================================
    // CARGAR DATOS EN MODAL EDITAR
    // ==========================================

    function cargarDatosEditarUsuario(
        usuario
    ) {

        editarUsuarioId.value =
            usuario.id || "";


        /*
         * La foto que se muestra puede venir
         * del estudiante vinculado.
         *
         * editarFoto conserva específicamente
         * la foto propia del usuario.
         */

        editarFoto.value =
            usuario.foto || "";


        /*
         * Al abrir el modal no existe todavía
         * una nueva foto seleccionada.
         */

        editarFotoSeleccionada =
            null;


        if (editarFotoInput) {

            editarFotoInput.value =
                "";

        }


        const fotoMostrar =
            obtenerFotoUsuario(
                usuario
            );


        if (editarUsuarioFoto) {

            if (fotoMostrar) {

                editarUsuarioFoto.innerHTML = `
                    <img
                        src="${escaparHtml(fotoMostrar)}"
                        alt="Foto de ${escaparHtml(
                    nombreCompletoUsuario(usuario)
                )}"
                        style="width:100%;height:100%;object-fit:cover;border-radius:50%;">
                `;

            } else {

                editarUsuarioFoto.innerHTML = `
                    <span>
                        ${escaparHtml(
                    (nombreCompletoUsuario(usuario) || "U")
                        .charAt(0)
                        .toUpperCase()
                )}
                    </span>
                `;

            }

        }


        editarUsername.value =
            usuario.username || "";


        editarNombre.value =
            usuario.nombre || "";


        editarApellido.value =
            usuario.apellido || "";


        editarTipoDocumento.value =
            usuario.tipoDocumento || "";


        actualizarReglasDocumentoEditar();


        editarNumeroDocumento.value =
            usuario.numeroDocumento || "";


        const telefono =
            usuario.telefono || "";


        const codigoPais =
            obtenerCodigoPais(
                telefono
            );


        editarCodigoPais.value =
            codigoPais;


        editarTelefono.value =
            telefono.startsWith(
                codigoPais
            )
                ? telefono.substring(
                    codigoPais.length
                )
                : telefono;


        actualizarReglasTelefonoEditar();


        editarFechaNacimiento.value =
            usuario.fechaNacimiento || "";


        editarGenero.value =
            usuario.genero || "";


        editarCorreo.value =
            usuario.correo || "";

    }


    // ==========================================
    // FOTO - EDITAR USUARIO
    // ==========================================

    function seleccionarNuevaFotoEditar() {

        if (!editarFotoInput) {

            return;
        }


        editarFotoInput.click();

    }


    if (cambiarEditarFotoBtn) {

        cambiarEditarFotoBtn.addEventListener(
            "click",
            seleccionarNuevaFotoEditar
        );

    }


    if (editarFotoInput) {

        editarFotoInput.addEventListener(
            "change",
            function () {

                const archivo =
                    editarFotoInput.files &&
                        editarFotoInput.files.length > 0
                        ? editarFotoInput.files[0]
                        : null;


                if (!archivo) {

                    return;
                }


                const tiposPermitidos = [
                    "image/jpeg",
                    "image/png",
                    "image/webp"
                ];


                if (
                    !tiposPermitidos.includes(
                        archivo.type
                    )
                ) {

                    mostrarMensajeEditar(
                        "La foto debe ser JPG, PNG o WEBP."
                    );


                    editarFotoInput.value =
                        "";

                    editarFotoSeleccionada =
                        null;

                    return;
                }


                if (
                    archivo.size >
                    5 * 1024 * 1024
                ) {

                    mostrarMensajeEditar(
                        "La foto no puede superar los 5 MB."
                    );


                    editarFotoInput.value =
                        "";

                    editarFotoSeleccionada =
                        null;

                    return;
                }


                editarFotoSeleccionada =
                    archivo;


                const reader =
                    new FileReader();


                reader.onload =
                    function (evento) {

                        if (!editarUsuarioFoto) {

                            return;
                        }


                        editarUsuarioFoto.innerHTML = `
                            <img
                                src="${evento.target.result}"
                                alt="Nueva foto"
                                style="width:100%;height:100%;object-fit:cover;border-radius:50%;">
                        `;

                    };


                reader.onerror =
                    function () {

                        editarFotoSeleccionada =
                            null;

                        editarFotoInput.value =
                            "";

                        mostrarMensajeEditar(
                            "No se pudo cargar la imagen seleccionada."
                        );

                    };


                reader.readAsDataURL(
                    archivo
                );


                editarUsuarioMessage.textContent =
                    "";

                editarUsuarioMessage.hidden =
                    true;

            }
        );

    }


    // ==========================================
    // REGLAS DE TELEFONO EDITAR
    // ==========================================

    const reglasTelefonoEditar = {

        "+51": {
            nombre: "Perú",
            min: 9,
            max: 9
        },

        "+57": {
            nombre: "Colombia",
            min: 10,
            max: 10
        },

        "+56": {
            nombre: "Chile",
            min: 9,
            max: 9
        },

        "+54": {
            nombre: "Argentina",
            min: 10,
            max: 10
        },

        "+55": {
            nombre: "Brasil",
            min: 10,
            max: 11
        },

        "+52": {
            nombre: "México",
            min: 10,
            max: 10
        },

        "+1": {
            nombre: "Estados Unidos / Canadá",
            min: 10,
            max: 10
        },

        "+34": {
            nombre: "España",
            min: 9,
            max: 9
        }

    };


    // ==========================================
    // OBTENER CÓDIGO DE PAÍS
    // ==========================================

    function obtenerCodigoPais(
        telefono
    ) {

        const codigos = [

            "+51",
            "+57",
            "+56",
            "+54",
            "+55",
            "+52",
            "+1",
            "+34"

        ];


        const encontrado =
            codigos.find(
                function (codigo) {

                    return telefono.startsWith(
                        codigo
                    );

                }
            );


        return encontrado || "+51";

    }


    // ==========================================
    // ACTUALIZAR REGLAS TELEFONO EDITAR
    // ==========================================

    function actualizarReglasTelefonoEditar() {

        const regla =
            reglasTelefonoEditar[
            editarCodigoPais.value
            ];


        if (!regla) {

            return;
        }


        editarTelefono.maxLength =
            regla.max;


        if (
            regla.min ===
            regla.max
        ) {

            editarTelefono.placeholder =
                `${regla.min} dígitos`;

        } else {

            editarTelefono.placeholder =
                `${regla.min}-${regla.max} dígitos`;

        }

    }


    // ==========================================
    // CAMBIO DE PAÍS - EDITAR
    // ==========================================

    editarCodigoPais.addEventListener(
        "change",
        function () {

            editarTelefono.value =
                "";

            actualizarReglasTelefonoEditar();

        }
    );


    // ==========================================
    // LIMPIEZA TELEFONO - EDITAR
    // ==========================================

    editarTelefono.addEventListener(
        "input",
        function () {

            const regla =
                reglasTelefonoEditar[
                editarCodigoPais.value
                ];


            if (!regla) {

                return;
            }


            editarTelefono.value =
                editarTelefono.value
                    .replace(/\D/g, "")
                    .slice(
                        0,
                        regla.max
                    );

        }
    );


    // ==========================================
    // REGLAS DOCUMENTO - EDITAR
    // ==========================================

    function actualizarReglasDocumentoEditar() {

        const tipo =
            editarTipoDocumento.value;


        if (tipo === "DNI") {

            editarNumeroDocumento.maxLength =
                8;

            editarNumeroDocumento.inputMode =
                "numeric";

            editarNumeroDocumento.pattern =
                "[0-9]{8}";

            editarNumeroDocumento.placeholder =
                "8 dígitos";

            return;
        }


        if (
            tipo === "CE" ||
            tipo === "PASAPORTE"
        ) {

            editarNumeroDocumento.maxLength =
                12;

            editarNumeroDocumento.inputMode =
                "text";

            editarNumeroDocumento.pattern =
                "[A-Za-z0-9]{1,12}";

            editarNumeroDocumento.placeholder =
                "Hasta 12 caracteres";

            return;
        }


        editarNumeroDocumento.removeAttribute(
            "maxlength"
        );

        editarNumeroDocumento.removeAttribute(
            "pattern"
        );

        editarNumeroDocumento.placeholder =
            "Selecciona el tipo de documento";

    }


    // ==========================================
    // SANITIZAR DOCUMENTO EDITAR
    // ==========================================

    editarNumeroDocumento.addEventListener(
        "input",
        function () {

            if (
                editarTipoDocumento.value ===
                "DNI"
            ) {

                editarNumeroDocumento.value =
                    editarNumeroDocumento.value
                        .replace(/\D/g, "")
                        .slice(0, 8);

            } else if (
                editarTipoDocumento.value ===
                "CE" ||
                editarTipoDocumento.value ===
                "PASAPORTE"
            ) {

                editarNumeroDocumento.value =
                    editarNumeroDocumento.value
                        .replace(
                            /[^a-zA-Z0-9]/g,
                            ""
                        )
                        .slice(0, 12);

            }

        }
    );


    // ==========================================
    // SANITIZAR NOMBRE EDITAR
    // ==========================================

    editarNombre.addEventListener(
        "input",
        function () {

            editarNombre.value =
                editarNombre.value
                    .replace(
                        /[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g,
                        ""
                    )
                    .slice(0, 50);

        }
    );


    // ==========================================
    // SANITIZAR APELLIDO EDITAR
    // ==========================================

    editarApellido.addEventListener(
        "input",
        function () {

            editarApellido.value =
                editarApellido.value
                    .replace(
                        /[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g,
                        ""
                    )
                    .slice(0, 50);

        }
    );


    // ==========================================
    // SANITIZAR USERNAME EDITAR
    // ==========================================

    editarUsername.addEventListener(
        "input",
        function () {

            editarUsername.value =
                editarUsername.value
                    .replace(
                        /[^a-zA-Z0-9._-]/g,
                        ""
                    )
                    .slice(0, 30);

        }
    );


    editarTipoDocumento.addEventListener(
        "change",
        function () {

            actualizarReglasDocumentoEditar();

        }
    );


    // ==========================================
    // GUARDAR CAMBIOS
    // ==========================================

    async function guardarCambiosUsuario(
        event
    ) {

        event.preventDefault();


        const usuarioId =
            Number(
                editarUsuarioId.value
            );


        if (!usuarioId) {

            mostrarMensajeEditar(
                "No se encontró el usuario."
            );

            return;
        }


        const usernameEditado =
            editarUsername.value.trim();


        const nombreEditado =
            editarNombre.value.trim();


        const apellidoEditado =
            editarApellido.value.trim();


        const tipoDocumento =
            editarTipoDocumento.value;


        const numeroDocumento =
            editarNumeroDocumento.value.trim();


        const telefono =
            editarTelefono.value.trim();


        const fechaNacimiento =
            editarFechaNacimiento.value;


        const genero =
            editarGenero.value;


        const correo =
            editarCorreo.value.trim();


        // ======================================
        // VALIDAR USERNAME
        // ======================================

        if (
            usernameEditado.length <
            4
        ) {

            mostrarMensajeEditar(
                "El usuario debe tener al menos 4 caracteres."
            );

            editarUsername.focus();

            return;
        }


        if (
            !/^[a-zA-Z0-9._-]+$/.test(
                usernameEditado
            )
        ) {

            mostrarMensajeEditar(
                "El usuario solo puede contener letras, números, punto, guion y guion bajo."
            );

            editarUsername.focus();

            return;
        }


        // ======================================
        // VALIDAR NOMBRE
        // ======================================

        if (!nombreEditado) {

            mostrarMensajeEditar(
                "El nombre es obligatorio."
            );

            editarNombre.focus();

            return;
        }


        // ======================================
        // VALIDAR APELLIDO
        // ======================================

        if (!apellidoEditado) {

            mostrarMensajeEditar(
                "El apellido es obligatorio."
            );

            editarApellido.focus();

            return;
        }


        // ======================================
        // VALIDAR TIPO DOCUMENTO
        // ======================================

        if (!tipoDocumento) {

            mostrarMensajeEditar(
                "Debes seleccionar un tipo de documento."
            );

            editarTipoDocumento.focus();

            return;
        }


        // ======================================
        // VALIDAR DOCUMENTO
        // ======================================

        if (
            tipoDocumento ===
            "DNI"
        ) {

            if (
                !/^\d{8}$/.test(
                    numeroDocumento
                )
            ) {

                mostrarMensajeEditar(
                    "El DNI debe tener exactamente 8 dígitos."
                );

                editarNumeroDocumento.focus();

                return;
            }

        } else if (
            tipoDocumento === "CE" ||
            tipoDocumento === "PASAPORTE"
        ) {

            if (
                !/^[A-Za-z0-9]{1,12}$/.test(
                    numeroDocumento
                )
            ) {

                mostrarMensajeEditar(
                    "El documento debe contener entre 1 y 12 caracteres alfanuméricos."
                );

                editarNumeroDocumento.focus();

                return;
            }

        }


        // ======================================
        // VALIDAR TELEFONO
        // ======================================

        if (telefono) {

            const regla =
                reglasTelefonoEditar[
                editarCodigoPais.value
                ];


            if (!regla) {

                mostrarMensajeEditar(
                    "Selecciona un código de país válido."
                );

                editarCodigoPais.focus();

                return;
            }


            const cantidadDigitos =
                telefono.length;


            if (
                regla.min ===
                regla.max
            ) {

                if (
                    cantidadDigitos !==
                    regla.min
                ) {

                    mostrarMensajeEditar(
                        `El número de ${regla.nombre} debe contener exactamente ${regla.min} dígitos.`
                    );

                    editarTelefono.focus();

                    return;
                }

            } else {

                if (
                    cantidadDigitos <
                    regla.min ||
                    cantidadDigitos >
                    regla.max
                ) {

                    mostrarMensajeEditar(
                        `El número de ${regla.nombre} debe contener entre ${regla.min} y ${regla.max} dígitos.`
                    );

                    editarTelefono.focus();

                    return;
                }

            }

        }


        // ======================================
        // VALIDAR FECHA
        // ======================================

        if (!fechaNacimiento) {

            mostrarMensajeEditar(
                "La fecha de nacimiento es obligatoria."
            );

            editarFechaNacimiento.focus();

            return;
        }


        const hoy =
            new Date();


        const fechaSeleccionada =
            new Date(
                fechaNacimiento +
                "T00:00:00"
            );


        hoy.setHours(
            23,
            59,
            59,
            999
        );


        if (
            fechaSeleccionada >
            hoy
        ) {

            mostrarMensajeEditar(
                "La fecha de nacimiento no puede ser futura."
            );

            editarFechaNacimiento.focus();

            return;
        }


        // ======================================
        // VALIDAR GENERO
        // ======================================

        if (!genero) {

            mostrarMensajeEditar(
                "Debes seleccionar el género."
            );

            editarGenero.focus();

            return;
        }


        // ======================================
        // VALIDAR CORREO
        // ======================================

        if (!correo) {

            mostrarMensajeEditar(
                "El correo electrónico es obligatorio."
            );

            editarCorreo.focus();

            return;
        }


        // ======================================
        // CONSTRUIR TELEFONO
        // ======================================

        const telefonoCompleto =
            telefono
                ? editarCodigoPais.value +
                telefono
                : "";


        // ======================================
        // CONSTRUIR FORMDATA
        // ======================================

        const formData =
            new FormData();


        formData.append(
            "username",
            usernameEditado
        );


        formData.append(
            "nombre",
            nombreEditado
        );


        formData.append(
            "apellido",
            apellidoEditado
        );


        formData.append(
            "tipoDocumento",
            tipoDocumento
        );


        formData.append(
            "numeroDocumento",
            numeroDocumento
        );


        formData.append(
            "telefono",
            telefonoCompleto
        );


        formData.append(
            "fechaNacimiento",
            fechaNacimiento
        );


        formData.append(
            "genero",
            genero
        );


        formData.append(
            "correo",
            correo
        );


        /*
         * La foto solo se envía cuando el administrador
         * seleccionó una nueva.
         *
         * Si no se seleccionó ninguna foto,
         * el backend conserva la foto actual.
         */

        if (editarFotoSeleccionada) {

            formData.append(
                "foto",
                editarFotoSeleccionada
            );

        }


        editarUsuarioSubmit.disabled =
            true;

        editarUsuarioSubmit.textContent =
            "Guardando...";


        editarUsuarioMessage.hidden =
            true;


        try {

            const response =
                await fetchAutenticado(
                    `/api/usuarios/${usuarioId}`,
                    {
                        method: "PUT",

                        /*
                         * IMPORTANTE:
                         * No establecer Content-Type manualmente.
                         *
                         * El navegador agrega automáticamente:
                         * multipart/form-data + boundary
                         */

                        body:
                            formData
                    }
                );


            if (!response) {

                return;
            }


            if (response.status === 403) {

                mostrarMensajeEditar(
                    "No tienes permisos para editar este usuario."
                );

                return;
            }


            if (!response.ok) {

                let mensaje =
                    "No se pudieron guardar los cambios.";


                try {

                    const error =
                        await response.json();


                    if (error.message) {

                        mensaje =
                            error.message;

                    } else if (error.error) {

                        mensaje =
                            error.error;

                    }

                } catch (error) {

                    console.error(
                        "No se pudo leer el error:",
                        error
                    );

                }


                mostrarMensajeEditar(
                    mensaje
                );

                return;
            }


            await response.json();


            cerrarModalEditarUsuario();


            await cargarDatos();


        } catch (error) {

            console.error(
                "Error actualizando usuario:",
                error
            );


            mostrarMensajeEditar(
                "No se pudo conectar con el servidor."
            );

        } finally {

            editarUsuarioSubmit.disabled =
                false;

            editarUsuarioSubmit.textContent =
                "Guardar cambios";

        }

    }


    // ==========================================
    // MENSAJE MODAL EDITAR
    // ==========================================

    function mostrarMensajeEditar(
        mensaje
    ) {

        editarUsuarioMessage.textContent =
            mensaje;

        editarUsuarioMessage.hidden =
            false;

    }


    // ==========================================
    // CERRAR MODAL EDITAR
    // ==========================================

    function cerrarModalEditarUsuario() {

        editarUsuarioModal.hidden =
            true;


        editarUsuarioForm.reset();


        editarUsuarioId.value =
            "";


        editarFoto.value =
            "";


        editarFotoSeleccionada =
            null;


        if (editarFotoInput) {

            editarFotoInput.value =
                "";

        }


        if (editarUsuarioFoto) {

            editarUsuarioFoto.innerHTML =
                "";

        }


        editarUsuarioMessage.textContent =
            "";

        editarUsuarioMessage.hidden =
            true;


        actualizarReglasDocumentoEditar();

        actualizarReglasTelefonoEditar();

    }


    // ==========================================
    // ELIMINAR USUARIO
    // ==========================================

    async function eliminarUsuario(
        event
    ) {

        const boton =
            event.currentTarget;


        const usuarioId =
            Number(
                boton.dataset.id
            );


        const usuario =
            usuarios.find(
                function (item) {

                    return Number(item.id) ===
                        usuarioId;

                }
            );


        if (!usuario) {

            alert(
                "No se encontró el usuario."
            );

            return;
        }


        const confirmar =
            confirm(
                `¿Estás seguro de eliminar el usuario "${usuario.username}"?`
            );


        if (!confirmar) {

            return;
        }


        try {

            boton.disabled =
                true;


            const response =
                await fetchAutenticado(
                    `/api/usuarios/${usuarioId}`,
                    {
                        method: "DELETE"
                    }
                );


            if (!response) {

                return;
            }


            if (response.status === 403) {

                alert(
                    "No tienes permisos para eliminar usuarios."
                );

                boton.disabled =
                    false;

                return;
            }


            if (!response.ok) {

                const errorText =
                    await response.text();


                console.error(
                    "Error eliminando usuario:",
                    errorText
                );


                alert(
                    "No se pudo eliminar el usuario."
                );


                boton.disabled =
                    false;

                return;
            }


            await cargarDatos();


        } catch (error) {

            console.error(
                "Error eliminando usuario:",
                error
            );


            alert(
                "No se pudo conectar con el servidor."
            );


            boton.disabled =
                false;

        }

    }


    // ==========================================
    // ABRIR MODAL REGISTRAR USUARIO
    // ==========================================

    function abrirModalRegistrarUsuario() {

        if (!registrarUsuarioModal) {

            console.error(
                "No se encontró el modal registrarUsuarioModal."
            );

            return;
        }


        registrarUsuarioModal.hidden =
            false;


        setTimeout(
            function () {

                const usernameInput =
                    registroUsuarioForm
                        ? registroUsuarioForm.querySelector(
                            "#username"
                        )
                        : null;


                if (usernameInput) {

                    usernameInput.focus();

                }

            },
            50
        );

    }


    // ==========================================
    // CERRAR MODAL REGISTRAR USUARIO
    // ==========================================

    function cerrarModalRegistrarUsuario() {

        if (!registrarUsuarioModal) {

            return;
        }


        registrarUsuarioModal.hidden =
            true;


        if (
            window.registroFormularioModal &&
            typeof window.registroFormularioModal.reset ===
            "function"
        ) {

            window.registroFormularioModal.reset();

        } else if (registroUsuarioForm) {

            registroUsuarioForm.reset();

        }

    }


    // ==========================================
    // REGISTRO DESDE MODAL
    // ==========================================

    function inicializarRegistroUsuarioModal() {

        if (!registroUsuarioForm) {

            console.error(
                "No se encontró registroUsuarioForm."
            );

            return;
        }


        if (
            typeof window.inicializarFormularioRegistro !==
            "function"
        ) {

            console.error(
                "No está disponible inicializarFormularioRegistro()."
            );

            return;
        }


        window.registroFormularioModal =
            window.inicializarFormularioRegistro(
                registroUsuarioForm,
                {
                    modo: "modal",

                    alCrearUsuario:
                        async function (usuario) {

                            console.log(
                                "Usuario creado desde modal:",
                                usuario
                            );


                            cerrarModalRegistrarUsuario();


                            await cargarDatos();

                        }

                }
            );

    }


    // ==========================================
    // EVENTO REGISTRAR USUARIO
    // ==========================================

    if (registrarUsuarioButton) {

        registrarUsuarioButton.addEventListener(
            "click",
            abrirModalRegistrarUsuario
        );

    }


    // ==========================================
    // BÚSQUEDA USUARIOS
    // ==========================================

    usuariosSearch.addEventListener(
        "input",
        function () {

            renderizarUsuarios();

        }
    );


    // ==========================================
    // FILTRO ESTADO
    // ==========================================

    estadoFiltro.addEventListener(
        "change",
        function () {

            renderizarUsuarios();

        }
    );


    // ==========================================
    // BÚSQUEDA ESTUDIANTES
    // ==========================================

    estudiantesSearch.addEventListener(
        "input",
        function () {

            renderizarEstudiantesSinCuenta();

        }
    );


    // ==========================================
    // MODAL CREAR CUENTA
    // ==========================================

    crearUsuarioForm.addEventListener(
        "submit",
        crearCuentaParaEstudiante
    );


    cerrarCrearUsuarioModal.addEventListener(
        "click",
        cerrarModalCrearUsuario
    );


    cancelarCrearUsuario.addEventListener(
        "click",
        cerrarModalCrearUsuario
    );


    crearUsuarioModalOverlay.addEventListener(
        "click",
        cerrarModalCrearUsuario
    );


    // ==========================================
    // MODAL REGISTRAR USUARIO
    // ==========================================

    if (cerrarRegistrarUsuarioModal) {

        cerrarRegistrarUsuarioModal.addEventListener(
            "click",
            cerrarModalRegistrarUsuario
        );

    }


    if (cancelarRegistrarUsuario) {

        cancelarRegistrarUsuario.addEventListener(
            "click",
            cerrarModalRegistrarUsuario
        );

    }


    if (registrarUsuarioModalOverlay) {

        registrarUsuarioModalOverlay.addEventListener(
            "click",
            cerrarModalRegistrarUsuario
        );

    }


    // ==========================================
    // MODAL EDITAR USUARIO
    // ==========================================

    cerrarEditarUsuarioModal.addEventListener(
        "click",
        cerrarModalEditarUsuario
    );


    cancelarEditarUsuario.addEventListener(
        "click",
        cerrarModalEditarUsuario
    );


    editarUsuarioModalOverlay.addEventListener(
        "click",
        cerrarModalEditarUsuario
    );


    editarUsuarioForm.addEventListener(
        "submit",
        guardarCambiosUsuario
    );


    // ==========================================
    // ESCAPE
    // ==========================================

    document.addEventListener(
        "keydown",
        function (event) {

            if (event.key !== "Escape") {

                return;
            }


            if (
                profileMenu &&
                !profileMenu.hidden
            ) {

                cerrarMenuPerfil();

                return;
            }


            if (
                editarUsuarioModal &&
                !editarUsuarioModal.hidden
            ) {

                cerrarModalEditarUsuario();

                return;
            }


            if (
                registrarUsuarioModal &&
                !registrarUsuarioModal.hidden
            ) {

                cerrarModalRegistrarUsuario();

                return;
            }


            if (
                crearUsuarioModal &&
                !crearUsuarioModal.hidden
            ) {

                cerrarModalCrearUsuario();

            }

        }
    );


    // ==========================================
    // INICIALIZAR REGISTRO
    // ==========================================

    inicializarRegistroUsuarioModal();


    // ==========================================
    // CARGA INICIAL
    // ==========================================

    await cargarDatos();

});