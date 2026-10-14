const express = require('express');
const router = express.Router();
const controller = require('../controllers/transaccionesController');

router.get('/', controller.listar);
router.get('/:id', controller.obtenerPorId);
router.post('/', controller.crear);
router.patch('/:id/estado', controller.actualizarEstado);
router.delete('/:id', controller.eliminarLogico);

module.exports = router;
