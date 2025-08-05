// Cloudflare Pages Function pour envoyer des emails via Microsoft Graph
export async function onRequestPost(context: any) {
  const { request, env } = context;
  
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Récupérer les données du formulaire
    const formData = await request.json();
    console.log('📧 Tentative d\'envoi d\'email:', formData);
    
    // Vérifier les variables d'environnement
    if (!env.VITE_MICROSOFT_TENANT_ID || !env.VITE_MICROSOFT_CLIENT_ID || !env.VITE_MICROSOFT_CLIENT_SECRET) {
      throw new Error('Missing Microsoft Graph credentials in environment variables');
    }
    
    // Obtenir un token Microsoft Graph
    const tokenResponse = await fetch(`https://login.microsoftonline.com/${env.VITE_MICROSOFT_TENANT_ID}/oauth2/v2.0/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: env.VITE_MICROSOFT_CLIENT_ID,
        client_secret: env.VITE_MICROSOFT_CLIENT_SECRET,
        scope: 'https://graph.microsoft.com/.default',
        grant_type: 'client_credentials'
      })
    });
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token request failed:', errorText);
      throw new Error(`Failed to get access token: ${tokenResponse.status}`);
    }
    
    const tokenData = await tokenResponse.json();
    console.log('✅ Token Microsoft Graph obtenu');
    
    // Envoyer l'email via Microsoft Graph
    const emailResponse = await fetch('https://graph.microsoft.com/v1.0/users/contact@kamlease.com/sendMail', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: {
          subject: formData.subject || `Nouveau message depuis le site - ${formData.firstName} ${formData.lastName}`,
          body: {
            contentType: 'Text',
            content: formData.content || `
NOUVEAU MESSAGE DEPUIS LE SITE WEB
==================================

Reçu le: ${new Date().toLocaleString('fr-FR')}

INFORMATIONS DU CONTACT:
------------------------
Prénom: ${formData.firstName}
Nom: ${formData.lastName}
Société: ${formData.company}
Email: ${formData.email}

MESSAGE:
--------
${formData.message}

---
Email automatique généré par le site web Kamlease
Ne pas répondre directement à cet email.
            `
          },
          toRecipients: [
            {
              emailAddress: {
                address: 'contact@kamlease.com'
              }
            }
          ]
        }
      })
    });
    
    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('Email sending failed:', errorText);
      throw new Error(`Failed to send email: ${emailResponse.status}`);
    }
    
    console.log('✅ Email envoyé avec succès !');
    
    return new Response(JSON.stringify({ 
      success: true,
      message: 'Email sent successfully'
    }), {
      headers: corsHeaders
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi d\'email:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || 'Failed to send email'
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
}