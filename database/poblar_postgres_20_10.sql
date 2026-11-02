-- ==============================================================================
-- AgroConecta (FreshLink) - Script de Poblado 20/10 para Taller 1 Corte 2
-- PostgreSQL (Neon Cloud)
-- Cumple: Mínimo 20 registros en tablas principales y 10 en secundarias
-- Contraseña común para todos los usuarios: Password123*
-- Hash bcrypt: $2b$12$XCbOZJf.l5RaW9CIVMh/1.6Z0z.WsuX52IuDLSAvbKcw5xSe/wW7u
-- ==============================================================================

-- 1. Categorías de Productos (Secundaria: 10 registros)
INSERT INTO categoria_producto (id_categoria, nombre, descripcion) VALUES
(1, 'Frutas Frescas', 'Frutas de temporada, cítricos y pulpas de origen'),
(2, 'Verduras y Hortalizas', 'Hortalizas de hoja verde, legumbres y ensaladas'),
(3, 'Tubérculos y Raíces', 'Papas seleccionadas, yuca, arracacha y plátano'),
(4, 'Granos y Legumbres', 'Frijol, arveja, lenteja, garbanzo y maíz'),
(5, 'Hierbas y Aromáticas', 'Cilantro, perejil, albahaca, menta y hierbabuena'),
(6, 'Cítricos de Valle', 'Naranja valencia, limón tahití y mandarina arrayana'),
(7, 'Frutas Exóticas', 'Uchuva, gulupa, maracuyá, lulo y granadilla'),
(8, 'Café y Cacao Especial', 'Café pergamino seco de origen y cacao fino'),
(9, 'Hongos y Setas', 'Champiñón blanco, orellana y portobello fresco'),
(10, 'Hortalizas de Fruto', 'Tomate chonto, pimentón rojo, pepino cohombro y berenjena')
ON CONFLICT (id_categoria) DO UPDATE 
SET nombre = EXCLUDED.nombre, descripcion = EXCLUDED.descripcion;

SELECT setval('categoria_producto_id_categoria_seq', (SELECT MAX(id_categoria) FROM categoria_producto));

