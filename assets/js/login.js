// --- Usuario DEMO para inicio de sesión ---
const usuarioDemo = {
  email: "demo@correo.com",
  password: "123456",
};

// --- FORMULARIO DE INICIO DE SESIÓN ---
// activa el doc  para JQ
$(document).ready(function () {
  // Captura el evento submit con jQ
  $("#formLogIn").submit(function (event) {
    event.preventDefault(); //detiene envío automático
    // --- Captura datos formulario ---
    const emailIngresado = $("#email").val().trim().toLowerCase();
    const passwordIngresada = $("#password").val().trim();
    const recordar = $("#checkDefault").is(":checked");

    // Limpieza de alertas previas
    $("#alertContainer").empty();

    // Validaciones
    // -- 1. Campos vacíos ---
    if (emailIngresado === "" || passwordIngresada === "") {
      $("#alertContainer").append(`
        <div class="alert alert-warning alert-dismissible fade show" role="alert">
          Ingrese email y contraseña.
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
      `);
      return;
    }
    // --- 2. Login exitoso ---
    if (
      emailIngresado === usuarioDemo.email &&
      passwordIngresada === usuarioDemo.password
    ) {
      if (recordar) {
        localStorage.setItem("usuarioLogueado", emailIngresado);
        if (!localStorage.getItem("saldo_" + emailIngresado)) {
          localStorage.setItem("saldo_" + emailIngresado, "0");
        }
        $("#alertContainer").append(`
          <div class="alert alert-success alert-dismissible fade show" role="alert">
            ¡Bienvenido, tus datos han sido guardados!
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
          </div>
        `);
      } else {
        sessionStorage.setItem("usuarioLogueado", emailIngresado);
        if (!sessionStorage.getItem("saldo_" + emailIngresado)) {
          sessionStorage.setItem("saldo_" + emailIngresado, "0");
        }
        $("#alertContainer").append(`
          <div class="alert alert-success alert-dismissible fade show" role="alert">
            ¡Bienvenido!
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
          </div>
        `);
      }

      // Redirigir despues de 2 segundos
      setTimeout(() => {
        window.location.href = "./menu.html";
      }, 2000);
    } else {
      // --- 3. Credenciales incorrectas ---
      $("#alertContainer").append(`
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
          Credenciales incorrectas. Intente nuevamente.
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
      `);
    }
  });
});
