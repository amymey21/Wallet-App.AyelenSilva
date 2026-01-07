document.addEventListener("DOMContentLoaded", function () {
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
  const isLocal = localStorage.getItem("usuarioLogueado") === usuario;
  const storage = isLocal ? localStorage : sessionStorage;

  // 3. Leer transacciones
  const rawTX = storage.getItem("transactions_" + usuario) || "[]";
  let transactions = [];
  try {
    transactions = JSON.parse(rawTX);
  } catch {
    transactions = [];
  }

  // 4. Tomar 10 transacciones
  const ultimas = transactions.slice(-10).reverse();

  // 5. Pintar en la lista
  const list = document.getElementById("listaMovimientos");
  list.innerHTML = "";

  if (ultimas.length === 0) {
    list.innerHTML =
      "<li class='list-group-item'>No hay movimientos registrados.</li>";
    return;
  }

  ultimas.forEach((tx) => {
    const li = document.createElement("li");

    // Diferenciar estilos según tipo
    if (tx.tipo === "deposito") {
      li.className = "list-group-item bg-success-subtle border border-success";
    } else {
      li.className = "list-group-item bg-info-subtle border border-info";
    }

    // Fecha ISO a legible
    let fecha = "Sin fecha";
    if (tx.fecha) {
      const d = new Date(tx.fecha);
      if (!isNaN(d)) {
        const fechaParte = d.toLocaleDateString("es-CL", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });

        const horaParte = d.toLocaleTimeString("es-CL", {
          hour: "2-digit",
          minute: "2-digit",
        });
        fecha = `${fechaParte} ${horaParte}`;
      }
    }

    // Montos formateados
    const montoFmt = CLP.format(tx.monto ?? 0);
    const saldoFmt = CLP.format(tx.saldoFinal ?? 0);

    li.textContent = `${fecha} - ${tx.contacto} - $${tx.monto} - Saldo: $${tx.saldoFinal}`;
    list.appendChild(li);
  });
});
