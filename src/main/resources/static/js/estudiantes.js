const auth = sessionStorage.getItem("kihonAuth");
const username = sessionStorage.getItem("kihonUsername");
const rol = sessionStorage.getItem("kihonRol");


// ==========================================
// VERIFICAR SESIÓN
// ==========================================

if (!auth) {
    window.location.href = "/login";
}


// ==========================================
// VARIABLES GLOBALES
// ==========================================

let estudiantesData = [];

let fotoNueva = null;
let quitarFotoEdicion = false;

let apoderadoActual = null;

let estudianteEditandoId = null;


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
// INICIALIZACIÓN
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    configurarUsuario();

    configurarMenuPerfil();

    configurarModalRegistro();

    configurarModalEdicion();

    configurarFotoRegistro();

    configurarFotoEdicion();

    configurarFechaNacimiento();

    configurarValidacionesRegistro();

    configurarValidacionesEdicion();

    configurarValidacionTelefono(
        "telefono",
        "codigoPais"
    );

    configurarValidacionTelefono(
        "editTelefono",
        "editCodigoPais"
    );

    configurarBusquedaYFiltros();

    cargarEstudiantes();
});


// ==========================================
// CONFIGURAR USUARIO
// ==========================================

function configurarUsuario() {

    const usernameDisplay =
        document.getElementById(
            "usernameDisplay"
        );

    const roleDisplay =
        document.getElementById(
            "roleDisplay"
        );

    const profileRoleDisplay =
        document.getElementById(
            "profileRoleDisplay"
        );

    const userAvatarInitial =
        document.getElementById(
            "userAvatarInitial"
        );

    const rolTexto =
        obtenerNombreRol(rol);


    if (usernameDisplay && username) {

        usernameDisplay.textContent =
            username;
    }


    if (roleDisplay) {

        roleDisplay.textContent =
            rolTexto;
    }


    if (profileRoleDisplay) {

        profileRoleDisplay.textContent =
            rolTexto;
    }


    if (userAvatarInitial && username) {

        userAvatarInitial.textContent =
            username
                .charAt(0)
                .toUpperCase();
    }
}


// ==========================================
// CONVERTIR ROL A TEXTO
// ==========================================

function obtenerNombreRol(rol) {

    switch (rol) {

        case "ADMIN":
            return "Administrador";

        case "SECRETARIA":
            return "Secretaria";

        case "SENSEI":
            return "Sensei";

        case "ESTUDIANTE":
            return "Estudiante";

        default:
            return "Usuario";
    }
}


// ==========================================
// MENÚ DE PERFIL
// ==========================================

function configurarMenuPerfil() {

    const profileMenuButton =
        document.getElementById(
            "profileMenuButton"
        );

    const profileMenu =
        document.getElementById(
            "profileMenu"
        );

    const topbarLogoutButton =
        document.getElementById(
            "topbarLogoutButton"
        );


    if (
        profileMenuButton &&
        profileMenu
    ) {

        profileMenuButton.addEventListener(
            "click",
            (event) => {

                event.stopPropagation();

                profileMenu.hidden =
                    !profileMenu.hidden;
            }
        );
    }


    document.addEventListener(
        "click",
        (event) => {

            const container =
                document.getElementById(
                    "profileMenuContainer"
                );

            if (
                container &&
                !container.contains(
                    event.target
                )
            ) {

                if (profileMenu) {

                    profileMenu.hidden =
                        true;
                }
            }
        }
    );


    if (topbarLogoutButton) {

        topbarLogoutButton.addEventListener(
            "click",
            (event) => {

                event.preventDefault();

                cerrarSesion();
            }
        );
    }
}


// ==========================================
// MODAL REGISTRO
// ==========================================

function configurarModalRegistro() {

    const openButton =
        document.getElementById(
            "openRegisterStudentButton"
        );

    const closeButton =
        document.getElementById(
            "closeRegisterStudentButton"
        );

    const cancelButton =
        document.getElementById(
            "cancelRegisterStudentButton"
        );

    const overlay =
        document.getElementById(
            "registerStudentModalOverlay"
        );

    const studentForm =
        document.getElementById(
            "studentForm"
        );


    if (openButton) {

        openButton.addEventListener(
            "click",
            abrirModalRegistro
        );
    }


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            cerrarModalRegistro
        );
    }


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            cerrarModalRegistro
        );
    }


    if (overlay) {

        overlay.addEventListener(
            "click",
            cerrarModalRegistro
        );
    }


    if (studentForm) {

        studentForm.addEventListener(
            "submit",
            registrarEstudiante
        );
    }
}


// ==========================================
// ABRIR MODAL REGISTRO
// ==========================================

function abrirModalRegistro() {

    const modal =
        document.getElementById(
            "registerStudentModal"
        );

    if (!modal) {
        return;
    }


    limpiarFormularioRegistro();


    modal.hidden = false;

    document.body.classList.add(
        "modal-open"
    );
}


// ==========================================
// CERRAR MODAL REGISTRO
// ==========================================

function cerrarModalRegistro() {

    const modal =
        document.getElementById(
            "registerStudentModal"
        );

    if (!modal) {
        return;
    }


    limpiarFormularioRegistro();


    modal.hidden = true;

    document.body.classList.remove(
        "modal-open"
    );
}


// ==========================================
// LIMPIAR FORMULARIO REGISTRO
// ==========================================

function limpiarFormularioRegistro() {

    const form =
        document.getElementById(
            "studentForm"
        );

    if (form) {
        form.reset();
    }


    fotoNueva = null;


    const fotoInput =
        document.getElementById("foto");

    const fotoPreview =
        document.getElementById(
            "fotoPreview"
        );

    const fotoUploadText =
        document.getElementById(
            "fotoUploadText"
        );

    const removeFotoButton =
        document.getElementById(
            "removeFotoButton"
        );

    const guardianSection =
        document.getElementById(
            "guardianSection"
        );


    if (fotoInput) {

        fotoInput.value = "";
    }


    if (fotoPreview) {

        fotoPreview.src = "";

        fotoPreview.hidden = true;
    }


    if (fotoUploadText) {

        fotoUploadText.textContent =
            "👤";
    }


    if (removeFotoButton) {

        removeFotoButton.hidden = true;
    }


    if (guardianSection) {

        guardianSection.hidden = true;
    }


    deshabilitarCamposApoderado();


    // ==========================================
    // RESTABLECER REGLAS DEL DOCUMENTO
    // ==========================================

    const tipoDocumento =
        document.getElementById(
            "tipoDocumento"
        );

    const numeroDocumento =
        document.getElementById(
            "documento"
        );

    if (
        tipoDocumento &&
        numeroDocumento
    ) {

        numeroDocumento.value = "";

        numeroDocumento.disabled =
            !tipoDocumento.value;

        configurarReglasDocumento(
            tipoDocumento,
            numeroDocumento
        );
    }


    // ==========================================
    // RESTABLECER REGLAS DEL TELÉFONO
    // ==========================================

    configurarLimiteTelefono(
        "telefono",
        "codigoPais"
    );


    ocultarMensaje(
        document.getElementById(
            "studentMessage"
        )
    );
}


// ==========================================
// MODAL EDICIÓN
// ==========================================

function configurarModalEdicion() {

    const closeButton =
        document.getElementById(
            "closeEditStudentButton"
        );

    const cancelButton =
        document.getElementById(
            "cancelEditButton"
        );

    const overlay =
        document.getElementById(
            "editStudentModalOverlay"
        );

    const editStudentForm =
        document.getElementById(
            "editStudentForm"
        );

    const editGuardianButton =
        document.getElementById(
            "editGuardianButton"
        );

    const addGuardianButton =
        document.getElementById(
            "addGuardianButton"
        );

    const cancelGuardianEditButton =
        document.getElementById(
            "cancelGuardianEditButton"
        );


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            cancelarEdicion
        );
    }


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            cancelarEdicion
        );
    }


    if (overlay) {

        overlay.addEventListener(
            "click",
            cancelarEdicion
        );
    }


    if (editStudentForm) {

        editStudentForm.addEventListener(
            "submit",
            actualizarEstudiante
        );
    }


    if (editGuardianButton) {

        editGuardianButton.addEventListener(
            "click",
            editarApoderado
        );
    }


    if (addGuardianButton) {

        addGuardianButton.addEventListener(
            "click",
            agregarApoderado
        );
    }


    if (cancelGuardianEditButton) {

        cancelGuardianEditButton.addEventListener(
            "click",
            ocultarFormularioApoderado
        );
    }


    const saveGuardianButton =
        document.getElementById(
            "saveGuardianButton"
        );

    if (saveGuardianButton) {

        saveGuardianButton.addEventListener(
            "click",
            guardarApoderado
        );
    }
}


