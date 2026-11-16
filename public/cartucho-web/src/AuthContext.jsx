import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, post, getToken, setToken, definirAoExpirar } from './api.js';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [cliente, setCliente] = useState(null);

  const sair = useCallback(() => { setToken(null); setCliente(null); }, []);

  useEffect(() => {
    definirAoExpirar(() => setCliente(null));
    if (!getToken()) return;
    api('/api/auth/perfil').then((r) => setCliente(r.cliente)).catch(sair);
  }, [sair]);

  const entrar = async (email, senha) => {
    const r = await post('/api/auth/login', { email, senha });
    setToken(r.token);
    setCliente(r.cliente);
  };

  const criarConta = async ({ nome, email, senha, aceite_lgpd }) => {
    await post('/api/auth/registrar', { nome, email, senha, aceite_lgpd });
    await entrar(email, senha);
  };

  return (
    <AuthContext.Provider value={{ cliente, entrar, criarConta, sair }}>
      {children}
    </AuthContext.Provider>
  );
}
