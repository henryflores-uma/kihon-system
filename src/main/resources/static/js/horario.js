document.addEventListener("DOMContentLoaded", async function () {
  /*
   * ==========================================
   * AUTENTICACIÓN
   * ==========================================
   */

  const username = sessionStorage.getItem("kihonUsername");
  const rol = sessionStorage.getItem("kihonRol");

  const ROLES_PERMITIDOS = ["ADMIN", "SECRETARIA", "SENSEI"];

  const puedeGestionarEventos = ["ADMIN", "SECRETARIA"].includes(rol);

  /*
   * ==========================================
   * VERIFICAR SESIÓN Y ROL
   * ==========================================
   */

  if (!username || !rol) {
    sessionStorage.removeItem("kihonUsername");
    sessionStorage.removeItem("kihonRol");
    sessionStorage.removeItem("kihonAuth");

    window.location.replace("/login");
    return;
  }

  if (!ROLES_PERMITIDOS.includes(rol)) {
    window.location.replace("/login");
    return;
  }

  /*
   * ==========================================
   * SOLICITUDES HTTP
   * ==========================================
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

  async function solicitar(url, opciones = {}) {
    const metodo = (opciones.method || "GET").toUpperCase();

    const encabezados = new Headers(opciones.headers || {});

    encabezados.set("Accept", "application/json");

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
   * ==========================================
   * ELEMENTOS DEL DOM
   * ==========================================
   */

  const previousWeekButton = document.getElementById("previousWeekButton");
  const nextWeekButton = document.getElementById("nextWeekButton");
  const todayButton = document.getElementById("todayButton");

  const weekLabel = document.getElementById("weekLabel");
  const scheduleCalendar = document.getElementById("scheduleCalendar");
  const scheduleMessage = document.getElementById("scheduleMessage");

  /*
   * ==========================================
   * CONFIGURACIÓN
   * ==========================================
   */

  const DIAS = [
    "LUNES",
    "MARTES",
    "MIERCOLES",
    "JUEVES",
    "VIERNES",
    "SABADO",
    "DOMINGO",
  ];

  const NOMBRES_DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  const HORA_INICIO = 8;
  const HORA_FIN = 21;

  /*
   * ==========================================
   * ESTADO DEL CALENDARIO
   * ==========================================
   */

  let fechaActual = new Date();
  let fechaSemana = obtenerLunes(fechaActual);

  let horarios = [];

  /*
   * ==========================================
   * VERIFICAR ELEMENTOS DEL DOM
   * ==========================================
   */

  if (
    !previousWeekButton ||
    !nextWeekButton ||
    !todayButton ||
    !weekLabel ||
    !scheduleCalendar ||
    !scheduleMessage
  ) {
    console.error("No se encontraron todos los elementos del calendario.");
    return;
  }

  /*
   * ==========================================
   * CONFIGURAR INTERFAZ SEGÚN ROL
   * ==========================================
   */

  function configurarInterfazPorRol() {
    const eventForm = document.getElementById("eventForm");

    const showEventFormButton = document.getElementById(
      "showEventFormButton"
    );

    const eventDetailSection = document.getElementById(
      "eventDetailSection"
    );

    const scheduleSectionLabel = document.getElementById(
      "scheduleSectionLabel"
    );

    const scheduleDescription = document.getElementById(
      "scheduleDescription"
    );

    /*
     * ADMINISTRADOR
     */

    if (rol === "ADMIN") {
      if (scheduleSectionLabel) {
        scheduleSectionLabel.textContent = "Administración";
      }

      if (scheduleDescription) {
        scheduleDescription.textContent =
          "Consulta y administra el calendario general de la academia.";
      }
    }

    /*
     * SECRETARIA
     */

    if (rol === "SECRETARIA") {
      if (scheduleSectionLabel) {
        scheduleSectionLabel.textContent = "Control";
      }

      if (scheduleDescription) {
        scheduleDescription.textContent =
          "Consulta el calendario semanal de clases y eventos.";
      }
    }

    /*
     * SENSEI
     */

    if (rol === "SENSEI") {
      if (scheduleSectionLabel) {
        scheduleSectionLabel.textContent = "Mi horario";
      }

      if (scheduleDescription) {
        scheduleDescription.textContent =
          "Consulta el calendario semanal de clases y tus grupos asignados.";
      }
    }

    /*
     * PERMISOS DE EVENTOS
     */

    if (!puedeGestionarEventos) {
      if (eventForm) {
        eventForm.hidden = true;
      }

      if (showEventFormButton) {
        showEventFormButton.hidden = true;
      }

      if (eventDetailSection) {
        eventDetailSection.hidden = true;
      }
    }
  }

  configurarInterfazPorRol();

  /*
   * ==========================================
   * ESPERAR MÓDULO DE EVENTOS
   * ==========================================
   */

  if (puedeGestionarEventos) {
    await esperarModuloEventos();
  }

  /*
   * ==========================================
   * EXPONER API DEL CALENDARIO
   * ==========================================
   */

  window.KihonHorario = {
    recargarCalendario: cargarDatosCalendario,

    obtenerFechaSemana: function () {
      return new Date(fechaSemana);
    },

    obtenerFechaActual: function () {
      return new Date(fechaActual);
    },

    obtenerFechaISO: obtenerFechaISO,

    obtenerRol: function () {
      return rol;
    },
  };

  /*
   * ==========================================
   * OBTENER LUNES DE LA SEMANA
   * ==========================================
   */

  function obtenerLunes(fecha) {
    const resultado = new Date(fecha);

    const dia = resultado.getDay();

    const diferencia = dia === 0 ? -6 : 1 - dia;

    resultado.setDate(resultado.getDate() + diferencia);

    resultado.setHours(0, 0, 0, 0);

    return resultado;
  }

  /*
   * ==========================================
   * FORMATEAR FECHA CORTA
   * ==========================================
   */

  function formatearFechaCorta(fecha) {
    return fecha.toLocaleDateString("es-PE", {
      day: "numeric",
    });
  }

  /*
   * ==========================================
   * FORMATO ISO
   * ==========================================
   */

  function obtenerFechaISO(fecha) {
    const year = fecha.getFullYear();

    const month = String(fecha.getMonth() + 1).padStart(2, "0");

    const day = String(fecha.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  /*
   * ==========================================
   * ESPERAR MÓDULO DE EVENTOS
   * ==========================================
   */

  function esperarModuloEventos() {
    return new Promise((resolve) => {
      if (window.KihonEventos && window.KihonEventos.ready) {
        resolve();
        return;
      }

      window.addEventListener(
        "kihonEventosReady",
        function () {
          resolve();
        },
        {
          once: true,
        }
      );
    });
  }

  /*
   * ==========================================
   * MOSTRAR MENSAJE
   * ==========================================
   */

  function mostrarMensaje(mensaje, tipo = "error") {
    scheduleMessage.textContent = mensaje;

    scheduleMessage.hidden = false;

    scheduleMessage.className =
      tipo === "success"
        ? "horario-message horario-message--success"
        : "horario-message horario-message--error";
  }

  /*
   * ==========================================
   * OCULTAR MENSAJE
   * ==========================================
   */

  function ocultarMensaje() {
    scheduleMessage.hidden = true;

    scheduleMessage.textContent = "";

    scheduleMessage.className = "horario-message";
  }

  /*
   * ==========================================
   * CARGAR HORARIOS
   * ==========================================
   */

  async function cargarHorarios() {
    try {
      const response = await solicitar("/api/grupo-horarios", {
        method: "GET",
      });

      if (response.status === 403) {
        throw new Error("No tienes permisos para consultar el horario.");
      }

      if (!response.ok) {
        throw new Error("No se pudo obtener el horario.");
      }

      horarios = await response.json();

      if (!Array.isArray(horarios)) {
        throw new Error("La respuesta de horarios no tiene un formato válido.");
      }
    } catch (error) {
      console.error("Error cargando horario:", error);

      throw error;
    }
  }

  /*
   * ==========================================
   * CARGAR EVENTOS
   * ==========================================
   */

  async function cargarEventos() {
    if (!puedeGestionarEventos) {
      return;
    }

    await window.KihonEventos.cargarEventos(fechaSemana);
  }

  /*
   * ==========================================
   * CARGAR TODO
   * ==========================================
   */

  async function cargarDatosCalendario() {
    try {
      ocultarMensaje();

      scheduleCalendar.innerHTML = `
        <div class="horario-loading">
          Cargando horario...
        </div>
      `;

      await Promise.all([
        cargarHorarios(),
        cargarEventos(),
      ]);

      renderizarCalendario();

    } catch (error) {
      console.error("Error cargando calendario:", error);

      scheduleCalendar.innerHTML = `
        <div class="horario-empty">
          ${error.message}
        </div>
      `;

      mostrarMensaje(error.message, "error");
    }
  }

  /*
   * ==========================================
   * CREAR CALENDARIO
   * ==========================================
   */

  function renderizarCalendario() {
    const diasSemana = [];

    for (let i = 0; i < 7; i++) {
      const fecha = new Date(fechaSemana);

      fecha.setDate(fechaSemana.getDate() + i);

      diasSemana.push(fecha);
    }

    const inicio = diasSemana[0];

    const fin = diasSemana[6];

    weekLabel.textContent =
      `${formatearFechaCorta(inicio)} - ` +
      `${formatearFechaCorta(fin)} de ` +
      `${fin.toLocaleDateString("es-PE", {
        month: "long",
        year: "numeric",
      })}`;

    let html = `
      <div class="horario-grid">

        <div class="
          horario-grid__header
          horario-grid__time
        ">
        </div>
    `;

    diasSemana.forEach((fecha, indice) => {
      const esHoy =
        obtenerFechaISO(fecha) === obtenerFechaISO(new Date());

      html += `
        <div class="
          horario-grid__header
          horario-grid__day
          ${esHoy ? "horario-grid__day--today" : ""}
        ">

          <span class="horario-day-name">
            ${NOMBRES_DIAS[indice]}
          </span>

          <span class="horario-day-number">
            ${fecha.getDate()}
          </span>

        </div>
      `;
    });

    for (let hora = HORA_INICIO; hora <= HORA_FIN; hora++) {
      html += `
        <div class="
          horario-grid__time
          horario-grid__row
        ">
          ${String(hora).padStart(2, "0")}:00
        </div>
      `;

      for (let dia = 0; dia < 7; dia++) {
        const fecha = diasSemana[dia];

        const esHoy =
          obtenerFechaISO(fecha) === obtenerFechaISO(new Date());

        html += `
          <div
            class="
              horario-grid__cell
              ${esHoy ? "horario-grid__cell--today" : ""}
            "
            data-dia="${DIAS[dia]}"
            data-hora="${hora}"
          >
        `;

        const clases = obtenerClasesParaCelda(DIAS[dia], hora);

        clases.forEach((clase) => {
          html += crearBloqueClase(clase, hora);
        });

        /*
         * EVENTOS
         * Solo ADMIN y SECRETARIA pueden gestionarlos.
         */

        if (puedeGestionarEventos) {
          const eventosCelda =
            window.KihonEventos.obtenerEventosParaCelda(fecha, hora);

          eventosCelda.forEach((evento) => {
            html += window.KihonEventos.crearBloqueEvento(evento, hora);
          });
        }

        html += `
          </div>
        `;
      }
    }

    html += `
      </div>
    `;

    scheduleCalendar.innerHTML = html;
  }

  /*
   * ==========================================
   * CLIC EN EVENTOS
   * ==========================================
   */

  scheduleCalendar.addEventListener("click", function (event) {
    if (!puedeGestionarEventos) {
      return;
    }

    const eventoElement = event.target.closest("[data-evento-id]");

    if (!eventoElement) {
      return;
    }

    const eventoId = Number(eventoElement.dataset.eventoId);

    window.KihonEventos.mostrarDetalleEvento(eventoId);
  });

  /*
   * ==========================================
   * OBTENER CLASES PARA UNA CELDA
   * ==========================================
   */

  function obtenerClasesParaCelda(diaSemana, hora) {
    return horarios.filter((horario) => {
      if (horario.diaSemana !== diaSemana) {
        return false;
      }

      const horaInicio = parseInt(
        horario.horaInicio.substring(0, 2),
        10
      );

      const horaFin = parseInt(
        horario.horaFin.substring(0, 2),
        10
      );

      return hora >= horaInicio && hora < horaFin;
    });
  }

  /*
   * ==========================================
   * CREAR BLOQUE DE CLASE
   * ==========================================
   */

  function crearBloqueClase(clase, horaActual) {
    const horaInicio = clase.horaInicio.substring(0, 5);

    const horaFin = clase.horaFin.substring(0, 5);

    const inicioHora = parseInt(
      clase.horaInicio.substring(0, 2),
      10
    );

    if (horaActual !== inicioHora) {
      return "";
    }

    return `
      <div
        class="horario-evento"
        data-horario-id="${clase.id}"
      >

        <strong class="horario-evento__nombre">
          ${clase.grupoNombre}
        </strong>

        <span class="horario-evento__hora">
          ${horaInicio} - ${horaFin}
        </span>

        <span class="horario-evento__sensei">
          ${clase.senseiNombre || "Sin Sensei"}
        </span>

      </div>
    `;
  }

  /*
   * ==========================================
   * OCULTAR DETALLE DE EVENTO
   * ==========================================
   */

  function ocultarDetalleEvento() {
    if (
      puedeGestionarEventos &&
      window.KihonEventos &&
      typeof window.KihonEventos.ocultarDetalle === "function"
    ) {
      window.KihonEventos.ocultarDetalle();
    }
  }

  /*
   * ==========================================
   * SEMANA ANTERIOR
   * ==========================================
   */

  previousWeekButton.addEventListener("click", async function () {
    fechaSemana.setDate(fechaSemana.getDate() - 7);

    ocultarDetalleEvento();

    await cargarDatosCalendario();
  });

  /*
   * ==========================================
   * SEMANA SIGUIENTE
   * ==========================================
   */

  nextWeekButton.addEventListener("click", async function () {
    fechaSemana.setDate(fechaSemana.getDate() + 7);

    ocultarDetalleEvento();

    await cargarDatosCalendario();
  });

  /*
   * ==========================================
   * HOY
   * ==========================================
   */

  todayButton.addEventListener("click", async function () {
    fechaActual = new Date();

    fechaSemana = obtenerLunes(fechaActual);

    ocultarDetalleEvento();

    await cargarDatosCalendario();
  });

  /*
   * ==========================================
   * CARGA INICIAL
   * ==========================================
   */

  await cargarDatosCalendario();
});