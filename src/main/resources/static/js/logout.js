document.addEventListener("DOMContentLoaded", function () {

    const logoutButton =
        document.getElementById("logoutButton");

    if (!logoutButton) {
        return;
    }

    logoutButton.addEventListener("click", function (event) {

        event.preventDefault();

        sessionStorage.removeItem("kihonAuth");
        sessionStorage.removeItem("kihonUsername");
        sessionStorage.removeItem("kihonRol");

        window.location.href = "/login";
    });

}); 