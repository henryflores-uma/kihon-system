const auth = sessionStorage.getItem("kihonAuth");

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

const ESTUDIANTES_POR_PAGINA = 10;
let paginaActual = 1;

// Evita que se acumulen notificaciones.
window.toastErrorTimer = null;

// ==========================================
// REGLAS DE TELÉFONO POR PAÍS
// ==========================================

const reglasTelefono = {
  "+51": { nombre: "Perú", min: 9, max: 9 },
  "+57": { nombre: "Colombia", min: 10, max: 10 },
  "+56": { nombre: "Chile", min: 9, max: 9 },
  "+54": { nombre: "Argentina", min: 10, max: 10 },
  "+55": { nombre: "Brasil", min: 10, max: 11 },
  "+52": { nombre: "México", min: 10, max: 10 },
  "+1": { nombre: "Estados Unidos / Canadá", min: 10, max: 10 },
  "+34": { nombre: "España", min: 9, max: 9 },
};

// Permite letras con tildes, ñ, espacios, apóstrofes y guiones.
const REGEX_NOMBRE = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s'-]{1,50}$/;
const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ==========================================
// INICIALIZACIÓN
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
  configurarModalRegistro();
  configurarModalEdicion();
  configurarFotoRegistro();
  configurarFotoEdicion();
  configurarFechaNacimiento();
  configurarValidacionesRegistro();
  configurarValidacionesEdicion();

  configurarValidacionTelefono("telefono", "codigoPais");
  configurarValidacionTelefono("editTelefono", "editCodigoPais");

  configurarValidacionesApoderadoRegistro();
  configurarValidacionesApoderadoEdicion();

  configurarBusquedaYFiltros();
  cargarEstudiantes();
});

// ==========================================
// MODAL REGISTRO
// ==========================================

function configurarModalRegistro() {
  const openButton = document.getElementById("openRegisterStudentButton");
  const closeButton = document.getElementById("closeRegisterStudentButton");
  const cancelButton = document.getElementById("cancelRegisterStudentButton");
  const overlay = document.getElementById("registerStudentModalOverlay");
  const studentForm = document.getElementById("studentForm");

  openButton?.addEventListener("click", abrirModalRegistro);
  closeButton?.addEventListener("click", cerrarModalRegistro);
  cancelButton?.addEventListener("click", cerrarModalRegistro);
  overlay?.addEventListener("click", cerrarModalRegistro);
  studentForm?.addEventListener("submit", registrarEstudiante);
}

function abrirModalRegistro() {
  const modal = document.getElementById("registerStudentModal");

  if (!modal) return;

  limpiarFormularioRegistro();

  modal.hidden = false;
  document.body.classList.add("modal-open");
}

function cerrarModalRegistro() {
  const modal = document.getElementById("registerStudentModal");

  if (!modal) return;

  limpiarFormularioRegistro();

  modal.hidden = true;
  document.body.classList.remove("modal-open");
}

function limpiarFormularioRegistro() {
  const form = document.getElementById("studentForm");

  form?.reset();

  fotoNueva = null;

  const fotoInput = document.getElementById("foto");
  const fotoPreview = document.getElementById("fotoPreview");
  const fotoUploadText = document.getElementById("fotoUploadText");
  const removeFotoButton = document.getElementById("removeFotoButton");
  const guardianSection = document.getElementById("guardianSection");

  if (fotoInput) fotoInput.value = "";

  if (fotoPreview) {
    fotoPreview.src = "";
    fotoPreview.hidden = true;
  }

  if (fotoUploadText) {
    fotoUploadText.textContent = "👤";
  }

  if (removeFotoButton) {
    removeFotoButton.hidden = true;
  }

  if (guardianSection) {
    guardianSection.hidden = true;
  }

  deshabilitarCamposApoderado();

  const tipoDocumento = document.getElementById("tipoDocumento");
  const numeroDocumento = document.getElementById("documento");

  if (tipoDocumento && numeroDocumento) {
    numeroDocumento.value = "";
    numeroDocumento.disabled = !tipoDocumento.value;
    configurarReglasDocumento(tipoDocumento, numeroDocumento);
  }

  configurarLimiteTelefono("telefono", "codigoPais");

  ocultarMensaje(document.getElementById("studentMessage"));
}

// ==========================================
// MODAL EDICIÓN
// ==========================================

function configurarModalEdicion() {
  const closeButton = document.getElementById("closeEditStudentButton");
  const cancelButton = document.getElementById("cancelEditButton");
  const overlay = document.getElementById("editStudentModalOverlay");
  const editStudentForm = document.getElementById("editStudentForm");
  const editGuardianButton = document.getElementById("editGuardianButton");
  const addGuardianButton = document.getElementById("addGuardianButton");
  const cancelGuardianEditButton = document.getElementById(
    "cancelGuardianEditButton",
  );
  const saveGuardianButton = document.getElementById("saveGuardianButton");

  closeButton?.addEventListener("click", cancelarEdicion);
  cancelButton?.addEventListener("click", cancelarEdicion);
  overlay?.addEventListener("click", cancelarEdicion);
  editStudentForm?.addEventListener("submit", actualizarEstudiante);

  editGuardianButton?.addEventListener("click", editarApoderado);
  addGuardianButton?.addEventListener("click", agregarApoderado);

  cancelGuardianEditButton?.addEventListener(
    "click",
    ocultarFormularioApoderado,
  );

  saveGuardianButton?.addEventListener("click", guardarApoderado);
}

// ==========================================
// CONFIGURAR FOTO DE REGISTRO
// ==========================================

function configurarFotoRegistro() {
  const fotoInput = document.getElementById("foto");
  const fotoPreview = document.getElementById("fotoPreview");
  const fotoUploadText = document.getElementById("fotoUploadText");
  const removeFotoButton = document.getElementById("removeFotoButton");

  if (!fotoInput) return;

  fotoInput.addEventListener("change", () => {
    const archivo = fotoInput.files[0];

    if (!archivo) return;

    if (!validarArchivoFoto(archivo)) {
      fotoInput.value = "";
      fotoNueva = null;
      return;
    }

    fotoNueva = archivo;

    if (fotoPreview) {
      fotoPreview.src = URL.createObjectURL(archivo);
      fotoPreview.hidden = false;
    }

    if (fotoUploadText) {
      fotoUploadText.textContent = "Cambiar fotografía";
    }

    if (removeFotoButton) {
      removeFotoButton.hidden = false;
    }
  });

  removeFotoButton?.addEventListener("click", () => {
    fotoInput.value = "";
    fotoNueva = null;

    if (fotoPreview) {
      fotoPreview.src = "";
      fotoPreview.hidden = true;
    }

    if (fotoUploadText) {
      fotoUploadText.textContent = "👤";
    }

    removeFotoButton.hidden = true;
  });
}

// ==========================================
// CONFIGURAR FOTO DE EDICIÓN
// ==========================================

function configurarFotoEdicion() {
  const fotoInput = document.getElementById("editFoto");
  const fotoPreview = document.getElementById("editFotoPreview");
  const fotoUploadText = document.getElementById("editFotoUploadText");
  const removeFotoButton = document.getElementById("removeEditFotoButton");

  if (!fotoInput) return;

  fotoInput.addEventListener("change", () => {
    const archivo = fotoInput.files[0];

    if (!archivo) return;

    if (!validarArchivoFoto(archivo)) {
      fotoInput.value = "";
      fotoNueva = null;
      return;
    }

    fotoNueva = archivo;
    quitarFotoEdicion = false;

    if (fotoPreview) {
      fotoPreview.src = URL.createObjectURL(archivo);
      fotoPreview.hidden = false;
    }

    if (fotoUploadText) {
      fotoUploadText.textContent = "Cambiar fotografía";
    }

    if (removeFotoButton) {
      removeFotoButton.hidden = false;
    }
  });

  removeFotoButton?.addEventListener("click", () => {
    fotoInput.value = "";
    fotoNueva = null;
    quitarFotoEdicion = true;

    if (fotoPreview) {
      fotoPreview.src = "";
      fotoPreview.hidden = true;
    }

    if (fotoUploadText) {
      fotoUploadText.textContent = "👤";
    }

    removeFotoButton.hidden = true;
  });
}

