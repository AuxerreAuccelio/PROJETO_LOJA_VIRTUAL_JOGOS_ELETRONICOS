const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');

const autenticar = require('../middlewares/autenticar');

router.post('/registrar', authController.registrar);

router.post('/login', authController.login);

router.get('/perfil', autenticar, (req, res) => {
  res.json({ cliente: req.cliente });
});

module.exports = router;