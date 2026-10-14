const pool = require('../config/database');

async function inicializarBaseDatos() {
  console.log('[INFO] Conectando a MySQL en Aiven...');

  try {
    const connection = await pool.getConnection();
    console.log('[OK] Conexión establecida con éxito con Aiven MySQL');

    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('DROP TABLE IF EXISTS comprobante_factura');
    await connection.query('DROP TABLE IF EXISTS transaccion_pago');
    await connection.query('DROP TABLE IF EXISTS metodo_pago');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('[INFO] Creando tablas...');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS metodo_pago (
        id_metodo INT AUTO_INCREMENT PRIMARY KEY,
        codigo VARCHAR(40) NOT NULL UNIQUE,
        nombre VARCHAR(80) NOT NULL,
        descripcion VARCHAR(255),
        requiere_verificacion TINYINT(1) NOT NULL DEFAULT 0,
        estado TINYINT(1) NOT NULL DEFAULT 1,
        creado TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        actualizado TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS transaccion_pago (
        id_transaccion INT AUTO_INCREMENT PRIMARY KEY,
        referencia_pago VARCHAR(60) NOT NULL UNIQUE,
        codigo_pedido_origen VARCHAR(40) NOT NULL,
        id_tienda_compradora INT NOT NULL,
        id_metodo INT NOT NULL,
        monto_total DECIMAL(12, 2) NOT NULL,
        estado_pago ENUM('PENDIENTE', 'APROBADO', 'RECHAZADO', 'REEMBOLSADO') NOT NULL DEFAULT 'PENDIENTE',
        fecha_confirmacion DATETIME NULL,
        referencia_pasarela VARCHAR(100) NULL,
        estado TINYINT(1) NOT NULL DEFAULT 1,
        creado TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        actualizado TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_transaccion_metodo FOREIGN KEY (id_metodo) REFERENCES metodo_pago(id_metodo) ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS comprobante_factura (
        id_factura INT AUTO_INCREMENT PRIMARY KEY,
        numero_factura VARCHAR(50) NOT NULL UNIQUE,
        id_transaccion INT NOT NULL UNIQUE,
        nit_emisor VARCHAR(30) NOT NULL DEFAULT '901.458.123-4',
        razon_social_emisor VARCHAR(120) NOT NULL DEFAULT 'AgroConecta S.A.S.',
        documento_cliente VARCHAR(30) NOT NULL,
        nombre_cliente VARCHAR(150) NOT NULL,
        subtotal DECIMAL(12, 2) NOT NULL,
        impuesto_iva DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
        total DECIMAL(12, 2) NOT NULL,
        url_pdf VARCHAR(255) NULL,
        estado TINYINT(1) NOT NULL DEFAULT 1,
        creado TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        actualizado TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_factura_transaccion FOREIGN KEY (id_transaccion) REFERENCES transaccion_pago(id_transaccion) ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log('[INFO] Insertando datos semilla...');

    await connection.query(`
      INSERT INTO metodo_pago (id_metodo, codigo, nombre, descripcion, requiere_verificacion) VALUES
      (1, 'PSE_BANCARIO', 'PSE / Transferencia en Línea', 'Débito seguro desde cuentas bancarias nacionales', 1),
      (2, 'TARJETA_CREDITO', 'Tarjeta de Crédito / Débito', 'Pago con franquicias Visa, Mastercard y American Express', 1),
      (3, 'TRANSFERENCIA_MANUAL', 'Transferencia Directa Bancolombia / Nequi / Daviplata', 'Adjuntar comprobante de consignación para validación', 1),
      (4, 'CONTRA_ENTREGA', 'Efectivo Contra Entrega', 'Pago en efectivo al recibir el pedido del transportista', 0);
    `);

    await connection.query(`
      INSERT INTO transaccion_pago (id_transaccion, referencia_pago, codigo_pedido_origen, id_tienda_compradora, id_metodo, monto_total, estado_pago, fecha_confirmacion, referencia_pasarela) VALUES
      (1, 'TX-AGRO-20251012-001', 'PED-2025-0001', 3, 1, 175000.00, 'APROBADO', NOW(), 'PSE-APPR-9988123'),
      (2, 'TX-AGRO-20251012-002', 'PED-2025-0002', 3, 4, 85000.00, 'PENDIENTE', NULL, NULL);
    `);

    await connection.query(`
      INSERT INTO comprobante_factura (id_factura, numero_factura, id_transaccion, documento_cliente, nombre_cliente, subtotal, impuesto_iva, total, url_pdf) VALUES
      (1, 'FAC-AGRO-0001', 1, '1000000003', 'María Restrepo Ruiz - Frutería Los Ángeles', 175000.00, 0.00, 175000.00, 'https://agroconecta.com/facturas/FAC-AGRO-0001.pdf');
    `);

    console.log('[INFO] Verificando datos creados:');
    const [metodos] = await connection.query('SELECT id_metodo, codigo, nombre FROM metodo_pago');
    console.log('Métodos creados:', metodos);

    const [txs] = await connection.query('SELECT id_transaccion, referencia_pago, monto_total, estado_pago FROM transaccion_pago');
    console.log('Transacciones creadas:', txs);

    connection.release();
    console.log('[SUCCESS] Base de datos MySQL en Aiven inicializada al 100%');
    process.exit(0);
  } catch (error) {
    console.error('[ERROR] Error al inicializar MySQL en Aiven:', error);
    process.exit(1);
  }
}

inicializarBaseDatos();
