/**
 * SEO System Verification Script
 * 
 * This script verifies that the SEO system has been implemented correctly.
 * Run this in the browser console to check SEO functionality.
 */

// Check if SEO components are properly imported and available
console.log('🔍 SEO System Verification');
console.log('==========================');

// 1. Check if SEO configuration is loaded
try {
  const seoConfig = await import('../lib/seo-config');
  console.log('✅ SEO Configuration loaded:', seoConfig.seoConfig.site.name);
  console.log('✅ Pages SEO Data loaded:', Object.keys(seoConfig.pagesSEOData));
} catch (error) {
  console.error('❌ SEO Configuration failed to load:', error);
}

// 2. Check if SEO Meta Manager is available
try {
  const { SEOMetaManager } = await import('../lib/seo-meta-manager');
  const manager = SEOMetaManager.getInstance();
  console.log('✅ SEO Meta Manager available');
  
  // Test title generation
  const optimizedTitle = SEOMetaManager.generateOptimizedTitle(
    'Test Page',
    ['test', 'seo'],
    'fr'
  );
  console.log('✅ Title generation works:', optimizedTitle);
} catch (error) {
  console.error('❌ SEO Meta Manager failed to load:', error);
}

// 3. Check if SEO hooks are available
try {
  const seoHooks = await import('../hooks/use-seo-meta');
  console.log('✅ SEO Hooks available:', Object.keys(seoHooks));
} catch (error) {
  console.error('❌ SEO Hooks failed to load:', error);
}

// 4. Check if SEO components are available
try {
  const seoComponents = await import('../components/SEOHead');
  console.log('✅ SEO Components available:', Object.keys(seoComponents));
} catch (error) {
  console.error('❌ SEO Components failed to load:', error);
}

// 5. Check current page meta tags (if running in browser)
if (typeof document !== 'undefined') {
  console.log('\n📄 Current Page Meta Tags:');
  console.log('Title:', document.title);
  
  const description = document.querySelector('meta[name="description"]');
  console.log('Description:', description?.getAttribute('content') || 'Not found');
  
  const keywords = document.querySelector('meta[name="keywords"]');
  console.log('Keywords:', keywords?.getAttribute('content') || 'Not found');
  
  const ogTitle = document.querySelector('meta[property="og:title"]');
  console.log('OG Title:', ogTitle?.getAttribute('content') || 'Not found');
  
  const canonical = document.querySelector('link[rel="canonical"]');
  console.log('Canonical URL:', canonical?.getAttribute('href') || 'Not found');
  
  const hreflangTags = document.querySelectorAll('link[hreflang]');
  console.log('Hreflang tags:', hreflangTags.length);
  
  console.log('\n🌐 Language and Locale:');
  console.log('Document language:', document.documentElement.lang);
  
  const ogLocale = document.querySelector('meta[property="og:locale"]');
  console.log('OG Locale:', ogLocale?.getAttribute('content') || 'Not found');
}

console.log('\n✨ SEO System Verification Complete!');
console.log('If all items show ✅, the SEO system is working correctly.');

export {};