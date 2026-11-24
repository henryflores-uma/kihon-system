document.addEventListener("DOMContentLoaded", async function () {

    /*
     * =========================================================
     * AUTENTICACIÓN Y SESIÓN HTTP
     * =========================================================
     */

    const RUTAS_DASHBOARD = {
        ADMIN: "/admin/admin",
        SECRETARIA: "/secretaria/secretaria",
        SENSEI: "/sensei/sensei",
        ESTUDIANTE: "/estudiante/estudiante"
    };

    let usernameSesion = null;
    let rolSesion = null;
    let perfilOriginal = null;

    let fotoActual = null;
    let fotoSeleccionada = null;

    function normalizarRol(rol) {
        const equivalencias = {
            ADMIN: "ADMIN",
            SECRETARIA: "SECRETARIA",
            SENSEI: "SENSEI",
            PROFESOR: "SENSEI",
            ESTUDIANTE: "ESTUDIANTE",
            ALUMNO: "ESTUDIANTE"
        };

        const valor = String(rol || "").trim().toUpperCase();

        return equivalencias[valor] || valor;
    }

    function limpiarSesionLocal() {
        sessionStorage.removeItem("kihonAuth");
        sessionStorage.removeItem("kihonUsername");
        sessionStorage.removeItem("kihonRol");
    }

    async function verificarSesion() {
        try {
            const response = await fetch("/api/auth/me", {
                method: "GET",
                credentials: "same-origin",
                headers: {
                    Accept: "application/json"
                }
            });

            if (response.status === 401 || response.status === 403) {
                limpiarSesionLocal();
                window.location.replace("/login");
                return false;
            }

            if (!response.ok) {
                throw new Error("No se pudo verificar la sesión.");
            }

            const usuario = await response.json();

            usernameSesion = usuario.username;
            rolSesion = normalizarRol(usuario.rol);

            if (!usernameSesion || !RUTAS_DASHBOARD[rolSesion]) {
                limpiarSesionLocal();
                window.location.replace("/login");
                return false;
            }

            sessionStorage.setItem("kihonUsername", usernameSesion);
            sessionStorage.setItem("kihonRol", rolSesion);
            sessionStorage.removeItem("kihonAuth");

            return true;

        } catch (error) {
            console.error("Error verificando sesión:", error);

            mostrarMensaje(
                "No se pudo verificar tu sesión. Recarga la página o vuelve a iniciar sesión.",
                "error",
                elementos.perfilForm
            );

            return false;
        }
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
     * VISIBILIDAD DE CONTRASEÑAS
     * =========================================================
     * Agrega controles Mostrar/Ocultar sin exigir cambios en HTML.
     * Cada input y su botón comparten un contenedor independiente.
     */

    function configurarVisibilidadContrasena(input) {
        if (!input || input.dataset.visibilityConfigured === "true") {
            return;
        }

        input.dataset.visibilityConfigured = "true";

        // Crear contenedor exclusivo para el input y el botón.
        const wrapper = document.createElement("div");
        wrapper.className = "password-input-wrapper";

        // Insertar el contenedor donde estaba originalmente el input.
        input.parentNode.insertBefore(wrapper, input);

        // Mover el input dentro del contenedor.
        wrapper.appendChild(input);

        // Crear botón Mostrar/Ocultar.
        const boton = document.createElement("button");

        boton.type = "button";
        boton.className = "password-visibility-toggle";
        boton.textContent = "Mostrar";
        boton.setAttribute("aria-label", "Mostrar contraseña");
        boton.setAttribute("aria-pressed", "false");

        boton.addEventListener("click", function () {
            const mostrar = input.type === "password";

            input.type = mostrar ? "text" : "password";

            boton.textContent = mostrar ? "Ocultar" : "Mostrar";

            boton.setAttribute(
                "aria-label",
                mostrar ? "Ocultar contraseña" : "Mostrar contraseña"
            );

            boton.setAttribute("aria-pressed", String(mostrar));
        });

        // Agregar el botón dentro del mismo contenedor.
        wrapper.appendChild(boton);
    }

    // Configurar los tres campos.
    [
        elementos.passwordActual,
        elementos.passwordNueva,
        elementos.passwordConfirmar
    ].forEach(configurarVisibilidadContrasena);



    /*
     * =========================================================
     * VOLVER AL DASHBOARD
     * =========================================================
     */

    if (elementos.volverBtn) {
        elementos.volverBtn.addEventListener("click", function () {
            const destino = RUTAS_DASHBOARD[rolSesion];

            if (destino) {
                window.location.href = destino;
            } else {
                window.location.href = "/login";
            }
        });
    }


    /*
     * =========================================================
     * TOKEN CSRF
     * =========================================================
     */

    async function obtenerTokenCSRF() {
        const response = await fetch("/api/auth/csrf", {
            method: "GET",
            credentials: "same-origin",
            headers: {
                Accept: "application/json"
            }
        });

        if (response.status === 401 || response.status === 403) {
            throw new Error("Tu sesión ha expirado. Inicia sesión nuevamente.");
        }

        if (!response.ok) {
            throw new Error("No se pudo obtener el token de seguridad.");
        }

        const data = await response.json();

        if (!data.token) {
            throw new Error("El servidor no proporcionó un token CSRF.");
        }

        return data.token;
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
                credentials: "same-origin",
                headers: {
                    Accept: "application/json"
                }
            });

            if (response.status === 401) {
                limpiarSesionLocal();
                window.location.replace("/login");
                return;
            }

            if (response.status === 403) {
                throw new Error("No tienes permisos para consultar este perfil.");
            }

            if (!response.ok) {
                throw new Error("No se pudo cargar la información del perfil.");
            }

            const perfil = await response.json();

            perfilOriginal = perfil;

            // DATOS EDITABLES

            establecerValor(elementos.username, perfil.username);
            establecerValor(elementos.nombre, perfil.nombre);
            establecerValor(elementos.apellido, perfil.apellido);
            establecerValor(elementos.correo, perfil.correo);


            // INFORMACIÓN PERSONAL

            establecerTexto(elementos.tipoDocumento, perfil.tipoDocumento);
            establecerTexto(elementos.numeroDocumento, perfil.numeroDocumento);
            establecerTexto(elementos.telefono, perfil.telefono);

            establecerTexto(
                elementos.fechaNacimiento,
                formatearFecha(perfil.fechaNacimiento)
            );

            establecerTexto(elementos.genero, perfil.genero);


            // INFORMACIÓN DE CUENTA

            establecerTexto(elementos.rol, obtenerRolLegible(perfil.rol));
            establecerTexto(elementos.estado, perfil.estado);

            establecerTexto(
                elementos.fechaRegistro,
                formatearFechaHora(perfil.fechaRegistro)
            );


            // CABECERA

            actualizarCabecera(perfil);


            // FOTO

            fotoActual = obtenerFotoUrl(perfil);

            mostrarFoto(fotoActual);

        } catch (error) {
            console.error("Error al cargar perfil:", error);

            mostrarMensaje(
                error.message || "No se pudo cargar la información del perfil.",
                "error",
                elementos.perfilForm
            );
        }
    }


    /*
     * =========================================================
     * OBTENER URL DE FOTO
     * =========================================================
     */

    function obtenerFotoUrl(perfil) {
        return perfil.fotoUrl ||
            perfil.foto ||
            perfil.estudianteFotoUrl ||
            perfil.estudianteFoto ||
            null;
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
            PROFESOR: "Sensei",
            ESTUDIANTE: "Estudiante",
            ALUMNO: "Estudiante"
        };

        const valor = String(rol).trim().toUpperCase();

        return roles[valor] || rol;
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

            fotoSeleccionada = archivo;

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
     * VALIDAR DATOS DEL PERFIL
     * =========================================================
     */

    function validarPerfil(username, nombre, apellido, correo) {
        if (!username) {
            return {
                mensaje: "El nombre de usuario es obligatorio.",
                elemento: elementos.username
            };
        }

        if (username.length < 4 || username.length > 30) {
            return {
                mensaje: "El nombre de usuario debe tener entre 4 y 30 caracteres.",
                elemento: elementos.username
            };
        }

        if (!/^[a-zA-Z0-9._-]+$/.test(username)) {
            return {
                mensaje: "El nombre de usuario solo puede contener letras, números, puntos, guiones y guiones bajos.",
                elemento: elementos.username
            };
        }

        if (!nombre) {
            return {
                mensaje: "El nombre es obligatorio.",
                elemento: elementos.nombre
            };
        }

        if (!apellido) {
            return {
                mensaje: "El apellido es obligatorio.",
                elemento: elementos.apellido
            };
        }

        if (!correo) {
            return {
                mensaje: "El correo es obligatorio.",
                elemento: elementos.correo
            };
        }

        if (!elementos.correo.checkValidity()) {
            return {
                mensaje: "Ingresa un correo electrónico válido.",
                elemento: elementos.correo
            };
        }

        return null;
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

            const username = elementos.username.value.trim();
            const nombre = elementos.nombre.value.trim();
            const apellido = elementos.apellido.value.trim();
            const correo = elementos.correo.value.trim();

            const errorValidacion = validarPerfil(
                username,
                nombre,
                apellido,
                correo
            );

            if (errorValidacion) {
                mostrarMensaje(
                    errorValidacion.mensaje,
                    "error",
                    elementos.perfilForm
                );

                errorValidacion.elemento.focus();
                return;
            }

            const formData = new FormData();

            formData.append("username", username);
            formData.append("nombre", nombre);
            formData.append("apellido", apellido);
            formData.append("correo", correo);

            if (fotoSeleccionada) {
                formData.append("foto", fotoSeleccionada);
            }

            const usernameAnterior = perfilOriginal?.username || usernameSesion;
            const usernameCambio = username !== usernameAnterior;

            const boton = establecerEstadoBoton(
                elementos.perfilForm,
                true,
                "Guardando..."
            );

            try {
                const csrfToken = await obtenerTokenCSRF();

                const response = await fetch("/api/auth/perfil", {
                    method: "PUT",
                    credentials: "same-origin",
                    headers: {
                        "X-CSRF-TOKEN": csrfToken,
                        Accept: "application/json"
                    },
                    body: formData
                });

                if (response.status === 401) {
                    limpiarSesionLocal();
                    window.location.replace("/login");
                    return;
                }

                if (!response.ok) {
                    const mensaje = await obtenerMensajeError(response);
                    throw new Error(mensaje);
                }

                /*
                 * Si cambió el username, cerrar la sesión inmediatamente.
                 * Spring Security conserva temporalmente el principal anterior,
                 * por lo que no debemos volver a consultar el perfil.
                 */

                if (usernameCambio) {
                    mostrarMensaje(
                        "Perfil actualizado. Debes iniciar sesión nuevamente.",
                        "success",
                        elementos.perfilForm
                    );

                    await esperar(1200);
                    await cerrarSesion();
                    return;
                }

                let perfilActualizado = await leerRespuestaJSON(response);

                /*
                 * Si el endpoint no devuelve contenido JSON,
                 * se vuelve a consultar el perfil.
                 */

                if (!perfilActualizado.username) {
                    const perfilResponse = await fetch("/api/auth/perfil", {
                        method: "GET",
                        credentials: "same-origin",
                        headers: {
                            Accept: "application/json"
                        }
                    });

                    if (!perfilResponse.ok) {
                        throw new Error(
                            "El perfil se actualizó, pero no se pudieron recuperar los datos."
                        );
                    }

                    perfilActualizado = await perfilResponse.json();
                }

                perfilActualizado = {
                    ...perfilActualizado,
                    username: perfilActualizado.username || username,
                    nombre: perfilActualizado.nombre || nombre,
                    apellido: perfilActualizado.apellido || apellido,
                    correo: perfilActualizado.correo || correo,
                    rol: perfilActualizado.rol || rolSesion
                };

                perfilOriginal = perfilActualizado;

                establecerValor(elementos.username, perfilActualizado.username);
                establecerValor(elementos.nombre, perfilActualizado.nombre);
                establecerValor(elementos.apellido, perfilActualizado.apellido);
                establecerValor(elementos.correo, perfilActualizado.correo);

                actualizarCabecera(perfilActualizado);

                fotoActual = obtenerFotoUrl(perfilActualizado) || fotoActual;
                fotoSeleccionada = null;

                if (elementos.fotoInput) {
                    elementos.fotoInput.value = "";
                }

                mostrarFoto(fotoActual);

                sessionStorage.setItem(
                    "kihonUsername",
                    perfilActualizado.username
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

            const actual = elementos.passwordActual.value;
            const nueva = elementos.passwordNueva.value;
            const confirmar = elementos.passwordConfirmar.value;

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

            if (nueva.length < 8 || nueva.length > 72) {
                mostrarMensaje(
                    "La nueva contraseña debe tener entre 8 y 72 caracteres.",
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

            const boton = establecerEstadoBoton(
                elementos.passwordForm,
                true,
                "Actualizando..."
            );

            try {
                const csrfToken = await obtenerTokenCSRF();

                const response = await fetch("/api/auth/perfil/password", {
                    method: "PATCH",
                    credentials: "same-origin",
                    headers: {
                        "X-CSRF-TOKEN": csrfToken,
                        "Content-Type": "application/json",
                        Accept: "application/json"
                    },
                    body: JSON.stringify({
                        passwordActual: actual,
                        passwordNueva: nueva
                    })
                });

                if (response.status === 401) {
                    limpiarSesionLocal();
                    window.location.replace("/login");
                    return;
                }

                if (!response.ok) {
                    const mensaje = await obtenerMensajeError(response);
                    throw new Error(mensaje);
                }

                elementos.passwordForm.reset();

                mostrarMensaje(
                    "Contraseña actualizada. Debes iniciar sesión nuevamente.",
                    "success",
                    elementos.passwordForm
                );

                await esperar(1200);
                await cerrarSesion();

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
     * CERRAR SESIÓN
     * =========================================================
     */

    async function cerrarSesion() {
        try {
            const csrfToken = await obtenerTokenCSRF();

            const response = await fetch("/api/auth/logout", {
                method: "POST",
                credentials: "same-origin",
                headers: {
                    "X-CSRF-TOKEN": csrfToken,
                    Accept: "application/json"
                }
            });

            if (!response.ok && response.status !== 204) {
                throw new Error("No se pudo cerrar la sesión en el servidor.");
            }

        } catch (error) {
            console.error("Error cerrando sesión:", error);

        } finally {
            limpiarSesionLocal();
            window.location.replace("/login");
        }
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
            boton,
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
            elemento.value = valor ?? "";
        }
    }

    function establecerTexto(elemento, valor) {
        if (elemento) {
            elemento.textContent = valor ?? "-";
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

            if (data.mensaje) {
                return data.mensaje;
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
     * ESPERAR
     * =========================================================
     */

    function esperar(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }


    /*
     * =========================================================
     * INICIALIZAR
     * =========================================================
     */

    const sesionValida = await verificarSesion();

    if (!sesionValida) {
        return;
    }

    await cargarPerfil();

});