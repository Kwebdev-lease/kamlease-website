import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initializeConfiguration } from './lib/config-init';

// Initialize configuration before rendering the app
initializeConfiguration().then((result) => {
  if (!result.success) {
    console.error('Failed to initialize configuration:', result.error);
    // Still render the app but with degraded functionality
  }
  
  if (result.warnings && result.warnings.length > 0) {
    console.warn('Configuration warnings:', result.warnings);
  }
  
  createRoot(document.getElementById('root')!).render(<App />);
}).catch((error) => {
  console.error('Unexpected error during app initialization:', error);
  // Render app anyway to show error state
  createRoot(document.getElementById('root')!).render(<App />);
});
