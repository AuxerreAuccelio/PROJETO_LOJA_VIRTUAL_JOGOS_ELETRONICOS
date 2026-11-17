import { brl, corDe, estoqueInfo, notaTexto } from '../utils.js';
import { useCarrinho } from '../CarrinhoContext.jsx';

// Mantém a referência visual de caixa de jogo e dá mais destaque à capa e ao preço.
export default function CardJogo({ jogo, resumo, onAbrir }) {
  const { adicionar } = useCarrinho();
  const cor = corDe(jogo.plataforma);
  const est = estoqueInfo(jogo.estoque);
  return (
    <article className="group flex min-h-[350px] overflow-hidden rounded-2xl border border-line bg-surface text-left shadow-[0_4px_18px_rgb(20_24_59_/_0.04)] transition duration-200 hover:-translate-y-1 hover:border-brand/40 hover:shadow-[0_18px_35px_rgb(20_24_59_/_0.12)]">
      <span style={{ background: cor }} className="flex w-8 flex-none rotate-180 items-center justify-center font-display text-[10px] font-extrabold tracking-[.12em] text-white [writing-mode:vertical-rl]">
        {jogo.plataforma}
      </span>
      <span className="flex min-w-0 flex-1 flex-col p-3.5">
        <button type="button" onClick={() => onAbrir(jogo.id_jogo)} aria-label={`Ver detalhes de ${jogo.nome}`} style={{ background: `linear-gradient(145deg, ${cor}, ${cor}bb)` }} className="relative mb-3 grid h-[145px] w-full place-items-center overflow-hidden rounded-xl text-white">
          <span className="absolute -right-5 -top-8 h-32 w-32 rounded-full border border-white/20" />
          <span className="absolute -bottom-12 -left-5 h-32 w-32 rounded-full border border-white/20" />
          <span className="relative font-display text-5xl font-extrabold tracking-[-.06em] drop-shadow-md">{jogo.nome.slice(0, 2).toUpperCase()}</span>
          <span className="absolute bottom-3 left-3 rounded-full bg-black/15 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.15em] text-white">{jogo.tipo === 'fisico' ? 'Edição física' : 'Download digital'}</span>
        </button>
        <button type="button" onClick={() => onAbrir(jogo.id_jogo)} className="line-clamp-2 text-left font-display text-lg/[1.2] font-bold tracking-tight group-hover:text-brand">{jogo.nome}</button>
        <span className="mt-1 truncate text-xs text-muted">{jogo.genero || 'Sem gênero'}{jogo.desenvolvedora ? ` · ${jogo.desenvolvedora}` : ''}</span>
        <span className="mt-2 text-xs font-semibold text-brand">{notaTexto(resumo)}</span>
        <span className={`mt-1 text-xs font-semibold ${est.classe}`}>{est.texto}</span>
        <span className="mt-auto flex items-center justify-between gap-2 border-t border-line pt-3">
          <span className="font-display text-xl font-extrabold tracking-tight">{brl(jogo.preco)}</span>
          <button type="button" disabled={jogo.estoque <= 0} onClick={() => adicionar(jogo)} className="rounded-lg bg-brand px-3 py-2 text-xs font-bold text-brand-ink transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50" aria-label={jogo.estoque > 0 ? `Adicionar ${jogo.nome} ao carrinho` : `${jogo.nome} sem estoque`}>
            {jogo.estoque > 0 ? 'Adicionar' : 'Indisponível'}
          </button>
        </span>
      </span>
    </article>
  );
}
