import { useState } from 'react';
import Modal from './Modal.jsx';
import { post } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import { useCarrinho } from '../CarrinhoContext.jsx';
import { brl } from '../utils.js';

const botao = 'rounded-[10px] border-[1.5px] px-4 py-2 font-semibold';

export default function Carrinho({ aberto, onFechar, onEntrar }) {
  const { cliente } = useAuth();
  const { itens, total, mudarQuantidade, remover } = useCarrinho();
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');

  async function finalizar() {
    if (!cliente) { onFechar(); onEntrar(); return; }
    setEnviando(true); setErro('');
    try {
      // 1) o servidor cria o pedido e calcula o total; 2) cria a cobrança; 3) leva o cliente ao Mercado Pago.
      const pedido = await post('/api/pedidos', {
        itens: itens.map((i) => ({ id_jogo: i.id_jogo, quantidade: i.quantidade }))
      });
      const pagamento = await post(`/api/pedidos/${pedido.id_pedido}/pagar`);
      window.location.assign(pagamento.init_point);
    } catch (e) {
      setErro(e.message);
      setEnviando(false);
    }
  }

  return (
    <Modal aberto={aberto} onFechar={onFechar} largura="min(520px,92vw)">
      <h2 className="mb-3 font-display text-2xl font-extrabold">Carrinho</h2>

      {itens.length === 0 ? (
        <p className="text-muted">Seu carrinho está vazio. Abra um jogo e escolha Adicionar ao carrinho.</p>
      ) : (
        <ul>
          {itens.map((i) => (
            <li key={i.id_jogo} className="flex flex-wrap items-center gap-3 border-t border-line py-3">
              <div className="min-w-[160px] flex-1">
                <p className="font-display font-semibold">{i.nome}</p>
                <p className="text-sm text-muted">{i.plataforma} · {brl(i.preco)}</p>
              </div>
              <label className="flex items-center gap-2 text-sm">
                Qtd
                <input type="number" min={1} max={i.estoque} value={i.quantidade}
                  onChange={(e) => mudarQuantidade(i.id_jogo, Number(e.target.value) || 1)}
                  className="w-16 rounded-[10px] border-[1.5px] border-line bg-bg px-2 py-1.5" />
              </label>
              <button type="button" onClick={() => remover(i.id_jogo)} className="text-sm font-semibold text-warn">Remover</button>
            </li>
          ))}
        </ul>
      )}

      {itens.length > 0 && (
        <p className="mt-3 flex items-baseline justify-between border-t border-line pt-3">
          <span className="font-semibold">Total</span>
          <span className="font-display text-xl font-extrabold">{brl(total)}</span>
        </p>
      )}

      <div role="alert" className="mt-2.5 min-h-[1.2em] text-sm text-warn">{erro}</div>
      <div className="mt-3 flex flex-wrap gap-2">
        {itens.length > 0 && (
          <button type="button" onClick={finalizar} disabled={enviando}
            className={`${botao} border-brand bg-brand text-brand-ink disabled:opacity-60`}>
            {enviando ? 'Abrindo o pagamento…' : cliente ? 'Pagar com Mercado Pago' : 'Entrar para pagar'}
          </button>
        )}
        <button type="button" onClick={onFechar} className={`${botao} border-ink`}>Continuar comprando</button>
      </div>
    </Modal>
  );
}
