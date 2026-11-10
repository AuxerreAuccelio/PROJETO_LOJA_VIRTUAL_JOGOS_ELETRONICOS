const express = require('express');
const router = express.Router();

const autenticar = require('../middlewares/autenticar');
const validarId = require('../middlewares/validarId');
const pedidosController = require('../controllers/pedidosController');

router.post('/', autenticar, pedidosController.criar);
router.get('/:id', autenticar, validarId, pedidosController.buscar);
router.post('/:id/pagar', autenticar, validarId, pedidosController.pagar);
router.post('/:id/confirmar', autenticar, validarId, pedidosController.confirmar);

module.exports = router;
