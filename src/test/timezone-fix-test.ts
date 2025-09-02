/**
 * Test pour vérifier que la correction des timezones fonctionne
 */

import { TimezoneUtils } from '../lib/timezone-utils';

// Test de la création d'un rendez-vous
function testAppointmentCreation() {
  console.log('🧪 Test de création de rendez-vous avec timezone fixée');
  
  // Créer un rendez-vous pour demain à 16h00
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const appointmentTime = '16:00';
  
  const result = TimezoneUtils.createAppointmentForGraph(tomorrow, appointmentTime);
  
  console.log('📅 Résultat du test:', {
    dateSelectionnee: tomorrow.toDateString(),
    heureSelectionnee: appointmentTime,
    formatPourGraph: {
      startDateTime: result.startDateTime,
      endDateTime: result.endDateTime,
      timeZone: result.timeZone
    },
    ceQueOutlookVaAfficher: result.debugInfo.whatOutlookWillShow,
    debugInfo: result.debugInfo
  });
  
  // Vérifications
  const startTime = result.startDateTime.split('T')[1];
  const expectedTime = '16:00:00.000';
  
  if (startTime === expectedTime) {
    console.log('✅ Test réussi : L\'heure est correctement formatée');
  } else {
    console.log('❌ Test échoué : Heure attendue', expectedTime, 'mais obtenu', startTime);
  }
  
  return result;
}

// Test de debug des timezones
function testTimezoneDebug() {
  console.log('🧪 Test de debug des timezones');
  
  const debugInfo = TimezoneUtils.getDebugInfo('16:00');
  
  console.log('🌍 Informations de timezone:', {
    timezoneUtilisateur: debugInfo.userTimezone,
    timezoneBusiness: debugInfo.businessTimezone,
    heureActuelleUtilisateur: debugInfo.currentTimeUser,
    heureActuelleBusiness: debugInfo.currentTimeBusiness,
    dstActif: debugInfo.isDSTActive,
    decalageTimezone: debugInfo.timezoneOffset
  });
  
  return debugInfo;
}

// Exporter les tests pour utilisation dans la console
if (typeof window !== 'undefined') {
  (window as any).testTimezone = {
    testAppointmentCreation,
    testTimezoneDebug,
    runAllTests: () => {
      console.group('🧪 Tests de correction des timezones');
      testTimezoneDebug();
      testAppointmentCreation();
      console.groupEnd();
    }
  };
}

export { testAppointmentCreation, testTimezoneDebug };