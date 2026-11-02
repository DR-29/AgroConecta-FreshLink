# AgroConecta (FreshLink)

Plataforma web para conectar productores campesinos, comercios/tiendas y transportistas de carga, eliminando intermediarios y garantizando trazabilidad y transparencia.

---

## 🛠️ Tecnologías del Proyecto

* **API Principal (60% / 30%):** FastAPI (Python 3.12) + PostgreSQL (Neon).
  * Arquitectura modular en capas: Routers (`app/api/v1/`), Modelos Pydantic (`app/models/`) y Repositorios con SQL puro (`app/repositories/`).
  * Autenticación con JWT cifrado con `bcrypt`.
  * Matriz RBAC dinámica (`rol`, `modulo`, `moduloxrol`).
  * Campos de auditoría transversal (`estado`, `creado`, `actualizado`) con borrado lógico.
* **API Auxiliar (30% / 20%):** Express.js (Node.js) + MySQL (Aiven).
  * Microservicio desacoplado para gestión de métodos de pago, transacciones y facturación/comprobantes.
* **Frontend Web (50%):** SvelteKit + Vite + Bootstrap 5.
  * Consumo centralizado de endpoints mediante servicios en `src/lib/services/`.
  * Componentes modulares reutilizables en `src/lib/components/`.
  * Menús dinámicos cargados según permisos de base de datos (`moduloxrol`).
  * Cero visualización o captura de IDs para el usuario final.

---

## 🚀 Ejecución en Local

### 1. API Principal (FastAPI)
```bash
cd api-fastapi
# Activar entorno virtual
.\venv\Scripts\activate
# Ejecutar servidor de desarrollo
uvicorn main:app --reload --port 8000
```
* **Documentación interactiva Swagger:** [http://localhost:8000/docs](http://localhost:8000/docs)
* **Especificación OpenAPI:** [http://localhost:8000/openapi.json](http://localhost:8000/openapi.json)

### 2. API Auxiliar (Express + MySQL)
```bash
cd api-express
npm install
npm run dev
```
* Servidor escuchando en: [http://localhost:3000](http://localhost:3000)

### 3. Frontend (SvelteKit)
```bash
cd frontend-svelte
npm install
npm run dev
```
* Aplicativo web en: [http://localhost:5173](http://localhost:5173) (con proxy configurado en `vite.config.js` hacia FastAPI).

---

## 👥 Usuarios de Prueba y Roles

Credenciales precargadas en la base de datos (Contraseña para todos: `Password123*`):

| Rol | Documento | Correo | Propósito / Funciones |
|---|---|---|---|
| **ADMINISTRADOR** | `1000000001` | `admin@agroconecta.com` | Auditoría total, gestión de usuarios, aprobación de vehículos y roles. |
| **PRODUCTOR** | `1000000002` | `carlos.productor@agroconecta.com` | Registrar fincas, publicar cosechas, control de inventario y aceptar pedidos. |
| **TIENDA** | `1000000003` | `maria.tienda@agroconecta.com` | Explorar catálogo de cosechas, emitir órdenes de compra y calificar el servicio. |
| **TRANSPORTISTA** | `1000000004` | `jorge.transporte@agroconecta.com` | Registrar vehículos de carga, aceptar solicitudes de flete y confirmar entregas. |

---

## 📦 Arquitectura de Endpoints (FastAPI)

Todos los endpoints se encuentran bajo el prefijo `/api/v1`:

* **Autenticación y Perfil:** `/api/v1/auth/login`, `/api/v1/auth/register`, `/api/v1/auth/me`
* **Usuarios y Roles:** `/api/v1/usuarios/`
* **Seguridad y Permisos RBAC:** `/api/v1/seguridad/modulos`, `/api/v1/seguridad/permisos`
* **Fincas y Parcelas:** `/api/v1/fincas/` (CRUD completo y borrado lógico con `estado = 0`)
* **Catálogo y Cosechas:** `/api/v1/catalogo/categorias`, `/api/v1/catalogo/productos`, `/api/v1/catalogo/productos/{id}/stock`
* **Pedidos y Trazabilidad:** `/api/v1/pedidos/`, `/api/v1/pedidos/{id}/estado` (`PENDIENTE` ➔ `ACEPTADO` ➔ `EN_RUTA` ➔ `ENTREGADO`)
* **Logística y Vehículos:** `/api/v1/logistica/vehiculos`, `/api/v1/logistica/solicitudes`
* **Calificaciones de Servicio:** `/api/v1/calificaciones/`

---

## 💳 Microservicio de Pagos (Express + MySQL)

* `/api/metodos-pago`: Métodos de pago habilitados.
* `/api/transacciones`: Procesamiento y auditoría de transacciones vinculadas a pedidos.
* `/api/facturas`: Emisión y consulta de comprobantes fiscales.

---

## 🛡️ Auditoría y Borrado Lógico

Todas las tablas de ambas bases de datos implementan de forma estricta:
1. `estado`: `1` (Activo) y `0` (Inactivo / Eliminado lógico). Ningún registro se destruye físicamente de la base de datos.
2. `creado`: Timestamp automático al insertar el registro.
3. `actualizado`: Timestamp gestionado mediante triggers automáticos de base de datos ante cualquier modificación.
