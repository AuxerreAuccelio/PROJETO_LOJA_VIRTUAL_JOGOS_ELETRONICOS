import { useState } from 'react';
import Modal from './Modal.jsx';
import { useAuth } from '../AuthContext.jsx';

const campo = 'w-full rounded-[10px] border-[1.5px] border-line bg-bg px-3 py-2.5';
const rotulo = 'mb-1 mt-3 block text-sm font-semibold';
const aba = (ativa) =>
  `rounded-full border-[1.5px] px-3.5 py-1.5 ${ativa ? 'border-ink bg-ink text-bg' : 'border-line bg-surface'}`;

export default function AuthDialog({ aberto, onFechar }) {
  const { entrar, criarConta } = useAuth();
  const [criar, setCriar] = useState(false);
  const [f, setF] = useState({ nome: '', email: '', senha: '', lgpd: false });
  const [erro, setErro] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const trocar = (c) => { setCriar(c); setErro(''); };

  async function enviar(ev) {
    ev.preventDefault();
    try {
      const email = f.email.trim();
      if (criar) await criarConta({ nome: f.nome.trim(), email, senha: f.senha, aceite_lgpd: f.lgpd });
      else await entrar(email, f.senha);
      setF({ nome: '', email: '', senha: '', lgpd: false });
      setErro('');
      onFechar();
    } catch (e) { setErro(e.message); }
  }

  return (
    <Modal aberto={aberto} onFechar={onFechar}>
      <div className="mb-2 flex gap-2">
        <button type="button" aria-pressed={!criar} className={aba(!criar)} onClick={() => trocar(false)}>Entrar</button>
        <button type="button" aria-pressed={criar} className={aba(criar)} onClick={() => trocar(true)}>Criar conta</button>
      </div>
      <form onSubmit={enviar} noValidate>
        <h2 className="mb-3 font-display text-2xl font-extrabold">{criar ? 'Criar conta' : 'Entrar'}</h2>
        {criar && (
          <>
            <label htmlFor="nome" className={rotulo}>Nome</label>
            <input id="nome" className={campo} autoComplete="name" value={f.nome} onChange={set('nome')} />
          </>
        )}
        <label htmlFor="email" className={rotulo}>E-mail</label>
        <input id="email" type="email" className={campo} autoComplete="email" value={f.email} onChange={set('email')} />
        <label htmlFor="senha" className={rotulo}>Senha</label>
        <input id="senha" type="password" className={campo} autoComplete={criar ? 'new-password' : 'current-password'} value={f.senha} onChange={set('senha')} />
        {criar && (
          <label className="mt-3.5 flex items-start gap-2 text-sm">
            <input type="checkbox" checked={f.lgpd} onChange={set('lgpd')} />
            Aceito os termos de uso e o tratamento dos meus dados (LGPD).
          </label>
        )}
        <div role="alert" className="mt-2.5 min-h-[1.2em] text-sm text-warn">{erro}</div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="submit" className="rounded-[10px] border-[1.5px] border-brand bg-brand px-4 py-2 font-semibold text-brand-ink">
            {criar ? 'Criar conta' : 'Entrar'}
          </button>
          <button type="button" onClick={onFechar} className="rounded-[10px] border-[1.5px] border-ink px-4 py-2 font-semibold">Cancelar</button>
        </div>
      </form>
    </Modal>
  );
}
