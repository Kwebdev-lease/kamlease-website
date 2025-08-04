#!/usr/bin/env node

/**
 * Build script to generate sitemap.xml automatically during build process
 * This script should be run as part of the build pipeline
 */

import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

// Import the sitemap generator
import { SitemapGenerator } from '../src/lib/sitemap-generator.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function generateSitemap() {
  console.log('🗺️  Generating sitemap.xml...')
  
  try {
    // Create sitemap generator instance
    const generator = new SitemapGenerator()
    
    // Add any additional dynamic routes here if needed
    // For example, if you have blog posts or dynamic content:
    // generator.addMultilingualPage('/services/mecatronique', ['fr', 'en'], 0.8, 'monthly')
    // generator.addMultilingualPage('/services/electronique', ['fr', 'en'], 0.8, 'monthly')
    // generator.addMultilingualPage('/services/auto-staging', ['fr', 'en'], 0.8, 'monthly')
    
    // Validate the sitemap before generation
    const validation = generator.validateSitemap()
    if (!validation.isValid) {
      console.error('❌ Sitemap validation failed:')
      validation.errors.forEach(error => console.error(`   - ${error}`))
      process.exit(1)
    }
    
    // Generate the XML
    const sitemapXml = generator.generateSitemap()
    
    // Ensure the public directory exists
    const publicDir = join(__dirname, '..', 'public')
    mkdirSync(publicDir, { recursive: true })
    
    // Write sitemap.xml to public directory
    const sitemapPath = join(publicDir, 'sitemap.xml')
    writeFileSync(sitemapPath, sitemapXml, 'utf-8')
    
    // Generate some statistics
    const entries = generator.getSitemapEntries()
    const totalUrls = entries.length
    const multilingualUrls = entries.filter(e => e.alternates && e.alternates.length > 0).length
    
    console.log('✅ Sitemap generated successfully!')
    console.log(`   📍 Location: ${sitemapPath}`)
    console.log(`   📊 Total URLs: ${totalUrls}`)
    console.log(`   🌍 Multilingual URLs: ${multilingualUrls}`)
    console.log(`   📏 File size: ${(sitemapXml.length / 1024).toFixed(2)} KB`)
    
    // Log the routes for verification
    console.log('\n📋 Generated routes:')
    const routes = generator.getRoutes()
    routes.forEach(route => {
      const multilingual = route.multilingual ? '🌍' : '📄'
      console.log(`   ${multilingual} ${route.path} (priority: ${route.priority}, changefreq: ${route.changefreq})`)
    })
    
  } catch (error) {
    console.error('❌ Failed to generate sitemap:', error)
    process.exit(1)
  }
}

// Run the script
generateSitemap()