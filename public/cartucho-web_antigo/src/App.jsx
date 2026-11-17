import { useEffect, useMemo, useState } from 'react';
import { api } from './api.js';
import Header from './components/Header.jsx';
import CardJogo from './components/CardJogo.jsx';
import DetalheJogo from './components/DetalheJogo.jsx';
import AuthDialog from './components/AuthDialog.jsx';

const campoFiltro = 'rounded-[10px] border-[1.5px] border-line bg-surface px-3.5 py-2.5';

export default function App() {
  const [jogos, setJogos] = useState([]);
  const [resumo, setResumo] = useState({});
  const [estado, setEstado] = useState('Carregando jogos…');
  const [plataforma, setPlataforma] = useState('');
  const [tipo, setTipo] = useState('');
  const [busca, setBusca] = useState('');
  const [aberto, setAberto] = useState(null);
  const [authAberto, setAuthAberto] = useState(false);

  const carregarResumo = () => api('/api/avaliacoes/resumo').then(setResumo).catch(() => setResumo({}));

  useEffect(() => {
    api('/api/jogos')
      .then((lista) => { setJogos(lista); setEstado(''); carregarResumo(); })
      .catch(() => setEstado('Não foi possível carregar os jogos. Confira se o servidor está rodando.'));
  }, []);

  const plataformas = useMemo(() => [...new Set(jogos.map((j) => j.plataforma))].sort(), [jogos]);

  const lista = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return jogos.filter((j) =>
      (!plataforma || j.plataforma === plataforma) &&
      (!tipo || j.tipo === tipo) &&
      (!q || `${j.nome} ${j.desenvolvedora || ''}`.toLowerCase().includes(q)));
  }, [jogos, plataforma, tipo, busca]);

  const vazio = !estado && lista.length === 0;

  return (
    <>
      <Header onEntrar={() => setAuthAberto(true)} />

      <section className="mx-auto max-w-[1200px] px-[clamp(16px,4vw,48px)] pb-6 pt-[clamp(32px,6vw,72px)]">
        <h1 className="mb-3 max-w-[16ch] font-display text-[clamp(34px,6vw,64px)]/[1.02] font-extrabold tracking-[-0.035em]">
          Jogos físicos e digitais, num só lugar.
        </h1>
        <p className="mb-6 max-w-[52ch] text-muted">Escolha a plataforma, veja o preço e confira se ainda tem no estoque.</p>
        <div className="flex flex-wrap gap-3">
          <input type="search" aria-label="Buscar jogos" placeholder="Buscar por nome ou desenvolvedora"
            className={`${campoFiltro} flex-[1_1_260px]`} value={busca} onChange={(e) => setBusca(e.target.value)} />
          <select aria-label="Tipo de jogo" className={campoFiltro} value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="">Digital e físico</option>
            <option value="digital">Só digital</option>
            <option value="fisico">Só físico</option>
          </select>
        </div>
      </section>

      <main className="mx-auto max-w-[1200px] px-[clamp(16px,4vw,48px)] pb-16 pt-2">
        <div role="group" aria-label="Plataformas" className="my-5 flex flex-wrap gap-2">
          {['', ...plataformas].map((p) => (
            <button key={p || 'todas'} type="button" aria-pressed={p === plataforma} onClick={() => setPlataforma(p)}
              className={`rounded-full border-[1.5px] px-3.5 py-1.5 ${p === plataforma ? 'border-ink bg-ink text-bg' : 'border-line bg-surface'}`}>
              {p || 'Todas'}
            </button>
          ))}
        </div>

        <div aria-live="polite" className="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-[22px]">
          {lista.map((j) => <CardJogo key={j.id_jogo} jogo={j} resumo={resumo[j.id_jogo]} onAbrir={setAberto} />)}
        </div>

        {(estado || vazio) && (
          <p className="py-12 text-center text-muted">
            {estado || 'Nenhum jogo encontrado. Tente outra plataforma ou outro termo.'}
          </p>
        )}
      </main>

      <DetalheJogo idJogo={aberto} onFechar={() => setAberto(null)} aoAvaliar={carregarResumo} />
      <AuthDialog aberto={authAberto} onFechar={() => setAuthAberto(false)} />
    </>
  );
}