// ==========================================
// VALIDAR FOTO
// ==========================================

function validarArchivoFoto(archivo) {
  const tiposPermitidos = ["image/jpeg", "image/png", "image/webp"];

  if (!tiposPermitidos.includes(archivo.type)) {
    notificarErrorGeneral("La fotografía debe ser JPG, PNG o WEBP.");
    return false;
  }

  const tamanioMaximo = 5 * 1024 * 1024;

  if (archivo.size > tamanioMaximo) {
    notificarErrorGeneral("La fotografía no puede superar los 5 MB.");
    return false;
  }

  return true;
}

// ==========================================
// FECHA DE NACIMIENTO
// ==========================================

function configurarFechaNacimiento() {
  const fechaNacimiento = document.getElementById("fechaNacimiento");

  if (!fechaNacimiento) return;

  fechaNacimiento.max = obtenerFechaLocalActual();
  fechaNacimiento.addEventListener("change", verificarEdadEstudiante);

  verificarEdadEstudiante();
}

function obtenerFechaLocalActual() {
  const hoy = new Date();

  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");

  return `${anio}-${mes}-${dia}`;
}

function verificarEdadEstudiante() {
  const fechaNacimiento = document.getElementById("fechaNacimiento");
  const guardianSection = document.getElementById("guardianSection");

  if (!fechaNacimiento || !guardianSection) return;

  if (!fechaNacimiento.value) {
    guardianSection.hidden = true;
    deshabilitarCamposApoderado();
    return;
  }

  const edad = calcularEdad(fechaNacimiento.value);

  if (edad < 18) {
    guardianSection.hidden = false;
    habilitarCamposApoderado();
  } else {
    guardianSection.hidden = true;
    deshabilitarCamposApoderado();
  }
}

function calcularEdad(fechaNacimiento) {
  const fecha = new Date(`${fechaNacimiento}T00:00:00`);
  const hoy = new Date();

  let edad = hoy.getFullYear() - fecha.getFullYear();
  const mes = hoy.getMonth() - fecha.getMonth();

  if (mes < 0 || (mes === 0 && hoy.getDate() < fecha.getDate())) {
    edad--;
  }

  return edad;
}

// ==========================================
// HABILITAR / DESHABILITAR APODERADO
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
    "guardianParentesco",
  ];

  campos.forEach((id) => {
    const campo = document.getElementById(id);
    if (campo) campo.disabled = false;
  });
}

function deshabilitarCamposApoderado() {
  const campos = [
    "guardianNombre",
    "guardianApellido",
    "guardianTipoDocumento",
    "guardianDocumento",
    "guardianTelefono",
    "guardianCorreo",
    "guardianDireccion",
    "guardianParentesco",
  ];

  campos.forEach((id) => {
    const campo = document.getElementById(id);

    if (campo) {
      campo.disabled = true;
      campo.value = "";
    }
  });
}

// ==========================================
// VALIDACIONES DE REGISTRO
// ==========================================

function configurarValidacionesRegistro() {
  const tipoDocumento = document.getElementById("tipoDocumento");
  const numeroDocumento = document.getElementById("documento");
  const fechaNacimiento = document.getElementById("fechaNacimiento");

  if (fechaNacimiento) {
    fechaNacimiento.max = obtenerFechaLocalActual();
  }

  configurarValidacionDocumento(tipoDocumento, numeroDocumento);

  configurarFiltroNombre(document.getElementById("nombre"));
  configurarFiltroNombre(document.getElementById("apellido"));
}

// ==========================================
// VALIDACIONES DE EDICIÓN
// ==========================================

function configurarValidacionesEdicion() {
  const tipoDocumento = document.getElementById("editTipoDocumento");
  const numeroDocumento = document.getElementById("editDocumento");
  const fechaNacimiento = document.getElementById("editFechaNacimiento");

  if (fechaNacimiento) {
    fechaNacimiento.max = obtenerFechaLocalActual();
  }

  configurarValidacionDocumento(tipoDocumento, numeroDocumento);

  configurarFiltroNombre(document.getElementById("editNombre"));
  configurarFiltroNombre(document.getElementById("editApellido"));
}

// ==========================================
// VALIDACIÓN DE DOCUMENTO
// ==========================================

function configurarValidacionDocumento(tipoDocumento, numeroDocumento) {
  if (!tipoDocumento || !numeroDocumento) return;

  numeroDocumento.disabled = !tipoDocumento.value;

  tipoDocumento.addEventListener("change", () => {
    numeroDocumento.value = "";
    configurarReglasDocumento(tipoDocumento, numeroDocumento);
  });

  numeroDocumento.addEventListener("input", () => {
    const tipo = tipoDocumento.value;

    if (tipo === "DNI") {
      numeroDocumento.value = numeroDocumento.value
        .replace(/\D/g, "")
        .slice(0, 8);
    } else if (["CE", "PASAPORTE"].includes(tipo)) {
      numeroDocumento.value = numeroDocumento.value
        .replace(/[^a-zA-Z0-9]/g, "")
        .slice(0, 12);
    }
  });

  configurarReglasDocumento(tipoDocumento, numeroDocumento);
}

// ==========================================
// FILTRO DE NOMBRE Y APELLIDO
// ==========================================

function configurarFiltroNombre(campo) {
  if (!campo) return;

  campo.maxLength = 50;

  campo.addEventListener("input", () => {
    campo.value = campo.value
      .replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s'-]/g, "")
      .slice(0, 50);
  });
}

// ==========================================
// VALIDACIONES DE APODERADO
// ==========================================

function configurarValidacionesApoderadoRegistro() {
  configurarFiltroNombre(document.getElementById("guardianNombre"));
  configurarFiltroNombre(document.getElementById("guardianApellido"));

  configurarValidacionDocumento(
    document.getElementById("guardianTipoDocumento"),
    document.getElementById("guardianDocumento"),
  );

  const telefono = document.getElementById("guardianTelefono");

  if (telefono) {
    telefono.maxLength = 15;

    telefono.addEventListener("input", () => {
      telefono.value = telefono.value.replace(/\D/g, "").slice(0, 15);
    });
  }
}

function configurarValidacionesApoderadoEdicion() {
  configurarFiltroNombre(document.getElementById("editGuardianNombre"));
  configurarFiltroNombre(document.getElementById("editGuardianApellido"));

  configurarValidacionDocumento(
    document.getElementById("editGuardianTipoDocumento"),
    document.getElementById("editGuardianDocumento"),
  );

  const telefono = document.getElementById("editGuardianTelefono");

  if (telefono) {
    telefono.maxLength = 15;

    telefono.addEventListener("input", () => {
      telefono.value = telefono.value.replace(/\D/g, "").slice(0, 15);
    });
  }
}

// ==========================================
// VALIDACIÓN DE TELÉFONO
// ==========================================

function configurarValidacionTelefono(inputId, codigoPaisId) {
  const telefono = document.getElementById(inputId);
  const codigoPais = document.getElementById(codigoPaisId);

  if (!telefono || !codigoPais) return;

  codigoPais.addEventListener("change", () => {
    telefono.value = "";
    configurarLimiteTelefono(inputId, codigoPaisId);
  });

  telefono.addEventListener("input", () => {
    const regla = reglasTelefono[codigoPais.value];

    telefono.value = telefono.value.replace(/\D/g, "");

    if (regla) {
      telefono.value = telefono.value.slice(0, regla.max);
    }
  });

  configurarLimiteTelefono(inputId, codigoPaisId);
}

