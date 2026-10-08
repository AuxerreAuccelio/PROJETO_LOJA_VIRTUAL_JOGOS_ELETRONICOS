function validarId(req, res, next) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ mensagem: 'ID inválido' });
  }

  req.params.id = id;
  next();
}

module.exports = validarId;