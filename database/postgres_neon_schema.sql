-- Esquema Principal: AgroConecta (PostgreSQL)

DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

-- Trigger de auditoría: actualizado
CREATE OR REPLACE FUNCTION actualizar_timestamp_trigger()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. rol
CREATE TABLE rol (
    id_rol SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(255),
    estado SMALLINT NOT NULL DEFAULT 1,
    creado TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trg_actualizado_rol
BEFORE UPDATE ON rol
FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp_trigger();

-- 2. usuario
CREATE TABLE usuario (
    id_usuario SERIAL PRIMARY KEY,
    id_rol INT NOT NULL REFERENCES rol(id_rol) ON UPDATE CASCADE,
    documento VARCHAR(30) NOT NULL UNIQUE,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    telefono VARCHAR(30),
    direccion VARCHAR(200),
    contrasena_hash VARCHAR(255) NOT NULL,
    estado SMALLINT NOT NULL DEFAULT 1,
    creado TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trg_actualizado_usuario
BEFORE UPDATE ON usuario
FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp_trigger();

-- 3. modulo
CREATE TABLE modulo (
    id_modulo SERIAL PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255),
    ruta VARCHAR(100) NOT NULL,
    estado SMALLINT NOT NULL DEFAULT 1,
    creado TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trg_actualizado_modulo
BEFORE UPDATE ON modulo
FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp_trigger();

-- 4. moduloxrol (RBAC)
CREATE TABLE moduloxrol (
    id_moduloxrol SERIAL PRIMARY KEY,
    id_rol INT NOT NULL REFERENCES rol(id_rol) ON DELETE RESTRICT ON UPDATE CASCADE,
    id_modulo INT NOT NULL REFERENCES modulo(id_modulo) ON DELETE RESTRICT ON UPDATE CASCADE,
    puede_crear BOOLEAN NOT NULL DEFAULT TRUE,
    puede_leer BOOLEAN NOT NULL DEFAULT TRUE,
    puede_actualizar BOOLEAN NOT NULL DEFAULT TRUE,
    puede_eliminar BOOLEAN NOT NULL DEFAULT FALSE,
    estado SMALLINT NOT NULL DEFAULT 1,
    creado TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_moduloxrol UNIQUE (id_rol, id_modulo)
);

CREATE TRIGGER trg_actualizado_moduloxrol
BEFORE UPDATE ON moduloxrol
FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp_trigger();

-- 5. finca
CREATE TABLE finca (
    id_finca SERIAL PRIMARY KEY,
    id_productor INT NOT NULL REFERENCES usuario(id_usuario) ON UPDATE CASCADE,
    nombre VARCHAR(120) NOT NULL,
    departamento VARCHAR(80) NOT NULL,
    municipio VARCHAR(80) NOT NULL,
    vereda VARCHAR(120),
    area_hectareas NUMERIC(8, 2),
    estado SMALLINT NOT NULL DEFAULT 1,
    creado TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_productor_finca UNIQUE (id_productor, nombre)
);

CREATE TRIGGER trg_actualizado_finca
BEFORE UPDATE ON finca
FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp_trigger();

-- 6. categoria_producto
CREATE TABLE categoria_producto (
    id_categoria SERIAL PRIMARY KEY,
    nombre VARCHAR(80) NOT NULL UNIQUE,
    descripcion VARCHAR(255),
    estado SMALLINT NOT NULL DEFAULT 1,
    creado TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trg_actualizado_categoria_producto
BEFORE UPDATE ON categoria_producto
FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp_trigger();

-- 7. producto
CREATE TABLE producto (
    id_producto SERIAL PRIMARY KEY,
    id_finca INT NOT NULL REFERENCES finca(id_finca) ON UPDATE CASCADE,
    id_categoria INT NOT NULL REFERENCES categoria_producto(id_categoria) ON UPDATE CASCADE,
    nombre VARCHAR(120) NOT NULL,
    descripcion TEXT,
    unidad_medida VARCHAR(30) NOT NULL DEFAULT 'KG',
    precio_unitario NUMERIC(12, 2) NOT NULL CHECK (precio_unitario >= 0),
    stock_disponible NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (stock_disponible >= 0),
    imagen_url VARCHAR(255),
    estado SMALLINT NOT NULL DEFAULT 1,
    creado TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trg_actualizado_producto
BEFORE UPDATE ON producto
FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp_trigger();

-- 8. pedido
CREATE TABLE pedido (
    id_pedido SERIAL PRIMARY KEY,
    codigo_pedido VARCHAR(30) NOT NULL UNIQUE,
    id_tienda INT NOT NULL REFERENCES usuario(id_usuario) ON UPDATE CASCADE,
    direccion_entrega VARCHAR(200) NOT NULL,
    municipio_entrega VARCHAR(80) NOT NULL,
    estado_pedido VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE',
    total NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (total >= 0),
    notas TEXT,
    estado SMALLINT NOT NULL DEFAULT 1,
    creado TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trg_actualizado_pedido
BEFORE UPDATE ON pedido
FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp_trigger();

-- 9. pedido_item
CREATE TABLE pedido_item (
    id_pedido_item SERIAL PRIMARY KEY,
    id_pedido INT NOT NULL REFERENCES pedido(id_pedido) ON DELETE CASCADE ON UPDATE CASCADE,
    id_producto INT NOT NULL REFERENCES producto(id_producto) ON UPDATE CASCADE,
    cantidad NUMERIC(10, 2) NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC(12, 2) NOT NULL CHECK (precio_unitario >= 0),
    subtotal NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0),
    estado SMALLINT NOT NULL DEFAULT 1,
    creado TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_pedido_producto UNIQUE (id_pedido, id_producto)
);

CREATE TRIGGER trg_actualizado_pedido_item
BEFORE UPDATE ON pedido_item
FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp_trigger();

-- 10. vehiculo
CREATE TABLE vehiculo (
    id_vehiculo SERIAL PRIMARY KEY,
    id_transportista INT NOT NULL REFERENCES usuario(id_usuario) ON UPDATE CASCADE,
    placa VARCHAR(15) NOT NULL UNIQUE,
    modelo VARCHAR(50),
    capacidad_toneladas NUMERIC(6, 2) NOT NULL CHECK (capacidad_toneladas > 0),
    tipo_carroceria VARCHAR(60) NOT NULL,
    aprobado_admin BOOLEAN NOT NULL DEFAULT FALSE,
    estado SMALLINT NOT NULL DEFAULT 1,
    creado TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trg_actualizado_vehiculo
BEFORE UPDATE ON vehiculo
FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp_trigger();

-- 11. solicitud_transporte
CREATE TABLE solicitud_transporte (
    id_solicitud SERIAL PRIMARY KEY,
    codigo_seguimiento VARCHAR(40) NOT NULL UNIQUE,
    id_pedido INT NOT NULL REFERENCES pedido(id_pedido) ON UPDATE CASCADE,
    id_transportista INT REFERENCES usuario(id_usuario) ON UPDATE CASCADE,
    id_vehiculo INT REFERENCES vehiculo(id_vehiculo) ON UPDATE CASCADE,
    estado_solicitud VARCHAR(30) NOT NULL DEFAULT 'SOLICITADO',
    costo_transporte NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (costo_transporte >= 0),
    observaciones TEXT,
    estado SMALLINT NOT NULL DEFAULT 1,
    creado TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trg_actualizado_solicitud_transporte
BEFORE UPDATE ON solicitud_transporte
FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp_trigger();

-- 12. calificacion
CREATE TABLE calificacion (
    id_calificacion SERIAL PRIMARY KEY,
    id_pedido INT NOT NULL REFERENCES pedido(id_pedido) ON UPDATE CASCADE,
    id_calificador INT NOT NULL REFERENCES usuario(id_usuario) ON UPDATE CASCADE,
    id_calificado INT NOT NULL REFERENCES usuario(id_usuario) ON UPDATE CASCADE,
    puntuacion INT NOT NULL CHECK (puntuacion BETWEEN 1 AND 5),
    comentario TEXT,
    estado SMALLINT NOT NULL DEFAULT 1,
    creado TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_pedido_calificacion UNIQUE (id_pedido, id_calificador, id_calificado)
);

CREATE TRIGGER trg_actualizado_calificacion
BEFORE UPDATE ON calificacion
FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp_trigger();

-- 13. historial_pedido_estado
CREATE TABLE historial_pedido_estado (
    id_historial SERIAL PRIMARY KEY,
    id_pedido INT NOT NULL REFERENCES pedido(id_pedido) ON DELETE CASCADE ON UPDATE CASCADE,
    id_usuario_cambio INT REFERENCES usuario(id_usuario) ON UPDATE CASCADE,
    estado_anterior VARCHAR(30),
    estado_nuevo VARCHAR(30) NOT NULL,
    comentario VARCHAR(255),
    estado SMALLINT NOT NULL DEFAULT 1,
    creado TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trg_actualizado_historial_pedido_estado
BEFORE UPDATE ON historial_pedido_estado
FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp_trigger();

-- Datos Semilla
-- Roles
INSERT INTO rol (id_rol, nombre, descripcion) VALUES
(1, 'ADMINISTRADOR', 'Control total y auditoría de la plataforma'),
(2, 'PRODUCTOR', 'Campesino productor que gestiona fincas y cosechas'),
(3, 'TIENDA', 'Comercio comprador que emite pedidos'),
(4, 'TRANSPORTISTA', 'Conductor logístico que traslada los pedidos');
SELECT setval('rol_id_rol_seq', (SELECT MAX(id_rol) FROM rol));

-- Módulos
INSERT INTO modulo (id_modulo, codigo, nombre, descripcion, ruta) VALUES
(1, 'MOD_SEGURIDAD', 'Gestión de Seguridad', 'Administración de usuarios y accesos', '/seguridad'),
(2, 'MOD_FINCAS', 'Gestión de Fincas', 'Registro y parcelas productivas', '/fincas'),
(3, 'MOD_CATALOGO', 'Catálogo de Productos', 'Cosechas, categorías y precios', '/catalogo'),
(4, 'MOD_PEDIDOS', 'Gestión de Pedidos', 'Emisión y despacho de órdenes', '/pedidos'),
(5, 'MOD_LOGISTICA', 'Gestión Logística', 'Asignación y seguimiento de transporte', '/logistica'),
(6, 'MOD_CALIDAD', 'Calificaciones y Soporte', 'Valoraciones del servicio', '/calidad');
SELECT setval('modulo_id_modulo_seq', (SELECT MAX(id_modulo) FROM modulo));

-- Permisos moduloxrol
INSERT INTO moduloxrol (id_rol, id_modulo, puede_crear, puede_leer, puede_actualizar, puede_eliminar) VALUES
(1, 1, TRUE, TRUE, TRUE, TRUE),
(1, 2, TRUE, TRUE, TRUE, TRUE),
(1, 3, TRUE, TRUE, TRUE, TRUE),
(1, 4, TRUE, TRUE, TRUE, TRUE),
(1, 5, TRUE, TRUE, TRUE, TRUE),
(1, 6, TRUE, TRUE, TRUE, TRUE),
(2, 2, TRUE, TRUE, TRUE, TRUE),
(2, 3, TRUE, TRUE, TRUE, TRUE),
(2, 4, FALSE, TRUE, TRUE, FALSE),
(2, 5, TRUE, TRUE, FALSE, FALSE),
(2, 6, TRUE, TRUE, FALSE, FALSE),
(3, 3, FALSE, TRUE, FALSE, FALSE),
(3, 4, TRUE, TRUE, TRUE, FALSE),
(3, 6, TRUE, TRUE, FALSE, FALSE),
(4, 4, FALSE, TRUE, TRUE, FALSE),
(4, 5, TRUE, TRUE, TRUE, FALSE);

-- Usuarios (Password123*)
INSERT INTO usuario (id_usuario, id_rol, documento, nombres, apellidos, correo, telefono, direccion, contrasena_hash) VALUES
(1, 1, '1000000001', 'Admin', 'Plataforma', 'admin@agroconecta.com', '3001234567', 'Calle 100 # 15-20, Bogotá', '$2b$12$XCbOZJf.l5RaW9CIVMh/1.6Z0z.WsuX52IuDLSAvbKcw5xSe/wW7u'),
(2, 2, '1000000002', 'Carlos', 'Pérez Gómez', 'carlos.productor@agroconecta.com', '3109876543', 'Vereda El Porvenir, Fusagasugá', '$2b$12$XCbOZJf.l5RaW9CIVMh/1.6Z0z.WsuX52IuDLSAvbKcw5xSe/wW7u'),
(3, 3, '1000000003', 'María', 'Restrepo Ruiz', 'maria.tienda@agroconecta.com', '3205554433', 'Carrera 7 # 45-12, Bogotá', '$2b$12$XCbOZJf.l5RaW9CIVMh/1.6Z0z.WsuX52IuDLSAvbKcw5xSe/wW7u'),
(4, 4, '1000000004', 'Jorge', 'García Díaz', 'jorge.transporte@agroconecta.com', '3157778899', 'Diagonal 40 # 22-10, Soacha', '$2b$12$XCbOZJf.l5RaW9CIVMh/1.6Z0z.WsuX52IuDLSAvbKcw5xSe/wW7u');
SELECT setval('usuario_id_usuario_seq', (SELECT MAX(id_usuario) FROM usuario));

-- Fincas
INSERT INTO finca (id_finca, id_productor, nombre, departamento, municipio, vereda, area_hectareas) VALUES
(1, 2, 'Finca La Primavera', 'Cundinamarca', 'Fusagasugá', 'El Placer', 5.50),
(2, 2, 'Finca El Roble', 'Boyacá', 'Villa de Leyva', 'Ritoque', 8.20);
SELECT setval('finca_id_finca_seq', (SELECT MAX(id_finca) FROM finca));

-- Categorías
INSERT INTO categoria_producto (id_categoria, nombre, descripcion) VALUES
(1, 'Frutas', 'Frutas frescas de temporada'),
(2, 'Verduras y Hortalizas', 'Verduras orgánicas de hoja'),
(3, 'Tubérculos y Plátanos', 'Papas, yuca y plátano'),
(4, 'Granos y Legumbres', 'Frijol, arveja y maíz');
SELECT setval('categoria_producto_id_categoria_seq', (SELECT MAX(id_categoria) FROM categoria_producto));

-- Productos
INSERT INTO producto (id_producto, id_finca, id_categoria, nombre, descripcion, unidad_medida, precio_unitario, stock_disponible) VALUES
(1, 1, 1, 'Tomate Chonto', 'Tomate fresco de selección', 'KG', 3500.00, 500.00),
(2, 1, 2, 'Lechuga Batavia', 'Lechuga crespa hidropónica', 'KG', 2800.00, 200.00),
(3, 2, 3, 'Papa Pastusa', 'Papa limpia seleccionada', 'KG', 2200.00, 1200.00),
(4, 2, 1, 'Mora de Castilla', 'Mora fresca seleccionada', 'KG', 4500.00, 350.00);
SELECT setval('producto_id_producto_seq', (SELECT MAX(id_producto) FROM producto));

-- Vehículos
INSERT INTO vehiculo (id_vehiculo, id_transportista, placa, modelo, capacidad_toneladas, tipo_carroceria, aprobado_admin) VALUES
(1, 4, 'WFL345', 'Chevrolet NHR 2022', 2.50, 'FURGON', TRUE),
(2, 4, 'SMR890', 'Hino Dutro 2021', 4.50, 'ESTACAS', TRUE);
SELECT setval('vehiculo_id_vehiculo_seq', (SELECT MAX(id_vehiculo) FROM vehiculo));

-- Pedidos
INSERT INTO pedido (id_pedido, codigo_pedido, id_tienda, direccion_entrega, municipio_entrega, estado_pedido, total, notas) VALUES
(1, 'PED-2025-0001', 3, 'Carrera 7 # 45-12', 'Bogotá', 'EN_RUTA', 175000.00, 'Entregar temprano');
SELECT setval('pedido_id_pedido_seq', (SELECT MAX(id_pedido) FROM pedido));

-- Items del pedido
INSERT INTO pedido_item (id_pedido_item, id_pedido, id_producto, cantidad, precio_unitario, subtotal) VALUES
(1, 1, 1, 30.00, 3500.00, 105000.00),
(2, 1, 2, 25.00, 2800.00, 70000.00);
SELECT setval('pedido_item_id_pedido_item_seq', (SELECT MAX(id_pedido_item) FROM pedido_item));

-- Solicitud de transporte
INSERT INTO solicitud_transporte (id_solicitud, codigo_seguimiento, id_pedido, id_transportista, id_vehiculo, estado_solicitud, costo_transporte, observaciones) VALUES
(1, 'TRK-2025-0091', 1, 4, 1, 'EN_CURSO', 45000.00, 'Ruta Fusagasugá-Bogotá');
SELECT setval('solicitud_transporte_id_solicitud_seq', (SELECT MAX(id_solicitud) FROM solicitud_transporte));

-- Historial de estados
INSERT INTO historial_pedido_estado (id_pedido, id_usuario_cambio, estado_anterior, estado_nuevo, comentario) VALUES
(1, 3, NULL, 'PENDIENTE', 'Creación del pedido'),
(1, 2, 'PENDIENTE', 'ACEPTADO', 'Aceptado por productor'),
(1, 4, 'ACEPTADO', 'EN_RUTA', 'Carga recolectada');

-- Calificaciones
INSERT INTO calificacion (id_calificacion, id_pedido, id_calificador, id_calificado, puntuacion, comentario) VALUES
(1, 1, 3, 2, 5, 'Excelente producto y puntualidad');
SELECT setval('calificacion_id_calificacion_seq', (SELECT MAX(id_calificacion) FROM calificacion));
