import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { Amplify } from 'aws-amplify'

// Configure AWS Amplify with Cognito
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: "us-east-1_7wc3BwnrT",
      userPoolClientId: "e3tupt3l8ch25vt211chocm7q",
      loginWith: {
        username: true,
        email: true,
        phone: true,
      },
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
