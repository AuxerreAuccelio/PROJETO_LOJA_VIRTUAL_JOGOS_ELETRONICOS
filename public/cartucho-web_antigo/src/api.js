// Cliente único da API. O token fica em sessionStorage só enquanto não há cookie httpOnly
// (ver "Pendente" na seção 10.2 da documentação).
const CHAVE = 'token';
export const getToken = () => sessionStorage.getItem(CHAVE);
export const setToken = (t) => (t ? sessionStorage.setItem(CHAVE, t) : sessionStorage.removeItem(CHAVE));

let aoExpirar = () => {};
export const definirAoExpirar = (fn) => { aoExpirar = fn; };

export async function api(url, opcoes = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = 'Bearer ' + token;

  const r = await fetch(url, { ...opcoes, headers });
  const dados = await r.json().catch(() => ({}));

  // Token vencido: limpa e avisa o app (login com senha errada também é 401, por isso a exceção).
  if (r.status === 401 && token && !url.includes('/login')) { setToken(null); aoExpirar(); }

  if (!r.ok) {
    throw new Error(
      dados.erros?.map((e) => `${e.campo}: ${e.problema}`).join('; ') ||
      dados.mensagem || dados.erro || 'Erro inesperado'
    );
  }
  return dados;
}

export const post = (url, corpo) => api(url, { method: 'POST', body: JSON.stringify(corpo) });