-- 2. Usuarios del Sistema (Principal: 20 registros)
-- id_rol: 1 = ADMIN, 2 = PRODUCTOR, 3 = TIENDA, 4 = TRANSPORTISTA
INSERT INTO usuario (id_usuario, id_rol, documento, nombres, apellidos, correo, telefono, direccion, contrasena_hash) VALUES
-- 1 Admin
(1, 1, '1000000001', 'Diego Fernando', 'Gómez Administrador', 'admin@agroconecta.com', '3001234567', 'Calle 100 # 15-20, Bogotá', '$2b$12$XCbOZJf.l5RaW9CIVMh/1.6Z0z.WsuX52IuDLSAvbKcw5xSe/wW7u'),
-- 8 Productores Campesinos
(2, 2, '1000000002', 'Carlos Alberto', 'Pérez Gómez', 'carlos.productor@agroconecta.com', '3109876543', 'Vereda El Porvenir, Fusagasugá', '$2b$12$XCbOZJf.l5RaW9CIVMh/1.6Z0z.WsuX52IuDLSAvbKcw5xSe/wW7u'),
(3, 2, '1000000003', 'José Ignacio', 'Martínez Silva', 'jose.campesino@agroconecta.com', '3112345678', 'Vereda Ritoque, Villa de Leyva', '$2b$12$XCbOZJf.l5RaW9CIVMh/1.6Z0z.WsuX52IuDLSAvbKcw5xSe/wW7u'),
(4, 2, '1000000004', 'Rosa Elena', 'Rodríguez Vargas', 'rosa.rodriguez@agroconecta.com', '3123456789', 'Vereda La Isla, Subachoque', '$2b$12$XCbOZJf.l5RaW9CIVMh/1.6Z0z.WsuX52IuDLSAvbKcw5xSe/wW7u'),
(5, 2, '1000000005', 'Héctor Manuel', 'Gutiérrez Morales', 'hector.gutierrez@agroconecta.com', '3134567890', 'Vereda Cascadas, Ventaquemada', '$2b$12$XCbOZJf.l5RaW9CIVMh/1.6Z0z.WsuX52IuDLSAvbKcw5xSe/wW7u'),
(6, 2, '1000000006', 'Blanca Nieve', 'Torres Benítez', 'blanca.torres@agroconecta.com', '3145678901', 'Vereda San Lorenzo, Guasca', '$2b$12$XCbOZJf.l5RaW9CIVMh/1.6Z0z.WsuX52IuDLSAvbKcw5xSe/wW7u'),
(7, 2, '1000000007', 'Arnulfo', 'Mendoza Parra', 'arnulfo.mendoza@agroconecta.com', '3156789012', 'Vereda Chuntame, Cajicá', '$2b$12$XCbOZJf.l5RaW9CIVMh/1.6Z0z.WsuX52IuDLSAvbKcw5xSe/wW7u'),
(8, 2, '1000000008', 'Luz Marina', 'Ospina Duque', 'luz.ospina@agroconecta.com', '3167890123', 'Vereda Bojacá, Facatativá', '$2b$12$XCbOZJf.l5RaW9CIVMh/1.6Z0z.WsuX52IuDLSAvbKcw5xSe/wW7u'),
(9, 2, '1000000009', 'Gilberto', 'Cárdenas Prieto', 'gilberto.cardenas@agroconecta.com', '3178901234', 'Vereda Tibitó, Tocancipá', '$2b$12$XCbOZJf.l5RaW9CIVMh/1.6Z0z.WsuX52IuDLSAvbKcw5xSe/wW7u'),
-- 7 Tiendas y Comercios
(10, 3, '1000000010', 'María Camila', 'Restrepo Ruiz', 'maria.tienda@agroconecta.com', '3205554433', 'Carrera 7 # 45-12, Bogotá', '$2b$12$XCbOZJf.l5RaW9CIVMh/1.6Z0z.WsuX52IuDLSAvbKcw5xSe/wW7u'),
(11, 3, '1000000011', 'Andrés Felipe', 'Castro Montero', 'fruteria.castro@agroconecta.com', '3216549870', 'Calle 53 # 14-25, Chapinero, Bogotá', '$2b$12$XCbOZJf.l5RaW9CIVMh/1.6Z0z.WsuX52IuDLSAvbKcw5xSe/wW7u'),
(12, 3, '1000000012', 'Paola Andrea', 'Suárez Niño', 'minimercado.suarez@agroconecta.com', '3227654321', 'Avenida Primero de Mayo # 28-10, Bogotá', '$2b$12$XCbOZJf.l5RaW9CIVMh/1.6Z0z.WsuX52IuDLSAvbKcw5xSe/wW7u'),
(13, 3, '1000000013', 'Gustavo Adolfo', 'Pardo Peña', 'restaurante.verde@agroconecta.com', '3238765432', 'Calle 116 # 19-40, Usaquén, Bogotá', '$2b$12$XCbOZJf.l5RaW9CIVMh/1.6Z0z.WsuX52IuDLSAvbKcw5xSe/wW7u'),
(14, 3, '1000000014', 'Claudia Marcela', 'Mejía Rueda', 'mercado.saludable@agroconecta.com', '3249876543', 'Carrera 15 # 85-30, Bogotá', '$2b$12$XCbOZJf.l5RaW9CIVMh/1.6Z0z.WsuX52IuDLSAvbKcw5xSe/wW7u'),
(15, 3, '1000000015', 'Javier Eduardo', 'Bohórquez Cruz', 'supermercado.central@agroconecta.com', '3250987654', 'Calle 13 # 68D-40, Fontibón, Bogotá', '$2b$12$XCbOZJf.l5RaW9CIVMh/1.6Z0z.WsuX52IuDLSAvbKcw5xSe/wW7u'),
(16, 3, '1000000016', 'Diana Patricia', 'Herrera Vega', 'diana.tienda@agroconecta.com', '3261098765', 'Carrera 9 # 12-45, Chía', '$2b$12$XCbOZJf.l5RaW9CIVMh/1.6Z0z.WsuX52IuDLSAvbKcw5xSe/wW7u'),
-- 4 Transportistas de Carga
(17, 4, '1000000017', 'Jorge Eliécer', 'García Díaz', 'jorge.transporte@agroconecta.com', '3157778899', 'Diagonal 40 # 22-10, Soacha', '$2b$12$XCbOZJf.l5RaW9CIVMh/1.6Z0z.WsuX52IuDLSAvbKcw5xSe/wW7u'),
(18, 4, '1000000018', 'Pedro Pablo', 'Morales León', 'pedro.transporte@agroconecta.com', '3182345678', 'Carrera 4 # 18-35, Fusagasugá', '$2b$12$XCbOZJf.l5RaW9CIVMh/1.6Z0z.WsuX52IuDLSAvbKcw5xSe/wW7u'),
(19, 4, '1000000019', 'Luis Alberto', 'Vargas Beltrán', 'luis.transporte@agroconecta.com', '3193456789', 'Calle 8 # 5-20, Facatativá', '$2b$12$XCbOZJf.l5RaW9CIVMh/1.6Z0z.WsuX52IuDLSAvbKcw5xSe/wW7u'),
(20, 4, '1000000020', 'Wilson Antonio', 'Gómez Rincón', 'wilson.transporte@agroconecta.com', '3204567890', 'Avenida Boyacá # 65-12, Bogotá', '$2b$12$XCbOZJf.l5RaW9CIVMh/1.6Z0z.WsuX52IuDLSAvbKcw5xSe/wW7u')
ON CONFLICT (id_usuario) DO UPDATE
SET nombres = EXCLUDED.nombres, apellidos = EXCLUDED.apellidos, correo = EXCLUDED.correo,
    telefono = EXCLUDED.telefono, direccion = EXCLUDED.direccion, contrasena_hash = EXCLUDED.contrasena_hash;

