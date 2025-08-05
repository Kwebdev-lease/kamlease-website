#!/usr/bin/env tsx

/**
 * Script de validation de la configuration EmailJS
 * 
 * Ce script valide la configuration EmailJS et les templates créés
 * pour s'assurer que tout est correctement configuré.
 */

console.log('Script starting...');

import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// Configuration requise
const REQUIRED_ENV_VARS = [
  'VITE_EMAILJS_SERVICE_ID',
  'VITE_EMAILJS_TEMPLATE_RECEPTION_ID',
  'VITE_EMAILJS_TEMPLATE_AUTORESPONSE_ID',
  'VITE_EMAILJS_USER_ID'
];

// Templates requis
const REQUIRED_TEMPLATES = [
  'templates/emailjs-reception-template.html',
  'templates/emailjs-autoresponse-template.html'
];

// Documentation requise
const REQUIRED_DOCS = [
  'docs/emailjs-template-configuration.md'
];

// Variables de template requises
const RECEPTION_TEMPLATE_VARS = [
  '{{from_name}}',
  '{{from_email}}',
  '{{phone}}',
  '{{company}}',
  '{{message}}',
  '{{date}}',
  '{{reply_to}}',
  '{{appointment_date}}',
  '{{appointment_time}}'
];

const AUTORESPONSE_TEMPLATE_VARS = [
  '{{from_name}}',
  '{{from_email}}',
  '{{language}}',
  '{{is_french}}',
  '{{is_english}}',
  '{{appointment_date}}',
  '{{appointment_time}}'
];

class EmailJSValidator {
  private results: ValidationResult[] = [];

  async validateConfiguration(): Promise<ValidationReport> {
    console.log('🔍 Validation de la configuration EmailJS...\n');

    // Vérifier les variables d'environnement
    await this.validateEnvironmentVariables();

    // Vérifier les templates
    await this.validateTemplateFiles();

    // Vérifier le contenu des templates
    await this.validateTemplateContent();

    // Vérifier la documentation
    await this.validateDocumentation();

    return this.generateReport();
  }

  private async validateEnvironmentVariables(): Promise<void> {
    console.log('📋 Vérification des variables d\'environnement...');

    const missingVars: string[] = [];
    const presentVars: string[] = [];

    for (const varName of REQUIRED_ENV_VARS) {
      const value = process.env[varName];
      if (!value || value.trim() === '') {
        missingVars.push(varName);
        console.log(`  ❌ ${varName}: manquante`);
      } else {
        presentVars.push(varName);
        console.log(`  ✅ ${varName}: ${value.substring(0, 10)}...`);
      }
    }

    if (missingVars.length > 0) {
      this.results.push({
        test: 'Variables d\'environnement',
        success: false,
        error: `Variables manquantes: ${missingVars.join(', ')}`,
        details: 'Créez un fichier .env.local avec les variables requises'
      });
    } else {
      this.results.push({
        test: 'Variables d\'environnement',
        success: true,
        message: 'Toutes les variables requises sont présentes'
      });
    }

    console.log('');
  }

  private async validateTemplateFiles(): Promise<void> {
    console.log('📄 Vérification des fichiers de templates...');

    let allTemplatesExist = true;
    const missingTemplates: string[] = [];

    for (const templatePath of REQUIRED_TEMPLATES) {
      if (existsSync(templatePath)) {
        console.log(`  ✅ ${templatePath}: trouvé`);
      } else {
        console.log(`  ❌ ${templatePath}: manquant`);
        missingTemplates.push(templatePath);
        allTemplatesExist = false;
      }
    }

    if (allTemplatesExist) {
      this.results.push({
        test: 'Fichiers de templates',
        success: true,
        message: 'Tous les templates sont présents'
      });
    } else {
      this.results.push({
        test: 'Fichiers de templates',
        success: false,
        error: `Templates manquants: ${missingTemplates.join(', ')}`,
        details: 'Les templates HTML doivent être créés dans le dossier templates/'
      });
    }

    console.log('');
  }

