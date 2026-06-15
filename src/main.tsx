import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Intercept and suppress noisy third-party extension errors (like MetaMask, Web3, RPC)
if (typeof window !== 'undefined') {
  const isExtensionError = (msg: string): boolean => {
    const text = msg.toLowerCase();
    return (
      text.includes('metamask') ||
      text.includes('ethereum') ||
      text.includes('web3') ||
      text.includes('rpc') ||
      text.includes('provider') ||
      text.includes('wallet')
    );
  };

  const handleError = (message: string) => {
    if (isExtensionError(message)) {
      console.warn('Suppressed third-party extension error safely:', message);
      return true;
    }
    return false;
  };

  window.onerror = function (message, source, lineno, colno, error) {
    const msg = String(message || (error && error.message) || '');
    if (handleError(msg)) {
      return true; // Prevents default browser logging and bubbling
    }
    return false;
  };

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const msg = reason ? String(reason.message || reason) : '';
    if (isExtensionError(msg)) {
      console.warn('Suppressed third-party extension promise rejection safely:', msg);
      event.preventDefault();
      event.stopPropagation();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

