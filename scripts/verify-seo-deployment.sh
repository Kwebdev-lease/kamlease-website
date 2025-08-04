#!/bin/bash

# SEO Deployment Verification Script for Kamlease
# This script verifies that all SEO components are properly deployed and functioning

echo "🔍 Vérification du déploiement SEO - Kamlease"
echo "=============================================="

SITE_URL="http://localhost:5173"  # Development URL, change for production
ERRORS=0
WARNINGS=0

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    
    case $status in
        "success")
            echo -e "${GREEN}✅ $message${NC}"
            ;;
        "error")
            echo -e "${RED}❌ $message${NC}"
            ((ERRORS++))
            ;;
        "warning")
            echo -e "${YELLOW}⚠️  $message${NC}"
            ((WARNINGS++))
            ;;
        "info")
            echo -e "${BLUE}ℹ️  $message${NC}"
            ;;
    esac
}

# Function to check if a URL is accessible
check_url() {
    local url=$1
    local expected_status=${2:-200}
    local description=$3
    
    echo "Vérification de $description..."
    
    if command -v curl >/dev/null 2>&1; then
        status=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
        
        if [ "$status" -eq "$expected_status" ]; then
            print_status "success" "$description accessible (Status: $status)"
        else
            print_status "error" "$description inaccessible (Status: $status, attendu: $expected_status)"
        fi
    else
        print_status "warning" "curl non disponible, impossible de vérifier $description"
    fi
}

# Function to check for element presence in HTML
check_element() {
    local url=$1
    local element=$2
    local description=$3
    local required=${4:-true}
    
    if command -v curl >/dev/null 2>&1; then
        content=$(curl -s "$url" 2>/dev/null)
        
        if echo "$content" | grep -q "$element"; then
            print_status "success" "$description trouvé"
        else
            if [ "$required" = "true" ]; then
                print_status "error" "$description manquant"
            else
                print_status "warning" "$description manquant (optionnel)"
            fi
        fi
    else
        print_status "warning" "Impossible de vérifier $description (curl non disponible)"
    fi
}

# Function to check file existence
check_file() {
    local file_path=$1
    local description=$2
    
    if [ -f "$file_path" ]; then
        print_status "success" "$description existe"
        
        # Check file size
        size=$(wc -c < "$file_path" 2>/dev/null || echo "0")
        if [ "$size" -gt 0 ]; then
            print_status "info" "Taille du fichier: $size bytes"
        else
            print_status "warning" "Fichier vide"
        fi
    else
        print_status "error" "$description manquant"
    fi
}

# Function to check build output
check_build() {
    echo ""
    echo "🏗️  Vérification du build..."
    echo "----------------------------"
    
    if [ -d "dist" ]; then
        print_status "success" "Dossier dist existe"
        
        # Check main files
        check_file "dist/index.html" "Fichier index.html"
        
        # Check assets
        if [ -d "dist/assets" ]; then
            print_status "success" "Dossier assets existe"
            
            css_files=$(find dist/assets -name "*.css" 2>/dev/null | wc -l)
            js_files=$(find dist/assets -name "*.js" 2>/dev/null | wc -l)
            
            print_status "info" "Fichiers CSS: $css_files"
            print_status "info" "Fichiers JS: $js_files"
        else
            print_status "warning" "Dossier assets manquant"
        fi
    else
        print_status "error" "Dossier dist manquant - Exécutez 'npm run build'"
    fi
}

# Function to check SEO files
check_seo_files() {
    echo ""
    echo "🗺️  Vérification des fichiers SEO..."
    echo "-----------------------------------"
    
    # Check sitemap
    check_file "public/sitemap.xml" "Sitemap XML"
    
    if [ -f "public/sitemap.xml" ]; then
        # Validate sitemap structure
        if grep -q "<?xml version" "public/sitemap.xml" && grep -q "<urlset" "public/sitemap.xml"; then
            print_status "success" "Structure XML du sitemap valide"
        else
            print_status "error" "Structure XML du sitemap invalide"
        fi
        
        # Count URLs
        url_count=$(grep -c "<url>" "public/sitemap.xml" 2>/dev/null || echo "0")
        print_status "info" "Nombre d'URLs dans le sitemap: $url_count"
        
        # Check for hreflang
        if grep -q "hreflang" "public/sitemap.xml"; then
            print_status "success" "Balises hreflang présentes dans le sitemap"
        else
            print_status "warning" "Balises hreflang manquantes dans le sitemap"
        fi
    fi
    
    # Check robots.txt
    check_file "public/robots.txt" "Fichier robots.txt"
    
    if [ -f "public/robots.txt" ]; then
        if grep -q "Sitemap:" "public/robots.txt"; then
            print_status "success" "Référence au sitemap dans robots.txt"
        else
            print_status "warning" "Référence au sitemap manquante dans robots.txt"
        fi
    fi
}

