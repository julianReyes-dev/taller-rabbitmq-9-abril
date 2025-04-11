const express = require('express');
const amqp = require('amqplib');
const app = express();
app.use(express.json());

const registros = {};
const RABBITMQ_URL = 'amqp://admin:secret@rabbitmq';
const EXCHANGE = 'analytics_exchange';
const QUEUE = 'analytics_queue';
const ROUTING_KEY = 'service.event';

let connection;
let channel;

async function startConsumer() {
  try {
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();

    connection.on('close', () => {
      console.warn('Conexión RabbitMQ cerrada. Reintentando...');
      setTimeout(startConsumer, 5000);
    });

    await channel.assertExchange(EXCHANGE, 'direct', { durable: true });
    await channel.assertQueue(QUEUE, { durable: true });
    await channel.bindQueue(QUEUE, EXCHANGE, ROUTING_KEY);

    await channel.consume(QUEUE, (msg) => {
      if (msg !== null) {
        try {
          const message = JSON.parse(msg.content.toString());
          const { serviceId } = message;

          registros[serviceId] = (registros[serviceId] || 0) + 1;
          console.log(`Mensaje de ${serviceId} | Total: ${registros[serviceId]}`);

          channel.ack(msg);
        } catch (error) {
          console.error('Error procesando mensaje:', error.message);
          channel.nack(msg, false, false); // Puedes reenviarlo si quieres con el último 'true'
        }
      }
    });

    console.log('Consumidor RabbitMQ iniciado y escuchando...');
  } catch (error) {
    console.error('Error iniciando consumidor RabbitMQ:', error.message);
    setTimeout(startConsumer, 5000); // Reintentar en caso de fallo
  }
}

startConsumer();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Authorization, X-Service-ID, Content-Type');
  next();
});

app.post('/reporte', (req, res) => {
  const serviceId = req.headers['x-service-id'];

  if (!serviceId) {
    return res.status(400).json({ error: 'Falta header X-Service-ID' });
  }

  registros[serviceId] = (registros[serviceId] || 0) + 1;
  console.log(`Registro manual de ${serviceId}. Total: ${registros[serviceId]}`);

  res.json({
    servicio: serviceId,
    registros: registros[serviceId],
    timestamp: new Date().toISOString()
  });
});

app.get('/reporte/estado', (req, res) => {
  const auth = req.headers.authorization;

  const expected = 'Basic ' + Buffer.from('admin:secret').toString('base64');
  if (auth !== expected) {
    return res.status(401).json({ error: 'Autenticación requerida' });
  }

  res.json({
    totalRegistros: Object.values(registros).reduce((a, b) => a + b, 0),
    servicios: registros,
    fecha: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servicio de registro escuchando en el puerto ${PORT}`);
});

