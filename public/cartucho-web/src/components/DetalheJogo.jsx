import { useCallback, useEffect, useState } from 'react';
import Modal from './Modal.jsx';
import { api, post } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import { useCarrinho } from '../CarrinhoContext.jsx';
import { brl, notaTexto } from '../utils.js';

function FormAvaliar({ idJogo, aoEnviar }) {
  const [nota, setNota] = useState(5);
  const [comentario, setComentario] = useState('');
  const [erro, setErro] = useState('');

  async function enviar() {
    try {
      const corpo = { nota: Number(nota) };
      if (comentario.trim()) corpo.comentario = comentario.trim();
      await post(`/api/jogos/${idJogo}/avaliacoes`, corpo);
      setComentario(''); setErro('');
      aoEnviar();
    } catch (e) { setErro(e.message); }
  }

  const campo = 'w-full rounded-[10px] border-[1.5px] border-line bg-bg px-3 py-2.5';
  return (
    <div>
      <label htmlFor="nota" className="mb-1 mt-3 block text-sm font-semibold">Sua nota</label>
      <select id="nota" className={campo} value={nota} onChange={(e) => setNota(e.target.value)}>
        {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} {'★'.repeat(n)}</option>)}
      </select>
      <label htmlFor="comentario" className="mb-1 mt-3 block text-sm font-semibold">Comentário</label>
      <textarea id="comentario" rows={3} maxLength={1000} placeholder="Comentário (opcional)" className={`${campo} resize-y`}
        value={comentario} onChange={(e) => setComentario(e.target.value)} />
      <div role="alert" className="mt-2.5 min-h-[1.2em] text-sm text-warn">{erro}</div>
      <button type="button" onClick={enviar} className="mt-2 rounded-[10px] border-[1.5px] border-brand bg-brand px-4 py-2 font-semibold text-brand-ink">
        Enviar avaliação
      </button>
    </div>
  );
}

export default function DetalheJogo({ idJogo, onFechar, aoAvaliar }) {
  const { cliente } = useAuth();
  const { adicionar } = useCarrinho();
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState('');

  const carregar = useCallback(async () => {
    try {
      const [jogo, av] = await Promise.all([
        api(`/api/jogos/${idJogo}`),
        api(`/api/jogos/${idJogo}/avaliacoes?limite=5`)
      ]);
      setDados({ jogo, av }); setErro('');
    } catch (e) { setErro(e.message); }
  }, [idJogo]);

  useEffect(() => { setDados(null); if (idJogo) carregar(); }, [idJogo, carregar]);

  const { jogo: j, av } = dados || {};
  return (
    <Modal aberto={Boolean(idJogo)} onFechar={onFechar} largura="min(520px,92vw)">
      {erro && <p role="alert" className="text-warn">{erro}</p>}
      {!dados && !erro && <p className="text-muted">Carregando…</p>}
      {dados && (
        <>
          <h2 className="mb-3 font-display text-2xl font-extrabold">{j.nome}</h2>
          <p className="text-sm text-muted">
            {j.plataforma} · {j.tipo === 'fisico' ? 'Físico' : 'Digital'} · {j.desenvolvedora || 'Desenvolvedora não informada'}
          </p>
          <p className="my-3">{j.descricao || 'Sem descrição.'}</p>
          <p className="font-display text-xl font-extrabold">{brl(j.preco)}</p>

          <h3 className="mb-1.5 mt-4 font-display text-lg font-semibold">Avaliações</h3>
          <p className="text-sm font-semibold text-brand">{notaTexto(av.total ? { media: av.media, total: av.total } : null)}</p>
          {av.avaliacoes.length === 0 && <p className="text-sm text-muted">Ainda sem avaliações.</p>}
          {av.avaliacoes.map((a, i) => (
            <div key={i} className="border-t border-line py-2.5">
              <b>{a.autor} · {'★'.repeat(a.nota)} · {new Date(a.data).toLocaleDateString('pt-BR')}</b>
              <p className="mt-0.5 text-sm text-muted">{a.comentario || 'Sem comentário.'}</p>
            </div>
          ))}

          {cliente
            ? <FormAvaliar idJogo={idJogo} aoEnviar={() => { carregar(); aoAvaliar(); }} />
            : <p className="text-sm text-muted">Entre na sua conta para avaliar este jogo.</p>}

          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" disabled={j.estoque <= 0} onClick={() => { adicionar(j); onFechar(); }}
              className="rounded-[10px] border-[1.5px] border-brand bg-brand px-4 py-2 font-semibold text-brand-ink disabled:opacity-50">
              {j.estoque > 0 ? 'Adicionar ao carrinho' : 'Sem estoque'}
            </button>
            <button type="button" onClick={onFechar} className="rounded-[10px] border-[1.5px] border-ink px-4 py-2 font-semibold">Fechar</button>
          </div>
        </>
      )}
    </Modal>
  );
}
