import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Em desenvolvimento, /api vai para o Express (porta 3000): sem CORS e sem mudar as URLs.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // allowedHosts: true permite abrir o front por um túnel https (necessário para testar o Mercado Pago).
  server: { allowedHosts: true, proxy: { '/api': 'http://localhost:3000' } }
});
