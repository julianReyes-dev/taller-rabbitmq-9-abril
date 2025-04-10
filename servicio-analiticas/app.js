const express = require('express');
const amqp = require('amqplib');
const app = express();
app.use(express.json());

const registros = {};
const RABBITMQ_URL = 'amqp://admin:secret@rabbitmq';
const QUEUE = 'analytics_queue';

// Consumidor RabbitMQ
async function startConsumer() {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    
    await channel.assertExchange('analytics_exchange', 'direct', { durable: true });
    await channel.assertQueue(QUEUE, { durable: true });
    await channel.bindQueue(QUEUE, 'analytics_exchange', 'service.event');
    
    channel.consume(QUEUE, (msg) => {
      try {
        const message = JSON.parse(msg.content.toString());
        const { serviceId } = message;
        
        registros[serviceId] = (registros[serviceId] || 0) + 1;
        console.log(`Registro recibido de ${serviceId}. Total: ${registros[serviceId]}`);
        
        channel.ack(msg); // Confirmar procesamiento
      } catch (error) {
        console.error('Error procesando mensaje:', error);
        channel.nack(msg); // Rechazar mensaje (opcional: mover a DLQ)
      }
    });
    
    console.log('Consumidor RabbitMQ iniciado');
  } catch (error) {
    console.error('Error iniciando consumidor RabbitMQ:', error.message);
    setTimeout(startConsumer, 5000); // Reintentar
  }
}

// Iniciar consumidor
startConsumer();

app.post('/reporte', (req, res) => {
  const serviceId = req.headers['x-service-id'];
  
  if (!serviceId) {
    return res.status(400).send('Falta X-Service-ID header');
  }

  registros[serviceId] = (registros[serviceId] || 0) + 1;
  
  console.log(`Registro recibido de ${serviceId}. Total: ${registros[serviceId]}`);
  res.json({ 
    servicio: serviceId,
    registros: registros[serviceId],
    timestamp: new Date().toISOString()
  });
});

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Authorization, X-Service-ID');
  next();
});

// Modifica la ruta /registro/estado
app.get('/reporte/estado', (req, res) => {
  // Verifica autenticación básica
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Basic ')) {
    return res.status(401).json({ error: 'Autenticación requerida' });
  }
  
  res.json({
    totalRegistros: Object.values(registros).reduce((a, b) => a + b, 0),
    servicios: registros,
    fecha: new Date().toISOString()
  });
});

app.listen(3000, () => {
  console.log('API Registro escuchando en puerto 3000');
});
