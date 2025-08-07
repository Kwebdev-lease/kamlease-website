/**
 * Cloudflare Pages Function pour envoyer des emails via Microsoft Graph
 * Cette fonction évite les problèmes CORS en gérant Microsoft Graph côté serveur
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
    // Récupérer les données du formulaire
    const formData = await request.json();
    
    // Valider les données requises
    if (!formData.prenom || !formData.nom || !formData.email || !formData.message) {
      console.error('Missing form data:', formData);
      return new Response(JSON.stringify({
        success: false,
        message: 'Données manquantes: ' + JSON.stringify({
          prenom: !!formData.prenom,
          nom: !!formData.nom,
          email: !!formData.email,
          message: !!formData.message
        })
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Vérifier le token CAPTCHA (si configuré)
    if (env.RECAPTCHA_SECRET_KEY && formData.captchaToken) {
      // Vérifier si c'est un token de développement
      if (formData.captchaToken.startsWith('dev-mode-token-')) {
        console.log('🔄 Development CAPTCHA token detected, skipping verification');
      } else {
        console.log('🔍 Verifying CAPTCHA token...');
        
        // Importer la fonction de vérification CAPTCHA
        const { verifyCaptchaToken } = await import('./verify-captcha.js');
        
        // Vérifier le CAPTCHA
        const captchaResult = await verifyCaptchaToken(
          formData.captchaToken,
          env.RECAPTCHA_SECRET_KEY,
          formData.appointmentDate ? 'appointment' : 'contact',
          0.5 // Score minimum
        );

        if (!captchaResult.success) {
          console.error('CAPTCHA verification failed:', captchaResult);
          return new Response(JSON.stringify({
            success: false,
            message: 'Vérification CAPTCHA échouée',
            details: captchaResult.errorCodes
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        console.log('✅ CAPTCHA verification successful:', { 
          score: captchaResult.score, 
          action: captchaResult.action 
        });
      }
    } else if (env.RECAPTCHA_SECRET_KEY && !formData.captchaToken) {
      console.error('CAPTCHA configured but no token provided');
      return new Response(JSON.stringify({
        success: false,
        message: 'Token CAPTCHA manquant'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } else {
      console.log('🔄 CAPTCHA not configured, skipping verification');
    }

    // Log des données reçues pour debug
    console.log('=== CLOUDFLARE FUNCTION DEBUG ===');
    console.log('Raw request body:', JSON.stringify(formData, null, 2));
    console.log('Form data received:', {
      prenom: formData.prenom,
      nom: formData.nom,
      societe: formData.societe,
      email: formData.email,
      telephone: formData.telephone,
      message: formData.message?.substring(0, 50) + '...'
    });
    console.log('=== END DEBUG ===');

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

    // Check if this is an appointment request
    const isAppointment = formData.appointmentDate && formData.appointmentTime;
    
    // Préparer le contenu de l'email
    const emailContent = formatEmailContent(formData);
    
    // Préparer le message pour Microsoft Graph
    const message = {
      message: {
        subject: isAppointment 
          ? `Demande de rendez-vous - ${formData.prenom} ${formData.nom}`
          : `Nouveau message de contact - ${formData.prenom} ${formData.nom}`,
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

    // Envoyer l'email de notification (à Kamlease)
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

    // If it's an appointment, create calendar event with Teams meeting
    let calendarEventId = null;
    if (isAppointment) {
      try {
        calendarEventId = await createCalendarEventWithTeams(accessToken, formData, env);
        console.log('✅ Calendar event created with Teams meeting:', calendarEventId);
      } catch (calendarError) {
        console.error('❌ Failed to create calendar event:', calendarError);
        // Don't fail the whole process if calendar creation fails
      }
    }

    // Envoyer l'email de confirmation à l'utilisateur
    const confirmationMessage = {
      message: {
        subject: `Confirmation de réception - ${formData.appointmentDate ? 'Demande de rendez-vous' : 'Message de contact'}`,
        body: {
          contentType: 'HTML',
          content: formatConfirmationEmail(formData)
        },
        toRecipients: [
          {
            emailAddress: {
              address: formData.email,
              name: `${formData.prenom} ${formData.nom}`
            }
          }
        ]
      }
    };

    // Envoyer l'email de confirmation
    const confirmationResponse = await fetch(`https://graph.microsoft.com/v1.0/users/${env.VITE_CALENDAR_EMAIL || 'contact@kamlease.com'}/sendMail`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(confirmationMessage)
    });

    // Log si l'email de confirmation échoue, mais ne pas faire échouer la requête principale
    if (!confirmationResponse.ok) {
      console.error('Failed to send confirmation email:', await confirmationResponse.text());
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
 * Formate le contenu de l'email de notification (pour Kamlease)
 * Compatible avec les modes sombre et clair des clients email
 */
