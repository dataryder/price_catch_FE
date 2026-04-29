import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from "@govtechmy/myds-react/hooks";
import { DuckDBProvider } from './contexts/DuckDBContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <DuckDBProvider>
          <App />
        </DuckDBProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
)