SELECT setval('usuario_id_usuario_seq', (SELECT MAX(id_usuario) FROM usuario));

-- 3. Fincas y Unidades Productivas (Principal: 20 registros)
INSERT INTO finca (id_finca, id_productor, nombre, departamento, municipio, vereda, area_hectareas) VALUES
(1, 2, 'Finca La Primavera', 'Cundinamarca', 'Fusagasugá', 'El Porvenir', 5.50),
(2, 2, 'Finca El Roble', 'Boyacá', 'Villa de Leyva', 'Ritoque', 8.20),
(3, 3, 'Hacienda San José', 'Boyacá', 'Villa de Leyva', 'Sote', 12.00),
(4, 3, 'Finca El Mirador', 'Boyacá', 'Tunja', 'Pirgua', 4.80),
(5, 4, 'Granja Santa Helena', 'Cundinamarca', 'Subachoque', 'La Pradera', 6.50),
(6, 4, 'Finca Los Cerezos', 'Cundinamarca', 'Subachoque', 'El Pantano', 3.20),
(7, 5, 'Finca La Esperanza', 'Boyacá', 'Ventaquemada', 'Parroquial', 9.00),
(8, 5, 'Parcela Bella Vista', 'Boyacá', 'Samacá', 'Ruhueco', 4.50),
(9, 6, 'Finca El Paraíso', 'Cundinamarca', 'Guasca', 'San Lorenzo', 7.80),
(10, 6, 'Granja El Vergel', 'Cundinamarca', 'Guasca', 'Pastor Ospina', 5.00),
(11, 7, 'Finca Arrayanes', 'Cundinamarca', 'Cajicá', 'Chuntame', 3.80),
(12, 7, 'Huerta Los Sauces', 'Cundinamarca', 'Tabio', 'Riofrío', 2.50),
(13, 8, 'Finca San Francisco', 'Cundinamarca', 'Facatativá', 'Mancilla', 10.20),
(14, 8, 'Hacienda La Palma', 'Cundinamarca', 'Zipacón', 'El Chuscal', 6.40),
(15, 9, 'Finca Los Pinos', 'Cundinamarca', 'Tocancipá', 'Canavita', 4.20),
(16, 9, 'Granja El Recreo', 'Cundinamarca', 'Gachancipá', 'Roble Agrario', 5.60),
(17, 2, 'Parcela La Colina', 'Cundinamarca', 'Pasca', 'Lázaro Fonte', 3.00),
(18, 3, 'Finca El Bosque', 'Boyacá', 'Arcabuco', 'Peñas Blancas', 6.80),
(19, 4, 'Granja El Rosal', 'Cundinamarca', 'El Rosal', 'Puerta Roja', 4.00),
(20, 5, 'Finca Aguas Claras', 'Boyacá', 'Turmequé', 'Rosas Grande', 8.50)
ON CONFLICT (id_finca) DO UPDATE
SET nombre = EXCLUDED.nombre, departamento = EXCLUDED.departamento, municipio = EXCLUDED.municipio,
    vereda = EXCLUDED.vereda, area_hectareas = EXCLUDED.area_hectareas;