  private async validateTemplateContent(): Promise<void> {
    console.log('🔍 Validation du contenu des templates...');

    // Valider le template de réception
    await this.validateReceptionTemplate();

    // Valider le template d'auto-réponse
    await this.validateAutoResponseTemplate();

    console.log('');
  }

  private async validateReceptionTemplate(): Promise<void> {
    const templatePath = 'templates/emailjs-reception-template.html';
    
    if (!existsSync(templatePath)) {
      this.results.push({
        test: 'Template de réception',
        success: false,
        error: 'Fichier template manquant',
        details: `Le fichier ${templatePath} n'existe pas`
      });
      return;
    }

    try {
      const content = await readFile(templatePath, 'utf-8');
      const missingVars: string[] = [];

      for (const variable of RECEPTION_TEMPLATE_VARS) {
        if (!content.includes(variable)) {
          missingVars.push(variable);
        }
      }

      if (missingVars.length > 0) {
        this.results.push({
          test: 'Template de réception',
          success: false,
          error: `Variables manquantes: ${missingVars.join(', ')}`,
          details: 'Le template doit contenir toutes les variables requises'
        });
        console.log(`  ❌ Template de réception: variables manquantes`);
      } else {
        this.results.push({
          test: 'Template de réception',
          success: true,
          message: 'Template valide avec toutes les variables requises'
        });
        console.log(`  ✅ Template de réception: valide`);
      }
    } catch (error) {
      this.results.push({
        test: 'Template de réception',
        success: false,
        error: error instanceof Error ? error.message : 'Erreur de lecture',
        details: 'Impossible de lire le contenu du template'
      });
      console.log(`  ❌ Template de réception: erreur de lecture`);
    }
  }

  private async validateAutoResponseTemplate(): Promise<void> {
    const templatePath = 'templates/emailjs-autoresponse-template.html';
    
    if (!existsSync(templatePath)) {
      this.results.push({
        test: 'Template d\'auto-réponse',
        success: false,
        error: 'Fichier template manquant',
        details: `Le fichier ${templatePath} n'existe pas`
      });
      return;
    }

    try {
      const content = await readFile(templatePath, 'utf-8');
      const missingVars: string[] = [];

      for (const variable of AUTORESPONSE_TEMPLATE_VARS) {
        if (!content.includes(variable)) {
          missingVars.push(variable);
        }
      }

      // Vérifier les conditions bilingues
      const bilingualConditions = ['{{#is_french}}', '{{#is_english}}', '{{/is_french}}', '{{/is_english}}'];
      const missingConditions: string[] = [];

      for (const condition of bilingualConditions) {
        if (!content.includes(condition)) {
          missingConditions.push(condition);
        }
      }

      if (missingVars.length > 0 || missingConditions.length > 0) {
        const errors = [];
        if (missingVars.length > 0) errors.push(`Variables: ${missingVars.join(', ')}`);
        if (missingConditions.length > 0) errors.push(`Conditions: ${missingConditions.join(', ')}`);
        
        this.results.push({
          test: 'Template d\'auto-réponse',
          success: false,
          error: `Éléments manquants: ${errors.join('; ')}`,
          details: 'Le template doit contenir toutes les variables et conditions requises'
        });
        console.log(`  ❌ Template d'auto-réponse: éléments manquants`);
      } else {
        this.results.push({
          test: 'Template d\'auto-réponse',
          success: true,
          message: 'Template valide avec support bilingue'
        });
        console.log(`  ✅ Template d'auto-réponse: valide`);
      }
    } catch (error) {
      this.results.push({
        test: 'Template d\'auto-réponse',
        success: false,
        error: error instanceof Error ? error.message : 'Erreur de lecture',
        details: 'Impossible de lire le contenu du template'
      });
      console.log(`  ❌ Template d'auto-réponse: erreur de lecture`);
    }
  }

