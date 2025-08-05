// Alternative avec EmailJS (plus simple)
export async function onRequestPost(context: any) {
  const { request } = context;
  
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };
  
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const formData = await request.json();
    
    // Utiliser EmailJS API
    const emailJSResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: 'service_kamlease', // À configurer sur EmailJS
        template_id: 'template_contact', // À configurer sur EmailJS
        user_id: 'YOUR_EMAILJS_USER_ID', // À configurer sur EmailJS
        template_params: {
          from_name: `${formData.firstName} ${formData.lastName}`,
          from_email: formData.email,
          company: formData.company,
          message: formData.message,
          to_email: 'contact@kamlease.com'
        }
      })
    });
    
    if (!emailJSResponse.ok) {
      throw new Error('EmailJS request failed');
    }
    
    return new Response(JSON.stringify({ 
      success: true,
      message: 'Email sent via EmailJS'
    }), {
      headers: corsHeaders
    });
    
  } catch (error) {
    console.error('EmailJS error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
}