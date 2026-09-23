document.addEventListener("DOMContentLoaded", function () {

    /*
     * =========================================================
     * AUTENTICACIÓN
     * =========================================================
     */

    const auth =
        sessionStorage.getItem("kihonAuth");

    const usernameSesion =
        sessionStorage.getItem("kihonUsername");

    const rolSesion =
        sessionStorage.getItem("kihonRol");


    /*
     * =========================================================
     * VERIFICAR SESIÓN
     * =========================================================
     */

    if (!auth || !usernameSesion || !rolSesion) {

        window.location.href = "/login";

        return;
    }


    /*
     * =========================================================
     * ELEMENTOS DEL DOM
     * =========================================================
     */

    const perfilVolverBtn =
        document.getElementById("perfilVolverBtn");


    const perfilForm =
        document.getElementById("perfilForm");


    const passwordForm =
        document.getElementById("passwordForm");


    /*
     * FOTO
     */

    const perfilFotoPreview =
        document.getElementById("perfilFotoPreview");


    const cambiarFotoBtn =
        document.getElementById("cambiarFotoBtn");


    const perfilFotoInput =
        document.getElementById("perfilFotoInput");


    /*
     * DATOS EDITABLES
     */

    const perfilUsername =
        document.getElementById("perfilUsername");


    const perfilNombre =
        document.getElementById("perfilNombre");


    const perfilApellido =
        document.getElementById("perfilApellido");


    const perfilCorreo =
        document.getElementById("perfilCorreo");


    /*
     * INFORMACIÓN PERSONAL
     */

    const perfilTipoDocumento =
        document.getElementById("perfilTipoDocumento");


    const perfilNumeroDocumento =
        document.getElementById("perfilNumeroDocumento");


    const perfilTelefono =
        document.getElementById("perfilTelefono");


    const perfilFechaNacimiento =
        document.getElementById("perfilFechaNacimiento");


    const perfilGenero =
        document.getElementById("perfilGenero");


    /*
     * INFORMACIÓN DE CUENTA
     */

    const perfilRol =
        document.getElementById("perfilRol");


    const perfilEstado =
        document.getElementById("perfilEstado");


    const perfilFechaRegistro =
        document.getElementById("perfilFechaRegistro");


    /*
     * CONTRASEÑA
     */

    const passwordActual =
        document.getElementById("passwordActual");


    const passwordNueva =
        document.getElementById("passwordNueva");


    const passwordConfirmar =
        document.getElementById("passwordConfirmar");


    /*
     * =========================================================
     * VARIABLES
     * =========================================================
     */

    let fotoActual = null;

    let fotoSeleccionada = null;


    /*
     * =========================================================
     * VOLVER
     * =========================================================
     */

    if (perfilVolverBtn) {

        perfilVolverBtn.addEventListener(
            "click",
            function () {

                window.history.back();

            }
        );
    }


    /*
     * =========================================================
     * CARGAR PERFIL
     * =========================================================
     */

    async function cargarPerfil() {

        try {

            const response =
                await fetch(
                    "/api/auth/perfil",
                    {
                        method: "GET",

                        headers: {
                            "Authorization":
                                "Basic " + auth
                        }
                    }
                );


            /*
             * AUTENTICACIÓN INVÁLIDA
             */

            if (response.status === 401) {

                cerrarSesion();

                return;
            }


            if (!response.ok) {

                throw new Error(
                    "No se pudo cargar el perfil."
                );
            }


            const perfil =
                await response.json();


            /*
             * DATOS EDITABLES
             */

            perfilUsername.value =
                perfil.username || "";


            perfilNombre.value =
                perfil.nombre || "";


            perfilApellido.value =
                perfil.apellido || "";


            perfilCorreo.value =
                perfil.correo || "";


            /*
             * INFORMACIÓN PERSONAL
             */

            perfilTipoDocumento.textContent =
                perfil.tipoDocumento || "-";


            perfilNumeroDocumento.textContent =
                perfil.numeroDocumento || "-";


            perfilTelefono.textContent =
                perfil.telefono || "-";


            perfilFechaNacimiento.textContent =
                formatearFecha(
                    perfil.fechaNacimiento
                );


            perfilGenero.textContent =
                perfil.genero || "-";


            /*
             * INFORMACIÓN DE CUENTA
             */

            perfilRol.textContent =
                perfil.rol || "-";


            perfilEstado.textContent =
                perfil.estado || "-";


            perfilFechaRegistro.textContent =
                formatearFechaHora(
                    perfil.fechaRegistro
                );


            /*
             * FOTO
             *
             * El backend devuelve aquí la URL
             * firmada de Supabase.
             */

            fotoActual =
                perfil.foto || null;


            mostrarFoto(fotoActual);

        } catch (error) {

            console.error(
                "Error al cargar perfil:",
                error
            );

            mostrarMensaje(
                "No se pudo cargar la información del perfil.",
                "error"
            );
        }
    }


    /*
     * =========================================================
     * MOSTRAR FOTO
     * =========================================================
     */

    function mostrarFoto(foto) {

        if (!foto) {

            perfilFotoPreview.src =
                "/img/default-avatar.png";

            return;
        }


        perfilFotoPreview.src = foto;


        perfilFotoPreview.onerror =
            function () {

                this.onerror = null;

                this.src =
                    "/img/default-avatar.png";

            };
    }


    /*
     * =========================================================
     * SELECCIONAR FOTO
     * =========================================================
     */

    if (cambiarFotoBtn) {

        cambiarFotoBtn.addEventListener(
            "click",
            function () {

                perfilFotoInput.click();

            }
        );
    }


    if (perfilFotoInput) {

        perfilFotoInput.addEventListener(
            "change",
            function () {

                const archivo =
                    this.files[0];


                if (!archivo) {
                    return;
                }


                /*
                 * =================================================
                 * VALIDAR FOTO
                 * =================================================
                 *
                 * Mismos formatos utilizados
                 * en estudiantes.
                 */

                const tiposPermitidos = [
                    "image/jpeg",
                    "image/png",
                    "image/webp"
                ];


                if (!tiposPermitidos.includes(archivo.type)) {

                    mostrarMensaje(
                        "La fotografía debe ser JPG, PNG o WEBP.",
                        "error"
                    );

                    this.value = "";

                    fotoSeleccionada = null;

                    return;
                }


                /*
                 * MÁXIMO 5 MB
                 */

                const maximo =
                    5 * 1024 * 1024;


                if (archivo.size > maximo) {

                    mostrarMensaje(
                        "La fotografía no puede superar los 5 MB.",
                        "error"
                    );

                    this.value = "";

                    fotoSeleccionada = null;

                    return;
                }


                /*
                 * GUARDAR ARCHIVO
                 */

                fotoSeleccionada =
                    archivo;


                /*
                 * VISTA PREVIA
                 */

                const reader =
                    new FileReader();


                reader.onload =
                    function (event) {

                        perfilFotoPreview.src =
                            event.target.result;

                    };


                reader.readAsDataURL(archivo);

            }
        );
    }


    /*
     * =========================================================
     * GUARDAR PERFIL
     * =========================================================
     */

    perfilForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            /*
             * OBTENER VALORES
             */

            const username =
                perfilUsername.value.trim();


            const nombre =
                perfilNombre.value.trim();


            const apellido =
                perfilApellido.value.trim();


            const correo =
                perfilCorreo.value.trim();


            /*
             * VALIDACIONES
             */

            if (!username) {

                mostrarMensaje(
                    "El nombre de usuario es obligatorio.",
                    "error"
                );

                perfilUsername.focus();

                return;
            }


            if (!nombre) {

                mostrarMensaje(
                    "El nombre es obligatorio.",
                    "error"
                );

                perfilNombre.focus();

                return;
            }


            if (!apellido) {

                mostrarMensaje(
                    "El apellido es obligatorio.",
                    "error"
                );

                perfilApellido.focus();

                return;
            }


            if (!correo) {

                mostrarMensaje(
                    "El correo es obligatorio.",
                    "error"
                );

                perfilCorreo.focus();

                return;
            }


            /*
             * =================================================
             * FORM DATA
             * =================================================
             *
             * El backend ahora recibe multipart/form-data.
             *
             * IMPORTANTE:
             * No agregamos Content-Type manualmente.
             * El navegador genera automáticamente el boundary.
             */

            const formData =
                new FormData();


            formData.append(
                "username",
                username
            );


            formData.append(
                "nombre",
                nombre
            );


            formData.append(
                "apellido",
                apellido
            );


            formData.append(
                "correo",
                correo
            );


            /*
             * FOTO
             *
             * Solo enviamos la foto si el usuario
             * seleccionó una nueva.
             */

            if (fotoSeleccionada) {

                formData.append(
                    "foto",
                    fotoSeleccionada
                );
            }


            /*
             * DETECTAR CAMBIO DE USERNAME
             */

            const usernameCambio =
                username !== usernameSesion;


            try {

                const response =
                    await fetch(
                        "/api/auth/perfil",
                        {
                            method: "PUT",

                            headers: {

                                "Authorization":
                                    "Basic " + auth

                            },

                            body:
                                formData
                        }
                    );


                /*
                 * AUTENTICACIÓN INVÁLIDA
                 */

                if (response.status === 401) {

                    cerrarSesion();

                    return;
                }


                /*
                 * ERROR
                 */

                if (!response.ok) {

                    const mensaje =
                        await obtenerMensajeError(
                            response
                        );

                    throw new Error(mensaje);
                }


                /*
                 * RESPUESTA
                 */

                const perfilActualizado =
                    await response.json();


                /*
                 * ACTUALIZAR FORMULARIO
                 */

                perfilUsername.value =
                    perfilActualizado.username || "";


                perfilNombre.value =
                    perfilActualizado.nombre || "";


                perfilApellido.value =
                    perfilActualizado.apellido || "";


                perfilCorreo.value =
                    perfilActualizado.correo || "";


                /*
                 * ACTUALIZAR FOTO
                 *
                 * El backend devuelve la nueva URL
                 * firmada de Supabase.
                 */

                fotoActual =
                    perfilActualizado.foto || null;


                fotoSeleccionada = null;


                perfilFotoInput.value = "";


                mostrarFoto(fotoActual);


                /*
                 * SI CAMBIÓ EL USERNAME
                 *
                 * El Basic Auth actual contiene:
                 *
                 * username:contraseña
                 *
                 * Por tanto las credenciales actuales
                 * dejan de ser válidas.
                 */

                if (usernameCambio) {

                    mostrarMensaje(
                        "El perfil fue actualizado. Debes iniciar sesión nuevamente.",
                        "success"
                    );


                    setTimeout(
                        function () {

                            cerrarSesion();

                        },
                        1500
                    );


                    return;
                }


                /*
                 * ACTUALIZAR USERNAME DE SESIÓN
                 */

                sessionStorage.setItem(
                    "kihonUsername",
                    perfilActualizado.username
                );


                mostrarMensaje(
                    "Perfil actualizado correctamente.",
                    "success"
                );

            } catch (error) {

                console.error(
                    "Error al actualizar perfil:",
                    error
                );

                mostrarMensaje(
                    error.message ||
                    "No se pudo actualizar el perfil.",
                    "error"
                );
            }
        }
    );


    /*
     * =========================================================
     * CAMBIAR CONTRASEÑA
     * =========================================================
     */

    passwordForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const actual =
                passwordActual.value;


            const nueva =
                passwordNueva.value;


            const confirmar =
                passwordConfirmar.value;


            /*
             * VALIDACIONES
             */

            if (!actual) {

                mostrarMensaje(
                    "Ingresa tu contraseña actual.",
                    "error"
                );

                passwordActual.focus();

                return;
            }


            if (!nueva) {

                mostrarMensaje(
                    "Ingresa una nueva contraseña.",
                    "error"
                );

                passwordNueva.focus();

                return;
            }


            if (nueva.length < 6) {

                mostrarMensaje(
                    "La nueva contraseña debe tener al menos 6 caracteres.",
                    "error"
                );

                passwordNueva.focus();

                return;
            }


            if (!confirmar) {

                mostrarMensaje(
                    "Confirma la nueva contraseña.",
                    "error"
                );

                passwordConfirmar.focus();

                return;
            }


            if (nueva !== confirmar) {

                mostrarMensaje(
                    "Las nuevas contraseñas no coinciden.",
                    "error"
                );

                passwordConfirmar.focus();

                return;
            }


            if (actual === nueva) {

                mostrarMensaje(
                    "La nueva contraseña debe ser diferente a la actual.",
                    "error"
                );

                passwordNueva.focus();

                return;
            }


            try {

                const response =
                    await fetch(
                        "/api/auth/perfil/password",
                        {
                            method: "PATCH",

                            headers: {

                                "Authorization":
                                    "Basic " + auth,

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify({

                                    passwordActual:
                                        actual,

                                    passwordNueva:
                                        nueva

                                })
                        }
                    );


                /*
                 * AUTENTICACIÓN INVÁLIDA
                 */

                if (response.status === 401) {

                    cerrarSesion();

                    return;
                }


                /*
                 * ERROR
                 */

                if (!response.ok) {

                    const mensaje =
                        await obtenerMensajeError(
                            response
                        );

                    throw new Error(mensaje);
                }


                /*
                 * LIMPIAR
                 */

                passwordForm.reset();


                mostrarMensaje(
                    "Contraseña actualizada. Debes iniciar sesión nuevamente.",
                    "success"
                );


                /*
                 * La contraseña almacenada en
                 * kihonAuth ya no es válida.
                 */

                setTimeout(
                    function () {

                        cerrarSesion();

                    },
                    1500
                );

            } catch (error) {

                console.error(
                    "Error al cambiar contraseña:",
                    error
                );

                mostrarMensaje(
                    error.message ||
                    "No se pudo cambiar la contraseña.",
                    "error"
                );
            }
        }
    );


    /*
     * =========================================================
     * FORMATEAR FECHA
     * =========================================================
     */

    function formatearFecha(fecha) {

        if (!fecha) {
            return "-";
        }


        const partes =
            fecha.split("-");


        if (partes.length !== 3) {
            return fecha;
        }


        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }


    /*
     * =========================================================
     * FORMATEAR FECHA Y HORA
     * =========================================================
     */

    function formatearFechaHora(fecha) {

        if (!fecha) {
            return "-";
        }


        const partes =
            fecha.split("T");


        const fechaParte =
            formatearFecha(
                partes[0]
            );


        if (partes.length === 1) {
            return fechaParte;
        }


        const hora =
            partes[1].substring(
                0,
                5
            );


        return `${fechaParte} ${hora}`;
    }


    /*
     * =========================================================
     * OBTENER ERROR DEL BACKEND
     * =========================================================
     */

    async function obtenerMensajeError(
        response
    ) {

        try {

            const data =
                await response.json();


            if (data.message) {
                return data.message;
            }


            if (data.error) {
                return data.error;
            }

        } catch (error) {

            // Respuesta sin JSON.

        }


        return "Ocurrió un error al procesar la solicitud.";
    }


    /*
     * =========================================================
     * MENSAJES
     * =========================================================
     */

    function mostrarMensaje(
        mensaje,
        tipo = "info"
    ) {

        console.log(
            `[${tipo.toUpperCase()}] ${mensaje}`
        );


        if (
            tipo === "error" ||
            tipo === "success"
        ) {

            alert(mensaje);
        }
    }


    /*
     * =========================================================
     * CERRAR SESIÓN
     * =========================================================
     */

    function cerrarSesion() {

        sessionStorage.removeItem(
            "kihonAuth"
        );


        sessionStorage.removeItem(
            "kihonUsername"
        );


        sessionStorage.removeItem(
            "kihonRol"
        );


        window.location.href =
            "/login";
    }


    /*
     * =========================================================
     * INICIALIZAR
     * =========================================================
     */

    cargarPerfil();

});