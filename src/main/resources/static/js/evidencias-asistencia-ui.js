(function () {
    async function abrirDocumentoEvidencia(evidenciaId) {
        // Abrir una pestaña inmediatamente para evitar bloqueos del navegador.
        const nuevaVentana = window.open("about:blank", "_blank");

        if (!nuevaVentana) {
            alert("El navegador bloqueó la apertura del documento. Permite las ventanas emergentes.");
            return;
        }

        try {
            const response = await fetch(
                `/api/evidencias-asistencia/${evidenciaId}/url?segundos=300`,
                {
                    method: "GET",
                    credentials: "same-origin",
                    headers: {
                        "Accept": "application/json"
                    }
                }
            );

            if (response.status === 401 || response.status === 403) {
                nuevaVentana.close();
                window.location.replace("/login");
                return;
            }

            if (!response.ok) {
                let mensaje = "No se pudo obtener el documento.";

                try {
                    const error = await response.json();
                    mensaje = error.message || error.mensaje || mensaje;
                } catch {
                    // Se conserva el mensaje predeterminado.
                }

                throw new Error(mensaje);
            }

            const data = await response.json();

            if (!data.url) {
                throw new Error("El servidor no devolvió la URL del documento.");
            }

            nuevaVentana.location.href = data.url;

        } catch (error) {
            nuevaVentana.close();
            console.error("Error abriendo documento:", error);
            alert(error.message);
        }
    }

    function mostrarListaJustificantes(evidencias) {
        let modal = document.querySelector("#modal-justificantes");

        if (modal) {
            modal.remove();
        }

        modal = document.createElement("div");
        modal.id = "modal-justificantes";
        modal.className = "asistencia-modal-overlay";

        Object.assign(modal.style, {
            position: "fixed",
            inset: "0",
            zIndex: "99999",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            backgroundColor: "rgba(0, 0, 0, 0.55)"
        });

        const contenido = document.createElement("div");
        contenido.className = "asistencia-modal";

        Object.assign(contenido.style, {
            width: "100%",
            maxWidth: "550px",
            maxHeight: "85vh",
            overflowY: "auto",
            padding: "24px",
            backgroundColor: "#ffffff",
            borderRadius: "14px",
            boxShadow: "0 15px 45px rgba(0, 0, 0, 0.2)"
        });

        const encabezado = document.createElement("div");
        encabezado.className = "asistencia-modal-header";

        const titulo = document.createElement("h3");
        titulo.textContent = "Justificantes de asistencia";

        const cerrar = document.createElement("button");
        cerrar.type = "button";
        cerrar.className = "asistencia-modal-cerrar";
        cerrar.textContent = "×";
        cerrar.setAttribute("aria-label", "Cerrar ventana");

        cerrar.addEventListener("click", () => modal.remove());

        encabezado.append(titulo, cerrar);

        const descripcion = document.createElement("p");
        descripcion.textContent =
            `Se encontraron ${evidencias.length} documento(s) asociados a esta asistencia.`;

        const lista = document.createElement("div");
        lista.className = "asistencia-modal-lista";

        evidencias.forEach((evidencia, indice) => {
            const elemento = document.createElement("div");
            elemento.className = "asistencia-modal-documento";

            const informacion = document.createElement("div");

            const nombre = document.createElement("strong");
            nombre.textContent = evidencia.nombreArchivo || `Documento ${indice + 1}`;

            const tipo = document.createElement("small");
            tipo.textContent = evidencia.tipoMime || "Archivo adjunto";

            informacion.append(nombre, tipo);

            const botonVer = document.createElement("button");
            botonVer.type = "button";
            botonVer.className = "btn btn--secondary";
            botonVer.textContent = "Ver documento";

            botonVer.addEventListener("click", () => {
                abrirDocumentoEvidencia(evidencia.id);
            });

            elemento.append(informacion, botonVer);
            lista.appendChild(elemento);
        });

        contenido.append(encabezado, descripcion, lista);
        modal.appendChild(contenido);

        modal.addEventListener("click", event => {
            if (event.target === modal) {
                modal.remove();
            }
        });

        document.body.appendChild(modal);
    }

    // Exponer las funciones para que puedan usarse desde ambas páginas.
    window.KihonEvidencias = {
        mostrarListaJustificantes,
        abrirDocumentoEvidencia
    };
})();