function configurarLimiteTelefono(inputId, codigoPaisId) {
  const telefono = document.getElementById(inputId);
  const codigoPais = document.getElementById(codigoPaisId);

  if (!telefono || !codigoPais) return;

  const regla = reglasTelefono[codigoPais.value];

  if (!regla) {
    telefono.removeAttribute("maxlength");
    return;
  }

  telefono.maxLength = regla.max;
  telefono.value = telefono.value.replace(/\D/g, "").slice(0, regla.max);
}

// ==========================================
// REGLAS DEL DOCUMENTO
// ==========================================

function configurarReglasDocumento(tipoDocumento, numeroDocumento) {
  if (!tipoDocumento || !numeroDocumento) return;

  const tipo = tipoDocumento.value;

  if (tipo === "DNI") {
    numeroDocumento.disabled = false;
    numeroDocumento.maxLength = 8;
    numeroDocumento.inputMode = "numeric";
    numeroDocumento.pattern = "[0-9]{8}";
    numeroDocumento.placeholder = "8 dígitos";
  } else if (["CE", "PASAPORTE"].includes(tipo)) {
    numeroDocumento.disabled = false;
    numeroDocumento.maxLength = 12;
    numeroDocumento.inputMode = "text";
    numeroDocumento.pattern = "[A-Za-z0-9]{1,12}";
    numeroDocumento.placeholder = "Hasta 12 caracteres";
  } else {
    numeroDocumento.disabled = true;
    numeroDocumento.removeAttribute("maxlength");
    numeroDocumento.removeAttribute("pattern");
    numeroDocumento.inputMode = "text";
    numeroDocumento.placeholder = "Selecciona el tipo de documento";
  }
}

// ==========================================
// VALIDAR FORMULARIO DE ESTUDIANTE
// ==========================================

function validarFormularioEstudiante(prefijo) {
  const esEdicion = prefijo === "edit";

  const obtenerCampo = (nombre) =>
    document.getElementById(
      esEdicion
        ? `edit${nombre.charAt(0).toUpperCase()}${nombre.slice(1)}`
        : nombre,
    );

  const nombre = obtenerCampo("nombre");
  const apellido = obtenerCampo("apellido");
  const tipoDocumento = obtenerCampo("tipoDocumento");
  const documento = obtenerCampo("documento");
  const telefono = obtenerCampo("telefono");
  const codigoPais = obtenerCampo("codigoPais");
  const fechaNacimiento = obtenerCampo("fechaNacimiento");
  const correo = obtenerCampo("correo");
  const direccion = obtenerCampo("direccion");
  const cinturon = obtenerCampo("cinturon");

  const campos = {
    nombre,
    apellido,
    tipoDocumento,
    documento,
    telefono,
    codigoPais,
    fechaNacimiento,
    correo,
    direccion,
    cinturon,
  };

  for (const [nombreCampo, campo] of Object.entries(campos)) {
    if (!campo) {
      console.error(`No se encontró el campo: ${nombreCampo}`);

      return {
        campo: null,
        mensaje: `No se encontró el campo "${nombreCampo}" en el formulario.`,
      };
    }
  }

  if (!nombre.value.trim()) {
    return { campo: nombre, mensaje: "Este campo es obligatorio." };
  }

  if (!REGEX_NOMBRE.test(nombre.value.trim())) {
    return {
      campo: nombre,
      mensaje:
        "Usa solo letras, espacios, apóstrofes o guiones; máximo 50 caracteres.",
    };
  }

  if (!apellido.value.trim()) {
    return { campo: apellido, mensaje: "Este campo es obligatorio." };
  }

  if (!REGEX_NOMBRE.test(apellido.value.trim())) {
    return {
      campo: apellido,
      mensaje:
        "Usa solo letras, espacios, apóstrofes o guiones; máximo 50 caracteres.",
    };
  }

  if (!tipoDocumento.value) {
    return {
      campo: tipoDocumento,
      mensaje: "Selecciona un tipo de documento.",
    };
  }

  if (!["DNI", "CE", "PASAPORTE"].includes(tipoDocumento.value)) {
    return {
      campo: tipoDocumento,
      mensaje: "Selecciona un tipo de documento válido.",
    };
  }

  if (!documento.value.trim()) {
    return { campo: documento, mensaje: "Este campo es obligatorio." };
  }

  if (
    tipoDocumento.value === "DNI" &&
    !/^\d{8}$/.test(documento.value.trim())
  ) {
    return {
      campo: documento,
      mensaje: "El DNI debe tener exactamente 8 dígitos.",
    };
  }

  if (
    ["CE", "PASAPORTE"].includes(tipoDocumento.value) &&
    !/^[a-zA-Z0-9]{1,12}$/.test(documento.value.trim())
  ) {
    return {
      campo: documento,
      mensaje: "El documento debe tener entre 1 y 12 caracteres alfanuméricos.",
    };
  }

  if (!fechaNacimiento.value) {
    return {
      campo: fechaNacimiento,
      mensaje: "Este campo es obligatorio.",
    };
  }

  const fecha = new Date(`${fechaNacimiento.value}T00:00:00`);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  if (Number.isNaN(fecha.getTime()) || fecha > hoy) {
    return {
      campo: fechaNacimiento,
      mensaje: "La fecha no puede ser futura.",
    };
  }

  if (!codigoPais.value || !reglasTelefono[codigoPais.value]) {
    return {
      campo: codigoPais,
      mensaje: "Selecciona un código de país válido.",
    };
  }

  if (!telefono.value.trim()) {
    return { campo: telefono, mensaje: "Este campo es obligatorio." };
  }

  const regla = reglasTelefono[codigoPais.value];
  const numero = telefono.value.trim();

  if (
    !/^\d+$/.test(numero) ||
    numero.length < regla.min ||
    numero.length > regla.max
  ) {
    return {
      campo: telefono,
      mensaje: `El teléfono de ${regla.nombre} debe tener ${
        regla.min === regla.max
          ? `exactamente ${regla.min}`
          : `entre ${regla.min} y ${regla.max}`
      } dígitos.`,
    };
  }

  if (!correo.value.trim()) {
    return { campo: correo, mensaje: "Este campo es obligatorio." };
  }

  if (!REGEX_CORREO.test(correo.value.trim())) {
    return {
      campo: correo,
      mensaje: "Ingresa un correo electrónico válido.",
    };
  }

  if (!direccion.value.trim()) {
    return { campo: direccion, mensaje: "Este campo es obligatorio." };
  }

  if (!cinturon.value) {
    return { campo: cinturon, mensaje: "Selecciona un cinturón." };
  }

  return null;
}

// ==========================================
// VALIDAR FORMULARIO DE APODERADO
// ==========================================