# Function to check component files
check_components() {
    echo ""
    echo "🧩 Vérification des composants SEO..."
    echo "------------------------------------"
    
    # Check main SEO components
    components=(
        "src/components/SEOHead.tsx:Composant SEOHead"
        "src/components/StructuredData.tsx:Composant StructuredData"
        "src/components/Breadcrumbs.tsx:Composant Breadcrumbs"
        "src/components/ContextualLinks.tsx:Composant ContextualLinks"
        "src/components/SectionAnchors.tsx:Composant SectionAnchors"
        "src/components/SEOImage.tsx:Composant SEOImage"
    )
    
    for component in "${components[@]}"; do
        IFS=':' read -r file description <<< "$component"
        check_file "$file" "$description"
    done
    
    # Check SEO services
    services=(
        "src/lib/seo-config.ts:Configuration SEO"
        "src/lib/seo-meta-manager.ts:Gestionnaire de meta tags"
        "src/lib/structured-data-service.ts:Service de données structurées"
        "src/lib/sitemap-generator.ts:Générateur de sitemap"
        "src/lib/seo-monitoring.ts:Service de monitoring SEO"
        "src/lib/content-optimizer.ts:Optimiseur de contenu"
        "src/lib/image-optimizer.ts:Optimiseur d'images"
    )
    
    for service in "${services[@]}"; do
        IFS=':' read -r file description <<< "$service"
        check_file "$file" "$description"
    done
}

# Function to check package.json scripts
check_scripts() {
    echo ""
    echo "📜 Vérification des scripts npm..."
    echo "---------------------------------"
    
    if [ -f "package.json" ]; then
        print_status "success" "Fichier package.json existe"
        
        # Check for SEO-related scripts
        if grep -q "generate:sitemap" "package.json"; then
            print_status "success" "Script generate:sitemap configuré"
        else
            print_status "error" "Script generate:sitemap manquant"
        fi
        
        if grep -q "test:seo" "package.json"; then
            print_status "success" "Scripts de test SEO configurés"
        else
            print_status "warning" "Scripts de test SEO manquants"
        fi
    else
        print_status "error" "Fichier package.json manquant"
    fi
}

# Function to check documentation
check_documentation() {
    echo ""
    echo "📚 Vérification de la documentation..."
    echo "-------------------------------------"
    
    docs=(
        "docs/seo-maintenance-guide.md:Guide de maintenance SEO"
        "docs/seo-monitoring-setup.md:Configuration du monitoring SEO"
        "docs/seo-deployment-checklist.md:Checklist de déploiement SEO"
    )
    
    for doc in "${docs[@]}"; do
        IFS=':' read -r file description <<< "$doc"
        check_file "$file" "$description"
    done
}

# Function to run basic tests
run_tests() {
    echo ""
    echo "🧪 Exécution des tests SEO..."
    echo "-----------------------------"
    
    if command -v npm >/dev/null 2>&1; then
        if [ -f "package.json" ] && grep -q "vitest" "package.json"; then
            print_status "info" "Exécution des tests SEO..."
            
            # Run SEO integration tests
            if npm run test:run -- src/test/seo-integration-final.test.tsx >/dev/null 2>&1; then
                print_status "success" "Tests d'intégration SEO passés"
            else
                print_status "warning" "Certains tests SEO ont échoué (vérifiez les détails avec npm test)"
            fi
        else
            print_status "warning" "Framework de test non configuré"
        fi
    else
        print_status "warning" "npm non disponible pour exécuter les tests"
    fi
}

# Function to check if development server is running
check_dev_server() {
    echo ""
    echo "🌐 Vérification du serveur de développement..."
    echo "---------------------------------------------"
    
    if command -v curl >/dev/null 2>&1; then
        if curl -s "$SITE_URL" >/dev/null 2>&1; then
            print_status "success" "Serveur de développement accessible"
            
            # Check main pages
            check_url "$SITE_URL" 200 "Page d'accueil"
            check_url "$SITE_URL/en" 200 "Page d'accueil anglaise"
            
            # Check SEO elements on homepage
            check_element "$SITE_URL" "<title>" "Balise title"
            check_element "$SITE_URL" 'name="description"' "Meta description"
            check_element "$SITE_URL" 'property="og:title"' "Open Graph title"
            check_element "$SITE_URL" 'name="twitter:card"' "Twitter Card"
            check_element "$SITE_URL" 'application/ld\+json' "Données structurées JSON-LD"
            check_element "$SITE_URL" 'hreflang=' "Balises hreflang"
            
        else
            print_status "warning" "Serveur de développement non accessible"
            print_status "info" "Démarrez le serveur avec: npm run dev"
        fi
    else
        print_status "warning" "curl non disponible pour tester le serveur"
    fi
}

# Main execution
main() {
    echo "Début de la vérification: $(date)"
    echo ""
    
    # Run all checks
    check_build
    check_seo_files
    check_components
    check_scripts
    check_documentation
    run_tests
    check_dev_server
    
    # Summary
    echo ""
    echo "📊 Résumé de la vérification"
    echo "============================"
    
    total_checks=$((ERRORS + WARNINGS))
    
    if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
        print_status "success" "Toutes les vérifications sont passées!"
        echo ""
        echo "🎉 Le déploiement SEO est prêt!"
    elif [ $ERRORS -eq 0 ]; then
        print_status "warning" "$WARNINGS avertissement(s) détecté(s)"
        echo ""
        echo "⚠️  Le déploiement SEO est fonctionnel mais peut être amélioré"
    else
        print_status "error" "$ERRORS erreur(s) et $WARNINGS avertissement(s) détecté(s)"
        echo ""
        echo "❌ Le déploiement SEO nécessite des corrections"
    fi
    
    echo ""
    echo "Fin de la vérification: $(date)"
    
    # Exit with appropriate code
    if [ $ERRORS -eq 0 ]; then
        exit 0
    else
        exit 1
    fi
}

# Run the main function
main "$@"