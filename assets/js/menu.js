// Utilidades
const CLP = new Intl.NumberFormat("es-CL");

// menu.js
$(document).ready(function () {
  // Animación de la tarjeta saldo
  $(".card-resumen").hide().fadeIn(1500);

  // Cargar saldo actual desde Storage
  function cargarSaldo() {
    const usuario =
      localStorage.getItem("usuarioLogueado") ||
      sessionStorage.getItem("usuarioLogueado");
    if (!usuario) {
      // Si no hay usuario logueado, redirigir a login
      window.location.href = "login.html";
      return;
    }

    const saldoLocal = localStorage.getItem("saldo_" + usuario);
    const saldoSession = sessionStorage.getItem("saldo_" + usuario);
    const saldo = saldoLocal ?? saldoSession ?? "0";

    $("#saldoActual").text(`$ ${CLP.format(parseInt(saldo, 10))}`);
  }

  // Inicializar saldos al cargar la página
  cargarSaldo();

  // Mostrar alerta bootstrap y redirigir
  function showAlertAndRedirect(message, target) {
    // Limpiar alertas previas
    $("#alertContainer").empty();
    // Insertar alerta bootstrap
    $("#alertContainer").append(`
      <div class="alert alert-info alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    `);
    // Redirigir después de 1.5 segundos
    setTimeout(() => {
      window.location.href = target;
    }, 1500);
  }

  // EVENTOS DE LOS BOTONES
  // Depositar
  $("#btnDeposit").on("click", function () {
    showAlertAndRedirect("Redirigiendo a Depositar...", "deposit.html");
  });
  // Enviar Dinero
  $("#btnSendMoney").on("click", function () {
    showAlertAndRedirect("Redirigiendo a Enviar Dinero...", "sendmoney.html");
  });
  // Últimos Movimientos
  $("#btnTransactions").on("click", function () {
    showAlertAndRedirect(
      "Redirigiendo a Últimos Movimientos...",
      "transactions.html"
    );
  });
});
