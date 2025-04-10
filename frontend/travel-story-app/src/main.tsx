import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import 'react-day-picker/style.css'
import './index.css'
import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: 'https://9c6eccdb37a5555089711d72aa4556fc@o4507231223939072.ingest.de.sentry.io/4509126357483600',
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
