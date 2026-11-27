
document.addEventListener("DOMContentLoaded", function () {

  // ==========================================
  // AUTENTICACIÓN Y AUTORIZACIÓN
  // ==========================================

  const username = sessionStorage.getItem("kihonUsername");
  const rol = sessionStorage.getItem("kihonRol");

  const rolesPermitidos = [
    "ADMIN",
    "SECRETARIA",
    "SENSEI"
  ];

  if (!username || !rol) {
    window.location.href = "/login";
    return;
  }

  if (!rolesPermitidos.includes(rol.toUpperCase())) {
    window.location.href = "/login";
    return;
  }


  // ==========================================
  // ELEMENTOS DEL DOM
  // ==========================================

  const elementos = {

    tipoReporte: document.getElementById("tipoReporte"),
    reporteFiltros: document.getElementById("reporteFiltros"),
    generarReporteBtn: document.getElementById("generarReporteBtn"),
    reporteMessage: document.getElementById("reporteMessage"),
    reporteResultado: document.getElementById("reporteResultado"),
    reportePeriodo: document.getElementById("reportePeriodo"),
    reporteResumen: document.getElementById("reporteResumen"),
    reporteDetalle: document.getElementById("reporteDetalle"),

    distribucionCanvas: document.getElementById(
      "reporteDistribucionChart"
    ),

    evolucionCanvas: document.getElementById(
      "reporteEvolucionChart"
    ),

    evolucionTitulo: document.getElementById(
      "reporteEvolucionTitulo"
    ),

    evolucionDescripcion: document.getElementById(
      "reporteEvolucionDescripcion"
    )

  };


  // ==========================================
  // VALIDAR ELEMENTOS PRINCIPALES
  // ==========================================

  const elementosObligatorios = [
    "tipoReporte",
    "reporteFiltros",
    "generarReporteBtn",
    "reporteMessage",
    "reporteResultado",
    "reportePeriodo",
    "reporteResumen",
    "reporteDetalle"
  ];

  const elementosFaltantes = elementosObligatorios.filter(
    (elemento) => !elementos[elemento]
  );

  if (elementosFaltantes.length > 0) {

    console.error(
      "No se encontraron los siguientes elementos del DOM:",
      elementosFaltantes
    );

    return;

  }


  // ==========================================
  // ESTADO
  // ==========================================

  let estudiantes = [];
  let grupos = [];

  let estudianteSeleccionado = null;
  let grupoSeleccionado = null;

  let estudiantesCargados = false;
  let gruposCargados = false;

  let distribucionChart = null;
  let evolucionChart = null;


  // ==========================================
  // CONFIGURACIÓN DE GRÁFICOS
  // ==========================================

  const colores = {

    presente: "#22C55E",
    tardanza: "#F59E0B",
    ausente: "#EF4444",
    justificado: "#3B82F6",

    rojo: "#FF2400",
    amarillo: "#FFD700",

    texto: "#64748B",
    grid: "rgba(148, 163, 184, 0.15)"

  };

  const estados = [

    {
      clave: "PRESENTE",
      nombre: "Presentes",
      color: colores.presente
    },

    {
      clave: "TARDANZA",
      nombre: "Tardanzas",
      color: colores.tardanza
    },

    {
      clave: "AUSENTE",
      nombre: "Ausentes",
      color: colores.ausente
    },

    {
      clave: "JUSTIFICADO",
      nombre: "Justificados",
      color: colores.justificado
    }

  ];


  // ==========================================
  // AUTENTICACIÓN DE SESIÓN Y CSRF
  // ==========================================

  function cerrarSesion() {

    sessionStorage.removeItem("kihonUsername");
    sessionStorage.removeItem("kihonRol");
    sessionStorage.removeItem("kihonAuth");

    window.location.href = "/login";

  }


  async function obtenerTokenCSRF() {

    const response = await fetch("/api/auth/csrf", {

      method: "GET",

      credentials: "same-origin",

      headers: {
        Accept: "application/json"
      }

    });

    if (response.status === 401) {
      cerrarSesion();
      throw new Error("Sesión expirada.");
    }

    if (!response.ok) {

      throw new Error(
        "No se pudo obtener el token CSRF."
      );

    }

    const data = await response.json();

    return data.token;

  }


  async function solicitar(url, opciones = {}) {

    const metodo = (opciones.method || "GET").toUpperCase();

    const headers = new Headers(opciones.headers || {});

    headers.delete("Authorization");

    headers.set("Accept", "application/json");

    const metodosSeguros = [
      "GET",
      "HEAD",
      "OPTIONS",
      "TRACE"
    ];

    if (!metodosSeguros.includes(metodo)) {

      const csrfToken = await obtenerTokenCSRF();

      headers.set("X-CSRF-TOKEN", csrfToken);

    }

    const response = await fetch(url, {

      ...opciones,

      method: metodo,

      credentials: "same-origin",

      headers

    });

    if (response.status === 401) {

      cerrarSesion();

      throw new Error("Sesión expirada.");

    }

    return response;

  }


  // ==========================================
  // UTILIDADES
  // ==========================================

  function mostrarMensaje(mensaje, tipo = "error") {

    elementos.reporteMessage.textContent = mensaje;

    elementos.reporteMessage.hidden = false;

    elementos.reporteMessage.className =
      `reportes-message reportes-message--${tipo}`;

  }


  function ocultarMensaje() {

    elementos.reporteMessage.textContent = "";

    elementos.reporteMessage.hidden = true;

  }


  function obtenerFechaActual() {

    const ahora = new Date();

    const anio = ahora.getFullYear();

    const mes = String(ahora.getMonth() + 1).padStart(2, "0");

    const dia = String(ahora.getDate()).padStart(2, "0");

    return `${anio}-${mes}-${dia}`;

  }


  function formatoFecha(fecha) {

    if (!fecha) {
      return "-";
    }

    const partes = String(fecha).split("-");

    if (partes.length !== 3) {
      return fecha;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;

  }


  function formatoPorcentaje(valor) {

    if (
      valor === null ||
      valor === undefined ||
      !Number.isFinite(Number(valor))
    ) {
      return "0.00%";
    }

    return `${Number(valor).toFixed(2)}%`;

  }


  function escaparHTML(valor) {

    return String(valor ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  }


  function normalizarEstado(estado) {

    return String(estado || "")
      .trim()
      .toUpperCase();

  }


  function obtenerEstado(asistencia) {

    return normalizarEstado(asistencia.estado);

  }


  function obtenerFechaOrdenable(fecha) {

    if (!fecha) {
      return "";
    }

    return String(fecha);

  }


  function obtenerNombreEstudiante(estudiante) {

    if (estudiante.nombreCompleto) {
      return estudiante.nombreCompleto;
    }

    const nombre = estudiante.nombre || "";

    const apellido = estudiante.apellido || "";

    return `${nombre} ${apellido}`.trim();

  }


  function obtenerNombreGrupo(grupo) {

    return grupo.nombre || "";

  }


  function obtenerAsistencias(data) {

    return Array.isArray(data.asistencias)
      ? data.asistencias
      : [];

  }


  function contarEstados(asistencias) {

    const conteo = {
      total: asistencias.length,
      presentes: 0,
      tardanzas: 0,
      ausentes: 0,
      justificados: 0
    };

    asistencias.forEach((asistencia) => {

      const estado = obtenerEstado(asistencia);

      switch (estado) {

        case "PRESENTE":
          conteo.presentes++;
          break;

        case "TARDANZA":
          conteo.tardanzas++;
          break;

        case "AUSENTE":
          conteo.ausentes++;
          break;

        case "JUSTIFICADO":
          conteo.justificados++;
          break;

      }

    });

    return conteo;

  }


  // ==========================================
  // PORCENTAJE DE ASISTENCIA
  // ==========================================

  function obtenerPorcentaje(data, conteo) {

    const totalComputable =
      conteo.total - conteo.justificados;

    if (totalComputable <= 0) {
      return 0;
    }

    return (
      (conteo.presentes + conteo.tardanzas) /
      totalComputable
    ) * 100;

  }


  function obtenerEtiquetaEstado(estado) {

    const etiquetas = {

      PRESENTE: "Presente",
      TARDANZA: "Tardanza",
      AUSENTE: "Ausente",
      JUSTIFICADO: "Justificado"

    };

    return etiquetas[normalizarEstado(estado)] || "Sin estado";

  }


  // ==========================================
  // CARGAR ESTUDIANTES
  // ==========================================

  async function cargarEstudiantes() {

    if (estudiantesCargados) {
      return;
    }

    const response = await solicitar(
      "/api/estudiantes?estado=ACTIVO",
      {
        method: "GET"
      }
    );

    if (response.status === 403) {

      throw new Error(
        "No tienes permisos para consultar los estudiantes."
      );

    }

    if (!response.ok) {

      throw new Error(
        "No se pudieron cargar los estudiantes."
      );

    }

    const data = await response.json();

    estudiantes = Array.isArray(data) ? data : [];

    estudiantesCargados = true;

  }


  // ==========================================
  // CARGAR GRUPOS
  // ==========================================

  async function cargarGrupos() {

    if (gruposCargados) {
      return;
    }

    const response = await solicitar(
      "/api/grupos?estado=ACTIVO",
      {
        method: "GET"
      }
    );

    if (response.status === 403) {

      throw new Error(
        "No tienes permisos para consultar los grupos."
      );

    }

    if (!response.ok) {

      throw new Error(
        "No se pudieron cargar los grupos."
      );

    }

    const data = await response.json();

    grupos = Array.isArray(data) ? data : [];

    gruposCargados = true;

  }


  // ==========================================
  // CARGAR FILTROS DINÁMICOS
  // ==========================================

  async function cargarFiltros() {

    const tipo = elementos.tipoReporte.value;

    elementos.reporteFiltros.innerHTML = "";

    estudianteSeleccionado = null;

    grupoSeleccionado = null;

    elementos.reporteResultado.hidden = true;

    ocultarMensaje();

    destruirGraficos();


    // ======================================
    // DIARIO
    // ======================================

    if (tipo === "diario") {

      elementos.reporteFiltros.innerHTML = `

        <div class="form-group">

          <label
            for="fechaReporte"
            class="form-label"
          >
            Fecha
          </label>

          <input
            type="date"
            id="fechaReporte"
            class="form-input"
            required
          >

        </div>

      `;

      document.getElementById(
        "fechaReporte"
      ).value = obtenerFechaActual();

    }


    // ======================================
    // SEMANAL
    // ======================================

    if (tipo === "semanal") {

      elementos.reporteFiltros.innerHTML = `

        <div class="grid grid--2">

          <div class="form-group">

            <label
              for="fechaInicio"
              class="form-label"
            >
              Fecha de inicio
            </label>

            <input
              type="date"
              id="fechaInicio"
              class="form-input"
              required
            >

          </div>

          <div class="form-group">

            <label
              for="fechaFin"
              class="form-label"
            >
              Fecha de fin
            </label>

            <input
              type="date"
              id="fechaFin"
              class="form-input"
              required
            >

          </div>

        </div>

      `;

      const hoy = obtenerFechaActual();

      document.getElementById("fechaInicio").value = hoy;

      document.getElementById("fechaFin").value = hoy;

    }


    // ======================================
    // MENSUAL
    // ======================================

    if (tipo === "mensual") {

      const fechaActual = new Date();

      const anioActual = fechaActual.getFullYear();

      const mesActual = fechaActual.getMonth() + 1;

      elementos.reporteFiltros.innerHTML = `

        <div class="grid grid--2">

          <div class="form-group">

            <label
              for="anioReporte"
              class="form-label"
            >
              Año
            </label>

            <input
              type="number"
              id="anioReporte"
              class="form-input"
              min="2000"
              max="2100"
              required
            >

          </div>

          <div class="form-group">

            <label
              for="mesReporte"
              class="form-label"
            >
              Mes
            </label>

            <select
              id="mesReporte"
              class="form-select"
              required
            >

              <option value="1">Enero</option>
              <option value="2">Febrero</option>
              <option value="3">Marzo</option>
              <option value="4">Abril</option>
              <option value="5">Mayo</option>
              <option value="6">Junio</option>
              <option value="7">Julio</option>
              <option value="8">Agosto</option>
              <option value="9">Septiembre</option>
              <option value="10">Octubre</option>
              <option value="11">Noviembre</option>
              <option value="12">Diciembre</option>

            </select>

          </div>

        </div>

      `;

      document.getElementById(
        "anioReporte"
      ).value = anioActual;

      document.getElementById(
        "mesReporte"
      ).value = mesActual;

    }


    // ======================================
    // ESTUDIANTE
    // ======================================

    if (tipo === "estudiante") {

      try {

        await cargarEstudiantes();

      } catch (error) {

        mostrarMensaje(error.message);

        return;

      }

      elementos.reporteFiltros.innerHTML = `

        <div class="form-group">

          <label
            for="buscarEstudiante"
            class="form-label"
          >
            Buscar estudiante
          </label>

          <input
            type="text"
            id="buscarEstudiante"
            class="form-input"
            placeholder="Escribe el nombre del estudiante..."
            autocomplete="off"
          >

        </div>

        <div
          id="estudiantesResultados"
          class="reporte-busqueda-resultados"
        ></div>

        <div
          id="estudianteSeleccionado"
          class="reporte-seleccion"
        >
          Ningún estudiante seleccionado.
        </div>

      `;

      const buscar = document.getElementById(
        "buscarEstudiante"
      );

      buscar.addEventListener(
        "focus",
        filtrarEstudiantes
      );

      buscar.addEventListener(
        "input",
        filtrarEstudiantes
      );

    }


    // ======================================
    // GRUPO
    // ======================================

    if (tipo === "grupo") {

      try {

        await cargarGrupos();

      } catch (error) {

        mostrarMensaje(error.message);

        return;

      }

      elementos.reporteFiltros.innerHTML = `

        <div class="form-group">

          <label
            for="buscarGrupo"
            class="form-label"
          >
            Buscar grupo
          </label>

          <input
            type="text"
            id="buscarGrupo"
            class="form-input"
            placeholder="Escribe el nombre del grupo..."
            autocomplete="off"
          >

        </div>

        <div
          id="gruposResultados"
          class="reporte-busqueda-resultados"
        ></div>

        <div
          id="grupoSeleccionado"
          class="reporte-seleccion"
        >
          Ningún grupo seleccionado.
        </div>

      `;

      const buscar = document.getElementById(
        "buscarGrupo"
      );

      buscar.addEventListener(
        "focus",
        filtrarGrupos
      );

      buscar.addEventListener(
        "input",
        filtrarGrupos
      );

    }

  }


  // ==========================================
  // FILTRAR ESTUDIANTES
  // ==========================================

  function filtrarEstudiantes() {

    const input = document.getElementById(
      "buscarEstudiante"
    );

    const resultados = document.getElementById(
      "estudiantesResultados"
    );

    const texto = input.value.trim().toLowerCase();

    estudianteSeleccionado = null;

    document.getElementById(
      "estudianteSeleccionado"
    ).textContent = "Ningún estudiante seleccionado.";

    const encontrados = texto
      ? estudiantes.filter((estudiante) => {

        const nombre = obtenerNombreEstudiante(
          estudiante
        ).toLowerCase();

        const documento = String(
          estudiante.numeroDocumento || ""
        ).toLowerCase();

        return (
          nombre.includes(texto) ||
          documento.includes(texto)
        );

      })
      : estudiantes;

    if (encontrados.length === 0) {

      resultados.innerHTML = `

        <div class="reporte-busqueda-vacio">

          No se encontraron estudiantes.

        </div>

      `;

      return;

    }

    resultados.innerHTML = encontrados.map(
      (estudiante) => `

        <button
          type="button"
          class="reporte-busqueda-item"
          data-estudiante-id="${Number(estudiante.id)}"
        >
          ${escaparHTML(obtenerNombreEstudiante(estudiante))}
        </button>

      `
    ).join("");

    resultados.querySelectorAll(
      ".reporte-busqueda-item"
    ).forEach((boton) => {

      boton.addEventListener("click", () => {

        seleccionarEstudiante(
          Number(boton.dataset.estudianteId)
        );

      });

    });

  }


  // ==========================================
  // SELECCIONAR ESTUDIANTE
  // ==========================================

  function seleccionarEstudiante(id) {

    estudianteSeleccionado = estudiantes.find(
      (estudiante) => Number(estudiante.id) === id
    );

    if (!estudianteSeleccionado) {
      return;
    }

    const nombre = obtenerNombreEstudiante(
      estudianteSeleccionado
    );

    document.getElementById(
      "buscarEstudiante"
    ).value = nombre;

    document.getElementById(
      "estudianteSeleccionado"
    ).textContent = `Estudiante seleccionado: ${nombre}`;

    document.getElementById(
      "estudiantesResultados"
    ).innerHTML = "";

  }


  // ==========================================
  // FILTRAR GRUPOS
  // ==========================================

  function filtrarGrupos() {

    const input = document.getElementById(
      "buscarGrupo"
    );

    const resultados = document.getElementById(
      "gruposResultados"
    );

    const texto = input.value.trim().toLowerCase();

    grupoSeleccionado = null;

    document.getElementById(
      "grupoSeleccionado"
    ).textContent = "Ningún grupo seleccionado.";

    const encontrados = texto
      ? grupos.filter((grupo) => {

        const nombre = obtenerNombreGrupo(
          grupo
        ).toLowerCase();

        return nombre.includes(texto);

      })
      : grupos;

    if (encontrados.length === 0) {

      resultados.innerHTML = `

        <div class="reporte-busqueda-vacio">

          No se encontraron grupos.

        </div>

      `;

      return;

    }

    resultados.innerHTML = encontrados.map(
      (grupo) => `

        <button
          type="button"
          class="reporte-busqueda-item"
          data-grupo-id="${Number(grupo.id)}"
        >
          ${escaparHTML(obtenerNombreGrupo(grupo))}
        </button>

      `
    ).join("");

    resultados.querySelectorAll(
      ".reporte-busqueda-item"
    ).forEach((boton) => {

      boton.addEventListener("click", () => {

        seleccionarGrupo(
          Number(boton.dataset.grupoId)
        );

      });

    });

  }


  // ==========================================
  // SELECCIONAR GRUPO
  // ==========================================

  function seleccionarGrupo(id) {

    grupoSeleccionado = grupos.find(
      (grupo) => Number(grupo.id) === id
    );

    if (!grupoSeleccionado) {
      return;
    }

    const nombre = obtenerNombreGrupo(
      grupoSeleccionado
    );

    document.getElementById(
      "buscarGrupo"
    ).value = nombre;

    document.getElementById(
      "grupoSeleccionado"
    ).textContent = `Grupo seleccionado: ${nombre}`;

    document.getElementById(
      "gruposResultados"
    ).innerHTML = "";

  }


  // ==========================================
  // GENERAR URL DEL REPORTE
  // ==========================================

  function obtenerURLReporte() {

    const tipo = elementos.tipoReporte.value;

    let url = "";


    // ======================================
    // DIARIO
    // ======================================

    if (tipo === "diario") {

      const fecha = document.getElementById(
        "fechaReporte"
      ).value;

      if (!fecha) {

        throw new Error(
          "Selecciona una fecha."
        );

      }

      url = `/api/reportes/asistencias/diario?fecha=${encodeURIComponent(fecha)}`;

    }


    // ======================================
    // SEMANAL
    // ======================================

    if (tipo === "semanal") {

      const inicio = document.getElementById(
        "fechaInicio"
      ).value;

      const fin = document.getElementById(
        "fechaFin"
      ).value;

      if (!inicio || !fin) {

        throw new Error(
          "Selecciona las fechas de inicio y fin."
        );

      }

      if (inicio > fin) {

        throw new Error(
          "La fecha de inicio no puede ser posterior a la fecha de fin."
        );

      }

      url =
        `/api/reportes/asistencias/semanal?inicio=${encodeURIComponent(inicio)}&fin=${encodeURIComponent(fin)}`;

    }


    // ======================================
    // MENSUAL
    // ======================================

    if (tipo === "mensual") {

      const anio = Number(
        document.getElementById("anioReporte").value
      );

      const mes = Number(
        document.getElementById("mesReporte").value
      );

      if (!anio || !mes) {

        throw new Error(
          "Selecciona el año y el mes."
        );

      }

      if (
        !Number.isInteger(anio) ||
        anio < 2000 ||
        anio > 2100
      ) {

        throw new Error(
          "Ingresa un año válido."
        );

      }

      if (
        !Number.isInteger(mes) ||
        mes < 1 ||
        mes > 12
      ) {

        throw new Error(
          "Selecciona un mes válido."
        );

      }

      url =
        `/api/reportes/asistencias/mensual?anio=${anio}&mes=${mes}`;

    }


    // ======================================
    // ESTUDIANTE
    // ======================================

    if (tipo === "estudiante") {

      if (!estudianteSeleccionado) {

        throw new Error(
          "Selecciona un estudiante de la lista."
        );

      }

      url =
        `/api/reportes/asistencias/estudiante/${estudianteSeleccionado.id}`;

    }


    // ======================================
    // GRUPO
    // ======================================

    if (tipo === "grupo") {

      if (!grupoSeleccionado) {

        throw new Error(
          "Selecciona un grupo de la lista."
        );

      }

      url =
        `/api/reportes/asistencias/grupo/${grupoSeleccionado.id}`;

    }

    return url;

  }


  // ==========================================
  // GENERAR REPORTE
  // ==========================================

  async function generarReporte() {

    ocultarMensaje();

    let url;

    try {

      url = obtenerURLReporte();

    } catch (error) {

      mostrarMensaje(error.message);

      return;

    }

    const tipo = elementos.tipoReporte.value;

    elementos.generarReporteBtn.disabled = true;

    elementos.generarReporteBtn.textContent = "Generando...";

    try {

      const response = await solicitar(url, {
        method: "GET"
      });

      if (response.status === 403) {

        mostrarMensaje(
          "No tienes permisos para consultar este reporte."
        );

        return;

      }

      if (!response.ok) {

        let mensaje = "No se pudo generar el reporte.";

        try {

          const error = await response.json();

          mensaje =
            error.mensaje ||
            error.message ||
            mensaje;

        } catch (error) {
          // La respuesta no contiene JSON válido.
        }

        mostrarMensaje(mensaje);

        return;

      }

      const data = await response.json();

      mostrarReporte(data, tipo);

    } catch (error) {

      console.error(
        "Error al generar el reporte:",
        error
      );

      mostrarMensaje(
        error.message === "Sesión expirada."
          ? error.message
          : "Error de conexión con el servidor."
      );

    } finally {

      elementos.generarReporteBtn.disabled = false;

      elementos.generarReporteBtn.textContent =
        "Generar reporte";

    }

  }


  // ==========================================
  // MOSTRAR REPORTE
  // ==========================================

  function mostrarReporte(data, tipo) {

    if (!data || typeof data !== "object") {

      mostrarMensaje(
        "El servidor devolvió una respuesta inválida."
      );

      return;

    }

    const asistencias = obtenerAsistencias(data);

    const conteo = contarEstados(asistencias);

    const porcentaje = obtenerPorcentaje(
      data,
      conteo
    );

    mostrarPeriodo(data, tipo);

    mostrarResumen(conteo, porcentaje);

    mostrarGraficos(asistencias, tipo);

    mostrarDetalle(asistencias);

    elementos.reporteResultado.hidden = false;

  }


  // ==========================================
  // MOSTRAR PERIODO
  // ==========================================

  function mostrarPeriodo(data, tipo) {

    let periodo = "";

    if (tipo === "diario") {

      periodo =
        `Fecha: ${formatoFecha(data.fechaInicio)}`;

    } else if (tipo === "semanal") {

      periodo =
        `Periodo: ${formatoFecha(data.fechaInicio)} - ${formatoFecha(data.fechaFin)}`;

    } else if (tipo === "mensual") {

      periodo =
        `Periodo: ${formatoFecha(data.fechaInicio)} - ${formatoFecha(data.fechaFin)}`;

    } else if (tipo === "estudiante") {

      const nombre = estudianteSeleccionado
        ? obtenerNombreEstudiante(estudianteSeleccionado)
        : "Estudiante";

      if (data.fechaInicio && data.fechaFin) {

        periodo =
          `${nombre} · ${formatoFecha(data.fechaInicio)} - ${formatoFecha(data.fechaFin)}`;

      } else {

        periodo = nombre;

      }

    } else if (tipo === "grupo") {

      const nombre = grupoSeleccionado
        ? obtenerNombreGrupo(grupoSeleccionado)
        : "Grupo";

      if (data.fechaInicio && data.fechaFin) {

        periodo =
          `${nombre} · ${formatoFecha(data.fechaInicio)} - ${formatoFecha(data.fechaFin)}`;

      } else {

        periodo = nombre;

      }

    }

    elementos.reportePeriodo.textContent = periodo || "-";

  }


  // ==========================================
  // MOSTRAR INDICADORES KPI
  // ==========================================

  function mostrarResumen(conteo, porcentaje) {

    const indicadores = [

      {
        clase: "total",
        etiqueta: "Total de registros",
        valor: conteo.total
      },

      {
        clase: "presente",
        etiqueta: "Presentes",
        valor: conteo.presentes
      },

      {
        clase: "tardanza",
        etiqueta: "Tardanzas",
        valor: conteo.tardanzas
      },

      {
        clase: "ausente",
        etiqueta: "Ausentes",
        valor: conteo.ausentes
      },

      {
        clase: "justificado",
        etiqueta: "Justificados",
        valor: conteo.justificados
      },

      {
        clase: "percentage",
        etiqueta: "Porcentaje de asistencia",
        valor: formatoPorcentaje(porcentaje)
      }

    ];

    elementos.reporteResumen.innerHTML = indicadores.map(
      (indicador) => `

        <article class="
          reporte-stat
          reporte-stat--${indicador.clase}
        ">

          <span class="reporte-stat__label">
            ${escaparHTML(indicador.etiqueta)}
          </span>

          <strong class="reporte-stat__value">
            ${escaparHTML(indicador.valor)}
          </strong>

        </article>

      `
    ).join("");

  }


  // ==========================================
  // DESTRUIR GRÁFICOS ANTERIORES
  // ==========================================

  function destruirGraficos() {

    if (distribucionChart) {

      distribucionChart.destroy();

      distribucionChart = null;

    }

    if (evolucionChart) {

      evolucionChart.destroy();

      evolucionChart = null;

    }

  }


  // ==========================================
  // CONFIGURACIÓN COMÚN DE GRÁFICOS
  // ==========================================

  function opcionesGrafico() {

    return {

      responsive: true,

      maintainAspectRatio: false,

      plugins: {

        legend: {

          position: "bottom",

          labels: {

            usePointStyle: true,

            padding: 18,

            color: colores.texto,

            font: {
              family: "Inter",
              size: 12
            }

          }

        },

        tooltip: {

          enabled: true

        }

      }

    };

  }


  // ==========================================
  // GRÁFICO DE DISTRIBUCIÓN
  // ==========================================

  function crearGraficoDistribucion(asistencias) {

    const conteo = contarEstados(asistencias);

    const datos = [

      conteo.presentes,
      conteo.tardanzas,
      conteo.ausentes,
      conteo.justificados

    ];

    const configuracion = {

      type: "doughnut",

      data: {

        labels: [
          "Presentes",
          "Tardanzas",
          "Ausentes",
          "Justificados"
        ],

        datasets: [{

          data: datos,

          backgroundColor: [

            colores.presente,
            colores.tardanza,
            colores.ausente,
            colores.justificado

          ],

          borderWidth: 0,

          hoverOffset: 8

        }]

      },

      options: {

        ...opcionesGrafico(),

        cutout: "68%"

      }

    };

    distribucionChart = new Chart(
      elementos.distribucionCanvas,
      configuracion
    );

  }


  // ==========================================
  // AGRUPAR ASISTENCIAS POR FECHA
  // ==========================================

  function agruparPorFecha(asistencias) {

    const agrupados = new Map();

    asistencias.forEach((asistencia) => {

      const fecha = asistencia.fecha;

      if (!fecha) {
        return;
      }

      if (!agrupados.has(fecha)) {

        agrupados.set(fecha, {

          fecha,
          presentes: 0,
          tardanzas: 0,
          ausentes: 0,
          justificados: 0

        });

      }

      const registro = agrupados.get(fecha);

      switch (obtenerEstado(asistencia)) {

        case "PRESENTE":
          registro.presentes++;
          break;

        case "TARDANZA":
          registro.tardanzas++;
          break;

        case "AUSENTE":
          registro.ausentes++;
          break;

        case "JUSTIFICADO":
          registro.justificados++;
          break;

      }

    });

    return Array.from(agrupados.values()).sort(
      (a, b) => a.fecha.localeCompare(b.fecha)
    );

  }


  // ==========================================
  // GRÁFICO DIARIO
  // ==========================================

  function crearGraficoDiario(asistencias) {

    const conteo = contarEstados(asistencias);

    elementos.evolucionTitulo.textContent =
      "Comparación por estado";

    elementos.evolucionDescripcion.textContent =
      "Cantidad de registros según el estado de asistencia.";

    evolucionChart = new Chart(
      elementos.evolucionCanvas,
      {

        type: "bar",

        data: {

          labels: [
            "Presentes",
            "Tardanzas",
            "Ausentes",
            "Justificados"
          ],

          datasets: [{

            label: "Registros",

            data: [

              conteo.presentes,
              conteo.tardanzas,
              conteo.ausentes,
              conteo.justificados

            ],

            backgroundColor: [

              colores.presente,
              colores.tardanza,
              colores.ausente,
              colores.justificado

            ],

            borderRadius: 7,

            maxBarThickness: 55

          }]

        },

        options: {

          ...opcionesGrafico(),

          indexAxis: "y",

          plugins: {

            ...opcionesGrafico().plugins,

            legend: {
              display: false
            }

          },

          scales: {

            x: {

              beginAtZero: true,

              ticks: {
                precision: 0,
                color: colores.texto
              },

              grid: {
                color: colores.grid
              }

            },

            y: {

              ticks: {
                color: colores.texto
              },

              grid: {
                display: false
              }

            }

          }

        }

      }
    );

  }


  // ==========================================
  // GRÁFICO SEMANAL Y MENSUAL
  // ==========================================

  function crearGraficoTemporal(asistencias, tipo) {

    const registros = agruparPorFecha(asistencias);

    elementos.evolucionTitulo.textContent =
      tipo === "semanal"
        ? "Evolución semanal"
        : "Evolución mensual";

    elementos.evolucionDescripcion.textContent =
      "Cantidad de asistencias registradas por día.";

    evolucionChart = new Chart(
      elementos.evolucionCanvas,
      {

        type: "line",

        data: {

          labels: registros.map(
            (registro) => formatoFecha(registro.fecha)
          ),

          datasets: estados.map((estado) => {

            const clave = {

              PRESENTE: "presentes",
              TARDANZA: "tardanzas",
              AUSENTE: "ausentes",
              JUSTIFICADO: "justificados"

            }[estado.clave];

            return {

              label: estado.nombre,

              data: registros.map(
                (registro) => registro[clave]
              ),

              borderColor: estado.color,

              backgroundColor: estado.color,

              tension: 0.3,

              fill: false,

              pointRadius: 4,

              pointHoverRadius: 6

            };

          })

        },

        options: {

          ...opcionesGrafico(),

          interaction: {

            intersect: false,

            mode: "index"

          },

          scales: {

            x: {

              ticks: {
                color: colores.texto
              },

              grid: {
                display: false
              }

            },

            y: {

              beginAtZero: true,

              ticks: {
                precision: 0,
                color: colores.texto
              },

              grid: {
                color: colores.grid
              }

            }

          }

        }

      }
    );

  }


  // ==========================================
  // GRÁFICO POR ESTUDIANTE
  // ==========================================

  function crearGraficoEstudiante(asistencias) {

    const registros = agruparPorFecha(asistencias);

    elementos.evolucionTitulo.textContent =
      "Evolución de asistencia";

    elementos.evolucionDescripcion.textContent =
      "Historial de registros del estudiante por fecha.";

    evolucionChart = new Chart(
      elementos.evolucionCanvas,
      {

        type: "line",

        data: {

          labels: registros.map(
            (registro) => formatoFecha(registro.fecha)
          ),

          datasets: estados.map((estado) => {

            const clave = {

              PRESENTE: "presentes",
              TARDANZA: "tardanzas",
              AUSENTE: "ausentes",
              JUSTIFICADO: "justificados"

            }[estado.clave];

            return {

              label: estado.nombre,

              data: registros.map(
                (registro) => registro[clave]
              ),

              borderColor: estado.color,

              backgroundColor: estado.color,

              tension: 0.3,

              pointRadius: 4,

              pointHoverRadius: 6

            };

          })

        },

        options: {

          ...opcionesGrafico(),

          interaction: {

            intersect: false,

            mode: "index"

          },

          scales: {

            x: {

              ticks: {
                color: colores.texto
              },

              grid: {
                display: false
              }

            },

            y: {

              beginAtZero: true,

              ticks: {
                precision: 0,
                color: colores.texto,
                stepSize: 1
              },

              grid: {
                color: colores.grid
              }

            }

          }

        }

      }
    );

  }


  // ==========================================
  // AGRUPAR ASISTENCIAS POR ESTUDIANTE
  // ==========================================

  function agruparPorEstudiante(asistencias) {

    const agrupados = new Map();

    asistencias.forEach((asistencia) => {

      const id = asistencia.estudianteId;

      const nombre =
        asistencia.estudianteNombre ||
        `Estudiante ${id || ""}`;

      const clave = id ?? nombre;

      if (!agrupados.has(clave)) {

        agrupados.set(clave, {

          nombre,

          presentes: 0,
          tardanzas: 0,
          ausentes: 0,
          justificados: 0

        });

      }

      const registro = agrupados.get(clave);

      switch (obtenerEstado(asistencia)) {

        case "PRESENTE":
          registro.presentes++;
          break;

        case "TARDANZA":
          registro.tardanzas++;
          break;

        case "AUSENTE":
          registro.ausentes++;
          break;

        case "JUSTIFICADO":
          registro.justificados++;
          break;

      }

    });

    return Array.from(agrupados.values()).sort(
      (a, b) => a.nombre.localeCompare(b.nombre)
    );

  }


  // ==========================================
  // GRÁFICO POR GRUPO
  // ==========================================

  function crearGraficoGrupo(asistencias) {

    const registros = agruparPorEstudiante(asistencias);

    elementos.evolucionTitulo.textContent =
      "Comparación por estudiante";

    elementos.evolucionDescripcion.textContent =
      "Distribución de asistencias de cada estudiante del grupo.";

    evolucionChart = new Chart(
      elementos.evolucionCanvas,
      {

        type: "bar",

        data: {

          labels: registros.map(
            (registro) => registro.nombre
          ),

          datasets: estados.map((estado) => {

            const clave = {

              PRESENTE: "presentes",
              TARDANZA: "tardanzas",
              AUSENTE: "ausentes",
              JUSTIFICADO: "justificados"

            }[estado.clave];

            return {

              label: estado.nombre,

              data: registros.map(
                (registro) => registro[clave]
              ),

              backgroundColor: estado.color,

              borderRadius: 4

            };

          })

        },

        options: {

          ...opcionesGrafico(),

          indexAxis: "y",

          scales: {

            x: {

              beginAtZero: true,

              stacked: true,

              ticks: {
                precision: 0,
                color: colores.texto
              },

              grid: {
                color: colores.grid
              }

            },

            y: {

              stacked: true,

              ticks: {
                color: colores.texto
              },

              grid: {
                display: false
              }

            }

          }

        }

      }
    );

  }


  // ==========================================
  // MOSTRAR GRÁFICOS
  // ==========================================

  function mostrarGraficos(asistencias, tipo) {

    destruirGraficos();

    if (typeof Chart === "undefined") {

      mostrarMensaje(
        "No se pudo cargar la librería de gráficos."
      );

      return;

    }

    if (
      !elementos.distribucionCanvas ||
      !elementos.evolucionCanvas
    ) {

      console.error(
        "No se encontraron los canvas de los gráficos."
      );

      mostrarMensaje(
        "No se encontraron los elementos necesarios para mostrar los gráficos."
      );

      return;

    }

    try {

      crearGraficoDistribucion(asistencias);

      switch (tipo) {

        case "diario":

          crearGraficoDiario(asistencias);

          break;

        case "semanal":
        case "mensual":

          crearGraficoTemporal(
            asistencias,
            tipo
          );

          break;

        case "estudiante":

          crearGraficoEstudiante(
            asistencias
          );

          break;

        case "grupo":

          crearGraficoGrupo(
            asistencias
          );

          break;

        default:

          throw new Error(
            "Tipo de reporte no reconocido."
          );

      }

    } catch (error) {

      console.error(
        "Error al construir los gráficos:",
        error
      );

      destruirGraficos();

      mostrarMensaje(
        "El reporte se generó, pero ocurrió un error al mostrar los gráficos.",
        "warning"
      );

    }

  }


  // ==========================================
  // MOSTRAR DETALLE DE ASISTENCIAS
  // ==========================================

  function mostrarDetalle(asistencias) {

    if (asistencias.length === 0) {

      elementos.reporteDetalle.innerHTML = `

        <div class="reportes-empty">

          No existen registros de asistencia
          para el periodo seleccionado.

        </div>

      `;

      return;

    }

    const filas = asistencias.map((asistencia) => {

      const estado = obtenerEstado(asistencia);

      const estadoClase = estados.some(
        (item) => item.clave === estado
      )
        ? estado.toLowerCase()
        : "sin-estado";

      return `

        <tr>

          <td>
            ${escaparHTML(
        asistencia.estudianteNombre ||
        asistencia.estudianteId ||
        "-"
      )}
          </td>

          <td>
            ${escaparHTML(
        asistencia.grupoNombre ||
        asistencia.grupoId ||
        "-"
      )}
          </td>

          <td>
            ${formatoFecha(asistencia.fecha)}
          </td>

          <td>
            ${escaparHTML(
        asistencia.horaLlegada || "-"
      )}
          </td>

          <td>

            <span class="
              reporte-estado
              reporte-estado--${estadoClase}
            ">

              ${escaparHTML(
        obtenerEtiquetaEstado(estado)
      )}

            </span>

          </td>

          <td>
            ${escaparHTML(
        asistencia.observacion || "-"
      )}
          </td>

        </tr>

      `;

    }).join("");

    elementos.reporteDetalle.innerHTML = `

      <table class="reportes-table">

        <thead>

          <tr>

            <th>Estudiante</th>

            <th>Grupo</th>

            <th>Fecha</th>

            <th>Hora</th>

            <th>Estado</th>

            <th>Observación</th>

          </tr>

        </thead>

        <tbody>

          ${filas}

        </tbody>

      </table>

    `;

  }


  // ==========================================
  // EVENTOS
  // ==========================================

  elementos.tipoReporte.addEventListener(
    "change",
    cargarFiltros
  );

  elementos.generarReporteBtn.addEventListener(
    "click",
    generarReporte
  );


  // ==========================================
  // INICIALIZACIÓN
  // ==========================================

  cargarFiltros();

});