  private async validateDocumentation(): Promise<void> {
    console.log('📚 Vérification de la documentation...');

    let allDocsExist = true;
    const missingDocs: string[] = [];

    for (const docPath of REQUIRED_DOCS) {
      if (existsSync(docPath)) {
        console.log(`  ✅ ${docPath}: trouvé`);
      } else {
        console.log(`  ❌ ${docPath}: manquant`);
        missingDocs.push(docPath);
        allDocsExist = false;
      }
    }

    // Vérifier le contenu de la documentation
    if (existsSync('docs/emailjs-template-configuration.md')) {
      try {
        const content = await readFile('docs/emailjs-template-configuration.md', 'utf-8');
        const requiredSections = [
          '# Configuration des Templates EmailJS',
          'Variables d\'Environnement',
          '## Template 1 : Réception des Messages',
          '## Template 2 : Auto-Réponse',
          '## Configuration du Service EmailJS'
        ];

        const missingSections: string[] = [];
        for (const section of requiredSections) {
          if (!content.includes(section)) {
            missingSections.push(section);
          }
        }

        if (missingSections.length > 0) {
          this.results.push({
            test: 'Documentation',
            success: false,
            error: `Sections manquantes: ${missingSections.join(', ')}`,
            details: 'La documentation doit contenir toutes les sections requises'
          });
          console.log(`  ❌ Documentation: sections manquantes`);
        } else {
          this.results.push({
            test: 'Documentation',
            success: true,
            message: 'Documentation complète et bien structurée'
          });
          console.log(`  ✅ Documentation: complète`);
        }
      } catch (error) {
        this.results.push({
          test: 'Documentation',
          success: false,
          error: 'Erreur de lecture de la documentation',
          details: error instanceof Error ? error.message : 'Erreur inconnue'
        });
        console.log(`  ❌ Documentation: erreur de lecture`);
      }
    } else if (allDocsExist) {
      this.results.push({
        test: 'Documentation',
        success: true,
        message: 'Tous les documents sont présents'
      });
    } else {
      this.results.push({
        test: 'Documentation',
        success: false,
        error: `Documents manquants: ${missingDocs.join(', ')}`,
        details: 'La documentation complète doit être créée'
      });
    }

    console.log('');
  }



  private generateReport(): ValidationReport {
    const totalTests = this.results.length;
    const successfulTests = this.results.filter(r => r.success).length;
    const failedTests = totalTests - successfulTests;

    const report: ValidationReport = {
      timestamp: new Date().toISOString(),
      totalTests,
      successfulTests,
      failedTests,
      success: failedTests === 0,
      results: this.results,
      summary: {
        configurationValid: this.results.find(r => r.test === 'Variables d\'environnement')?.success || false,
        templatesExist: this.results.find(r => r.test === 'Fichiers de templates')?.success || false,
        templatesValid: this.results.filter(r => r.test.includes('Template')).every(r => r.success),
        documentationComplete: this.results.find(r => r.test === 'Documentation')?.success || false
      }
    };

    return report;
  }
}

// Types pour la validation
interface ValidationResult {
  test: string;
  success: boolean;
  message?: string;
  error?: string;
  details?: string;
}

interface ValidationReport {
  timestamp: string;
  totalTests: number;
  successfulTests: number;
  failedTests: number;
  success: boolean;
  results: ValidationResult[];
  summary: {
    configurationValid: boolean;
    templatesExist: boolean;
    templatesValid: boolean;
    documentationComplete: boolean;
  };
}

