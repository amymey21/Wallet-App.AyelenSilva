// Utilidades
const CLP = new Intl.NumberFormat("es-CL");

$(document).ready(function () {
  // Ocultar el botón "Enviar dinero" al entrar a la página
  $("#sendForm button[type='submit']").hide();

  // Funciones auxiliares (centralizadas)
  function showAlert(containerSelector, message, type = "info") {
    const container = $(containerSelector);
    container.html(`
      <div class="alert alert-${type} alert-dismissible fade show" role="alert">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    `);
    // Desaparecer después de 3 segundos
    setTimeout(() => {
      container.find(".alert").fadeOut("slow", function () {
        $(this).remove(); // elimina del DOM
      });
    }, 3000);
  }

  function showModalAlert(message, type = "danger") {
    const container = $("#modalAlertContainer");
    container.html(`
      <div class="alert alert-${type} alert-dismissible fade show" role="alert">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    `);
    // Desaparecer después de 3 segundos
    setTimeout(() => {
      container.find(".alert").fadeOut("slow", function () {
        $(this).remove(); // elimina del DOM
      });
    }, 3000);
  }

  // Lógica principal
  // Obtener usuario logueado - Inicializar contactos
  const usuario =
    localStorage.getItem("usuarioLogueado") ||
    sessionStorage.getItem("usuarioLogueado");

  if (!usuario) {
    showAlert(
      "#alertContainer",
      "No hay usuario logueado. Inicie sesión primero.",
      "warning"
    );
    setTimeout(() => {
      window.location.href = "login.html";
    }, 1500);
    return;
  }

  // Lista de contactos por defecto
  const defaultContacts = [
    {
      nombre: "María González",
      cbu: "1234567890123456789012",
      alias: "Mariíta",
      banco: "Banco A",
    },
    {
      nombre: "Juan Pérez",
      cbu: "2345678901234567890123",
      alias: "Juano",
      banco: "Banco B",
    },
    {
      nombre: "Ana López",
      cbu: "3456789012345678901234",
      alias: "Anita",
      banco: "Banco C",
    },
    {
      nombre: "Carlos Sánchez",
      cbu: "4567890123456789012345",
      alias: "Carlanga",
      banco: "Banco D",
    },
    {
      nombre: "Luisa Fernández",
      cbu: "5678901234567890123456",
      alias: "Lucha",
      banco: "Banco E",
    },
    {
      nombre: "Miguel Ramírez",
      cbu: "6789012345678901234567",
      alias: "Migue",
      banco: "Banco F",
    },
    {
      nombre: "Sofía Torres",
      cbu: "7890123456789012345678",
      alias: "Sofi",
      banco: "Banco G",
    },
    {
      nombre: "Diego Morales",
      cbu: "8901234567890123456789",
      alias: "Diego",
      banco: "Banco H",
    },
  ];

  // Determinar storage correcto
  const isLocal = localStorage.getItem("usuarioLogueado") === usuario;
  const storage = isLocal ? localStorage : sessionStorage;

  // Leer contactos existentes
  let Contacts = [];
  try {
    Contacts = JSON.parse(storage.getItem("contacts_" + usuario) || "[]");
  } catch {
    Contacts = [];
  }

  // Inicializar sólo si no hay contactos guardados
  if (Contacts.length === 0) {
    storage.setItem("contacts_" + usuario, JSON.stringify(defaultContacts));
  }

  // Renderizar contactos iniciales
  renderContacts(usuario);

  // HANDLERS
  // A. Búsqueda en agenda
  $("#searchContact").on("input", function () {
    const term = $(this).val().trim();
    renderContacts(usuario, term);
  });

  // B. Agregar contactos
  $("#contactForm").on("submit", function (event) {
    event.preventDefault();

    // Capturar valores del los inputs
    const nombre = $("#nombreContacto").val().trim();
    const cbu = $("#cbuContacto").val().trim();
    const alias = $("#aliasContacto").val().trim();
    const banco = $("#bancoContacto").val().trim();

    // Validar que los campos no estén vacíos
    if (!nombre || !cbu || !alias || !banco) {
      showModalAlert("Completa todos los campos.", "danger");
      return;
    }

    // Validar que el CBU tenga 22 dígitos
    const cbuRegex = /^\d{22}$/;
    if (!cbuRegex.test(cbu)) {
      showModalAlert("El CBU debe tener 22 dígitos.", "danger");
      return;
    }

    // Leer contactos existentes
    let contacts = [];
    try {
      contacts = JSON.parse(storage.getItem("contacts_" + usuario) || "[]");
    } catch {
      contacts = [];
    }

    // Agregar nuevo contacto
    contacts.push({ nombre, cbu, alias, banco });
    storage.setItem("contacts_" + usuario, JSON.stringify(contacts));

    // Mostrar alerta de éxito
    showAlert("#alertContainer", "Contacto guardado correctamente.", "success");

    // Resetear formulario
    $("#contactForm")[0].reset();

    // Cerrar el modal
    const modalEl = $("#nuevoContactoModal");
    const modal = bootstrap.Modal.getInstance(modalEl[0]);
    modal.hide();

    //Refrescar lista
    renderContacts(usuario);
  });

  // C. Enviar dinero
  $("#contactsSelect").on("change", function () {
    const btn = $("#sendForm button[type='submit']");
    if ($(this).val()) {
      btn.show().addClass("btn-animate"); // aparece con animación
    } else {
      btn.hide().removeClass("btn-animate"); // se oculta y limpia animación
    }
  });

  $("#sendForm").submit(function (event) {
    event.preventDefault();
    // Capturar valores
    const select = $("#contactsSelect");
    const amountInput = $("#sendAmount");

    const contactIndex = select.val();
    const amount = parseInt(amountInput.val(), 10);

    if (!contactIndex) {
      showAlert("#alertContainer", "Selecciona un contacto.", "danger");
      return;
    }

    if (isNaN(amount) || amount < 1) {
      showAlert(
        "#alertContainer",
        "Ingresa un monto válido mayor o igual a 1.",
        "danger"
      );
      return;
    }

    // Verificar saldo suficiente
    let saldo = parseInt(storage.getItem("saldo_" + usuario) || "0", 10);
    if (isNaN(saldo)) saldo = 0;

    if (saldo < amount) {
      showAlert("#alertContainer", "Saldo insuficiente.", "danger");
      return;
    }

    saldo -= amount;
    storage.setItem("saldo_" + usuario, String(saldo));

    //Crear nueva transacción
    const nuevaTX = {
      fecha: new Date().toISOString(),
      contacto: select.find("option:selected").text(),
      monto: amount,
      saldoFinal: saldo,
      tipo: "transferencia",
    };

    //Leer historial existente
    const rawTX = storage.getItem("transactions_" + usuario) || "[]";
    let transactions = [];
    try {
      transactions = JSON.parse(rawTX);
    } catch {
      transactions = [];
    }

    // Guardar actualizado
    transactions.push(nuevaTX);
    storage.setItem("transactions_" + usuario, JSON.stringify(transactions));

    showAlert(
      "#alertContainer",
      `Transferencia exitosa. Nuevo saldo: $${CLP.format(saldo)}`,
      "success"
    );
    // Redirigir a menú después de 2 segundos
    setTimeout(() => {
      window.location.href = "menu.html";
    }, 2000);
  });

  // Función auxiliar para renderizar contactos
  function renderContacts(usuario, filter = "") {
    const select = $("#contactsSelect");
    const datalist = $("#contactSuggestions");
    if (!select.length) return;

    // Reiniciar contenido
    select.empty().append(`<option value="">--Selecciona--</option>`);
    if (datalist.length) datalist.empty();

    let contacts = [];
    try {
      contacts = JSON.parse(storage.getItem("contacts_" + usuario) || "[]");
    } catch {
      contacts = [];
    }

    // Normalizar texto (eliminar acentos)
    const normalizeText = (text) =>
      text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, ""); // Eliminar acentos

    // Filtrar contactos si hay término de búsqueda
    if (filter) {
      const term = normalizeText(filter);
      contacts = contacts.filter(
        (c) =>
          normalizeText(c.alias).includes(term) ||
          normalizeText(c.nombre).includes(term)
      );
    }

    // Si no hay contactos
    if (contacts.length === 0) {
      select.append(`<option value="">No se encontraron contactos</option>`);
      return;
    }

    // Renderrizar contactos en select y datalist
    contacts.forEach((c, idx) => {
      const label = `${c.alias} - ${c.nombre} (${c.banco})`;
      select.append(`<option value="${idx}">${label}</option>`);
      if (datalist.length) {
        datalist.append(`<option value="${c.alias}">${label}</option>`);
      }
    });

    // Auto seleccionar el primer contacto
    if (filter && contacts.length > 0) {
      select.val("0"); //Selecciona el 1ro
      select.trigger("change"); // Dispara el cambio para mostrar botón
    }
  }
});
