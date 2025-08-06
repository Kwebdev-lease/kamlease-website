import { useState, useEffect } from 'react';

interface TimeSlot {
  start: string;
  end: string;
  date: string;
  time: string;
  available: boolean;
}

interface AvailabilityData {
  availableSlots: TimeSlot[];
  busySlots: number;
  message: string;
}

interface UseAvailabilityResult {
  availableSlots: TimeSlot[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook to fetch available time slots from the server
 */
export function useAvailability(startDate?: Date, endDate?: Date): UseAvailabilityResult {
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailability = async () => {
    if (!startDate || !endDate) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const startDateStr = startDate.toISOString();
      const endDateStr = endDate.toISOString();
      
      const response = await fetch(`/api/check-availability?startDate=${encodeURIComponent(startDateStr)}&endDate=${encodeURIComponent(endDateStr)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: { success: boolean; availableSlots?: TimeSlot[]; message?: string; error?: string } = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || data.message || 'Failed to fetch availability');
      }

      setAvailableSlots(data.availableSlots || []);
      console.log(`✅ Loaded ${data.availableSlots?.length || 0} available slots`);
      
    } catch (err) {
      console.error('Error fetching availability:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch availability');
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, [startDate, endDate]);

  return {
    availableSlots,
    loading,
    error,
    refetch: fetchAvailability
  };
}

/**
 * Helper function to check if a specific date and time is available
 */
export function isTimeSlotAvailable(availableSlots: TimeSlot[], date: Date, time: string): boolean {
  const dateStr = date.toISOString().split('T')[0];
  
  return availableSlots.some(slot => 
    slot.date === dateStr && 
    slot.time === time && 
    slot.available
  );
}

/**
 * Helper function to get available times for a specific date
 */
export function getAvailableTimesForDate(availableSlots: TimeSlot[], date: Date): string[] {
  const dateStr = date.toISOString().split('T')[0];
  
  return availableSlots
    .filter(slot => slot.date === dateStr && slot.available)
    .map(slot => slot.time)
    .sort();
}

/**
 * Helper function to check if a date has any available slots
 */
export function hasAvailableSlots(availableSlots: TimeSlot[], date: Date): boolean {
  const dateStr = date.toISOString().split('T')[0];
  
  return availableSlots.some(slot => 
    slot.date === dateStr && 
    slot.available
  );
}