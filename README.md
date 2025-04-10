# TALLER RABBITMQ 9 DE ABRIL

## Compatibilidad
✅ **Navegadores probados:**  
- Brave (funciona perfectamente)
- Opera (funciona perfectamente)  
❌ **Firefox:** Actualmente presenta problemas con las URLs locales (.localhost)

## 🛠 Instalación

### 1. Clonar el repositorio
```bash
git clone https://github.com/julianReyes-dev/taller-rabbitmq-9-abril.git
cd taller-rabbitmq-9-abril
```

### 2. Iniciar los servicios
```bash
docker-compose up -d --build
```

### 3. Verificar contenedores
```bash
docker-compose ps
```

## 🌐 Acceso a los Servicios
| Servicio | URL | Credenciales (si aplica) |
|----------|-----|--------------------------|
| Traefik Dashboard | http://traefik.localhost | - |
| Cliente uno | http://localhost/cliente/uno | - |
| Cliente dos | http://localhost/cliente/dos | - |
| Servicio analiticas | http://localhost/reporte/estado | admin:secret |
| Panel visual | http://localhost/panel| - |
| RabbitMQ | http://rabbitmq.localhost/| admin:secret|

## 📊 Monitorización

**Interfaz RabbitMQ**:
Accediendo a http://rabbitmq.localhost/ con las credenciales admin/secret
- Proporciona métricas en tiempo real
- Permite inspeccionar colas
- Muestra tasas de mensajes entrantes/salientes
![image](https://github.com/user-attachments/assets/8c5c7fcd-63c0-4b85-9893-8c3abd4e4fc0)
![image](https://github.com/user-attachments/assets/768d72b9-af34-4848-b291-bf189c01cb70)
![image](https://github.com/user-attachments/assets/b685b97e-b069-472d-9f4c-bbd874f9ed6c)



## 🔍 Pruebas de Funcionalidad

### 1. Integración de RabbitMQ
Se ha añadido un contenedor RabbitMQ 3-management al docker-compose.yml

Configuración básica:
- Usuario: admin
- Contraseña: secret

Puertos expuestos:
- 5672 (AMQP)
- 15672 (Management UI)

![image](https://github.com/user-attachments/assets/2cfca8b0-6d87-4950-a65a-c38a156307cf)
![image](https://github.com/user-attachments/assets/c0a44bf4-cbed-4815-bcbe-7dbaeee6ad8a)

### 2. Publicación de Eventos desde Clientes
Los clientes ahora usan AMQP en lugar de HTTP  
Cada cliente:
- Crea una conexión persistente
- Publica mensajes en formato JSON al exchange
- Implementa lógica de reconexión automática

Código clave:
![image](https://github.com/user-attachments/assets/246a8158-87d0-4c55-b10f-a8329a4019a9)

Cliente-uno:
![image](https://github.com/user-attachments/assets/2dbc6bd4-4e78-4534-b768-6af362a34d37)

Cliente-dos:
![image](https://github.com/user-attachments/assets/f24218a6-0ee2-476c-8f91-406c670f1ded)


### 3. Consumo de Eventos en Servicio Analíticas
Forma de consumo:
- Conexión dedicada con canal propio
- Ack manual para control preciso del procesamiento
- Bindings automáticos al iniciar

Código clave:
![image](https://github.com/user-attachments/assets/cd34ff89-c852-46a5-85bf-754a9bf91cdf)

Logs:
![image](https://github.com/user-attachments/assets/8534fdd9-93f2-4189-b494-6cb3bc5b4050)

Patrones implementados:
- Reconexión automática: Si RabbitMQ falla
- Control de errores: Manejo explícito de fallos
- Persistencia: Contadores se mantienen en memoria

### 4. Estructura de RabbitMQ

| Componente       | Nombre               | Tipo       | Descripción |
|------------------|----------------------|------------|-------------|
| Exchange         | analytics_exchange   | direct     | Enruta mensajes a la cola |
| Queue            | analytics_queue      | durable    | Almacena mensajes pendientes |
| Binding          | service.event        | routing key| Asocia exchange con cola |

**Diagrama de arquitectura**:
![image](https://github.com/user-attachments/assets/dc2bfc35-ad5c-4367-adcb-f8e12bdd6970)


**Integrantes del equipo**:
- Julian Camilo Reyes Uribe
- Oscar Ivan Rojas Cuesta

