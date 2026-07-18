# 🏭 SISTEMA DE MANTENIMIENTO INDUSTRIAL - GUÍA DE DESPLIEGUE

## 📦 COMPONENTES

| Componente | Carpeta | Lenguaje | Ubicación |
|------------|---------|----------|-----------|
| Backend API | `backend-go/` | Go | Servidor IT (10.30.33) |
| Conector Industrial | `industrial-connector/` | .NET 10 | Máquina puente (doble red) |
| Base de Datos | `db/` | PostgreSQL | Docker (mismo servidor Go) |
| App Móvil | `mobile-app/` | Kotlin | Celulares del personal |
| Dashboard Web | `web-dashboard/` | React | Mismo servidor Go |

---

## 🚀 DESPLIEGUE RÁPIDO

### 1. Base de Datos (PostgreSQL)
```bash
docker run -d --name postgres_mantenimiento \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=admin \
  -p 5432:5432 \
  postgres:16

# Ejecutar migraciones
cd db
Get-Content migrations/001_init.sql | docker exec -i postgres_mantenimiento psql -U admin -d mantenimiento
Get-Content migrations/002_metricas.sql | docker exec -i postgres_mantenimiento psql -U admin -d mantenimiento
Get-Content migrations/003_fuente.sql | docker exec -i postgres_mantenimiento psql -U admin -d mantenimiento