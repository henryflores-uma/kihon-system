
document.addEventListener("DOMContentLoaded", function () {
  /*
   * =========================================================
   * ELEMENTOS PRINCIPALES
   * =========================================================
   */

  const sidebar = document.querySelector(".sidebar");

  const menuButton = document.getElementById("mobileMenuButton");

  const menuIcon = document.getElementById("mobileMenuIcon");

  const overlay = document.getElementById("mobileMenuOverlay");

  const mobileNav = document.querySelector(".mobile-nav");

  /*
   * =========================================================
   * VALIDACIÓN
   * =========================================================
   */

  if (!sidebar) {
    return;
  }

  /*
   * =========================================================
   * OBTENER ELEMENTOS DINÁMICAMENTE
   * =========================================================
   */

  function obtenerBotonesAcordeon() {
    return sidebar.querySelectorAll(
      ".sidebar__accordion-button"
    );
  }

  function obtenerEnlacesSidebar() {
    return sidebar.querySelectorAll(
      ".sidebar__link"
    );
  }

  // =========================================================
  // RESTABLECER ACORDEÓN
  // =========================================================

  function cerrarAcordeon(button) {
    const targetId = button.getAttribute("data-target");

    const target = document.getElementById(targetId);

    if (target) {
      target.classList.remove("sidebar__submenu--open");
      target.setAttribute("hidden", "");
    }

    button.classList.remove("sidebar__accordion-button--open");
    button.classList.remove("sidebar__accordion-button--active");

    button.setAttribute("aria-expanded", "false");

    const arrow = button.querySelector(
      ".sidebar__accordion-arrow"
    );

    if (arrow) {
      arrow.textContent = "▶";
    }
  }

  // =========================================================
  // ABRIR ACORDEÓN
  // =========================================================

  function abrirAcordeon(button) {
    const targetId = button.getAttribute("data-target");

    const target = document.getElementById(targetId);

    if (!target) {
      return;
    }

    target.classList.add("sidebar__submenu--open");
    target.removeAttribute("hidden");

    button.classList.add("sidebar__accordion-button--open");

    button.setAttribute("aria-expanded", "true");

    const arrow = button.querySelector(
      ".sidebar__accordion-arrow"
    );

    if (arrow) {
      arrow.textContent = "▼";
    }
  }

  // =========================================================
  // CERRAR LOS DEMÁS ACORDEONES
  // =========================================================

  function cerrarOtrosAcordeones(buttonActual) {
    obtenerBotonesAcordeon().forEach(function (button) {
      if (button !== buttonActual) {
        cerrarAcordeon(button);
      }
    });
  }

  /*
   * =========================================================
   * EVENTOS DE ACORDEONES
   * =========================================================
   *
   * Delegación de eventos:
   * permite trabajar con botones generados por topbar.js.
   *
   * =========================================================
   */

  sidebar.addEventListener("click", function (event) {
    const button = event.target.closest(
      ".sidebar__accordion-button"
    );

    if (!button || !sidebar.contains(button)) {
      return;
    }

    const targetId = button.getAttribute("data-target");

    const target = document.getElementById(targetId);

    if (!target) {
      return;
    }

    const estaAbierto = target.classList.contains(
      "sidebar__submenu--open"
    );

    cerrarOtrosAcordeones(button);

    if (estaAbierto) {
      cerrarAcordeon(button);
    } else {
      abrirAcordeon(button);
    }
  });

  /*
   * =========================================================
   * MARCAR PÁGINA ACTIVA
   * =========================================================
   */

  function marcarPaginaActiva() {
    const currentPath = window.location.pathname;

    const sidebarLinks = obtenerEnlacesSidebar();

    const accordionButtons = obtenerBotonesAcordeon();

    let activeLink = null;

    // =====================================================
    // LIMPIAR ESTADOS ANTERIORES
    // =====================================================

    sidebarLinks.forEach(function (link) {
      link.classList.remove("sidebar__link--active");

      link.removeAttribute("aria-current");
    });

    accordionButtons.forEach(function (button) {
      cerrarAcordeon(button);
    });

    // =====================================================
    // BUSCAR COINCIDENCIA EXACTA
    // =====================================================

    sidebarLinks.forEach(function (link) {
      const href = link.getAttribute("href");

      if (!href) {
        return;
      }

      try {
        const linkPath = new URL(
          href,
          window.location.origin
        ).pathname;

        if (linkPath === currentPath) {
          activeLink = link;
        }
      } catch (error) {
        console.warn(
          "Ruta de navegación no válida:",
          href
        );
      }
    });

    // =====================================================
    // BUSCAR COINCIDENCIA POR PREFIJO
    // =====================================================

    if (!activeLink) {
      sidebarLinks.forEach(function (link) {
        const href = link.getAttribute("href");

        if (!href) {
          return;
        }

        try {
          const linkPath = new URL(
            href,
            window.location.origin
          ).pathname;

          if (
            linkPath !== "/" &&
            currentPath.startsWith(linkPath + "/")
          ) {
            if (
              !activeLink ||
              linkPath.length >
              new URL(
                activeLink.href,
                window.location.origin
              ).pathname.length
            ) {
              activeLink = link;
            }
          }
        } catch (error) {
          console.warn(
            "No se pudo comparar la ruta:",
            href
          );
        }
      });
    }

    // =====================================================
    // MARCAR ENLACE ACTIVO
    // =====================================================

    if (!activeLink) {
      return;
    }

    activeLink.classList.add("sidebar__link--active");

    activeLink.setAttribute("aria-current", "page");

    // =====================================================
    // ABRIR ACORDEÓN PADRE
    // =====================================================

    const parentSubmenu = activeLink.closest(
      ".sidebar__submenu"
    );

    if (!parentSubmenu) {
      return;
    }

    const parentButton = sidebar.querySelector(
      `[data-target="${parentSubmenu.id}"]`
    );

    if (!parentButton) {
      return;
    }

    abrirAcordeon(parentButton);

    parentButton.classList.add(
      "sidebar__accordion-button--active"
    );
  }

  /*
   * =========================================================
   * PÁGINA ACTIVA INICIAL
   * =========================================================
   */

  marcarPaginaActiva();

  /*
   * =========================================================
   * MENÚ MÓVIL
   * =========================================================
   */

  function abrirMenuMovil() {
    sidebar.classList.add("sidebar--open");

    // BOTÓN

    if (menuButton) {
      menuButton.setAttribute(
        "aria-expanded",
        "true"
      );

      menuButton.setAttribute(
        "aria-label",
        "Cerrar menú"
      );
    }

    // ICONO

    if (menuIcon) {
      menuIcon.textContent = "✕";
    }

    // KIHON SUPERIOR

    if (mobileNav) {
      mobileNav.classList.add(
        "mobile-nav--hidden"
      );
    }

    // OVERLAY

    if (overlay) {
      overlay.hidden = false;

      requestAnimationFrame(function () {
        overlay.classList.add(
          "mobile-menu-overlay--visible"
        );
      });
    }

    // BLOQUEAR SCROLL

    document.body.classList.add(
      "mobile-menu-open"
    );
  }

  function cerrarMenuMovil() {
    sidebar.classList.remove("sidebar--open");

    // BOTÓN

    if (menuButton) {
      menuButton.setAttribute(
        "aria-expanded",
        "false"
      );

      menuButton.setAttribute(
        "aria-label",
        "Abrir menú"
      );
    }

    // ICONO

    if (menuIcon) {
      menuIcon.textContent = "☰";
    }

    // KIHON SUPERIOR

    if (mobileNav) {
      mobileNav.classList.remove(
        "mobile-nav--hidden"
      );
    }

    // OVERLAY

    if (overlay) {
      overlay.classList.remove(
        "mobile-menu-overlay--visible"
      );

      overlay.hidden = true;
    }

    // DESBLOQUEAR SCROLL

    document.body.classList.remove(
      "mobile-menu-open"
    );
  }

  /*
   * =========================================================
   * BOTÓN HAMBURGUESA
   * =========================================================
   */

  if (menuButton) {
    menuButton.addEventListener("click", function () {
      const menuAbierto = sidebar.classList.contains(
        "sidebar--open"
      );

      if (menuAbierto) {
        cerrarMenuMovil();
      } else {
        abrirMenuMovil();
      }
    });
  }

  /*
   * =========================================================
   * OVERLAY
   * =========================================================
   */

  if (overlay) {
    overlay.addEventListener(
      "click",
      cerrarMenuMovil
    );
  }

  /*
   * =========================================================
   * CERRAR AL SELECCIONAR UNA PÁGINA
   * =========================================================
   */

  sidebar.addEventListener("click", function (event) {
    const link = event.target.closest(
      ".sidebar__link"
    );

    if (!link || !sidebar.contains(link)) {
      return;
    }

    cerrarMenuMovil();
  });

  /*
   * =========================================================
   * ESCAPE
   * =========================================================
   */

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      cerrarMenuMovil();
    }
  });

  /*
   * =========================================================
   * CAMBIO DE TAMAÑO
   * =========================================================
   */

  window.addEventListener("resize", function () {
    if (window.innerWidth > 700) {
      cerrarMenuMovil();
    }
  });
});
