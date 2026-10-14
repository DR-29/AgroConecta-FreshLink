# Diccionario de Datos y Modelo Relacional

> **Proyecto:** AgroConecta (FreshLink)  
> **Parcial I:** Entregables 1.1 y 2.1  

---

## 1. Base de Datos Principal (PostgreSQL / Neon)

Esta base de datos contiene **13 tablas normalizadas** (superando el mínimo requerido de 12).  
Todas las tablas implementan de forma estricta los campos de auditoría y borrado lógico:
* `estado`: `SMALLINT DEFAULT 1` (1 = Activo, 0 = Inactivo / Borrado lógico).
* `creado`: `TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP`.
* `actualizado`: `TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP` (gestionado automáticamente mediante el trigger `actualizar_timestamp_trigger()`).

### Tablas y Descripción:

| N.° | Nombre de Tabla | Propósito y Relaciones | Campos Clave y Restricciones |
| :---: | :--- | :--- | :--- |
| **1** | `rol` *(Obligatoria)* | Define los roles del sistema (ADMINISTRADOR, PRODUCTOR, TIENDA, TRANSPORTISTA). | `id_rol` (PK), `nombre` (UNIQUE) |
| **2** | `usuario` *(Obligatoria)* | Usuarios registrados con credenciales cifradas y datos de contacto. | `id_usuario` (PK), `documento` (UNIQUE), `correo` (UNIQUE), `id_rol` (FK) |
| **3** | `modulo` *(Obligatoria)* | Módulos del sistema para control de acceso (Seguridad, Fincas, Catálogo, Pedidos, Logística, Calidad). | `id_modulo` (PK), `codigo` (UNIQUE), `ruta` |
| **4** | `moduloxrol` *(Obligatoria)* | Matriz de permisos RBAC granular (crear, leer, actualizar, eliminar). | `id_moduloxrol` (PK), `(id_rol, id_modulo)` (UNIQUE composite) |
| **5** | `finca` | Unidades productivas registradas por cada campesino productor. | `id_finca` (PK), `id_productor` (FK -> usuario), `(id_productor, nombre)` (UNIQUE) |
| **6** | `categoria_producto` | Clasificación de productos (Frutas, Verduras, Tubérculos, Granos). | `id_categoria` (PK), `nombre` (UNIQUE) |
| **7** | `producto` | Catálogo de cosechas con precio unitario, stock e inventario. | `id_producto` (PK), `id_finca` (FK), `id_categoria` (FK), `precio_unitario >= 0` |
| **8** | `pedido` | Encabezado de orden de compra emitido por una tienda. | `id_pedido` (PK), `codigo_pedido` (UNIQUE), `id_tienda` (FK), `estado_pedido` |
| **9** | `pedido_item` | Detalle de productos y cantidades compradas en cada pedido. | `id_pedido_item` (PK), `id_pedido` (FK), `id_producto` (FK), `(id_pedido, id_producto)` (UNIQUE) |
| **10** | `vehiculo` | Vehículos de transporte con capacidad y aprobación administrativa. | `id_vehiculo` (PK), `id_transportista` (FK), `placa` (UNIQUE) |
| **11** | `solicitud_transporte` | Asignación y coordinación logística de despacho y entrega. | `id_solicitud` (PK), `codigo_seguimiento` (UNIQUE), `id_pedido` (FK), `id_transportista` (FK) |
| **12** | `calificacion` | Valoraciones del servicio entre tiendas, productores y transportistas. | `id_calificacion` (PK), `id_pedido` (FK), `(id_pedido, id_calificador, id_calificado)` (UNIQUE), `puntuacion (1-5)` |
| **13** | `historial_pedido_estado` | Auditoría de cambios de estado del pedido con autor del cambio. | `id_historial` (PK), `id_pedido` (FK), `id_usuario_cambio` (FK) |

---

## 2. Base de Datos Auxiliar (MySQL)

Subsistema de **Pagos y Facturación Logística** con **3 tablas normalizadas** (mínimo requerido):
* `estado`: `TINYINT(1) DEFAULT 1`.
* `creado`: `TIMESTAMP DEFAULT CURRENT_TIMESTAMP`.
* `actualizado`: `TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`.

| N.° | Nombre de Tabla | Propósito y Relaciones | Campos Clave y Restricciones |
| :---: | :--- | :--- | :--- |
| **1** | `metodo_pago` | Catálogo de formas de pago (PSE, Tarjeta de Crédito, Transferencia, Contra Entrega). | `id_metodo` (PK), `codigo` (UNIQUE) |
| **2** | `transaccion_pago` | Transacciones de pago asociadas a los pedidos de la API principal. | `id_transaccion` (PK), `referencia_pago` (UNIQUE), `id_metodo` (FK) |
| **3** | `comprobante_factura` | Comprobantes y facturas electrónicas emitidas por cada transacción. | `id_factura` (PK), `numero_factura` (UNIQUE), `id_transaccion` (FK, UNIQUE 1:1) |

---

## 3. Instrucciones de Ejecución

### En Neon (PostgreSQL):
1. Ingresa a la consola de [Neon Console](https://console.neon.tech).
2. Selecciona tu proyecto o crea una base de datos limpia.
3. Abre la pestaña **SQL Editor**.
4. Copia y pega el contenido de [postgres_neon_schema.sql](file:///c:/Users/USER/Desktop/Parcial_1/database/postgres_neon_schema.sql) y ejecuta el script (*Run*).

### En MySQL (Local o Cloud):
1. Abre tu cliente MySQL (MySQL Workbench, DBeaver o phpMyAdmin).
2. Ejecuta el contenido de [mysql_schema.sql](file:///c:/Users/USER/Desktop/Parcial_1/database/mysql_schema.sql).
