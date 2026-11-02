-- ==============================================================================
-- AgroConecta (FreshLink) - Script de Poblado MySQL para Taller 1 Corte 2
-- MySQL (Aiven Cloud - Base de Datos Auxiliar)
-- Cumple: Mínimo 10 registros en metodo_pago, transaccion_pago y comprobante_factura
-- ==============================================================================

-- 1. Métodos de Pago (10 registros)
INSERT INTO metodo_pago (id_metodo, codigo, nombre, descripcion, requiere_verificacion) VALUES
(1, 'PSE_BANCARIO', 'PSE / Transferencia en Línea', 'Débito seguro desde cuentas bancarias colombianas', 1),
(2, 'TARJETA_CREDITO', 'Tarjeta de Crédito / Débito', 'Visa, Mastercard y American Express con procesamiento pasarela', 1),
(3, 'TRANSFERENCIA_MANUAL', 'Transferencia Directa Bancolombia / Nequi', 'Envío de comprobante digital de consignación', 1),
(4, 'CONTRA_ENTREGA', 'Efectivo Contra Entrega', 'Pago en efectivo directo al transportista al recibir cosecha', 0),
(5, 'DAVIPLATA_MOVIL', 'Daviplata Negocios', 'Monedero digital Daviplata para comercio rural y urbano', 0),
(6, 'AGRO_ANTICIPO', 'Línea AgroAnticipo Rural', 'Financiamiento directo con descuento a cosecha', 1),
(7, 'CHEQUE_GERENCIA', 'Cheque de Gerencia Mayorista', 'Para despachos de carga consolidada superior a 5 toneladas', 1),
(8, 'FACTORING_CAMPESINO', 'Factoring de Cesión de Cartera', 'Adelanto de factura electrónica con entidades financieras aliadas', 1),
(9, 'BILLETERA_DALE', 'Dale! Grupo Aval', 'Billetera digital del Grupo Aval para pagos interbancarios', 0),
(10, 'CORRESPONSAL_BANCARIO', 'Corresponsal Bancario Rural', 'Recibo de pago en puntos Baloto, Efecty o corresponsales de pueblo', 1)
ON DUPLICATE KEY UPDATE 
codigo = VALUES(codigo), nombre = VALUES(nombre), descripcion = VALUES(descripcion), requiere_verificacion = VALUES(requiere_verificacion);

-- 2. Transacciones de Pago (10 registros)
INSERT INTO transaccion_pago (id_transaccion, referencia_pago, codigo_pedido_origen, id_tienda_compradora, id_metodo, monto_total, estado_pago, fecha_confirmacion, referencia_pasarela) VALUES
(1, 'TX-AGRO-20251012-001', 'PED-2025-0001', 10, 4, 175000.00, 'APROBADO', NOW(), 'EFEC-CONF-001'),
(2, 'TX-AGRO-20251012-002', 'PED-2025-0002', 10, 1, 285000.00, 'APROBADO', NOW(), 'PSE-APPR-9988123'),
(3, 'TX-AGRO-20251012-003', 'PED-2025-0003', 11, 3, 320000.00, 'APROBADO', NOW(), 'NEQUI-REC-88412'),
(4, 'TX-AGRO-20251012-004', 'PED-2025-0004', 11, 5, 190000.00, 'PENDIENTE', NULL, 'DAVI-PEND-77123'),
(5, 'TX-AGRO-20251012-005', 'PED-2025-0005', 12, 1, 450000.00, 'APROBADO', NOW(), 'PSE-APPR-4455210'),
(6, 'TX-AGRO-20251012-006', 'PED-2025-0006', 12, 4, 135000.00, 'PENDIENTE', NULL, NULL),
(7, 'TX-AGRO-20251012-007', 'PED-2025-0007', 13, 2, 520000.00, 'APROBADO', NOW(), 'VISA-AUTH-661209'),
(8, 'TX-AGRO-20251012-008', 'PED-2025-0008', 13, 2, 240000.00, 'APROBADO', NOW(), 'MC-AUTH-332145'),
(9, 'TX-AGRO-20251012-009', 'PED-2025-0009', 14, 3, 380000.00, 'APROBADO', NOW(), 'BANCOL-TR-554432'),
(10, 'TX-AGRO-20251012-010', 'PED-2025-0010', 14, 4, 165000.00, 'PENDIENTE', NULL, NULL)
ON DUPLICATE KEY UPDATE
referencia_pago = VALUES(referencia_pago), monto_total = VALUES(monto_total), estado_pago = VALUES(estado_pago),
fecha_confirmacion = VALUES(fecha_confirmacion), referencia_pasarela = VALUES(referencia_pasarela);

