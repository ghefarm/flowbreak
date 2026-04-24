import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { bootstrapLocale } from './shared/i18n/bootstrap'

bootstrapLocale('settings.title')

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
