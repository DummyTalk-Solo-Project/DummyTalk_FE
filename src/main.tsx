import './index.css'
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { removeAccessToken } from './utils/auth.ts';

if (import.meta.hot) {
  // Vite 개발 서버가 처음 로드되거나 HMR이 발생할 때마다 실행됩니다.
  console.log("🛠️ Dev Server HMR/Restart Detected: Clearing Local Access Token.");
  removeAccessToken();
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);