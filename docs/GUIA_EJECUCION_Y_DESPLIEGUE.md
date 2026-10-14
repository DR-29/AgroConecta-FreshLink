# Guía de Ejecución, Pruebas y Despliegue - Parcial I

> **Proyecto:** AgroConecta (FreshLink)  
> **Comisión:** 11  
> **Entregables:** 0 (10%), 1 (60%), 2 (30%)  

---

## 1. Estructura General del Proyecto

```text
Parcial_1/
├── database/
│   ├── postgres_neon_schema.sql         # 13 tablas en PostgreSQL (Neon) con auditoría y RBAC
│   ├── mysql_schema.sql                 # 3 tablas en MySQL (Pagos y Facturación)
│   └── DICCIONARIO_DATOS_Y_MODELO.md    # Explicación técnica y diccionario de datos
├── api-fastapi/                         # Entregable 1 (60%): FastAPI + PostgreSQL + JWT
│   ├── app/
│   │   ├── api/v1/                      # Endpoints: auth, usuarios, seguridad, fincas, catalogo, pedidos, logistica, calificaciones
│   │   ├── core/                        # Configuración, conexión BD y seguridad JWT/bcrypt
│   │   ├── models/                      # 13 Modelos ORM SQLAlchemy
│   │   ├── schemas/                     # Esquemas Pydantic con validación estricta
│   │   └── main.py                      # Instancia FastAPI con Swagger (/docs)
│   ├── requirements.txt
│   ├── Procfile
│   └── .env
├── api-express/                         # Entregable 2 (30%): Express.js + MySQL
│   ├── src/
│   │   ├── config/database.js           # Pool de conexiones mysql2
│   │   ├── controllers/                 # Controladores CRUD con borrado lógico (estado = 0)
│   │   ├── routes/                      # Rutas de métodos de pago, transacciones y facturas
│   │   └── index.js                     # Servidor Express
│   ├── package.json
│   └── Procfile
├── RESUMEN_PROPUESTA.md                 # Entregable 0 (10%): Propuesta formal
└── GUIA_EJECUCION_Y_DESPLIEGUE.md       # Este documento
```

---

## 2. Preparación de Bases de Datos

### 2.1. PostgreSQL en Neon (Base de Datos Principal - 13 Tablas)
1. Ingresa a tu panel en [Neon Console](https://console.neon.tech).
2. Abre la pestaña **SQL Editor**.
3. Copia y ejecuta todo el contenido de [database/postgres_neon_schema.sql](file:///c:/Users/USER/Desktop/Parcial_1/database/postgres_neon_schema.sql).
4. Copia la cadena de conexión de Neon (`Connection Details`) que tiene la forma:
   ```text
   postgresql://usuario:contraseña@ep-xxxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
5. Pégala en `api-fastapi/.env` en la variable `DATABASE_URL`.

### 2.2. MySQL (Base de Datos Auxiliar - 3 Tablas)
1. Abre tu cliente MySQL (MySQL Workbench, phpMyAdmin, DBeaver o terminal).
2. Copia y ejecuta el archivo [database/mysql_schema.sql](file:///c:/Users/USER/Desktop/Parcial_1/database/mysql_schema.sql).
3. Configura las credenciales en `api-express/.env`:
   ```env
   MYSQL_HOST=localhost
   MYSQL_PORT=3306
   MYSQL_USER=root
   MYSQL_PASSWORD=tu_password
   MYSQL_DATABASE=agroconecta_pagos_db
   ```

---

## 3. Ejecución Local de las APIs

### 3.1. API Principal con FastAPI (Puerto 8000)
Abre una terminal PowerShell en `api-fastapi`:
```powershell
# Activar entorno virtual
.\venv\Scripts\Activate.ps1

# Iniciar servidor FastAPI con recarga en caliente
uvicorn app.main:app --reload --port 8000
```
* **Documentación Interactiva Swagger:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
* **Documentación ReDoc:** [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

#### Usuarios de prueba listos para autenticarse (con JWT):
* **Administrador:** `admin@agroconecta.com` / `Password123*`
* **Productor:** `carlos.productor@agroconecta.com` / `Password123*`
* **Tienda:** `maria.tienda@agroconecta.com` / `Password123*`
* **Transportista:** `jorge.transporte@agroconecta.com` / `Password123*`

> **Para probar en Swagger:** Haz clic en el botón verde **Authorize** (arriba a la derecha), ingresa el correo y la contraseña, y todos los endpoints protegidos funcionarán automáticamente.

---

### 3.2. API Auxiliar con Express y MySQL (Puerto 4000)
Abre otra terminal en `api-express`:
```powershell
npm run dev
```
* **Punto de Entrada:** [http://localhost:4000/](http://localhost:4000/)
* **Endpoints disponibles:**
  * `GET /api/metodos-pago`
  * `GET /api/transacciones`
  * `GET /api/facturas`
  * `GET /health`

---

## 4. Verificación de la Rúbrica de Evaluación

| Criterio | Requisito Exigido | Implementación en el Proyecto | Estado |
| :--- | :--- | :--- | :---: |
| **0. Propuesta** | Problemática, población y requerimientos | Detallado en `RESUMEN_PROPUESTA.md` | **100% Cumplido** |
| **1.1. BD Postgres** | Mínimo 12 tablas, PK, UNIQUE, `estado`, `creado`, `actualizado`, `rol`, `usuario`, `modulo`, `moduloxrol` | 13 tablas en `postgres_neon_schema.sql` con triggers automáticos | **100% Cumplido** |
| **1.2. Endpoints FastAPI** | CRUD con borrado lógico | Endpoints en `/api/v1` para todas las entidades | **100% Cumplido** |
| **1.3. JWT y Validación** | Autenticación y RBAC | JWT con expiración, bcrypt, OAuth2 y `Depends` por rol/módulo | **100% Cumplido** |
| **1.4. Despliegue FastAPI** | Listo para Render/Railway | `Procfile`, `requirements.txt` y CORS configurados | **100% Cumplido** |
| **2.1. BD MySQL** | Mínimo 3 tablas, PK, UNIQUE, `estado`, `creado`, `actualizado` | 3 tablas en `mysql_schema.sql` (`metodo_pago`, `transaccion_pago`, `comprobante_factura`) | **100% Cumplido** |
| **2.2. Endpoints Express** | Endpoints de la BD auxiliar | Rutas y controladores con borrado lógico y MySQL pool | **100% Cumplido** |
| **2.3. Despliegue Express** | Listo para Render/Railway | `Procfile` y `package.json` configurados | **100% Cumplido** |

---

## 5. Guía de Despliegue en la Nube (Render.com)

Tanto FastAPI como Express están listos para desplegarse gratis en **Render**:

### Para la API de FastAPI:
1. Conecta tu repositorio de GitHub en [Render Dashboard](https://dashboard.render.com).
2. Selecciona **New Web Service**.
3. Configuración:
   * **Root Directory:** `api-fastapi`
   * **Runtime:** `Python 3`
   * **Build Command:** `pip install -r requirements.txt`
   * **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. En **Environment Variables**, añade:
   * `DATABASE_URL`: La URL de tu base de datos en Neon.
   * `SECRET_KEY`: Tu clave secreta para JWT.

### Para la API de Express:
1. Selecciona **New Web Service** en Render.
2. Configuración:
   * **Root Directory:** `api-express`
   * **Runtime:** `Node`
   * **Build Command:** `npm install`
   * **Start Command:** `node src/index.js`
3. En **Environment Variables**, añade las credenciales de tu base de datos MySQL (por ejemplo de Aiven o Railway).
