# FreshLink API

Backend de AgroConecta/FreshLink para conectar productores, tiendas y transportistas.

## Tecnologias

- Kotlin + Spring Boot 3.2
- Spring Data JPA con H2 para desarrollo y PostgreSQL para despliegue
- Spring Security + JWT
- Jakarta Bean Validation
- Gradle Kotlin DSL

## Ejecucion

Requiere JDK 17. Desde IntelliJ o Antigravity, ejecutar `FreshLinkApplication`.

Desde terminal:

```bash
./gradlew bootRun
```

En Windows:

```powershell
.\gradlew.bat bootRun
```

La API utiliza el puerto `8080` por defecto.

## Base de datos

Sin `.env` se utiliza H2 en memoria: `jdbc:h2:mem:freshlink`, usuario `sa` y contrasena vacia. La consola H2 esta disponible en `http://localhost:8080/h2-console` durante desarrollo.

Para PostgreSQL, crear `.env` en la raiz:

```env
DATABASE_URL=jdbc:postgresql://host:5432/basedatos?sslmode=require
DATABASE_DRIVER=org.postgresql.Driver
DATABASE_USERNAME=usuario
DATABASE_PASSWORD=contrasena
DATABASE_PLATFORM=org.hibernate.dialect.PostgreSQLDialect
JPA_DDL_AUTO=update
```

No subir `.env` ni credenciales al repositorio.

## Usuarios de prueba

Se crean automaticamente cuando la base de datos esta vacia:

| Rol | Email | Contrasena |
|---|---|---|
| ADMIN | admin@freshlink.com | admin123 |
| PRODUCTOR | carlos@test.com | 123456 |
| TIENDA | maria@test.com | 123456 |
| TRANSPORTISTA aprobado/disponible | pedro@test.com | 123456 |
| TRANSPORTISTA aprobado/disponible | luis@test.com | 123456 |

El registro publico no permite crear usuarios con rol `ADMIN`. Los nuevos transportistas requieren aprobacion administrativa antes de recibir solicitudes.

## Autenticacion y roles

Ejecutar `POST /api/auth/login`, guardar el campo `token` y enviarlo asi:

```http
Authorization: Bearer <token>
```

- `/api/admin/**` -> ADMIN
- `/api/productor/**` -> PRODUCTOR
- `/api/tienda/**` -> TIENDA
- `/api/transportista/**` -> TRANSPORTISTA

## Endpoints actuales

### Auth: `/api/auth`

| Metodo | Ruta | Descripcion |
|---|---|---|
| POST | `/register` | Registrar productor, tienda o transportista |
| POST | `/login` | Iniciar sesion |
| POST | `/forgot-password` | Solicitar recuperacion sin revelar si el email existe |
| POST | `/reset-password` | Restablecer contrasena con token |

### Perfil: `/api/users`

| Metodo | Ruta | Descripcion |
|---|---|---|
| GET | `/me` | Consultar perfil propio |
| PUT | `/me` | Actualizar perfil y contrasena |

### Productor: `/api/productor`

| Metodo | Ruta | Descripcion |
|---|---|---|
| POST | `/fincas` | Crear finca |
| GET | `/fincas` | Listar fincas propias |
| POST | `/productos` | Publicar producto |
| GET | `/productos` | Listar productos propios |
| PUT | `/productos/{id}` | Actualizar producto propio |
| PATCH | `/productos/{id}/stock` | Actualizar stock con `{ "stock": 10 }` |
| GET | `/pedidos` | Listar pedidos recibidos |
| POST | `/pedidos/{id}/aceptar` | Aceptar pedido |
| POST | `/pedidos/{id}/seleccionar-transportista` | Crear solicitud pendiente |
| GET | `/transportistas` | Listar transportistas aprobados y disponibles |

### Tienda: `/api/tienda`

