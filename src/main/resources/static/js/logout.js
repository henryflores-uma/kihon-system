
document.addEventListener("DOMContentLoaded", function () {
    const logoutButtons = document.querySelectorAll(
        "#logoutButton, #topbarLogoutButton"
    );

    if (!logoutButtons.length) {
        return;
    }

    async function obtenerTokenCSRF() {
        const response = await fetch("/api/auth/csrf", {
            method: "GET",
            credentials: "same-origin",
            headers: {
                Accept: "application/json"
            }
        });

        if (!response.ok) {
            throw new Error("No se pudo obtener el token CSRF.");
        }

        const data = await response.json();

        if (!data.token) {
            throw new Error("Token CSRF no válido.");
        }

        return data.token;
    }

    function limpiarSesionLocal() {
        sessionStorage.removeItem("kihonAuth");
        sessionStorage.removeItem("kihonUsername");
        sessionStorage.removeItem("kihonRol");
    }

    async function cerrarSesion(event) {
        event.preventDefault();

        const boton = event.currentTarget;
        boton.disabled = true;

        try {
            const csrfToken = await obtenerTokenCSRF();

            const response = await fetch("/api/auth/logout", {
                method: "POST",
                credentials: "same-origin",
                headers: {
                    Accept: "application/json",
                    "X-CSRF-TOKEN": csrfToken
                }
            });

            if (!response.ok) {
                throw new Error("No se pudo cerrar la sesión.");
            }

            limpiarSesionLocal();
            window.location.replace("/login");

        } catch (error) {
            console.error("Error al cerrar sesión:", error);

            boton.disabled = false;

            alert(
                "No se pudo cerrar la sesión correctamente. Inténtalo nuevamente."
            );
        }
    }

    logoutButtons.forEach(button => {
        button.addEventListener("click", cerrarSesion);
    });
});
