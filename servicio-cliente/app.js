const amqp = require('amqplib');
const express = require('express');
const app = express();
const serviceId = process.env.SERVICE_ID || 'unknown';

// Configuración RabbitMQ
const RABBITMQ_URL = 'amqp://admin:secret@rabbitmq';
const EXCHANGE = 'analytics_exchange';
const ROUTING_KEY = 'service.event';

// Conexión y canal RabbitMQ
let channel;
async function connectRabbitMQ() {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertExchange(EXCHANGE, 'direct', { durable: true });
    console.log(`[${serviceId}] Conectado a RabbitMQ`);
  } catch (error) {
    console.error(`[${serviceId}] Error conectando a RabbitMQ:`, error.message);
    setTimeout(connectRabbitMQ, 5000); // Reintentar
  }
}

// Publicar mensaje
async function publishEvent() {
  if (!channel) return;
  
  const message = {
    serviceId,
    eventType: 'request',
    timestamp: new Date().toISOString()
  };
  
  try {
    await channel.publish(
      EXCHANGE,
      ROUTING_KEY,
      Buffer.from(JSON.stringify(message)),
      { persistent: true }
    );
    console.log(`[${serviceId}] Evento publicado`);
  } catch (error) {
    console.error(`[${serviceId}] Error publicando evento:`, error.message);
  }
}

// Conectar al iniciar
connectRabbitMQ();

// Publicar eventos periódicos
setInterval(publishEvent, 5000);

app.get('/', (req, res) => {
  publishEvent(); // También publicar en cada acceso
  res.send(`Cliente App - Instancia ${serviceId} | Registrado`);
});

app.listen(3001, () => {
  console.log(`Cliente ${serviceId} escuchando en puerto 3001`);
});
