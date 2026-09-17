document.addEventListener("DOMContentLoaded", function () {

    // ==========================================
    // ELEMENTOS DEL FORMULARIO
    // ==========================================

    const registroForm =
        document.getElementById("registroForm");

    const registroMessage =
        document.getElementById("registroMessage");

    const tipoDocumento =
        document.getElementById("tipoDocumento");

    const numeroDocumento =
        document.getElementById("numeroDocumento");

    const codigoPais =
        document.getElementById("codigoPais");

    const telefono =
        document.getElementById("telefono");

    const nombre =
        document.getElementById("nombre");

    const apellido =
        document.getElementById("apellido");

    const username =
        document.getElementById("username");

    const password =
        document.getElementById("password");

    const togglePassword =
        document.getElementById("togglePassword");

    const fechaNacimiento =
        document.getElementById("fechaNacimiento");

    const genero =
        document.getElementById("genero");

    const correo =
        document.getElementById("correo");


    // ==========================================
    // MOSTRAR / OCULTAR CONTRASEÑA
    // ==========================================

    togglePassword.addEventListener(
        "click",
        function () {

            if (password.type === "password") {

                password.type = "text";

                togglePassword.textContent = "🙈";

                togglePassword.setAttribute(
                    "aria-label",
                    "Ocultar contraseña"
                );

            } else {

                password.type = "password";

                togglePassword.textContent = "👁️";

                togglePassword.setAttribute(
                    "aria-label",
                    "Mostrar contraseña"
                );

            }

        }
    );

    // ==========================================
    // REGLAS DE TELEFONO POR PAIS
    // ==========================================

    const reglasTelefono = {

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
    // CONFIGURACION INICIAL
    // ==========================================

    const hoy =
        new Date().toISOString().split("T")[0];

    fechaNacimiento.max = hoy;

    numeroDocumento.disabled = true;


    // ==========================================
    // ACTUALIZAR REGLAS DEL TELEFONO
    // ==========================================

    function actualizarReglasTelefono() {

        const regla =
            reglasTelefono[codigoPais.value];

        if (!regla) {
            return;
        }

        telefono.value = "";

        telefono.maxLength = regla.max;

        if (regla.min === regla.max) {

            telefono.placeholder =
                `${regla.min} dígitos`;

        } else {

            telefono.placeholder =
                `${regla.min}-${regla.max} dígitos`;

        }

    }


    actualizarReglasTelefono();


    // ==========================================
    // CAMBIO DE PAIS
    // ==========================================

    codigoPais.addEventListener(
        "change",
        function () {

            actualizarReglasTelefono();

        }
    );


    // ==========================================
    // CAMBIO DE TIPO DE DOCUMENTO
    // ==========================================

    tipoDocumento.addEventListener(
        "change",
        function () {

            numeroDocumento.value = "";


            // ------------------------------
            // DNI
            // ------------------------------

            if (
                tipoDocumento.value === "DNI"
            ) {

                numeroDocumento.disabled = false;

                numeroDocumento.maxLength = 8;

                numeroDocumento.inputMode =
                    "numeric";

                numeroDocumento.pattern =
                    "[0-9]{8}";

                numeroDocumento.placeholder =
                    "8 dígitos";

            }


            // ------------------------------
            // CARNÉ DE EXTRANJERÍA
            // ------------------------------

            else if (
                tipoDocumento.value === "CE"
            ) {

                numeroDocumento.disabled = false;

                numeroDocumento.maxLength = 12;

                numeroDocumento.inputMode =
                    "text";

                numeroDocumento.pattern =
                    "[A-Za-z0-9]{1,12}";

                numeroDocumento.placeholder =
                    "Hasta 12 caracteres";

            }


            // ------------------------------
            // PASAPORTE
            // ------------------------------

            else if (
                tipoDocumento.value === "PASAPORTE"
            ) {

                numeroDocumento.disabled = false;

                numeroDocumento.maxLength = 12;

                numeroDocumento.inputMode =
                    "text";

                numeroDocumento.pattern =
                    "[A-Za-z0-9]{1,12}";

                numeroDocumento.placeholder =
                    "Hasta 12 caracteres";

            }


            // ------------------------------
            // SIN SELECCION
            // ------------------------------

            else {

                numeroDocumento.disabled = true;

                numeroDocumento.removeAttribute(
                    "maxlength"
                );

                numeroDocumento.removeAttribute(
                    "pattern"
                );

                numeroDocumento.placeholder =
                    "Selecciona el tipo de documento";

            }

        }
    );


    // ==========================================
    // LIMPIEZA DEL NUMERO DE DOCUMENTO
    // ==========================================

    numeroDocumento.addEventListener(
        "input",
        function () {

            // DNI

            if (
                tipoDocumento.value === "DNI"
            ) {

                numeroDocumento.value =
                    numeroDocumento.value
                        .replace(/\D/g, "")
                        .slice(0, 8);

            }


            // CE / PASAPORTE

            else if (
                tipoDocumento.value === "CE" ||
                tipoDocumento.value === "PASAPORTE"
            ) {

                numeroDocumento.value =
                    numeroDocumento.value
                        .replace(
                            /[^a-zA-Z0-9]/g,
                            ""
                        )
                        .slice(0, 12);

            }

        }
    );


    // ==========================================
    // LIMPIEZA DEL TELEFONO
    // ==========================================

    telefono.addEventListener(
        "input",
        function () {

            const regla =
                reglasTelefono[codigoPais.value];

            if (!regla) {
                return;
            }

            telefono.value =
                telefono.value
                    .replace(/\D/g, "")
                    .slice(0, regla.max);

        }
    );


    // ==========================================
    // VALIDACION DEL NOMBRE
    // ==========================================

    nombre.addEventListener(
        "input",
        function () {

            nombre.value =
                nombre.value
                    .replace(
                        /[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g,
                        ""
                    )
                    .slice(0, 50);

        }
    );


    // ==========================================
    // VALIDACION DEL APELLIDO
    // ==========================================

    apellido.addEventListener(
        "input",
        function () {

            apellido.value =
                apellido.value
                    .replace(
                        /[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g,
                        ""
                    )
                    .slice(0, 50);

        }
    );


    // ==========================================
    // VALIDACION DEL USERNAME
    // ==========================================

    username.addEventListener(
        "input",
        function () {

            username.value =
                username.value
                    .replace(
                        /[^a-zA-Z0-9._-]/g,
                        ""
                    )
                    .slice(0, 30);

        }
    );


    // ==========================================
    // ENVIO DEL FORMULARIO
    // ==========================================

    registroForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            registroMessage.hidden = true;

            registroMessage.textContent = "";


            // ==========================================
            // VALIDACION DEL USERNAME
            // ==========================================

            if (
                username.value.length < 4
            ) {

                mostrarMensaje(
                    "El usuario debe tener al menos 4 caracteres."
                );

                username.focus();

                return;
            }


            // ==========================================
            // VALIDACION DE CONTRASEÑA
            // ==========================================

            if (
                password.value.length < 8
            ) {

                mostrarMensaje(
                    "La contraseña debe tener al menos 8 caracteres."
                );

                password.focus();

                return;
            }


            // ==========================================
            // VALIDACION DEL TIPO DE DOCUMENTO
            // ==========================================

            if (!tipoDocumento.value) {

                mostrarMensaje(
                    "Debes seleccionar un tipo de documento."
                );

                tipoDocumento.focus();

                return;
            }


            // ==========================================
            // VALIDACION DEL NUMERO DE DOCUMENTO
            // ==========================================

            if (
                tipoDocumento.value === "DNI"
            ) {

                if (
                    !/^\d{8}$/.test(
                        numeroDocumento.value
                    )
                ) {

                    mostrarMensaje(
                        "El DNI debe contener exactamente 8 dígitos."
                    );

                    numeroDocumento.focus();

                    return;
                }

            }


            else if (
                tipoDocumento.value === "CE" ||
                tipoDocumento.value === "PASAPORTE"
            ) {

                if (
                    !/^[a-zA-Z0-9]{1,12}$/.test(
                        numeroDocumento.value
                    )
                ) {

                    mostrarMensaje(
                        "El número de documento no es válido."
                    );

                    numeroDocumento.focus();

                    return;
                }

            }


            // ==========================================
            // VALIDACION DEL TELEFONO
            // ==========================================

            if (telefono.value) {

                const regla =
                    reglasTelefono[codigoPais.value];


                if (!regla) {

                    mostrarMensaje(
                        "Selecciona un código de país válido."
                    );

                    codigoPais.focus();

                    return;
                }


                const cantidadDigitos =
                    telefono.value.length;


                // País con cantidad exacta

                if (
                    regla.min === regla.max
                ) {

                    if (
                        cantidadDigitos !==
                        regla.min
                    ) {

                        mostrarMensaje(
                            `El número de ${regla.nombre} debe contener exactamente ${regla.min} dígitos.`
                        );

                        telefono.focus();

                        return;
                    }

                }


                // País con rango

                else {

                    if (
                        cantidadDigitos < regla.min ||
                        cantidadDigitos > regla.max
                    ) {

                        mostrarMensaje(
                            `El número de ${regla.nombre} debe contener entre ${regla.min} y ${regla.max} dígitos.`
                        );

                        telefono.focus();

                        return;
                    }

                }

            }


            // ==========================================
            // VALIDACION DE FECHA DE NACIMIENTO
            // ==========================================

            if (fechaNacimiento.value) {

                const fechaSeleccionada =
                    new Date(
                        fechaNacimiento.value + "T00:00:00"
                    );

                const fechaActual =
                    new Date();

                const añoSeleccionado =
                    fechaSeleccionada.getFullYear();

                const añoActual =
                    fechaActual.getFullYear();


                // ------------------------------------------
                // VALIDAR AÑO
                // ------------------------------------------

                if (añoSeleccionado > añoActual) {

                    mostrarMensaje(
                        "El año de nacimiento no puede ser superior al año actual."
                    );

                    fechaNacimiento.focus();

                    return;
                }


                // ------------------------------------------
                // VALIDAR FECHA COMPLETA
                // ------------------------------------------

                if (fechaSeleccionada > fechaActual) {

                    mostrarMensaje(
                        "La fecha de nacimiento no puede ser futura."
                    );

                    fechaNacimiento.focus();

                    return;
                }

            }


            // ==========================================
            // CONSTRUIR TELEFONO COMPLETO
            // ==========================================

            let telefonoCompleto = "";


            if (telefono.value) {

                telefonoCompleto =
                    codigoPais.value +
                    telefono.value.trim();

            }


            // ==========================================
            // DATOS PARA EL BACKEND
            // ==========================================

            const datos = {

                username:
                    username.value.trim(),

                password:
                    password.value,

                nombre:
                    nombre.value.trim(),

                apellido:
                    apellido.value.trim(),

                tipoDocumento:
                    tipoDocumento.value,

                numeroDocumento:
                    numeroDocumento.value.trim(),

                telefono:
                    telefonoCompleto,

                fechaNacimiento:
                    fechaNacimiento.value,

                genero:
                    genero.value,

                correo:
                    correo.value.trim()

            };


            // ==========================================
            // DEBUG
            // ==========================================

            console.log(
                "Datos enviados:",
                datos
            );


            // ==========================================
            // ENVIO AL BACKEND
            // ==========================================

            try {

                const response =
                    await fetch(
                        "/api/usuarios",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(datos)
                        }
                    );


                console.log(
                    "Registro status:",
                    response.status
                );


                // ==========================================
                // USUARIO CREADO
                // ==========================================

                if (
                    response.status === 201
                ) {

                    const usuario =
                        await response.json();


                    console.log(
                        "Usuario creado:",
                        usuario
                    );


                    mostrarMensaje(
                        "Usuario creado correctamente. Tu cuenta está pendiente de activación."
                    );


                    registroMessage.style.color =
                        "green";


                    registroForm.reset();


                    // Volver a bloquear documento

                    numeroDocumento.value = "";

                    numeroDocumento.disabled = true;

                    numeroDocumento.removeAttribute(
                        "maxlength"
                    );

                    numeroDocumento.removeAttribute(
                        "pattern"
                    );

                    numeroDocumento.placeholder =
                        "Selecciona el tipo de documento";


                    // Restaurar teléfono

                    actualizarReglasTelefono();


                    // Volver al login

                    setTimeout(
                        function () {

                            window.location.href =
                                "/login";

                        },
                        5000
                    );


                    return;
                }


                // ==========================================
                // ERROR 400
                // ==========================================

                if (
                    response.status === 400
                ) {

                    const error =
                        await response.text();


                    console.error(
                        "Error de registro:",
                        error
                    );


                    mostrarMensaje(
                        "No se pudo crear el usuario. Verifica los datos ingresados."
                    );


                    return;
                }


                // ==========================================
                // ERROR 409
                // ==========================================

                if (
                    response.status === 409
                ) {

                    const error =
                        await response.text();


                    console.error(
                        "Error de registro:",
                        error
                    );


                    mostrarMensaje(
                        "El usuario ya existe o los datos ya están registrados."
                    );


                    return;
                }


                // ==========================================
                // OTROS ERRORES
                // ==========================================

                mostrarMensaje(
                    "Ocurrió un error al crear el usuario."
                );

            }


            catch (error) {

                console.error(
                    "Error de conexión:",
                    error
                );


                mostrarMensaje(
                    "No se pudo conectar con el servidor."
                );

            }

        }
    );


    // ==========================================
    // MOSTRAR MENSAJE
    // ==========================================

    function mostrarMensaje(mensaje) {

        registroMessage.textContent =
            mensaje;

        registroMessage.hidden = false;

        registroMessage.style.color = "";

    }

});