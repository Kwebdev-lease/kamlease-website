/**
 * Script pour déboguer les données envoyées par le formulaire
 */

// Intercepter les requêtes fetch pour voir les données exactes
const originalFetch = window.fetch;
window.fetch = function(...args) {
  const [url, options] = args;
  
  if (url.includes('/api/send-email')) {
    console.log('🔍 DEBUGGING FORM SUBMISSION:');
    console.log('URL:', url);
    console.log('Method:', options?.method);
    console.log('Headers:', options?.headers);
    
    if (options?.body) {
      try {
        const data = JSON.parse(options.body);
        console.log('📋 Form Data Sent:');
        console.log('- prenom:', data.prenom);
        console.log('- nom:', data.nom);
        console.log('- email:', data.email);
        console.log('- telephone:', data.telephone);
        console.log('- message:', data.message?.substring(0, 50) + '...');
        console.log('- captchaToken:', data.captchaToken ? data.captchaToken.substring(0, 20) + '...' : 'MISSING');
        console.log('- appointmentDate:', data.appointmentDate);
        console.log('- appointmentTime:', data.appointmentTime);
        console.log('📊 Full data object:', data);
      } catch (e) {
        console.log('❌ Could not parse body:', options.body);
      }
    }
  }
  
  return originalFetch.apply(this, args);
};

console.log('🐛 Form debugging enabled. Submit the form to see detailed logs.');