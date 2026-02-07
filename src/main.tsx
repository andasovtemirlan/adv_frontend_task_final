import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store';
import { initializeAuth } from './features/auth/authSlice';
import App from './App.tsx';
import './index.css';

// Initialize auth from localStorage
store.dispatch(initializeAuth());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
);