function validarFormularioApoderado() {
  const nombre = document.getElementById("guardianNombre");
  const apellido = document.getElementById("guardianApellido");
  const tipoDocumento = document.getElementById("guardianTipoDocumento");
  const documento = document.getElementById("guardianDocumento");
  const telefono = document.getElementById("guardianTelefono");
  const correo = document.getElementById("guardianCorreo");
  const direccion = document.getElementById("guardianDireccion");
  const parentesco = document.getElementById("guardianParentesco");

  const campos = {
    nombre,
    apellido,
    tipoDocumento,
    documento,
    telefono,
    correo,
    direccion,
    parentesco,
  };

  for (const [nombreCampo, campo] of Object.entries(campos)) {
    if (!campo) {
      console.error(`No se encontró el campo del apoderado: ${nombreCampo}`);

      return {
        campo: null,
        mensaje: `No se encontró el campo "${nombreCampo}" del apoderado.`,
      };
    }
  }

  if (!nombre.value.trim()) {
    return { campo: nombre, mensaje: "Este campo es obligatorio." };
  }

  if (!REGEX_NOMBRE.test(nombre.value.trim())) {
    return {
      campo: nombre,
      mensaje:
        "Usa solo letras, espacios, apóstrofes o guiones; máximo 50 caracteres.",
    };
  }

  if (!apellido.value.trim()) {
    return { campo: apellido, mensaje: "Este campo es obligatorio." };
  }

  if (!REGEX_NOMBRE.test(apellido.value.trim())) {
    return {
      campo: apellido,
      mensaje:
        "Usa solo letras, espacios, apóstrofes o guiones; máximo 50 caracteres.",
    };
  }

  if (!tipoDocumento.value) {
    return {
      campo: tipoDocumento,
      mensaje: "Selecciona un tipo de documento.",
    };
  }

  if (!["DNI", "CE", "PASAPORTE"].includes(tipoDocumento.value)) {
    return {
      campo: tipoDocumento,
      mensaje: "Selecciona un tipo de documento válido.",
    };
  }

  if (!documento.value.trim()) {
    return { campo: documento, mensaje: "Este campo es obligatorio." };
  }

  if (
    tipoDocumento.value === "DNI" &&
    !/^\d{8}$/.test(documento.value.trim())
  ) {
    return {
      campo: documento,
      mensaje: "El DNI debe tener exactamente 8 dígitos.",
    };
  }

  if (
    ["CE", "PASAPORTE"].includes(tipoDocumento.value) &&
    !/^[a-zA-Z0-9]{1,12}$/.test(documento.value.trim())
  ) {
    return {
      campo: documento,
      mensaje: "El documento debe tener entre 1 y 12 caracteres alfanuméricos.",
    };
  }

  // Teléfono del apoderado: opcional.
  if (telefono.value.trim() && !/^\d{1,15}$/.test(telefono.value.trim())) {
    return {
      campo: telefono,
      mensaje: "Usa solo números, con un máximo de 15 dígitos.",
    };
  }

  // Correo del apoderado: opcional.
  if (correo.value.trim() && !REGEX_CORREO.test(correo.value.trim())) {
    return {
      campo: correo,
      mensaje: "Ingresa un correo electrónico válido.",
    };
  }

  if (!direccion.value.trim()) {
    return { campo: direccion, mensaje: "Este campo es obligatorio." };
  }

  if (!parentesco.value) {
    return {
      campo: parentesco,
      mensaje: "Selecciona el parentesco del apoderado.",
    };
  }

  return null;
}

// ==========================================
// VALIDAR DUPLICADOS DE ESTUDIANTE
// ==========================================

function validarDuplicadosEstudiante({
  documento,
  tipoDocumento,
  correo,
  excluirId = null,
}) {
  const documentoNormalizado = String(documento || "")
    .trim()
    .toLowerCase();
  const tipoNormalizado = String(tipoDocumento || "")
    .trim()
    .toUpperCase();
  const correoNormalizado = String(correo || "")
    .trim()
    .toLowerCase();

  const duplicadoDocumento = estudiantesData.find((estudiante) => {
    if (excluirId !== null && String(estudiante.id) === String(excluirId)) {
      return false;
    }

    return (
      String(estudiante.documento || "")
        .trim()
        .toLowerCase() === documentoNormalizado &&
      String(estudiante.tipoDocumento || "")
        .trim()
        .toUpperCase() === tipoNormalizado
    );
  });

  if (duplicadoDocumento) {
    return {
      campo: document.getElementById(
        excluirId !== null ? "editDocumento" : "documento",
      ),
      mensaje:
        tipoNormalizado === "DNI"
          ? "Ya existe un estudiante registrado con ese DNI."
          : "Ya existe un estudiante registrado con ese número de documento.",
    };
  }

  const duplicadoCorreo = estudiantesData.find((estudiante) => {
    if (excluirId !== null && String(estudiante.id) === String(excluirId)) {
      return false;
    }

    return (
      String(estudiante.correo || "")
        .trim()
        .toLowerCase() === correoNormalizado
    );
  });

  if (duplicadoCorreo) {
    return {
      campo: document.getElementById(
        excluirId !== null ? "editCorreo" : "correo",
      ),
      mensaje: "Ya existe un estudiante registrado con ese correo electrónico.",
    };
  }

  return null;
}

// ==========================================
// INTERPRETAR ERROR DE LA API
// ==========================================

function obtenerMensajeErrorApi(data, status, entidad = "estudiante") {
  const mensajeOriginal = [
    data?.mensaje,
    data?.message,
    data?.detail,
    data?.error,
  ]
    .filter((valor) => typeof valor === "string" && valor.trim())
    .join(" ")
    .trim();

  const mensaje = mensajeOriginal.toLowerCase();

  const esDuplicado =
    status === 409 ||
    /duplicad|duplicate|unique constraint|already exists|ya existe|ya está registrado|ya esta registrado|constraintviolation|unique index/.test(
      mensaje,
    );

  if (esDuplicado) {
    if (/correo|email|e-mail/.test(mensaje)) {
      return `El correo electrónico ya existe. Verifica el correo del ${entidad} e inténtalo nuevamente.`;
    }

    if (/documento|dni|pasaporte|carnet de extranjería|\bce\b/.test(mensaje)) {
      return `El número de documento ya existe. Verifica el documento del ${entidad} e inténtalo nuevamente.`;
    }

    return `No se pudo registrar o actualizar el ${entidad}: el correo electrónico o el documento ya están registrados.`;
  }

  if (status === 400) {
    return (
      mensajeOriginal || `Los datos enviados para el ${entidad} no son válidos.`
    );
  }

  if (status >= 500) {
    return `Ocurrió un error en el servidor al procesar el ${entidad}. Inténtalo nuevamente.`;
  }

  if (mensajeOriginal) {
    return mensajeOriginal;
  }

  return `No se pudo procesar el ${entidad}. Verifica los datos e inténtalo nuevamente.`;
}

// ==========================================
// BÚSQUEDA Y FILTROS
// ==========================================

function configurarBusquedaYFiltros() {
  const searchInput = document.getElementById("studentSearch");
  const ageFilter = document.getElementById("ageFilter");
  const beltFilter = document.getElementById("beltFilter");

  searchInput?.addEventListener("input", aplicarFiltros);
  ageFilter?.addEventListener("change", aplicarFiltros);
  beltFilter?.addEventListener("change", aplicarFiltros);
}

function obtenerEstudiantesFiltrados() {
  const searchInput = document.getElementById("studentSearch");
  const ageFilter = document.getElementById("ageFilter");
  const beltFilter = document.getElementById("beltFilter");

  const texto = searchInput ? searchInput.value.trim().toLowerCase() : "";
  const edadFiltro = ageFilter ? ageFilter.value : "TODOS";
  const cinturonFiltro = beltFilter ? beltFilter.value : "TODOS";

  return estudiantesData.filter((estudiante) => {
    const nombre =
      `${estudiante.nombre || ""} ${estudiante.apellido || ""}`.toLowerCase();

    const documento = String(estudiante.documento || "").toLowerCase();

    const coincideBusqueda =
      !texto || nombre.includes(texto) || documento.includes(texto);

    const edad = estudiante.fechaNacimiento
      ? calcularEdad(estudiante.fechaNacimiento)
      : null;

    let coincideEdad = true;

    if (edadFiltro === "MENORES") {
      coincideEdad = edad !== null && edad < 18;
    }

    if (edadFiltro === "MAYORES") {
      coincideEdad = edad !== null && edad >= 18;
    }

    const coincideCinturon =
      cinturonFiltro === "TODOS" || estudiante.cinturon === cinturonFiltro;

    return coincideBusqueda && coincideEdad && coincideCinturon;
  });
}

function aplicarFiltros() {
  paginaActual = 1;

  const filtrados = obtenerEstudiantesFiltrados();

  actualizarContador(filtrados.length);
  renderizarEstudiantes(filtrados);
}

// ==========================================
// CARGAR ESTUDIANTES
// ==========================================

