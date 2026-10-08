// Rota que não existe
function rotaNaoEncontrada(req, res) {
  res.status(404).json({ mensagem: 'Rota não encontrada' });
}

// Tratador global de erros (precisa ter 4 parâmetros)
function tratadorDeErros(err, req, res, next) {
  // JSON malformado no corpo da requisição
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ mensagem: 'JSON inválido no corpo da requisição' });
  }

  // Violação de índice único (jogo duplicado)
  if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    return res.status(409).json({
      mensagem: 'Já existe um jogo com esse nome, plataforma e tipo'
    });
  }

  // Violação de chave estrangeira (ex.: id_admin inexistente)
  if (err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
    return res.status(400).json({ mensagem: 'Referência inválida (verifique id_admin)' });
  }

  // Qualquer outro erro: registra no servidor, resposta genérica ao cliente
  console.error(err);
  res.status(500).json({ erro: 'Erro interno do servidor' });
}

module.exports = { rotaNaoEncontrada, tratadorDeErros };