function formatEmailContent(formData) {
  const isAppointment = formData.appointmentDate && formData.appointmentTime;
  const logoUrl = 'https://kamlease.com/kamlease-logo.svg';
  
  let content = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; background-color: #ffffff; color: #000000;">
      <style>
        /* Dark mode compatibility */
        @media (prefers-color-scheme: dark) {
          .email-container { background-color: #1a1a1a !important; color: #ffffff !important; }
          .content-section { background-color: #2d2d2d !important; color: #ffffff !important; }
          .info-box { background-color: #3a3a3a !important; color: #ffffff !important; border-color: #555555 !important; }
          .message-box { background-color: #2a2a2a !important; color: #ffffff !important; border-color: #444444 !important; }
          .footer-section { background-color: #1f1f1f !important; color: #cccccc !important; border-color: #444444 !important; }
        }
        
        /* Force colors for email clients that don't support CSS properly */
        [data-ogsc] .email-container { background-color: #ffffff !important; color: #000000 !important; }
        [data-ogsc] .content-section { background-color: #ffffff !important; color: #000000 !important; }
        
        /* Outlook dark mode support */
        [data-ogsb] .email-container { background-color: #ffffff !important; color: #000000 !important; }
        [data-ogsb] .content-section { background-color: #ffffff !important; color: #000000 !important; }
      </style>
      
      <!-- Header avec logo -->
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
        <img src="${logoUrl}" alt="Kamlease" style="max-height: 60px; margin-bottom: 15px;" />
        <h1 style="color: #ffffff !important; margin: 0; font-size: 28px; font-weight: 300;">
          ${isAppointment ? '📅 Nouvelle demande de rendez-vous' : '✉️ Nouveau message de contact'}
        </h1>
        <p style="color: rgba(255,255,255,0.9) !important; margin: 10px 0 0 0; font-size: 16px;">
          Reçu le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}
        </p>
        <p style="color: rgba(255,255,255,0.7) !important; margin: 5px 0 0 0; font-size: 12px;">
          ✅ Protection CAPTCHA active
        </p>
      </div>

      <!-- Contenu principal -->
      <div class="email-container content-section" style="padding: 30px; background-color: #ffffff; color: #000000;">
  `;

  if (isAppointment) {
    const appointmentDate = new Date(formData.appointmentDate);
    content += `
        <!-- Détails du rendez-vous -->
        <div style="background: linear-gradient(135deg, #ff6b6b, #ee5a24); padding: 25px; border-radius: 12px; margin-bottom: 25px; color: white;">
          <h2 style="margin: 0 0 15px 0; font-size: 22px; display: flex; align-items: center;">
            <span style="margin-right: 10px;">🗓️</span> Rendez-vous demandé
          </h2>
          <div style="display: flex; gap: 30px; flex-wrap: wrap;">
            <div>
              <strong>📅 Date :</strong> ${appointmentDate.toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
            <div>
              <strong>🕐 Heure :</strong> ${formData.appointmentTime}
            </div>
          </div>
        </div>
    `;
  }

  content += `
        <!-- Informations du contact -->
        <div class="info-box" style="background-color: #f8fafc; padding: 25px; border-radius: 12px; margin-bottom: 25px; border-left: 5px solid #3b82f6; color: #000000;">
          <h2 style="margin: 0 0 20px 0; color: #1e40af !important; font-size: 20px; display: flex; align-items: center;">
            <span style="margin-right: 10px;">👤</span> Informations du contact
          </h2>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; color: #000000;">
            <div style="color: inherit;"><strong>👤 Prénom :</strong> ${formData.prenom || 'Non renseigné'}</div>
            <div style="color: inherit;"><strong>👤 Nom :</strong> ${formData.nom || 'Non renseigné'}</div>
            ${formData.societe ? `<div style="color: inherit;"><strong>🏢 Société :</strong> ${formData.societe}</div>` : ''}
            <div style="color: inherit;"><strong>📧 Email :</strong> <a href="mailto:${formData.email}" style="color: #3b82f6 !important; text-decoration: none;">${formData.email}</a></div>
            <div style="color: inherit;"><strong>📞 Téléphone :</strong> <a href="tel:${formData.telephone}" style="color: #3b82f6 !important; text-decoration: none;">${formData.telephone || 'Non renseigné'}</a></div>
          </div>
        </div>
        
        <!-- Message -->
        <div class="info-box" style="background-color: #f0f9ff; padding: 25px; border-radius: 12px; margin-bottom: 25px; border-left: 5px solid #06b6d4; color: #000000;">
          <h2 style="margin: 0 0 15px 0; color: #0891b2 !important; font-size: 20px; display: flex; align-items: center;">
            <span style="margin-right: 10px;">💬</span> Message
          </h2>
          <div class="message-box" style="background-color: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #e0f2fe; color: #000000;">
            <p style="margin: 0; line-height: 1.6; white-space: pre-wrap; color: #374151 !important;">${formData.message}</p>
          </div>
        </div>

        <!-- Actions rapides -->
        <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 20px; border-radius: 12px; text-align: center;">
          <h3 style="color: white; margin: 0 0 15px 0;">Actions rapides</h3>
          <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
            <a href="mailto:${formData.email}" style="background-color: rgba(255,255,255,0.2); color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: 500;">
              📧 Répondre par email
            </a>
            <a href="tel:${formData.telephone}" style="background-color: rgba(255,255,255,0.2); color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: 500;">
              📞 Appeler
            </a>
          </div>
        </div>
      </div>
      
      <!-- Footer -->
      <div class="footer-section" style="background-color: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 12px 12px; border-top: 1px solid #e5e7eb; color: #6b7280;">
        <p style="margin: 0; font-size: 14px; color: #6b7280 !important;">
          📧 Email automatique généré par le site web <strong>Kamlease</strong><br>
          🌐 <a href="https://kamlease.com" style="color: #3b82f6 !important; text-decoration: none;">kamlease.com</a>
        </p>
      </div>
    </div>
  `;

  return content;
}

/**
 * Formate l'email de confirmation pour l'utilisateur
 */
function formatConfirmationEmail(formData) {
  const isAppointment = formData.appointmentDate && formData.appointmentTime;
  const logoUrl = 'https://kamlease.com/kamlease-logo.svg';
  
  let content = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; background-color: #ffffff; color: #000000;">
      <style>
        /* Dark mode compatibility */
        @media (prefers-color-scheme: dark) {
          .email-container { background-color: #1a1a1a !important; color: #ffffff !important; }
          .content-section { background-color: #2d2d2d !important; color: #ffffff !important; }
          .info-box { background-color: #3a3a3a !important; color: #ffffff !important; border-color: #555555 !important; }
          .teams-box { background-color: #1e3a8a !important; color: #ffffff !important; }
          .footer-section { background-color: #1f1f1f !important; color: #cccccc !important; border-color: #444444 !important; }
        }
        
        /* Force colors for email clients */
        [data-ogsc] .email-container { background-color: #ffffff !important; color: #000000 !important; }
        [data-ogsb] .email-container { background-color: #ffffff !important; color: #000000 !important; }
      </style>
      
      <!-- Header avec logo -->
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
        <img src="${logoUrl}" alt="Kamlease" style="max-height: 60px; margin-bottom: 15px;" />
        <h1 style="color: #ffffff !important; margin: 0; font-size: 28px; font-weight: 300;">
          ✅ Message bien reçu !
        </h1>
        <p style="color: rgba(255,255,255,0.9) !important; margin: 10px 0 0 0; font-size: 16px;">
          Merci ${formData.prenom} pour votre ${isAppointment ? 'demande de rendez-vous' : 'message'}
        </p>
      </div>

      <!-- Contenu principal -->
      <div class="email-container content-section" style="padding: 30px; background-color: #ffffff; color: #000000;">
        <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 25px; border-radius: 12px; margin-bottom: 25px; color: white; text-align: center;">
          <h2 style="margin: 0 0 15px 0; font-size: 24px;">
            🎉 Nous avons bien reçu votre ${isAppointment ? 'demande de rendez-vous' : 'message'} !
          </h2>
          <p style="margin: 0; font-size: 16px; opacity: 0.9;">
            Notre équipe vous répondra dans les plus brefs délais.
          </p>
        </div>

        ${isAppointment ? `
        <div style="background: linear-gradient(135deg, #0078d4, #106ebe); padding: 25px; border-radius: 12px; margin-bottom: 25px; color: white;">
          <h3 style="margin: 0 0 15px 0; display: flex; align-items: center;">
            <span style="margin-right: 10px;">🎥</span> Votre rendez-vous Teams
          </h3>
          <div style="background-color: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
            <p style="margin: 0 0 10px 0;">
              <strong>📅 Date :</strong> ${new Date(formData.appointmentDate).toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            <p style="margin: 0;">
              <strong>🕐 Heure :</strong> ${formData.appointmentTime} (heure française)
            </p>
          </div>
          <div style="background-color: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px;">
            <p style="margin: 0 0 10px 0; font-size: 14px;">
              <strong>💻 Format :</strong> Réunion Microsoft Teams en ligne
            </p>
            <p style="margin: 0; font-size: 14px; opacity: 0.9;">
              Le lien de connexion Teams vous sera envoyé par email une fois le rendez-vous confirmé.
            </p>
          </div>
        </div>
        ` : ''}

        <div class="info-box" style="background-color: #f0f9ff; padding: 25px; border-radius: 12px; margin-bottom: 25px; color: #000000;">
          <h3 style="margin: 0 0 15px 0; color: #1e40af !important;">📞 Nos coordonnées</h3>
          <div style="color: #374151 !important; line-height: 1.8;">
            <p style="margin: 5px 0; color: inherit;"><strong>📧 Email :</strong> <a href="mailto:contact@kamlease.com" style="color: #3b82f6 !important;">contact@kamlease.com</a></p>
            <p style="margin: 5px 0; color: inherit;"><strong>🌐 Site web :</strong> <a href="https://kamlease.com" style="color: #3b82f6 !important;">kamlease.com</a></p>
            <p style="margin: 5px 0; color: inherit;"><strong>🕐 Horaires :</strong> Lundi au Vendredi, 14h00 - 16h30</p>
          </div>
        </div>

        <div class="info-box" style="background-color: #f9fafb; padding: 20px; border-radius: 12px; text-align: center; color: #000000;">
          <p style="margin: 0 0 15px 0; color: #374151 !important; font-size: 16px;">
            💡 <strong>Besoin d'aide ?</strong>
          </p>
          <p style="margin: 0; color: #6b7280 !important; font-size: 14px;">
            N'hésitez pas à nous contacter si vous avez des questions supplémentaires.
          </p>
        </div>
      </div>
      
      <!-- Footer -->
      <div class="footer-section" style="background-color: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 12px 12px; border-top: 1px solid #e5e7eb; color: #6b7280;">
        <p style="margin: 0; font-size: 14px; color: #6b7280 !important;">
          Merci de votre confiance ! 🙏<br>
          <strong>L'équipe Kamlease</strong><br>
          <a href="https://kamlease.com" style="color: #3b82f6 !important; text-decoration: none;">kamlease.com</a>
        </p>
      </div>
    </div>
  `;

  return content;
}
/**
 * 
Create a calendar event with Teams meeting
 */
async function createCalendarEventWithTeams(accessToken, formData, env) {
  const appointmentDate = new Date(formData.appointmentDate);
  const [hours, minutes] = formData.appointmentTime.split(':');
  
  // Set start time
  const startTime = new Date(appointmentDate);
  startTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  
  // Set end time (30 minutes later by default)
  const endTime = new Date(startTime);
  endTime.setMinutes(endTime.getMinutes() + (parseInt(env.VITE_APPOINTMENT_DURATION) || 30));
  
  // Prepare calendar event with Teams meeting
  const calendarEvent = {
    subject: `Rendez-vous avec ${formData.prenom} ${formData.nom}`,
    body: {
      contentType: 'HTML',
      content: `
        <div style="font-family: Arial, sans-serif;">
          <h3>Rendez-vous avec ${formData.prenom} ${formData.nom}</h3>
          
          <h4>Informations du contact :</h4>
          <ul>
            <li><strong>Nom :</strong> ${formData.nom}</li>
            <li><strong>Prénom :</strong> ${formData.prenom}</li>
            ${formData.societe ? `<li><strong>Société :</strong> ${formData.societe}</li>` : ''}
            <li><strong>Email :</strong> ${formData.email}</li>
            <li><strong>Téléphone :</strong> ${formData.telephone}</li>
          </ul>
          
          <h4>Message :</h4>
          <p>${formData.message}</p>
          
          <hr>
          <p><em>Rendez-vous créé automatiquement depuis le site web Kamlease</em></p>
        </div>
      `
    },
    start: {
      dateTime: startTime.toISOString(),
      timeZone: env.VITE_BUSINESS_TIMEZONE || 'Europe/Paris'
    },
    end: {
      dateTime: endTime.toISOString(),
      timeZone: env.VITE_BUSINESS_TIMEZONE || 'Europe/Paris'
    },
    attendees: [
      {
        emailAddress: {
          address: formData.email,
          name: `${formData.prenom} ${formData.nom}`
        },
        type: 'required'
      }
    ],
    isOnlineMeeting: true,
    onlineMeetingProvider: 'teamsForBusiness',
    location: {
      displayName: 'Réunion Teams',
      locationType: 'default'
    },
    categories: ['Rendez-vous client', 'Kamlease'],
    importance: 'normal',
    sensitivity: 'normal',
    showAs: 'busy'
  };

  // Create the calendar event
  const calendarResponse = await fetch(`https://graph.microsoft.com/v1.0/users/${env.VITE_CALENDAR_EMAIL || 'contact@kamlease.com'}/events`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(calendarEvent)
  });

  if (!calendarResponse.ok) {
    const errorText = await calendarResponse.text();
    console.error('Calendar creation failed:', errorText);
    throw new Error(`Failed to create calendar event: ${calendarResponse.status}`);
  }

  const createdEvent = await calendarResponse.json();
  console.log('📅 Calendar event created:', createdEvent.id);
  
  return createdEvent.id;
}