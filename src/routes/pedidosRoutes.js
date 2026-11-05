const express = require('express');
const router = express.Router();

const autenticar = require('../middlewares/autenticar');
const validarId = require('../middlewares/validarId');
const pedidosController = require('../controllers/pedidosController');

router.post('/', autenticar, pedidosController.criar);
router.get('/:id', autenticar, validarId, pedidosController.buscar);

module.exports = router;