SELECT setval('finca_id_finca_seq', (SELECT MAX(id_finca) FROM finca));

-- 4. Productos y Cosechas (Principal: 20 registros)
INSERT INTO producto (id_producto, id_finca, id_categoria, nombre, descripcion, unidad_medida, precio_unitario, stock_disponible) VALUES
(1, 1, 10, 'Tomate Chonto Primera', 'Tomate chonto fresco seleccionado para mesa y salsas', 'KG', 3500.00, 850.00),
(2, 1, 2, 'Pimentón Rojo California', 'Pimentón carnoso de invernadero sin agroquímicos', 'KG', 4200.00, 320.00),
(3, 2, 3, 'Papa Pastusa Seleccionada', 'Papa limpia de bulto tradicional para asar y puré', 'BULTO', 95000.00, 140.00),
(4, 2, 7, 'Mora de Castilla Fresca', 'Mora agridulce seleccionada para jugos y postres', 'CANASTILLA', 32000.00, 85.00),
(5, 3, 3, 'Papa Criolla Limpia', 'Papa criolla dorada redonda de primera', 'BULTO', 120000.00, 90.00),
(6, 3, 4, 'Arveja Verde en Vaina', 'Arveja dulce recién cosechada sin desgranar', 'BULTO', 140000.00, 60.00),
(7, 4, 3, 'Cebolla Cabezona Roja', 'Cebolla de bulbo firme y excelente conservación', 'BULTO', 75000.00, 110.00),
(8, 5, 2, 'Lechuga Batavia Crespa', 'Lechuga hidropónica de hoja tierna y crujiente', 'UNIDAD', 2200.00, 600.00),
(9, 5, 2, 'Espinaca Bogotana', 'Espinaca fresca de hoja ancha libre de pesticidas', 'KG', 3000.00, 250.00),
(10, 6, 1, 'Fresa Chandler Seleccionada', 'Fresa dulce de alta calidad tamaño extra', 'CANASTILLA', 28000.00, 120.00),
(11, 7, 3, 'Zanahoria Selección Lavada', 'Zanahoria dulce uniforme lavada para ensaladas', 'BULTO', 68000.00, 180.00),
(12, 8, 4, 'Frijol Rojo Sabanero', 'Frijol seco empacado de excelente cocción', 'KG', 8500.00, 450.00),
(13, 9, 5, 'Cilantro Criollo de Huerta', 'Cilantro aromático de corte fresco matutino', 'KG', 4000.00, 180.00),
(14, 10, 7, 'Uchuva de Exportación', 'Uchuva con capacho dorada de exportación', 'CANASTILLA', 45000.00, 75.00),
(15, 11, 2, 'Brócoli Selección Corona', 'Brócoli verde fresco sin tallo excesivo', 'KG', 3800.00, 280.00),
(16, 12, 5, 'Albahaca Verde Genovesa', 'Albahaca aromática ideal para pastas y salsas', 'LIBRA', 5000.00, 150.00),
(17, 13, 6, 'Naranja Valencia Jugo', 'Naranja dulce jugosa especial para fruterías', 'BULTO', 82000.00, 200.00),
(18, 14, 6, 'Limón Tahití Extra', 'Limón sin semilla verde oscuro y jugoso', 'BULTO', 110000.00, 95.00),
(19, 15, 9, 'Champiñón Blanco Entero', 'Champiñón cultivado en cámara limpia protegido', 'KG', 12000.00, 160.00),
(20, 16, 8, 'Café Pergamino Especial', 'Café lavado variedad castillo con notas frutales', 'KG', 22000.00, 300.00)
ON CONFLICT (id_producto) DO UPDATE
SET nombre = EXCLUDED.nombre, descripcion = EXCLUDED.descripcion, unidad_medida = EXCLUDED.unidad_medida,
    precio_unitario = EXCLUDED.precio_unitario, stock_disponible = EXCLUDED.stock_disponible;

SELECT setval('producto_id_producto_seq', (SELECT MAX(id_producto) FROM producto));

