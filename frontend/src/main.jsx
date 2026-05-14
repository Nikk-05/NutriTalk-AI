import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store/store'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Provider makes the Redux store available to every component in the tree */}
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
)