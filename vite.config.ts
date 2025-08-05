import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { writeFileSync } from 'fs';
import { SitemapGenerator } from './src/lib/sitemap-generator';

// Vite plugin to generate sitemap during build
const sitemapPlugin = () => ({
  name: 'sitemap-generator',
  generateBundle() {
    try {
      const generator = new SitemapGenerator();
      const sitemapXml = generator.generateSitemap();
      
      // Write sitemap to dist directory
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: sitemapXml
      });
      
      console.log('✅ Sitemap.xml generated and added to build output');
    } catch (error) {
      console.error('❌ Failed to generate sitemap during build:', error);
    }
  }
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), sitemapPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@radix-ui/react-accordion', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu']
        }
      }
    }
  },
});
