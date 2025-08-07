import { useState, useEffect, useRef, useCallback } from 'react';

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

// Cache for storing availability data
const availabilityCache = new Map<string, { data: TimeSlot[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

/**
 * Hook to fetch available time slots from the server with caching and debouncing
 */
export function useAvailability(startDate?: Date, endDate?: Date): UseAvailabilityResult {
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();
  const lastFetchRef = useRef<string>('');

  const getCacheKey = useCallback((start: Date, end: Date) => {
    return `${start.toISOString().split('T')[0]}_${end.toISOString().split('T')[0]}`;
  }, []);

  const fetchAvailability = useCallback(async (forceRefresh = false) => {
    if (!startDate || !endDate) {
      return;
    }

    const cacheKey = getCacheKey(startDate, endDate);
    
    // Avoid duplicate requests
    if (lastFetchRef.current === cacheKey && !forceRefresh) {
      return;
    }

    // Check cache first
    if (!forceRefresh) {
      const cached = availabilityCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log(`📋 Using cached availability data for ${cacheKey}`);
        setAvailableSlots(cached.data);
        setError(null);
        return;
      }
    }

    setLoading(true);
    setError(null);
    lastFetchRef.current = cacheKey;

    try {
      const startDateStr = startDate.toISOString();
      const endDateStr = endDate.toISOString();
      
      console.log(`🔍 Fetching availability for ${cacheKey}...`);
      
      const response = await fetch(`/api/check-availability?startDate=${encodeURIComponent(startDateStr)}&endDate=${encodeURIComponent(endDateStr)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: { success: boolean; availableSlots?: TimeSlot[]; message?: string; error?: string } = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || data.message || 'Failed to fetch availability');
      }

      const slots = data.availableSlots || [];
      
      // Cache the result
      availabilityCache.set(cacheKey, {
        data: slots,
        timestamp: Date.now()
      });

      setAvailableSlots(slots);
      console.log(`✅ Loaded ${slots.length} available slots for ${cacheKey}`);
      
    } catch (err) {
      console.error('Error fetching availability:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch availability');
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, getCacheKey]);

  // Debounced effect to avoid rapid API calls
  useEffect(() => {
    if (!startDate || !endDate) {
      return;
    }

    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set new timeout for debounced fetch
    debounceTimeoutRef.current = setTimeout(() => {
      fetchAvailability();
    }, 300); // 300ms debounce

    // Cleanup timeout on unmount or dependency change
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [fetchAvailability]);

  const refetch = useCallback(() => {
    fetchAvailability(true);
  }, [fetchAvailability]);

  return {
    availableSlots,
    loading,
    error,
    refetch
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