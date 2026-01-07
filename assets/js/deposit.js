// --- Utilidades ---
const CLP = new Intl.NumberFormat("es-CL");

// jquery
$(document).ready(function () {
  $("#depositForm").submit(function (event) {
    event.preventDefault();

    const monto = parseInt($("#depositAmount").val().trim(), 10);
    $("#alertContainer").empty();

    if (isNaN(monto) || monto <= 1) {
      $("#alertContainer").append(`
        <div class="alert alert-warning alert-dismissible fade show" role="alert">
          Ingrese un monto válido mayor o igual a 1.
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
      `);
      return;
    }

    const usuario =
      localStorage.getItem("usuarioLogueado") ||
      sessionStorage.getItem("usuarioLogueado");
    if (!usuario) {
      window.location.href = "login.html";
      return;
    }

    let saldoActual =
      localStorage.getItem("saldo_" + usuario) ||
      sessionStorage.getItem("saldo_" + usuario);
    saldoActual = saldoActual ? parseInt(saldoActual, 10) : 0;

    const nuevoSaldo = saldoActual + monto;

    if (localStorage.getItem("usuarioLogueado")) {
      localStorage.setItem("saldo_" + usuario, nuevoSaldo);
    } else {
      sessionStorage.setItem("saldo_" + usuario, nuevoSaldo);
    }

    $("#alertContainer").append(`
      <div class="alert alert-success alert-dismissible fade show" role="alert">
        Depósito realizado exitosamente. Nuevo saldo: $${CLP.format(nuevoSaldo)}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    `);

    $("#depositAmount").val("");
  });
});
