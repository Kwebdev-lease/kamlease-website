/**
 * Cloudflare Pages Function pour vérifier la disponibilité des créneaux
 * Utilise Microsoft Graph API pour vérifier le calendrier contact@kamlease.com
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

    console.log('📅 Checking availability for date range:', { startDate, endDate });

    // Get Microsoft Graph access token
    const accessToken = await getMicrosoftGraphToken(env);
    if (!accessToken) {
      console.error('❌ Failed to get Microsoft Graph token');
      // Fallback to simplified mode if Graph API fails
      return getSimplifiedAvailability(startDate, endDate, env, corsHeaders);
    }

    // Get busy slots from Microsoft Graph Calendar
    const busySlots = await getBusySlots(accessToken, startDate, endDate, env);
    console.log(`📅 Found ${busySlots.length} busy slots from calendar`);

    // Generate available time slots based on business hours and busy slots
    const availableSlots = generateAvailableSlots(startDate, endDate, busySlots, env);

    console.log(`✅ Generated ${availableSlots.length} available slots`);

    return new Response(JSON.stringify({
      success: true,
      availableSlots,
      busySlots: busySlots.length,
      message: `Found ${availableSlots.length} available slots`,
      calendarIntegration: 'active'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Error checking availability:', error);

    // Fallback to simplified mode on error
    console.log('🔄 Falling back to simplified availability checking');
    return getSimplifiedAvailability(startDate, endDate, env, corsHeaders);
  }
}

/**
 * Get Microsoft Graph access token using client credentials flow
 */
async function getMicrosoftGraphToken(env) {
  const tenantId = env.VITE_MICROSOFT_TENANT_ID;
  const clientId = env.VITE_MICROSOFT_CLIENT_ID;
  const clientSecret = env.VITE_MICROSOFT_CLIENT_SECRET;

  if (!tenantId || !clientId || !clientSecret) {
    console.error('❌ Missing Microsoft Graph configuration');
    return null;
  }

  try {
    const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        scope: 'https://graph.microsoft.com/.default',
        grant_type: 'client_credentials'
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Token request failed:', error);
      return null;
    }

    const data = await response.json();
    console.log('✅ Successfully obtained Microsoft Graph token');
    return data.access_token;

  } catch (error) {
    console.error('❌ Error getting Microsoft Graph token:', error);
    return null;
  }
}

/**
 * Get busy time slots from Microsoft Graph Calendar API
 * Uses both getSchedule and findMeetingTimes APIs for comprehensive availability checking
 */
async function getBusySlots(accessToken, startDate, endDate, env) {
  const calendarEmail = env.VITE_CALENDAR_EMAIL || 'contact@kamlease.com';

  try {
    // Method 1: Use getSchedule API to get busy times
    const busySlots = await getBusySlotsFromSchedule(accessToken, calendarEmail, startDate, endDate, env);

    // Method 2: Alternative - use findMeetingTimes API (as per Microsoft documentation)
    if (busySlots.length === 0) {
      console.log('🔄 Trying alternative findMeetingTimes API...');
      return await getBusySlotsFromFindMeetingTimes(accessToken, calendarEmail, startDate, endDate, env);
    }

    return busySlots;

  } catch (error) {
    console.error('❌ Error getting busy slots:', error);
    return [];
  }
}

/**
 * Get busy slots using the getSchedule API
 */
async function getBusySlotsFromSchedule(accessToken, calendarEmail, startDate, endDate, env) {
  try {
    const graphUrl = `https://graph.microsoft.com/v1.0/users/${calendarEmail}/calendar/getSchedule`;

    const requestBody = {
      schedules: [calendarEmail],
      startTime: {
        dateTime: startDate,
        timeZone: env.VITE_BUSINESS_TIMEZONE || 'Europe/Paris'
      },
      endTime: {
        dateTime: endDate,
        timeZone: env.VITE_BUSINESS_TIMEZONE || 'Europe/Paris'
      },
      availabilityViewInterval: 30
    };

    console.log('🔍 Querying getSchedule API:', requestBody);

    const response = await fetch(graphUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ getSchedule API failed:', response.status, error);
      return [];
    }

    const data = await response.json();
    console.log('📅 getSchedule response:', JSON.stringify(data, null, 2));

    const busySlots = [];
    if (data.value && data.value.length > 0) {
      const schedule = data.value[0];
      if (schedule.busyTimes) {
        for (const busyTime of schedule.busyTimes) {
          busySlots.push({
            start: busyTime.start.dateTime,
            end: busyTime.end.dateTime,
            status: 'busy'
          });
        }
      }
    }

    console.log(`📅 getSchedule found ${busySlots.length} busy slots`);
    return busySlots;

  } catch (error) {
    console.error('❌ Error with getSchedule API:', error);
    return [];
  }
}

