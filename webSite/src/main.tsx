import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import useAppState from "./AppState";


ReactDOM.render(
  <React.StrictMode>
    <App uiState={useAppState} />
  </React.StrictMode>,
  document.getElementById('root')
)
