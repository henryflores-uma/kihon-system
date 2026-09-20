document.addEventListener("DOMContentLoaded", function () {

    const loginForm = document.getElementById("loginForm");
    const loginError = document.getElementById("loginError");

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const usernameInput =
            document.getElementById("username");

        const passwordInput =
            document.getElementById("password");

        const username =
            usernameInput.value.trim();

        const password =
            passwordInput.value;

        loginError.hidden = true;
        loginError.textContent = "";

        // ==========================================
        // VALIDACIÓN
        // ==========================================

        if (!username || !password) {

            loginError.textContent =
                "Ingresa usuario y contraseña.";

            loginError.hidden = false;

            return;
        }

        // ==========================================
        // BASIC AUTH
        // ==========================================

        const credentials =
            btoa(username + ":" + password);

        try {

            // ==========================================
            // VALIDAR AUTENTICACIÓN
            // ==========================================

            const response = await fetch(
                "/api/auth/me",
                {
                    method: "GET",
                    headers: {
                        "Authorization":
                            "Basic " + credentials
                    }
                }
            );

            console.log(
                "Login status:",
                response.status
            );

            // ==========================================
            // LOGIN CORRECTO
            // ==========================================

            if (response.status === 200) {

                const data =
                    await response.json();

                console.log(
                    "Usuario autenticado:",
                    data
                );

                // ==========================================
                // GUARDAR DATOS DE SESIÓN
                // ==========================================

                sessionStorage.setItem(
                    "kihonAuth",
                    credentials
                );

                sessionStorage.setItem(
                    "kihonUsername",
                    data.username
                );

                sessionStorage.setItem(
                    "kihonRol",
                    data.rol
                );

                console.log(
                    "Rol:",
                    data.rol
                );

                // ==========================================
                // REDIRECCIÓN SEGÚN ROL
                // ==========================================

                switch (data.rol) {

                    case "ADMIN":

                        window.location.href =
                            "/admin/admin";

                        break;

                    case "SECRETARIA":

                        window.location.href =
                            "/secretaria/secretaria";

                        break;

                    case "SENSEI":

                        window.location.href =
                            "/sensei/sensei";

                        break;

                    case "ESTUDIANTE":

                        window.location.href =
                            "/estudiante/perfil";

                        break;

                    default:

                        console.error(
                            "Rol no reconocido:",
                            data.rol
                        );

                        loginError.textContent =
                            "El usuario no tiene un rol válido.";

                        loginError.hidden = false;

                        break;
                }

                return;
            }

            // ==========================================
            // 401 - NO AUTENTICADO
            // ==========================================

            if (response.status === 401) {

                loginError.textContent =
                    "Usuario o contraseña incorrectos.";

            }

            // ==========================================
            // 403 - SIN PERMISOS
            // ==========================================

            else if (response.status === 403) {

                loginError.textContent =
                    "Tu cuenta no está activa o no tienes permisos.";

            }

            // ==========================================
            // OTROS ERRORES
            // ==========================================

            else {

                loginError.textContent =
                    "Ocurrió un error en el servidor.";

            }

            loginError.hidden = false;

        } catch (error) {

            console.error(
                "Error:",
                error
            );

            loginError.textContent =
                "No se pudo conectar con el servidor.";

            loginError.hidden = false;
        }

    });

});