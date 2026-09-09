document.addEventListener("DOMContentLoaded", () => {

    const loginForm = document.getElementById("loginForm");
    const loginError = document.getElementById("loginError");

    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value;

        loginError.hidden = true;
        loginError.textContent = "";

        const credentials = btoa(`${username}:${password} `);

        try {

            const response = await fetch("/api/estudiantes", {
                method: "GET",
                headers: {
                    "Authorization": `Basic ${credentials} `
                }
            });

            if (!response.ok) {
                throw new Error("Credenciales incorrectas");
            }

            sessionStorage.setItem("kihonAuth", credentials);
            sessionStorage.setItem("kihonUsername", username);

            window.location.href = "/dashboard";

        } catch (error) {

            loginError.textContent =
                "Usuario o contraseña incorrectos.";

            loginError.hidden = false;
        }
    });
});
