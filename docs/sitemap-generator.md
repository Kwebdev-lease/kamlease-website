# Sitemap Generator Documentation

## Overview

The Sitemap Generator is an automated system that creates XML sitemaps for the Kamlease website, supporting multilingual content and SEO best practices. It automatically discovers routes, generates proper hreflang alternates, and integrates with the build process.

## Features

- ✅ **Automatic Route Discovery**: Discovers all application routes automatically
- ✅ **Multilingual Support**: Full support for French (default) and English with proper hreflang tags
- ✅ **SEO Optimization**: Proper priorities, changefreq, and lastmod timestamps
- ✅ **Build Integration**: Automatically generates sitemap during build process
- ✅ **XML Validation**: Built-in validation to ensure proper XML structure
- ✅ **Performance Optimized**: Efficient generation even with large numbers of URLs

## Usage

### Basic Usage

```typescript
import { SitemapGenerator } from '../lib/sitemap-generator'

// Create a new generator instance
const generator = new SitemapGenerator()

// Generate the XML sitemap
const sitemapXml = generator.generateSitemap()

// Get sitemap entries for inspection
const entries = generator.getSitemapEntries()
```

### Adding Custom Pages

```typescript
// Add a single-language page
generator.addPage('/special-page', 0.7, 'monthly', false)

// Add a multilingual page
generator.addMultilingualPage('/services', ['fr', 'en'], 0.9, 'weekly')
```

### Build Integration

The sitemap is automatically generated during the build process in two ways:

1. **Vite Plugin**: Generates sitemap.xml in the dist directory during build
2. **Post-build Script**: Generates sitemap.xml in the public directory

```bash
# Build the project (includes sitemap generation)
npm run build

# Generate sitemap manually
npm run generate:sitemap
```

## Configuration

### Route Configuration

Routes are automatically discovered with the following default configuration:

```typescript
const knownRoutes: RouteConfig[] = [
  {
    path: '/',
    priority: 1.0,
    changefreq: 'weekly',
    multilingual: true
  },
  {
    path: '/about',
    priority: 0.8,
    changefreq: 'monthly',
    multilingual: true
  },
  {
    path: '/contact',
    priority: 0.8,
    changefreq: 'monthly',
    multilingual: true
  }
]
```

### SEO Configuration

The generator uses the SEO configuration from `src/lib/seo-config.ts`:

```typescript
{
  site: {
    url: 'https://kamlease.com',
    defaultLanguage: 'fr',
    supportedLanguages: ['fr', 'en']
  }
}
```

## Generated XML Structure

The generated sitemap follows the XML sitemap protocol with multilingual support:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>https://kamlease.com</loc>
    <lastmod>2025-08-01T07:45:00.561Z</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1</priority>
    <xhtml:link rel="alternate" hreflang="fr" href="https://kamlease.com" />
    <xhtml:link rel="alternate" hreflang="en" href="https://kamlease.com/en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="https://kamlease.com" />
  </url>
  <!-- More URLs... -->
</urlset>
```

## Multilingual URL Structure

### French (Default Language)
- Home: `https://kamlease.com`
- About: `https://kamlease.com/about`
- Contact: `https://kamlease.com/contact`

### English
- Home: `https://kamlease.com/en`
- About: `https://kamlease.com/en/about`
- Contact: `https://kamlease.com/en/contact`

### Hreflang Implementation

Each URL includes proper hreflang alternates:
- `hreflang="fr"`: French version
- `hreflang="en"`: English version
- `hreflang="x-default"`: Default version for international users

## Validation

The generator includes built-in validation:

```typescript
const validation = generator.validateSitemap()

if (!validation.isValid) {
  console.error('Sitemap validation failed:', validation.errors)
}
```

### Validation Checks

- ✅ XML structure validation
- ✅ URL format validation (must start with http/https)
- ✅ Priority range validation (0.0 to 1.0)
- ✅ Changefreq value validation
- ✅ XML character escaping

## Testing

Comprehensive test coverage includes:

### Unit Tests (`src/lib/__tests__/sitemap-generator.test.ts`)
- Route discovery
- Page addition
- XML generation
- Validation
- Multilingual support
- Performance testing

### Integration Tests (`src/test/sitemap-integration.test.tsx`)
- SEO configuration integration
- XML structure validation
- Multilingual URL generation
- SEO best practices
- Error handling

Run tests:
```bash
# Run all sitemap tests
npm run test -- sitemap --run

# Run specific test file
npm run test -- src/lib/__tests__/sitemap-generator.test.ts --run
```

## Performance Considerations

- **Efficient Generation**: Handles 1000+ URLs efficiently
- **Memory Optimized**: Generates XML on-demand without storing large strings
- **Build Integration**: Only generates during build, not runtime
- **Caching**: Generated sitemap is cached until next build

## SEO Best Practices

### Priority Guidelines
- **1.0**: Homepage (highest priority)
- **0.8**: Main pages (about, contact, services)
- **0.5-0.7**: Secondary pages
- **0.3**: Legal pages, terms, privacy

### Changefreq Guidelines
- **weekly**: Homepage, frequently updated content
- **monthly**: Main pages, stable content
- **yearly**: Legal pages, rarely updated content

### URL Structure
- Clean, SEO-friendly URLs
- Consistent language prefixing
- Proper canonical structure

## Troubleshooting

### Common Issues

1. **Missing URLs in Sitemap**
   - Check if route is marked as `noindex: true`
   - Verify route is added to the generator
   - Check SEO configuration

2. **Invalid XML**
   - Run validation: `generator.validateSitemap()`
   - Check for special characters in URLs
   - Verify XML structure

3. **Build Failures**
   - Check TypeScript compilation
   - Verify all dependencies are installed
   - Check file permissions for writing sitemap.xml

### Debug Mode

Enable debug logging by modifying the build script:

```typescript
// In scripts/generate-sitemap.ts
console.log('Debug: Routes discovered:', generator.getRoutes())
console.log('Debug: Sitemap entries:', generator.getSitemapEntries())
```

## Future Enhancements

Potential improvements for the sitemap generator:

- **Dynamic Route Discovery**: Automatically discover routes from React Router
- **Content-based Priorities**: Calculate priorities based on content importance
- **Automatic Changefreq**: Determine changefreq based on content update frequency
- **Image Sitemaps**: Generate separate image sitemaps
- **News Sitemaps**: Support for news content sitemaps
- **Video Sitemaps**: Support for video content sitemaps

## API Reference

### SitemapGenerator Class

#### Constructor
```typescript
new SitemapGenerator()
```

#### Methods

##### `addPage(url, priority, changefreq, multilingual?)`
Add a single page to the sitemap.

##### `addMultilingualPage(baseUrl, languages, priority?, changefreq?)`
Add a multilingual page with language variants.

##### `generateSitemap(): string`
Generate the complete XML sitemap.

##### `getSitemapEntries(): SitemapEntry[]`
Get all sitemap entries for inspection.

##### `getRoutes(): RouteConfig[]`
Get all discovered routes.

##### `validateSitemap(): ValidationResult`
Validate the generated sitemap.

### Interfaces

#### `SitemapEntry`
```typescript
interface SitemapEntry {
  url: string
  lastmod: string
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority: number
  alternates?: AlternateLink[]
}
```

#### `RouteConfig`
```typescript
interface RouteConfig {
  path: string
  priority: number
  changefreq: SitemapEntry['changefreq']
  multilingual: boolean
  noindex?: boolean
}
```

#### `AlternateLink`
```typescript
interface AlternateLink {
  hreflang: string
  href: string
}
```