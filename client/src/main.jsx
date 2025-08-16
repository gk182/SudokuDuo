import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/global.css'
import { SocketProvider } from './contexts/SocketContext'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
      <SocketProvider>
        <App />
      </SocketProvider>
    </React.StrictMode>
)
