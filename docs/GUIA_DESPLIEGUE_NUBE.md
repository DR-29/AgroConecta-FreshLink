# Guía de Despliegue en la Nube — AgroConecta (FreshLink)

**Asignatura:** Desarrollo Web / Taller 1 & Parcial 1 Corte 2  
**Docente:** Mg. Bryan Fernandez Ebrath  
**Comisión:** 11  
**Repositorio GitHub:** [https://github.com/DR-29/AgroConecta-FreshLink](https://github.com/DR-29/AgroConecta-FreshLink)

---

## 1. Arquitectura de Despliegue en la Nube

El sistema cuenta con una arquitectura desacoplada de 3 niveles 100% alojada en infraestructura cloud:

```
                               ┌────────────────────────────────────────────────────────┐
                               │                    FRONTEND WEB                        │
                               │          SvelteKit 2 + Vite + Bootstrap 5.0.2          │
                               │         (Alojado en Vercel o Render Web Service)       │
                               └────────────────────┬──────────────┬────────────────────┘
                                                    │              │
                                   /api/v1 (REST)   │              │  /api/aux (REST)
                                                    ▼              ▼
                        ┌───────────────────────────────┐      ┌───────────────────────────────┐
                        │      BACKEND PRINCIPAL        │      │    MICROSERVICIO AUXILIAR     │
                        │       FastAPI (Python 3.12)   │      │       Express (Node.js)       │
                        │      (Alojado en Render)      │      │      (Alojado en Render)      │
                        └───────────────┬───────────────┘      └───────────────┬───────────────┘
                                        │                                      │
                                        ▼                                      ▼
                        ┌───────────────────────────────┐      ┌───────────────────────────────┐
                        │     NEON CLOUD POSTGRESQL     │      │       AIVEN CLOUD MYSQL       │
                        │       (Tablas Principales)    │      │       (Pagos y Facturación)   │
                        │      20 registros / tabla     │      │       10 registros / tabla    │
                        └───────────────────────────────┘      └───────────────────────────────┘
```

---

## 2. Opción A: Despliegue Automático con 1-Clic (Render Blueprint)

El repositorio incluye el archivo [`render.yaml`](../render.yaml) configurado para levantar automáticamente los 3 servicios en Render.

### Pasos:
1. Inicia sesión en [https://dashboard.render.com](https://dashboard.render.com).
2. Haz clic en el botón **New +** y selecciona **Blueprint**.
3. Conecta tu repositorio de GitHub: `DR-29/AgroConecta-FreshLink`.
4. Render leerá el archivo `render.yaml` y detectará los 3 servicios:
   * `agroconecta-api-fastapi` (Python)
   * `agroconecta-api-express` (Node.js)
   * `agroconecta-frontend-svelte` (Node.js)
5. En la pantalla de variables de entorno solicitadas, ingresa los valores secretos disponibles en los archivos `.env` locales:
   * **`DATABASE_URL` (para FastAPI):**  
     Consulta el valor `DATABASE_URL` configurado en `api-fastapi/.env`
   * **`MYSQL_PASSWORD` (para Express):**  
     Consulta el valor `MYSQL_PASSWORD` configurado en `api-express/.env`
6. Haz clic en **Apply**. Render compilará y desplegará los 3 servicios simultáneamente.

---

## 3. Opción B: Despliegue Manual Servicio por Servicio

Si prefieres mayor control o deseas desplegar el Frontend en **Vercel** y los Backends en **Render**:

### 3.1 Backend Principal (FastAPI en Render)
* **Tipo:** Web Service
* **Nombre:** `agroconecta-api-fastapi`
* **Root Directory:** `api-fastapi`
* **Runtime:** `Python 3`
* **Build Command:** `pip install -r requirements.txt`
* **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
* **Variables de Entorno:**
  * `DATABASE_URL` = (Valor de `DATABASE_URL` en `api-fastapi/.env`)
  * `SECRET_KEY` = `agroconecta_super_secret_jwt_key_segura_parcial_1_2025`
  * `ACCESS_TOKEN_EXPIRE_MINUTES` = `480`
  * `BACKEND_CORS_ORIGINS` = `["*"]`

### 3.2 Microservicio Auxiliar (Express en Render)
* **Tipo:** Web Service
* **Nombre:** `agroconecta-api-express`
* **Root Directory:** `api-express`
* **Runtime:** `Node`
* **Build Command:** `npm install`
* **Start Command:** `node src/index.js`
* **Variables de Entorno:**
  * `PORT` = `3000`
  * `MYSQL_HOST` = `agroconecta-mysql-diegofdez2000-a94b.g.aivencloud.com`
  * `MYSQL_PORT` = `10265`
  * `MYSQL_USER` = `avnadmin`
  * `MYSQL_PASSWORD` = (Valor de `MYSQL_PASSWORD` en `api-express/.env`)
  * `MYSQL_DATABASE` = `defaultdb`
  * `MYSQL_SSL` = `true`

### 3.3 Frontend Web (SvelteKit en Vercel)
* **Plataforma:** [https://vercel.com](https://vercel.com)
* **Root Directory:** `frontend-svelte`
* **Framework Preset:** `SvelteKit` (detectado automáticamente)
* **Build Command:** `npm run build`
* **Output Directory:** `.svelte-kit` (automático)
* **Variables de Entorno en Vercel:**
  * `VITE_API_FASTAPI_URL` = URL pública de tu FastAPI en Render (ej. `https://agroconecta-api-fastapi.onrender.com`)
  * `VITE_API_EXPRESS_URL` = URL pública de tu Express en Render (ej. `https://agroconecta-api-express.onrender.com`)

---

## 4. Usuarios de Demostración para Evaluación

Todos los usuarios tienen la contraseña configurada: `Password123*`

| Rol | Correo Electrónico | Contraseña | Funcionalidad Clave para Demostrar |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin@agroconecta.com` | `Password123*` | Gestión de seguridad RBAC, usuarios, aprobación de vehículos, vista global |
| **Productor** | `carlos.productor@agroconecta.com` | `Password123*` | Registro de fincas, publicación de cosechas, aceptación de pedidos |
| **Tienda** | `maria.tienda@agroconecta.com` | `Password123*` | Catálogo de productos, carrito de compras, emisión de pedidos, calificaciones |
| **Transportista** | `jorge.transporte@agroconecta.com` | `Password123*` | Vehículos de carga, fletes asignados, actualización a EN_RUTA / ENTREGADO |

---

## 5. Endpoints de Verificación Rápida en la Nube

* **Documentación Swagger FastAPI:** `https://<tu-url-fastapi>/docs`
* **Health Check FastAPI:** `https://<tu-url-fastapi>/health`
* **Health Check Express:** `https://<tu-url-express>/health`
* **Métodos de Pago (MySQL Aiven):** `https://<tu-url-express>/api/metodos-pago`
* **Aplicación Web SvelteKit:** `https://<tu-url-frontend>`
