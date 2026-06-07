import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { TrackerProvider } from './context/TrackerContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <TrackerProvider>
      <App />
    </TrackerProvider>
  </React.StrictMode>,
)
