// Utilidades
const CLP = new Intl.NumberFormat("es-CL");

$(document).ready(function () {
  // 1. Obtener usuario logueado
  const usuario =
    localStorage.getItem("usuarioLogueado") ||
    sessionStorage.getItem("usuarioLogueado");

  if (!usuario) {
    $("#alertContainer").append(`
      <div class="alert alert-warning alert-dismissible fade show" role="alert">
      No hay usuario logueado. Inicie sesión primero.
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    `);
    setTimeout(() => {
      window.location.href = "login.html";
    }, 1500);
    return;
  }

  // 2. Cargar contactos al entrar
  renderContacts(usuario);

  // Handler de contactos
  $("#contactForm").on("submit", function (event) {
    event.preventDefault();

    // Capturar valores del los inputs
    const nombre = $("#nombreContacto").val().trim();
    const cbu = $("#cbuContacto").val().trim();
    const alias = $("#aliasContacto").val().trim();
    const banco = $("#bancoContacto").val().trim();

    // Validar que los campos no estén vacíos
    if (!nombre || !cbu || !alias || !banco) {
      $("#alertContainer").append(`
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
          Completa todos los campos.
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
      `);
      return;
    }

    // Validar que el CBU tenga 22 dígitos
    const cbuRegex = /^\d{22}$/;
    if (!cbuRegex.test(cbu)) {
      $("#alertContainer").append(`
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
          El CBU debe tener 22 dígitos.
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
      `);
      return;
    }

    // Leer contactos existentes
    const raw =
      localStorage.getItem("contacts_" + usuario) ||
      sessionStorage.getItem("contacts_" + usuario) ||
      "[]";

    let contacts = [];
    try {
      contacts = JSON.parse(raw);
    } catch {
      contacts = [];
    }

    // Agregar nuevo contacto
    contacts.push({ nombre, cbu, alias, banco });

    // Guardar en el mismo storage donde está el usuario
    if (localStorage.getItem("usuarioLogueado") === usuario) {
      localStorage.setItem("contacts_" + usuario, JSON.stringify(contacts));
    } else {
      sessionStorage.setItem("contacts_" + usuario, JSON.stringify(contacts));
    }

    // feedback y reset
    $("#alertContainer").append(`
      <div class=alert alert-success alert-dismissible fade show" role="alert">
        Contacto guardado correctamente.
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    `);

    $("#contactForm")[0].reset();

    // Cerrar el modal
    const modalEl = $("#nuevoContactoModal");
    const modal = bootstrap.Modal.getInstance(modalEl[0]);
    modal.hide();

    //Refrescar lista
    renderContacts(usuario);
  });

  // 4. Handler enviar dinero
  $("#sendForm").submit(function (event) {
    event.preventDefault();
    // Capturar valores
    const select = $("#contactsSelect");
    const amountInput = $("#sendAmount");

    const contactIndex = select.val();
    const amount = parseInt(amountInput.val(), 10);

    if (!contactIndex) {
      $("#alertContainer").append(`
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
          Selecciona un contacto.
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
      `);
      return;
    }

    if (isNaN(amount) || amount <= 1) {
      $("#alertContainer").append(`
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
          Ingresa un monto válido mayor o igual a 1.
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
      `);
      return;
    }

    const isLocal = localStorage.getItem("usuarioLogueado") === usuario;
    const storage = isLocal ? localStorage : sessionStorage;

    let saldo = parseInt(storage.getItem("saldo_" + usuario) || "0", 10);
    if (isNaN(saldo)) saldo = 0;

    if (saldo < amount) {
      $("#alertContainer").append(`
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
          Saldo insuficiente.
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
      `);
      return;
    }

    saldo -= amount;
    storage.setItem("saldo_" + usuario, String(saldo));

    // 1.Crear nueva transacción
    const nuevaTX = {
      fecha: new Date().toISOString(),
      contacto: select.find("option:selected").text(),
      monto: amount,
      saldoFinal: saldo,
    };

    // 2. Leer historial existente
    const rawTX = storage.getItem("transactions_" + usuario) || "[]";
    let transactions = [];
    try {
      transactions = JSON.parse(rawTX);
    } catch {
      transactions = [];
    }

    // 3. Guardar actualizado
    transactions.push(nuevaTX);
    storage.setItem("transactions_" + usuario, JSON.stringify(transactions));

    $("#alertContainer").append(`
      <div class="alert alert-success alert-dismissible fade show" role="alert">
        Transferencia exitosa. Nuevo saldo: $${CLP.format(saldo)}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    `);

    setTimeout(() => {
      window.location.href = "menu.html";
    }, 2000);
  });
});

// Función auxiliar para renderizar contactos
function renderContacts(usuario) {
  const select = $("#contactsSelect");
  if (!select.length) return;

  select.empty().append(`<option value="">-Selecciona-</option>`);

  const raw =
    localStorage.getItem("contacts_" + usuario) ||
    sessionStorage.getItem("contacts_" + usuario) ||
    "[]";

  let contacts = [];
  try {
    contacts = JSON.parse(raw);
  } catch {
    contacts = [];
  }

  contacts.forEach((c, idx) => {
    select.append(
      `<option value="${idx}">${c.alias} - ${c.nombre} (${c.banco})</option>`
    );
  });
}
