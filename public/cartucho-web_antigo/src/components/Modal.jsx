import { useEffect, useRef } from 'react';

// <dialog> nativo: foco preso, Esc fecha e o fundo escurece sem biblioteca.
export default function Modal({ aberto, onFechar, children, largura = 'min(440px,92vw)' }) {
  const ref = useRef(null);

  useEffect(() => {
    const d = ref.current;
    if (aberto && !d.open) d.showModal();
    if (!aberto && d.open) d.close();
  }, [aberto]);

  return (
    <dialog
      ref={ref}
      onClose={onFechar}
      style={{ width: largura }}
      className="m-auto max-h-[90vh] overflow-auto rounded-2xl border-[1.5px] border-line bg-surface p-6 text-ink"
    >
      {aberto && children}
    </dialog>
  );
}
