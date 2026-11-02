-- ====================================================================
-- Script DDL para Microsoft Access (.accdb)
-- Proyecto: AgroConecta (FreshLink)
-- Compatible con dialecto Jet / ACE SQL de Microsoft Access
-- ====================================================================

-- 1. Tabla: ROL
CREATE TABLE rol (
    id_rol AUTOINCREMENT CONSTRAINT pk_rol PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL CONSTRAINT uk_rol_nombre UNIQUE,
    descripcion LONGTEXT,
    estado SHORT DEFAULT 1,
    creado DATETIME,
    actualizado DATETIME
);

-- 2. Tabla: USUARIO
CREATE TABLE usuario (
    id_usuario AUTOINCREMENT CONSTRAINT pk_usuario PRIMARY KEY,
    documento VARCHAR(30) NOT NULL CONSTRAINT uk_usuario_doc UNIQUE,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    correo VARCHAR(150) NOT NULL CONSTRAINT uk_usuario_correo UNIQUE,
    contrasena_hash VARCHAR(255) NOT NULL,
    telefono VARCHAR(30),
    direccion VARCHAR(200),
    id_rol INTEGER NOT NULL,
    estado SHORT DEFAULT 1,
    creado DATETIME,
    actualizado DATETIME
);

-- 3. Tabla: MODULO
CREATE TABLE modulo (
    id_modulo AUTOINCREMENT CONSTRAINT pk_modulo PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL CONSTRAINT uk_modulo_cod UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    ruta VARCHAR(100) NOT NULL,
    icono VARCHAR(50),
    orden INTEGER DEFAULT 0,
    estado SHORT DEFAULT 1,
    creado DATETIME,
    actualizado DATETIME
);

-- 4. Tabla: MODULOXROL
CREATE TABLE moduloxrol (
    id_moduloxrol AUTOINCREMENT CONSTRAINT pk_moduloxrol PRIMARY KEY,
    id_rol INTEGER NOT NULL,
    id_modulo INTEGER NOT NULL,
    puede_crear YESNO DEFAULT False,
    puede_leer YESNO DEFAULT True,
    puede_actualizar YESNO DEFAULT False,
    puede_eliminar YESNO DEFAULT False,
    estado SHORT DEFAULT 1,
    creado DATETIME,
    actualizado DATETIME
);

-- 5. Tabla: FINCA
CREATE TABLE finca (
    id_finca AUTOINCREMENT CONSTRAINT pk_finca PRIMARY KEY,
    id_productor INTEGER NOT NULL,
    nombre VARCHAR(120) NOT NULL,
    departamento VARCHAR(80) NOT NULL,
    municipio VARCHAR(80) NOT NULL,
    vereda VARCHAR(120),
    hectareas DOUBLE,
    estado SHORT DEFAULT 1,
    creado DATETIME,
    actualizado DATETIME
);

-- 6. Tabla: CATEGORIA_PRODUCTO
CREATE TABLE categoria_producto (
    id_categoria AUTOINCREMENT CONSTRAINT pk_categoria PRIMARY KEY,
    nombre VARCHAR(80) NOT NULL CONSTRAINT uk_cat_nombre UNIQUE,
    descripcion LONGTEXT,
    icono VARCHAR(50),
    estado SHORT DEFAULT 1,
    creado DATETIME,
    actualizado DATETIME
);

-- 7. Tabla: PRODUCTO
CREATE TABLE producto (
    id_producto AUTOINCREMENT CONSTRAINT pk_producto PRIMARY KEY,
    id_finca INTEGER NOT NULL,
    id_categoria INTEGER NOT NULL,
    nombre VARCHAR(120) NOT NULL,
    descripcion LONGTEXT,
    unidad_medida VARCHAR(20) NOT NULL,
    precio_unitario CURRENCY NOT NULL,
    stock_disponible DOUBLE NOT NULL,
    imagen_url LONGTEXT,
    estado SHORT DEFAULT 1,
    creado DATETIME,
    actualizado DATETIME
);

-- 8. Tabla: PEDIDO
CREATE TABLE pedido (
    id_pedido AUTOINCREMENT CONSTRAINT pk_pedido PRIMARY KEY,
    codigo_pedido VARCHAR(30) NOT NULL CONSTRAINT uk_pedido_cod UNIQUE,
    id_tienda INTEGER NOT NULL,
    direccion_entrega VARCHAR(200) NOT NULL,
    municipio_entrega VARCHAR(80) NOT NULL,
    estado_pedido VARCHAR(30) DEFAULT 'PENDIENTE',
    total CURRENCY DEFAULT 0,
    notas LONGTEXT,
    estado SHORT DEFAULT 1,
    creado DATETIME,
    actualizado DATETIME
);