// ==========================================
// FOTO - REGISTRO
// ==========================================

function configurarFotoRegistro() {

    const fotoInput =
        document.getElementById(
            "foto"
        );

    const fotoPreview =
        document.getElementById(
            "fotoPreview"
        );

    const fotoUploadText =
        document.getElementById(
            "fotoUploadText"
        );

    const removeFotoButton =
        document.getElementById(
            "removeFotoButton"
        );


    if (!fotoInput) {
        return;
    }


    fotoInput.addEventListener(
        "change",
        () => {

            const archivo =
                fotoInput.files[0];


            if (!archivo) {
                return;
            }


            if (
                !validarArchivoFoto(
                    archivo
                )
            ) {

                fotoInput.value = "";

                fotoNueva = null;

                return;
            }


            fotoNueva = archivo;


            const url =
                URL.createObjectURL(
                    archivo
                );


            if (fotoPreview) {

                fotoPreview.src = url;

                fotoPreview.hidden = false;
            }


            if (fotoUploadText) {

                fotoUploadText.textContent =
                    "Cambiar fotografía";
            }


            if (removeFotoButton) {

                removeFotoButton.hidden =
                    false;
            }
        }
    );


    if (removeFotoButton) {

        removeFotoButton.addEventListener(
            "click",
            () => {

                fotoInput.value = "";

                fotoNueva = null;


                if (fotoPreview) {

                    fotoPreview.src = "";

                    fotoPreview.hidden = true;
                }


                if (fotoUploadText) {

                    fotoUploadText.textContent =
                        "👤";
                }


                removeFotoButton.hidden =
                    true;
            }
        );
    }
}


// ==========================================
// FOTO - EDICIÓN
// ==========================================

function configurarFotoEdicion() {

    const fotoInput =
        document.getElementById(
            "editFoto"
        );

    const fotoPreview =
        document.getElementById(
            "editFotoPreview"
        );

    const fotoUploadText =
        document.getElementById(
            "editFotoUploadText"
        );

    const removeFotoButton =
        document.getElementById(
            "removeEditFotoButton"
        );


    if (!fotoInput) {
        return;
    }


    fotoInput.addEventListener(
        "change",
        () => {

            const archivo =
                fotoInput.files[0];


            if (!archivo) {
                return;
            }


            if (
                !validarArchivoFoto(
                    archivo
                )
            ) {

                fotoInput.value = "";

                fotoNueva = null;

                return;
            }


            fotoNueva = archivo;

            quitarFotoEdicion = false;


            const url =
                URL.createObjectURL(
                    archivo
                );


            if (fotoPreview) {

                fotoPreview.src = url;

                fotoPreview.hidden = false;
            }


            if (fotoUploadText) {

                fotoUploadText.textContent =
                    "Cambiar fotografía";
            }


            if (removeFotoButton) {

                removeFotoButton.hidden =
                    false;
            }
        }
    );


    if (removeFotoButton) {

        removeFotoButton.addEventListener(
            "click",
            () => {

                fotoInput.value = "";

                fotoNueva = null;

                quitarFotoEdicion = true;


                if (fotoPreview) {

                    fotoPreview.src = "";

                    fotoPreview.hidden = true;
                }


                if (fotoUploadText) {

                    fotoUploadText.textContent =
                        "👤";
                }


                removeFotoButton.hidden =
                    false;
            }
        );
    }
}


// ==========================================
// VALIDAR FOTO
// ==========================================

function validarArchivoFoto(archivo) {

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

        alert(
            "La fotografía debe ser JPG, PNG o WEBP."
        );

        return false;
    }


    const tamanioMaximo =
        5 * 1024 * 1024;


    if (
        archivo.size >
        tamanioMaximo
    ) {

        alert(
            "La fotografía no puede superar los 5 MB."
        );

        return false;
    }


    return true;
}


// ==========================================
// CONFIGURAR FECHA DE NACIMIENTO
// ==========================================

function configurarFechaNacimiento() {

    const fechaNacimiento =
        document.getElementById(
            "fechaNacimiento"
        );


    if (!fechaNacimiento) {
        return;
    }


    const hoy =
        new Date()
            .toISOString()
            .split("T")[0];


    fechaNacimiento.max = hoy;


    fechaNacimiento.addEventListener(
        "change",
        verificarEdadEstudiante
    );


    verificarEdadEstudiante();
}


// ==========================================
// VERIFICAR EDAD DEL ESTUDIANTE
// ==========================================

function verificarEdadEstudiante() {

    const fechaNacimiento =
        document.getElementById(
            "fechaNacimiento"
        );

    const guardianSection =
        document.getElementById(
            "guardianSection"
        );


    if (
        !fechaNacimiento ||
        !guardianSection
    ) {
        return;
    }


    const valor =
        fechaNacimiento.value;


    if (!valor) {

        guardianSection.hidden =
            true;

        deshabilitarCamposApoderado();

        return;
    }


    const edad =
        calcularEdad(valor);


    if (edad < 18) {

        guardianSection.hidden =
            false;

        habilitarCamposApoderado();

    } else {

        guardianSection.hidden =
            true;

        deshabilitarCamposApoderado();
    }
}


// ==========================================
// CALCULAR EDAD
// ==========================================

function calcularEdad(
    fechaNacimiento
) {

    const fecha =
        new Date(
            fechaNacimiento +
            "T00:00:00"
        );


    const hoy =
        new Date();


    let edad =
        hoy.getFullYear() -
        fecha.getFullYear();


    const mes =
        hoy.getMonth() -
        fecha.getMonth();


    if (
        mes < 0 ||
        (
            mes === 0 &&
            hoy.getDate() <
            fecha.getDate()
        )
    ) {

        edad--;
    }


    return edad;
}


// ==========================================
// HABILITAR APODERADO
// ==========================================

function habilitarCamposApoderado() {

    const campos = [
        "guardianNombre",
        "guardianApellido",
        "guardianTipoDocumento",
        "guardianDocumento",
        "guardianTelefono",
        "guardianCorreo",
        "guardianDireccion",
        "guardianParentesco"
    ];


    campos.forEach(
        id => {

            const campo =
                document.getElementById(
                    id
                );


            if (campo) {

                campo.disabled = false;
            }
        }
    );
}


// ==========================================
// DESHABILITAR APODERADO
// ==========================================

function deshabilitarCamposApoderado() {

    const campos = [
        "guardianNombre",
        "guardianApellido",
        "guardianTipoDocumento",
        "guardianDocumento",
        "guardianTelefono",
        "guardianCorreo",
        "guardianDireccion",
        "guardianParentesco"
    ];


    campos.forEach(
        id => {

            const campo =
                document.getElementById(
                    id
                );


            if (campo) {

                campo.disabled = true;

                campo.value = "";
            }
        }
    );
}


// ==========================================
// VALIDACIONES DE REGISTRO
// ==========================================

