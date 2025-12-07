import { inject } from '@vercel/analytics'
import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import './i18n'

// Initialize Vercel Web Analytics
inject()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Suspense fallback="Loading...">
      <App />
    </Suspense>
  </React.StrictMode>
)
