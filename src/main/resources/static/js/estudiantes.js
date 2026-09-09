document.addEventListener("DOMContentLoaded", async function () {

    const auth = sessionStorage.getItem("kihonAuth");
    const username = sessionStorage.getItem("kihonUsername");

    const usernameDisplay =
        document.getElementById("usernameDisplay");

    const studentsList =
        document.getElementById("studentsList");

    const studentsMessage =
        document.getElementById("studentsMessage");

    if (!auth || !username) {
        window.location.href = "/login";
        return;
    }

    usernameDisplay.textContent = username;

    try {

        const response = await fetch(
            "/api/estudiantes",
            {
                method: "GET",
                headers: {
                    "Authorization": "Basic " + auth
                }
            }
        );

        if (response.status === 401) {
            sessionStorage.clear();
            window.location.href = "/login";
            return;
        }

        if (response.status === 403) {
            throw new Error(
                "No tienes permisos para consultar estudiantes."
            );
        }

        if (!response.ok) {
            throw new Error(
                "No se pudieron obtener los estudiantes."
            );
        }

        const estudiantes =
            await response.json();

        if (estudiantes.length === 0) {

            studentsList.innerHTML = `
                <p>
                    No hay estudiantes registrados.
                </p>
            `;

            return;
        }

        studentsList.innerHTML = estudiantes
            .map(estudiante => `
                <div class="card">

                    <h3>
                        ${estudiante.nombre}
                        ${estudiante.apellido}
                    </h3>

                    <p>
                        Documento:
                        ${estudiante.documento}
                    </p>

                    <p>
                        Correo:
                        ${estudiante.correo}
                    </p>

                    <p>
                        Teléfono:
                        ${estudiante.telefono || "No registrado"}
                    </p>

                    <p>
                        Estado:
                        ${estudiante.estado}
                    </p>

                </div>
            `)
            .join("");

        console.log(
            "Estudiantes cargados:",
            estudiantes
        );

    } catch (error) {

        console.error(
            "Error:",
            error
        );

        studentsMessage.innerHTML = `
            <p class="form-error">
                ${error.message}
            </p>
        `;
    }

});