// Fonction principale
async function main() {
  console.log('🚀 Validation de la configuration EmailJS - Kamlease\n');
  console.log('=' .repeat(60));
  console.log('');

  const validator = new EmailJSValidator();
  
  try {
    const report = await validator.validateConfiguration();
    
    // Afficher le rapport final
    console.log('📊 RAPPORT DE VALIDATION');
    console.log('=' .repeat(60));
    console.log(`📅 Date: ${new Date(report.timestamp).toLocaleString('fr-FR')}`);
    console.log(`📈 Tests réussis: ${report.successfulTests}/${report.totalTests}`);
    console.log(`📉 Tests échoués: ${report.failedTests}/${report.totalTests}`);
    console.log(`✅ Statut global: ${report.success ? 'SUCCÈS' : 'ÉCHEC'}`);
    console.log('');

    // Résumé détaillé
    console.log('📋 RÉSUMÉ DÉTAILLÉ');
    console.log('-' .repeat(40));
    console.log(`🔧 Configuration: ${report.summary.configurationValid ? '✅' : '❌'}`);
    console.log(`📄 Templates existants: ${report.summary.templatesExist ? '✅' : '❌'}`);
    console.log(`✅ Templates valides: ${report.summary.templatesValid ? '✅' : '❌'}`);
    console.log(`📚 Documentation: ${report.summary.documentationComplete ? '✅' : '❌'}`);
    console.log('');

    // Détails des échecs
    const failures = report.results.filter(r => !r.success);
    if (failures.length > 0) {
      console.log('❌ ÉCHECS DÉTAILLÉS');
      console.log('-' .repeat(40));
      failures.forEach(failure => {
        console.log(`🔸 ${failure.test}`);
        console.log(`   Erreur: ${failure.error}`);
        if (failure.details) {
          console.log(`   Détails: ${failure.details}`);
        }
        console.log('');
      });
    }

    // Recommandations
    if (!report.success) {
      console.log('💡 RECOMMANDATIONS');
      console.log('-' .repeat(40));
      
      if (!report.summary.configurationValid) {
        console.log('• Créez un fichier .env.local avec toutes les variables requises');
        console.log('• Consultez docs/emailjs-template-configuration.md pour les détails');
      }
      
      if (!report.summary.templatesExist) {
        console.log('• Vérifiez que les templates HTML sont dans le dossier templates/');
        console.log('• Utilisez les templates fournis dans ce projet');
      }
      
      if (!report.summary.templatesValid) {
        console.log('• Vérifiez que tous les templates contiennent les variables requises');
        console.log('• Contrôlez la syntaxe Mustache {{variable}}');
      }
      
      if (!report.summary.documentationComplete) {
        console.log('• Assurez-vous que la documentation est complète');
        console.log('• Vérifiez que toutes les sections sont présentes');
      }
    } else {
      console.log('🎉 FÉLICITATIONS !');
      console.log('-' .repeat(40));
      console.log('Tous les templates et la documentation sont prêts.');
      console.log('Vous pouvez maintenant configurer EmailJS et déployer le formulaire.');
      console.log('');
      console.log('📋 PROCHAINES ÉTAPES :');
      console.log('1. Configurez votre compte EmailJS sur https://emailjs.com');
      console.log('2. Créez les templates avec le contenu fourni');
      console.log('3. Configurez les variables d\'environnement');
      console.log('4. Testez l\'envoi d\'emails en production');
    }

    // Sauvegarder le rapport
    const reportPath = `validation-reports/emailjs-validation-${Date.now()}.json`;
    try {
      await import('fs/promises').then(fs => 
        fs.writeFile(reportPath, JSON.stringify(report, null, 2))
      );
      console.log(`\n📄 Rapport sauvegardé: ${reportPath}`);
    } catch (error) {
      console.log(`\n⚠️  Impossible de sauvegarder le rapport: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }

    process.exit(report.success ? 0 : 1);

  } catch (error) {
    console.error('💥 Erreur critique lors de la validation:');
    console.error(error);
    process.exit(1);
  }
}

// Exécuter le script
main().catch(console.error);

export { EmailJSValidator, type ValidationReport, type ValidationResult };