/**
 * Get busy slots using the findMeetingTimes API (alternative approach)
 * This API is designed specifically for finding available meeting times
 */
async function getBusySlotsFromFindMeetingTimes(accessToken, calendarEmail, startDate, endDate, env) {
  try {
    // Use events API to get calendar events directly
    const eventsUrl = `https://graph.microsoft.com/v1.0/users/${calendarEmail}/events`;
    const params = new URLSearchParams({
      '$filter': `start/dateTime ge '${startDate}' and end/dateTime le '${endDate}'`,
      '$select': 'subject,start,end,showAs',
      '$orderby': 'start/dateTime'
    });

    console.log('🔍 Querying events API:', `${eventsUrl}?${params}`);

    const response = await fetch(`${eventsUrl}?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Events API failed:', response.status, error);
      return [];
    }

    const data = await response.json();
    console.log('📅 Events API response:', JSON.stringify(data, null, 2));

    const busySlots = [];
    if (data.value) {
      for (const event of data.value) {
        // Only consider events that show as busy
        if (event.showAs === 'busy' || event.showAs === 'tentative') {
          busySlots.push({
            start: event.start.dateTime,
            end: event.end.dateTime,
            status: event.showAs,
            subject: event.subject
          });
        }
      }
    }

    console.log(`📅 Events API found ${busySlots.length} busy slots`);
    return busySlots;

  } catch (error) {
    console.error('❌ Error with Events API:', error);
    return [];
  }
}

/**
 * Fallback function for simplified availability checking
 */
function getSimplifiedAvailability(startDate, endDate, env, corsHeaders) {
  console.log('🔄 Using simplified availability checking (no calendar integration)');

  const busySlots = [];
  const availableSlots = generateAvailableSlots(startDate, endDate, busySlots, env);

  return new Response(JSON.stringify({
    success: true,
    availableSlots,
    busySlots: 0,
    message: `Found ${availableSlots.length} available slots`,
    calendarIntegration: 'fallback',
    note: 'Calendar integration unavailable - showing all business hour slots as available'
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

/**
 * Generate available time slots based on business hours and busy slots
 * Filters out busy times from the calendar
 */
function generateAvailableSlots(startDate, endDate, busySlots, env) {
  const slots = [];
  const businessStartTime = env.VITE_BUSINESS_START_TIME || '14:00';
  const businessEndTime = env.VITE_BUSINESS_END_TIME || '16:30';
  const appointmentDuration = parseInt(env.VITE_APPOINTMENT_DURATION) || 30;

  const start = new Date(startDate);
  const end = new Date(endDate);

  console.log('🕐 Business hours:', { businessStartTime, businessEndTime, appointmentDuration });
  console.log('🚫 Busy slots to exclude:', busySlots.length);

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

    // Generate slots based on appointment duration
    for (let slotStart = new Date(dayStart); slotStart < dayEnd; slotStart.setMinutes(slotStart.getMinutes() + appointmentDuration)) {
      const slotEnd = new Date(slotStart);
      slotEnd.setMinutes(slotEnd.getMinutes() + appointmentDuration);

      // Only add if slot end doesn't exceed business hours
      if (slotEnd <= dayEnd) {
        // Check if this slot conflicts with any busy time
        const isAvailable = !isSlotBusy(slotStart, slotEnd, busySlots);

        if (isAvailable) {
          slots.push({
            start: slotStart.toISOString(),
            end: slotEnd.toISOString(),
            date: slotStart.toISOString().split('T')[0],
            time: slotStart.toTimeString().substring(0, 5),
            available: true
          });
        } else {
          console.log(`🚫 Slot ${slotStart.toTimeString().substring(0, 5)} is busy`);
        }
      }
    }
  }

  console.log(`📅 Generated ${slots.length} available slots (after filtering busy times)`);
  return slots;
}

/**
 * Check if a time slot conflicts with any busy time
 */
function isSlotBusy(slotStart, slotEnd, busySlots) {
  for (const busySlot of busySlots) {
    const busyStart = new Date(busySlot.start);
    const busyEnd = new Date(busySlot.end);

    // Check for overlap: slot starts before busy ends AND slot ends after busy starts
    if (slotStart < busyEnd && slotEnd > busyStart) {
      return true;
    }
  }
  return false;
}