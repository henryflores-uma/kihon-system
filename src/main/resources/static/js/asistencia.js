  document.addEventListener("DOMContentLoaded", function () {
    /*
    * =========================================================
    * AUTENTICACIÓN
    * =========================================================
    */

    /*cambio de gino*/

    const username = sessionStorage.getItem("kihonUsername");
    const rol = sessionStorage.getItem("kihonRol");

    if (!username || !rol || !["ADMIN", "SECRETARIA", "SENSEI"].includes(rol)) {
      window.location.replace("/login");
      return;
    }

    /*
    * =========================================================
    * TOKEN CSRF
    * =========================================================
    */

    async function obtenerTokenCSRF() {
      const response = await fetch("/api/auth/csrf", {
        method: "GET",
        credentials: "same-origin",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("No se pudo obtener el token CSRF.");
      }

      const data = await response.json();

      return data.token;
    }

    /*
    * =========================================================
    * SOLICITUDES HTTP
    * =========================================================
    */

    async function solicitar(url, opciones = {}) {
      const metodo = (opciones.method || "GET").toUpperCase();

      const encabezados = new Headers(opciones.headers || {});

      encabezados.set("Accept", "application/json");

      /*
      * Las solicitudes que modifican información
      * necesitan el token CSRF.
      */

      if (!["GET", "HEAD", "OPTIONS"].includes(metodo)) {
        const csrfToken = await obtenerTokenCSRF();

        encabezados.set("X-CSRF-TOKEN", csrfToken);
      }

      const response = await fetch(url, {
        ...opciones,
        method: metodo,
        credentials: "same-origin",
        headers: encabezados,
      });

      /*
      * SESIÓN EXPIRADA
      */

      if (response.status === 401) {
        sessionStorage.removeItem("kihonUsername");
        sessionStorage.removeItem("kihonRol");
        sessionStorage.removeItem("kihonAuth");

        window.location.replace("/login");

        throw new Error("La sesión ha expirado.");
      }

      return response;
    }

    /*
    * =========================================================
    * ELEMENTOS DEL DOM
    * =========================================================
    */

    const fechaInput = document.getElementById("fecha");

    const grupoSelect = document.getElementById("grupoId");

    const grupoInfo = document.getElementById("grupoInfo");

    const grupoInfoNombre = document.getElementById("grupoInfoNombre");

    const grupoInfoHorario = document.getElementById("grupoInfoHorario");

    const grupoInfoSensei = document.getElementById("grupoInfoSensei");

    const grupoInfoCantidad = document.getElementById("grupoInfoCantidad");

    const attendanceRegister = document.getElementById("attendanceRegister");

    const saveAttendanceButton = document.getElementById("saveAttendanceButton");

    const attendanceMessage = document.getElementById("attendanceMessage");

    const fechaConsulta = document.getElementById("fechaConsulta");

    const grupoConsulta = document.getElementById("grupoConsulta");

    const estudianteConsulta = document.getElementById("estudianteConsulta");

    const attendanceList = document.getElementById("attendanceList");

    /*
    * =========================================================
    * ESTADO
    * =========================================================
    */

    let horariosDelDia = [];

    let estudiantesGrupo = [];

    let asistenciasGrupo = [];

    let asistenciasConsulta = [];

    let motivosJustificacion = [];

    /*
    * =========================================================
    * FECHA LOCAL
    * =========================================================
    */

    function obtenerFechaLocal() {
      const ahora = new Date();

      const year = ahora.getFullYear();

      const month = String(ahora.getMonth() + 1).padStart(2, "0");

      const day = String(ahora.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    }

    /*
    * =========================================================
    * DÍA DE LA SEMANA
    * =========================================================
    */

    function obtenerDiaSemana(fecha) {
      const partes = fecha.split("-");

      const fechaLocal = new Date(
        Number(partes[0]),
        Number(partes[1]) - 1,
        Number(partes[2]),
      );

      const dias = [
        "DOMINGO",
        "LUNES",
        "MARTES",
        "MIERCOLES",
        "JUEVES",
        "VIERNES",
        "SABADO",
      ];

      return dias[fechaLocal.getDay()];
    }

    /*
    * =========================================================
    * AUTORIZACIÓN
    * =========================================================
    */

    function verificarAutorizacion(response) {
      if (response.status === 401) {
        sessionStorage.removeItem("kihonUsername");
        sessionStorage.removeItem("kihonRol");
        sessionStorage.removeItem("kihonAuth");

        window.location.replace("/login");

        return false;
      }

      return true;
    }

    /*
    * =========================================================
    * ERROR DEL BACKEND
    * =========================================================
    */

    async function obtenerMensajeError(response, mensajePorDefecto) {
      try {
        const data = await response.json();

        return data.mensaje || data.message || mensajePorDefecto;
      } catch (error) {
        return mensajePorDefecto;
      }
    }


  /*
  * =========================================================
  * CARGAR MOTIVOS DE JUSTIFICACIÓN
  * =========================================================
  */

  async function cargarMotivosJustificacion() {
    try {
        const response = await solicitar(
            "/api/motivos-justificacion",
            {
                method: "GET",
            },
        );

        if (!verificarAutorizacion(response)) {
            return;
        }

        if (response.status === 403) {
            throw new Error(
                "No tienes permisos para consultar los motivos de justificación.",
            );
        }

        if (!response.ok) {
            throw new Error(
                await obtenerMensajeError(
                    response,
                    "No se pudieron cargar los motivos de justificación.",
                ),
            );
        }

        motivosJustificacion = await response.json();

        if (!Array.isArray(motivosJustificacion)) {
            throw new Error("La respuesta de motivos no tiene un formato válido.");
        }

        actualizarSelectoresMotivos();

    } catch (error) {
        console.error("Error cargando motivos de justificación:", error);
    }
  }


async function mostrarModalJustificacion(asistencia) {
  try {
      // Obtener la justificación existente
      const justificacion = await obtenerJustificacionPorAsistencia(
          asistencia.id
      );

      // Obtener las evidencias existentes
      let evidencias = [];

      if (justificacion) {
          const response = await solicitar(
              `/api/evidencias-asistencia/justificacion/${justificacion.id}`
          );

          if (!response.ok) {
              throw new Error(
                  await obtenerMensajeError(
                      response,
                      "No se pudieron consultar los documentos existentes."
                  )
              );
          }

          evidencias = await response.json();
      }

      return new Promise((resolve) => {
          // Crear el fondo del modal
          const overlay = document.createElement("div");

          overlay.style.cssText = `
              position: fixed;
              inset: 0;
              z-index: 99999;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 20px;
              background: rgba(0, 0, 0, 0.55);
          `;

          // Crear contenido
          const modal = document.createElement("div");

          modal.style.cssText = `
              background: white;
              width: 100%;
              max-width: 600px;
              max-height: 85vh;
              overflow-y: auto;
              border-radius: 12px;
              padding: 24px;
          `;

          modal.innerHTML = `
              <h2>Gestionar justificación</h2>

              <p>
                  <strong>Estudiante:</strong>
                  ${asistencia.estudianteNombre}
              </p>

              <div style="margin-top: 18px;">
                  <label for="modal-motivo-justificacion">
                      Motivo de justificación
                  </label>

                  <select
                      id="modal-motivo-justificacion"
                      class="form-select"
                      style="width: 100%; margin-top: 8px;"
                  >
                      <option value="">
                          Selecciona un motivo
                      </option>
                  </select>
              </div>

              <div style="margin-top: 18px;">
                  <label for="modal-descripcion-justificacion">
                      Descripción / Observación
                  </label>

                  <textarea
                      id="modal-descripcion-justificacion"
                      class="form-input"
                      rows="4"
                      style="width: 100%; margin-top: 8px;"
                      placeholder="Describe el motivo de la justificación..."
                  ></textarea>
              </div>

              <div style="margin-top: 20px;">
                  <h3>Documentos existentes</h3>

                  <div id="modal-evidencias-existentes">
                  </div>
              </div>

              <div style="margin-top: 20px;">
                  <label for="modal-nuevas-evidencias">
                      Adjuntar nuevos documentos
                  </label>

                  <input
                      type="file"
                      id="modal-nuevas-evidencias"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png"
                      style="display: block; margin-top: 8px;"
                  >

                  <small>
                      Formatos permitidos: PDF, JPG y PNG. Máximo 5 MB por archivo.
                  </small>
              </div>

              <div style="
                  display: flex;
                  justify-content: flex-end;
                  gap: 10px;
                  margin-top: 24px;
              ">
                  <button
                      type="button"
                      class="btn btn--secondary"
                      id="modal-cancelar-justificacion"
                  >
                      Cancelar
                  </button>

                  <button
                      type="button"
                      class="btn btn--primary"
                      id="modal-guardar-justificacion"
                  >
                      Guardar cambios
                  </button>
              </div>
          `;

          overlay.appendChild(modal);
          document.body.appendChild(overlay);

          // Llenar selector de motivos
          const selectMotivo = modal.querySelector(
              "#modal-motivo-justificacion"
          );

          motivosJustificacion.forEach((motivo) => {
              const option = document.createElement("option");

              option.value = motivo.id;
              option.textContent = motivo.nombre;

              if (
                  justificacion &&
                  String(justificacion.motivoId) === String(motivo.id)
              ) {
                  option.selected = true;
              }

              selectMotivo.appendChild(option);
          });

          // Precargar descripción
          modal.querySelector(
              "#modal-descripcion-justificacion"
          ).value = justificacion?.descripcion || "";

          // Mostrar documentos existentes
          const contenedorEvidencias = modal.querySelector(
              "#modal-evidencias-existentes"
          );

          if (evidencias.length === 0) {
              contenedorEvidencias.textContent =
                  "No existen documentos adjuntos.";
          } else {
              evidencias.forEach((evidencia) => {
                  const documento = document.createElement("div");

                  documento.style.cssText = `
                      display: flex;
                      justify-content: space-between;
                      align-items: center;
                      gap: 10px;
                      padding: 10px;
                      border-bottom: 1px solid #ddd;
                  `;

                  const nombre = document.createElement("span");
                  nombre.textContent = evidencia.nombreArchivo;

                  const botonVer = document.createElement("button");

                  botonVer.type = "button";
                  botonVer.className = "btn btn--secondary";
                  botonVer.textContent = "Ver documento";

                  botonVer.addEventListener("click", () => {
                      window.KihonEvidencias.abrirDocumentoEvidencia(
                          evidencia.id
                      );
                  });

                  documento.append(nombre, botonVer);
                  contenedorEvidencias.appendChild(documento);
              });
          }

          // Cancelar
          modal.querySelector(
              "#modal-cancelar-justificacion"
          ).addEventListener("click", () => {
              overlay.remove();
              resolve(null);
          });

          // Guardar: por ahora devuelve los datos del formulario
          modal.querySelector(
              "#modal-guardar-justificacion"
          ).addEventListener("click", () => {
              const motivoId = selectMotivo.value;

              const descripcion = modal.querySelector(
                  "#modal-descripcion-justificacion"
              ).value.trim();

              const archivos = Array.from(
                  modal.querySelector("#modal-nuevas-evidencias").files
              );

              if (!motivoId) {
                  alert("Selecciona un motivo de justificación.");
                  return;
              }

              overlay.remove();

              resolve({
                  justificacionExistente: justificacion,
                  motivoId: Number(motivoId),
                  descripcion,
                  archivos
              });
          });
      });

  } catch (error) {
      console.error("Error abriendo modal de justificación:", error);

      alert(error.message);

      return null;
  }
}


function mostrarModalConfirmacion(mensaje) {
  return new Promise((resolve) => {
      const overlay = document.createElement("div");

      overlay.style.cssText = `
          position: fixed;
          inset: 0;
          z-index: 100000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(0, 0, 0, 0.55);
      `;

      const modal = document.createElement("div");

      modal.style.cssText = `
          background: white;
          width: 100%;
          max-width: 420px;
          padding: 28px;
          border-radius: 14px;
          text-align: center;
          box-shadow: 0 10px 35px rgba(0, 0, 0, 0.2);
      `;

      modal.innerHTML = `
          <div style="
              width: 55px;
              height: 55px;
              margin: 0 auto 16px;
              border-radius: 50%;
              background: #dcfce7;
              color: #16a34a;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 30px;
          ">
              ✓
          </div>

          <h2 style="margin-bottom: 10px;">
              ¡Operación exitosa!
          </h2>

          <p style="
              color: #64748b;
              margin-bottom: 24px;
          ">
              ${mensaje}
          </p>

          <button
              type="button"
              class="btn btn--primary"
              id="btn-cerrar-confirmacion"
              style="min-width: 120px;"
          >
              Aceptar
          </button>
      `;

      overlay.appendChild(modal);
      document.body.appendChild(overlay);

      modal.querySelector(
          "#btn-cerrar-confirmacion"
      ).addEventListener("click", () => {
          overlay.remove();
          resolve();
      });
  });
}




  /*
  * =========================================================
  * ACTUALIZAR SELECTORES DE MOTIVOS
  * =========================================================
  */

  function actualizarSelectoresMotivos() {
    const selectores = attendanceRegister.querySelectorAll(
        ".asistencia-motivo",
    );

    selectores.forEach((select) => {
        select.innerHTML = "";

        const opcionInicial = document.createElement("option");

        opcionInicial.value = "";
        opcionInicial.textContent = "Selecciona un motivo";

        select.appendChild(opcionInicial);

        motivosJustificacion.forEach((motivo) => {
            const option = document.createElement("option");

            option.value = motivo.id;
            option.textContent = motivo.nombre;

            select.appendChild(option);
        });
    });
  }


    /*
    * =========================================================
    * MENSAJES
    * =========================================================
    */

    function mostrarMensaje(mensaje, tipo) {
      attendanceMessage.textContent = mensaje;

      attendanceMessage.hidden = false;

      attendanceMessage.className =
        "asistencia-message " +
        (tipo === "success"
          ? "asistencia-message--success"
          : "asistencia-message--error");
    }

    function ocultarMensaje() {
      attendanceMessage.hidden = true;

      attendanceMessage.textContent = "";
    }

    /*
    * =========================================================
    * FORMATO DE HORA
    * =========================================================
    */

    function formatearHora(hora) {
      if (!hora) {
        return "-";
      }

      return hora.substring(0, 5);
    }

    /*
    * =========================================================
    * CARGAR GRUPOS DEL DÍA
    * =========================================================
    */

    async function cargarGruposDelDia() {
      const fecha = fechaInput.value;

      grupoSelect.innerHTML = `
              <option value="">
                  Cargando grupos...
              </option>
          `;

      grupoSelect.disabled = true;

      limpiarEstudiantes();

      if (!fecha) {
        grupoSelect.innerHTML = `
                  <option value="">
                      Selecciona una fecha primero
                  </option>
              `;

        return;
      }

      const diaSemana = obtenerDiaSemana(fecha);

      try {
        const response = await solicitar(
          `/api/grupo-horarios/dia/${diaSemana}`,
          {
            method: "GET",
          },
        );

        if (!verificarAutorizacion(response)) {
          return;
        }

        if (response.status === 403) {
          throw new Error("No tienes permisos para consultar los horarios.");
        }

        if (!response.ok) {
          throw new Error(
            await obtenerMensajeError(
              response,
              "No se pudieron obtener los grupos del día.",
            ),
          );
        }

        horariosDelDia = await response.json();

        grupoSelect.innerHTML = `
                  <option value="">
                      Selecciona un grupo
                  </option>
              `;

        /*
        * Evitar grupos repetidos.
        */

        const gruposMostrados = new Set();

        horariosDelDia.forEach((horario) => {
          if (gruposMostrados.has(horario.grupoId)) {
            return;
          }

          gruposMostrados.add(horario.grupoId);

          const option = document.createElement("option");

          option.value = horario.grupoId;

          option.textContent = `${horario.grupoNombre} (${formatearHora(horario.horaInicio)} - ${formatearHora(horario.horaFin)})`;

          grupoSelect.appendChild(option);
        });

        if (horariosDelDia.length === 0) {
          grupoSelect.innerHTML = `
                      <option value="">
                          No hay grupos este día
                      </option>
                  `;
        }

        grupoSelect.disabled = horariosDelDia.length === 0;
      } catch (error) {
        console.error("Error cargando grupos del día:", error);

        grupoSelect.innerHTML = `
                  <option value="">
                      Error al cargar grupos
                  </option>
              `;

        mostrarMensaje(error.message, "error");
      }
    }

    /*
    * =========================================================
    * LIMPIAR ESTUDIANTES
    * =========================================================
    */

    function limpiarEstudiantes() {
      estudiantesGrupo = [];

      asistenciasGrupo = [];

      grupoInfo.hidden = true;

      saveAttendanceButton.disabled = true;

      attendanceRegister.innerHTML = `
              <div class="asistencia-empty">

                  Selecciona una fecha y un grupo
                  para mostrar los estudiantes.

              </div>
          `;
    }

    /*
    * =========================================================
    * CARGAR ESTUDIANTES DEL GRUPO
    * =========================================================
    */

    async function cargarEstudiantesGrupo() {
      const grupoId = grupoSelect.value;

      const fecha = fechaInput.value;


      // Impedir la selección de fechas futuras.
if (fecha && fecha > obtenerFechaLocal()) {
  fechaInput.value = obtenerFechaLocal();

  grupoSelect.innerHTML = `
      <option value="">
          Selecciona una fecha primero
      </option>
  `;

  grupoSelect.disabled = true;

  limpiarEstudiantes();

  mostrarMensaje(
      "No es posible registrar asistencias en fechas futuras.",
      "error"
  );

  return;
}

      limpiarEstudiantes();

      if (!grupoId || !fecha) {
        return;
      }

      ocultarMensaje();

      try {
        /*
        * BUSCAR INFORMACIÓN DEL HORARIO
        */

        const horario = horariosDelDia.find(
          (item) => Number(item.grupoId) === Number(grupoId),
        );

        if (horario) {
          grupoInfoNombre.textContent = horario.grupoNombre;

          grupoInfoHorario.textContent = `${formatearHora(horario.horaInicio)} - ${formatearHora(horario.horaFin)}`;

          grupoInfoSensei.textContent = horario.senseiNombre || "-";
        }

        /*
        * ESTUDIANTES
        */

        const estudiantesResponse = await solicitar(
          `/api/estudiantes-grupos/grupo/${grupoId}`,
          {
            method: "GET",
          },
        );

        if (!verificarAutorizacion(estudiantesResponse)) {
          return;
        }

        if (estudiantesResponse.status === 403) {
          throw new Error(
            "No tienes permisos para consultar los estudiantes del grupo.",
          );
        }

        if (!estudiantesResponse.ok) {
          throw new Error(
            await obtenerMensajeError(
              estudiantesResponse,
              "No se pudieron obtener los estudiantes del grupo.",
            ),
          );
        }

        const asignaciones = await estudiantesResponse.json();

        estudiantesGrupo = asignaciones.filter(
          (asignacion) => String(asignacion.estado).toUpperCase() === "ACTIVO",
        );

        /*
        * ASISTENCIAS EXISTENTES
        */

        const asistenciasResponse = await solicitar(
          `/api/asistencias/grupo/${grupoId}/fecha/${fecha}`,
          {
            method: "GET",
          },
        );

        if (!verificarAutorizacion(asistenciasResponse)) {
          return;
        }

        if (asistenciasResponse.status === 403) {
          throw new Error("No tienes permisos para consultar las asistencias.");
        }

        if (!asistenciasResponse.ok) {
          throw new Error(
            await obtenerMensajeError(
              asistenciasResponse,
              "No se pudieron obtener las asistencias del grupo.",
            ),
          );
        }

        asistenciasGrupo = await asistenciasResponse.json();

        /*
        * INFORMACIÓN DEL GRUPO
        */

        grupoInfoCantidad.textContent = estudiantesGrupo.length;

        grupoInfo.hidden = false;

        /*
        * RENDERIZAR
        */

        renderizarEstudiantes();
      } catch (error) {
        console.error("Error cargando estudiantes:", error);

        attendanceRegister.innerHTML = `
                  <div class="asistencia-empty">
                      ${error.message}
                  </div>
              `;
      }
    }

    /*
    * =========================================================
    * BUSCAR ASISTENCIA EXISTENTE
    * =========================================================
    */

    function buscarAsistencia(estudianteId) {
      return asistenciasGrupo.find(
        (asistencia) => Number(asistencia.estudianteId) === Number(estudianteId),
      );
    }

    /*
    * =========================================================
    * RENDERIZAR ESTUDIANTES
    * =========================================================
    */


  function configurarVistaPreviaEvidencias() {

    const archivos = document.querySelectorAll(".asistencia-evidencia");

    archivos.forEach(input => {

        input.addEventListener("change", function () {

            const archivo = this.files[0];

            const fila = this.closest(".asistencia-student-row");

            if (!fila) return;

            const preview = fila.querySelector(
                ".asistencia-evidencia-preview"
            );

            const nombreArchivo = fila.querySelector(
                ".asistencia-evidencia-nombre"
            );

            const contenido = fila.querySelector(
                ".asistencia-evidencia-preview-content"
            );

            if (!preview || !nombreArchivo || !contenido) return;

            // Liberar la URL temporal anterior.
            if (preview.dataset.urlTemporal) {
                URL.revokeObjectURL(preview.dataset.urlTemporal);
                delete preview.dataset.urlTemporal;
            }

            contenido.replaceChildren();
            nombreArchivo.textContent = "";

            // Si no hay archivo seleccionado, ocultar la vista previa.
            if (!archivo) {
                preview.hidden = true;
                return;
            }

            const extension = archivo.name
                .split(".")
                .pop()
                .toLowerCase();

            const esPDF =
                archivo.type === "application/pdf" ||
                extension === "pdf";

            const esImagen =
                ["image/jpeg", "image/png"].includes(archivo.type) ||
                ["jpg", "jpeg", "png"].includes(extension);

            if (!esPDF && !esImagen) {
                preview.hidden = true;
                return;
            }

            const urlTemporal = URL.createObjectURL(archivo);

            preview.dataset.urlTemporal = urlTemporal;
            nombreArchivo.textContent = archivo.name;

            if (esPDF) {

                const visor = document.createElement("iframe");

                visor.src = urlTemporal;
                visor.title = "Vista previa del documento PDF";
                visor.className = "asistencia-evidencia-pdf";

                contenido.appendChild(visor);

            } else {

                const imagen = document.createElement("img");

                imagen.src = urlTemporal;
                imagen.alt = "Vista previa de la evidencia";
                imagen.className = "asistencia-evidencia-imagen";

                contenido.appendChild(imagen);
            }

            preview.hidden = false;
        });
    });
  }


  function configurarBotonesJustificacion() {

    const filas = attendanceRegister.querySelectorAll(
        ".asistencia-student-row"
    );

    filas.forEach(fila => {

        const formulario = fila.querySelector(
            ".asistencia-justificacion-fields"
        );

        const resumen = fila.querySelector(
            ".asistencia-justificacion-summary"
        );

        const textoResumen = fila.querySelector(
            ".asistencia-justificacion-resumen-texto"
        );

        const botonListo = fila.querySelector(
            ".asistencia-justificacion-listo"
        );

        const botonEditar = fila.querySelector(
            ".asistencia-justificacion-editar"
        );

        const motivo = fila.querySelector(
            ".asistencia-motivo"
        );

        const descripcion = fila.querySelector(
            ".asistencia-descripcion"
        );

        const evidencia = fila.querySelector(
            ".asistencia-evidencia"
        );

        if (
            !formulario ||
            !resumen ||
            !textoResumen ||
            !botonListo ||
            !botonEditar ||
            !motivo ||
            !descripcion ||
            !evidencia
        ) {
            return;
        }

        // BOTÓN LISTO
        botonListo.addEventListener("click", function () {

            const motivoId = motivo.value;

            const descripcionTexto = descripcion.value.trim();

            if (!motivoId) {
                alert("Debes seleccionar un motivo de justificación.");
                motivo.focus();
                return;
            }

            const motivoSeleccionado =
                motivo.options[motivo.selectedIndex].text;

            // El motivo OTRO requiere descripción.
            const esOtro = motivoSeleccionado
                .trim()
                .toUpperCase() === "OTRO";

            if (esOtro && !descripcionTexto) {
                alert("Debes ingresar una descripción para el motivo OTRO.");
                descripcion.focus();
                return;
            }

            // Mostrar resumen.
            const nombreArchivo = evidencia.files.length > 0
                ? evidencia.files[0].name
                : "Sin documento adjunto";

            textoResumen.textContent =
                `Motivo: ${motivoSeleccionado} | ` +
                `Descripción: ${descripcionTexto || "No especificada"} | ` +
                `Documento: ${nombreArchivo}`;

            // Contraer formulario.
            formulario.hidden = true;
            resumen.hidden = false;

        });

        // BOTÓN EDITAR
        botonEditar.addEventListener("click", function () {

            resumen.hidden = true;
            formulario.hidden = false;

        });

        // Si se selecciona otro estado, ocultar el resumen.
        fila.querySelectorAll(".asistencia-state-button").forEach(boton => {

            boton.addEventListener("click", function () {

                if (this.dataset.estado !== "JUSTIFICADO") {
                    resumen.hidden = true;
                } else {
                    resumen.hidden = true;
                }

            });

        });

    });
  }



    function renderizarEstudiantes() {
      if (estudiantesGrupo.length === 0) {
        attendanceRegister.innerHTML = `
                  <div class="asistencia-empty">

                      No hay estudiantes activos
                      en este grupo.

                  </div>
              `;

        saveAttendanceButton.disabled = true;

        return;
      }

      attendanceRegister.innerHTML = `

              <div class="asistencia-register-header">

                  <div>

                      <strong>
                          Estudiantes del grupo
                      </strong>

                      <span>
                          Selecciona el estado de cada estudiante.
                      </span>

                  </div>

              </div>


              <div class="asistencia-student-list">

                  ${estudiantesGrupo
          .map((asignacion) => {
            const asistencia = buscarAsistencia(
              asignacion.estudianteId,
            );

            const estado = asistencia ? asistencia.estado : "AUSENTE";

            const hora =
              asistencia && asistencia.horaLlegada
                ? asistencia.horaLlegada.substring(0, 5)
                : "";

            const observacion =
              asistencia && asistencia.observacion
                ? asistencia.observacion
                : "";

            return `

                              <div
                                  class="asistencia-student-row"
                                  data-estudiante-id="${asignacion.estudianteId}"
                                  data-asistencia-id="${asistencia ? asistencia.id : ""}"
                              >

                                  <div class="asistencia-student-info">

                                      <strong>
                                          ${asignacion.estudianteNombre}
                                      </strong>

                                      <span>
                                          Estudiante
                                      </span>

                                  </div>


                                  <div class="asistencia-state-buttons">

                                      <button
                                          type="button"
                                          class="asistencia-state-button asistencia-state-button--presente ${estado === "PRESENTE" ? "is-active" : ""}"
                                          data-estado="PRESENTE"
                                      >
                                          PRESENTE
                                      </button>


                                      <button
                                          type="button"
                                          class="asistencia-state-button asistencia-state-button--tardanza ${estado === "TARDANZA" ? "is-active" : ""}"
                                          data-estado="TARDANZA"
                                      >
                                          TARDANZA
                                      </button>


                                      <button
                                          type="button"
                                          class="asistencia-state-button asistencia-state-button--ausente ${estado === "AUSENTE" ? "is-active" : ""}"
                                          data-estado="AUSENTE"
                                      >
                                          AUSENTE
                                      </button>

                                      <button
      type="button"
      class="asistencia-state-button asistencia-state-button--justificado ${estado === "JUSTIFICADO" ? "is-active" : ""}"
      data-estado="JUSTIFICADO"
  >
      JUSTIFICADO
  </button>

                                  </div>


                                  <div class="asistencia-student-fields">

                                      <div class="form-group">

                                          <label class="form-label">
                                              Hora
                                          </label>

                                          <input
                                              type="time"
                                              class="form-input asistencia-hora"
                                              value="${hora}"
                                              ${estado === "AUSENTE" ? "disabled" : ""}
                                          >

                                      </div>


                                      <div class="form-group">

                                          <label class="form-label">
                                              Observación
                                          </label>

                                          <input
                                              type="text"
                                              class="form-input asistencia-observacion"
                                              value="${observacion}"
                                              placeholder="Opcional"
                                          >

                                      </div>

                                  </div>


  <div
  class="asistencia-justificacion-fields"
  ${estado === "JUSTIFICADO" ? "" : "hidden"}
  >
  <div class="asistencia-justificacion-header">
      <strong>Justificación de inasistencia</strong>
      <span>Registra el motivo y los detalles correspondientes.</span>
  </div>

  <div class="form-group">
      <label class="form-label">
          Motivo de justificación
      </label>

      <select class="form-select asistencia-motivo">
          <option value="">Selecciona un motivo</option>
      </select>
  </div>

  <div class="form-group">
      <label class="form-label">
          Descripción
      </label>

      <textarea
          class="form-input asistencia-descripcion"
          rows="3"
          placeholder="Describe brevemente el motivo de la inasistencia..."
      ></textarea>
  </div>


  <div class="form-group">
      <label class="form-label">
          Documento de sustento (opcional)
      </label>

      <input
          type="file"
          class="form-input asistencia-evidencia"
          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
      >

      <small>Formatos permitidos: PDF, JPG y PNG. Máximo 5 MB.</small>

      <!-- Vista previa del documento -->
      <div class="asistencia-evidencia-preview" hidden>
          <div class="asistencia-evidencia-preview-header">
              <strong>Vista previa del documento</strong>
              <span class="asistencia-evidencia-nombre"></span>
          </div>

          <div class="asistencia-evidencia-preview-content"></div>
      </div>
  </div>


  <div class="asistencia-justificacion-actions">
      <button
          type="button"
          class="btn btn--primary asistencia-justificacion-listo"
      >
          Listo
      </button>
  </div>


  </div>

  <div class="asistencia-justificacion-summary" hidden>

      <div class="asistencia-justificacion-summary-info">
          <strong>Justificación completada</strong>

          <p class="asistencia-justificacion-resumen-texto"></p>
      </div>

      <button
          type="button"
          class="btn btn--secondary asistencia-justificacion-editar"
      >
          Editar justificación
      </button>

  </div>




  </div>

  `;
          })
          .join("")}

              </div>
          `;

          configurarBotonesEstado();

  actualizarSelectoresMotivos();

  configurarVistaPreviaEvidencias();

  configurarBotonesJustificacion();

  saveAttendanceButton.disabled = false;
    }

    /*
    * =========================================================
    * BOTONES DE ESTADO
    * =========================================================
    */

    

    function configurarBotonesEstado() {
      const botones = attendanceRegister.querySelectorAll(
          ".asistencia-state-button",
      );

      botones.forEach((boton) => {
          boton.addEventListener("click", function () {
              const fila = boton.closest(".asistencia-student-row");
              const estado = boton.dataset.estado;

              fila
                  .querySelectorAll(".asistencia-state-button")
                  .forEach((otroBoton) => {
                      otroBoton.classList.remove("is-active");
                  });

              boton.classList.add("is-active");

              const horaInput = fila.querySelector(".asistencia-hora");

              // Mostrar u ocultar el formulario de justificación
              const justificacionFields = fila.querySelector(
                  ".asistencia-justificacion-fields",
              );

              if (justificacionFields) {
                  justificacionFields.hidden = estado !== "JUSTIFICADO";
              }

              // Configurar hora de llegada
              if (estado === "AUSENTE" || estado === "JUSTIFICADO") {
                  horaInput.value = "";
                  horaInput.disabled = true;
                  horaInput.required = false;
              } else {
                  horaInput.disabled = false;
                  horaInput.required = true;

                  if (!horaInput.value) {
                      const ahora = new Date();

                      const horas = String(ahora.getHours()).padStart(2, "0");
                      const minutos = String(ahora.getMinutes()).padStart(2, "0");

                      horaInput.value = `${horas}:${minutos}`;
                  }
              }
          });
      });
  }



    /*
    * =========================================================
    * OBTENER ESTADO DE UNA FILA
    * =========================================================
    */

    function obtenerDatosFila(fila) {
      const estudianteId = Number(fila.dataset.estudianteId);
      const asistenciaId = fila.dataset.asistenciaId
          ? Number(fila.dataset.asistenciaId)
          : null;

      const botonActivo = fila.querySelector(
          ".asistencia-state-button.is-active"
      );

      const estado = botonActivo
          ? botonActivo.dataset.estado
          : "AUSENTE";

      const horaInput = fila.querySelector(".asistencia-hora");
      const observacionInput = fila.querySelector(
          ".asistencia-observacion"
      );

      const motivoInput = fila.querySelector(".asistencia-motivo");
      const descripcionInput = fila.querySelector(
          ".asistencia-descripcion"
      );
      const evidenciaInput = fila.querySelector(
          ".asistencia-evidencia"
      );

      return {
          asistenciaId,
          estudianteId,
          grupoId: Number(grupoSelect.value),
          fecha: fechaInput.value,

          horaLlegada:
              estado === "AUSENTE" || estado === "JUSTIFICADO"
                  ? null
                  : horaInput.value || null,

          estado,
          observacion: observacionInput.value.trim() || null,

          motivoId: motivoInput.value
              ? Number(motivoInput.value)
              : null,

          descripcionJustificacion:
              descripcionInput.value.trim() || null,

          archivoEvidencia:
              evidenciaInput.files.length > 0
                  ? evidenciaInput.files[0]
                  : null
      };
  }

    /*
    * =========================================================
    * GUARDAR ASISTENCIAS
    * =========================================================
    */

    
  
async function guardarAsistencias() {
  const filas = attendanceRegister.querySelectorAll(
      ".asistencia-student-row"
  );

  if (filas.length === 0) {
      mostrarMensaje("No hay estudiantes para registrar.", "error");
      return;
  }

  const asistencias = Array.from(filas).map(obtenerDatosFila);

  /*
   * VALIDAR HORAS
   */

  for (const asistencia of asistencias) {
      if (
          (asistencia.estado === "PRESENTE" ||
              asistencia.estado === "TARDANZA") &&
          !asistencia.horaLlegada
      ) {
          mostrarMensaje(
              "Los estudiantes PRESENTES o con TARDANZA deben tener una hora de llegada.",
              "error"
          );
          return;
      }

      if (
          (asistencia.estado === "AUSENTE" ||
              asistencia.estado === "JUSTIFICADO") &&
          asistencia.horaLlegada
      ) {
          mostrarMensaje(
              "Las asistencias AUSENTE o JUSTIFICADO no pueden tener hora de llegada.",
              "error"
          );
          return;
      }
  }

  /*
   * VALIDAR JUSTIFICACIONES
   */

  for (const asistencia of asistencias) {
      if (asistencia.estado !== "JUSTIFICADO") {
          continue;
      }

      if (!asistencia.motivoId) {
          mostrarMensaje(
              "Debes seleccionar un motivo para cada asistencia justificada.",
              "error"
          );
          return;
      }

      const motivoSeleccionado = motivosJustificacion.find(
          motivo => Number(motivo.id) === asistencia.motivoId
      );

      if (!motivoSeleccionado) {
          mostrarMensaje(
              "El motivo seleccionado no es válido.",
              "error"
          );
          return;
      }

      if (
          motivoSeleccionado.nombre.trim().toUpperCase() === "OTRO" &&
          !asistencia.descripcionJustificacion
      ) {
          mostrarMensaje(
              "Debes ingresar una descripción cuando el motivo sea OTRO.",
              "error"
          );
          return;
      }
  }

  saveAttendanceButton.disabled = true;
  saveAttendanceButton.textContent = "Guardando...";

  ocultarMensaje();

  try {
      let registrados = 0;
      let actualizados = 0;

      for (let i = 0; i < asistencias.length; i++) {
          const asistencia = asistencias[i];
          const fila = filas[i];

          let response;

          const esNueva = !asistencia.asistenciaId;

          /*
           * GUARDAR ASISTENCIA
           */

          const datosAsistencia = {
              estudianteId: asistencia.estudianteId,
              grupoId: asistencia.grupoId,
              fecha: asistencia.fecha,
              horaLlegada: asistencia.horaLlegada,
              estado: asistencia.estado,
              observacion: asistencia.observacion
          };

          if (!esNueva) {
              response = await solicitar(
                  `/api/asistencias/${asistencia.asistenciaId}`,
                  {
                      method: "PUT",
                      headers: {
                          "Content-Type": "application/json"
                      },
                      body: JSON.stringify(datosAsistencia)
                  }
              );
          } else {
              response = await solicitar(
                  "/api/asistencias",
                  {
                      method: "POST",
                      headers: {
                          "Content-Type": "application/json"
                      },
                      body: JSON.stringify(datosAsistencia)
                  }
              );
          }

          if (!verificarAutorizacion(response)) {
              return;
          }

          if (response.status === 403) {
              throw new Error(
                  "No tienes permisos para modificar las asistencias."
              );
          }

          if (!response.ok) {
              throw new Error(
                  await obtenerMensajeError(
                      response,
                      "No se pudo guardar una de las asistencias."
                  )
              );
          }

          /*
           * RECUPERAR ID DE ASISTENCIA
           */

          let asistenciaId = asistencia.asistenciaId;

          if (esNueva) {
              const asistenciaResponse = await response.json();

              asistenciaId = asistenciaResponse.id;

              if (!asistenciaId) {
                  throw new Error(
                      "La asistencia se guardó, pero no se recibió su ID."
                  );
              }

              fila.dataset.asistenciaId = asistenciaId;

              registrados++;
          } else {
              actualizados++;
          }

          /*
           * GUARDAR JUSTIFICACIÓN Y EVIDENCIA
           */

          if (asistencia.estado === "JUSTIFICADO") {
              const asistenciaConId = {
                  ...asistencia,
                  asistenciaId
              };

              // Crear o actualizar justificación.
              const justificacion = await guardarJustificacion(
                  asistenciaConId
              );

              if (!justificacion || !justificacion.id) {
                  throw new Error(
                      "La justificación se guardó, pero no se recibió su ID."
                  );
              }

              // Subir documento si fue seleccionado.
              if (asistencia.archivoEvidencia) {
                  await subirEvidencia(
                      justificacion.id,
                      asistencia.archivoEvidencia
                  );
              }
          }
      }

      /*
       * RECARGAR DATOS DEL GRUPO
       */

      await cargarEstudiantesGrupo();

      /*
       * ACTUALIZAR CONSULTA
       */

      await cargarAsistenciasConsulta();

      /*
       * MOSTRAR MODAL DE CONFIRMACIÓN
       */

      mostrarModalConfirmacion(
          `Las asistencias se han guardado correctamente.`
      );

  } catch (error) {
      console.error("Error guardando asistencias:", error);

      mostrarMensaje(
          error.message || "Ocurrió un error al guardar las asistencias.",
          "error"
      );

  } finally {
      saveAttendanceButton.disabled = false;
      saveAttendanceButton.textContent = "Guardar asistencia";
  }
}



    
async function obtenerJustificacionPorAsistencia(asistenciaId) {
  try {
      const response = await solicitar(
          `/api/justificaciones-asistencia/asistencia/${asistenciaId}`
      );

      if (response.status === 404) {
          return null;
      }

      if (!response.ok) {
          throw new Error(
              await obtenerMensajeError(response)
          );
      }

      return await response.json();

  } catch (error) {
      console.error(
          "Error consultando justificación:",
          error
      );

      throw error;
  }
}


  async function guardarJustificacion(asistencia) {
    const datos = {
        asistenciaId: asistencia.asistenciaId,
        motivoId: asistencia.motivoId,
        descripcion: asistencia.descripcionJustificacion
    };

    const justificacionExistente =
        await obtenerJustificacionPorAsistencia(
            asistencia.asistenciaId
        );

    let response;

    if (justificacionExistente) {
        response = await solicitar(
            `/api/justificaciones-asistencia/${justificacionExistente.id}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(datos)
            }
        );
    } else {
        response = await solicitar(
            "/api/justificaciones-asistencia",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(datos)
            }
        );
    }

    if (!response.ok) {
        throw new Error(
            await obtenerMensajeError(response)
        );
    }

    return await response.json();
  }

  async function subirEvidencia(justificacionId, archivo) {
    const formData = new FormData();

    formData.append("justificacionId", justificacionId);
    formData.append("archivo", archivo);

    const response = await solicitar(
        "/api/evidencias-asistencia",
        {
            method: "POST",
            body: formData
        }
    );

    if (!response.ok) {
        throw new Error(
            await obtenerMensajeError(
                response,
                "No se pudo subir el documento de justificación."
            )
        );
    }

    return await response.json();
  }





  async function configurarBotonesVerDocumento(resultados) {
    for (const asistencia of resultados) {
        if (String(asistencia.estado).toUpperCase() !== "JUSTIFICADO") {
            continue;
        }

        try {
            const justificacion = await obtenerJustificacionPorAsistencia(asistencia.id);

            if (!justificacion) continue;

            const response = await solicitar(
                `/api/evidencias-asistencia/justificacion/${justificacion.id}`,
                { method: "GET" }
            );

            if (!verificarAutorizacion(response)) return;

            if (!response.ok) {
                throw new Error(
                    await obtenerMensajeError(
                        response,
                        "No se pudieron consultar las evidencias."
                    )
                );
            }

            const evidencias = await response.json();

            if (!Array.isArray(evidencias) || evidencias.length === 0) {
                continue;
            }

            const fila = attendanceList.querySelector(
                `tr[data-consulta-id="${asistencia.id}"]`
            );

            const celdaAcciones = fila?.lastElementChild;

            if (!celdaAcciones) continue;

            // Un único botón para todos los justificantes.
            const boton = document.createElement("button");

            boton.type = "button";
            boton.className = "btn btn--secondary asistencia-view-evidence";
            boton.textContent = "Ver justificantes";
            boton.title = `Consultar ${evidencias.length} documento(s)`;

            boton.addEventListener("click", () => {
              window.KihonEvidencias.mostrarListaJustificantes(evidencias);
          });

            celdaAcciones.appendChild(boton);

        } catch (error) {
            console.error(
                `Error consultando documentos de asistencia ${asistencia.id}:`,
                error
            );
        }
    }
  }






    /*
    * =========================================================
    * CARGAR GRUPOS PARA CONSULTA
    * =========================================================
    */

    async function cargarGruposConsulta() {
      try {
        const response = await solicitar("/api/grupos?estado=ACTIVO", {
          method: "GET",
        });

        if (!verificarAutorizacion(response)) {
          return;
        }

        if (!response.ok) {
          throw new Error(
            await obtenerMensajeError(
              response,
              "No se pudieron cargar los grupos.",
            ),
          );
        }

        const grupos = await response.json();

        grupoConsulta.innerHTML = `
                  <option value="">
                      Todos los grupos
                  </option>
              `;

        grupos.forEach((grupo) => {
          const option = document.createElement("option");

          option.value = grupo.id;

          option.textContent = grupo.nombre;

          grupoConsulta.appendChild(option);
        });
      } catch (error) {
        console.error("Error cargando grupos de consulta:", error);
      }
    }

    /*
    * =========================================================
    * CARGAR ESTUDIANTES PARA CONSULTA
    * =========================================================
    */

    async function cargarEstudiantesConsulta() {
      try {
        const response = await solicitar("/api/estudiantes?estado=ACTIVO", {
          method: "GET",
        });

        if (!verificarAutorizacion(response)) {
          return;
        }

        if (!response.ok) {
          throw new Error(
            await obtenerMensajeError(
              response,
              "No se pudieron cargar los estudiantes.",
            ),
          );
        }

        const estudiantes = await response.json();

        estudianteConsulta.innerHTML = `
                  <option value="">
                      Todos los estudiantes
                  </option>
              `;

        estudiantes.forEach((estudiante) => {
          const option = document.createElement("option");

          option.value = estudiante.id;

          option.textContent = `${estudiante.nombre} ${estudiante.apellido}`;

          estudianteConsulta.appendChild(option);
        });
      } catch (error) {
        console.error("Error cargando estudiantes de consulta:", error);
      }
    }

    /*
    * =========================================================
    * CARGAR ASISTENCIAS PARA CONSULTA
    * =========================================================
    */

    async function cargarAsistenciasConsulta() {
      const fecha = fechaConsulta.value;

      // Impedir consultas de fechas futuras.
if (fecha && fecha > obtenerFechaLocal()) {
  fechaConsulta.value = obtenerFechaLocal();

  attendanceList.innerHTML = `
      <div class="asistencia-empty">
          No es posible consultar asistencias de fechas futuras.
      </div>
  `;

  attendanceCount.textContent = "0 asistencias";

  return;
}

      if (!fecha) {
        attendanceList.innerHTML = `
                  <div class="asistencia-empty">
                      Selecciona una fecha para consultar.
                  </div>
              `;

        attendanceCount.textContent = "0 asistencias";

        return;
      }

      attendanceList.innerHTML = `
              <div class="asistencia-loading">
                  Cargando asistencias...
              </div>
          `;

      try {
        const response = await solicitar(`/api/asistencias/fecha/${fecha}`, {
          method: "GET",
        });

        if (!verificarAutorizacion(response)) {
          return;
        }

        if (response.status === 403) {
          throw new Error("No tienes permisos para consultar asistencias.");
        }

        if (!response.ok) {
          throw new Error(
            await obtenerMensajeError(
              response,
              "No se pudieron obtener las asistencias.",
            ),
          );
        }

        asistenciasConsulta = await response.json();

        /*
        * FILTRO POR GRUPO
        */

        const grupoId = grupoConsulta.value ? Number(grupoConsulta.value) : null;

        /*
        * FILTRO POR ESTUDIANTE
        */

        const estudianteId = estudianteConsulta.value
          ? Number(estudianteConsulta.value)
          : null;

        let resultados = asistenciasConsulta.filter((asistencia) => {
          if (grupoId && Number(asistencia.grupoId) !== grupoId) {
            return false;
          }

          if (estudianteId && Number(asistencia.estudianteId) !== estudianteId) {
            return false;
          }

          return true;
        });

        attendanceCount.textContent = `${resultados.length} asistencia${resultados.length !== 1 ? "s" : ""}`;

        if (resultados.length === 0) {
          attendanceList.innerHTML = `
                      <div class="asistencia-empty">
                          No hay asistencias que coincidan
                          con los filtros seleccionados.
                      </div>
                  `;

          return;
        }

        /*
        * TABLA
        */

        attendanceList.innerHTML = `

                  <table class="asistencia-table">

                      <thead>

                          <tr>

                              <th>
                                  Estudiante
                              </th>

                              <th>
                                  Grupo
                              </th>

                              <th>
                                  Fecha
                              </th>

                              <th>
                                  Hora
                              </th>

                              <th>
                                  Estado
                              </th>

                              <th>
                                  Observación
                              </th>

                              <th>
                                  Acción
                              </th>

                          </tr>

                      </thead>


                      <tbody>

                          ${resultados
            .map((asistencia) => {
              return `

                                      <tr
                                          data-consulta-id="${asistencia.id}"
                                      >

                                          <td>
                                              ${asistencia.estudianteNombre}
                                          </td>


                                          <td>
                                              ${asistencia.grupoNombre}
                                          </td>


                                          <td>
                                              ${asistencia.fecha}
                                          </td>


                                          <td>
                                              ${asistencia.horaLlegada
                  ? asistencia.horaLlegada.substring(
                    0,
                    5,
                  )
                  : "-"
                }
                                          </td>


                                          <td>

                                              <span class="
                                                  asistencia-estado
                                                  asistencia-estado--${String(
                  asistencia.estado,
                ).toLowerCase()}
                                              ">

                                                  ${asistencia.estado}

                                              </span>

                                          </td>


                                          <td>
                                              ${asistencia.observacion || "-"}
                                          </td>


                                          <td>

                                              <button
                                                  type="button"
                                                  class="btn btn--secondary asistencia-edit-button"
                                                  data-id="${asistencia.id}"
                                              >
                                                  Editar
                                              </button>

                                          </td>

                                      </tr>

                                  `;
            })
            .join("")}

                      </tbody>

                  </table>

              `;

        configurarBotonesEdicion();


        await configurarBotonesVerDocumento(resultados);
      } catch (error) {
        console.error("Error cargando asistencias:", error);

        attendanceList.innerHTML = `
                  <div class="asistencia-empty">
                      ${error.message}
                  </div>
              `;
      }
    }

    /*
    * =========================================================
    * EDITAR ASISTENCIA DESDE CONSULTA
    * =========================================================
    */

    function configurarBotonesEdicion() {
      const botones = document.querySelectorAll(".asistencia-edit-button");

      botones.forEach((boton) => {
        boton.addEventListener("click", function () {
          const id = Number(boton.dataset.id);

          const asistencia = asistenciasConsulta.find(
            (item) => Number(item.id) === id,
          );

          if (!asistencia) {
            return;
          }

          abrirEditorConsulta(asistencia);
        });
      });
    }

    /*
    * =========================================================
    * EDITOR DE CONSULTA
    * =========================================================
    */

    
function abrirEditorConsulta(asistencia) {
  const fila = document.querySelector(
      `tr[data-consulta-id="${asistencia.id}"]`
  );

  if (!fila) {
      return;
  }

  fila.innerHTML = `

      <td>
          ${asistencia.estudianteNombre}
      </td>

      <td>
          ${asistencia.grupoNombre}
      </td>

      <td>
          ${asistencia.fecha}
      </td>

      <td>
          <input
              type="time"
              class="form-input asistencia-edit-hora"
              value="${
                  asistencia.horaLlegada
                      ? asistencia.horaLlegada.substring(0, 5)
                      : ""
              }"
          >
      </td>

      <td>
          <select
              class="form-select asistencia-edit-estado"
          >

              <option
                  value="PRESENTE"
                  ${asistencia.estado === "PRESENTE" ? "selected" : ""}
              >
                  PRESENTE
              </option>

              <option
                  value="TARDANZA"
                  ${asistencia.estado === "TARDANZA" ? "selected" : ""}
              >
                  TARDANZA
              </option>

              <option
                  value="AUSENTE"
                  ${asistencia.estado === "AUSENTE" ? "selected" : ""}
              >
                  AUSENTE
              </option>

              <option
                  value="JUSTIFICADO"
                  ${asistencia.estado === "JUSTIFICADO" ? "selected" : ""}
              >
                  JUSTIFICADO
              </option>

          </select>
      </td>

      <td>
          <input
              type="text"
              class="form-input asistencia-edit-observacion"
              value="${asistencia.observacion || ""}"
              placeholder="Opcional"
          >
      </td>

      <td>
          <div class="asistencia-edit-actions">

              ${
                  asistencia.estado === "JUSTIFICADO"
                      ? `
                          <button
                              type="button"
                              class="btn btn--secondary asistencia-add-justificacion"
                          >
                              Añadir justificación
                          </button>
                      `
                      : ""
              }

              <button
                  type="button"
                  class="btn btn--primary asistencia-save-edit"
              >
                  Guardar
              </button>

              <button
                  type="button"
                  class="btn btn--secondary asistencia-cancel-edit"
              >
                  Cancelar
              </button>

          </div>
      </td>

  `;

  // ==========================================
  // SELECTOR DE ESTADO Y HORA
  // ==========================================

  const estadoSelect = fila.querySelector(
      ".asistencia-edit-estado"
  );

  const horaInput = fila.querySelector(
      ".asistencia-edit-hora"
  );

  function actualizarHoraEdicion() {
      if (estadoSelect.value === "AUSENTE") {
          horaInput.value = "";
          horaInput.disabled = true;
      } else {
          horaInput.disabled = false;
      }
  }

  let estadoAnterior = estadoSelect.value;
let datosJustificacionPendientes = null;
let modalJustificacionAbierto = false;

estadoSelect.addEventListener("change", async function () {
    actualizarHoraEdicion();

    // Si selecciona otro estado, descartamos los datos pendientes.
    if (estadoSelect.value !== "JUSTIFICADO") {
        estadoAnterior = estadoSelect.value;
        datosJustificacionPendientes = null;
        return;
    }

    // Evitamos abrir nuevamente el modal si ya estaba justificado.
    if (estadoAnterior === "JUSTIFICADO" || modalJustificacionAbierto) {
        return;
    }

    modalJustificacionAbierto = true;

    try {
        const datos = await mostrarModalJustificacion(asistencia);

        if (!datos) {
            // Si cancela, recuperamos el estado anterior.
            estadoSelect.value = estadoAnterior;
            actualizarHoraEdicion();
            return;
        }

        // Conservamos los datos para guardarlos posteriormente.
        datosJustificacionPendientes = datos;
        estadoAnterior = "JUSTIFICADO";

    } catch (error) {
        console.error("Error mostrando la justificación:", error);

        estadoSelect.value = estadoAnterior;
        actualizarHoraEdicion();

        alert(error.message);

    } finally {
        modalJustificacionAbierto = false;
    }
});

  actualizarHoraEdicion();

  // ==========================================
  // BOTÓN GUARDAR
  // ==========================================

  fila.querySelector(".asistencia-save-edit").addEventListener("click", () => {
    guardarEdicionConsulta(
        asistencia,
        fila,
        datosJustificacionPendientes
    );
});

  // ==========================================
  // BOTÓN CANCELAR
  // ==========================================

  fila.querySelector(
      ".asistencia-cancel-edit"
  ).addEventListener("click", function () {
      cargarAsistenciasConsulta();
  });

  // ==========================================
  // BOTÓN AÑADIR JUSTIFICACIÓN
  // ==========================================

  const botonAgregarJustificacion = fila.querySelector(
      ".asistencia-add-justificacion"
  );

  if (botonAgregarJustificacion) {
      botonAgregarJustificacion.addEventListener(
          "click",
          function () {
              gestionarJustificacionConsulta(asistencia);
          }
      );
  }
}


    /*
    * =========================================================
    * GUARDAR EDICIÓN
    * =========================================================
    */

    
    async function guardarEdicionConsulta(
      asistencia,
      fila,
      datosJustificacionPendientes = null
  ){
  const estadoSelect = fila.querySelector(
      ".asistencia-edit-estado"
  );

  const horaInput = fila.querySelector(
      ".asistencia-edit-hora"
  );

  const observacionInput = fila.querySelector(
      ".asistencia-edit-observacion"
  );

  const estado = estadoSelect.value;

  const horaLlegada =
      estado === "AUSENTE" ? null : horaInput.value || null;

  if (
      (estado === "PRESENTE" || estado === "TARDANZA") &&
      !horaLlegada
  ) {
      alert(
          "Los estados PRESENTE y TARDANZA requieren hora de llegada."
      );
      return;
  }

  try {
    let datosJustificacion = null;

    if (estado === "JUSTIFICADO") {
        datosJustificacion = datosJustificacionPendientes;
    
        // Si no se abrió previamente el modal, lo abrimos como alternativa.
        if (!datosJustificacion) {
            datosJustificacion = await mostrarModalJustificacion(asistencia);
        }
    
        if (!datosJustificacion) {
            return;
        }
    }

      // Actualizar asistencia
      const response = await solicitar(
          `/api/asistencias/${asistencia.id}`,
          {
              method: "PUT",
              headers: {
                  "Content-Type": "application/json"
              },
              body: JSON.stringify({
                  estudianteId: asistencia.estudianteId,
                  grupoId: asistencia.grupoId,
                  fecha: asistencia.fecha,
                  horaLlegada,
                  estado,
                  observacion: observacionInput.value.trim() || null
              })
          }
      );

      if (!verificarAutorizacion(response)) {
          return;
      }

      if (response.status === 403) {
          throw new Error(
              "No tienes permisos para modificar asistencias."
          );
      }

      if (!response.ok) {
          throw new Error(
              await obtenerMensajeError(
                  response,
                  "No se pudo actualizar la asistencia."
              )
          );
      }

      // Gestionar justificación
      if (estado === "JUSTIFICADO") {
          const justificacion = await guardarJustificacion({
              asistenciaId: asistencia.id,
              motivoId: datosJustificacion.motivoId,
              descripcionJustificacion: datosJustificacion.descripcion
          });

          // Subir todos los documentos nuevos
          for (const archivo of datosJustificacion.archivos) {
              await subirEvidencia(
                  justificacion.id,
                  archivo
              );
          }
      }

      // Actualizar tabla de consulta
      await cargarAsistenciasConsulta();

      // Actualizar registro principal si corresponde
      if (
          fechaInput.value === asistencia.fecha &&
          String(grupoSelect.value) === String(asistencia.grupoId)
      ) {
          await cargarEstudiantesGrupo();
      }

      await mostrarModalConfirmacion(
        "La asistencia se ha actualizado correctamente."
    );

  } catch (error) {
      console.error(
          "Error actualizando asistencia:",
          error
      );

      alert(error.message);
  }
}


async function gestionarJustificacionConsulta(asistencia) {
  try {
      // Abrir el modal con los datos existentes
      const datos = await mostrarModalJustificacion(asistencia);

      if (!datos) {
          return;
      }

      // Actualizar la justificación existente
      const justificacion = await guardarJustificacion({
          asistenciaId: asistencia.id,
          motivoId: datos.motivoId,
          descripcionJustificacion: datos.descripcion
      });

      // Incorporar los documentos nuevos
      for (const archivo of datos.archivos) {
          await subirEvidencia(
              justificacion.id,
              archivo
          );
      }

      // Recargar la tabla para reflejar los cambios
      await cargarAsistenciasConsulta();

      await mostrarModalConfirmacion(
          "La justificación se ha actualizado correctamente."
      );

  } catch (error) {
      console.error(
          "Error gestionando la justificación:",
          error
      );

      alert(error.message);
  }
}



    /*
    * =========================================================
    * EVENTOS
    * =========================================================
    */

    fechaInput.addEventListener("change", async function () {
      ocultarMensaje();

      await cargarGruposDelDia();
    });

    grupoSelect.addEventListener("change", cargarEstudiantesGrupo);

    saveAttendanceButton.addEventListener("click", guardarAsistencias);

    fechaConsulta.addEventListener("change", cargarAsistenciasConsulta);

    grupoConsulta.addEventListener("change", cargarAsistenciasConsulta);

    estudianteConsulta.addEventListener("change", cargarAsistenciasConsulta);

    /*
    * =========================================================
    * INICIALIZACIÓN
    * =========================================================
    */

    const fechaActual = obtenerFechaLocal();

// Bloquear visualmente las fechas posteriores al día actual.
fechaInput.max = fechaActual;
fechaConsulta.max = fechaActual;

// Establecer la fecha actual por defecto.
fechaInput.value = fechaActual;
fechaConsulta.value = fechaActual;

    /*
    * CARGAR DATOS INICIALES
    */

    cargarGruposDelDia();

    cargarGruposConsulta();

    cargarEstudiantesConsulta();

    cargarAsistenciasConsulta();

    cargarMotivosJustificacion();
  });