import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import { GoogleOAuthProvider } from '@react-oauth/google';
import { GoogleConfig } from './constants/googleConfig';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GoogleConfig.clientId}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
