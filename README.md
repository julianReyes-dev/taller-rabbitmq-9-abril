# TALLER RABBITMQ 9 DE ABRIL

## ⚠️ Compatibilidad
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

## 🔍 Pruebas de Funcionalidad

### 1. Clientes
Ingrese a http://localhost/cliente/uno
![image](https://github.com/user-attachments/assets/4c0dbc23-0a20-44c2-a75c-45d8d5c6449c)

Ahora ingrese a http://localhost/cliente/dos
![image](https://github.com/user-attachments/assets/554ea0d4-a35a-4848-a49f-7eb4f02ecfa6)

### 2. Servicio analiticas
Ingrese a http://localhost/reporte/estado con las credenciales admin/secret
![image](https://github.com/user-attachments/assets/4302a58e-a43e-452c-9cc7-c47f155b9103)


### 3. Panel visual
Ingrese a http://localhost/panel
![image](https://github.com/user-attachments/assets/de48ac30-6acb-48d4-8e62-46fa21155e14)
