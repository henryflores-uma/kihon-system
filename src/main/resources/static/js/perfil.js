
document.addEventListener("DOMContentLoaded", function () {

    /*
     * =========================================================
     * AUTENTICACIÓN
     * =========================================================
     */

    const auth = sessionStorage.getItem("kihonAuth");
    const usernameSesion = sessionStorage.getItem("kihonUsername");
    const rolSesion = sessionStorage.getItem("kihonRol");

    if (!auth || !usernameSesion || !rolSesion) {
        window.location.href = "/login";
        return;
    }


    /*
     * =========================================================
     * ELEMENTOS DEL DOM
     * =========================================================
     */

    const elementos = {
        volverBtn: document.getElementById("perfilVolverBtn"),

        perfilForm: document.getElementById("perfilForm"),
        passwordForm: document.getElementById("passwordForm"),

        fotoPreview: document.getElementById("perfilFotoPreview"),
        cambiarFotoBtn: document.getElementById("cambiarFotoBtn"),
        fotoInput: document.getElementById("perfilFotoInput"),

        username: document.getElementById("perfilUsername"),
        nombre: document.getElementById("perfilNombre"),
        apellido: document.getElementById("perfilApellido"),
        correo: document.getElementById("perfilCorreo"),

        tipoDocumento: document.getElementById("perfilTipoDocumento"),
        numeroDocumento: document.getElementById("perfilNumeroDocumento"),
        telefono: document.getElementById("perfilTelefono"),
        fechaNacimiento: document.getElementById("perfilFechaNacimiento"),
        genero: document.getElementById("perfilGenero"),

        rol: document.getElementById("perfilRol"),
        estado: document.getElementById("perfilEstado"),
        fechaRegistro: document.getElementById("perfilFechaRegistro"),

        nombreCompleto: document.getElementById("perfilNombreCompleto"),
        usernameDisplay: document.getElementById("perfilUsernameDisplay"),
        rolBadge: document.getElementById("perfilRolBadge"),
        estadoBadge: document.getElementById("perfilEstadoBadge"),

        passwordActual: document.getElementById("passwordActual"),
        passwordNueva: document.getElementById("passwordNueva"),
        passwordConfirmar: document.getElementById("passwordConfirmar")
    };


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

    if (elementos.volverBtn) {
        elementos.volverBtn.addEventListener("click", function () {
            window.history.back();
        });
    }


    /*
     * =========================================================
     * CARGAR PERFIL
     * =========================================================
     */

    async function cargarPerfil() {

        try {

            const response = await fetch("/api/auth/perfil", {
                method: "GET",
                headers: {
                    "Authorization": "Basic " + auth
                }
            });

            if (response.status === 401) {
                cerrarSesion();
                return;
            }

            if (!response.ok) {
                throw new Error("No se pudo cargar la información del perfil.");
            }

            const perfil = await response.json();

            /*
             * DATOS EDITABLES
             */

            establecerValor(elementos.username, perfil.username);
            establecerValor(elementos.nombre, perfil.nombre);
            establecerValor(elementos.apellido, perfil.apellido);
            establecerValor(elementos.correo, perfil.correo);


            /*
             * INFORMACIÓN PERSONAL
             */

            establecerTexto(elementos.tipoDocumento, perfil.tipoDocumento);
            establecerTexto(elementos.numeroDocumento, perfil.numeroDocumento);
            establecerTexto(elementos.telefono, perfil.telefono);
            establecerTexto(
                elementos.fechaNacimiento,
                formatearFecha(perfil.fechaNacimiento)
            );
            establecerTexto(elementos.genero, perfil.genero);


            /*
             * INFORMACIÓN DE CUENTA
             */

            establecerTexto(elementos.rol, obtenerRolLegible(perfil.rol));
            establecerTexto(elementos.estado, perfil.estado);

            establecerTexto(
                elementos.fechaRegistro,
                formatearFechaHora(perfil.fechaRegistro)
            );


            /*
             * CABECERA DEL DASHBOARD
             */

            actualizarCabecera(perfil);


            /*
             * FOTO DE PERFIL
             */

            fotoActual = perfil.foto || null;

            mostrarFoto(fotoActual);

        } catch (error) {

            console.error("Error al cargar perfil:", error);

            mostrarMensaje(
                "No se pudo cargar la información del perfil.",
                "error",
                elementos.perfilForm
            );
        }
    }


    /*
     * =========================================================
     * ACTUALIZAR CABECERA
     * =========================================================
     */

    function actualizarCabecera(perfil) {

        const nombre = (perfil.nombre || "").trim();
        const apellido = (perfil.apellido || "").trim();
        const username = perfil.username || usernameSesion;
        const rol = obtenerRolLegible(perfil.rol || rolSesion);
        const estado = perfil.estado || "-";

        const nombreCompleto = `${nombre} ${apellido}`.trim();

        establecerTexto(
            elementos.nombreCompleto,
            nombreCompleto || username || "Mi cuenta"
        );

        establecerTexto(
            elementos.usernameDisplay,
            username ? `@${username}` : "@usuario"
        );

        establecerTexto(elementos.rolBadge, rol);
        establecerTexto(elementos.estadoBadge, estado);
    }


    /*
     * =========================================================
     * OBTENER ROL LEGIBLE
     * =========================================================
     */

    function obtenerRolLegible(rol) {

        if (!rol) {
            return "-";
        }

        const roles = {
            ADMIN: "Administrador",
            SECRETARIA: "Secretaria",
            SENSEI: "Sensei",
            ESTUDIANTE: "Estudiante"
        };

        return roles[rol.toUpperCase()] || rol;
    }


    /*
     * =========================================================
     * MOSTRAR FOTO
     * =========================================================
     */

    function mostrarFoto(foto) {

        if (!elementos.fotoPreview) {
            return;
        }

        elementos.fotoPreview.onerror = function () {
            this.onerror = null;
            this.src = "/img/default-avatar.png";
        };

        elementos.fotoPreview.src =
            foto || "/img/default-avatar.png";
    }


    /*
     * =========================================================
     * SELECCIONAR FOTO
     * =========================================================
     */

    if (elementos.cambiarFotoBtn && elementos.fotoInput) {

        elementos.cambiarFotoBtn.addEventListener("click", function () {
            elementos.fotoInput.click();
        });
    }


    if (elementos.fotoInput) {

        elementos.fotoInput.addEventListener("change", function () {

            const archivo = this.files[0];

            if (!archivo) {
                return;
            }

            /*
             * VALIDAR FORMATO
             */

            const tiposPermitidos = [
                "image/jpeg",
                "image/png",
                "image/webp"
            ];

            if (!tiposPermitidos.includes(archivo.type)) {

                mostrarMensaje(
                    "La fotografía debe ser JPG, PNG o WEBP.",
                    "error",
                    elementos.perfilForm
                );

                this.value = "";
                fotoSeleccionada = null;

                return;
            }


            /*
             * VALIDAR TAMAÑO: 5 MB
             */

            const maximo = 5 * 1024 * 1024;

            if (archivo.size > maximo) {

                mostrarMensaje(
                    "La fotografía no puede superar los 5 MB.",
                    "error",
                    elementos.perfilForm
                );

                this.value = "";
                fotoSeleccionada = null;

                return;
            }


            /*
             * GUARDAR ARCHIVO
             */

            fotoSeleccionada = archivo;


            /*
             * VISTA PREVIA
             */

            const reader = new FileReader();

            reader.onload = function (event) {

                if (elementos.fotoPreview) {
                    elementos.fotoPreview.src = event.target.result;
                }
            };

            reader.onerror = function () {

                fotoSeleccionada = null;
                elementos.fotoInput.value = "";

                mostrarMensaje(
                    "No se pudo visualizar la fotografía seleccionada.",
                    "error",
                    elementos.perfilForm
                );
            };

            reader.readAsDataURL(archivo);

        });
    }


    /*
     * =========================================================
     * GUARDAR PERFIL
     * =========================================================
     */

    if (elementos.perfilForm) {

        elementos.perfilForm.addEventListener("submit", async function (event) {

            event.preventDefault();

            limpiarMensaje(elementos.perfilForm);


            /*
             * OBTENER VALORES
             */

            const username = elementos.username.value.trim();
            const nombre = elementos.nombre.value.trim();
            const apellido = elementos.apellido.value.trim();
            const correo = elementos.correo.value.trim();


            /*
             * VALIDACIONES
             */

            if (!username) {

                mostrarMensaje(
                    "El nombre de usuario es obligatorio.",
                    "error",
                    elementos.perfilForm
                );

                elementos.username.focus();
                return;
            }

            if (!nombre) {

                mostrarMensaje(
                    "El nombre es obligatorio.",
                    "error",
                    elementos.perfilForm
                );

                elementos.nombre.focus();
                return;
            }

            if (!apellido) {

                mostrarMensaje(
                    "El apellido es obligatorio.",
                    "error",
                    elementos.perfilForm
                );

                elementos.apellido.focus();
                return;
            }

            if (!correo) {

                mostrarMensaje(
                    "El correo es obligatorio.",
                    "error",
                    elementos.perfilForm
                );

                elementos.correo.focus();
                return;
            }


            /*
             * FORM DATA
             *
             * No establecer Content-Type manualmente.
             * El navegador genera el boundary.
             */

            const formData = new FormData();

            formData.append("username", username);
            formData.append("nombre", nombre);
            formData.append("apellido", apellido);
            formData.append("correo", correo);


            /*
             * FOTO OPCIONAL
             */

            if (fotoSeleccionada) {
                formData.append("foto", fotoSeleccionada);
            }


            /*
             * DETECTAR CAMBIO DE USERNAME
             */

            const usernameCambio = username !== usernameSesion;


            /*
             * ESTADO DEL BOTÓN
             */

            const boton = establecerEstadoBoton(
                elementos.perfilForm,
                true,
                "Guardando..."
            );


            try {

                const response = await fetch("/api/auth/perfil", {
                    method: "PUT",
                    headers: {
                        "Authorization": "Basic " + auth
                    },
                    body: formData
                });


                /*
                 * AUTENTICACIÓN INVÁLIDA
                 */

                if (response.status === 401) {
                    cerrarSesion();
                    return;
                }


                /*
                 * ERROR DEL BACKEND
                 */

                if (!response.ok) {

                    const mensaje = await obtenerMensajeError(response);

                    throw new Error(mensaje);
                }


                /*
                 * RESPUESTA
                 */

                const perfilActualizado = await leerRespuestaJSON(response);


                /*
                 * ACTUALIZAR FORMULARIO
                 */

                const datos = {
                    username: perfilActualizado.username || username,
                    nombre: perfilActualizado.nombre || nombre,
                    apellido: perfilActualizado.apellido || apellido,
                    correo: perfilActualizado.correo || correo
                };

                establecerValor(elementos.username, datos.username);
                establecerValor(elementos.nombre, datos.nombre);
                establecerValor(elementos.apellido, datos.apellido);
                establecerValor(elementos.correo, datos.correo);


                /*
                 * ACTUALIZAR CABECERA
                 */

                actualizarCabecera({
                    ...perfilActualizado,
                    ...datos,
                    rol: perfilActualizado.rol || rolSesion
                });


                /*
                 * ACTUALIZAR FOTO
                 */

                if (perfilActualizado.foto !== undefined) {
                    fotoActual = perfilActualizado.foto || null;
                }

                fotoSeleccionada = null;

                if (elementos.fotoInput) {
                    elementos.fotoInput.value = "";
                }

                mostrarFoto(fotoActual);


                /*
                 * SI CAMBIÓ EL USERNAME
                 *
                 * Las credenciales Basic Auth actuales
                 * dejan de ser válidas.
                 */

                if (usernameCambio) {

                    mostrarMensaje(
                        "Perfil actualizado. Debes iniciar sesión nuevamente.",
                        "success",
                        elementos.perfilForm
                    );

                    setTimeout(cerrarSesion, 1500);

                    return;
                }


                /*
                 * ACTUALIZAR USERNAME DE SESIÓN
                 */

                sessionStorage.setItem(
                    "kihonUsername",
                    datos.username
                );


                mostrarMensaje(
                    "Perfil actualizado correctamente.",
                    "success",
                    elementos.perfilForm
                );

            } catch (error) {

                console.error("Error al actualizar perfil:", error);

                mostrarMensaje(
                    error.message || "No se pudo actualizar el perfil.",
                    "error",
                    elementos.perfilForm
                );

            } finally {

                restaurarEstadoBoton(boton);
            }

        });
    }


    /*
     * =========================================================
     * CAMBIAR CONTRASEÑA
     * =========================================================
     */

    if (elementos.passwordForm) {

        elementos.passwordForm.addEventListener("submit", async function (event) {

            event.preventDefault();

            limpiarMensaje(elementos.passwordForm);


            /*
             * OBTENER VALORES
             */

            const actual = elementos.passwordActual.value;
            const nueva = elementos.passwordNueva.value;
            const confirmar = elementos.passwordConfirmar.value;


            /*
             * VALIDACIONES
             */

            if (!actual) {

                mostrarMensaje(
                    "Ingresa tu contraseña actual.",
                    "error",
                    elementos.passwordForm
                );

                elementos.passwordActual.focus();
                return;
            }

            if (!nueva) {

                mostrarMensaje(
                    "Ingresa una nueva contraseña.",
                    "error",
                    elementos.passwordForm
                );

                elementos.passwordNueva.focus();
                return;
            }

            if (nueva.length < 6) {

                mostrarMensaje(
                    "La nueva contraseña debe tener al menos 6 caracteres.",
                    "error",
                    elementos.passwordForm
                );

                elementos.passwordNueva.focus();
                return;
            }

            if (!confirmar) {

                mostrarMensaje(
                    "Confirma la nueva contraseña.",
                    "error",
                    elementos.passwordForm
                );

                elementos.passwordConfirmar.focus();
                return;
            }

            if (nueva !== confirmar) {

                mostrarMensaje(
                    "Las nuevas contraseñas no coinciden.",
                    "error",
                    elementos.passwordForm
                );

                elementos.passwordConfirmar.focus();
                return;
            }

            if (actual === nueva) {

                mostrarMensaje(
                    "La nueva contraseña debe ser diferente a la actual.",
                    "error",
                    elementos.passwordForm
                );

                elementos.passwordNueva.focus();
                return;
            }


            /*
             * ESTADO DEL BOTÓN
             */

            const boton = establecerEstadoBoton(
                elementos.passwordForm,
                true,
                "Actualizando..."
            );


            try {

                const response = await fetch("/api/auth/perfil/password", {
                    method: "PATCH",
                    headers: {
                        "Authorization": "Basic " + auth,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        passwordActual: actual,
                        passwordNueva: nueva
                    })
                });


                /*
                 * AUTENTICACIÓN INVÁLIDA
                 */

                if (response.status === 401) {
                    cerrarSesion();
                    return;
                }


                /*
                 * ERROR DEL BACKEND
                 */

                if (!response.ok) {

                    const mensaje = await obtenerMensajeError(response);

                    throw new Error(mensaje);
                }


                /*
                 * LIMPIAR FORMULARIO
                 */

                elementos.passwordForm.reset();


                /*
                 * MENSAJE DE ÉXITO
                 */

                mostrarMensaje(
                    "Contraseña actualizada. Debes iniciar sesión nuevamente.",
                    "success",
                    elementos.passwordForm
                );


                /*
                 * CERRAR SESIÓN
                 *
                 * La contraseña almacenada en kihonAuth
                 * ya no corresponde a la contraseña actual.
                 */

                setTimeout(cerrarSesion, 1500);

            } catch (error) {

                console.error("Error al cambiar contraseña:", error);

                mostrarMensaje(
                    error.message || "No se pudo cambiar la contraseña.",
                    "error",
                    elementos.passwordForm
                );

            } finally {

                restaurarEstadoBoton(boton);
            }

        });
    }


    /*
     * =========================================================
     * MENSAJES VISUALES
     * =========================================================
     */

    function mostrarMensaje(mensaje, tipo = "info", formulario = null) {

        if (!formulario) {
            console.log(`[${tipo.toUpperCase()}] ${mensaje}`);
            return;
        }

        let contenedor = formulario.querySelector(".perfil-message");

        /*
         * CREAR CONTENEDOR SI NO EXISTE
         */

        if (!contenedor) {

            contenedor = document.createElement("div");

            contenedor.className = "perfil-message";

            contenedor.setAttribute("role", "status");
            contenedor.setAttribute("aria-live", "polite");

            formulario.insertBefore(
                contenedor,
                formulario.firstChild
            );
        }


        /*
         * ACTUALIZAR MENSAJE
         */

        contenedor.className = `perfil-message perfil-message--${tipo}`;
        contenedor.textContent = mensaje;
        contenedor.hidden = false;

        contenedor.setAttribute(
            "role",
            tipo === "error" ? "alert" : "status"
        );
    }


    /*
     * =========================================================
     * LIMPIAR MENSAJE
     * =========================================================
     */

    function limpiarMensaje(formulario) {

        if (!formulario) {
            return;
        }

        const contenedor = formulario.querySelector(".perfil-message");

        if (contenedor) {
            contenedor.hidden = true;
            contenedor.textContent = "";
        }
    }


    /*
     * =========================================================
     * ESTADO DE BOTONES
     * =========================================================
     */

    function establecerEstadoBoton(formulario, cargando, texto) {

        if (!formulario) {
            return null;
        }

        const boton = formulario.querySelector(
            'button[type="submit"], input[type="submit"]'
        );

        if (!boton) {
            return null;
        }

        const estado = {
            boton: boton,
            disabled: boton.disabled,
            contenido: boton.tagName === "INPUT"
                ? boton.value
                : boton.innerHTML
        };

        if (cargando) {

            boton.disabled = true;

            if (boton.tagName === "INPUT") {
                boton.value = texto;
            } else {
                boton.textContent = texto;
            }
        }

        return estado;
    }


    /*
     * =========================================================
     * RESTAURAR BOTÓN
     * =========================================================
     */

    function restaurarEstadoBoton(estado) {

        if (!estado || !estado.boton) {
            return;
        }

        estado.boton.disabled = estado.disabled;

        if (estado.boton.tagName === "INPUT") {
            estado.boton.value = estado.contenido;
        } else {
            estado.boton.innerHTML = estado.contenido;
        }
    }


    /*
     * =========================================================
     * UTILIDADES DOM
     * =========================================================
     */

    function establecerValor(elemento, valor) {

        if (elemento) {
            elemento.value = valor || "";
        }
    }


    function establecerTexto(elemento, valor) {

        if (elemento) {
            elemento.textContent = valor || "-";
        }
    }


    /*
     * =========================================================
     * LEER RESPUESTA JSON
     * =========================================================
     */

    async function leerRespuestaJSON(response) {

        try {
            return await response.json();
        } catch (error) {
            return {};
        }
    }


    /*
     * =========================================================
     * FORMATEAR FECHA
     * =========================================================
     */

    function formatearFecha(fecha) {

        if (!fecha) {
            return "-";
        }

        const partes = String(fecha).split("-");

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

        const partes = String(fecha).split("T");

        const fechaParte = formatearFecha(partes[0]);

        if (partes.length === 1) {
            return fechaParte;
        }

        const hora = partes[1].substring(0, 5);

        return `${fechaParte} ${hora}`;
    }


    /*
     * =========================================================
     * OBTENER ERROR DEL BACKEND
     * =========================================================
     */

    async function obtenerMensajeError(response) {

        try {

            const data = await response.clone().json();

            if (data.message) {
                return data.message;
            }

            if (data.error) {
                return data.error;
            }

        } catch (error) {

            try {

                const texto = await response.text();

                if (texto) {
                    return texto;
                }

            } catch (errorTexto) {
                // No se pudo leer el cuerpo de la respuesta.
            }
        }

        return "Ocurrió un error al procesar la solicitud.";
    }


    /*
     * =========================================================
     * CERRAR SESIÓN
     * =========================================================
     */

    function cerrarSesion() {

        sessionStorage.removeItem("kihonAuth");
        sessionStorage.removeItem("kihonUsername");
        sessionStorage.removeItem("kihonRol");

        window.location.href = "/login";
    }


    /*
     * =========================================================
     * INICIALIZAR
     * =========================================================
     */

    cargarPerfil();

});
