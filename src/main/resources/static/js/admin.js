document.addEventListener("DOMContentLoaded", function () {

    // ==========================================
    // DATOS DE SESIÓN
    // ==========================================

    const auth =
        sessionStorage.getItem("kihonAuth");

    const username =
        sessionStorage.getItem("kihonUsername");

    const rol =
        sessionStorage.getItem("kihonRol");


    // ==========================================
    // ELEMENTOS
    // ==========================================

    const usernameDisplay =
        document.getElementById("usernameDisplay");


    // ==========================================
    // VERIFICAR SESIÓN
    // ==========================================

    if (!auth || !username || !rol) {

        window.location.href = "/login";

        return;
    }


    // ==========================================
    // VERIFICAR ROL
    // ==========================================

    if (rol !== "ADMIN") {

        window.location.href = "/login";

        return;
    }


    // ==========================================
    // MOSTRAR USUARIO
    // ==========================================

    if (usernameDisplay) {

        usernameDisplay.textContent =
            username;

    }

});