const CORES = ['#3d4bff', '#e0457b', '#0f9d78', '#d9780b', '#7a3dff', '#0a8fb5'];

// Cada plataforma tem sempre a mesma cor (lombada do card).
export const corDe = (texto) =>
  CORES[[...texto].reduce((soma, c) => soma + c.charCodeAt(0), 0) % CORES.length];

export const brl = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

export const notaTexto = (r) =>
  r ? `★ ${String(r.media).replace('.', ',')} · ${r.total} ${r.total === 1 ? 'avaliação' : 'avaliações'}` : 'Sem avaliações';

// Estoque sempre em texto + cor, nunca só cor.
export function estoqueInfo(estoque) {
  if (estoque <= 0) return { texto: 'Sem estoque', classe: 'text-warn' };
  if (estoque <= 5) return { texto: `Últimas ${estoque} unidades`, classe: 'text-warn' };
  return { texto: 'Em estoque', classe: 'text-ok' };
}