-- 3. Comprobantes y Facturas Electrónicas (10 registros)
INSERT INTO comprobante_factura (id_factura, numero_factura, id_transaccion, nit_emisor, razon_social_emisor, documento_cliente, nombre_cliente, subtotal, impuesto_iva, total, url_pdf) VALUES
(1, 'FAC-AGRO-0001', 1, '901.458.123-4', 'AgroConecta S.A.S.', '1000000010', 'María Camila Restrepo - Frutería Central', 175000.00, 0.00, 175000.00, 'https://agroconecta.com/facturas/FAC-AGRO-0001.pdf'),
(2, 'FAC-AGRO-0002', 2, '901.458.123-4', 'AgroConecta S.A.S.', '1000000010', 'María Camila Restrepo - Frutería Central', 285000.00, 0.00, 285000.00, 'https://agroconecta.com/facturas/FAC-AGRO-0002.pdf'),
(3, 'FAC-AGRO-0003', 3, '901.458.123-4', 'AgroConecta S.A.S.', '1000000011', 'Andrés Felipe Castro - Frutería El Trigal', 320000.00, 0.00, 320000.00, 'https://agroconecta.com/facturas/FAC-AGRO-0003.pdf'),
(4, 'FAC-AGRO-0004', 4, '901.458.123-4', 'AgroConecta S.A.S.', '1000000011', 'Andrés Felipe Castro - Frutería El Trigal', 190000.00, 0.00, 190000.00, 'https://agroconecta.com/facturas/FAC-AGRO-0004.pdf'),
(5, 'FAC-AGRO-0005', 5, '901.458.123-4', 'AgroConecta S.A.S.', '1000000012', 'Paola Andrea Suárez - Minimercado Boyacá', 450000.00, 0.00, 450000.00, 'https://agroconecta.com/facturas/FAC-AGRO-0005.pdf'),
(6, 'FAC-AGRO-0006', 6, '901.458.123-4', 'AgroConecta S.A.S.', '1000000012', 'Paola Andrea Suárez - Minimercado Boyacá', 135000.00, 0.00, 135000.00, 'https://agroconecta.com/facturas/FAC-AGRO-0006.pdf'),
(7, 'FAC-AGRO-0007', 7, '901.458.123-4', 'AgroConecta S.A.S.', '1000000013', 'Gustavo Adolfo Pardo - Restaurante La Huerta', 520000.00, 0.00, 520000.00, 'https://agroconecta.com/facturas/FAC-AGRO-0007.pdf'),
(8, 'FAC-AGRO-0008', 8, '901.458.123-4', 'AgroConecta S.A.S.', '1000000013', 'Gustavo Adolfo Pardo - Restaurante La Huerta', 240000.00, 0.00, 240000.00, 'https://agroconecta.com/facturas/FAC-AGRO-0008.pdf'),
(9, 'FAC-AGRO-0009', 9, '901.458.123-4', 'AgroConecta S.A.S.', '1000000014', 'Claudia Marcela Mejía - Mercado Orgánico', 380000.00, 0.00, 380000.00, 'https://agroconecta.com/facturas/FAC-AGRO-0009.pdf'),
(10, 'FAC-AGRO-0010', 10, '901.458.123-4', 'AgroConecta S.A.S.', '1000000014', 'Claudia Marcela Mejía - Mercado Orgánico', 165000.00, 0.00, 165000.00, 'https://agroconecta.com/facturas/FAC-AGRO-0010.pdf')
ON DUPLICATE KEY UPDATE
numero_factura = VALUES(numero_factura), total = VALUES(total), url_pdf = VALUES(url_pdf);
