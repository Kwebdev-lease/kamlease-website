/**
 * Cloudflare Pages Function pour vérifier les tokens reCAPTCHA
 * Vérifie la validité des tokens côté serveur
 */

export async function onRequest(context) {
  const { request, env } = context;

  // Configuration CORS
  const corsHeaders = {
    'Access-Control-Allow-Origin': 'https://kamlease.com',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Gérer les requêtes OPTIONS (preflight)
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST requests
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({
      success: false,
      message: 'Method not allowed'
    }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const { token, action } = await request.json();

    if (!token) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Token reCAPTCHA manquant'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Vérifier le token avec l'API Google reCAPTCHA
    const secretKey = env.RECAPTCHA_SECRET_KEY;
    if (!secretKey) {
      console.error('RECAPTCHA_SECRET_KEY not configured');
      return new Response(JSON.stringify({
        success: false,
        message: 'Configuration reCAPTCHA manquante'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const verificationUrl = 'https://www.google.com/recaptcha/api/siteverify';
    const verificationData = new URLSearchParams({
      secret: secretKey,
      response: token,
      remoteip: request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || 'unknown'
    });

    console.log('🔍 Verifying reCAPTCHA token for action:', action);

    const verificationResponse = await fetch(verificationUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: verificationData
    });

    if (!verificationResponse.ok) {
      throw new Error(`reCAPTCHA API error: ${verificationResponse.status}`);
    }

    const verificationResult = await verificationResponse.json();
    console.log('📋 reCAPTCHA verification result:', JSON.stringify(verificationResult, null, 2));

    // Analyser le résultat
    const isValid = verificationResult.success;
    const score = verificationResult.score || 0;
    const expectedAction = action || 'submit';
    const actualAction = verificationResult.action;

    // Vérifications de sécurité
    const checks = {
      success: isValid,
      scoreCheck: score >= 0.5, // Score minimum de 0.5 (sur 1.0)
      actionCheck: !actualAction || actualAction === expectedAction,
      hostnameCheck: true // On peut vérifier le hostname si nécessaire
    };

    const allChecksPassed = Object.values(checks).every(check => check === true);

    // Log détaillé pour debug
    console.log('🛡️ Security checks:', {
      ...checks,
      score,
      expectedAction,
      actualAction,
      hostname: verificationResult.hostname,
      timestamp: verificationResult.challenge_ts,
      errorCodes: verificationResult['error-codes']
    });

    if (!allChecksPassed) {
      const failedChecks = Object.entries(checks)
        .filter(([_, passed]) => !passed)
        .map(([check, _]) => check);

      return new Response(JSON.stringify({
        success: false,
        message: 'Vérification reCAPTCHA échouée',
        details: {
          failedChecks,
          score,
          minimumScore: 0.5
        }
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Succès
    console.log('✅ reCAPTCHA verification successful:', { score, action: actualAction });

    return new Response(JSON.stringify({
      success: true,
      message: 'Vérification reCAPTCHA réussie',
      score,
      action: actualAction
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Error verifying reCAPTCHA:', error);
    
    return new Response(JSON.stringify({
      success: false,
      message: 'Erreur lors de la vérification reCAPTCHA',
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Fonction utilitaire pour vérifier un token reCAPTCHA
 * Peut être utilisée dans d'autres fonctions Cloudflare
 */
export async function verifyCaptchaToken(token, secretKey, expectedAction = 'submit', minScore = 0.5) {
  try {
    const verificationUrl = 'https://www.google.com/recaptcha/api/siteverify';
    const verificationData = new URLSearchParams({
      secret: secretKey,
      response: token
    });

    const response = await fetch(verificationUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: verificationData
    });

    if (!response.ok) {
      throw new Error(`reCAPTCHA API error: ${response.status}`);
    }

    const result = await response.json();
    
    return {
      success: result.success && 
               (result.score || 0) >= minScore && 
               (!result.action || result.action === expectedAction),
      score: result.score || 0,
      action: result.action,
      errorCodes: result['error-codes'] || []
    };
  } catch (error) {
    console.error('Error verifying CAPTCHA token:', error);
    return {
      success: false,
      score: 0,
      action: null,
      errorCodes: ['verification-failed']
    };
  }
}