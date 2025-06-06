const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app); // servidor HTTP para socket.io

const io = new Server(server, {
  cors: {
    origin: "*", // ⚠️ para pruebas. En producción, especifica el dominio de tu app Flutter
    methods: ["GET", "POST"]
  }
});

const PORT = 3000;

app.use(cors());
app.use(express.json());

// WebSocket conectado
io.on('connection', (socket) => {
  console.log('🟢 Cliente conectado vía WebSocket');

  // Escuchar cuando Flutter avisa que se entregó un pedido
  socket.on('order_delivered', ({ orderId, status }) => {
    // console.log(`📬 Pedido entregado recibido: ID ${orderId}`);
    console.log(`📬 Pedido entregado: ID ${orderId}, Estado: ${status}`);
    socket.broadcast.emit('order_delivered_emit', { orderId, status });
    // socket.emit('order_delivered_emit', orderId);
  });

  socket.on('disconnect', () => {
    console.log('🔴 Cliente desconectado');
  });
});

// Webhook desde WooCommerce
app.post('/webhook', (req, res) => {
  const pedido = req.body;

  console.log('✅ Webhook recibido');
  console.log('📦 Pedido:', pedido);

  // Emitir a todos los clientes conectados
  io.emit('nuevo_pedido', pedido);

  res.sendStatus(200);
});

server.listen(PORT, () => {
  console.log(`🚀 Backend con WebSocket corriendo en http://localhost:${PORT}`);
});
