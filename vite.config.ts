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
export default defineConfig(({ mode }) => ({
  plugins: [react(), sitemapPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Optimize chunk splitting for better caching and performance
    rollupOptions: {
      // Enable tree shaking
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        unknownGlobalSideEffects: false
      },
      output: {
        manualChunks: (id) => {
          // Vendor chunks for better caching
          if (id.includes('node_modules')) {
            // React ecosystem
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor'
            }
            // UI components
            if (id.includes('@radix-ui') || id.includes('lucide-react')) {
              return 'ui-vendor'
            }
            // Router
            if (id.includes('react-router')) {
              return 'router-vendor'
            }
            // Query/state management
            if (id.includes('@tanstack') || id.includes('zustand')) {
              return 'query-vendor'
            }
            // Animation libraries
            if (id.includes('framer-motion') || id.includes('lottie')) {
              return 'animation-vendor'
            }
            // Other vendors
            return 'vendor'
          }
          
          // SEO-related chunks
          if (id.includes('src/lib/seo') || id.includes('src/lib/structured-data') || id.includes('src/lib/sitemap')) {
            return 'seo'
          }
          
          // Performance-related chunks
          if (id.includes('src/lib/performance') || id.includes('src/lib/lazy-loading') || id.includes('src/lib/resource-optimization')) {
            return 'performance'
          }
          
          // Accessibility chunks
          if (id.includes('src/lib/accessibility') || id.includes('src/hooks/use-accessibility')) {
            return 'accessibility'
          }
          
          // Component chunks for large components
          if (id.includes('src/components') && !id.includes('src/components/ui')) {
            return 'components'
          }
        },
        // Optimize chunk file names with better hashing
        chunkFileNames: `assets/js/[name]-[hash:8].js`,
        entryFileNames: `assets/js/[name]-[hash:8].js`,
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name!.split('.')
          const ext = info[info.length - 1]
          if (/png|jpe?g|svg|gif|tiff|bmp|ico|webp/i.test(ext)) {
            return `assets/images/[name]-[hash:8][extname]`
          }
          if (/woff2?|eot|ttf|otf/i.test(ext)) {
            return `assets/fonts/[name]-[hash:8][extname]`
          }
          if (/css/i.test(ext)) {
            return `assets/css/[name]-[hash:8][extname]`
          }
          return `assets/[name]-[hash:8][extname]`
        }
      }
    },
    // Enable source maps for production debugging if needed
    sourcemap: mode === 'development' ? true : 'hidden',
    // Optimize build performance
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari13.1'],
    minify: 'esbuild',
    // Optimize chunk size with warnings
    chunkSizeWarningLimit: 800, // Reduced from 1000 for better performance
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Optimize assets with better compression
    assetsInlineLimit: 2048, // Reduced from 4KB for better caching
    // Enable CSS minification
    cssMinify: true,
    // Optimize build output
    reportCompressedSize: true,
    // Additional build optimizations
    emptyOutDir: true,
    // Enable modern build features
    modulePreload: {
      polyfill: true
    }
  },
  // Optimize dev server performance
  server: {
    fs: {
      // Allow serving files from one level up to the project root
      allow: ['..'],
    },
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'lucide-react',
    ],
  },
}));
