document.addEventListener("DOMContentLoaded", async function () {

    const auth = sessionStorage.getItem("kihonAuth");
    const username = sessionStorage.getItem("kihonUsername");

    const usernameDisplay =
        document.getElementById("usernameDisplay");

    if (!auth || !username) {
        window.location.href = "/login";
        return;
    }

    usernameDisplay.textContent = username;

    try {

        /*
         * 1. Obtener estudiantes
         */
        const estudiantesResponse = await fetch(
            "/api/estudiantes",
            {
                method: "GET",
                headers: {
                    "Authorization": "Basic " + auth
                }
            }
        );

        if (estudiantesResponse.status === 401) {
            sessionStorage.clear();
            window.location.href = "/login";
            return;
        }

        if (!estudiantesResponse.ok) {
            throw new Error(
                "No se pudieron obtener los estudiantes."
            );
        }

        const estudiantes =
            await estudiantesResponse.json();

        const estudiantesActivos =
            estudiantes.filter(
                estudiante =>
                    estudiante.estado === "ACTIVO"
            );

        document.querySelector(
            ".dashboard-stat:nth-child(1) .dashboard-stat__value"
        ).textContent = estudiantesActivos.length;


        /*
         * 2. Obtener grupos activos
         */
        const gruposResponse = await fetch(
            "/api/grupos?estado=ACTIVO",
            {
                method: "GET",
                headers: {
                    "Authorization": "Basic " + auth
                }
            }
        );

        if (!gruposResponse.ok) {
            throw new Error(
                "No se pudieron obtener los grupos."
            );
        }

        const grupos =
            await gruposResponse.json();

        document.querySelector(
            ".dashboard-stat:nth-child(2) .dashboard-stat__value"
        ).textContent = grupos.length;


        /*
         * 3. Obtener asistencias del día
         */
        const fecha = new Date()
            .toISOString()
            .split("T")[0];

        const asistenciaResponse = await fetch(
            `/api/reportes/asistencias/diario?fecha=${fecha}`,
            {
                method: "GET",
                headers: {
                    "Authorization": "Basic " + auth
                }
            }
        );

        if (!asistenciaResponse.ok) {
            throw new Error(
                "No se pudo obtener el reporte de asistencias."
            );
        }

        const reporte =
            await asistenciaResponse.json();

        document.querySelector(
            ".dashboard-stat:nth-child(3) .dashboard-stat__value"
        ).textContent = reporte.total;


        /*
         * Información para depuración
         */
        console.log("Estudiantes:", estudiantes);
        console.log("Grupos activos:", grupos);
        console.log("Reporte de hoy:", reporte);

    } catch (error) {

        console.error(
            "Error cargando Dashboard:",
            error
        );

    }

});