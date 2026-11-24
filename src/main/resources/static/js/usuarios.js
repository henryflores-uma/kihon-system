
document.addEventListener("DOMContentLoaded", async function () {
  // =========================================================
  // SESIÓN Y CONFIGURACIÓN
  // =========================================================

  const username = sessionStorage.getItem("kihonUsername");
  const rol = sessionStorage.getItem("kihonRol");

  const REGISTROS_POR_PAGINA = 10;
  const ROLES_VALIDOS = ["ADMIN", "SECRETARIA", "SENSEI", "ESTUDIANTE"];

  // =========================================================
  // ELEMENTOS DEL DOM
  // =========================================================

  const $ = (id) => document.getElementById(id);

  const elementos = {
    // Usuarios
    usuariosTableBody: $("usuariosTableBody"),
    usuariosMessage: $("usuariosMessage"),
    usuariosSearch: $("usuariosSearch"),
    estadoFiltro: $("estadoFiltro"),
    rolFiltro: $("rolFiltro"),
    registrarUsuarioButton: $("registrarUsuarioButton"),

    // KPI
    usuariosTotal: $("usuariosTotal"),
    usuariosActivos: $("usuariosActivos"),
    usuariosPendientes: $("usuariosPendientes"),
    usuariosInactivos: $("usuariosInactivos"),

    // Paginación usuarios
    usuariosPreviousPage: $("usuariosPreviousPage"),
    usuariosPageInfo: $("usuariosPageInfo"),
    usuariosNextPage: $("usuariosNextPage"),

    // Estudiantes
    estudiantesSearch: $("estudiantesSearch"),
    estudiantesMessage: $("estudiantesMessage"),
    estudiantesSinCuentaTableBody: $("estudiantesSinCuentaTableBody"),

    // Paginación estudiantes
    estudiantesPreviousPage: $("estudiantesPreviousPage"),
    estudiantesPageInfo: $("estudiantesPageInfo"),
    estudiantesNextPage: $("estudiantesNextPage"),

    // Modal crear cuenta
    crearUsuarioModal: $("crearUsuarioModal"),
    crearUsuarioModalOverlay: $("crearUsuarioModalOverlay"),
    cerrarCrearUsuarioModal: $("cerrarCrearUsuarioModal"),
    cancelarCrearUsuario: $("cancelarCrearUsuario"),
    crearUsuarioForm: $("crearUsuarioForm"),
    modalEstudianteId: $("modalEstudianteId"),
    modalEstudianteNombre: $("modalEstudianteNombre"),
    modalEstudianteDocumento: $("modalEstudianteDocumento"),
    modalEstudianteCorreo: $("modalEstudianteCorreo"),
    modalUsername: $("modalUsername"),
    modalPassword: $("modalPassword"),
    modalGenero: $("modalGenero"),
    crearUsuarioMessage: $("crearUsuarioMessage"),
    crearUsuarioSubmit: $("crearUsuarioSubmit"),

    // Modal registrar
    registrarUsuarioModal: $("registrarUsuarioModal"),
    registrarUsuarioModalOverlay: $("registrarUsuarioModalOverlay"),
    cerrarRegistrarUsuarioModal: $("cerrarRegistrarUsuarioModal"),
    cancelarRegistrarUsuario: $("cancelarRegistrarUsuario"),
    registroUsuarioForm: $("registroUsuarioForm"),

    // Modal editar
    editarUsuarioModal: $("editarUsuarioModal"),
    editarUsuarioModalOverlay: $("editarUsuarioModalOverlay"),
    cerrarEditarUsuarioModal: $("cerrarEditarUsuarioModal"),
    cancelarEditarUsuario: $("cancelarEditarUsuario"),
    editarUsuarioForm: $("editarUsuarioForm"),
    editarUsuarioId: $("editarUsuarioId"),
    editarFoto: $("editarFoto"),
    editarUsuarioFoto: $("editarUsuarioFoto"),
    editarFotoInput: $("editarFotoInput"),
    cambiarEditarFotoBtn: $("cambiarEditarFotoBtn"),
    editarUsername: $("editarUsername"),
    editarRol: $("editarRol"),
    editarPassword: $("editarPassword"),
    editarPasswordConfirmacion: $("editarPasswordConfirmacion"),
    toggleEditarPassword: $("toggleEditarPassword"),
    editarNombre: $("editarNombre"),
    editarApellido: $("editarApellido"),
    editarTipoDocumento: $("editarTipoDocumento"),
    editarNumeroDocumento: $("editarNumeroDocumento"),
    editarCodigoPais: $("editarCodigoPais"),
    editarTelefono: $("editarTelefono"),
    editarFechaNacimiento: $("editarFechaNacimiento"),
    editarGenero: $("editarGenero"),
    editarCorreo: $("editarCorreo"),
    editarUsuarioMessage: $("editarUsuarioMessage"),
    editarUsuarioSubmit: $("editarUsuarioSubmit"),

    // Modal de alertas
    sistemaAlertModal: $("sistemaAlertModal"),
    sistemaAlertModalOverlay: $("sistemaAlertModalOverlay"),
    sistemaAlertModalClose: $("sistemaAlertModalClose"),
    sistemaAlertModalTitle: $("sistemaAlertModalTitle"),
    sistemaAlertModalIcon: $("sistemaAlertModalIcon"),
    sistemaAlertModalMessage: $("sistemaAlertModalMessage"),
    sistemaAlertModalCancel: $("sistemaAlertModalCancel"),
    sistemaAlertModalConfirm: $("sistemaAlertModalConfirm"),
  };

  // =========================================================
  // DATOS EN MEMORIA
  // =========================================================

  let usuarios = [];
  let estudiantes = [];

  let usuariosPaginaActual = 1;
  let estudiantesPaginaActual = 1;

  let editarFotoSeleccionada = null;
  let resolverSistemaAlertModal = null;

  // =========================================================
  // VALIDAR SESIÓN
  // =========================================================

  if (!username || !rol) {
    sessionStorage.removeItem("kihonUsername");
    sessionStorage.removeItem("kihonRol");
    sessionStorage.removeItem("kihonAuth");

    window.location.href = "/login";
    return;
  }

  if (rol !== "ADMIN") {
    if (elementos.usuariosMessage) {
      elementos.usuariosMessage.textContent =
        "No tienes permisos para acceder a esta sección.";
    }

    if (elementos.registrarUsuarioButton) {
      elementos.registrarUsuarioButton.disabled = true;
    }

    return;
  }

  // =========================================================
  // PETICIONES AUTENTICADAS CON SESIÓN Y CSRF
  // =========================================================

  async function obtenerTokenCSRF() {
    const response = await fetch("/api/auth/csrf", {
      method: "GET",
      credentials: "same-origin",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("No se pudo obtener el token CSRF.");
    }

    const data = await response.json();

    return data.token;
  }

  async function solicitar(url, opciones = {}) {
    const method = (opciones.method || "GET").toUpperCase();

    const headers = new Headers(opciones.headers || {});

    // No utilizar autenticación Basic.
    headers.delete("Authorization");

    headers.set("Accept", "application/json");

    // Las operaciones que modifican datos requieren CSRF.
    if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
      const csrfToken = await obtenerTokenCSRF();

      headers.set("X-CSRF-TOKEN", csrfToken);
    }

    const response = await fetch(url, {
      ...opciones,
      method,
      credentials: "same-origin",
      headers,
    });

    // La sesión ya no es válida.
    if (response.status === 401) {
      sessionStorage.removeItem("kihonUsername");
      sessionStorage.removeItem("kihonRol");
      sessionStorage.removeItem("kihonAuth");

      window.location.href = "/login";

      return null;
    }

    return response;
  }

  // =========================================================
  // LECTURA SEGURA DE JSON
  // =========================================================

  async function leerJsonSeguro(response) {
    if (!response || response.status === 204) {
      return null;
    }

    const contenido = await response.text();

    if (!contenido) {
      return null;
    }

    try {
      return JSON.parse(contenido);
    } catch (error) {
      console.warn("La respuesta no contiene JSON válido.", error);
      return null;
    }
  }

  async function obtenerMensajeError(response, mensajePorDefecto) {
    try {
      const contenido = await leerJsonSeguro(response);

      if (!contenido) {
        return mensajePorDefecto;
      }

      return (
        contenido.mensaje ||
        contenido.message ||
        contenido.error ||
        mensajePorDefecto
      );
    } catch (error) {
      console.error("No se pudo leer el error:", error);
      return mensajePorDefecto;
    }
  }

  // =========================================================
  // UTILIDADES
  // =========================================================

  function escaparHtml(valor) {
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

  function normalizarTexto(valor) {
    return String(valor || "").trim().toLowerCase();
  }

  function nombreCompletoUsuario(usuario) {
    return `${usuario.nombre || ""} ${usuario.apellido || ""}`.trim();
  }

  function nombreCompletoEstudiante(estudiante) {
    return `${estudiante.nombre || ""} ${estudiante.apellido || ""}`.trim();
  }

  function obtenerDocumentoUsuario(usuario) {
    return usuario.numeroDocumento || usuario.documento || "";
  }

  function obtenerDocumentoEstudiante(estudiante) {
    return estudiante.numeroDocumento || estudiante.documento || "";
  }

  function obtenerEstudianteDeUsuario(usuario) {
    if (!usuario.estudianteId) {
      return null;
    }

    return (
      estudiantes.find(
        (estudiante) =>
          Number(estudiante.id) === Number(usuario.estudianteId),
      ) || null
    );
  }

  function obtenerFotoUsuario(usuario) {
    const estudiante = obtenerEstudianteDeUsuario(usuario);

    if (estudiante) {
      return estudiante.fotoUrl || estudiante.foto || usuario.foto || null;
    }

    return usuario.foto || null;
  }

  function generarFotoHtml(fotoUrl, nombre) {
    const inicial = escaparHtml(
      (nombre || "U").charAt(0).toUpperCase(),
    );

    if (!fotoUrl) {
      return `
        <div class="topbar__avatar" aria-label="Sin foto">
          <span>${inicial}</span>
        </div>
      `;
    }

    return `
      <div class="topbar__avatar">
        <img
          src="${escaparHtml(fotoUrl)}"
          alt="Foto de ${escaparHtml(nombre || "usuario")}"
          style="width:100%;height:100%;object-fit:cover;border-radius:50%;"
          onerror="this.parentElement.innerHTML='<span>${inicial}</span>';"
        >
      </div>
    `;
  }

  // =========================================================
  // MODAL DE ALERTAS Y CONFIRMACIONES
  // =========================================================

  function mostrarModalSistema({
    tipo = "success",
    titulo = "Información",
    mensaje = "",
    textoConfirmar = "Aceptar",
    textoCancelar = "Cancelar",
    mostrarCancelar = false,
  }) {
    return new Promise(function (resolve) {
      const modal = elementos.sistemaAlertModal;

      if (
        !modal ||
        !elementos.sistemaAlertModalTitle ||
        !elementos.sistemaAlertModalMessage ||
        !elementos.sistemaAlertModalConfirm
      ) {
        console.error(
          "No se encontró correctamente el modal de alertas.",
        );

        resolve(false);
        return;
      }

      if (resolverSistemaAlertModal) {
        resolverSistemaAlertModal(false);
      }

      resolverSistemaAlertModal = resolve;

      modal.classList.remove(
        "sistema-alert-modal--success",
        "sistema-alert-modal--error",
        "sistema-alert-modal--confirm",
      );

      modal.classList.add(`sistema-alert-modal--${tipo}`);

      elementos.sistemaAlertModalTitle.textContent = titulo;
      elementos.sistemaAlertModalMessage.textContent = mensaje;

      if (elementos.sistemaAlertModalIcon) {
        elementos.sistemaAlertModalIcon.textContent =
          tipo === "error" ? "!" : tipo === "confirm" ? "?" : "✓";
      }

      elementos.sistemaAlertModalConfirm.textContent = textoConfirmar;

      if (elementos.sistemaAlertModalCancel) {
        elementos.sistemaAlertModalCancel.textContent = textoCancelar;
        elementos.sistemaAlertModalCancel.hidden = !mostrarCancelar;
      }

      modal.hidden = false;

      setTimeout(() => {
        elementos.sistemaAlertModalConfirm.focus();
      }, 50);
    });
  }

  function cerrarModalSistema(resultado = false) {
    if (elementos.sistemaAlertModal) {
      elementos.sistemaAlertModal.hidden = true;
    }

    const resolver = resolverSistemaAlertModal;
    resolverSistemaAlertModal = null;

    if (resolver) {
      resolver(resultado);
    }
  }

  async function mostrarExito(titulo, mensaje) {
    await mostrarModalSistema({
      tipo: "success",
      titulo,
      mensaje,
      textoConfirmar: "Aceptar",
    });
  }

  async function mostrarError(titulo, mensaje) {
    await mostrarModalSistema({
      tipo: "error",
      titulo,
      mensaje,
      textoConfirmar: "Aceptar",
    });
  }

  async function mostrarConfirmacion(
    titulo,
    mensaje,
    textoConfirmar = "Confirmar",
  ) {
    return mostrarModalSistema({
      tipo: "confirm",
      titulo,
      mensaje,
      textoConfirmar,
      textoCancelar: "Cancelar",
      mostrarCancelar: true,
    });
  }

  // Funciones utilizadas por registro.js.
  window.mostrarErrorKihon = mostrarError;
  window.mostrarExitoKihon = mostrarExito;
  window.mostrarConfirmacionKihon = mostrarConfirmacion;

  if (elementos.sistemaAlertModalConfirm) {
    elementos.sistemaAlertModalConfirm.addEventListener("click", () => {
      cerrarModalSistema(true);
    });
  }

  if (elementos.sistemaAlertModalCancel) {
    elementos.sistemaAlertModalCancel.addEventListener("click", () => {
      cerrarModalSistema(false);
    });
  }

  if (elementos.sistemaAlertModalClose) {
    elementos.sistemaAlertModalClose.addEventListener("click", () => {
      cerrarModalSistema(false);
    });
  }

  if (elementos.sistemaAlertModalOverlay) {
    elementos.sistemaAlertModalOverlay.addEventListener("click", () => {
      cerrarModalSistema(false);
    });
  }

  // =========================================================
  // CARGAR USUARIOS
  // =========================================================

  async function cargarUsuarios() {
    const response = await solicitar("/api/usuarios");

    if (!response) {
      return false;
    }

    if (response.status === 403) {
      if (elementos.usuariosMessage) {
        elementos.usuariosMessage.textContent =
          "No tienes permisos para ver los usuarios.";
      }
      return false;
    }

    if (!response.ok) {
      throw new Error(
        await obtenerMensajeError(
          response,
          "No se pudieron obtener los usuarios.",
        ),
      );
    }

    const datos = await leerJsonSeguro(response);
    usuarios = Array.isArray(datos) ? datos : [];

    return true;
  }

  // =========================================================
  // CARGAR ESTUDIANTES
  // =========================================================

  async function cargarEstudiantes() {
    const response = await solicitar("/api/estudiantes");

    if (!response) {
      return false;
    }

    if (response.status === 403) {
      if (elementos.estudiantesMessage) {
        elementos.estudiantesMessage.textContent =
          "No tienes permisos para consultar estudiantes.";
      }
      return false;
    }

    if (!response.ok) {
      throw new Error(
        await obtenerMensajeError(
          response,
          "No se pudieron obtener los estudiantes.",
        ),
      );
    }

    const datos = await leerJsonSeguro(response);
    estudiantes = Array.isArray(datos) ? datos : [];

    return true;
  }

  // =========================================================
  // KPI DE USUARIOS
  // =========================================================

  function actualizarKpiUsuarios() {
    const total = usuarios.length;

    const activos = usuarios.filter(
      (usuario) => usuario.estado === "ACTIVO",
    ).length;

    const pendientes = usuarios.filter(
      (usuario) => usuario.estado === "PENDIENTE",
    ).length;

    const inactivos = usuarios.filter(
      (usuario) => usuario.estado === "INACTIVO",
    ).length;

    if (elementos.usuariosTotal) {
      elementos.usuariosTotal.textContent = total;
    }

    if (elementos.usuariosActivos) {
      elementos.usuariosActivos.textContent = activos;
    }

    if (elementos.usuariosPendientes) {
      elementos.usuariosPendientes.textContent = pendientes;
    }

    if (elementos.usuariosInactivos) {
      elementos.usuariosInactivos.textContent = inactivos;
    }
  }

  // =========================================================
  // CARGAR TODOS LOS DATOS
  // =========================================================

  async function cargarDatos() {
    try {
      if (elementos.usuariosMessage) {
        elementos.usuariosMessage.textContent = "Cargando usuarios...";
      }

      if (elementos.estudiantesMessage) {
        elementos.estudiantesMessage.textContent =
          "Cargando estudiantes...";
      }

      const usuariosCargados = await cargarUsuarios();

      if (!usuariosCargados) {
        return;
      }

      const estudiantesCargados = await cargarEstudiantes();

      if (!estudiantesCargados) {
        return;
      }

      usuariosPaginaActual = 1;
      estudiantesPaginaActual = 1;

      actualizarKpiUsuarios();
      renderizarUsuarios();
      renderizarEstudiantesSinCuenta();
    } catch (error) {
      console.error("Error cargando datos:", error);

      if (elementos.usuariosMessage) {
        elementos.usuariosMessage.textContent =
          error.message || "No se pudieron cargar los usuarios.";
      }

      if (elementos.estudiantesMessage) {
        elementos.estudiantesMessage.textContent =
          "No se pudieron cargar los estudiantes.";
      }
    }
  }

  // =========================================================
  // PAGINACIÓN
  // =========================================================

  function obtenerPagina(lista, paginaActual) {
    const totalPaginas = Math.max(
      1,
      Math.ceil(lista.length / REGISTROS_POR_PAGINA),
    );

    const paginaSegura = Math.min(
      Math.max(1, paginaActual),
      totalPaginas,
    );

    const inicio = (paginaSegura - 1) * REGISTROS_POR_PAGINA;

    return {
      elementos: lista.slice(
        inicio,
        inicio + REGISTROS_POR_PAGINA,
      ),
      paginaActual: paginaSegura,
      totalPaginas,
    };
  }

  function actualizarPaginacionUsuarios(total, totalPaginas) {
    usuariosPaginaActual = Math.min(
      Math.max(1, usuariosPaginaActual),
      totalPaginas,
    );

    if (elementos.usuariosPageInfo) {
      elementos.usuariosPageInfo.textContent =
        `Página ${usuariosPaginaActual} de ${totalPaginas}`;
    }

    if (elementos.usuariosPreviousPage) {
      elementos.usuariosPreviousPage.disabled =
        usuariosPaginaActual <= 1 || total === 0;
    }

    if (elementos.usuariosNextPage) {
      elementos.usuariosNextPage.disabled =
        usuariosPaginaActual >= totalPaginas || total === 0;
    }
  }

  function actualizarPaginacionEstudiantes(total, totalPaginas) {
    estudiantesPaginaActual = Math.min(
      Math.max(1, estudiantesPaginaActual),
      totalPaginas,
    );

    if (elementos.estudiantesPageInfo) {
      elementos.estudiantesPageInfo.textContent =
        `Página ${estudiantesPaginaActual} de ${totalPaginas}`;
    }

    if (elementos.estudiantesPreviousPage) {
      elementos.estudiantesPreviousPage.disabled =
        estudiantesPaginaActual <= 1 || total === 0;
    }

    if (elementos.estudiantesNextPage) {
      elementos.estudiantesNextPage.disabled =
        estudiantesPaginaActual >= totalPaginas || total === 0;
    }
  }

  // =========================================================
  // FILTRAR USUARIOS
  // =========================================================

  function obtenerUsuariosFiltrados() {
    const texto = normalizarTexto(
      elementos.usuariosSearch?.value,
    );

    const estado = elementos.estadoFiltro?.value || "";
    const rolSeleccionado = elementos.rolFiltro?.value || "";

    return usuarios.filter((usuario) => {
      if (estado && usuario.estado !== estado) {
        return false;
      }

      if (rolSeleccionado && usuario.rol !== rolSeleccionado) {
        return false;
      }

      if (!texto) {
        return true;
      }

      const nombre = normalizarTexto(nombreCompletoUsuario(usuario));
      const usernameUsuario = normalizarTexto(usuario.username);
      const correo = normalizarTexto(usuario.correo);
      const rolUsuario = normalizarTexto(usuario.rol);
      const documento = normalizarTexto(obtenerDocumentoUsuario(usuario));

      return (
        nombre.includes(texto) ||
        usernameUsuario.includes(texto) ||
        correo.includes(texto) ||
        rolUsuario.includes(texto) ||
        documento.includes(texto)
      );
    });
  }

  // =========================================================
  // RENDERIZAR USUARIOS
  // =========================================================

  function renderizarUsuarios() {
    const tbody = elementos.usuariosTableBody;

    if (!tbody) {
      return;
    }

    const usuariosFiltrados = obtenerUsuariosFiltrados();

    const pagina = obtenerPagina(
      usuariosFiltrados,
      usuariosPaginaActual,
    );

    usuariosPaginaActual = pagina.paginaActual;

    tbody.innerHTML = "";

    actualizarPaginacionUsuarios(
      usuariosFiltrados.length,
      pagina.totalPaginas,
    );

    if (usuariosFiltrados.length === 0) {
      if (elementos.usuariosMessage) {
        elementos.usuariosMessage.textContent =
          "No se encontraron usuarios con los filtros seleccionados.";
      }
      return;
    }

    if (elementos.usuariosMessage) {
      elementos.usuariosMessage.textContent =
        `Usuarios encontrados: ${usuariosFiltrados.length}`;
    }

    pagina.elementos.forEach((usuario) => {
      const fila = document.createElement("tr");

      const nombre = nombreCompletoUsuario(usuario);
      const fotoUrl = obtenerFotoUsuario(usuario);

      const botonEstado =
        usuario.estado === "ACTIVO"
          ? `
            <button
              type="button"
              class="btn btn--logout btn-estado"
              data-id="${escaparHtml(usuario.id)}"
              data-estado="INACTIVO"
            >
              Desactivar
            </button>
          `
          : `
            <button
              type="button"
              class="btn btn--primary btn-estado"
              data-id="${escaparHtml(usuario.id)}"
              data-estado="ACTIVO"
            >
              Activar
            </button>
          `;

      fila.innerHTML = `
        <td>
          ${generarFotoHtml(fotoUrl, nombre)}
        </td>

        <td>${escaparHtml(usuario.username)}</td>

        <td>${escaparHtml(nombre)}</td>

        <td>${escaparHtml(usuario.correo)}</td>

        <td>${escaparHtml(usuario.rol)}</td>

        <td>${escaparHtml(usuario.estado)}</td>

        <td>
          <div class="usuarios-actions">
            ${botonEstado}

            <button
              type="button"
              class="btn btn--accent btn-editar"
              data-id="${escaparHtml(usuario.id)}"
            >
              Editar
            </button>

            <button
              type="button"
              class="btn btn--logout btn-eliminar"
              data-id="${escaparHtml(usuario.id)}"
            >
              Eliminar
            </button>
          </div>
        </td>
      `;

      tbody.appendChild(fila);
    });

    tbody.querySelectorAll(".btn-estado").forEach((boton) => {
      boton.addEventListener("click", cambiarEstadoUsuario);
    });

    tbody.querySelectorAll(".btn-editar").forEach((boton) => {
      boton.addEventListener("click", editarUsuario);
    });

    tbody.querySelectorAll(".btn-eliminar").forEach((boton) => {
      boton.addEventListener("click", eliminarUsuario);
    });
  }

  // =========================================================
  // ESTUDIANTES SIN CUENTA
  // =========================================================

  function obtenerEstudiantesSinCuenta() {
    const estudiantesConCuenta = new Set();

    usuarios.forEach((usuario) => {
      if (usuario.estudianteId) {
        estudiantesConCuenta.add(Number(usuario.estudianteId));
      }
    });

    return estudiantes.filter(
      (estudiante) =>
        !estudiantesConCuenta.has(Number(estudiante.id)),
    );
  }

  function obtenerEstudiantesFiltrados() {
    const texto = normalizarTexto(
      elementos.estudiantesSearch?.value,
    );

    return obtenerEstudiantesSinCuenta().filter((estudiante) => {
      if (!texto) {
        return true;
      }

      const nombre = normalizarTexto(
        nombreCompletoEstudiante(estudiante),
      );

      const documento = normalizarTexto(
        obtenerDocumentoEstudiante(estudiante),
      );

      const correo = normalizarTexto(estudiante.correo);
      const telefono = normalizarTexto(estudiante.telefono);

      return (
        nombre.includes(texto) ||
        documento.includes(texto) ||
        correo.includes(texto) ||
        telefono.includes(texto)
      );
    });
  }

  function renderizarEstudiantesSinCuenta() {
    const tbody = elementos.estudiantesSinCuentaTableBody;

    if (!tbody) {
      return;
    }

    const estudiantesFiltrados = obtenerEstudiantesFiltrados();

    const pagina = obtenerPagina(
      estudiantesFiltrados,
      estudiantesPaginaActual,
    );

    estudiantesPaginaActual = pagina.paginaActual;

    tbody.innerHTML = "";

    actualizarPaginacionEstudiantes(
      estudiantesFiltrados.length,
      pagina.totalPaginas,
    );

    if (estudiantesFiltrados.length === 0) {
      if (elementos.estudiantesMessage) {
        elementos.estudiantesMessage.textContent =
          elementos.estudiantesSearch?.value.trim()
            ? "No se encontraron estudiantes."
            : "Todos los estudiantes tienen una cuenta.";
      }
      return;
    }

    if (elementos.estudiantesMessage) {
      elementos.estudiantesMessage.textContent =
        `Estudiantes encontrados: ${estudiantesFiltrados.length}`;
    }

    pagina.elementos.forEach((estudiante) => {
      const fila = document.createElement("tr");

      const nombre = nombreCompletoEstudiante(estudiante);
      const fotoUrl = estudiante.fotoUrl || estudiante.foto || null;

      fila.innerHTML = `
        <td>${generarFotoHtml(fotoUrl, nombre)}</td>

        <td>${escaparHtml(nombre)}</td>

        <td>${escaparHtml(obtenerDocumentoEstudiante(estudiante))}</td>

        <td>${escaparHtml(estudiante.correo)}</td>

        <td>${escaparHtml(estudiante.telefono)}</td>

        <td>
          <button
            type="button"
            class="btn btn--primary btn-crear-cuenta"
            data-id="${escaparHtml(estudiante.id)}"
          >
            Crear usuario
          </button>
        </td>
      `;

      tbody.appendChild(fila);
    });

    tbody.querySelectorAll(".btn-crear-cuenta").forEach((boton) => {
      boton.addEventListener("click", abrirModalCrearUsuario);
    });
  }

  // =========================================================
  // MODAL CREAR CUENTA DE ESTUDIANTE
  // =========================================================

  function abrirModalCrearUsuario(event) {
    const estudianteId = Number(event.currentTarget.dataset.id);

    const estudiante = estudiantes.find(
      (item) => Number(item.id) === estudianteId,
    );

    if (!estudiante) {
      mostrarError(
        "Estudiante no encontrado",
        "No fue posible encontrar el estudiante seleccionado.",
      );
      return;
    }

    elementos.modalEstudianteId.value = estudiante.id;

    elementos.modalEstudianteNombre.textContent =
      nombreCompletoEstudiante(estudiante);

    elementos.modalEstudianteDocumento.textContent =
      `Documento: ${obtenerDocumentoEstudiante(estudiante) || "-"}`;

    elementos.modalEstudianteCorreo.textContent =
      `Correo: ${estudiante.correo || "-"}`;

    elementos.modalUsername.value = "";
    elementos.modalPassword.value = "";
    elementos.modalGenero.value = "";

    elementos.crearUsuarioMessage.textContent = "";
    elementos.crearUsuarioMessage.hidden = true;

    elementos.crearUsuarioModal.hidden = false;

    setTimeout(() => elementos.modalUsername.focus(), 50);
  }

  function cerrarModalCrearUsuario() {
    if (!elementos.crearUsuarioModal) {
      return;
    }

    elementos.crearUsuarioModal.hidden = true;
    elementos.crearUsuarioForm?.reset();

    if (elementos.modalEstudianteId) {
      elementos.modalEstudianteId.value = "";
    }

    if (elementos.crearUsuarioMessage) {
      elementos.crearUsuarioMessage.textContent = "";
      elementos.crearUsuarioMessage.hidden = true;
    }
  }

  async function crearCuentaParaEstudiante(event) {
    event.preventDefault();

    const estudianteId = Number(elementos.modalEstudianteId.value);
    const nuevoUsername = elementos.modalUsername.value.trim();
    const nuevaPassword = elementos.modalPassword.value;
    const nuevoGenero = elementos.modalGenero.value;

    if (!estudianteId) {
      await mostrarError(
        "Datos incompletos",
        "No se ha seleccionado un estudiante.",
      );
      return;
    }

    if (nuevoUsername.length < 4 || nuevoUsername.length > 30) {
      await mostrarError(
        "Usuario inválido",
        "El usuario debe tener entre 4 y 30 caracteres.",
      );
      elementos.modalUsername.focus();
      return;
    }

    if (!/^[a-zA-Z0-9._-]+$/.test(nuevoUsername)) {
      await mostrarError(
        "Usuario inválido",
        "El usuario solo puede contener letras, números, punto, guion y guion bajo.",
      );
      elementos.modalUsername.focus();
      return;
    }

    if (nuevaPassword.length < 8 || nuevaPassword.length > 72) {
      await mostrarError(
        "Contraseña inválida",
        "La contraseña debe tener entre 8 y 72 caracteres.",
      );
      elementos.modalPassword.focus();
      return;
    }

    if (!nuevoGenero) {
      await mostrarError(
        "Datos incompletos",
        "Selecciona el género.",
      );
      elementos.modalGenero.focus();
      return;
    }

    const confirmar = await mostrarConfirmacion(
      "Confirmar creación",
      `¿Estás seguro de que deseas crear la cuenta "${nuevoUsername}" para este estudiante?`,
      "Crear usuario",
    );

    if (!confirmar) {
      return;
    }

    const boton = elementos.crearUsuarioSubmit;
    const textoOriginal = boton?.textContent || "Crear usuario";

    if (boton) {
      boton.disabled = true;
      boton.textContent = "Creando...";
    }

    try {
      const response = await solicitar(
        "/api/usuarios/estudiante",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            estudianteId,
            username: nuevoUsername,
            password: nuevaPassword,
            genero: nuevoGenero,
          }),
        },
      );

      if (!response) {
        return;
      }

      if (response.status === 403) {
        await mostrarError(
          "Acceso denegado",
          "No tienes permisos para crear esta cuenta.",
        );
        return;
      }

      if (response.status === 409) {
        await mostrarError(
          "No se pudo crear la cuenta",
          await obtenerMensajeError(
            response,
            "Los datos proporcionados ya están registrados.",
          ),
        );
        return;
      }

      if (!response.ok) {
        await mostrarError(
          "No se pudo crear la cuenta",
          await obtenerMensajeError(
            response,
            "No se pudo crear la cuenta.",
          ),
        );
        return;
      }

      await leerJsonSeguro(response);

      cerrarModalCrearUsuario();
      await cargarDatos();

      await mostrarExito(
        "Usuario creado",
        `La cuenta "${nuevoUsername}" fue creada correctamente.`,
      );
    } catch (error) {
      console.error("Error creando cuenta:", error);

      await mostrarError(
        "Error de conexión",
        "No se pudo conectar con el servidor.",
      );
    } finally {
      if (boton) {
        boton.disabled = false;
        boton.textContent = textoOriginal;
      }
    }
  }

  // =========================================================
  // CAMBIAR ESTADO DE USUARIO
  // =========================================================

  async function cambiarEstadoUsuario(event) {
    const boton = event.currentTarget;
    const usuarioId = Number(boton.dataset.id);
    const nuevoEstado = boton.dataset.estado;

    const textoOriginal = boton.textContent;

    try {
      boton.disabled = true;

      const response = await solicitar(
        `/api/usuarios/${usuarioId}/estado?estado=${encodeURIComponent(nuevoEstado)}`,
        { method: "PATCH" },
      );

      if (!response) {
        return;
      }

      if (response.status === 403) {
        await mostrarError(
          "Acceso denegado",
          "No tienes permisos para cambiar el estado.",
        );
        return;
      }

      if (!response.ok) {
        await mostrarError(
          "No se pudo cambiar el estado",
          await obtenerMensajeError(
            response,
            "No se pudo cambiar el estado del usuario.",
          ),
        );
        return;
      }

      await leerJsonSeguro(response);
      await cargarDatos();

      await mostrarExito(
        "Estado actualizado",
        `El usuario fue ${nuevoEstado === "ACTIVO" ? "activado" : "desactivado"} correctamente.`,
      );
    } catch (error) {
      console.error("Error cambiando estado:", error);

      await mostrarError(
        "Error de conexión",
        "No se pudo conectar con el servidor.",
      );
    } finally {
      boton.disabled = false;
      boton.textContent = textoOriginal;
    }
  }

  // =========================================================
  // ABRIR MODAL EDITAR
  // =========================================================

  function editarUsuario(event) {
    const usuarioId = Number(event.currentTarget.dataset.id);

    const usuario = usuarios.find(
      (item) => Number(item.id) === usuarioId,
    );

    if (!usuario) {
      mostrarError(
        "Usuario no encontrado",
        "No fue posible encontrar el usuario seleccionado.",
      );
      return;
    }

    elementos.editarUsuarioMessage.hidden = true;
    elementos.editarUsuarioMessage.textContent = "";

    cargarDatosEditarUsuario(usuario);

    elementos.editarUsuarioModal.hidden = false;

    setTimeout(() => {
      elementos.editarUsername.focus();
    }, 50);
  }

  // =========================================================
  // REGLAS DE TELÉFONO
  // =========================================================

  const reglasTelefonoEditar = {
    "+51": { nombre: "Perú", min: 9, max: 9 },
    "+57": { nombre: "Colombia", min: 10, max: 10 },
    "+56": { nombre: "Chile", min: 9, max: 9 },
    "+54": { nombre: "Argentina", min: 10, max: 10 },
    "+55": { nombre: "Brasil", min: 10, max: 11 },
    "+52": { nombre: "México", min: 10, max: 10 },
    "+1": { nombre: "Estados Unidos / Canadá", min: 10, max: 10 },
    "+34": { nombre: "España", min: 9, max: 9 },
  };

  function obtenerCodigoPais(telefono) {
    const codigos = [
      "+51", "+57", "+56", "+54",
      "+55", "+52", "+1", "+34",
    ];

    return codigos.find((codigo) => telefono.startsWith(codigo)) || "+51";
  }

  function actualizarReglasTelefonoEditar() {
    if (!elementos.editarCodigoPais || !elementos.editarTelefono) {
      return;
    }

    const regla =
      reglasTelefonoEditar[elementos.editarCodigoPais.value];

    if (!regla) {
      return;
    }

    elementos.editarTelefono.maxLength = regla.max;

    elementos.editarTelefono.placeholder =
      regla.min === regla.max
        ? `${regla.min} dígitos`
        : `${regla.min}-${regla.max} dígitos`;
  }

  // =========================================================
  // REGLAS DE DOCUMENTO
  // =========================================================

  function actualizarReglasDocumentoEditar() {
    if (
      !elementos.editarTipoDocumento ||
      !elementos.editarNumeroDocumento
    ) {
      return;
    }

    const tipo = elementos.editarTipoDocumento.value;
    const input = elementos.editarNumeroDocumento;

    if (tipo === "DNI") {
      input.maxLength = 8;
      input.inputMode = "numeric";
      input.pattern = "[0-9]{8}";
      input.placeholder = "8 dígitos";
      return;
    }

    if (tipo === "CE" || tipo === "PASAPORTE") {
      input.maxLength = 12;
      input.inputMode = "text";
      input.pattern = "[A-Za-z0-9]{1,12}";
      input.placeholder = "Hasta 12 caracteres";
      return;
    }

    input.removeAttribute("maxlength");
    input.removeAttribute("pattern");
    input.placeholder = "Selecciona el tipo de documento";
  }

  // =========================================================
  // CARGAR DATOS EN MODAL EDITAR
  // =========================================================

  function cargarDatosEditarUsuario(usuario) {
    elementos.editarUsuarioId.value = usuario.id || "";
    elementos.editarFoto.value = usuario.foto || "";

    editarFotoSeleccionada = null;

    if (elementos.editarFotoInput) {
      elementos.editarFotoInput.value = "";
    }

    const fotoMostrar = obtenerFotoUsuario(usuario);

    if (elementos.editarUsuarioFoto) {
      if (fotoMostrar) {
        elementos.editarUsuarioFoto.innerHTML = `
          <img
            src="${escaparHtml(fotoMostrar)}"
            alt="Foto de ${escaparHtml(nombreCompletoUsuario(usuario))}"
            style="width:100%;height:100%;object-fit:cover;border-radius:50%;"
          >
        `;
      } else {
        elementos.editarUsuarioFoto.innerHTML = `
          <span>
            ${escaparHtml(
          (nombreCompletoUsuario(usuario) || "U")
            .charAt(0)
            .toUpperCase(),
        )}
          </span>
        `;
      }
    }

    elementos.editarUsername.value = usuario.username || "";

    elementos.editarRol.value = ROLES_VALIDOS.includes(usuario.rol)
      ? usuario.rol
      : "";

    elementos.editarPassword.value = "";
    elementos.editarPasswordConfirmacion.value = "";

    elementos.editarNombre.value = usuario.nombre || "";
    elementos.editarApellido.value = usuario.apellido || "";

    elementos.editarTipoDocumento.value = usuario.tipoDocumento || "";

    actualizarReglasDocumentoEditar();

    elementos.editarNumeroDocumento.value =
      usuario.numeroDocumento || "";

    const telefono = usuario.telefono || "";
    const codigoPais = obtenerCodigoPais(telefono);

    elementos.editarCodigoPais.value = codigoPais;

    elementos.editarTelefono.value = telefono.startsWith(codigoPais)
      ? telefono.substring(codigoPais.length)
      : telefono;

    actualizarReglasTelefonoEditar();

    elementos.editarFechaNacimiento.value =
      usuario.fechaNacimiento || "";

    elementos.editarGenero.value = usuario.genero || "";
    elementos.editarCorreo.value = usuario.correo || "";
  }

  // =========================================================
  // MENSAJE MODAL EDITAR
  // =========================================================

  function mostrarMensajeEditar(mensaje) {
    if (!elementos.editarUsuarioMessage) {
      return;
    }

    elementos.editarUsuarioMessage.textContent = mensaje;
    elementos.editarUsuarioMessage.hidden = false;
  }

  // =========================================================
  // EVENTOS DE CAMPOS DEL MODAL EDITAR
  // =========================================================

  if (elementos.toggleEditarPassword) {
    elementos.toggleEditarPassword.addEventListener("click", () => {
      const mostrar =
        elementos.editarPassword.type === "password";

      elementos.editarPassword.type = mostrar ? "text" : "password";

      elementos.editarPasswordConfirmacion.type =
        mostrar ? "text" : "password";

      elementos.toggleEditarPassword.setAttribute(
        "aria-label",
        mostrar ? "Ocultar contraseña" : "Mostrar contraseña",
      );

      elementos.toggleEditarPassword.textContent =
        mostrar ? "🙈" : "👁️";
    });
  }

  if (elementos.cambiarEditarFotoBtn) {
    elementos.cambiarEditarFotoBtn.addEventListener("click", () => {
      elementos.editarFotoInput?.click();
    });
  }

  if (elementos.editarFotoInput) {
    elementos.editarFotoInput.addEventListener("change", function () {
      const archivo = this.files?.[0];

      if (!archivo) {
        return;
      }

      const tiposPermitidos = [
        "image/jpeg",
        "image/png",
        "image/webp",
      ];

      if (!tiposPermitidos.includes(archivo.type)) {
        mostrarMensajeEditar("La foto debe ser JPG, PNG o WEBP.");
        this.value = "";
        editarFotoSeleccionada = null;
        return;
      }

      if (archivo.size > 5 * 1024 * 1024) {
        mostrarMensajeEditar("La foto no puede superar los 5 MB.");
        this.value = "";
        editarFotoSeleccionada = null;
        return;
      }

      editarFotoSeleccionada = archivo;

      const reader = new FileReader();

      reader.onload = (evento) => {
        if (!elementos.editarUsuarioFoto) {
          return;
        }

        elementos.editarUsuarioFoto.innerHTML = `
          <img
            src="${evento.target.result}"
            alt="Nueva foto"
            style="width:100%;height:100%;object-fit:cover;border-radius:50%;"
          >
        `;
      };

      reader.onerror = () => {
        editarFotoSeleccionada = null;
        this.value = "";
        mostrarMensajeEditar(
          "No se pudo cargar la imagen seleccionada.",
        );
      };

      reader.readAsDataURL(archivo);
    });
  }

  if (elementos.editarCodigoPais) {
    elementos.editarCodigoPais.addEventListener("change", () => {
      elementos.editarTelefono.value = "";
      actualizarReglasTelefonoEditar();
    });
  }

  if (elementos.editarTelefono) {
    elementos.editarTelefono.addEventListener("input", () => {
      const regla =
        reglasTelefonoEditar[elementos.editarCodigoPais.value];

      if (!regla) {
        return;
      }

      elementos.editarTelefono.value =
        elementos.editarTelefono.value
          .replace(/\D/g, "")
          .slice(0, regla.max);
    });
  }

  if (elementos.editarTipoDocumento) {
    elementos.editarTipoDocumento.addEventListener("change", () => {
      actualizarReglasDocumentoEditar();
      elementos.editarNumeroDocumento.value = "";
    });
  }

  if (elementos.editarNumeroDocumento) {
    elementos.editarNumeroDocumento.addEventListener("input", () => {
      const tipo = elementos.editarTipoDocumento.value;

      if (tipo === "DNI") {
        elementos.editarNumeroDocumento.value =
          elementos.editarNumeroDocumento.value
            .replace(/\D/g, "")
            .slice(0, 8);
      } else if (tipo === "CE" || tipo === "PASAPORTE") {
        elementos.editarNumeroDocumento.value =
          elementos.editarNumeroDocumento.value
            .replace(/[^a-zA-Z0-9]/g, "")
            .slice(0, 12);
      }
    });
  }

  if (elementos.editarNombre) {
    elementos.editarNombre.addEventListener("input", () => {
      elementos.editarNombre.value =
        elementos.editarNombre.value
          .replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "")
          .slice(0, 50);
    });
  }

  if (elementos.editarApellido) {
    elementos.editarApellido.addEventListener("input", () => {
      elementos.editarApellido.value =
        elementos.editarApellido.value
          .replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "")
          .slice(0, 50);
    });
  }

  if (elementos.editarUsername) {
    elementos.editarUsername.addEventListener("input", () => {
      elementos.editarUsername.value =
        elementos.editarUsername.value
          .replace(/[^a-zA-Z0-9._-]/g, "")
          .slice(0, 30);
    });
  }

  // =========================================================
  // VALIDACIONES DEL MODAL EDITAR
  // =========================================================

  function validarPasswordEditar() {
    const password = elementos.editarPassword.value;
    const confirmacion =
      elementos.editarPasswordConfirmacion.value;

    if (!password && !confirmacion) {
      return true;
    }

    if (password.length < 8 || password.length > 72) {
      mostrarMensajeEditar(
        "La nueva contraseña debe tener entre 8 y 72 caracteres.",
      );
      elementos.editarPassword.focus();
      return false;
    }

    if (!confirmacion) {
      mostrarMensajeEditar(
        "Debes confirmar la nueva contraseña.",
      );
      elementos.editarPasswordConfirmacion.focus();
      return false;
    }

    if (password !== confirmacion) {
      mostrarMensajeEditar("Las contraseñas no coinciden.");
      elementos.editarPasswordConfirmacion.focus();
      return false;
    }

    return true;
  }

  function validarRolEditar() {
    if (!ROLES_VALIDOS.includes(elementos.editarRol.value)) {
      mostrarMensajeEditar("Debes seleccionar un rol válido.");
      elementos.editarRol.focus();
      return false;
    }

    return true;
  }

  function validarFechaNacimiento(fechaNacimiento) {
    if (!fechaNacimiento) {
      mostrarMensajeEditar(
        "La fecha de nacimiento es obligatoria.",
      );
      elementos.editarFechaNacimiento.focus();
      return false;
    }

    const [anio, mes, dia] = fechaNacimiento.split("-").map(Number);

    const fechaSeleccionada = new Date(anio, mes - 1, dia);
    const hoy = new Date();

    hoy.setHours(0, 0, 0, 0);

    if (
      Number.isNaN(fechaSeleccionada.getTime()) ||
      fechaSeleccionada.getFullYear() !== anio ||
      fechaSeleccionada.getMonth() !== mes - 1 ||
      fechaSeleccionada.getDate() !== dia
    ) {
      mostrarMensajeEditar("La fecha de nacimiento no es válida.");
      elementos.editarFechaNacimiento.focus();
      return false;
    }

    if (fechaSeleccionada > hoy) {
      mostrarMensajeEditar(
        "La fecha de nacimiento no puede ser futura.",
      );
      elementos.editarFechaNacimiento.focus();
      return false;
    }

    return true;
  }

  function validarTelefonoEditar() {
    const telefono = elementos.editarTelefono.value.trim();

    if (!telefono) {
      return true;
    }

    const regla =
      reglasTelefonoEditar[elementos.editarCodigoPais.value];

    if (!regla) {
      mostrarMensajeEditar(
        "Selecciona un código de país válido.",
      );
      elementos.editarCodigoPais.focus();
      return false;
    }

    if (!/^\d+$/.test(telefono)) {
      mostrarMensajeEditar(
        "El teléfono solo puede contener números.",
      );
      elementos.editarTelefono.focus();
      return false;
    }

    if (
      telefono.length < regla.min ||
      telefono.length > regla.max
    ) {
      mostrarMensajeEditar(
        regla.min === regla.max
          ? `El número de ${regla.nombre} debe contener exactamente ${regla.min} dígitos.`
          : `El número de ${regla.nombre} debe contener entre ${regla.min} y ${regla.max} dígitos.`,
      );

      elementos.editarTelefono.focus();
      return false;
    }

    return true;
  }

  function validarCorreoEditar() {
    const correo = elementos.editarCorreo.value.trim();

    if (!correo) {
      mostrarMensajeEditar(
        "El correo electrónico es obligatorio.",
      );
      elementos.editarCorreo.focus();
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      mostrarMensajeEditar(
        "Ingresa un correo electrónico válido.",
      );
      elementos.editarCorreo.focus();
      return false;
    }

    return true;
  }

  // =========================================================
  // GUARDAR CAMBIOS DEL USUARIO
  // =========================================================

  async function guardarCambiosUsuario(event) {
    event.preventDefault();

    const usuarioId = Number(elementos.editarUsuarioId.value);

    if (!usuarioId) {
      await mostrarError(
        "Usuario no encontrado",
        "No se encontró el usuario que deseas modificar.",
      );
      return;
    }

    const usernameEditado =
      elementos.editarUsername.value.trim();

    const rolEditado = elementos.editarRol.value;
    const passwordEditado = elementos.editarPassword.value;
    const nombreEditado = elementos.editarNombre.value.trim();
    const apellidoEditado = elementos.editarApellido.value.trim();
    const tipoDocumento = elementos.editarTipoDocumento.value;
    const numeroDocumento =
      elementos.editarNumeroDocumento.value.trim();
    const telefono = elementos.editarTelefono.value.trim();
    const fechaNacimiento =
      elementos.editarFechaNacimiento.value;
    const genero = elementos.editarGenero.value;
    const correo = elementos.editarCorreo.value.trim();

    elementos.editarUsuarioMessage.hidden = true;
    elementos.editarUsuarioMessage.textContent = "";

    // Username
    if (
      usernameEditado.length < 4 ||
      usernameEditado.length > 30
    ) {
      mostrarMensajeEditar(
        "El usuario debe tener entre 4 y 30 caracteres.",
      );
      elementos.editarUsername.focus();
      return;
    }

    if (!/^[a-zA-Z0-9._-]+$/.test(usernameEditado)) {
      mostrarMensajeEditar(
        "El usuario solo puede contener letras, números, punto, guion y guion bajo.",
      );
      elementos.editarUsername.focus();
      return;
    }

    // Rol
    if (!validarRolEditar()) {
      return;
    }

    // Contraseña
    if (!validarPasswordEditar()) {
      return;
    }

    // Nombre
    if (!nombreEditado) {
      mostrarMensajeEditar("El nombre es obligatorio.");
      elementos.editarNombre.focus();
      return;
    }

    if (
      nombreEditado.length > 50 ||
      !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombreEditado)
    ) {
      mostrarMensajeEditar(
        "El nombre debe contener solamente letras y espacios, con un máximo de 50 caracteres.",
      );
      elementos.editarNombre.focus();
      return;
    }

    // Apellido
    if (!apellidoEditado) {
      mostrarMensajeEditar("El apellido es obligatorio.");
      elementos.editarApellido.focus();
      return;
    }

    if (
      apellidoEditado.length > 50 ||
      !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(apellidoEditado)
    ) {
      mostrarMensajeEditar(
        "El apellido debe contener solamente letras y espacios, con un máximo de 50 caracteres.",
      );
      elementos.editarApellido.focus();
      return;
    }

    // Documento
    if (!tipoDocumento) {
      mostrarMensajeEditar(
        "Debes seleccionar un tipo de documento.",
      );
      elementos.editarTipoDocumento.focus();
      return;
    }

    if (!numeroDocumento) {
      mostrarMensajeEditar(
        "El número de documento es obligatorio.",
      );
      elementos.editarNumeroDocumento.focus();
      return;
    }

    if (
      tipoDocumento === "DNI" &&
      !/^\d{8}$/.test(numeroDocumento)
    ) {
      mostrarMensajeEditar(
        "El DNI debe tener exactamente 8 dígitos.",
      );
      elementos.editarNumeroDocumento.focus();
      return;
    }

    if (
      (tipoDocumento === "CE" ||
        tipoDocumento === "PASAPORTE") &&
      !/^[A-Za-z0-9]{1,12}$/.test(numeroDocumento)
    ) {
      mostrarMensajeEditar(
        "El documento debe contener entre 1 y 12 caracteres alfanuméricos.",
      );
      elementos.editarNumeroDocumento.focus();
      return;
    }

    // Teléfono
    if (!validarTelefonoEditar()) {
      return;
    }

    // Fecha
    if (!validarFechaNacimiento(fechaNacimiento)) {
      return;
    }

    // Género
    if (!genero) {
      mostrarMensajeEditar("Debes seleccionar el género.");
      elementos.editarGenero.focus();
      return;
    }

    // Correo
    if (!validarCorreoEditar()) {
      return;
    }

    const telefonoCompleto = telefono
      ? elementos.editarCodigoPais.value + telefono
      : "";

    const confirmar = await mostrarConfirmacion(
      "Confirmar cambios",
      "¿Estás seguro de que deseas guardar los cambios realizados en este usuario?",
      "Guardar cambios",
    );

    if (!confirmar) {
      return;
    }

    const formData = new FormData();

    formData.append("username", usernameEditado);
    formData.append("rol", rolEditado);
    formData.append("nombre", nombreEditado);
    formData.append("apellido", apellidoEditado);
    formData.append("tipoDocumento", tipoDocumento);
    formData.append("numeroDocumento", numeroDocumento);
    formData.append("telefono", telefonoCompleto);
    formData.append("fechaNacimiento", fechaNacimiento);
    formData.append("genero", genero);
    formData.append("correo", correo);

    if (passwordEditado) {
      formData.append("password", passwordEditado);
    }

    if (editarFotoSeleccionada) {
      formData.append("foto", editarFotoSeleccionada);
    }

    const boton = elementos.editarUsuarioSubmit;
    const textoOriginal = boton?.textContent || "Guardar cambios";

    if (boton) {
      boton.disabled = true;
      boton.textContent = "Guardando...";
    }

    try {
      const response = await solicitar(
        `/api/usuarios/${usuarioId}`,
        {
          method: "PUT",
          body: formData,
        },
      );

      if (!response) {
        return;
      }

      if (response.status === 403) {
        await mostrarError(
          "Acceso denegado",
          "No tienes permisos para editar este usuario.",
        );
        return;
      }

      if (response.status === 409) {
        await mostrarError(
          "No se pudieron guardar los cambios",
          await obtenerMensajeError(
            response,
            "Ya existe un usuario con alguno de los datos proporcionados.",
          ),
        );
        return;
      }

      if (!response.ok) {
        await mostrarError(
          "No se pudieron guardar los cambios",
          await obtenerMensajeError(
            response,
            "No se pudieron guardar los cambios.",
          ),
        );
        return;
      }

      await leerJsonSeguro(response);

      cerrarModalEditarUsuario();
      await cargarDatos();

      await mostrarExito(
        "Usuario actualizado",
        "Los cambios del usuario se guardaron correctamente.",
      );
    } catch (error) {
      console.error("Error actualizando usuario:", error);

      await mostrarError(
        "Error de conexión",
        "No se pudo conectar con el servidor.",
      );
    } finally {
      if (boton) {
        boton.disabled = false;
        boton.textContent = textoOriginal;
      }
    }
  }

  // =========================================================
  // CERRAR MODAL EDITAR
  // =========================================================

  function cerrarModalEditarUsuario() {
    if (!elementos.editarUsuarioModal) {
      return;
    }

    elementos.editarUsuarioModal.hidden = true;
    elementos.editarUsuarioForm?.reset();

    elementos.editarUsuarioId.value = "";
    elementos.editarFoto.value = "";

    editarFotoSeleccionada = null;

    if (elementos.editarFotoInput) {
      elementos.editarFotoInput.value = "";
    }

    if (elementos.editarUsuarioFoto) {
      elementos.editarUsuarioFoto.innerHTML = "";
    }

    elementos.editarUsuarioMessage.textContent = "";
    elementos.editarUsuarioMessage.hidden = true;

    elementos.editarPassword.type = "password";
    elementos.editarPasswordConfirmacion.type = "password";

    if (elementos.toggleEditarPassword) {
      elementos.toggleEditarPassword.textContent = "👁️";
      elementos.toggleEditarPassword.setAttribute(
        "aria-label",
        "Mostrar contraseña",
      );
    }

    actualizarReglasDocumentoEditar();
    actualizarReglasTelefonoEditar();
  }

  // =========================================================
  // ELIMINAR USUARIO
  // =========================================================

  async function eliminarUsuario(event) {
    const boton = event.currentTarget;
    const usuarioId = Number(boton.dataset.id);

    const usuario = usuarios.find(
      (item) => Number(item.id) === usuarioId,
    );

    if (!usuario) {
      await mostrarError(
        "Usuario no encontrado",
        "No fue posible encontrar el usuario seleccionado.",
      );
      return;
    }

    const confirmar = await mostrarConfirmacion(
      "Eliminar usuario",
      `¿Estás seguro de eliminar el usuario "${usuario.username}"?\n\nEsta acción no se puede deshacer.`,
      "Eliminar",
    );

    if (!confirmar) {
      return;
    }

    const textoOriginal = boton.textContent;

    try {
      boton.disabled = true;
      boton.textContent = "Eliminando...";

      const response = await solicitar(
        `/api/usuarios/${usuarioId}`,
        { method: "DELETE" },
      );

      if (!response) {
        return;
      }

      if (response.status === 403) {
        await mostrarError(
          "Acceso denegado",
          "No tienes permisos para eliminar usuarios.",
        );
        return;
      }

      if (response.status === 409) {
        await mostrarError(
          "No se pudo eliminar el usuario",
          await obtenerMensajeError(
            response,
            "No se puede eliminar el usuario porque tiene información relacionada.",
          ),
        );
        return;
      }

      if (!response.ok) {
        await mostrarError(
          "No se pudo eliminar el usuario",
          await obtenerMensajeError(
            response,
            "No se pudo eliminar el usuario.",
          ),
        );
        return;
      }

      await leerJsonSeguro(response);
      await cargarDatos();

      await mostrarExito(
        "Usuario eliminado",
        `El usuario "${usuario.username}" fue eliminado correctamente.`,
      );
    } catch (error) {
      console.error("Error eliminando usuario:", error);

      await mostrarError(
        "Error de conexión",
        "No se pudo conectar con el servidor.",
      );
    } finally {
      boton.disabled = false;
      boton.textContent = textoOriginal;
    }
  }

  // =========================================================
  // MODAL REGISTRAR USUARIO
  // =========================================================

  function abrirModalRegistrarUsuario() {
    if (!elementos.registrarUsuarioModal) {
      console.error(
        "No se encontró el modal registrarUsuarioModal.",
      );
      return;
    }

    elementos.registrarUsuarioModal.hidden = false;

    setTimeout(() => {
      const input = elementos.registroUsuarioForm?.querySelector(
        "#username",
      );

      input?.focus();
    }, 50);
  }

  function cerrarModalRegistrarUsuario() {
    if (!elementos.registrarUsuarioModal) {
      return;
    }

    elementos.registrarUsuarioModal.hidden = true;

    if (
      window.registroFormularioModal &&
      typeof window.registroFormularioModal.reset === "function"
    ) {
      window.registroFormularioModal.reset();
    } else {
      elementos.registroUsuarioForm?.reset();
    }
  }

  function inicializarRegistroUsuarioModal() {
    if (!elementos.registroUsuarioForm) {
      console.error("No se encontró registroUsuarioForm.");
      return;
    }

    if (
      typeof window.inicializarFormularioRegistro !== "function"
    ) {
      console.error(
        "No está disponible inicializarFormularioRegistro().",
      );
      return;
    }

    window.registroFormularioModal =
      window.inicializarFormularioRegistro(
        elementos.registroUsuarioForm,
        {
          modo: "modal",

          alCrearUsuario: async function (usuario) {
            const usernameCreado =
              usuario?.username || "El usuario";

            cerrarModalRegistrarUsuario();
            await cargarDatos();

            await mostrarExito(
              "Usuario registrado",
              `${usernameCreado} fue registrado correctamente.`,
            );
          },
        },
      );
  }

  // =========================================================
  // EVENTOS DE PAGINACIÓN
  // =========================================================

  if (elementos.usuariosPreviousPage) {
    elementos.usuariosPreviousPage.addEventListener("click", () => {
      if (usuariosPaginaActual <= 1) {
        return;
      }

      usuariosPaginaActual--;
      renderizarUsuarios();
    });
  }

  if (elementos.usuariosNextPage) {
    elementos.usuariosNextPage.addEventListener("click", () => {
      const totalPaginas = Math.max(
        1,
        Math.ceil(
          obtenerUsuariosFiltrados().length /
          REGISTROS_POR_PAGINA,
        ),
      );

      if (usuariosPaginaActual < totalPaginas) {
        usuariosPaginaActual++;
        renderizarUsuarios();
      }
    });
  }

  if (elementos.estudiantesPreviousPage) {
    elementos.estudiantesPreviousPage.addEventListener("click", () => {
      if (estudiantesPaginaActual <= 1) {
        return;
      }

      estudiantesPaginaActual--;
      renderizarEstudiantesSinCuenta();
    });
  }

  if (elementos.estudiantesNextPage) {
    elementos.estudiantesNextPage.addEventListener("click", () => {
      const totalPaginas = Math.max(
        1,
        Math.ceil(
          obtenerEstudiantesFiltrados().length /
          REGISTROS_POR_PAGINA,
        ),
      );

      if (estudiantesPaginaActual < totalPaginas) {
        estudiantesPaginaActual++;
        renderizarEstudiantesSinCuenta();
      }
    });
  }

  // =========================================================
  // EVENTOS DE BÚSQUEDA Y FILTROS
  // =========================================================

  if (elementos.usuariosSearch) {
    elementos.usuariosSearch.addEventListener("input", () => {
      usuariosPaginaActual = 1;
      renderizarUsuarios();
    });
  }

  if (elementos.estadoFiltro) {
    elementos.estadoFiltro.addEventListener("change", () => {
      usuariosPaginaActual = 1;
      renderizarUsuarios();
    });
  }

  if (elementos.rolFiltro) {
    elementos.rolFiltro.addEventListener("change", () => {
      usuariosPaginaActual = 1;
      renderizarUsuarios();
    });
  }

  if (elementos.estudiantesSearch) {
    elementos.estudiantesSearch.addEventListener("input", () => {
      estudiantesPaginaActual = 1;
      renderizarEstudiantesSinCuenta();
    });
  }

  // =========================================================
  // EVENTO REGISTRAR USUARIO
  // =========================================================

  if (elementos.registrarUsuarioButton) {
    elementos.registrarUsuarioButton.addEventListener(
      "click",
      abrirModalRegistrarUsuario,
    );
  }

  // =========================================================
  // EVENTOS MODAL CREAR CUENTA
  // =========================================================

  if (elementos.crearUsuarioForm) {
    elementos.crearUsuarioForm.addEventListener(
      "submit",
      crearCuentaParaEstudiante,
    );
  }

  if (elementos.cerrarCrearUsuarioModal) {
    elementos.cerrarCrearUsuarioModal.addEventListener(
      "click",
      cerrarModalCrearUsuario,
    );
  }

  if (elementos.cancelarCrearUsuario) {
    elementos.cancelarCrearUsuario.addEventListener(
      "click",
      cerrarModalCrearUsuario,
    );
  }

  if (elementos.crearUsuarioModalOverlay) {
    elementos.crearUsuarioModalOverlay.addEventListener(
      "click",
      cerrarModalCrearUsuario,
    );
  }

  // =========================================================
  // EVENTOS MODAL REGISTRAR
  // =========================================================

  if (elementos.cerrarRegistrarUsuarioModal) {
    elementos.cerrarRegistrarUsuarioModal.addEventListener(
      "click",
      cerrarModalRegistrarUsuario,
    );
  }

  if (elementos.cancelarRegistrarUsuario) {
    elementos.cancelarRegistrarUsuario.addEventListener(
      "click",
      cerrarModalRegistrarUsuario,
    );
  }

  if (elementos.registrarUsuarioModalOverlay) {
    elementos.registrarUsuarioModalOverlay.addEventListener(
      "click",
      cerrarModalRegistrarUsuario,
    );
  }

  // =========================================================
  // EVENTOS MODAL EDITAR
  // =========================================================

  if (elementos.cerrarEditarUsuarioModal) {
    elementos.cerrarEditarUsuarioModal.addEventListener(
      "click",
      cerrarModalEditarUsuario,
    );
  }

  if (elementos.cancelarEditarUsuario) {
    elementos.cancelarEditarUsuario.addEventListener(
      "click",
      cerrarModalEditarUsuario,
    );
  }

  if (elementos.editarUsuarioModalOverlay) {
    elementos.editarUsuarioModalOverlay.addEventListener(
      "click",
      cerrarModalEditarUsuario,
    );
  }

  if (elementos.editarUsuarioForm) {
    elementos.editarUsuarioForm.addEventListener(
      "submit",
      guardarCambiosUsuario,
    );
  }

  // =========================================================
  // CERRAR MODALES CON ESCAPE
  // =========================================================

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
      return;
    }

    if (
      elementos.sistemaAlertModal &&
      !elementos.sistemaAlertModal.hidden
    ) {
      cerrarModalSistema(false);
      return;
    }

    if (
      elementos.editarUsuarioModal &&
      !elementos.editarUsuarioModal.hidden
    ) {
      cerrarModalEditarUsuario();
      return;
    }

    if (
      elementos.registrarUsuarioModal &&
      !elementos.registrarUsuarioModal.hidden
    ) {
      cerrarModalRegistrarUsuario();
      return;
    }

    if (
      elementos.crearUsuarioModal &&
      !elementos.crearUsuarioModal.hidden
    ) {
      cerrarModalCrearUsuario();
    }
  });

  // =========================================================
  // INICIALIZAR REGISTRO
  // =========================================================

  inicializarRegistroUsuarioModal();

  // =========================================================
  // CARGA INICIAL
  // =========================================================

  await cargarDatos();
});
