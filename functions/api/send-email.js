/**
 * Cloudflare Pages Function pour envoyer des emails via Microsoft Graph
 * Cette fonction évite les problèmes CORS en gérant Microsoft Graph côté serveur
 */

export async function onRequestPost(context) {
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

  try {
    // Récupérer les données du formulaire
    const formData = await request.json();
    
    // Valider les données requises
    if (!formData.prenom || !formData.nom || !formData.email || !formData.message) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Données manquantes'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Obtenir un token d'accès Microsoft Graph
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
      throw new Error('Erreur d\'authentification Microsoft Graph');
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Préparer le contenu de l'email
    const emailContent = formatEmailContent(formData);
    
    // Préparer le message pour Microsoft Graph
    const message = {
      message: {
        subject: `Nouveau message de contact - ${formData.prenom} ${formData.nom}`,
        body: {
          contentType: 'HTML',
          content: emailContent
        },
        toRecipients: [
          {
            emailAddress: {
              address: env.VITE_CALENDAR_EMAIL || 'contact@kamlease.com'
            }
          }
        ]
      }
    };

    // Envoyer l'email via Microsoft Graph
    const emailResponse = await fetch(`https://graph.microsoft.com/v1.0/users/${env.VITE_CALENDAR_EMAIL || 'contact@kamlease.com'}/sendMail`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message)
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('Microsoft Graph error:', errorText);
      throw new Error('Erreur lors de l\'envoi de l\'email');
    }

    // Succès
    return new Response(JSON.stringify({
      success: true,
      message: 'Message envoyé avec succès',
      type: formData.appointmentDate ? 'appointment' : 'message'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in send-email function:', error);
    
    return new Response(JSON.stringify({
      success: false,
      message: 'Erreur lors de l\'envoi du message',
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Formate le contenu de l'email en HTML
 */
function formatEmailContent(formData) {
  const isAppointment = formData.appointmentDate && formData.appointmentTime;
  
  let content = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: ${isAppointment ? '#dc2626' : '#2563eb'};">
        ${isAppointment ? 'Demande de rendez-vous' : 'Nouveau message de contact'}
      </h2>
  `;

  if (isAppointment) {
    const appointmentDate = new Date(formData.appointmentDate);
    content += `
      <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
        <h3 style="margin-top: 0; color: #991b1b;">Détails du rendez-vous demandé</h3>
        <p><strong>Date :</strong> ${appointmentDate.toLocaleDateString('fr-FR')}</p>
        <p><strong>Heure :</strong> ${formData.appointmentTime}</p>
      </div>
    `;
  }

  content += `
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #1e40af;">Informations du contact</h3>
        <p><strong>Nom :</strong> ${formData.nom}</p>
        <p><strong>Prénom :</strong> ${formData.prenom}</p>
        ${formData.societe ? `<p><strong>Société :</strong> ${formData.societe}</p>` : ''}
        <p><strong>Email :</strong> <a href="mailto:${formData.email}">${formData.email}</a></p>
        <p><strong>Téléphone :</strong> <a href="tel:${formData.telephone}">${formData.telephone}</a></p>
      </div>
      
      <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #1e40af;">Message</h3>
        <p style="white-space: pre-wrap;">${formData.message}</p>
      </div>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
        <p>Ce message a été envoyé depuis le site web Kamlease via Microsoft Graph.</p>
        <p>Date : ${new Date().toLocaleString('fr-FR')}</p>
      </div>
    </div>
  `;

  return content;
}