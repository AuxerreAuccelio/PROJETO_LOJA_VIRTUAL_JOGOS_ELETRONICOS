import { useAuth } from '../AuthContext.jsx';

export default function Header({ onEntrar }) {
  const { cliente, sair } = useAuth();
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line bg-surface px-[clamp(16px,4vw,48px)] py-[18px]">
      <div className="font-display text-[28px] font-extrabold tracking-[-0.03em]">
        Cartucho<span className="text-brand">.</span>
      </div>
      {cliente ? (
        <div className="flex items-center gap-3">
          <span>Olá, {cliente.nome.split(' ')[0]}</span>
          <button onClick={sair} className="rounded-[10px] border-[1.5px] border-ink px-4 py-2 font-semibold">Sair</button>
        </div>
      ) : (
        <button onClick={onEntrar} className="rounded-[10px] border-[1.5px] border-brand bg-brand px-4 py-2 font-semibold text-brand-ink">
          Entrar ou criar conta
        </button>
      )}
    </header>
  );
}
