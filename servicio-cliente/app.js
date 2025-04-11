const amqp = require('amqplib');
const express = require('express');
const app = express();

const serviceId = process.env.SERVICE_ID || 'unknown';

const RABBITMQ_URL = 'amqp://admin:secret@rabbitmq';
const EXCHANGE = 'analytics_exchange';
const ROUTING_KEY = 'service.event';

let channel;

async function connectRabbitMQ() {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    connection.on('error', err => {
      console.error(`[${serviceId}] Error en conexión RabbitMQ:`, err.message);
    });
    connection.on('close', () => {
      console.warn(`[${serviceId}] Conexión RabbitMQ cerrada. Reintentando...`);
      setTimeout(connectRabbitMQ, 5000);
    });

    channel = await connection.createChannel();
    await channel.assertExchange(EXCHANGE, 'direct', { durable: true });

    console.log(`[${serviceId}] Conectado a RabbitMQ`);
  } catch (error) {
    console.error(`[${serviceId}] Error conectando a RabbitMQ:`, error.message);
    setTimeout(connectRabbitMQ, 5000); // Reintentar
  }
}

async function publishEvent() {
  if (!channel) {
    console.warn(`[${serviceId}] Canal de RabbitMQ no está listo aún`);
    return;
  }

  const message = {
    serviceId,
    eventType: 'request',
    timestamp: new Date().toISOString()
  };

  try {
    channel.publish(
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

connectRabbitMQ();

setInterval(publishEvent, 5000);

app.get('/', (req, res) => {
  publishEvent();
  res.send(`Cliente App - Instancia ${serviceId} | Registrado`);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Cliente ${serviceId} escuchando en puerto ${PORT}`);
});

