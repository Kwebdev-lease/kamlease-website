/**
 * Remote debugging utility for mobile devices
 * Stores debug information in localStorage that can be retrieved from desktop
 */

export interface RemoteDebugEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  component: string;
  message: string;
  data?: any;
  userAgent: string;
  url: string;
}

export class RemoteDebugger {
  private static instance: RemoteDebugger;
  private readonly storageKey = 'kamlease_remote_debug';
  private readonly maxEntries = 50;

  private constructor() {}

  public static getInstance(): RemoteDebugger {
    if (!RemoteDebugger.instance) {
      RemoteDebugger.instance = new RemoteDebugger();
    }
    return RemoteDebugger.instance;
  }

  /**
   * Log a debug entry that can be retrieved remotely
   */
  public log(level: 'info' | 'warn' | 'error', component: string, message: string, data?: any): void {
    try {
      const entry: RemoteDebugEntry = {
        timestamp: new Date().toISOString(),
        level,
        component,
        message,
        data,
        userAgent: navigator.userAgent,
        url: window.location.href
      };

      const existingEntries = this.getEntries();
      const newEntries = [entry, ...existingEntries].slice(0, this.maxEntries);
      
      localStorage.setItem(this.storageKey, JSON.stringify(newEntries));
      
      // Also log to console for immediate debugging
      const consoleMethod = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
      consoleMethod(`[${component}] ${message}`, data || '');
    } catch (error) {
      console.error('Failed to store remote debug entry:', error);
    }
  }

  /**
   * Get all debug entries
   */
  public getEntries(): RemoteDebugEntry[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to retrieve debug entries:', error);
      return [];
    }
  }

  /**
   * Clear all debug entries
   */
  public clear(): void {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.error('Failed to clear debug entries:', error);
    }
  }

  /**
   * Get debug entries as formatted text for easy sharing
   */
  public getFormattedLog(): string {
    const entries = this.getEntries();
    if (entries.length === 0) {
      return 'No debug entries found.';
    }

    let log = `=== KAMLEASE REMOTE DEBUG LOG ===\n`;
    log += `Generated: ${new Date().toISOString()}\n`;
    log += `Total entries: ${entries.length}\n\n`;

    entries.forEach((entry, index) => {
      log += `[${index + 1}] ${entry.timestamp}\n`;
      log += `Level: ${entry.level.toUpperCase()}\n`;
      log += `Component: ${entry.component}\n`;
      log += `Message: ${entry.message}\n`;
      log += `URL: ${entry.url}\n`;
      log += `User Agent: ${entry.userAgent}\n`;
      if (entry.data) {
        log += `Data: ${JSON.stringify(entry.data, null, 2)}\n`;
      }
      log += `${'='.repeat(50)}\n\n`;
    });

    return log;
  }

  /**
   * Export debug log as downloadable file
   */
  public exportLog(): void {
    try {
      const log = this.getFormattedLog();
      const blob = new Blob([log], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `kamlease-debug-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export debug log:', error);
    }
  }

  /**
   * Get device and browser information
   */
  public getDeviceInfo(): {
    userAgent: string;
    platform: string;
    language: string;
    cookieEnabled: boolean;
    onLine: boolean;
    screen: {
      width: number;
      height: number;
      colorDepth: number;
    };
    viewport: {
      width: number;
      height: number;
    };
    connection?: any;
  } {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      screen: {
        width: screen.width,
        height: screen.height,
        colorDepth: screen.colorDepth
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      connection: (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
    };
  }

  /**
   * Send debug info to console (for desktop debugging)
   */
  public dumpToConsole(): void {
    console.group('🔍 Remote Debug Information');
    
    console.group('Device Information');
    console.table(this.getDeviceInfo());
    console.groupEnd();
    
    console.group('Debug Entries');
    const entries = this.getEntries();
    entries.forEach((entry, index) => {
      const style = entry.level === 'error' ? 'color: red' : 
                   entry.level === 'warn' ? 'color: orange' : 
                   'color: blue';
      
      console.log(`%c[${index + 1}] ${entry.component}: ${entry.message}`, style);
      if (entry.data) {
        console.log('Data:', entry.data);
      }
    });
    console.groupEnd();
    
    console.groupEnd();
  }
}

// Convenience functions
export const remoteLog = {
  info: (component: string, message: string, data?: any) => 
    RemoteDebugger.getInstance().log('info', component, message, data),
  
  warn: (component: string, message: string, data?: any) => 
    RemoteDebugger.getInstance().log('warn', component, message, data),
  
  error: (component: string, message: string, data?: any) => 
    RemoteDebugger.getInstance().log('error', component, message, data)
};

// Export for console debugging
if (typeof window !== 'undefined') {
  (window as any).RemoteDebugger = RemoteDebugger;
  (window as any).remoteLog = remoteLog;
}