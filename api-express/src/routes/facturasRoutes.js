const express = require('express');
const router = express.Router();
const controller = require('../controllers/facturasController');

router.get('/', controller.listar);
router.get('/:id', controller.obtenerPorId);
router.post('/', controller.crear);
router.delete('/:id', controller.eliminarLogico);

module.exports = router;
