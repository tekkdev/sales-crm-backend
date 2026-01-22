# 🐳 Docker Setup for NestJS Microservices

This project uses Docker and Docker Compose to orchestrate multiple microservices with RabbitMQ.

## 📋 Prerequisites

- Docker Desktop
- Docker Compose

## 🏗️ Architecture

- **API Gateway** (`api-gateway`): Main entry point on port 5000
- **User Service** (`user-service`): Microservice handling user operations
- **Auth Service** (`auth-service`): Authentication service on port 5001
- **RabbitMQ**: Message broker with management UI on port 15672

## 🚀 Quick Start

### Production Mode

```powershell
# Build and start all services
docker-compose up --build

# Start in detached mode
docker-compose up -d --build

# Scale user service (load balancing)
docker-compose up --scale user-service=3
```

### Development Mode

```powershell
# Start development environment with hot reload
docker-compose -f docker-compose.dev.yml up --build

# Start specific service for development
docker-compose -f docker-compose.dev.yml up rabbitmq user-service
```

## 🔍 Service URLs

- **API Gateway**: http://localhost:5000
- **Auth Service**: http://localhost:5001
- **RabbitMQ Management**: http://localhost:15672
  - Username: `admin`
  - Password: `admin123`

## 🧪 Testing the API

```powershell
# Test API Gateway
Invoke-WebRequest -Uri "http://localhost:5000/" -Method GET

# Test User Service via API Gateway
Invoke-WebRequest -Uri "http://localhost:5000/users/123" -Method GET

# Test Auth Service directly
Invoke-WebRequest -Uri "http://localhost:5001/" -Method GET
```

## 📊 Monitoring

```powershell
# View logs from all services
docker-compose logs -f

# View logs from specific service
docker-compose logs -f api-gateway
docker-compose logs -f user-service
docker-compose logs -f rabbitmq

# Check service status
docker-compose ps

# View resource usage
docker stats
```

## 🛠️ Management Commands

```powershell
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Rebuild specific service
docker-compose build api-gateway
docker-compose up -d api-gateway

# Scale services
docker-compose up --scale user-service=2 --scale auth-service=2

# Access service shell
docker-compose exec api-gateway sh
```

## 🔧 Environment Variables

Each service supports these environment variables:

- `NODE_ENV`: `development` | `production`
- `PORT`: Service port number
- `RABBITMQ_URL`: RabbitMQ connection string

## 📁 Docker Files Structure

```
├── api-gateway/
│   ├── Dockerfile
│   ├── .dockerignore
│   └── healthcheck.js
├── user-service/
│   ├── Dockerfile
│   └── .dockerignore
├── auth-service/
│   ├── Dockerfile
│   └── .dockerignore
├── docker-compose.yml      # Production
└── docker-compose.dev.yml  # Development
```

## 🏥 Health Checks

All services include health checks:

- **API Gateway**: HTTP health check on port 5000
- **User/Auth Services**: Process-based health checks
- **RabbitMQ**: Built-in diagnostics

## 🔄 Load Balancing

The user service is configured with replicas for load balancing:

```powershell
# Scale user service to 3 instances
docker-compose up --scale user-service=3
```

## 🚨 Troubleshooting

1. **Port conflicts**: Stop local services running on ports 5000, 5001, 5672, 15672
2. **Memory issues**: Increase Docker Desktop memory allocation
3. **Network issues**: Restart Docker Desktop
4. **Permission issues**: Run PowerShell as Administrator

```powershell
# Clean up everything and start fresh
docker-compose down -v
docker system prune -f
docker-compose up --build
```
