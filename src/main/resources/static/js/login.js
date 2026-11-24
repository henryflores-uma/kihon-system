
document.addEventListener("DOMContentLoaded", function () {
  // ==========================================
  // ELEMENTOS DEL DOM
  // ==========================================

  const loginForm = document.getElementById("loginForm");
  const loginError = document.getElementById("loginError");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const togglePassword = document.getElementById("togglePassword");

  // ==========================================
  // MOSTRAR / OCULTAR CONTRASEÑA
  // ==========================================

  if (togglePassword && passwordInput) {
    togglePassword.addEventListener("click", function () {
      const isPassword = passwordInput.type === "password";

      passwordInput.type = isPassword ? "text" : "password";

      togglePassword.textContent = isPassword ? "🙈" : "👁";

      togglePassword.setAttribute(
        "aria-label",
        isPassword ? "Ocultar contraseña" : "Mostrar contraseña",
      );

      togglePassword.setAttribute(
        "title",
        isPassword ? "Ocultar contraseña" : "Mostrar contraseña",
      );
    });
  }

  // ==========================================
  // VALIDAR ELEMENTOS
  // ==========================================

  if (!loginForm || !loginError || !usernameInput || !passwordInput) {
    console.error("No se encontraron todos los elementos del formulario.");

    return;
  }

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

    if (!data.token) {
      throw new Error("El servidor no devolvió un token CSRF válido.");
    }

    return data.token;
  }

  // ==========================================
  // REDIRECCIÓN SEGÚN ROL
  // ==========================================

  function redirigirSegunRol(rol) {
    switch (rol) {
      case "ADMIN":
        window.location.href = "/admin/admin";
        break;

      case "SECRETARIA":
        window.location.href = "/secretaria/secretaria";
        break;

      case "SENSEI":
        window.location.href = "/sensei/sensei";
        break;

      case "ESTUDIANTE":
        window.location.href = "/estudiante/estudiante";
        break;

      default:
        console.error("Rol no reconocido:", rol);

        loginError.textContent = "El usuario no tiene un rol válido.";
        loginError.hidden = false;
        break;
    }
  }

  // ==========================================
  // LOGIN
  // ==========================================

  loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    // ==========================================
    // OBTENER VALORES
    // ==========================================

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    // ==========================================
    // LIMPIAR ERROR
    // ==========================================

    loginError.hidden = true;
    loginError.textContent = "";

    // ==========================================
    // VALIDACIÓN
    // ==========================================

    if (!username || !password) {
      loginError.textContent = "Ingresa usuario y contraseña.";
      loginError.hidden = false;

      return;
    }

    // ==========================================
    // EVITAR ENVÍOS REPETIDOS
    // ==========================================

    const submitButton = loginForm.querySelector(
      'button[type="submit"], input[type="submit"]',
    );

    if (submitButton) {
      submitButton.disabled = true;
    }

    try {
      // ==========================================
      // OBTENER TOKEN CSRF
      // ==========================================

      const csrfToken = await obtenerTokenCSRF();

      // ==========================================
      // PREPARAR CREDENCIALES
      // ==========================================

      const formData = new URLSearchParams();

      formData.append("username", username);
      formData.append("password", password);
      formData.append("_csrf", csrfToken);

      // ==========================================
      // ENVIAR SOLICITUD DE LOGIN
      // ==========================================

      const response = await fetch("/api/auth/login", {
        method: "POST",

        credentials: "same-origin",

        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },

        body: formData.toString(),
      });

      console.log("Login status:", response.status);

      // ==========================================
      // LOGIN CORRECTO
      // ==========================================

      if (response.ok) {
        const data = await response.json();

        console.log("Usuario autenticado:", data);

        // ==========================================
        // VALIDAR RESPUESTA
        // ==========================================

        if (!data.username || !data.rol) {
          throw new Error(
            "El servidor no devolvió los datos de autenticación esperados.",
          );
        }

        // ==========================================
        // GUARDAR DATOS PARA LA INTERFAZ
        // ==========================================

        sessionStorage.removeItem("kihonAuth");

        sessionStorage.setItem("kihonUsername", data.username);
        sessionStorage.setItem("kihonRol", data.rol);

        // ==========================================
        // ACTUALIZAR TOKEN CSRF
        // ==========================================

        await obtenerTokenCSRF();

        console.log("Rol:", data.rol);

        // ==========================================
        // REDIRECCIÓN SEGÚN ROL
        // ==========================================

        redirigirSegunRol(data.rol);

        return;
      }

      // ==========================================
      // 401 - AUTENTICACIÓN FALLIDA
      // ==========================================

      if (response.status === 401) {
        loginError.textContent = "Usuario o contraseña incorrectos.";
      }

      // ==========================================
      // 403 - ACCESO DENEGADO
      // ==========================================

      else if (response.status === 403) {
        loginError.textContent =
          "No se pudo completar el inicio de sesión. Verifica la protección CSRF y el estado de tu cuenta.";
      }

      // ==========================================
      // OTROS ERRORES
      // ==========================================

      else {
        loginError.textContent =
          "Ocurrió un error en el servidor. Inténtalo nuevamente.";
      }

      loginError.hidden = false;
    } catch (error) {
      console.error("Error durante el inicio de sesión:", error);

      loginError.textContent =
        "No se pudo completar el inicio de sesión. Verifica tu conexión e inténtalo nuevamente.";

      loginError.hidden = false;
    } finally {
      // ==========================================
      // HABILITAR BOTÓN
      // ==========================================

      if (submitButton) {
        submitButton.disabled = false;
      }
    }
  });
});
