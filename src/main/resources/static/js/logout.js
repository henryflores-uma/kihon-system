document.addEventListener("DOMContentLoaded", function () {

    // ==========================================
    // BOTONES DE CERRAR SESIÓN
    // ==========================================

    const logoutButtons = document.querySelectorAll(
        "#logoutButton, #topbarLogoutButton"
    );


    if (!logoutButtons.length) {
        return;
    }


    // ==========================================
    // FUNCIÓN DE CERRAR SESIÓN
    // ==========================================

    function cerrarSesion(event) {

        event.preventDefault();


        // --------------------------------------
        // LIMPIAR SESIÓN
        // --------------------------------------

        sessionStorage.removeItem(
            "kihonAuth"
        );

        sessionStorage.removeItem(
            "kihonUsername"
        );

        sessionStorage.removeItem(
            "kihonRol"
        );


        // --------------------------------------
        // REDIRIGIR AL LOGIN
        // --------------------------------------

        window.location.href =
            "/login";
    }


    // ==========================================
    // ASIGNAR EVENTO A TODOS LOS BOTONES
    // ==========================================

    logoutButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                cerrarSesion
            );

        }
    );

});