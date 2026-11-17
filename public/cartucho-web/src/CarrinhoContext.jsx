import { createContext, useContext, useEffect, useState } from 'react';

// O backend ainda não tem endpoints de carrinho (CARRINHO_ITEM existe só no banco),
// então o carrinho vive no navegador. Preço e total reais são sempre recalculados pelo servidor.
const CHAVE = 'carrinho';
const CarrinhoContext = createContext(null);
export const useCarrinho = () => useContext(CarrinhoContext);

const ler = () => {
  try { return JSON.parse(localStorage.getItem(CHAVE)) || []; } catch { return []; }
};

export function CarrinhoProvider({ children }) {
  const [itens, setItens] = useState(ler);

  useEffect(() => {
    try { localStorage.setItem(CHAVE, JSON.stringify(itens)); } catch { /* armazenamento indisponível */ }
  }, [itens]);

  const adicionar = (j) => setItens((atual) => {
    const existente = atual.find((i) => i.id_jogo === j.id_jogo);
    if (!existente) return [...atual, { id_jogo: j.id_jogo, nome: j.nome, plataforma: j.plataforma, preco: j.preco, estoque: j.estoque, quantidade: 1 }];
    return atual.map((i) => i.id_jogo === j.id_jogo ? { ...i, estoque: j.estoque, quantidade: Math.min(i.quantidade + 1, j.estoque) } : i);
  });

  const mudarQuantidade = (id, q) => setItens((atual) =>
    atual.map((i) => i.id_jogo === id ? { ...i, quantidade: Math.max(1, Math.min(q, i.estoque)) } : i));

  const remover = (id) => setItens((atual) => atual.filter((i) => i.id_jogo !== id));
  const limpar = () => setItens([]);

  const quantidade = itens.reduce((s, i) => s + i.quantidade, 0);
  const total = itens.reduce((s, i) => s + Math.round(i.preco * 100) * i.quantidade, 0) / 100;

  return (
    <CarrinhoContext.Provider value={{ itens, quantidade, total, adicionar, mudarQuantidade, remover, limpar }}>
      {children}
    </CarrinhoContext.Provider>
  );
}
