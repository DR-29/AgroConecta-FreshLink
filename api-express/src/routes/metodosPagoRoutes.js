const express = require('express');
const router = express.Router();
const controller = require('../controllers/metodosPagoController');

router.get('/', controller.listar);
router.get('/:id', controller.obtenerPorId);
router.post('/', controller.crear);
router.put('/:id', controller.actualizar);
router.delete('/:id', controller.eliminarLogico);
router.patch('/:id/reactivar', controller.reactivar);

module.exports = router;
