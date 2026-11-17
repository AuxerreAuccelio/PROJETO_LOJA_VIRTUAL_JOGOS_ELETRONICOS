import { useEffect, useRef, useState } from 'react';
import Modal from './Modal.jsx';
import { post } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import { useCarrinho } from '../CarrinhoContext.jsx';

const FORMAS = {
  pix: 'Pix', cartao_credito: 'Cartão de crédito', cartao_debito: 'Cartão de débito',
  boleto: 'Boleto', saldo_mp: 'Saldo do Mercado Pago'
};
const botao = 'rounded-[10px] border-[1.5px] px-4 py-2 font-semibold';

// O Mercado Pago devolve o cliente para /?pedido=ID&pagamento=sucesso|falha|pendente.
// O parâmetro "pagamento" é só uma dica: quem decide é o servidor, que consulta o Mercado Pago em /confirmar.
export default function RetornoPagamento({ onEntrar }) {
  const { cliente } = useAuth();
  const { limpar } = useCarrinho();
  const [retorno] = useState(() => {
    const q = new URLSearchParams(window.location.search);
    return q.get('pedido') ? { id: q.get('pedido'), dica: q.get('pagamento') } : null;
  });
  const [aberto, setAberto] = useState(Boolean(retorno));
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const iniciou = useRef(false);

  async function confirmar() {
    setCarregando(true); setErro('');
    try {
      const r = await post(`/api/pedidos/${retorno.id}/confirmar`);
      setResultado(r);
      if (r.status === 'pago') limpar();
    } catch (e) { setErro(e.message); }
    setCarregando(false);
  }

  useEffect(() => {
    if (!retorno || !cliente || iniciou.current) return;
    iniciou.current = true;
    confirmar();
  }, [cliente]); // eslint-disable-line react-hooks/exhaustive-deps

  function fechar() {
    window.history.replaceState({}, '', window.location.pathname);
    setAberto(false);
  }
  if (!retorno) return null;

  const pago = resultado?.status === 'pago';
  return (
    <Modal aberto={aberto} onFechar={fechar} largura="min(520px,92vw)">
      <h2 className="mb-3 font-display text-2xl font-extrabold">Pedido {retorno.id}</h2>

      {!cliente && (
        <>
          <p className="text-muted">Entre na sua conta para confirmar o pagamento deste pedido.</p>
          <button type="button" onClick={onEntrar} className={`${botao} mt-3 border-brand bg-brand text-brand-ink`}>Entrar</button>
        </>
      )}

      {cliente && carregando && <p className="text-muted">Confirmando o pagamento…</p>}
      {erro && <p role="alert" className="text-warn">{erro}</p>}

      {pago && (
        <>
          <p className="font-semibold text-ok">Pagamento aprovado{resultado.forma_pagamento ? ` · ${FORMAS[resultado.forma_pagamento] || resultado.forma_pagamento}` : ''}.</p>
          {resultado.codigos?.length > 0 && (
            <>
              <h3 className="mb-1 mt-4 font-display text-lg font-semibold">Seus códigos</h3>
              <p className="mb-2 text-sm text-muted">Anote ou copie agora: os códigos aparecem só nesta tela.</p>
              {resultado.codigos.map((c, i) => (
                <div key={i} className="flex flex-wrap items-center gap-2 border-t border-line py-2">
                  <span className="min-w-[140px] flex-1 text-sm">{c.nome}</span>
                  <code className="rounded bg-bg px-2 py-1 text-sm">{c.codigo}</code>
                  <button type="button" onClick={() => navigator.clipboard?.writeText(c.codigo)} className="text-sm font-semibold text-brand">Copiar</button>
                </div>
              ))}
            </>
          )}
          {resultado.mensagem && <p className="mt-2 text-sm text-muted">{resultado.mensagem}</p>}
        </>
      )}

      {resultado && !pago && (
        <>
          <p className="text-warn">
            {resultado.mensagem || 'O pagamento ainda não foi aprovado.'}
            {retorno.dica === 'falha' && ' O Mercado Pago informou que o pagamento não foi concluído.'}
          </p>
          <button type="button" onClick={confirmar} disabled={carregando} className={`${botao} mt-3 border-ink`}>Verificar de novo</button>
        </>
      )}

      <div className="mt-4">
        <button type="button" onClick={fechar} className={`${botao} border-ink`}>Fechar</button>
      </div>
    </Modal>
  );
}
