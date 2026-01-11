$(document).ready(function () {
  // Formateador CLP (para mostrar montos y saldo con puntos)
  const CLP = new Intl.NumberFormat("es-CL");

  // 1. Obtener usuario logueado
  const usuario =
    localStorage.getItem("usuarioLogueado") ||
    sessionStorage.getItem("usuarioLogueado");

  if (!usuario) {
    alert("No hay usuario logueado. Inicie sesión primero.");
    window.location.href = "login.html";
    return;
  }

  // 2. Detectar storage correcto
  const storage = localStorage.getItem("usuarioLogueado")
    ? localStorage
    : sessionStorage;

  // 3. Leer transacciones
  let transactions = [];
  try {
    transactions = JSON.parse(
      storage.getItem("transactions_" + usuario) || "[]"
    );
  } catch {
    transactions = [];
  }

  // Filtrar transacciones según tipo
  function getTipoTransaccion(tipo) {
    switch (tipo) {
      case "deposito":
        return "Depósito";
      case "transferencia":
        return "Transferencia realizada";
      default:
        return "Otro";
    }
  }

  // Mostrar movimientos
  function mostrarUltimosMovimientos(filtro = "") {
    const list = $("#listaMovimientos");
    list.empty();

    let filtradas = transactions.slice(-10).reverse();
    if (filtro) {
      filtradas = filtradas.filter((tx) => tx.tipo === filtro);
    }

    if (filtradas.length === 0) {
      list.append(
        "<li class='list-group-item'>No hay movimientos registrados.</li>"
      );
      return;
    }

    filtradas.forEach((tx) => {
      let fecha = "Sin fecha";
      if (tx.fecha) {
        const d = new Date(tx.fecha);
        if (!isNaN(d)) {
          fecha = d.toLocaleString("es-CL");
        }
      }
      const montoFmt = CLP.format(tx.monto ?? 0);
      const saldoFmt = CLP.format(tx.saldoFinal ?? 0);

      list.append(`
        <li class="list-group-item ${
          tx.tipo === "deposito"
            ? "bg-success-subtle border border-success"
            : "bg-info-subtle border border-info"
        }">
          <strong>${getTipoTransaccion(tx.tipo)}</strong><br>
          ${tx.contacto ? "Contacto: " + tx.contacto + "<br>" : ""}
          Monto: $${montoFmt}<br>
          Fecha: ${fecha}<br>
          Saldo final: $${saldoFmt}
        </li>
      `);
    });
  }

  // Inicial: Mostrar todos
  mostrarUltimosMovimientos();

  // Handler del filtro
  $("#filterType").change(function () {
    mostrarUltimosMovimientos($(this).val());
  });
});
