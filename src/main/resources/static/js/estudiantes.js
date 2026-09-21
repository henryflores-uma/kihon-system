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

    configurarBusquedaYFiltros();

    cargarEstudiantes();
});


// ==========================================
// CONFIGURAR USUARIO
// ==========================================

function configurarUsuario() {

    const usernameDisplay =
        document.getElementById("usernameDisplay");

    const roleDisplay =
        document.getElementById("roleDisplay");

    const profileRoleDisplay =
        document.getElementById("profileRoleDisplay");

    const userAvatarInitial =
        document.getElementById("userAvatarInitial");

    const rolTexto =
        obtenerNombreRol(rol);


    if (usernameDisplay && username) {
        usernameDisplay.textContent = username;
    }


    if (roleDisplay) {
        roleDisplay.textContent = rolTexto;
    }


    if (profileRoleDisplay) {
        profileRoleDisplay.textContent = rolTexto;
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
                !container.contains(event.target)
            ) {

                if (profileMenu) {
                    profileMenu.hidden = true;
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
// BÚSQUEDA Y FILTROS
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


        const data =
            await response.json();


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
        // DATOS
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
            "editDocumento"
        ).value =
            estudiante.documento || "";


        document.getElementById(
            "editTelefono"
        ).value =
            estudiante.telefono || "";


        document.getElementById(
            "editCorreo"
        ).value =
            estudiante.correo || "";


        document.getElementById(
            "editCinturon"
        ).value =
            estudiante.cinturon || "BLANCO";


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
        guardianInfo.hidden = false;
    }


    if (guardianEmptyState) {
        guardianEmptyState.hidden = true;
    }


    if (editGuardianButton) {
        editGuardianButton.hidden = false;
    }


    if (addGuardianButton) {
        addGuardianButton.hidden = false;
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
        guardianInfo.hidden = true;
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
        editGuardianButton.hidden = true;
    }


    if (addGuardianButton) {
        addGuardianButton.hidden = false;
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
        guardianInfo.hidden = true;
    }


    if (guardianEmptyState) {
        guardianEmptyState.hidden = false;
    }


    if (editGuardianButton) {
        editGuardianButton.hidden = true;
    }


    if (addGuardianButton) {
        addGuardianButton.hidden = false;
    }


    if (editGuardianFormSection) {
        editGuardianFormSection.hidden = true;
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
                campo.value = valor;
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
        "documento",
        document.getElementById(
            "editDocumento"
        ).value.trim()
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


        const data =
            await response.json();


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

        editFotoPreview.hidden = true;
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

        fotoPreview.hidden = true;
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


        const data =
            await response.json();


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