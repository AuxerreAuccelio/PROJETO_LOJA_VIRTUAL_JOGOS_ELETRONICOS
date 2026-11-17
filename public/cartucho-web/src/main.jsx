import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './AuthContext.jsx';
import { CarrinhoProvider } from './CarrinhoContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <CarrinhoProvider>
        <App />
      </CarrinhoProvider>
    </AuthProvider>
  </StrictMode>
);
