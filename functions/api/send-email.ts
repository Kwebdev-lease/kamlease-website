// Cloudflare Pages Function pour envoyer des emails via Microsoft Graph
export async function onRequestPost(context: any) {
  const { request, env } = context;
  
  try {
    // Récupérer les données du formulaire
    const formData = await request.json();
    
    // Obtenir un token Microsoft Graph
    const tokenResponse = await fetch(`https://login.microsoftonline.com/${env.MICROSOFT_TENANT_ID}/oauth2/v2.0/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: env.MICROSOFT_CLIENT_ID,
        client_secret: env.MICROSOFT_CLIENT_SECRET,
        scope: 'https://graph.microsoft.com/.default',
        grant_type: 'client_credentials'
      })
    });
    
    if (!tokenResponse.ok) {
      throw new Error('Failed to get access token');
    }
    
    const tokenData = await tokenResponse.json();
    
    // Envoyer l'email via Microsoft Graph
    const emailResponse = await fetch('https://graph.microsoft.com/v1.0/users/contact@kamlease.com/sendMail', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: {
          subject: `Nouveau message depuis le site - ${formData.firstName} ${formData.lastName}`,
          body: {
            contentType: 'Text',
            content: `
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
      throw new Error('Failed to send email');
    }
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Email sending error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Failed to send email' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}