-- 9. Tabla: PEDIDO_ITEM
CREATE TABLE pedido_item (
    id_pedido_item AUTOINCREMENT CONSTRAINT pk_pedido_item PRIMARY KEY,
    id_pedido INTEGER NOT NULL,
    id_producto INTEGER NOT NULL,
    cantidad DOUBLE NOT NULL,
    precio_unitario CURRENCY NOT NULL,
    subtotal CURRENCY NOT NULL,
    estado SHORT DEFAULT 1,
    creado DATETIME,
    actualizado DATETIME
);

-- 10. Tabla: VEHICULO
CREATE TABLE vehiculo (
    id_vehiculo AUTOINCREMENT CONSTRAINT pk_vehiculo PRIMARY KEY,
    id_transportista INTEGER NOT NULL,
    placa VARCHAR(10) NOT NULL CONSTRAINT uk_vehiculo_placa UNIQUE,
    modelo VARCHAR(80) NOT NULL,
    capacidad_toneladas DOUBLE NOT NULL,
    tipo_carroceria VARCHAR(50),
    aprobado_admin YESNO DEFAULT False,
    estado SHORT DEFAULT 1,
    creado DATETIME,
    actualizado DATETIME
);

-- 11. Tabla: SOLICITUD_TRANSPORTE
CREATE TABLE solicitud_transporte (
    id_solicitud AUTOINCREMENT CONSTRAINT pk_solicitud PRIMARY KEY,
    codigo_seguimiento VARCHAR(40) NOT NULL CONSTRAINT uk_sol_seg UNIQUE,
    id_pedido INTEGER NOT NULL,
    id_transportista INTEGER NOT NULL,
    id_vehiculo INTEGER NOT NULL,
    estado_solicitud VARCHAR(30) DEFAULT 'SOLICITADO',
    costo_transporte CURRENCY NOT NULL,
    observaciones LONGTEXT,
    estado SHORT DEFAULT 1,
    creado DATETIME,
    actualizado DATETIME
);

-- 12. Tabla: CALIFICACION
CREATE TABLE calificacion (
    id_calificacion AUTOINCREMENT CONSTRAINT pk_calificacion PRIMARY KEY,
    id_pedido INTEGER NOT NULL,
    id_calificador INTEGER NOT NULL,
    id_calificado INTEGER NOT NULL,
    puntuacion INTEGER NOT NULL,
    comentario LONGTEXT,
    estado SHORT DEFAULT 1,
    creado DATETIME,
    actualizado DATETIME
);

-- 13. Tabla: HISTORIAL_PEDIDO_ESTADO
CREATE TABLE historial_pedido_estado (
    id_historial AUTOINCREMENT CONSTRAINT pk_historial PRIMARY KEY,
    id_pedido INTEGER NOT NULL,
    id_usuario_cambio INTEGER NOT NULL,
    estado_anterior VARCHAR(30),
    estado_nuevo VARCHAR(30) NOT NULL,
    comentario LONGTEXT,
    estado SHORT DEFAULT 1,
    creado DATETIME,
    actualizado DATETIME
);

-- ====================================================================
-- TABLAS DEL SUBSISTEMA DE PAGOS (MySQL reflejadas en Access)
-- ====================================================================

-- 14. Tabla: METODO_PAGO
CREATE TABLE metodo_pago (
    id_metodo AUTOINCREMENT CONSTRAINT pk_metodo PRIMARY KEY,
    codigo VARCHAR(40) NOT NULL CONSTRAINT uk_metodo_cod UNIQUE,
    nombre VARCHAR(80) NOT NULL,
    descripcion LONGTEXT,
    estado SHORT DEFAULT 1,
    creado DATETIME,
    actualizado DATETIME
);

-- 15. Tabla: TRANSACCION_PAGO
CREATE TABLE transaccion_pago (
    id_transaccion AUTOINCREMENT CONSTRAINT pk_transaccion PRIMARY KEY,
    id_pedido INTEGER,
    id_metodo INTEGER NOT NULL,
    referencia_pago VARCHAR(60) NOT NULL CONSTRAINT uk_tx_ref UNIQUE,
    monto_total CURRENCY NOT NULL,
    estado_pago VARCHAR(30) DEFAULT 'PENDIENTE',
    creado DATETIME,
    actualizado DATETIME
);

-- 16. Tabla: COMPROBANTE_FACTURA
CREATE TABLE comprobante_factura (
    id_factura AUTOINCREMENT CONSTRAINT pk_factura PRIMARY KEY,
    id_transaccion INTEGER NOT NULL CONSTRAINT uk_fac_tx UNIQUE,
    numero_factura VARCHAR(40) NOT NULL CONSTRAINT uk_fac_num UNIQUE,
    nit_emisor VARCHAR(30) NOT NULL,
    razon_social_emisor VARCHAR(120),
    subtotal CURRENCY NOT NULL,
    iva CURRENCY NOT NULL,
    total CURRENCY NOT NULL,
    url_pdf LONGTEXT,
    estado SHORT DEFAULT 1,
    creado DATETIME,
    actualizado DATETIME
);