-- 5. Vehículos de Carga (Principal: 20 registros)
-- Transportistas: IDs 17, 18, 19, 20
INSERT INTO vehiculo (id_vehiculo, id_transportista, placa, modelo, capacidad_toneladas, tipo_carroceria, aprobado_admin) VALUES
(1, 17, 'WFL345', 'Chevrolet NHR 2022', 2.50, 'FURGON', TRUE),
(2, 17, 'SMR890', 'Hino Dutro Pro 2021', 4.50, 'ESTACAS', TRUE),
(3, 17, 'TKR123', 'JAC 1040 Turbo 2023', 3.00, 'REFRIGERADO', TRUE),
(4, 17, 'UVO456', 'Foton Aumark 2020', 3.50, 'FURGON', TRUE),
(5, 17, 'XLM789', 'Hyundai HD65 2019', 4.00, 'ESTACAS', TRUE),
(6, 18, 'VZA234', 'Chevrolet NKR 2022', 3.00, 'FURGON', TRUE),
(7, 18, 'WZB567', 'Hino 300 Series 2023', 5.00, 'ESTACAS', TRUE),
(8, 18, 'XZC890', 'JAC HFC 2021', 2.80, 'FURGON', TRUE),
(9, 18, 'TYD123', 'Foton Ollin 2022', 4.20, 'REFRIGERADO', TRUE),
(10, 18, 'RFE456', 'Mitsubishi Canter 2020', 3.80, 'PLATAFORMA', TRUE),
(11, 19, 'SGA789', 'Chevrolet FTR 2021', 5.50, 'ESTACAS', TRUE),
(12, 19, 'TGB012', 'Hino Dutro City 2023', 3.20, 'FURGON', TRUE),
(13, 19, 'UHC345', 'JAC Grand 2022', 4.00, 'FURGON', TRUE),
(14, 19, 'VJD678', 'Foton Tornado 2020', 3.00, 'ESTACAS', TRUE),
(15, 19, 'WKE901', 'ISUZU Reward 2024', 4.80, 'REFRIGERADO', TRUE),
(16, 20, 'XLF234', 'Chevrolet NQR 2022', 5.00, 'ESTACAS', TRUE),
(17, 20, 'YMG567', 'Hino 500 Series 2021', 6.00, 'FURGON', TRUE),
(18, 20, 'ZNH890', 'JAC 1063 Turbo 2023', 3.50, 'FURGON', TRUE),
(19, 20, 'AKJ123', 'Foton Auman 2022', 5.20, 'PLATAFORMA', TRUE),
(20, 20, 'BLM456', 'Hyundai Mighty 2023', 4.00, 'ESTACAS', TRUE)
ON CONFLICT (id_vehiculo) DO UPDATE
SET placa = EXCLUDED.placa, modelo = EXCLUDED.modelo, capacidad_toneladas = EXCLUDED.capacidad_toneladas,
    tipo_carroceria = EXCLUDED.tipo_carroceria, aprobado_admin = EXCLUDED.aprobado_admin;

SELECT setval('vehiculo_id_vehiculo_seq', (SELECT MAX(id_vehiculo) FROM vehiculo));

