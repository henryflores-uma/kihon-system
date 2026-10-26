document.addEventListener("DOMContentLoaded", async function () {
  // ==========================================
  // DATOS DE SESIÓN
  // ==========================================

  const auth = sessionStorage.getItem("kihonAuth");

  const username = sessionStorage.getItem("kihonUsername");

  const rol = sessionStorage.getItem("kihonRol");

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
  // VERIFICAR SESIÓN
  // ==========================================

  if (!auth || !username || !rol) {
    window.location.href = "/login";

    return;
  }

  // ==========================================
  // OBTENER NOMBRE DEL ROL
  // ==========================================

  function obtenerNombreRol(rol) {
    if (rol === "ADMIN") {
      return "Administrador";
    }

    if (rol === "PROFESOR") {
      return "Profesor";
    }

    if (rol === "ALUMNO") {
      return "Alumno";
    }

    if (rol === "ESTUDIANTE") {
      return "Estudiante";
    }

    return rol || "";
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
  // MOSTRAR DATOS BÁSICOS
  // ==========================================

  if (usernameDisplay) {
    usernameDisplay.textContent = username;
  }

  const nombreRol = obtenerNombreRol(rol);

  if (roleDisplay) {
    roleDisplay.textContent = nombreRol;
  }

  if (profileRoleDisplay) {
    profileRoleDisplay.textContent = nombreRol;
  }

  // ==========================================
  // MOSTRAR INICIAL INICIALMENTE
  // ==========================================

  function mostrarAvatarInicial(nombre) {
    if (!userProfileAvatar) {
      return;
    }

    userProfileAvatar.innerHTML = `
            <span>
                ${escaparHtml(obtenerInicial(nombre))}
            </span>
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

    userProfileAvatar.innerHTML = `
            <img
                src="${escaparHtml(fotoUrl)}"
                alt="Foto de perfil"
                style="
                    width:100%;
                    height:100%;
                    object-fit:cover;
                    border-radius:50%;
                "
                onerror="this.parentElement.innerHTML='<span>${escaparHtml(
                  obtenerInicial(nombre),
                )}</span>';"
            >
        `;
  }

  // ==========================================
  // CARGAR PERFIL DEL USUARIO ACTUAL
  // ==========================================

  async function cargarPerfilActual() {
    try {
      const response = await fetch("/api/usuarios/me", {
        method: "GET",

        headers: {
          Authorization: "Basic " + auth,
        },
      });

      // ======================================
      // SESIÓN EXPIRADA
      // ======================================

      if (response.status === 401) {
        sessionStorage.clear();

        window.location.href = "/login";

        return;
      }

      // ======================================
      // SIN PERMISO
      // ======================================

      if (response.status === 403) {
        console.warn("No tienes permisos para consultar el perfil actual.");

        return;
      }

      // ======================================
      // ENDPOINT NO DISPONIBLE
      // ======================================

      if (!response.ok) {
        console.warn("No se pudo obtener el perfil actual.");

        return;
      }

      const usuario = await response.json();

      // ======================================
      // OBTENER FOTO
      // ======================================

      const fotoUrl =
        usuario.fotoUrl ||
        usuario.foto ||
        usuario.estudianteFotoUrl ||
        usuario.estudianteFoto ||
        null;

      // ======================================
      // ACTUALIZAR NOMBRE
      // ======================================

      const nombreMostrar = usuario.username || usuario.nombre || username;

      if (usernameDisplay) {
        usernameDisplay.textContent = nombreMostrar;
      }

      // ======================================
      // ACTUALIZAR AVATAR
      // ======================================

      mostrarAvatarFoto(fotoUrl, nombreMostrar);
    } catch (error) {
      console.error("Error cargando perfil del usuario:", error);

      /*
       * Si falla la petición,
       * se mantiene la inicial.
       */
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

    profileMenuButton.setAttribute("aria-expanded", String(!estaAbierto));
  }

  function cerrarMenuPerfil() {
    if (!profileMenu || !profileMenuButton) {
      return;
    }

    profileMenu.hidden = true;

    profileMenuButton.setAttribute("aria-expanded", "false");
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
    if (profileMenuContainer && !profileMenuContainer.contains(event.target)) {
      cerrarMenuPerfil();
    }
  });

  // ==========================================
  // CERRAR SESIÓN
  // ==========================================

  function cerrarSesion() {
    sessionStorage.removeItem("kihonAuth");

    sessionStorage.removeItem("kihonUsername");

    sessionStorage.removeItem("kihonRol");

    window.location.href = "/login";
  }

  if (topbarLogoutButton) {
    topbarLogoutButton.addEventListener("click", function () {
      cerrarSesion();
    });
  }

  // ==========================================
  // ESCAPE
  // ==========================================

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") {
      return;
    }

    if (profileMenu && !profileMenu.hidden) {
      cerrarMenuPerfil();
    }
  });

  // ==========================================
  // CARGAR PERFIL
  // ==========================================

  await cargarPerfilActual();
});