function configurarValidacionesRegistro() {

    const tipoDocumento =
        document.getElementById(
            "tipoDocumento"
        );

    const numeroDocumento =
        document.getElementById(
            "documento"
        );

    const telefono =
        document.getElementById(
            "telefono"
        );

    const nombre =
        document.getElementById(
            "nombre"
        );

    const apellido =
        document.getElementById(
            "apellido"
        );

    const fechaNacimiento =
        document.getElementById(
            "fechaNacimiento"
        );


    // ==========================================
    // FECHA MÁXIMA
    // ==========================================

    if (fechaNacimiento) {

        const hoy =
            new Date()
                .toISOString()
                .split("T")[0];

        fechaNacimiento.max = hoy;
    }


    // ==========================================
    // TIPO DE DOCUMENTO
    // ==========================================

    if (
        tipoDocumento &&
        numeroDocumento
    ) {

        numeroDocumento.disabled =
            !tipoDocumento.value;


        tipoDocumento.addEventListener(
            "change",
            function () {

                numeroDocumento.value = "";

                configurarReglasDocumento(
                    tipoDocumento,
                    numeroDocumento
                );
            }
        );


        numeroDocumento.addEventListener(
            "input",
            function () {

                if (
                    tipoDocumento.value ===
                    "DNI"
                ) {

                    numeroDocumento.value =
                        numeroDocumento.value
                            .replace(
                                /\D/g,
                                ""
                            )
                            .slice(0, 8);
                }


                else if (
                    tipoDocumento.value === "CE" ||
                    tipoDocumento.value ===
                    "PASAPORTE"
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


        configurarReglasDocumento(
            tipoDocumento,
            numeroDocumento
        );
    }


    // ==========================================
    // TELÉFONO
    // ==========================================

    if (telefono) {

        configurarLimiteTelefono(
            "telefono",
            "codigoPais"
        );
    }


    // ==========================================
    // NOMBRE
    // ==========================================

    if (nombre) {

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
    }


    // ==========================================
    // APELLIDO
    // ==========================================

    if (apellido) {

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
    }
}


// ==========================================
// VALIDACIONES DE EDICIÓN
// ==========================================

function configurarValidacionesEdicion() {

    const tipoDocumento =
        document.getElementById(
            "editTipoDocumento"
        );

    const numeroDocumento =
        document.getElementById(
            "editDocumento"
        );

    const telefono =
        document.getElementById(
            "editTelefono"
        );

    const nombre =
        document.getElementById(
            "editNombre"
        );

    const apellido =
        document.getElementById(
            "editApellido"
        );

    const fechaNacimiento =
        document.getElementById(
            "editFechaNacimiento"
        );


    // ==========================================
    // FECHA MÁXIMA
    // ==========================================

    if (fechaNacimiento) {

        const hoy =
            new Date()
                .toISOString()
                .split("T")[0];

        fechaNacimiento.max = hoy;
    }


    // ==========================================
    // TIPO DE DOCUMENTO
    // ==========================================

    if (
        tipoDocumento &&
        numeroDocumento
    ) {

        numeroDocumento.disabled =
            !tipoDocumento.value;


        tipoDocumento.addEventListener(
            "change",
            function () {

                numeroDocumento.value = "";

                configurarReglasDocumento(
                    tipoDocumento,
                    numeroDocumento
                );
            }
        );


        numeroDocumento.addEventListener(
            "input",
            function () {

                if (
                    tipoDocumento.value ===
                    "DNI"
                ) {

                    numeroDocumento.value =
                        numeroDocumento.value
                            .replace(
                                /\D/g,
                                ""
                            )
                            .slice(0, 8);
                }


                else if (
                    tipoDocumento.value === "CE" ||
                    tipoDocumento.value ===
                    "PASAPORTE"
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
    }


    // ==========================================
    // TELÉFONO
    // ==========================================

    if (telefono) {

        configurarLimiteTelefono(
            "editTelefono",
            "editCodigoPais"
        );
    }


    // ==========================================
    // NOMBRE
    // ==========================================

    if (nombre) {

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
    }


    // ==========================================
    // APELLIDO
    // ==========================================

    if (apellido) {

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
    }
}


// ==========================================
// CONFIGURAR VALIDACIÓN DE TELÉFONO
// ==========================================

function configurarValidacionTelefono(
    inputId,
    codigoPaisId
) {

    const telefono =
        document.getElementById(
            inputId
        );

    const codigoPais =
        document.getElementById(
            codigoPaisId
        );


    if (
        !telefono ||
        !codigoPais
    ) {
        return;
    }


    // ==========================================
    // CAMBIAR PAÍS
    // ==========================================

    codigoPais.addEventListener(
        "change",
        function () {

            telefono.value = "";

            configurarLimiteTelefono(
                inputId,
                codigoPaisId
            );
        }
    );


    // ==========================================
    // ESCRIBIR TELÉFONO
    // ==========================================

    telefono.addEventListener(
        "input",
        function () {

            const regla =
                reglasTelefono[
                codigoPais.value
                ];


            if (!regla) {
                return;
            }


            // Solo números
            telefono.value =
                telefono.value.replace(
                    /\D/g,
                    ""
                );


            // Aplicar máximo según país
            telefono.value =
                telefono.value.slice(
                    0,
                    regla.max
                );
        }
    );


    // ==========================================
    // CONFIGURACIÓN INICIAL
    // ==========================================

    configurarLimiteTelefono(
        inputId,
        codigoPaisId
    );
}


// ==========================================
// CONFIGURAR LÍMITE DEL TELÉFONO
// ==========================================

function configurarLimiteTelefono(
    inputId,
    codigoPaisId
) {

    const telefono =
        document.getElementById(
            inputId
        );

    const codigoPais =
        document.getElementById(
            codigoPaisId
        );


    if (
        !telefono ||
        !codigoPais
    ) {
        return;
    }


    const regla =
        reglasTelefono[
        codigoPais.value
        ];


    if (!regla) {

        telefono.removeAttribute(
            "maxlength"
        );

        return;
    }


    telefono.maxLength =
        regla.max;


    telefono.value =
        telefono.value
            .replace(
                /\D/g,
                ""
            )
            .slice(
                0,
                regla.max
            );
}


// ==========================================
// CONFIGURAR REGLAS DEL DOCUMENTO
// ==========================================

function configurarReglasDocumento(
    tipoDocumento,
    numeroDocumento
) {

    if (
        !tipoDocumento ||
        !numeroDocumento
    ) {
        return;
    }


    if (
        tipoDocumento.value ===
        "DNI"
    ) {

        numeroDocumento.disabled =
            false;

        numeroDocumento.maxLength =
            8;

        numeroDocumento.inputMode =
            "numeric";

        numeroDocumento.pattern =
            "[0-9]{8}";

        numeroDocumento.placeholder =
            "8 dígitos";
    }


    else if (
        tipoDocumento.value === "CE" ||
        tipoDocumento.value ===
        "PASAPORTE"
    ) {

        numeroDocumento.disabled =
            false;

        numeroDocumento.maxLength =
            12;

        numeroDocumento.inputMode =
            "text";

        numeroDocumento.pattern =
            "[A-Za-z0-9]{1,12}";

        numeroDocumento.placeholder =
            "Hasta 12 caracteres";
    }


    else {

        numeroDocumento.disabled =
            true;

        numeroDocumento.removeAttribute(
            "maxlength"
        );

        numeroDocumento.removeAttribute(
            "pattern"
        );

        numeroDocumento.inputMode =
            "text";

        numeroDocumento.placeholder =
            "Selecciona el tipo de documento";
    }
}


// ==========================================
// VALIDAR FORMULARIO DE ESTUDIANTE
// ==========================================

function validarFormularioEstudiante(
    prefijo
) {

    const esEdicion =
        prefijo === "edit";


    const nombre =
        document.getElementById(
            esEdicion
                ? "editNombre"
                : "nombre"
        );

    const apellido =
        document.getElementById(
            esEdicion
                ? "editApellido"
                : "apellido"
        );

    const tipoDocumento =
        document.getElementById(
            esEdicion
                ? "editTipoDocumento"
                : "tipoDocumento"
        );

    const documento =
        document.getElementById(
            esEdicion
                ? "editDocumento"
                : "documento"
        );

    const telefono =
        document.getElementById(
            esEdicion
                ? "editTelefono"
                : "telefono"
        );

    const codigoPais =
        document.getElementById(
            esEdicion
                ? "editCodigoPais"
                : "codigoPais"
        );

    const fechaNacimiento =
        document.getElementById(
            esEdicion
                ? "editFechaNacimiento"
                : "fechaNacimiento"
        );

    const correo =
        document.getElementById(
            esEdicion
                ? "editCorreo"
                : "correo"
        );


    // ==========================================
    // NOMBRE
    // ==========================================

    if (
        !nombre ||
        !nombre.value.trim()
    ) {

        return {
            campo: nombre,
            mensaje:
                "El nombre es obligatorio."
        };
    }


    if (
        !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{1,50}$/
            .test(
                nombre.value.trim()
            )
    ) {

        return {
            campo: nombre,
            mensaje:
                "El nombre solo puede contener letras y espacios, con un máximo de 50 caracteres."
        };
    }


    // ==========================================
    // APELLIDO
    // ==========================================

    if (
        !apellido ||
        !apellido.value.trim()
    ) {

        return {
            campo: apellido,
            mensaje:
                "El apellido es obligatorio."
        };
    }


    if (
        !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{1,50}$/
            .test(
                apellido.value.trim()
            )
    ) {

        return {
            campo: apellido,
            mensaje:
                "El apellido solo puede contener letras y espacios, con un máximo de 50 caracteres."
        };
    }


    // ==========================================
    // TIPO DE DOCUMENTO
    // ==========================================

    if (
        !tipoDocumento ||
        !tipoDocumento.value
    ) {

        return {
            campo: tipoDocumento,
            mensaje:
                "Debes seleccionar un tipo de documento."
        };
    }


    // ==========================================
    // DOCUMENTO
    // ==========================================

    if (
        !documento ||
        !documento.value.trim()
    ) {

        return {
            campo: documento,
            mensaje:
                "Debes ingresar el número de documento."
        };
    }


    if (
        tipoDocumento.value ===
        "DNI"
    ) {

        if (
            !/^\d{8}$/.test(
                documento.value
            )
        ) {

            return {
                campo: documento,
                mensaje:
                    "El DNI debe contener exactamente 8 dígitos."
            };
        }
    }


    else if (
        tipoDocumento.value === "CE" ||
        tipoDocumento.value ===
        "PASAPORTE"
    ) {

        if (
            !/^[a-zA-Z0-9]{1,12}$/.test(
                documento.value
            )
        ) {

            return {
                campo: documento,
                mensaje:
                    "El número de documento no es válido."
            };
        }
    }


    // ==========================================
    // TELÉFONO
    // ==========================================

    if (
        telefono &&
        telefono.value.trim()
    ) {

        const codigo =
            codigoPais
                ? codigoPais.value
                : "+51";


        const regla =
            reglasTelefono[codigo];


        if (!regla) {

            return {
                campo: codigoPais || telefono,
                mensaje:
                    "Selecciona un código de país válido."
            };
        }


        const telefonoValor =
            telefono.value.trim();


        if (
            !/^\d+$/.test(
                telefonoValor
            )
        ) {

            return {
                campo: telefono,
                mensaje:
                    "El teléfono solo debe contener números."
            };
        }


        if (
            telefonoValor.length <
            regla.min
        ) {

            if (
                regla.min ===
                regla.max
            ) {

                return {
                    campo: telefono,
                    mensaje:
                        `El número de ${regla.nombre} debe contener exactamente ${regla.min} dígitos.`
                };
            }


            return {
                campo: telefono,
                mensaje:
                    `El número de ${regla.nombre} debe contener entre ${regla.min} y ${regla.max} dígitos.`
            };
        }


        if (
            telefonoValor.length >
            regla.max
        ) {

            if (
                regla.min ===
                regla.max
            ) {

                return {
                    campo: telefono,
                    mensaje:
                        `El número de ${regla.nombre} debe contener exactamente ${regla.max} dígitos.`
                };
            }


            return {
                campo: telefono,
                mensaje:
                    `El número de ${regla.nombre} debe contener entre ${regla.min} y ${regla.max} dígitos.`
            };
        }
    }


    // ==========================================
    // FECHA DE NACIMIENTO
    // ==========================================

    if (
        fechaNacimiento &&
        fechaNacimiento.value
    ) {

        const fechaSeleccionada =
            new Date(
                fechaNacimiento.value +
                "T00:00:00"
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

        if (
            añoSeleccionado >
            añoActual
        ) {

            return {
                campo: fechaNacimiento,
                mensaje:
                    "El año de nacimiento no puede ser superior al año actual."
            };
        }


        // ------------------------------------------
        // VALIDAR FECHA COMPLETA
        // ------------------------------------------

        if (
            fechaSeleccionada >
            fechaActual
        ) {

            return {
                campo: fechaNacimiento,
                mensaje:
                    "La fecha de nacimiento no puede ser futura."
            };
        }
    }


    // ==========================================
    // CORREO
    // ==========================================

    if (
        correo &&
        correo.value.trim()
    ) {

        const correoValido =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                .test(
                    correo.value.trim()
                );


        if (!correoValido) {

            return {
                campo: correo,
                mensaje:
                    "Ingresa un correo electrónico válido."
            };
        }
    }


    return null;
}


// ==========================================
// VALIDAR FORMULARIO DE APODERADO
// ==========================================

function validarFormularioApoderado() {

    const nombre =
        document.getElementById(
            "guardianNombre"
        );

    const apellido =
        document.getElementById(
            "guardianApellido"
        );

    const tipoDocumento =
        document.getElementById(
            "guardianTipoDocumento"
        );

    const documento =
        document.getElementById(
            "guardianDocumento"
        );

    const telefono =
        document.getElementById(
            "guardianTelefono"
        );

    const correo =
        document.getElementById(
            "guardianCorreo"
        );


    if (
        !nombre.value.trim()
    ) {

        return {
            campo: nombre,
            mensaje:
                "El nombre del apoderado es obligatorio."
        };
    }


    if (
        !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{1,50}$/
            .test(
                nombre.value.trim()
            )
    ) {

        return {
            campo: nombre,
            mensaje:
                "El nombre del apoderado solo puede contener letras y espacios."
        };
    }


    if (
        !apellido.value.trim()
    ) {

        return {
            campo: apellido,
            mensaje:
                "El apellido del apoderado es obligatorio."
        };
    }


    if (
        !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{1,50}$/
            .test(
                apellido.value.trim()
            )
    ) {

        return {
            campo: apellido,
            mensaje:
                "El apellido del apoderado solo puede contener letras y espacios."
        };
    }


    if (
        !tipoDocumento.value
    ) {

        return {
            campo: tipoDocumento,
            mensaje:
                "Debes seleccionar un tipo de documento para el apoderado."
        };
    }


    if (
        tipoDocumento.value ===
        "DNI"
    ) {

        if (
            !/^\d{8}$/.test(
                documento.value
            )
        ) {

            return {
                campo: documento,
                mensaje:
                    "El DNI del apoderado debe contener exactamente 8 dígitos."
            };
        }
    }


    else if (
        tipoDocumento.value === "CE" ||
        tipoDocumento.value ===
        "PASAPORTE"
    ) {

        if (
            !/^[a-zA-Z0-9]{1,12}$/
                .test(
                    documento.value
                )
        ) {

            return {
                campo: documento,
                mensaje:
                    "El número de documento del apoderado no es válido."
            };
        }
    }


    if (
        telefono.value.trim()
    ) {

        if (
            !/^\d{1,15}$/.test(
                telefono.value.trim()
            )
        ) {

            return {
                campo: telefono,
                mensaje:
                    "El teléfono del apoderado solo debe contener números y tener como máximo 15 dígitos."
            };
        }
    }


    if (
        correo.value.trim()
    ) {

        const correoValido =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                .test(
                    correo.value.trim()
                );


        if (!correoValido) {

            return {
                campo: correo,
                mensaje:
                    "Ingresa un correo electrónico válido para el apoderado."
            };
        }
    }


    return null;
}


// ==========================================
// APLICAR FILTROS
// ==========================================

function configurarBusquedaYFiltros() {

    const searchInput =
        document.getElementById(
            "studentSearch"
        );

    const ageFilter =
        document.getElementById(
            "ageFilter"
        );

    const beltFilter =
        document.getElementById(
            "beltFilter"
        );


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            aplicarFiltros
        );
    }


    if (ageFilter) {

        ageFilter.addEventListener(
            "change",
            aplicarFiltros
        );
    }


    if (beltFilter) {

        beltFilter.addEventListener(
            "change",
            aplicarFiltros
        );
    }
}


// ==========================================
// APLICAR FILTROS
// ==========================================

function aplicarFiltros() {

    const searchInput =
        document.getElementById(
            "studentSearch"
        );

    const ageFilter =
        document.getElementById(
            "ageFilter"
        );

    const beltFilter =
        document.getElementById(
            "beltFilter"
        );


    const texto =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    const edadFiltro =
        ageFilter
            ? ageFilter.value
            : "TODOS";


    const cinturonFiltro =
        beltFilter
            ? beltFilter.value
            : "TODOS";


    const filtrados =
        estudiantesData.filter(
            estudiante => {

                const nombre =
                    `${estudiante.nombre || ""} ${estudiante.apellido || ""}`
                        .toLowerCase();


                const documento =
                    String(
                        estudiante.documento ||
                        ""
                    ).toLowerCase();


                const coincideBusqueda =
                    !texto ||
                    nombre.includes(texto) ||
                    documento.includes(texto);


                const edad =
                    estudiante.fechaNacimiento
                        ? calcularEdad(
                            estudiante.fechaNacimiento
                        )
                        : null;


                let coincideEdad =
                    true;


                if (
                    edadFiltro ===
                    "MENORES"
                ) {

                    coincideEdad =
                        edad !== null &&
                        edad < 18;
                }


                if (
                    edadFiltro ===
                    "MAYORES"
                ) {

                    coincideEdad =
                        edad !== null &&
                        edad >= 18;
                }


                const coincideCinturon =
                    cinturonFiltro ===
                    "TODOS" ||
                    estudiante.cinturon ===
                    cinturonFiltro;


                return (
                    coincideBusqueda &&
                    coincideEdad &&
                    coincideCinturon
                );
            }
        );


    actualizarContador(
        filtrados.length
    );


    renderizarEstudiantes(
        filtrados
    );
}


// ==========================================
// CARGAR ESTUDIANTES
// ==========================================

async function cargarEstudiantes() {

    const studentsList =
        document.getElementById(
            "studentsList"
        );


    if (!studentsList) {
        return;
    }


    try {

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


        if (
            response.status ===
            401
        ) {

            cerrarSesion();

            return;
        }


        if (
            response.status ===
            403
        ) {

            throw new Error(
                "No tienes permisos para consultar los estudiantes."
            );
        }


        if (!response.ok) {

            throw new Error(
                "No se pudieron cargar los estudiantes."
            );
        }


        estudiantesData =
            await response.json();


        actualizarContador(
            estudiantesData.length
        );


        renderizarEstudiantes(
            estudiantesData
        );

    } catch (error) {

        console.error(
            "Error al cargar estudiantes:",
            error
        );


        mostrarMensaje(
            document.getElementById(
                "studentsMessage"
            ),
            error.message,
            "error"
        );
    }
}


// ==========================================
// ACTUALIZAR CONTADOR
// ==========================================

function actualizarContador(
    cantidad
) {

    const studentsCount =
        document.getElementById(
            "studentsCount"
        );


    if (!studentsCount) {
        return;
    }


    studentsCount.textContent =
        `${cantidad} estudiante${cantidad === 1
            ? ""
            : "s"
        }`;
}


// ==========================================
// RENDERIZAR ESTUDIANTES
// ==========================================

function renderizarEstudiantes(
    estudiantes
) {

    const studentsList =
        document.getElementById(
            "studentsList"
        );


    if (!studentsList) {
        return;
    }


    if (
        estudiantes.length ===
        0
    ) {

        studentsList.innerHTML = `
            <div class="estudiantes-empty">
                No se encontraron estudiantes.
            </div>
        `;

        return;
    }


    studentsList.innerHTML =
        crearTablaEstudiantes(
            estudiantes
        );
}


// ==========================================
// CREAR TABLA
// ==========================================

function crearTablaEstudiantes(
    estudiantes
) {

    return `
        <table class="estudiantes-table">

            <thead>

                <tr>

                    <th>Foto</th>

                    <th>Estudiante</th>

                    <th>Documento</th>

                    <th>Contacto</th>

                    <th>Fecha de nacimiento</th>

                    <th>Dirección</th>

                    <th>Cinturón</th>

                    <th>Estado</th>

                    <th>Acciones</th>

                </tr>

            </thead>


            <tbody>

                ${estudiantes
            .map(
                estudiante =>
                    crearEstudianteFila(
                        estudiante
                    )
            )
            .join("")
        }

            </tbody>

        </table>
    `;
}


// ==========================================
// CREAR FILA
// ==========================================

function crearEstudianteFila(
    estudiante
) {

    const estadoClase =
        estudiante.estado ===
            "ACTIVO"
            ? "estudiante-estado--activo"
            : "estudiante-estado--inactivo";


    const foto =
        estudiante.fotoUrl
            ? `
                <img
                    src="${escapeHtml(
                estudiante.fotoUrl
            )}"
                    alt="Foto de ${escapeHtml(
                estudiante.nombre
            )}"
                    class="estudiante-foto"
                >
            `
            : `
                <span class="estudiante-sin-foto">
                    Sin foto
                </span>
            `;


    return `
        <tr>

            <td>
                ${foto}
            </td>


            <td>

                <div class="estudiante-nombre">

                    ${escapeHtml(
        estudiante.nombre
    )}

                    ${escapeHtml(
        estudiante.apellido
    )}

                </div>

            </td>


            <td>

                <div class="estudiante-documento">

                    ${escapeHtml(
        estudiante.tipoDocumento
    )}

                    <br>

                    ${escapeHtml(
        estudiante.documento
    )}

                </div>

            </td>


            <td>

                <div class="estudiante-contacto">

                    <span>
                        ${escapeHtml(
        estudiante.telefono
    )}
                    </span>

                    <span>
                        ${escapeHtml(
        estudiante.correo
    )}
                    </span>

                </div>

            </td>


            <td>
                ${escapeHtml(
        estudiante.fechaNacimiento
    )}
            </td>


            <td>
                ${escapeHtml(
        estudiante.direccion
    )}
            </td>


            <td>
                ${escapeHtml(
        estudiante.cinturon
    )}
            </td>


            <td>

                <span
                    class="estudiante-estado ${estadoClase}"
                >

                    ${escapeHtml(
        estudiante.estado
    )}

                </span>

            </td>


            <td>

                <div class="estudiante-acciones">

                    <button
                        type="button"
                        class="btn btn--primary"
                        onclick="editarEstudiante(${estudiante.id})">

                        Editar

                    </button>


                    <button
                        type="button"
                        class="btn btn--secondary"
                        onclick="cambiarEstadoEstudiante(
                            ${estudiante.id},
                            '${escapeHtml(
        estudiante.estado
    )}'
                        )">

                        ${estudiante.estado ===
            "ACTIVO"
            ? "Desactivar"
            : "Activar"
        }

                    </button>

                </div>

            </td>

        </tr>
    `;
}


// ==========================================
// REGISTRAR ESTUDIANTE
// ==========================================

async function registrarEstudiante(
    event
) {

    event.preventDefault();


    const form =
        event.target;


    const mensaje =
        document.getElementById(
            "studentMessage"
        );


    // ==========================================
    // VALIDAR DATOS
    // ==========================================

    const validacion =
        validarFormularioEstudiante(
            ""
        );


    if (validacion) {

        mostrarMensaje(
            mensaje,
            validacion.mensaje,
            "error"
        );

        if (validacion.campo) {
            validacion.campo.focus();
        }

        return;
    }


    const fechaNacimiento =
        document.getElementById(
            "fechaNacimiento"
        ).value;


    const edad =
        calcularEdad(
            fechaNacimiento
        );


    const esMenor =
        edad < 18;


    // ==========================================
    // VALIDAR APODERADO SI ES MENOR
    // ==========================================

    if (esMenor) {

        const validacionApoderado =
            validarFormularioApoderado();


        if (validacionApoderado) {

            mostrarMensaje(
                mensaje,
                validacionApoderado.mensaje,
                "error"
            );

            validacionApoderado.campo.focus();

            return;
        }
    }


    const formData =
        new FormData();


    // ==========================================
    // DATOS
    // ==========================================

    formData.append(
        "nombre",
        document.getElementById(
            "nombre"
        ).value.trim()
    );


    formData.append(
        "apellido",
        document.getElementById(
            "apellido"
        ).value.trim()
    );


    formData.append(
        "tipoDocumento",
        document.getElementById(
            "tipoDocumento"
        ).value
    );


    formData.append(
        "documento",
        document.getElementById(
            "documento"
        ).value.trim()
    );


    formData.append(
        "telefono",
        document.getElementById(
            "telefono"
        ).value.trim()
    );


    formData.append(
        "correo",
        document.getElementById(
            "correo"
        ).value.trim()
    );


    formData.append(
        "fechaNacimiento",
        fechaNacimiento
    );


    formData.append(
        "direccion",
        document.getElementById(
            "direccion"
        ).value.trim()
    );


    formData.append(
        "cinturon",
        document.getElementById(
            "cinturon"
        ).value
    );


    // ==========================================
    // FOTO
    // ==========================================

    if (fotoNueva) {

        formData.append(
            "foto",
            fotoNueva
        );
    }


    try {

        const response =
            await fetch(
                "/api/estudiantes",
                {
                    method: "POST",

                    headers: {
                        "Authorization":
                            "Basic " + auth
                    },

                    body: formData
                }
            );


        if (
            response.status ===
            401
        ) {

            cerrarSesion();

            return;
        }


        if (
            response.status ===
            403
        ) {

            throw new Error(
                "No tienes permisos para registrar estudiantes."
            );
        }


        let data = {};

        try {

            data =
                await response.json();

        } catch (error) {

            data = {};
        }


        if (!response.ok) {

            throw new Error(
                data.message ||
                data.error ||
                "No se pudo registrar el estudiante."
            );
        }


        // ==========================================
        // APODERADO
        // ==========================================

        if (esMenor) {

            if (!data.id) {

                throw new Error(
                    "El estudiante fue creado, pero no se recibió su ID para registrar el apoderado."
                );
            }


            await registrarApoderado(
                data.id
            );
        }


        // ==========================================
        // ÉXITO
        // ==========================================

        mostrarMensaje(
            mensaje,
            esMenor
                ? "Estudiante y apoderado registrados correctamente."
                : "Estudiante registrado correctamente.",
            "success"
        );


        form.reset();


        fotoNueva = null;


        limpiarFotoRegistro();


        verificarEdadEstudiante();


        await cargarEstudiantes();


        setTimeout(
            cerrarModalRegistro,
            600
        );

    } catch (error) {

        console.error(
            "Error al registrar estudiante:",
            error
        );


        mostrarMensaje(
            mensaje,
            error.message,
            "error"
        );
    }
}


// ==========================================
// REGISTRAR APODERADO
// ==========================================

async function registrarApoderado(
    estudianteId
) {

    const formData =
        new FormData();


    formData.append(
        "nombre",
        document.getElementById(
            "guardianNombre"
        ).value.trim()
    );


    formData.append(
        "apellido",
        document.getElementById(
            "guardianApellido"
        ).value.trim()
    );


    formData.append(
        "tipoDocumento",
        document.getElementById(
            "guardianTipoDocumento"
        ).value
    );


    formData.append(
        "documento",
        document.getElementById(
            "guardianDocumento"
        ).value.trim()
    );


    formData.append(
        "telefono",
        document.getElementById(
            "guardianTelefono"
        ).value.trim()
    );


    formData.append(
        "correo",
        document.getElementById(
            "guardianCorreo"
        ).value.trim()
    );


    formData.append(
        "direccion",
        document.getElementById(
            "guardianDireccion"
        ).value.trim()
    );


    formData.append(
        "parentesco",
        document.getElementById(
            "guardianParentesco"
        ).value
    );


    const response =
        await fetch(
            `/api/apoderados/estudiante/${estudianteId}`,
            {
                method: "POST",

                headers: {
                    "Authorization":
                        "Basic " + auth
                },

                body: formData
            }
        );


    if (
        response.status ===
        401
    ) {

        cerrarSesion();

        return false;
    }


    if (
        response.status ===
        403
    ) {

        throw new Error(
            "No tienes permisos para registrar el apoderado."
        );
    }


    let data = {};


    try {

        data =
            await response.json();

    } catch (error) {

        data = {};
    }


    if (!response.ok) {

        throw new Error(
            data.message ||
            data.error ||
            "No se pudo registrar el apoderado."
        );
    }


    return true;
}


// ==========================================
// EDITAR ESTUDIANTE
// ==========================================

async function editarEstudiante(
    id
) {

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


        if (
            response.status ===
            401
        ) {

            cerrarSesion();

            return;
        }


        if (
            response.status ===
            403
        ) {

            throw new Error(
                "No tienes permisos para consultar este estudiante."
            );
        }


        if (!response.ok) {

            throw new Error(
                "No se pudo obtener el estudiante."
            );
        }


        const estudiante =
            await response.json();


        estudianteEditandoId =
            estudiante.id;


        // ==========================================
        // DATOS DEL ESTUDIANTE
        // ==========================================

        document.getElementById(
            "editId"
        ).value =
            estudiante.id;


        document.getElementById(
            "editNombre"
        ).value =
            estudiante.nombre || "";


        document.getElementById(
            "editApellido"
        ).value =
            estudiante.apellido || "";


        document.getElementById(
            "editTipoDocumento"
        ).value =
            estudiante.tipoDocumento || "";


        document.getElementById(
            "editDocumento"
        ).value =
            estudiante.documento || "";


        document.getElementById(
            "editFechaNacimiento"
        ).value =
            estudiante.fechaNacimiento || "";


        document.getElementById(
            "editTelefono"
        ).value =
            estudiante.telefono || "";


        document.getElementById(
            "editCorreo"
        ).value =
            estudiante.correo || "";


        document.getElementById(
            "editDireccion"
        ).value =
            estudiante.direccion || "";


        document.getElementById(
            "editCinturon"
        ).value =
            estudiante.cinturon || "BLANCO";


        // ==========================================
        // APLICAR REGLAS DEL DOCUMENTO
        // ==========================================

        const tipoDocumento =
            document.getElementById(
                "editTipoDocumento"
            );

        const numeroDocumento =
            document.getElementById(
                "editDocumento"
            );

        if (
            tipoDocumento &&
            numeroDocumento
        ) {

            configurarReglasDocumento(
                tipoDocumento,
                numeroDocumento
            );
        }


        // ==========================================
        // APLICAR REGLAS DEL TELÉFONO
        // ==========================================

        configurarLimiteTelefono(
            "editTelefono",
            "editCodigoPais"
        );


        // ==========================================
        // FOTO
        // ==========================================

        prepararFotoEdicion(
            estudiante
        );


        // ==========================================
        // LIMPIAR APODERADO
        // ==========================================

        limpiarInterfazApoderado();


        // ==========================================
        // CARGAR APODERADOS
        // ==========================================

        await cargarApoderados(
            estudiante.id
        );


        // ==========================================
        // ABRIR MODAL
        // ==========================================

        const modal =
            document.getElementById(
                "editStudentModal"
            );


        if (modal) {

            modal.hidden = false;

            document.body.classList.add(
                "modal-open"
            );
        }

    } catch (error) {

        console.error(
            "Error al editar estudiante:",
            error
        );


        alert(
            error.message
        );
    }
}


// ==========================================
// PREPARAR FOTO DE EDICIÓN
// ==========================================

function prepararFotoEdicion(
    estudiante
) {

    fotoNueva = null;

    quitarFotoEdicion = false;


    const editFotoInput =
        document.getElementById(
            "editFoto"
        );

    const editFotoPreview =
        document.getElementById(
            "editFotoPreview"
        );

    const editFotoUploadText =
        document.getElementById(
            "editFotoUploadText"
        );

    const removeEditFotoButton =
        document.getElementById(
            "removeEditFotoButton"
        );


    if (editFotoInput) {

        editFotoInput.value = "";
    }


    if (estudiante.fotoUrl) {

        if (editFotoPreview) {

            editFotoPreview.src =
                estudiante.fotoUrl;

            editFotoPreview.hidden =
                false;
        }


        if (editFotoUploadText) {

            editFotoUploadText.textContent =
                "Cambiar fotografía";
        }


        if (removeEditFotoButton) {

            removeEditFotoButton.hidden =
                false;
        }

    } else {

        if (editFotoPreview) {

            editFotoPreview.src = "";

            editFotoPreview.hidden =
                true;
        }


        if (editFotoUploadText) {

            editFotoUploadText.textContent =
                "👤";
        }


        if (removeEditFotoButton) {

            removeEditFotoButton.hidden =
                true;
        }
    }
}


// ==========================================
// CARGAR APODERADOS
// ==========================================

async function cargarApoderados(
    estudianteId
) {

    try {

        const response =
            await fetch(
                `/api/apoderados/estudiante/${estudianteId}`,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            "Basic " + auth
                    }
                }
            );


        if (
            response.status ===
            401
        ) {

            cerrarSesion();

            return;
        }


        if (
            response.status ===
            403
        ) {

            throw new Error(
                "No tienes permisos para consultar los apoderados."
            );
        }


        if (!response.ok) {

            throw new Error(
                "No se pudieron consultar los apoderados."
            );
        }


        const apoderados =
            await response.json();


        if (
            Array.isArray(apoderados) &&
            apoderados.length > 0
        ) {

            apoderadoActual =
                apoderados[0];

            mostrarApoderado(
                apoderadoActual
            );

        } else {

            apoderadoActual =
                null;

            mostrarSinApoderado();
        }

    } catch (error) {

        console.error(
            "Error al cargar apoderados:",
            error
        );


        mostrarSinApoderado(
            error.message
        );
    }
}


// ==========================================
// MOSTRAR APODERADO
// ==========================================

function mostrarApoderado(
    apoderado
) {

    const guardianInfo =
        document.getElementById(
            "guardianInfo"
        );

    const guardianEmptyState =
        document.getElementById(
            "guardianEmptyState"
        );

    const editGuardianButton =
        document.getElementById(
            "editGuardianButton"
        );

    const addGuardianButton =
        document.getElementById(
            "addGuardianButton"
        );


    const guardianFullName =
        document.getElementById(
            "guardianFullName"
        );

    const guardianRelationship =
        document.getElementById(
            "guardianRelationship"
        );

    const guardianDocumentDisplay =
        document.getElementById(
            "guardianDocumentDisplay"
        );

    const guardianPhoneDisplay =
        document.getElementById(
            "guardianPhoneDisplay"
        );

    const guardianEmailDisplay =
        document.getElementById(
            "guardianEmailDisplay"
        );


    if (guardianInfo) {

        guardianInfo.hidden =
            false;
    }


    if (guardianEmptyState) {

        guardianEmptyState.hidden =
            true;
    }


    if (editGuardianButton) {

        editGuardianButton.hidden =
            false;
    }


    if (addGuardianButton) {

        addGuardianButton.hidden =
            false;
    }


    if (guardianFullName) {

        guardianFullName.textContent =
            `${apoderado.nombre || ""} ${apoderado.apellido || ""}`.trim();
    }


    if (guardianRelationship) {

        guardianRelationship.textContent =
            apoderado.parentesco || "";
    }


    if (guardianDocumentDisplay) {

        guardianDocumentDisplay.textContent =
            `${apoderado.tipoDocumento || ""} ${apoderado.documento || ""}`.trim();
    }


    if (guardianPhoneDisplay) {

        guardianPhoneDisplay.textContent =
            apoderado.telefono ||
            "Sin teléfono";
    }


    if (guardianEmailDisplay) {

        guardianEmailDisplay.textContent =
            apoderado.correo ||
            "Sin correo";
    }
}


// ==========================================
// MOSTRAR SIN APODERADO
// ==========================================

function mostrarSinApoderado(
    mensaje = null
) {

    const guardianInfo =
        document.getElementById(
            "guardianInfo"
        );

    const guardianEmptyState =
        document.getElementById(
            "guardianEmptyState"
        );

    const editGuardianButton =
        document.getElementById(
            "editGuardianButton"
        );

    const addGuardianButton =
        document.getElementById(
            "addGuardianButton"
        );


    if (guardianInfo) {

        guardianInfo.hidden =
            true;
    }


    if (guardianEmptyState) {

        guardianEmptyState.hidden =
            false;


        if (mensaje) {

            const paragraph =
                guardianEmptyState.querySelector(
                    "p"
                );


            if (paragraph) {

                paragraph.textContent =
                    mensaje;
            }
        }
    }


    if (editGuardianButton) {

        editGuardianButton.hidden =
            true;
    }


    if (addGuardianButton) {

        addGuardianButton.hidden =
            false;
    }
}


// ==========================================
// LIMPIAR INTERFAZ APODERADO
// ==========================================

function limpiarInterfazApoderado() {

    apoderadoActual = null;


    const guardianInfo =
        document.getElementById(
            "guardianInfo"
        );

    const guardianEmptyState =
        document.getElementById(
            "guardianEmptyState"
        );

    const editGuardianButton =
        document.getElementById(
            "editGuardianButton"
        );

    const addGuardianButton =
        document.getElementById(
            "addGuardianButton"
        );

    const editGuardianFormSection =
        document.getElementById(
            "editGuardianFormSection"
        );


    if (guardianInfo) {

        guardianInfo.hidden =
            true;
    }


    if (guardianEmptyState) {

        guardianEmptyState.hidden =
            false;
    }


    if (editGuardianButton) {

        editGuardianButton.hidden =
            true;
    }


    if (addGuardianButton) {

        addGuardianButton.hidden =
            false;
    }


    if (editGuardianFormSection) {

        editGuardianFormSection.hidden =
            true;
    }


    limpiarFormularioApoderado();
}


// ==========================================
// EDITAR APODERADO
// ==========================================

function editarApoderado() {

    if (!apoderadoActual) {

        alert(
            "No existe un apoderado para editar."
        );

        return;
    }


    cargarDatosFormularioApoderado(
        apoderadoActual
    );


    const editGuardianFormSection =
        document.getElementById(
            "editGuardianFormSection"
        );


    if (editGuardianFormSection) {

        editGuardianFormSection.hidden =
            false;
    }
}


// ==========================================
// AGREGAR APODERADO
// ==========================================

function agregarApoderado() {

    limpiarFormularioApoderado();


    const editGuardianFormSection =
        document.getElementById(
            "editGuardianFormSection"
        );


    if (editGuardianFormSection) {

        editGuardianFormSection.hidden =
            false;
    }
}


// ==========================================
// CARGAR DATOS DEL FORMULARIO
// ==========================================

function cargarDatosFormularioApoderado(
    apoderado
) {

    const campos = {

        editGuardianId:
            apoderado.id || "",

        editGuardianNombre:
            apoderado.nombre || "",

        editGuardianApellido:
            apoderado.apellido || "",

        editGuardianTipoDocumento:
            apoderado.tipoDocumento || "",

        editGuardianDocumento:
            apoderado.documento || "",

        editGuardianTelefono:
            apoderado.telefono || "",

        editGuardianCorreo:
            apoderado.correo || "",

        editGuardianDireccion:
            apoderado.direccion || "",

        editGuardianParentesco:
            apoderado.parentesco || ""
    };


    Object.entries(
        campos
    ).forEach(
        ([id, valor]) => {

            const campo =
                document.getElementById(
                    id
                );


            if (campo) {

                campo.value =
                    valor;
            }
        }
    );
}


// ==========================================
// LIMPIAR FORMULARIO APODERADO
// ==========================================

function limpiarFormularioApoderado() {

    const ids = [
        "editGuardianId",
        "editGuardianNombre",
        "editGuardianApellido",
        "editGuardianTipoDocumento",
        "editGuardianDocumento",
        "editGuardianTelefono",
        "editGuardianCorreo",
        "editGuardianDireccion",
        "editGuardianParentesco"
    ];


    ids.forEach(
        id => {

            const campo =
                document.getElementById(
                    id
                );


            if (campo) {

                campo.value = "";
            }
        }
    );
}


// ==========================================
// OCULTAR FORMULARIO APODERADO
// ==========================================

function ocultarFormularioApoderado() {

    const editGuardianFormSection =
        document.getElementById(
            "editGuardianFormSection"
        );


    if (editGuardianFormSection) {

        editGuardianFormSection.hidden =
            true;
    }
}


// ==========================================
// GUARDAR APODERADO
// ==========================================

async function guardarApoderado() {

    if (!estudianteEditandoId) {

        alert(
            "No se encontró el estudiante."
        );

        return;
    }


    /*
     * IMPORTANTE:
     *
     * La API PUT/PATCH del apoderado
     * todavía debe implementarse en el backend.
     *
     * Por ahora mostramos un mensaje
     * para no inventar un endpoint.
     */

    alert(
        "La edición y guardado del apoderado se conectará cuando implementemos el endpoint correspondiente en el backend."
    );
}


// ==========================================
// ACTUALIZAR ESTUDIANTE
// ==========================================

async function actualizarEstudiante(
    event
) {

    event.preventDefault();


    const mensaje =
        document.getElementById(
            "editStudentMessage"
        );


    // ==========================================
    // VALIDAR DATOS
    // ==========================================

    const validacion =
        validarFormularioEstudiante(
            "edit"
        );


    if (validacion) {

        mostrarMensaje(
            mensaje,
            validacion.mensaje,
            "error"
        );

        if (validacion.campo) {
            validacion.campo.focus();
        }

        return;
    }


    const id =
        document.getElementById(
            "editId"
        ).value;


    const formData =
        new FormData();


    // ==========================================
    // DATOS
    // ==========================================

    formData.append(
        "nombre",
        document.getElementById(
            "editNombre"
        ).value.trim()
    );


    formData.append(
        "apellido",
        document.getElementById(
            "editApellido"
        ).value.trim()
    );


    formData.append(
        "tipoDocumento",
        document.getElementById(
            "editTipoDocumento"
        ).value
    );


    formData.append(
        "documento",
        document.getElementById(
            "editDocumento"
        ).value.trim()
    );


    formData.append(
        "fechaNacimiento",
        document.getElementById(
            "editFechaNacimiento"
        ).value
    );


    formData.append(
        "telefono",
        document.getElementById(
            "editTelefono"
        ).value.trim()
    );


    formData.append(
        "correo",
        document.getElementById(
            "editCorreo"
        ).value.trim()
    );


    formData.append(
        "direccion",
        document.getElementById(
            "editDireccion"
        ).value.trim()
    );


    formData.append(
        "cinturon",
        document.getElementById(
            "editCinturon"
        ).value
    );


    formData.append(
        "quitarFoto",
        quitarFotoEdicion
    );


    // ==========================================
    // FOTO
    // ==========================================

    if (fotoNueva) {

        formData.append(
            "foto",
            fotoNueva
        );
    }


    try {

        const response =
            await fetch(
                `/api/estudiantes/${id}`,
                {
                    method: "PUT",

                    headers: {
                        "Authorization":
                            "Basic " + auth
                    },

                    body: formData
                }
            );


        if (
            response.status ===
            401
        ) {

            cerrarSesion();

            return;
        }


        if (
            response.status ===
            403
        ) {

            throw new Error(
                "No tienes permisos para actualizar estudiantes."
            );
        }


        let data = {};

        try {

            data =
                await response.json();

        } catch (error) {

            data = {};
        }


        if (!response.ok) {

            throw new Error(
                data.message ||
                data.error ||
                "No se pudo actualizar el estudiante."
            );
        }


        mostrarMensaje(
            mensaje,
            "Estudiante actualizado correctamente.",
            "success"
        );


        fotoNueva = null;

        quitarFotoEdicion = false;


        await cargarEstudiantes();


        setTimeout(
            cancelarEdicion,
            500
        );

    } catch (error) {

        console.error(
            "Error al actualizar estudiante:",
            error
        );


        mostrarMensaje(
            mensaje,
            error.message,
            "error"
        );
    }
}


// ==========================================
// CANCELAR EDICIÓN
// ==========================================

function cancelarEdicion() {

    const modal =
        document.getElementById(
            "editStudentModal"
        );


    const editForm =
        document.getElementById(
            "editStudentForm"
        );


    if (editForm) {

        editForm.reset();
    }


    if (modal) {

        modal.hidden = true;
    }


    document.body.classList.remove(
        "modal-open"
    );


    fotoNueva = null;

    quitarFotoEdicion = false;

    estudianteEditandoId = null;

    apoderadoActual = null;


    limpiarInterfazApoderado();


    // ==========================================
    // RESTABLECER TELÉFONO
    // ==========================================

    configurarLimiteTelefono(
        "editTelefono",
        "editCodigoPais"
    );


    const editFotoPreview =
        document.getElementById(
            "editFotoPreview"
        );

    const editFotoUploadText =
        document.getElementById(
            "editFotoUploadText"
        );

    const removeEditFotoButton =
        document.getElementById(
            "removeEditFotoButton"
        );


    if (editFotoPreview) {

        editFotoPreview.src = "";

        editFotoPreview.hidden =
            true;
    }


    if (editFotoUploadText) {

        editFotoUploadText.textContent =
            "👤";
    }


    if (removeEditFotoButton) {

        removeEditFotoButton.hidden =
            true;
    }


    ocultarMensaje(
        document.getElementById(
            "editStudentMessage"
        )
    );
}


// ==========================================
// LIMPIAR FOTO REGISTRO
// ==========================================

function limpiarFotoRegistro() {

    const fotoInput =
        document.getElementById(
            "foto"
        );

    const fotoPreview =
        document.getElementById(
            "fotoPreview"
        );

    const fotoUploadText =
        document.getElementById(
            "fotoUploadText"
        );

    const removeFotoButton =
        document.getElementById(
            "removeFotoButton"
        );


    if (fotoInput) {

        fotoInput.value = "";
    }


    if (fotoPreview) {

        fotoPreview.src = "";

        fotoPreview.hidden =
            true;
    }


    if (fotoUploadText) {

        fotoUploadText.textContent =
            "👤";
    }


    if (removeFotoButton) {

        removeFotoButton.hidden =
            true;
    }
}


// ==========================================
// CAMBIAR ESTADO
// ==========================================

async function cambiarEstadoEstudiante(
    id,
    estadoActual
) {

    const nuevoEstado =
        estadoActual === "ACTIVO"
            ? "INACTIVO"
            : "ACTIVO";


    const confirmar =
        confirm(
            `¿Deseas cambiar el estado del estudiante a ${nuevoEstado}?`
        );


    if (!confirmar) {
        return;
    }


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


        if (
            response.status ===
            401
        ) {

            cerrarSesion();

            return;
        }


        if (
            response.status ===
            403
        ) {

            throw new Error(
                "No tienes permisos para cambiar el estado."
            );
        }


        let data = {};

        try {

            data =
                await response.json();

        } catch (error) {

            data = {};
        }


        if (!response.ok) {

            throw new Error(
                data.message ||
                data.error ||
                "No se pudo cambiar el estado."
            );
        }


        await cargarEstudiantes();

    } catch (error) {

        console.error(
            "Error al cambiar estado:",
            error
        );


        alert(
            error.message
        );
    }
}


// ==========================================
// CERRAR SESIÓN
// ==========================================

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


// ==========================================
// MOSTRAR MENSAJE
// ==========================================

function mostrarMensaje(
    elemento,
    mensaje,
    tipo
) {

    if (!elemento) {
        return;
    }


    elemento.textContent =
        mensaje;


    elemento.className =
        `form-message ${tipo}`;


    elemento.hidden =
        false;
}


// ==========================================
// OCULTAR MENSAJE
// ==========================================

function ocultarMensaje(
    elemento
) {

    if (!elemento) {
        return;
    }


    elemento.textContent =
        "";

    elemento.hidden =
        true;
}


// ==========================================
// ESCAPAR HTML
// ==========================================

function escapeHtml(
    valor
) {

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
// CERRAR MODALES CON ESC
// ==========================================

document.addEventListener(
    "keydown",
    (event) => {

        if (event.key !== "Escape") {
            return;
        }


        const registerModal =
            document.getElementById(
                "registerStudentModal"
            );

        const editModal =
            document.getElementById(
                "editStudentModal"
            );


        if (
            registerModal &&
            !registerModal.hidden
        ) {

            cerrarModalRegistro();

            return;
        }


        if (
            editModal &&
            !editModal.hidden
        ) {

            cancelarEdicion();
        }
    }
);