-- 6. Pedidos (Principal: 20 registros)
-- Tiendas: IDs 10, 11, 12, 13, 14, 15, 16
INSERT INTO pedido (id_pedido, codigo_pedido, id_tienda, direccion_entrega, municipio_entrega, estado_pedido, total, notas) VALUES
(1, 'PED-2025-0001', 10, 'Carrera 7 # 45-12', 'Bogotá', 'ENTREGADO', 175000.00, 'Entregar temprano antes de las 8am'),
(2, 'PED-2025-0002', 10, 'Carrera 7 # 45-12', 'Bogotá', 'EN_RUTA', 285000.00, 'Cosecha de papa para surtido'),
(3, 'PED-2025-0003', 11, 'Calle 53 # 14-25', 'Bogotá', 'ENTREGADO', 320000.00, 'Frutas de temporada para jugos'),
(4, 'PED-2025-0004', 11, 'Calle 53 # 14-25', 'Bogotá', 'EN_RUTA', 190000.00, 'Mora y fresa en canastilla'),
(5, 'PED-2025-0005', 12, 'Avenida Primero de Mayo # 28-10', 'Bogotá', 'ACEPTADO', 450000.00, 'Surtido completo de hortalizas'),
(6, 'PED-2025-0006', 12, 'Avenida Primero de Mayo # 28-10', 'Bogotá', 'PENDIENTE', 135000.00, 'Tomate y cebolla cabezona'),
(7, 'PED-2025-0007', 13, 'Calle 116 # 19-40', 'Bogotá', 'ENTREGADO', 520000.00, 'Insumos frescos para cocina gourmet'),
(8, 'PED-2025-0008', 13, 'Calle 116 # 19-40', 'Bogotá', 'EN_RUTA', 240000.00, 'Champiñones y hierbas aromáticas'),
(9, 'PED-2025-0009', 14, 'Carrera 15 # 85-30', 'Bogotá', 'ENTREGADO', 380000.00, 'Frutas exóticas uchuva y gulupa'),
(10, 'PED-2025-0010', 14, 'Carrera 15 # 85-30', 'Bogotá', 'ACEPTADO', 165000.00, 'Espinaca y lechugas hidropónicas'),
(11, 'PED-2025-0011', 15, 'Calle 13 # 68D-40', 'Bogotá', 'ENTREGADO', 620000.00, 'Papa pastusa y zanahoria lavada'),
(12, 'PED-2025-0012', 15, 'Calle 13 # 68D-40', 'Bogotá', 'EN_RUTA', 290000.00, 'Cítricos de valle naranja y limón'),
(13, 'PED-2025-0013', 16, 'Carrera 9 # 12-45', 'Chía', 'ENTREGADO', 210000.00, 'Entrega directa local Chía'),
(14, 'PED-2025-0014', 16, 'Carrera 9 # 12-45', 'Chía', 'PENDIENTE', 145000.00, 'Frijol y arveja fresca'),
(15, 'PED-2025-0015', 10, 'Carrera 7 # 45-12', 'Bogotá', 'ACEPTADO', 310000.00, 'Pedido de refuerzo fin de semana'),
(16, 'PED-2025-0016', 11, 'Calle 53 # 14-25', 'Bogotá', 'ENTREGADO', 180000.00, 'Despacho de fresas y moras'),
(17, 'PED-2025-0017', 12, 'Avenida Primero de Mayo # 28-10', 'Bogotá', 'EN_RUTA', 410000.00, 'Tubérculos y plátanos'),
(18, 'PED-2025-0018', 13, 'Calle 116 # 19-40', 'Bogotá', 'ACEPTADO', 275000.00, 'Hierbas y aromáticas frescas'),
(19, 'PED-2025-0019', 14, 'Carrera 15 # 85-30', 'Bogotá', 'PENDIENTE', 195000.00, 'Uchuva y café pergamino'),
(20, 'PED-2025-0020', 15, 'Calle 13 # 68D-40', 'Bogotá', 'CANCELADO', 110000.00, 'Cancelado por solicitud del cliente')
ON CONFLICT (id_pedido) DO UPDATE
SET codigo_pedido = EXCLUDED.codigo_pedido, direccion_entrega = EXCLUDED.direccion_entrega,
    municipio_entrega = EXCLUDED.municipio_entrega, estado_pedido = EXCLUDED.estado_pedido,
    total = EXCLUDED.total, notas = EXCLUDED.notas;

SELECT setval('pedido_id_pedido_seq', (SELECT MAX(id_pedido) FROM pedido));

-- 7. Items de Pedidos (20 registros)
INSERT INTO pedido_item (id_pedido_item, id_pedido, id_producto, cantidad, precio_unitario, subtotal) VALUES
(1, 1, 1, 30.00, 3500.00, 105000.00),
(2, 1, 2, 20.00, 3500.00, 70000.00),
(3, 2, 3, 3.00, 95000.00, 285000.00),
(4, 3, 4, 10.00, 32000.00, 320000.00),
(5, 4, 10, 5.00, 28000.00, 140000.00),
(6, 5, 8, 100.00, 2200.00, 220000.00),
(7, 6, 1, 25.00, 3500.00, 87500.00),
(8, 7, 19, 20.00, 12000.00, 240000.00),
(9, 8, 16, 30.00, 5000.00, 150000.00),
(10, 9, 14, 8.00, 45000.00, 360000.00),
(11, 10, 9, 50.00, 3000.00, 150000.00),
(12, 11, 3, 4.00, 95000.00, 380000.00),
(13, 12, 17, 3.00, 82000.00, 246000.00),
(14, 13, 11, 3.00, 68000.00, 204000.00),
(15, 14, 12, 15.00, 8500.00, 127500.00),
(16, 15, 1, 50.00, 3500.00, 175000.00),
(17, 16, 10, 6.00, 28000.00, 168000.00),
(18, 17, 5, 3.00, 120000.00, 360000.00),
(19, 18, 13, 40.00, 4000.00, 160000.00),
(20, 19, 20, 8.00, 22000.00, 176000.00)
ON CONFLICT (id_pedido_item) DO UPDATE
SET cantidad = EXCLUDED.cantidad, precio_unitario = EXCLUDED.precio_unitario, subtotal = EXCLUDED.subtotal;

