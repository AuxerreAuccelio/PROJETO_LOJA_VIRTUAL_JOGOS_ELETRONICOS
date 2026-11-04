const express = require('express');
const router = express.Router();

const avaliacoesController = require('../controllers/avaliacoesController');

router.get('/resumo', avaliacoesController.resumo);

module.exports = router;