async function cargarEstudiantes() {
  const studentsList = document.getElementById("studentsList");

  if (!studentsList) return;

  try {
    const response = await fetch("/api/estudiantes", {
      method: "GET",
      headers: {
        Authorization: "Basic " + auth,
      },
    });

    if (response.status === 401) {
      cerrarSesion();
      return;
    }

    if (response.status === 403) {
      throw new Error("No tienes permisos para consultar los estudiantes.");
    }

    if (!response.ok) {
      throw new Error("No se pudieron cargar los estudiantes.");
    }

    estudiantesData = await response.json();

    paginaActual = 1;

    const filtrados = obtenerEstudiantesFiltrados();

    actualizarContador(filtrados.length);
    renderizarEstudiantes(filtrados);
  } catch (error) {
    console.error("Error al cargar estudiantes:", error);

    mostrarMensaje(
      document.getElementById("studentsMessage"),
      error.message,
      "error",
    );
  }
}

// ==========================================
// ACTUALIZAR CONTADOR
// ==========================================

function actualizarContador(cantidad) {
  const studentsCount = document.getElementById("studentsCount");

  if (!studentsCount) return;

  studentsCount.textContent = `${cantidad} estudiante${cantidad === 1 ? "" : "s"}`;
}

// ==========================================
// RENDERIZAR ESTUDIANTES
// ==========================================

function renderizarEstudiantes(estudiantes) {
  const studentsList = document.getElementById("studentsList");

  if (!studentsList) return;

  if (estudiantes.length === 0) {
    studentsList.innerHTML = `
      <div class="estudiantes-empty">
        No se encontraron estudiantes.
      </div>
    `;
    return;
  }

  const totalPaginas = Math.ceil(estudiantes.length / ESTUDIANTES_POR_PAGINA);

  if (paginaActual > totalPaginas) {
    paginaActual = totalPaginas;
  }

  const inicio = (paginaActual - 1) * ESTUDIANTES_POR_PAGINA;
  const fin = inicio + ESTUDIANTES_POR_PAGINA;
  const estudiantesPagina = estudiantes.slice(inicio, fin);

  studentsList.innerHTML =
    crearTablaEstudiantes(estudiantesPagina) +
    crearPaginacion(estudiantes.length, totalPaginas);
}

// ==========================================
// CREAR PAGINACIÓN
// ==========================================

function crearPaginacion(totalEstudiantes, totalPaginas) {
  if (totalPaginas <= 1) return "";

  const inicio = (paginaActual - 1) * ESTUDIANTES_POR_PAGINA + 1;
  const fin = Math.min(paginaActual * ESTUDIANTES_POR_PAGINA, totalEstudiantes);

  let botonesPaginas = "";

  for (let pagina = 1; pagina <= totalPaginas; pagina++) {
    const clase =
      pagina === paginaActual ? "btn btn--primary" : "btn btn--secondary";

    botonesPaginas += `
      <button
        type="button"
        class="${clase}"
        onclick="cambiarPaginaEstudiantes(${pagina})"
        ${pagina === paginaActual ? "disabled" : ""}
      >
        ${pagina}
      </button>
    `;
  }

  return `
    <div style="display:flex;align-items:center;justify-content:space-between;gap:1rem;margin-top:1rem;flex-wrap:wrap;">
      <span>Mostrando ${inicio}-${fin} de ${totalEstudiantes} estudiantes</span>

      <div style="display:flex;align-items:center;gap:.4rem;flex-wrap:wrap;">
        <button
          type="button"
          class="btn btn--secondary"
          onclick="cambiarPaginaEstudiantes(${paginaActual - 1})"
          ${paginaActual === 1 ? "disabled" : ""}
        >
          Anterior
        </button>

        ${botonesPaginas}

        <button
          type="button"
          class="btn btn--secondary"
          onclick="cambiarPaginaEstudiantes(${paginaActual + 1})"
          ${paginaActual === totalPaginas ? "disabled" : ""}
        >
          Siguiente
        </button>
      </div>
    </div>
  `;
}

function cambiarPaginaEstudiantes(pagina) {
  const estudiantesFiltrados = obtenerEstudiantesFiltrados();

  const totalPaginas = Math.ceil(
    estudiantesFiltrados.length / ESTUDIANTES_POR_PAGINA,
  );

  if (pagina < 1 || pagina > totalPaginas) return;

  paginaActual = pagina;

  actualizarContador(estudiantesFiltrados.length);
  renderizarEstudiantes(estudiantesFiltrados);
}

// ==========================================
// CREAR TABLA
// ==========================================

