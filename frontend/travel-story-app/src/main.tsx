import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import 'react-day-picker/style.css'
import './index.css'
import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: 'https://9c6eccdb37a5555089711d72aa4556fc@o4507231223939072.ingest.de.sentry.io/4509126357483600',
  integrations: [Sentry.replayIntegration()],
  // Session Replay
  replaysSessionSampleRate: 1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
