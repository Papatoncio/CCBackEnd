let codigoUnico = 1;

export function setCodigo(codigo) {
  codigoUnico = codigo;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Restablecimiento de contraseña</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f2f2f2;
      color: #333;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #fff;
      border-radius: 10px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
    .logo-container {
      text-align: center;
      margin-bottom: 20px;
    }
    .logo {
      border-radius: 50%;
      background-color: rgba(255, 255, 255, 0.8); /* Fondo transparente */
      padding: 10px; /* Ajustar según el tamaño del logo */
      max-width: 200px;
      height: auto;
      display: inline-block;
      overflow: hidden;
    }
    .logo img {
      width: 100%;
      height: auto;
    }
    h1 {
      color: #87CEEB; /* Azul cielo */
      text-align: center;
    }
    .code-container {
      text-align: center;
      padding: 20px;
      background-color: #f2f2f2;
      border-radius: 10px;
    }
    h2 {
      color: #87CEEB; /* Azul cielo */
      font-size: 36px;
      margin-top: 0;
    }
    p {
      font-size: 16px;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo-container">
      <div class="logo">
        <img src="https://capicode-25432.web.app/assets/images/capilogo.webp" alt="Logo de tu empresa">
      </div>
    </div>
    <h1>Restablecimiento de contraseña</h1>
    <p>¡Hola!</p>
    <p>Has solicitado restablecer tu contraseña en CapiCode. A continuación, te proporcionamos un código de un solo uso:</p>
    <div class="code-container">
      <h2>${codigoUnico}</h2>
    </div>
    <p>Este código es válido por un solo uso.</p>
    <p>¡Que tengas un excelente día!</p>
  </div>
</body>
</html>
`;
}
