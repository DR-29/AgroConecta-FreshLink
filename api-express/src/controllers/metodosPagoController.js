const db = require('../config/database');

exports.listar = async (req, res) => {
  try {
    const soloActivos = req.query.todos !== 'true';
    const query = soloActivos
      ? 'SELECT * FROM metodo_pago WHERE estado = 1 ORDER BY id_metodo ASC'
      : 'SELECT * FROM metodo_pago ORDER BY id_metodo ASC';
    const [filas] = await db.query(query);
    res.json(filas);
  } catch (error) {
    res.status(500).json({ error: 'Error al consultar métodos de pago', detalle: error.message });
  }
};

exports.obtenerPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const [filas] = await db.query('SELECT * FROM metodo_pago WHERE id_metodo = ?', [id]);
    if (filas.length === 0) {
      return res.status(404).json({ error: 'Método de pago no encontrado' });
    }
    res.json(filas[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al consultar método de pago', detalle: error.message });
  }
};

exports.crear = async (req, res) => {
  try {
    const { codigo, nombre, descripcion, requiere_verificacion } = req.body;
    if (!codigo || !nombre) {
      return res.status(400).json({ error: 'Código y nombre son obligatorios' });
    }

    const [resultado] = await db.query(
      `INSERT INTO metodo_pago (codigo, nombre, descripcion, requiere_verificacion, estado) 
       VALUES (?, ?, ?, ?, 1)`,
      [codigo.toUpperCase(), nombre, descripcion || null, requiere_verificacion ? 1 : 0]
    );

    const [creado] = await db.query('SELECT * FROM metodo_pago WHERE id_metodo = ?', [resultado.insertId]);
    res.status(201).json(creado[0]);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Ya existe un método de pago con ese código único' });
    }
    res.status(500).json({ error: 'Error al registrar método de pago', detalle: error.message });
  }
};

exports.actualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, requiere_verificacion } = req.body;

    const [existente] = await db.query('SELECT * FROM metodo_pago WHERE id_metodo = ?', [id]);
    if (existente.length === 0) {
      return res.status(404).json({ error: 'Método de pago no encontrado' });
    }

    await db.query(
      `UPDATE metodo_pago 
       SET nombre = COALESCE(?, nombre), 
           descripcion = COALESCE(?, descripcion), 
           requiere_verificacion = COALESCE(?, requiere_verificacion) 
       WHERE id_metodo = ?`,
      [nombre, descripcion, requiere_verificacion !== undefined ? (requiere_verificacion ? 1 : 0) : null, id]
    );

    const [actualizado] = await db.query('SELECT * FROM metodo_pago WHERE id_metodo = ?', [id]);
    res.json(actualizado[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar método de pago', detalle: error.message });
  }
};

exports.eliminarLogico = async (req, res) => {
  try {
    const { id } = req.params;
    const [existente] = await db.query('SELECT * FROM metodo_pago WHERE id_metodo = ?', [id]);
    if (existente.length === 0) {
      return res.status(404).json({ error: 'Método de pago no encontrado' });
    }

    await db.query('UPDATE metodo_pago SET estado = 0 WHERE id_metodo = ?', [id]);
    res.json({ mensaje: `Método de pago con ID ${id} desactivado lógicamente (estado = 0)` });
  } catch (error) {
    res.status(500).json({ error: 'Error al desactivar método de pago', detalle: error.message });
  }
};

exports.reactivar = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('UPDATE metodo_pago SET estado = 1 WHERE id_metodo = ?', [id]);
    res.json({ mensaje: `Método de pago con ID ${id} reactivado (estado = 1)` });
  } catch (error) {
    res.status(500).json({ error: 'Error al reactivar método de pago', detalle: error.message });
  }
};