SELECT setval('pedido_item_id_pedido_item_seq', (SELECT MAX(id_pedido_item) FROM pedido_item));

-- 8. Solicitudes de Transporte (Secundaria: 10 registros)
INSERT INTO solicitud_transporte (id_solicitud, codigo_seguimiento, id_pedido, id_transportista, id_vehiculo, estado_solicitud, costo_transporte, observaciones) VALUES
(1, 'TRK-2025-0001', 1, 17, 1, 'COMPLETADA', 45000.00, 'Ruta Fusagasugá-Bogotá entregada a satisfacción'),
(2, 'TRK-2025-0002', 2, 17, 2, 'EN_CURSO', 65000.00, 'Carga de papa en ruta por la autopista sur'),
(3, 'TRK-2025-0003', 3, 18, 6, 'COMPLETADA', 55000.00, 'Despacho de frutas desde Villa de Leyva'),
(4, 'TRK-2025-0004', 4, 18, 9, 'EN_CURSO', 50000.00, 'Fruta refrigerada en tránsito'),
(5, 'TRK-2025-0005', 7, 19, 11, 'COMPLETADA', 80000.00, 'Entrega a restaurante Usaquén completada'),
(6, 'TRK-2025-0006', 8, 19, 15, 'EN_CURSO', 42000.00, 'Carga refrigerada hacia el norte'),
(7, 'TRK-2025-0007', 9, 20, 16, 'COMPLETADA', 60000.00, 'Uchuvas entregadas en Chapinero'),
(8, 'TRK-2025-0008', 11, 20, 17, 'COMPLETADA', 95000.00, 'Carga pesada de papa y zanahoria'),
(9, 'TRK-2025-0009', 12, 17, 4, 'EN_CURSO', 70000.00, 'Cítricos despachados desde Cundinamarca'),
(10, 'TRK-2025-0010', 13, 18, 7, 'COMPLETADA', 38000.00, 'Flete intermunicipal Chía completado')
ON CONFLICT (id_solicitud) DO UPDATE
SET codigo_seguimiento = EXCLUDED.codigo_seguimiento, estado_solicitud = EXCLUDED.estado_solicitud,
    costo_transporte = EXCLUDED.costo_transporte, observaciones = EXCLUDED.observaciones;

SELECT setval('solicitud_transporte_id_solicitud_seq', (SELECT MAX(id_solicitud) FROM solicitud_transporte));

-- 9. Calificaciones de Servicio (Secundaria: 10 registros)
INSERT INTO calificacion (id_calificacion, id_pedido, id_calificador, id_calificado, puntuacion, comentario) VALUES
(1, 1, 10, 2, 5, 'Excelente calidad en los tomates, frescura garantizada y entrega a tiempo'),
(2, 3, 11, 2, 5, 'Moras de primera calidad para nuestros jugos, muy cumplidos'),
(3, 7, 13, 9, 5, 'Champiñones y aromáticas impecables para nuestro restaurante en Usaquén'),
(4, 9, 14, 6, 5, 'Uchuva de exportación con excelente presentación y sabor'),
(5, 11, 15, 2, 4, 'Papa pastusa muy limpia, buen calibre y bultos bien pesados'),
(6, 13, 16, 7, 5, 'Zanahoria fresca y uniforme, muy recomendada la huerta'),
(7, 16, 11, 4, 5, 'Fresas dulces y sin magulladuras gracias al transporte refrigerado'),
(8, 1, 10, 17, 5, 'Transportista puntual y con furgón limpio'),
(9, 3, 11, 18, 4, 'Llegó en el horario acordado a Chapinero'),
(10, 7, 13, 19, 5, 'Excelente servicio de carga y amabilidad en la entrega')
ON CONFLICT (id_calificacion) DO UPDATE
SET puntuacion = EXCLUDED.puntuacion, comentario = EXCLUDED.comentario;

SELECT setval('calificacion_id_calificacion_seq', (SELECT MAX(id_calificacion) FROM calificacion));
