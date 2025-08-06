import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

// Test simple pour identifier le problème
const TestApp = () => {
  return (
    <div style={{ 
      padding: '20px', 
      fontSize: '24px', 
      color: 'white', 
      backgroundColor: 'blue',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      🚀 KAMLEASE SITE TEST - Si vous voyez ceci, React fonctionne !
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <TestApp />
    </StrictMode>,
  );
} else {
  console.error('Root element not found!');
}
