
document.addEventListener("DOMContentLoaded", async function () {
  // ==========================================
  // DATOS DE SESIÓN
  // ==========================================

  const username = sessionStorage.getItem("kihonUsername");
  const rolOriginal = sessionStorage.getItem("kihonRol");

  // ==========================================
  // NORMALIZAR ROL
  // ==========================================

  function normalizarRol(rol) {
    const equivalencias = {
      ADMIN: "ADMIN",
      SECRETARIA: "SECRETARIA",
      SENSEI: "SENSEI",
      PROFESOR: "SENSEI",
      ESTUDIANTE: "ESTUDIANTE",
      ALUMNO: "ESTUDIANTE",
    };

    return equivalencias[rol] || rol;
  }

  const rol = normalizarRol(rolOriginal);

  // ==========================================
  // ELEMENTOS DEL TOPBAR
  // ==========================================

  const usernameDisplay = document.getElementById("usernameDisplay");
  const roleDisplay = document.getElementById("roleDisplay");
  const profileRoleDisplay = document.getElementById("profileRoleDisplay");

  const profileMenuContainer = document.getElementById("profileMenuContainer");
  const profileMenuButton = document.getElementById("profileMenuButton");
  const profileMenu = document.getElementById("profileMenu");

  const topbarLogoutButton = document.getElementById("topbarLogoutButton");
  const userProfileAvatar = document.getElementById("userProfileAvatar");

  // ==========================================
  // INFORMACIÓN DE LOS ROLES
  // ==========================================

  const configuracionRoles = {
    ADMIN: {
      nombre: "Administrador",
      dashboard: "/admin/admin",
      perfil: "/admin/perfil",
    },

    SECRETARIA: {
      nombre: "Secretaria",
      dashboard: "/secretaria/secretaria",
      perfil: "/secretaria/perfil",
    },

    SENSEI: {
      nombre: "Sensei",
      dashboard: "/sensei/sensei",
      perfil: "/sensei/perfil",
    },

    ESTUDIANTE: {
      nombre: "Estudiante",
      dashboard: "/estudiante/estudiante",
      perfil: "/estudiante/perfil",
    },
  };

  const configuracion = configuracionRoles[rol];

  // ==========================================
  // VERIFICAR DATOS DE SESIÓN
  // ==========================================

  if (!username || !rol || !configuracion) {
    console.warn("No se encontraron datos de usuario válidos.");

    sessionStorage.removeItem("kihonUsername");
    sessionStorage.removeItem("kihonRol");
    sessionStorage.removeItem("kihonAuth");

    window.location.href = "/login";
    return;
  }

  // ==========================================
  // VERIFICAR SESIÓN EN EL SERVIDOR
  // ==========================================

  async function verificarSesion() {
    try {
      const response = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "same-origin",
        headers: {
          Accept: "application/json",
        },
      });

      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("kihonUsername");
        sessionStorage.removeItem("kihonRol");
        sessionStorage.removeItem("kihonAuth");

        window.location.href = "/login";
        return false;
      }

      if (!response.ok) {
        console.error("No se pudo verificar la sesión.");
        return false;
      }

      const usuario = await response.json();

      // Los datos del navegador se actualizan con los del servidor.
      sessionStorage.setItem("kihonUsername", usuario.username);
      sessionStorage.setItem("kihonRol", normalizarRol(usuario.rol));

      return true;
    } catch (error) {
      console.error("Error verificando la sesión:", error);
      return false;
    }
  }

  const sesionValida = await verificarSesion();

  if (!sesionValida) {
    return;
  }

  // ==========================================
  // ESCAPAR HTML
  // ==========================================

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

  // ==========================================
  // OBTENER INICIAL
  // ==========================================

  function obtenerInicial(nombre) {
    if (!nombre) {
      return "U";
    }

    return nombre.trim().charAt(0).toUpperCase();
  }

  // ==========================================
  // GENERAR ENLACE
  // ==========================================

  function generarEnlace(ruta, texto) {
    return `
      <a href="${ruta}" class="sidebar__link">
        ${texto}
      </a>
    `;
  }

  // ==========================================
  // GENERAR ACORDEÓN
  // ==========================================

  function generarAcordeon(id, titulo, enlaces) {
    return `
      <div class="sidebar__accordion">

        <button
          type="button"
          class="sidebar__accordion-button"
          data-target="${id}"
          aria-expanded="false"
        >
          <span>${titulo}</span>
          <span class="sidebar__accordion-arrow">▶</span>
        </button>

        <div
          class="sidebar__submenu"
          id="${id}"
          hidden
        >
          ${enlaces}
        </div>

      </div>
    `;
  }

  // ==========================================
  // GENERAR NAVEGACIÓN SEGÚN ROL
  // ==========================================

  function generarNavegacion() {
    const sidebarNav = document.querySelector(".sidebar__nav");

    if (!sidebarNav) {
      console.warn("No se encontró .sidebar__nav");
      return;
    }

    let navegacion = "";

    // ======================================
    // ADMINISTRADOR
    // ======================================

    if (rol === "ADMIN") {
      navegacion += generarEnlace(
        "/admin/admin",
        "Dashboard"
      );

      navegacion += generarAcordeon(
        "gestionSubmenu",
        "Gestión",
        generarEnlace("/admin/estudiantes", "Estudiantes") +
        generarEnlace("/admin/inscripciones", "Inscripciones") +
        generarEnlace("/admin/grupos", "Grupos")
      );

      navegacion += generarAcordeon(
        "controlSubmenu",
        "Control",
        generarEnlace("/admin/asistencia", "Asistencia") +
        generarEnlace("/admin/horario", "Horario")
      );

      navegacion += generarAcordeon(
        "administracionSubmenu",
        "Administración",
        generarEnlace("/admin/reportes", "Reportes") +
        generarEnlace("/admin/usuarios", "Usuarios")
      );
    }

    // ======================================
    // SECRETARÍA
    // ======================================

    else if (rol === "SECRETARIA") {
      navegacion += generarEnlace(
        "/secretaria/secretaria",
        "Dashboard"
      );

      navegacion += generarAcordeon(
        "secretariaGestionSubmenu",
        "Gestión",
        generarEnlace("/secretaria/estudiantes", "Estudiantes") +
        generarEnlace("/secretaria/inscripciones", "Inscripciones") +
        generarEnlace("/secretaria/grupos", "Grupos")
      );

      navegacion += generarAcordeon(
        "secretariaControlSubmenu",
        "Control",
        generarEnlace("/secretaria/asistencia", "Asistencia") +
        generarEnlace("/secretaria/horario", "Horario")
      );

      navegacion += generarAcordeon(
        "secretariaAdministracionSubmenu",
        "Administración",
        generarEnlace("/secretaria/reportes", "Reportes")
      );
    }

    // ======================================
    // SENSEI
    // ======================================

    else if (rol === "SENSEI") {
      navegacion += generarEnlace(
        "/sensei/sensei",
        "Dashboard"
      );

      navegacion += generarAcordeon(
        "senseiEnsenanzaSubmenu",
        "Enseñanza",
        generarEnlace("/sensei/grupos", "Mis grupos") +
        generarEnlace("/sensei/estudiantes", "Mis estudiantes")
      );

      navegacion += generarAcordeon(
        "senseiControlSubmenu",
        "Control",
        generarEnlace("/sensei/asistencias", "Asistencias") +
        generarEnlace("/sensei/horario", "Mi horario") +
        generarEnlace("/sensei/reportes", "Reportes")
      );
    }

    // ======================================
    // ESTUDIANTE
    // ======================================

    else if (rol === "ESTUDIANTE") {

      navegacion += generarEnlace(
        "/estudiante/estudiante",
        "Dashboard"
      );

      navegacion += generarEnlace(
        "/estudiante/grupos",
        "Mis grupos"
      );

      navegacion += generarEnlace(
        "/estudiante/asistencias",
        "Mis asistencias"
      );

      navegacion += generarEnlace(
        "/estudiante/horario",
        "Mi horario"
      );
    }

    sidebarNav.innerHTML = navegacion;
  }

  // ==========================================
  // MOSTRAR DATOS DEL ROL
  // ==========================================

  if (usernameDisplay) {
    usernameDisplay.textContent = username;
  }

  if (roleDisplay) {
    roleDisplay.textContent = configuracion.nombre;
  }

  if (profileRoleDisplay) {
    profileRoleDisplay.textContent = configuracion.nombre;
  }

  // ==========================================
  // ACTUALIZAR ENLACE DEL PERFIL
  // ==========================================

  const profileLink = document.querySelector("#profileMenu a");

  if (profileLink) {
    profileLink.href = configuracion.perfil;
  }

  // ==========================================
  // MOSTRAR AVATAR INICIAL
  // ==========================================

  function mostrarAvatarInicial(nombre) {
    if (!userProfileAvatar) {
      return;
    }

    userProfileAvatar.innerHTML = `
      <span>${escaparHtml(obtenerInicial(nombre))}</span>
    `;
  }

  mostrarAvatarInicial(username);

  // ==========================================
  // MOSTRAR FOTO
  // ==========================================

  function mostrarAvatarFoto(fotoUrl, nombre) {
    if (!userProfileAvatar) {
      return;
    }

    if (!fotoUrl) {
      mostrarAvatarInicial(nombre);
      return;
    }

    const imagen = document.createElement("img");

    imagen.src = fotoUrl;
    imagen.alt = "Foto de perfil";

    imagen.style.width = "100%";
    imagen.style.height = "100%";
    imagen.style.objectFit = "cover";
    imagen.style.borderRadius = "50%";

    imagen.onerror = function () {
      mostrarAvatarInicial(nombre);
    };

    userProfileAvatar.replaceChildren(imagen);
  }

  // ==========================================
  // CARGAR PERFIL ACTUAL
  // ==========================================

  async function cargarPerfilActual() {
    try {
      const response = await fetch("/api/usuarios/me", {
        method: "GET",
        credentials: "same-origin",
        headers: {
          Accept: "application/json",
        },
      });

      if (response.status === 401) {
        sessionStorage.removeItem("kihonUsername");
        sessionStorage.removeItem("kihonRol");
        sessionStorage.removeItem("kihonAuth");

        window.location.href = "/login";
        return;
      }

      if (response.status === 403) {
        console.warn(
          "No tienes permisos para consultar el perfil actual."
        );
        return;
      }

      if (!response.ok) {
        console.warn("No se pudo obtener el perfil actual.");
        return;
      }

      const usuario = await response.json();

      const fotoUrl =
        usuario.fotoUrl ||
        usuario.foto ||
        usuario.estudianteFotoUrl ||
        usuario.estudianteFoto ||
        null;

      const nombreMostrar =
        usuario.username ||
        usuario.nombre ||
        username;

      if (usernameDisplay) {
        usernameDisplay.textContent = nombreMostrar;
      }

      mostrarAvatarFoto(fotoUrl, nombreMostrar);
    } catch (error) {
      console.error("Error cargando perfil del usuario:", error);
    }
  }

  // ==========================================
  // MENÚ DE PERFIL
  // ==========================================

  function abrirCerrarMenuPerfil() {
    if (!profileMenu || !profileMenuButton) {
      return;
    }

    const estaAbierto = !profileMenu.hidden;

    profileMenu.hidden = estaAbierto;

    profileMenuButton.setAttribute(
      "aria-expanded",
      String(!estaAbierto)
    );
  }

  function cerrarMenuPerfil() {
    if (!profileMenu || !profileMenuButton) {
      return;
    }

    profileMenu.hidden = true;

    profileMenuButton.setAttribute(
      "aria-expanded",
      "false"
    );
  }

  if (profileMenuButton) {
    profileMenuButton.addEventListener("click", function (event) {
      event.stopPropagation();
      abrirCerrarMenuPerfil();
    });
  }

  if (profileMenu) {
    profileMenu.addEventListener("click", function (event) {
      event.stopPropagation();
    });
  }

  document.addEventListener("click", function (event) {
    if (
      profileMenuContainer &&
      !profileMenuContainer.contains(event.target)
    ) {
      cerrarMenuPerfil();
    }
  });

  // ==========================================
  // OBTENER TOKEN CSRF
  // ==========================================

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

  // ==========================================
  // CERRAR SESIÓN
  // ==========================================

  async function cerrarSesion() {
    if (topbarLogoutButton) {
      topbarLogoutButton.disabled = true;
    }

    try {
      const csrfToken = await obtenerTokenCSRF();

      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "X-CSRF-TOKEN": csrfToken,
          Accept: "application/json",
        },
      });

      if (!response.ok && response.status !== 204) {
        throw new Error("No se pudo cerrar la sesión.");
      }

      sessionStorage.removeItem("kihonAuth");
      sessionStorage.removeItem("kihonUsername");
      sessionStorage.removeItem("kihonRol");

      window.location.replace("/login");
    } catch (error) {
      console.error("Error cerrando la sesión:", error);

      if (topbarLogoutButton) {
        topbarLogoutButton.disabled = false;
      }

      alert("No se pudo cerrar la sesión. Inténtalo nuevamente.");
    }
  }

  if (topbarLogoutButton) {
    topbarLogoutButton.addEventListener("click", cerrarSesion);
  }

  // ==========================================
  // ESCAPE
  // ==========================================

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      cerrarMenuPerfil();
    }
  });

  // ==========================================
  // INICIALIZAR
  // ==========================================

  generarNavegacion();

  await cargarPerfilActual();
});
