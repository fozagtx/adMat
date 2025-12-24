import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './components/App';
import './styles/index.css';

// Prevent multiple injections
if (!document.getElementById('hdc-root')) {
  const root = document.createElement('div');
  root.id = 'hdc-root';
  document.body.appendChild(root);

  createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
