import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthContext' // Import เข้ามา

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider> {/* ครอบ AuthProvider ไว้ที่ Root */}
      <App />
    </AuthProvider>
  </StrictMode>,
)