function crearTablaEstudiantes(estudiantes) {
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
        ${estudiantes.map(crearEstudianteFila).join("")}
      </tbody>
    </table>
  `;
}

function crearEstudianteFila(estudiante) {
  const estadoClase =
    estudiante.estado === "ACTIVO"
      ? "estudiante-estado--activo"
      : "estudiante-estado--inactivo";

  const foto = estudiante.fotoUrl
    ? `
      <img
        src="${escapeHtml(estudiante.fotoUrl)}"
        alt="Foto de ${escapeHtml(estudiante.nombre)}"
        class="estudiante-foto"
      >
    `
    : `<span class="estudiante-sin-foto">Sin foto</span>`;

  return `
    <tr>
      <td>${foto}</td>

      <td>
        <div class="estudiante-nombre">
          ${escapeHtml(estudiante.nombre)}
          ${escapeHtml(estudiante.apellido)}
        </div>
      </td>

      <td>
        <div class="estudiante-documento">
          ${escapeHtml(estudiante.tipoDocumento)}
          <br>
          ${escapeHtml(estudiante.documento)}
        </div>
      </td>

      <td>
        <div class="estudiante-contacto">
          <span>${escapeHtml(estudiante.telefono)}</span>
          <span>${escapeHtml(estudiante.correo)}</span>
        </div>
      </td>

      <td>${escapeHtml(estudiante.fechaNacimiento)}</td>
      <td>${escapeHtml(estudiante.direccion)}</td>
      <td>${escapeHtml(estudiante.cinturon)}</td>

      <td>
        <span class="estudiante-estado ${estadoClase}">
          ${escapeHtml(estudiante.estado)}
        </span>
      </td>

      <td>
        <div class="estudiante-acciones">
          <button
            type="button"
            class="btn btn--primary"
            onclick="editarEstudiante(${Number(estudiante.id)})"
          >
            Editar
          </button>

          <button
            type="button"
            class="btn btn--secondary"
            onclick="cambiarEstadoEstudiante(${Number(estudiante.id)}, '${escapeHtml(estudiante.estado)}')"
          >
            ${estudiante.estado === "ACTIVO" ? "Desactivar" : "Activar"}
          </button>
        </div>
      </td>
    </tr>
  `;
}

// ==========================================
// REGISTRAR ESTUDIANTE
// ==========================================

async function registrarEstudiante(event) {
  event.preventDefault();

  const validacion = validarFormularioEstudiante("");

  if (validacion) {
    notificarErrorCampo(validacion.campo, validacion.mensaje);
    validacion.campo?.focus();
    return;
  }

  const fechaNacimiento = document.getElementById("fechaNacimiento").value;
  const edad = calcularEdad(fechaNacimiento);
  const esMenor = edad < 18;

  if (esMenor) {
    const validacionApoderado = validarFormularioApoderado();

    if (validacionApoderado) {
      notificarErrorCampo(
        validacionApoderado.campo,
        validacionApoderado.mensaje,
      );

      validacionApoderado.campo?.focus();
      return;
    }
  }

  const duplicado = validarDuplicadosEstudiante({
    documento: document.getElementById("documento").value,
    tipoDocumento: document.getElementById("tipoDocumento").value,
    correo: document.getElementById("correo").value,
  });

  if (duplicado) {
    notificarErrorCampo(duplicado.campo, duplicado.mensaje);
    duplicado.campo?.focus();
    return;
  }

  const formData = new FormData();

  const campos = [
    ["nombre", "nombre"],
    ["apellido", "apellido"],
    ["tipoDocumento", "tipoDocumento"],
    ["documento", "documento"],
    ["telefono", "telefono"],
    ["correo", "correo"],
    ["direccion", "direccion"],
    ["cinturon", "cinturon"],
  ];

  campos.forEach(([nombreCampo, id]) => {
    const campo = document.getElementById(id);
    formData.append(nombreCampo, campo.value.trim());
  });

  formData.append("fechaNacimiento", fechaNacimiento);

  if (fotoNueva) {
    formData.append("foto", fotoNueva);
  }

  try {
    const response = await fetch("/api/estudiantes", {
      method: "POST",
      headers: {
        Authorization: "Basic " + auth,
      },
      body: formData,
    });

    if (response.status === 401) {
      cerrarSesion();
      return;
    }

    const data = await leerRespuestaJson(response);

    if (response.status === 403) {
      throw new Error("No tienes permisos para registrar estudiantes.");
    }

    if (!response.ok) {
      throw new Error(
        obtenerMensajeErrorApi(data, response.status, "estudiante"),
      );
    }

    if (esMenor) {
      if (!data.id) {
        throw new Error(
          "El estudiante se creó, pero la API no devolvió su ID para registrar al apoderado.",
        );
      }

      const apoderadoRegistrado = await registrarApoderado(data.id);

      if (!apoderadoRegistrado) return;
    }

    await cargarEstudiantes();

    notificarErrorGeneral(
      esMenor
        ? "Estudiante y apoderado registrados correctamente."
        : "Estudiante registrado correctamente.",
      "success",
    );

    cerrarModalRegistro();
  } catch (error) {
    console.error("Error al registrar estudiante:", error);

    notificarErrorGeneral(
      error.message || "Ocurrió un error al registrar al estudiante.",
    );
  }
}

// ==========================================
// REGISTRAR APODERADO
// ==========================================

async function registrarApoderado(estudianteId) {
  const formData = new FormData();

  const campos = [
    ["nombre", "guardianNombre"],
    ["apellido", "guardianApellido"],
    ["tipoDocumento", "guardianTipoDocumento"],
    ["documento", "guardianDocumento"],
    ["telefono", "guardianTelefono"],
    ["correo", "guardianCorreo"],
    ["direccion", "guardianDireccion"],
    ["parentesco", "guardianParentesco"],
  ];

  campos.forEach(([nombreCampo, id]) => {
    const campo = document.getElementById(id);
    formData.append(nombreCampo, campo.value.trim());
  });

  const response = await fetch(`/api/apoderados/estudiante/${estudianteId}`, {
    method: "POST",
    headers: {
      Authorization: "Basic " + auth,
    },
    body: formData,
  });

  if (response.status === 401) {
    cerrarSesion();
    return false;
  }

  const data = await leerRespuestaJson(response);

  if (response.status === 403) {
    throw new Error("No tienes permisos para registrar el apoderado.");
  }

  if (!response.ok) {
    throw new Error(obtenerMensajeErrorApi(data, response.status, "apoderado"));
  }

  return true;
}

// ==========================================
// EDITAR ESTUDIANTE
// ==========================================

async function editarEstudiante(id) {
  try {
    const response = await fetch(`/api/estudiantes/${id}`, {
      method: "GET",
      headers: {
        Authorization: "Basic " + auth,
      },
    });

    if (response.status === 401) {
      cerrarSesion();
      return;
    }

    if (response.status === 403) {
      throw new Error("No tienes permisos para consultar este estudiante.");
    }

    if (!response.ok) {
      throw new Error("No se pudo obtener el estudiante.");
    }

    const estudiante = await response.json();

    estudianteEditandoId = estudiante.id;

    document.getElementById("editId").value = estudiante.id;
    document.getElementById("editNombre").value = estudiante.nombre || "";
    document.getElementById("editApellido").value = estudiante.apellido || "";
    document.getElementById("editTipoDocumento").value =
      estudiante.tipoDocumento || "";
    document.getElementById("editDocumento").value = estudiante.documento || "";
    document.getElementById("editFechaNacimiento").value =
      estudiante.fechaNacimiento || "";
    document.getElementById("editTelefono").value = estudiante.telefono || "";
    document.getElementById("editCorreo").value = estudiante.correo || "";
    document.getElementById("editDireccion").value = estudiante.direccion || "";
    document.getElementById("editCinturon").value =
      estudiante.cinturon || "BLANCO";

    configurarReglasDocumento(
      document.getElementById("editTipoDocumento"),
      document.getElementById("editDocumento"),
    );

    configurarLimiteTelefono("editTelefono", "editCodigoPais");

    prepararFotoEdicion(estudiante);
    limpiarInterfazApoderado();

    await cargarApoderados(estudiante.id);

    const modal = document.getElementById("editStudentModal");

    if (modal) {
      modal.hidden = false;
      document.body.classList.add("modal-open");
    }
  } catch (error) {
    console.error("Error al editar estudiante:", error);
    notificarErrorGeneral(error.message || "No se pudo abrir la edición.");
  }
}

// ==========================================
// PREPARAR FOTO DE EDICIÓN
// ==========================================

function prepararFotoEdicion(estudiante) {
  fotoNueva = null;
  quitarFotoEdicion = false;

  const editFotoInput = document.getElementById("editFoto");
  const editFotoPreview = document.getElementById("editFotoPreview");
  const editFotoUploadText = document.getElementById("editFotoUploadText");
  const removeEditFotoButton = document.getElementById("removeEditFotoButton");

  if (editFotoInput) {
    editFotoInput.value = "";
  }

  if (estudiante.fotoUrl) {
    if (editFotoPreview) {
      editFotoPreview.src = estudiante.fotoUrl;
      editFotoPreview.hidden = false;
    }

    if (editFotoUploadText) {
      editFotoUploadText.textContent = "Cambiar fotografía";
    }

    if (removeEditFotoButton) {
      removeEditFotoButton.hidden = false;
    }
  } else {
    if (editFotoPreview) {
      editFotoPreview.src = "";
      editFotoPreview.hidden = true;
    }

    if (editFotoUploadText) {
      editFotoUploadText.textContent = "👤";
    }

    if (removeEditFotoButton) {
      removeEditFotoButton.hidden = true;
    }
  }
}

// ==========================================
// CARGAR APODERADOS
// ==========================================

async function cargarApoderados(estudianteId) {
  try {
    const response = await fetch(`/api/apoderados/estudiante/${estudianteId}`, {
      method: "GET",
      headers: {
        Authorization: "Basic " + auth,
      },
    });

    if (response.status === 401) {
      cerrarSesion();
      return;
    }

    if (response.status === 403) {
      throw new Error("No tienes permisos para consultar los apoderados.");
    }

    if (!response.ok) {
      throw new Error("No se pudieron consultar los apoderados.");
    }

    const apoderados = await response.json();

    if (Array.isArray(apoderados) && apoderados.length > 0) {
      apoderadoActual = apoderados[0];
      mostrarApoderado(apoderadoActual);
    } else {
      apoderadoActual = null;
      mostrarSinApoderado();
    }
  } catch (error) {
    console.error("Error al cargar apoderados:", error);
    mostrarSinApoderado(error.message);
  }
}

// ==========================================
// MOSTRAR APODERADO
// ==========================================

function mostrarApoderado(apoderado) {
  const guardianInfo = document.getElementById("guardianInfo");
  const guardianEmptyState = document.getElementById("guardianEmptyState");
  const editGuardianButton = document.getElementById("editGuardianButton");
  const addGuardianButton = document.getElementById("addGuardianButton");
  const guardianFullName = document.getElementById("guardianFullName");
  const guardianRelationship = document.getElementById("guardianRelationship");
  const guardianDocumentDisplay = document.getElementById(
    "guardianDocumentDisplay",
  );
  const guardianPhoneDisplay = document.getElementById("guardianPhoneDisplay");
  const guardianEmailDisplay = document.getElementById("guardianEmailDisplay");

  if (guardianInfo) guardianInfo.hidden = false;
  if (guardianEmptyState) guardianEmptyState.hidden = true;
  if (editGuardianButton) editGuardianButton.hidden = false;
  if (addGuardianButton) addGuardianButton.hidden = false;

  if (guardianFullName) {
    guardianFullName.textContent =
      `${apoderado.nombre || ""} ${apoderado.apellido || ""}`.trim();
  }

  if (guardianRelationship) {
    guardianRelationship.textContent = apoderado.parentesco || "";
  }

  if (guardianDocumentDisplay) {
    guardianDocumentDisplay.textContent =
      `${apoderado.tipoDocumento || ""} ${apoderado.documento || ""}`.trim();
  }

  if (guardianPhoneDisplay) {
    guardianPhoneDisplay.textContent = apoderado.telefono || "Sin teléfono";
  }

  if (guardianEmailDisplay) {
    guardianEmailDisplay.textContent = apoderado.correo || "Sin correo";
  }
}

// ==========================================
// MOSTRAR SIN APODERADO
// ==========================================

function mostrarSinApoderado(mensaje = null) {
  const guardianInfo = document.getElementById("guardianInfo");
  const guardianEmptyState = document.getElementById("guardianEmptyState");
  const editGuardianButton = document.getElementById("editGuardianButton");
  const addGuardianButton = document.getElementById("addGuardianButton");

  if (guardianInfo) guardianInfo.hidden = true;

  if (guardianEmptyState) {
    guardianEmptyState.hidden = false;

    if (mensaje) {
      const paragraph = guardianEmptyState.querySelector("p");

      if (paragraph) {
        paragraph.textContent = mensaje;
      }
    }
  }

  if (editGuardianButton) editGuardianButton.hidden = true;
  if (addGuardianButton) addGuardianButton.hidden = false;
}

// ==========================================
// LIMPIAR INTERFAZ APODERADO
// ==========================================

function limpiarInterfazApoderado() {
  apoderadoActual = null;

  const guardianInfo = document.getElementById("guardianInfo");
  const guardianEmptyState = document.getElementById("guardianEmptyState");
  const editGuardianButton = document.getElementById("editGuardianButton");
  const addGuardianButton = document.getElementById("addGuardianButton");
  const editGuardianFormSection = document.getElementById(
    "editGuardianFormSection",
  );

  if (guardianInfo) guardianInfo.hidden = true;
  if (guardianEmptyState) guardianEmptyState.hidden = false;
  if (editGuardianButton) editGuardianButton.hidden = true;
  if (addGuardianButton) addGuardianButton.hidden = false;
  if (editGuardianFormSection) editGuardianFormSection.hidden = true;

  limpiarFormularioApoderado();
}

// ==========================================
// EDITAR APODERADO
// ==========================================

function editarApoderado() {
  if (!apoderadoActual) {
    notificarErrorGeneral("No existe un apoderado para editar.");
    return;
  }

  cargarDatosFormularioApoderado(apoderadoActual);

  const editGuardianFormSection = document.getElementById(
    "editGuardianFormSection",
  );

  if (editGuardianFormSection) {
    editGuardianFormSection.hidden = false;
  }
}

// ==========================================
// AGREGAR APODERADO
// ==========================================

function agregarApoderado() {
  limpiarFormularioApoderado();

  const editGuardianFormSection = document.getElementById(
    "editGuardianFormSection",
  );

  if (editGuardianFormSection) {
    editGuardianFormSection.hidden = false;
  }
}

// ==========================================
// CARGAR DATOS DEL FORMULARIO DE APODERADO
// ==========================================

function cargarDatosFormularioApoderado(apoderado) {
  const campos = {
    editGuardianId: apoderado.id || "",
    editGuardianNombre: apoderado.nombre || "",
    editGuardianApellido: apoderado.apellido || "",
    editGuardianTipoDocumento: apoderado.tipoDocumento || "",
    editGuardianDocumento: apoderado.documento || "",
    editGuardianTelefono: apoderado.telefono || "",
    editGuardianCorreo: apoderado.correo || "",
    editGuardianDireccion: apoderado.direccion || "",
    editGuardianParentesco: apoderado.parentesco || "",
  };

  Object.entries(campos).forEach(([id, valor]) => {
    const campo = document.getElementById(id);

    if (campo) {
      campo.value = valor;
    }
  });

  configurarReglasDocumento(
    document.getElementById("editGuardianTipoDocumento"),
    document.getElementById("editGuardianDocumento"),
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
    "editGuardianParentesco",
  ];

  ids.forEach((id) => {
    const campo = document.getElementById(id);

    if (campo) {
      campo.value = "";
    }
  });
}

// ==========================================
// OCULTAR FORMULARIO APODERADO
// ==========================================

function ocultarFormularioApoderado() {
  const editGuardianFormSection = document.getElementById(
    "editGuardianFormSection",
  );

  if (editGuardianFormSection) {
    editGuardianFormSection.hidden = true;
  }
}

// ==========================================
// GUARDAR APODERADO
// ==========================================

async function guardarApoderado() {
  if (!estudianteEditandoId) {
    notificarErrorGeneral("No se encontró el estudiante.");
    return;
  }

  /*
   * El endpoint PUT/PATCH para actualizar apoderados aún no está implementado.
   * Se conserva este aviso para no enviar peticiones a rutas inexistentes.
   */

  notificarErrorGeneral(
    "La edición y el guardado del apoderado se conectarán cuando implementemos el endpoint correspondiente en el backend.",
  );
}

// ==========================================
// ACTUALIZAR ESTUDIANTE
// ==========================================

async function actualizarEstudiante(event) {
  event.preventDefault();

  const validacion = validarFormularioEstudiante("edit");

  if (validacion) {
    notificarErrorCampo(validacion.campo, validacion.mensaje);
    validacion.campo?.focus();
    return;
  }

  const id = document.getElementById("editId").value;

  const duplicado = validarDuplicadosEstudiante({
    documento: document.getElementById("editDocumento").value,
    tipoDocumento: document.getElementById("editTipoDocumento").value,
    correo: document.getElementById("editCorreo").value,
    excluirId: id,
  });

  if (duplicado) {
    notificarErrorCampo(duplicado.campo, duplicado.mensaje);
    duplicado.campo?.focus();
    return;
  }

  const formData = new FormData();

  formData.append("nombre", document.getElementById("editNombre").value.trim());
  formData.append(
    "apellido",
    document.getElementById("editApellido").value.trim(),
  );
  formData.append(
    "tipoDocumento",
    document.getElementById("editTipoDocumento").value,
  );
  formData.append(
    "documento",
    document.getElementById("editDocumento").value.trim(),
  );
  formData.append(
    "fechaNacimiento",
    document.getElementById("editFechaNacimiento").value,
  );
  formData.append(
    "telefono",
    document.getElementById("editTelefono").value.trim(),
  );
  formData.append("correo", document.getElementById("editCorreo").value.trim());
  formData.append(
    "direccion",
    document.getElementById("editDireccion").value.trim(),
  );
  formData.append("cinturon", document.getElementById("editCinturon").value);
  formData.append("quitarFoto", quitarFotoEdicion);

  if (fotoNueva) {
    formData.append("foto", fotoNueva);
  }

  try {
    const response = await fetch(`/api/estudiantes/${id}`, {
      method: "PUT",
      headers: {
        Authorization: "Basic " + auth,
      },
      body: formData,
    });

    if (response.status === 401) {
      cerrarSesion();
      return;
    }

    const data = await leerRespuestaJson(response);

    if (response.status === 403) {
      throw new Error("No tienes permisos para actualizar estudiantes.");
    }

    if (!response.ok) {
      throw new Error(
        obtenerMensajeErrorApi(data, response.status, "estudiante"),
      );
    }

    fotoNueva = null;
    quitarFotoEdicion = false;

    await cargarEstudiantes();
    cancelarEdicion();

    notificarErrorGeneral("Estudiante actualizado correctamente.", "success");
  } catch (error) {
    console.error("Error al actualizar estudiante:", error);

    notificarErrorGeneral(
      error.message || "No se pudo actualizar el estudiante.",
    );
  }
}

// ==========================================
// CANCELAR EDICIÓN
// ==========================================

function cancelarEdicion() {
  const modal = document.getElementById("editStudentModal");
  const editForm = document.getElementById("editStudentForm");

  editForm?.reset();

  if (modal) {
    modal.hidden = true;
  }

  document.body.classList.remove("modal-open");

  fotoNueva = null;
  quitarFotoEdicion = false;
  estudianteEditandoId = null;
  apoderadoActual = null;

  limpiarInterfazApoderado();

  configurarLimiteTelefono("editTelefono", "editCodigoPais");

  const editFotoPreview = document.getElementById("editFotoPreview");
  const editFotoUploadText = document.getElementById("editFotoUploadText");
  const removeEditFotoButton = document.getElementById("removeEditFotoButton");

  if (editFotoPreview) {
    editFotoPreview.src = "";
    editFotoPreview.hidden = true;
  }

  if (editFotoUploadText) {
    editFotoUploadText.textContent = "👤";
  }

  if (removeEditFotoButton) {
    removeEditFotoButton.hidden = true;
  }

  ocultarMensaje(document.getElementById("editStudentMessage"));
}

// ==========================================
// LIMPIAR FOTO DE REGISTRO
// ==========================================

function limpiarFotoRegistro() {
  const fotoInput = document.getElementById("foto");
  const fotoPreview = document.getElementById("fotoPreview");
  const fotoUploadText = document.getElementById("fotoUploadText");
  const removeFotoButton = document.getElementById("removeFotoButton");

  if (fotoInput) fotoInput.value = "";

  if (fotoPreview) {
    fotoPreview.src = "";
    fotoPreview.hidden = true;
  }

  if (fotoUploadText) {
    fotoUploadText.textContent = "👤";
  }

  if (removeFotoButton) {
    removeFotoButton.hidden = true;
  }
}

// ==========================================
// CAMBIAR ESTADO
// ==========================================

async function cambiarEstadoEstudiante(id, estadoActual) {
  const nuevoEstado = estadoActual === "ACTIVO" ? "INACTIVO" : "ACTIVO";

  const confirmar = confirm(
    `¿Deseas cambiar el estado del estudiante a ${nuevoEstado}?`,
  );

  if (!confirmar) return;

  try {
    const response = await fetch(
      `/api/estudiantes/${id}/estado?estado=${nuevoEstado}`,
      {
        method: "PATCH",
        headers: {
          Authorization: "Basic " + auth,
        },
      },
    );

    if (response.status === 401) {
      cerrarSesion();
      return;
    }

    if (response.status === 403) {
      throw new Error("No tienes permisos para cambiar el estado.");
    }

    const data = await leerRespuestaJson(response);

    if (!response.ok) {
      throw new Error(
        data.message || data.error || "No se pudo cambiar el estado.",
      );
    }

    await cargarEstudiantes();

    notificarErrorGeneral(
      `El estudiante ahora está ${nuevoEstado.toLowerCase()}.`,
      "success",
    );
  } catch (error) {
    console.error("Error al cambiar estado:", error);
    notificarErrorGeneral(error.message || "No se pudo cambiar el estado.");
  }
}

// ==========================================
// LEER RESPUESTA JSON SIN INTERRUMPIR EL FLUJO
// ==========================================

async function leerRespuestaJson(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

// ==========================================
// MOSTRAR Y OCULTAR MENSAJES
// ==========================================

function mostrarMensaje(elemento, mensaje, tipo) {
  if (!elemento) return;

  elemento.textContent = mensaje;
  elemento.hidden = false;

  if (elemento.id === "studentToast") {
    elemento.className = `student-toast student-toast--${tipo}`;
    elemento.setAttribute("role", tipo === "error" ? "alert" : "status");
    elemento.setAttribute(
      "aria-live",
      tipo === "error" ? "assertive" : "polite",
    );
  } else {
    elemento.className = `estudiantes-message estudiantes-message--${tipo}`;
    elemento.setAttribute("role", tipo === "error" ? "alert" : "status");
    elemento.setAttribute("aria-live", "polite");
  }
}

function ocultarMensaje(elemento) {
  if (!elemento) return;

  elemento.textContent = "";
  elemento.hidden = true;
}

// ==========================================
// NOTIFICACIÓN GENERAL TOAST
// ==========================================

function notificarErrorGeneral(mensaje, tipo = "error") {
  const toast = document.getElementById("studentToast");

  if (!toast) {
    console.error(mensaje);
    return;
  }

  clearTimeout(window.toastErrorTimer);

  mostrarMensaje(toast, mensaje, tipo);

  window.toastErrorTimer = setTimeout(
    () => ocultarMensaje(toast),
    tipo === "error" ? 5000 : 4000,
  );
}

// ==========================================
// NOTIFICACIÓN DE ERROR POR CAMPO
// ==========================================

function notificarErrorCampo(campo, mensaje) {
  if (!campo) {
    notificarErrorGeneral(mensaje);
    return;
  }

  const etiqueta = obtenerEtiquetaCampo(campo);
  const nombreCampo = etiqueta || campo.id || "campo";

  notificarErrorGeneral(
    `Revisa el campo "${nombreCampo}". ${mensaje}`,
    "error",
  );
}

function obtenerEtiquetaCampo(campo) {
  if (!campo) return "";

  const label = document.querySelector(`label[for="${campo.id}"]`);

  if (label) {
    return label.textContent.trim().replace(/\s+/g, " ");
  }

  const etiquetasAlternativas = {
    nombre: "Nombre",
    apellido: "Apellido",
    tipoDocumento: "Tipo de documento",
    documento: "Número de documento",
    telefono: "Teléfono",
    correo: "Correo electrónico",
    direccion: "Dirección",
    fechaNacimiento: "Fecha de nacimiento",
    cinturon: "Cinturón",
    guardianNombre: "Nombre del apoderado",
    guardianApellido: "Apellido del apoderado",
    guardianTipoDocumento: "Tipo de documento del apoderado",
    guardianDocumento: "Documento del apoderado",
    guardianTelefono: "Teléfono del apoderado",
    guardianCorreo: "Correo del apoderado",
    guardianDireccion: "Dirección del apoderado",
    guardianParentesco: "Parentesco del apoderado",
    editNombre: "Nombre",
    editApellido: "Apellido",
    editTipoDocumento: "Tipo de documento",
    editDocumento: "Número de documento",
    editTelefono: "Teléfono",
    editCorreo: "Correo electrónico",
    editDireccion: "Dirección",
    editFechaNacimiento: "Fecha de nacimiento",
    editCinturon: "Cinturón",
    editGuardianNombre: "Nombre del apoderado",
    editGuardianApellido: "Apellido del apoderado",
    editGuardianTipoDocumento: "Tipo de documento del apoderado",
    editGuardianDocumento: "Documento del apoderado",
    editGuardianTelefono: "Teléfono del apoderado",
    editGuardianCorreo: "Correo del apoderado",
    editGuardianDireccion: "Dirección del apoderado",
    editGuardianParentesco: "Parentesco del apoderado",
  };

  return etiquetasAlternativas[campo.id] || campo.id;
}

// ==========================================
// ESCAPAR HTML
// ==========================================

function escapeHtml(valor) {
  if (valor === null || valor === undefined) {
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
// CERRAR SESIÓN
// ==========================================

function cerrarSesion() {
  sessionStorage.removeItem("kihonAuth");
  window.location.href = "/login";
}

// ==========================================
// CERRAR MODALES CON ESC
// ==========================================

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;

  const registerModal = document.getElementById("registerStudentModal");
  const editModal = document.getElementById("editStudentModal");

  if (registerModal && !registerModal.hidden) {
    cerrarModalRegistro();
    return;
  }

  if (editModal && !editModal.hidden) {
    cancelarEdicion();
  }
});
