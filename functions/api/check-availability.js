/**
 * Cloudflare Pages Function pour vérifier la disponibilité des créneaux
 */

export async function onRequest(context) {
  const { request, env } = context;

  // Configuration CORS
  const corsHeaders = {
    'Access-Control-Allow-Origin': 'https://kamlease.com',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Gérer les requêtes OPTIONS (preflight)
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow GET requests
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({
      success: false,
      message: 'Method not allowed'
    }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    // Get query parameters
    const url = new URL(request.url);
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    if (!startDate || !endDate) {
      return new Response(JSON.stringify({
        success: false,
        message: 'startDate and endDate parameters are required'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get Microsoft Graph access token
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
      throw new Error('Failed to get access token');
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Get calendar events for the specified date range
    const calendarUrl = `https://graph.microsoft.com/v1.0/users/${env.VITE_CALENDAR_EMAIL || 'contact@kamlease.com'}/calendarView?startDateTime=${startDate}&endDateTime=${endDate}&$select=start,end,subject,showAs`;
    
    const calendarResponse = await fetch(calendarUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      }
    });

    if (!calendarResponse.ok) {
      const errorText = await calendarResponse.text();
      console.error('Calendar query failed:', errorText);
      throw new Error('Failed to query calendar');
    }

    const calendarData = await calendarResponse.json();
    
    // Process events to get busy time slots
    const busySlots = calendarData.value
      .filter(event => event.showAs === 'busy' || event.showAs === 'tentative')
      .map(event => ({
        start: event.start.dateTime,
        end: event.end.dateTime,
        subject: event.subject
      }));

    // Generate available time slots based on business hours
    const availableSlots = generateAvailableSlots(startDate, endDate, busySlots, env);

    return new Response(JSON.stringify({
      success: true,
      availableSlots,
      busySlots: busySlots.length,
      message: `Found ${availableSlots.length} available slots`
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error checking availability:', error);
    
    return new Response(JSON.stringify({
      success: false,
      message: 'Error checking availability',
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Generate available time slots based on business hours and existing appointments
 */
function generateAvailableSlots(startDate, endDate, busySlots, env) {
  const slots = [];
  const businessStartTime = env.VITE_BUSINESS_START_TIME || '14:00';
  const businessEndTime = env.VITE_BUSINESS_END_TIME || '16:30';
  const appointmentDuration = parseInt(env.VITE_APPOINTMENT_DURATION) || 30;
  const timezone = env.VITE_BUSINESS_TIMEZONE || 'Europe/Paris';

  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Iterate through each day
  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    // Skip weekends (Saturday = 6, Sunday = 0)
    if (date.getDay() === 0 || date.getDay() === 6) {
      continue;
    }

    // Parse business hours
    const [startHour, startMinute] = businessStartTime.split(':').map(Number);
    const [endHour, endMinute] = businessEndTime.split(':').map(Number);

    // Create time slots for this day
    const dayStart = new Date(date);
    dayStart.setHours(startHour, startMinute, 0, 0);
    
    const dayEnd = new Date(date);
    dayEnd.setHours(endHour, endMinute, 0, 0);

    // Generate 30-minute slots
    for (let slotStart = new Date(dayStart); slotStart < dayEnd; slotStart.setMinutes(slotStart.getMinutes() + appointmentDuration)) {
      const slotEnd = new Date(slotStart);
      slotEnd.setMinutes(slotEnd.getMinutes() + appointmentDuration);

      // Check if this slot conflicts with any busy slots
      const isConflict = busySlots.some(busySlot => {
        const busyStart = new Date(busySlot.start);
        const busyEnd = new Date(busySlot.end);
        
        // Check for overlap
        return (slotStart < busyEnd && slotEnd > busyStart);
      });

      // Only add if no conflict and slot end doesn't exceed business hours
      if (!isConflict && slotEnd <= dayEnd) {
        slots.push({
          start: slotStart.toISOString(),
          end: slotEnd.toISOString(),
          date: slotStart.toISOString().split('T')[0],
          time: slotStart.toTimeString().substring(0, 5),
          available: true
        });
      }
    }
  }

  return slots;
}