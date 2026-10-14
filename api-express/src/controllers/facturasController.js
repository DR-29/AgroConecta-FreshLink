const db = require('../config/database');

exports.listar = async (req, res) => {
  try {
    const query = `
      SELECT f.*, t.referencia_pago, t.codigo_pedido_origen, t.estado_pago 
      FROM comprobante_factura f
      INNER JOIN transaccion_pago t ON f.id_transaccion = t.id_transaccion
      WHERE f.estado = 1
      ORDER BY f.id_factura DESC
    `;
    const [filas] = await db.query(query);
    res.json(filas);
  } catch (error) {
    res.status(500).json({ error: 'Error al consultar comprobantes', detalle: error.message });
  }
};

exports.obtenerPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT f.*, t.referencia_pago, t.codigo_pedido_origen, t.estado_pago 
      FROM comprobante_factura f
      INNER JOIN transaccion_pago t ON f.id_transaccion = t.id_transaccion
      WHERE f.id_factura = ? AND f.estado = 1
    `;
    const [filas] = await db.query(query, [id]);

    if (filas.length === 0) {
      return res.status(404).json({ error: 'Comprobante no encontrado' });
    }
    res.json(filas[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al consultar comprobante', detalle: error.message });
  }
};

exports.crear = async (req, res) => {
  try {
    const { id_transaccion, documento_cliente, nombre_cliente, subtotal, impuesto_iva, url_pdf } = req.body;

    if (!id_transaccion || !documento_cliente || !nombre_cliente || subtotal === undefined) {
      return res.status(400).json({ error: 'Faltan campos obligatorios para emitir la factura' });
    }

    const [tx] = await db.query('SELECT * FROM transaccion_pago WHERE id_transaccion = ?', [id_transaccion]);
    if (tx.length === 0) {
      return res.status(404).json({ error: 'Transacción de pago asociada no encontrada' });
    }

    const [existente] = await db.query('SELECT * FROM comprobante_factura WHERE id_transaccion = ?', [id_transaccion]);
    if (existente.length > 0) {
      return res.status(400).json({ error: 'Esta transacción ya cuenta con una factura emitida' });
    }

    const iva = impuesto_iva !== undefined ? parseFloat(impuesto_iva) : 0.00;
    const sub = parseFloat(subtotal);
    const total = sub + iva;
    const num = Date.now().toString().slice(-6);
    const numero_factura = `FAC-AGRO-${num}`;

    const [resultado] = await db.query(
      `INSERT INTO comprobante_factura 
       (numero_factura, id_transaccion, documento_cliente, nombre_cliente, subtotal, impuesto_iva, total, url_pdf, estado) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [numero_factura, id_transaccion, documento_cliente, nombre_cliente, sub, iva, total, url_pdf || null]
    );

    const [creada] = await db.query('SELECT * FROM comprobante_factura WHERE id_factura = ?', [resultado.insertId]);
    res.status(201).json(creada[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al emitir factura', detalle: error.message });
  }
};

exports.eliminarLogico = async (req, res) => {
  try {
    const { id } = req.params;
    const [existente] = await db.query('SELECT * FROM comprobante_factura WHERE id_factura = ?', [id]);
    if (existente.length === 0) {
      return res.status(404).json({ error: 'Comprobante no encontrado' });
    }

    await db.query('UPDATE comprobante_factura SET estado = 0 WHERE id_factura = ?', [id]);
    res.json({ mensaje: `Comprobante ${id} desactivado lógicamente (estado = 0)` });
  } catch (error) {
    res.status(500).json({ error: 'Error al desactivar comprobante', detalle: error.message });
  }
};
