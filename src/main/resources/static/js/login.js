document.addEventListener("DOMContentLoaded", function () {

    const loginForm = document.getElementById("loginForm");
    const loginError = document.getElementById("loginError");

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const usernameInput = document.getElementById("username");
        const passwordInput = document.getElementById("password");

        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        loginError.hidden = true;
        loginError.textContent = "";

        if (!username || !password) {
            loginError.textContent =
                "Ingresa usuario y contraseña.";
            loginError.hidden = false;
            return;
        }

        const credentials =
            btoa(username + ":" + password);

        try {

            const response = await fetch("/api/estudiantes", {
                method: "GET",
                headers: {
                    "Authorization": "Basic " + credentials
                }
            });

            console.log("Login status:", response.status);

            if (response.status === 200) {

                sessionStorage.setItem(
                    "kihonAuth",
                    credentials
                );

                sessionStorage.setItem(
                    "kihonUsername",
                    username
                );

                console.log("Login correcto");

                window.location.href = "/dashboard";

                return;
            }

            if (response.status === 401) {
                loginError.textContent =
                    "Usuario o contraseña incorrectos.";
            } else if (response.status === 403) {
                loginError.textContent =
                    "No tienes permisos para acceder.";
            } else {
                loginError.textContent =
                    "Ocurrió un error en el servidor.";
            }

            loginError.hidden = false;

        } catch (error) {

            console.error("Error:", error);

            loginError.textContent =
                "No se pudo conectar con el servidor.";

            loginError.hidden = false;
        }
    });
});