/**
 * main.jsx - Punto de Entrada Principal del Frontend
 * Inicializa React 18, monta el enrutador BrowserRouter y provee el AuthProvider global.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { BrowserRouter } from 'react-router-dom'
import './styles.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Habilita el enrutamiento SPA mediante el historial del navegador */}
    <BrowserRouter>
      {/* Proveedor de estado global de autenticación para toda la app */}
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
