import { useEffect, useMemo, useState } from 'react';
import { api } from './api.js';
import Header from './components/Header.jsx';
import CardJogo from './components/CardJogo.jsx';
import DetalheJogo from './components/DetalheJogo.jsx';
import AuthDialog from './components/AuthDialog.jsx';
import Carrinho from './components/Carrinho.jsx';
import RetornoPagamento from './components/RetornoPagamento.jsx';

const campoFiltro = 'rounded-xl border border-line bg-surface px-4 py-3 text-sm shadow-sm transition focus:border-brand';

export default function App() {
  const [jogos, setJogos] = useState([]);
  const [resumo, setResumo] = useState({});
  const [estado, setEstado] = useState('Carregando jogos…');
  const [plataforma, setPlataforma] = useState('');
  const [tipo, setTipo] = useState('');
  const [ordem, setOrdem] = useState('relevancia');
  const [busca, setBusca] = useState('');
  const [aberto, setAberto] = useState(null);
  const [authAberto, setAuthAberto] = useState(false);
  const [carrinhoAberto, setCarrinhoAberto] = useState(false);

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
      (!q || `${j.nome} ${j.desenvolvedora || ''} ${j.genero || ''}`.toLowerCase().includes(q)))
      .sort((a, b) => {
        if (ordem === 'menor-preco') return a.preco - b.preco;
        if (ordem === 'maior-preco') return b.preco - a.preco;
        if (ordem === 'nome') return a.nome.localeCompare(b.nome, 'pt-BR');
        return 0;
      });
  }, [jogos, plataforma, tipo, busca, ordem]);
  const vazio = !estado && lista.length === 0;

  return (
    <>
      <Header onEntrar={() => setAuthAberto(true)} onCarrinho={() => setCarrinhoAberto(true)} />

      <div className="border-b border-line bg-surface px-5 py-2.5 text-center text-xs font-medium text-muted">
        <span className="mx-3 inline-flex items-center gap-2"><b className="text-brand">◆</b> Jogos físicos e digitais</span>
        <span className="mx-3 hidden sm:inline-flex sm:items-center sm:gap-2"><b className="text-brand">★</b> Avaliações de quem já jogou</span>
        <span className="mx-3 hidden md:inline-flex md:items-center md:gap-2"><b className="text-brand">✓</b> Pagamento processado pelo Mercado Pago</span>
      </div>

      <section className="hero-shell relative overflow-hidden">
        <div className="hero-orb" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-[1280px] items-center gap-10 px-[clamp(20px,5vw,72px)] py-[clamp(46px,7vw,84px)] md:grid-cols-[1.05fr_.95fr]">
          <div>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/5 px-3.5 py-2 text-xs font-bold uppercase tracking-[.16em] text-brand">
              <span className="h-2 w-2 rounded-full bg-brand" /> Loja gamer · Cartucho
            </p>
            <h1 className="mb-5 max-w-[13ch] font-display text-[clamp(42px,7vw,78px)]/[.98] font-extrabold tracking-[-0.055em]">
              Seu próximo <span className="text-brand">mundo</span> começa aqui.
            </h1>
            <p className="mb-8 max-w-[48ch] text-base leading-7 text-muted md:text-lg">
              Descubra jogos para sua plataforma, compare formatos e encontre a próxima aventura da sua coleção.
            </p>
            <a href="#catalogo" className="inline-flex items-center gap-3 rounded-xl bg-brand px-5 py-3.5 font-bold text-brand-ink shadow-lg shadow-brand/20 transition hover:-translate-y-0.5">
              Ver todos os jogos <span aria-hidden="true">↓</span>
            </a>
          </div>
          <div className="feature-showcase">
            <div className="hero-art" aria-label="Ilustração de caixas de jogos" role="img">
              <div className="game-tile game-tile-back"><span>PLAYER 02</span><b>✦</b><small>PLAY YOUR WAY</small></div>
              <div className="game-tile game-tile-front"><span>NEW QUEST</span><b>▶</b><small>READY WHEN<br />YOU ARE</small></div>
              <div className="hero-spark hero-spark-one">✦</div><div className="hero-spark hero-spark-two">✳</div>
            </div>
            {jogos[0] && <button type="button" onClick={() => setAberto(jogos[0].id_jogo)} className="feature-caption group">
              <span><small>DESCUBRA NA CARTUCHO</small><b>{jogos[0].nome}</b></span><span className="feature-arrow">↗</span>
            </button>}
          </div>
        </div>
      </section>

      <main id="catalogo" className="mx-auto max-w-[1280px] px-[clamp(20px,5vw,72px)] pb-20 pt-12 md:pt-16">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-brand">A coleção</p>
            <h2 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">Encontre seu próximo jogo</h2>
          </div>
          <p className="text-sm text-muted">{lista.length} {lista.length === 1 ? 'resultado' : 'resultados'}</p>
        </div>

        <div className="mb-5 grid gap-3 sm:grid-cols-[minmax(240px,1fr)_210px_190px]">
          <label className="relative block">
            <span className="sr-only">Buscar jogos</span>
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true">⌕</span>
            <input type="search" placeholder="Buscar jogo, gênero ou estúdio" className={`${campoFiltro} w-full pl-11`} value={busca} onChange={(e) => setBusca(e.target.value)} />
          </label>
          <select aria-label="Tipo de jogo" className={campoFiltro} value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="">Todos os formatos</option><option value="digital">Só digital</option><option value="fisico">Só físico</option>
          </select>
          <select aria-label="Ordenar jogos" className={campoFiltro} value={ordem} onChange={(e) => setOrdem(e.target.value)}>
            <option value="relevancia">Ordenar por</option><option value="menor-preco">Menor preço</option><option value="maior-preco">Maior preço</option><option value="nome">Nome A–Z</option>
          </select>
        </div>

        <div className="mb-3 flex items-center justify-between"><h3 className="font-display text-sm font-bold">Escolha sua plataforma</h3><span className="text-xs text-muted">{plataformas.length} {plataformas.length === 1 ? 'plataforma' : 'plataformas'}</span></div>
        <div role="group" aria-label="Plataformas" className="mb-8 flex flex-wrap gap-2">
          {['', ...plataformas].map((p) => (
            <button key={p || 'todas'} type="button" aria-pressed={p === plataforma} onClick={() => setPlataforma(p)}
              className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${p === plataforma ? 'border-brand bg-brand text-brand-ink shadow-md shadow-brand/20' : 'border-line bg-surface text-muted hover:border-brand hover:text-brand'}`}>
              <span aria-hidden="true" className="mr-2">{p ? '⌘' : '◈'}</span>{p || 'Todas'}
            </button>
          ))}
        </div>

        <div aria-live="polite" className="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-5">
          {lista.map((j) => <CardJogo key={j.id_jogo} jogo={j} resumo={resumo[j.id_jogo]} onAbrir={setAberto} />)}
        </div>
        {(estado || vazio) && <p className="rounded-2xl border border-dashed border-line py-14 text-center text-muted">{estado || 'Nenhum jogo encontrado. Tente outra plataforma ou outro termo.'}</p>}
      </main>

      <footer className="border-t border-line bg-surface/70 px-5 py-8 text-center text-sm text-muted">
        <span className="font-display font-extrabold text-ink">Cartucho<span className="text-brand">.</span></span> · Feito para quem vive cada partida.
      </footer>

      <DetalheJogo idJogo={aberto} onFechar={() => setAberto(null)} aoAvaliar={carregarResumo} />
      <Carrinho aberto={carrinhoAberto} onFechar={() => setCarrinhoAberto(false)} onEntrar={() => setAuthAberto(true)} />
      <RetornoPagamento onEntrar={() => setAuthAberto(true)} />
      <AuthDialog aberto={authAberto} onFechar={() => setAuthAberto(false)} />
    </>
  );
}
