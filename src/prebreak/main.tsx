import React from 'react'
import ReactDOM from 'react-dom/client'
import { PreBreakToast } from './PreBreakToast'
import { bootstrapLocale } from '../shared/i18n/bootstrap'
import './prebreak.css'

bootstrapLocale()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PreBreakToast />
  </React.StrictMode>,
)