| Metodo | Ruta | Descripcion |
|---|---|---|
| GET | `/productos` | Buscar productos por termino o categoria |
| POST | `/pedidos` | Crear pedido |
| GET | `/pedidos` | Listar pedidos propios |
| GET | `/pedidos/{id}/seguimiento` | Consultar estado, historial y ultima ubicacion |
| POST | `/pedidos/{id}/calificar` | Calificar despues de entregar |
| POST | `/reclamaciones` | Crear reclamacion propia |

### Transportista: `/api/transportista`

| Metodo | Ruta | Descripcion |
|---|---|---|
| POST | `/vehiculos` | Registrar vehiculo si esta aprobado |
| GET | `/vehiculos` | Listar vehiculos propios |
| GET | `/solicitudes` | Listar solicitudes pendientes dirigidas al transportista |
| POST | `/solicitudes/{id}/aceptar` | Aceptar solicitud pendiente |
| POST | `/solicitudes/{id}/rechazar` | Rechazar solicitud pendiente |
| GET | `/servicios` | Listar servicios aceptados propios |
| PATCH | `/disponibilidad?disponible=true` | Cambiar disponibilidad |
| POST | `/ubicacion` | Compartir ubicacion |
| PATCH | `/pedidos/{id}/estado` | Marcar entrega como `ENTREGADO` |

### Administracion: `/api/admin`

| Metodo | Ruta | Descripcion |
|---|---|---|
| GET | `/usuarios` | Listar usuarios |
| POST | `/usuarios/{id}/toggle` | Habilitar o deshabilitar cuenta |
| PATCH | `/transportistas/{id}/aprobacion?aprobado=true` | Aprobar o rechazar transportista |
| GET | `/productos` | Listar productos |
| DELETE | `/productos/{id}` | Desactivar producto mediante eliminacion logica |
| GET | `/reclamaciones` | Listar reclamaciones |
| POST | `/reclamaciones/{id}/resolver` | Resolver reclamacion y registrar fecha |
| GET | `/reportes/usuarios` | Reporte de usuarios por rol |
| GET | `/reportes/pedidos` | Reporte de pedidos por estado |
| GET | `/reportes/calificaciones` | Total y promedio de calificaciones |

## Estados principales

- Pedido: `PENDIENTE`, `ACEPTADO`, `EN_TRANSPORTE`, `ENTREGADO`, `CANCELADO`.
- Solicitud: `PENDIENTE`, `ACEPTADA`, `RECHAZADA`, `COMPLETADA`.

La transicion de entrega implementada es `EN_TRANSPORTE -> ENTREGADO`. Un transportista solo aparece para seleccion cuando esta habilitado, aprobado y disponible.

## Validaciones y errores

Los DTOs usan Jakarta Validation. Las respuestas principales son `400` datos invalidos, `401` credenciales o autenticacion, `403` rol o recurso no permitido, `404` entidad inexistente y `409` conflictos o duplicados.

## CORS

Durante desarrollo se permiten solicitudes CORS desde cualquier origen. En produccion se debe restringir el origen al dominio real del frontend y utilizar HTTPS.

## Estructura

```text
src/main/kotlin/com/freshlink/
├── config/       # Seguridad, JWT, CORS y datos iniciales
├── controller/   # API REST
├── dto/          # Requests y responses
├── exception/    # Errores globales
├── model/        # Entidades y estados
├── repository/   # Repositorios JPA
└── service/      # Reglas de negocio
```

El frontend puede crearse en una carpeta separada, por ejemplo `frontend/`.

## Pendientes conocidos

- Configurar envio real de recuperacion de contrasena mediante SMTP.
- Agregar pruebas automatizadas.
- Verificar y estabilizar `bootJar` con el wrapper incluido.
- Implementar pagos y mensajeria si son exigidos por el alcance.
- Implementar WebSocket o SSE si se exige tiempo real.
- Configurar HTTPS, backups y secretos fuera del repositorio para produccion.
