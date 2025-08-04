import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Simple test to see if the app renders
console.log('Starting app...');

const root = createRoot(document.getElementById('root')!);

// Render a simple test first
root.render(
  <div style={{ padding: '20px', fontSize: '24px', color: 'red' }}>
    🚀 Test - Site Kamlease Loading...
  </div>
);

// Then render the real app after a delay
setTimeout(() => {
  console.log('Rendering real app...');
  root.render(<App />);
}, 1000);
