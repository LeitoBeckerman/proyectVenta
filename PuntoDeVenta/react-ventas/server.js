const https = require('https');
const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();

// Lee los archivos del certificado y la clave privada generados
const key = fs.readFileSync(path.join(__dirname, 'key.pem'));
const cert = fs.readFileSync(path.join(__dirname, 'cert.pem'));

// Configuración del servidor HTTPS
const server = https.createServer({ key, cert }, app);

// Middleware para servir los archivos estáticos generados por React
app.use(express.static(path.join(__dirname, 'build')));

// Maneja las rutas
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Puerto de escucha
const PORT = 3000;

// Inicia el servidor
server.listen(PORT, () => {
  console.log(`Servidor HTTPS corriendo en https://localhost:${PORT}`);
});
