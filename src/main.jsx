import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

// Hide static content when React app loads
const staticContent = document.getElementById('static-content')
if (staticContent) {
  staticContent.style.display = 'none'
}

createRoot(document.getElementById('react-root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
