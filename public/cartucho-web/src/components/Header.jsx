import { useAuth } from '../AuthContext.jsx';
import { useCarrinho } from '../CarrinhoContext.jsx';

export default function Header({ onEntrar, onCarrinho }) {
  const { cliente, sair } = useAuth();
  const { quantidade } = useCarrinho();
  return (
    <header className="sticky top-0 z-30 border-b border-line/80 bg-surface/90 px-[clamp(20px,5vw,72px)] py-3 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4">
        <a href="#topo" aria-label="Cartucho, início" className="flex items-center gap-2.5" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand font-display text-xl font-extrabold text-brand-ink shadow-md shadow-brand/20">C</span>
          <span className="font-display text-[25px] font-extrabold tracking-[-0.04em]">Cartucho<span className="text-brand">.</span></span>
        </a>
        <nav aria-label="Ações da conta" className="flex items-center gap-2 sm:gap-3">
          {cliente && <span className="hidden text-sm text-muted md:inline">Olá, <b className="text-ink">{cliente.nome.split(' ')[0]}</b></span>}
          <button type="button" onClick={onCarrinho} className="relative rounded-xl border border-line bg-bg px-3.5 py-2.5 text-sm font-bold transition hover:border-brand hover:text-brand sm:px-4">
            <span aria-hidden="true" className="mr-2">▣</span>Carrinho
            {quantidade > 0 && <span className="ml-2 inline-grid min-h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-[11px] text-brand-ink">{quantidade}</span>}
          </button>
          {cliente ? (
            <button type="button" onClick={sair} className="rounded-xl px-2 py-2.5 text-sm font-semibold text-muted transition hover:text-ink">Sair</button>
          ) : (
            <button type="button" onClick={onEntrar} className="rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-brand-ink shadow-md shadow-brand/15 transition hover:-translate-y-0.5">Entrar <span className="hidden sm:inline">ou criar conta</span></button>
          )}
        </nav>
      </div>
    </header>
  );
}
