import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from '@/components/ThemeProvider';
import { LanguageProvider } from '@/contexts/LanguageProvider';
import { Toaster } from '@/components/ui/sonner';
import './index.css';

// Import des pages existantes
import Index from '@/pages/Index';
import NotFound from '@/pages/NotFound';

// App simplifiée sans les features complexes qui causaient des problèmes
const App = () => {
  return (
    <HelmetProvider>
      <LanguageProvider>
        <ThemeProvider defaultTheme="dark" storageKey="kamlease-ui-theme">
          <BrowserRouter>
            <Toaster />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/fr" element={<Index />} />
              <Route path="/en" element={<Index />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ThemeProvider>
      </LanguageProvider>
    </HelmetProvider>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
} else {
  console.error('Root element not found!');
}
