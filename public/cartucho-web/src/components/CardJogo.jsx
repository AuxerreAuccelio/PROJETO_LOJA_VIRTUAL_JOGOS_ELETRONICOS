import { brl, corDe, estoqueInfo, notaTexto } from '../utils.js';

// O card tem formato de caixa de jogo: lombada = plataforma, capa = iniciais, estoque = texto + cor.
export default function CardJogo({ jogo, resumo, onAbrir }) {
  const cor = corDe(jogo.plataforma);
  const est = estoqueInfo(jogo.estoque);
  return (
    <button
      type="button"
      onClick={() => onAbrir(jogo.id_jogo)}
      className="flex overflow-hidden rounded-[6px_14px_14px_6px] border-[1.5px] border-line bg-surface p-0 text-left motion-safe:transition-transform motion-safe:hover:-translate-y-[3px]"
    >
      <span
        style={{ background: cor }}
        className="flex w-[34px] flex-none rotate-180 items-center justify-center font-display text-xs font-extrabold tracking-[.04em] text-white [writing-mode:vertical-rl]"
      >
        {jogo.plataforma}
      </span>
      <span className="flex min-h-[210px] flex-1 flex-col gap-1.5 p-4">
        <span
          style={{ background: cor }}
          className="mb-1.5 grid h-[84px] place-items-center rounded-lg font-display text-[34px] font-extrabold text-white"
        >
          {jogo.nome.slice(0, 2).toUpperCase()}
        </span>
        <h3 className="font-display text-lg/[1.2] font-semibold">{jogo.nome}</h3>
        <span className="text-sm text-muted">
          {jogo.genero || 'Sem gênero'} · {jogo.tipo === 'fisico' ? 'Físico' : 'Digital'}
        </span>
        <span className="text-sm font-semibold text-brand">{notaTexto(resumo)}</span>
        <span className={`text-[13px] font-semibold ${est.classe}`}>{est.texto}</span>
        <span className="mt-auto font-display text-xl font-extrabold">{brl(jogo.preco)}</span>
      </span>
    </button>
  );
}
