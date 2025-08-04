import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initializeConfiguration } from './lib/config-init';

// Render the app immediately
const root = createRoot(document.getElementById('root')!);
root.render(<App />);

// Initialize configuration in the background
initializeConfiguration().then((result) => {
  if (!result.success) {
    console.error('Failed to initialize configuration:', result.error);
  }
  
  if (result.warnings && result.warnings.length > 0) {
    console.warn('Configuration warnings:', result.warnings);
  }
}).catch((error) => {
  console.error('Unexpected error during app initialization:', error);
});
