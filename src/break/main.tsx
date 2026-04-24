import React from 'react'
import ReactDOM from 'react-dom/client'
import { BreakWindow } from './BreakWindow'
import { bootstrapLocale } from '../shared/i18n/bootstrap'
import './break.css'

bootstrapLocale()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BreakWindow />
  </React.StrictMode>,
)
