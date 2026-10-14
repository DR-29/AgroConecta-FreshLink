const db = require('../config/database');

exports.listar = async (req, res) => {
  try {
    const { codigo_pedido, estado_pago } = req.query;
    let query = `
      SELECT t.*, m.nombre AS metodo_nombre, m.codigo AS metodo_codigo 
      FROM transaccion_pago t
      INNER JOIN metodo_pago m ON t.id_metodo = m.id_metodo
      WHERE t.estado = 1
    `;
    const params = [];

    if (codigo_pedido) {
      query += ' AND t.codigo_pedido_origen = ?';
      params.push(codigo_pedido);
    }
    if (estado_pago) {
      query += ' AND t.estado_pago = ?';
      params.push(estado_pago.toUpperCase());
    }

    query += ' ORDER BY t.id_transaccion DESC';
    const [filas] = await db.query(query, params);
    res.json(filas);
  } catch (error) {
    res.status(500).json({ error: 'Error al consultar transacciones', detalle: error.message });
  }
};

exports.obtenerPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT t.*, m.nombre AS metodo_nombre, m.codigo AS metodo_codigo 
      FROM transaccion_pago t
      INNER JOIN metodo_pago m ON t.id_metodo = m.id_metodo
      WHERE t.id_transaccion = ? AND t.estado = 1
    `;
    const [filas] = await db.query(query, [id]);

    if (filas.length === 0) {
      return res.status(404).json({ error: 'Transacción no encontrada o inactiva' });
    }
    res.json(filas[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al consultar transacción', detalle: error.message });
  }
};

exports.crear = async (req, res) => {
  try {
    const { codigo_pedido_origen, id_tienda_compradora, id_metodo, monto_total, referencia_pasarela } = req.body;

    if (!codigo_pedido_origen || !id_tienda_compradora || !id_metodo || !monto_total) {
      return res.status(400).json({ error: 'Todos los campos obligatorios deben ser proporcionados' });
    }

    const timestamp = Date.now().toString().slice(-6);
    const referencia = `TX-AGRO-${Date.now().toString().slice(0, 8)}-${timestamp}`;

    const [resultado] = await db.query(
      `INSERT INTO transaccion_pago 
       (referencia_pago, codigo_pedido_origen, id_tienda_compradora, id_metodo, monto_total, estado_pago, referencia_pasarela, estado) 
       VALUES (?, ?, ?, ?, ?, 'PENDIENTE', ?, 1)`,
      [referencia, codigo_pedido_origen, id_tienda_compradora, id_metodo, monto_total, referencia_pasarela || null]
    );

    const [creada] = await db.query('SELECT * FROM transaccion_pago WHERE id_transaccion = ?', [resultado.insertId]);
    res.status(201).json(creada[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar transacción', detalle: error.message });
  }
};

exports.actualizarEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado_pago, referencia_pasarela } = req.body;

    const estadosValidos = ['PENDIENTE', 'APROBADO', 'RECHAZADO', 'REEMBOLSADO'];
    if (!estadosValidos.includes(estado_pago.toUpperCase())) {
      return res.status(400).json({ error: `Estado inválido. Debe ser uno de: ${estadosValidos.join(', ')}` });
    }

    const fechaConfirmacion = estado_pago.toUpperCase() === 'APROBADO' ? new Date() : null;

    await db.query(
      `UPDATE transaccion_pago 
       SET estado_pago = ?, 
           fecha_confirmacion = COALESCE(?, fecha_confirmacion), 
           referencia_pasarela = COALESCE(?, referencia_pasarela) 
       WHERE id_transaccion = ?`,
      [estado_pago.toUpperCase(), fechaConfirmacion, referencia_pasarela || null, id]
    );

    const [actualizada] = await db.query('SELECT * FROM transaccion_pago WHERE id_transaccion = ?', [id]);
    res.json(actualizada[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar estado de transacción', detalle: error.message });
  }
};

exports.eliminarLogico = async (req, res) => {
  try {
    const { id } = req.params;
    const [existente] = await db.query('SELECT * FROM transaccion_pago WHERE id_transaccion = ?', [id]);
    if (existente.length === 0) {
      return res.status(404).json({ error: 'Transacción no encontrada' });
    }

    await db.query('UPDATE transaccion_pago SET estado = 0 WHERE id_transaccion = ?', [id]);
    res.json({ mensaje: `Transacción con ID ${id} desactivada lógicamente (estado = 0)` });
  } catch (error) {
    res.status(500).json({ error: 'Error al desactivar transacción', detalle: error.message });
  }
};
