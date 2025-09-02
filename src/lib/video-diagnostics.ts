/**
 * Video diagnostics utilities
 * Helps identify and troubleshoot video playback issues on different devices
 */

export interface VideoCapabilities {
  canPlayMP4: boolean;
  canPlayWebM: boolean;
  canPlayOGG: boolean;
  supportsAutoplay: boolean;
  supportsMuted: boolean;
  supportsPlaysInline: boolean;
  hasMediaSource: boolean;
  userAgent: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  os: string;
}

export interface VideoTestResult {
  success: boolean;
  error?: string;
  loadTime?: number;
  canPlay: boolean;
  hasAudio: boolean;
  hasVideo: boolean;
  duration?: number;
  videoWidth?: number;
  videoHeight?: number;
}

export class VideoDiagnostics {
  private static instance: VideoDiagnostics;

  private constructor() {}

  public static getInstance(): VideoDiagnostics {
    if (!VideoDiagnostics.instance) {
      VideoDiagnostics.instance = new VideoDiagnostics();
    }
    return VideoDiagnostics.instance;
  }

  /**
   * Get comprehensive video capabilities for the current device/browser
   */
  public getVideoCapabilities(): VideoCapabilities {
    const userAgent = navigator.userAgent;
    const video = document.createElement('video');

    return {
      canPlayMP4: this.canPlayFormat(video, 'video/mp4'),
      canPlayWebM: this.canPlayFormat(video, 'video/webm'),
      canPlayOGG: this.canPlayFormat(video, 'video/ogg'),
      supportsAutoplay: this.supportsAutoplay(),
      supportsMuted: 'muted' in video,
      supportsPlaysInline: 'playsInline' in video,
      hasMediaSource: 'MediaSource' in window,
      userAgent,
      deviceType: this.getDeviceType(userAgent),
      browser: this.getBrowser(userAgent),
      os: this.getOS(userAgent)
    };
  }

  /**
   * Test video playback for a specific source
   */
  public async testVideoPlayback(src: string): Promise<VideoTestResult> {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      const startTime = performance.now();
      let resolved = false;

      const cleanup = () => {
        if (!resolved) {
          resolved = true;
          video.remove();
        }
      };

      const resolveResult = (result: VideoTestResult) => {
        if (!resolved) {
          resolved = true;
          cleanup();
          resolve(result);
        }
      };

      // Set up event listeners
      video.addEventListener('loadedmetadata', () => {
        const loadTime = performance.now() - startTime;
        resolveResult({
          success: true,
          loadTime,
          canPlay: true,
          hasAudio: video.audioTracks?.length > 0 || false,
          hasVideo: video.videoTracks?.length > 0 || video.videoWidth > 0,
          duration: video.duration,
          videoWidth: video.videoWidth,
          videoHeight: video.videoHeight
        });
      });

      video.addEventListener('error', (e) => {
        const error = video.error;
        resolveResult({
          success: false,
          error: error ? this.getMediaErrorMessage(error.code) : 'Unknown error',
          canPlay: false,
          hasAudio: false,
          hasVideo: false
        });
      });

      // Timeout after 10 seconds
      setTimeout(() => {
        resolveResult({
          success: false,
          error: 'Timeout - video took too long to load',
          canPlay: false,
          hasAudio: false,
          hasVideo: false
        });
      }, 10000);

      // Configure video element
      video.muted = true;
      video.playsInline = true;
      video.preload = 'metadata';
      video.src = src;

      // Add to DOM temporarily (some browsers require this)
      video.style.position = 'absolute';
      video.style.top = '-9999px';
      video.style.left = '-9999px';
      video.style.width = '1px';
      video.style.height = '1px';
      document.body.appendChild(video);
    });
  }

  /**
   * Get recommended video settings for the current device
   */
  public getRecommendedSettings(): {
    preload: 'none' | 'metadata' | 'auto';
    controls: boolean;
    muted: boolean;
    playsInline: boolean;
    autoplay: boolean;
    poster: boolean;
  } {
    const capabilities = this.getVideoCapabilities();
    const isMobile = capabilities.deviceType === 'mobile';
    const isIOS = capabilities.os === 'iOS';

    return {
      preload: isMobile ? 'none' : 'metadata',
      controls: false, // We use custom controls
      muted: true, // Required for autoplay on most platforms
      playsInline: true, // Prevents fullscreen on iOS
      autoplay: false, // We handle play manually
      poster: true // Always show poster for better UX
    };
  }

  /**
   * Generate diagnostic report
   */
  public async generateDiagnosticReport(videoSrc: string): Promise<{
    capabilities: VideoCapabilities;
    testResult: VideoTestResult;
    recommendations: string[];
    issues: string[];
  }> {
    const capabilities = this.getVideoCapabilities();
    const testResult = await this.testVideoPlayback(videoSrc);
    const recommendations: string[] = [];
    const issues: string[] = [];

    // Analyze capabilities and generate recommendations
    if (!capabilities.canPlayMP4) {
      issues.push('MP4 format not supported');
      recommendations.push('Provide WebM or OGG fallback formats');
    }

    if (!capabilities.supportsAutoplay) {
      recommendations.push('Use click-to-play interface (autoplay blocked)');
    }

    if (!capabilities.supportsPlaysInline && capabilities.deviceType === 'mobile') {
      issues.push('playsInline not supported - video may go fullscreen');
      recommendations.push('Consider alternative video presentation for this device');
    }

    if (capabilities.deviceType === 'mobile' && capabilities.os === 'iOS') {
      recommendations.push('Ensure video is optimized for iOS Safari');
      if (!testResult.success) {
        recommendations.push('Consider using HLS streaming for iOS compatibility');
      }
    }

    if (!testResult.success) {
      issues.push(`Video playback failed: ${testResult.error}`);
      recommendations.push('Check video encoding and format compatibility');
    }

    return {
      capabilities,
      testResult,
      recommendations,
      issues
    };
  }

  /**
   * Log diagnostic information to console
   */
  public async logDiagnostics(videoSrc: string): Promise<void> {
    const report = await this.generateDiagnosticReport(videoSrc);

    console.group('🎥 Video Diagnostics Report');
    
    console.group('Device Capabilities');
    console.log('Device Type:', report.capabilities.deviceType);
    console.log('Browser:', report.capabilities.browser);
    console.log('OS:', report.capabilities.os);
    console.log('MP4 Support:', report.capabilities.canPlayMP4);
    console.log('WebM Support:', report.capabilities.canPlayWebM);
    console.log('Autoplay Support:', report.capabilities.supportsAutoplay);
    console.log('PlaysInline Support:', report.capabilities.supportsPlaysInline);
    console.groupEnd();

    console.group('Video Test Results');
    console.log('Success:', report.testResult.success);
    console.log('Can Play:', report.testResult.canPlay);
    console.log('Load Time:', report.testResult.loadTime ? `${report.testResult.loadTime.toFixed(2)}ms` : 'N/A');
    console.log('Duration:', report.testResult.duration ? `${report.testResult.duration.toFixed(2)}s` : 'N/A');
    console.log('Dimensions:', report.testResult.videoWidth && report.testResult.videoHeight 
      ? `${report.testResult.videoWidth}x${report.testResult.videoHeight}` 
      : 'N/A');
    if (report.testResult.error) {
      console.error('Error:', report.testResult.error);
    }
    console.groupEnd();

    if (report.issues.length > 0) {
      console.group('⚠️ Issues Found');
      report.issues.forEach(issue => console.warn(issue));
      console.groupEnd();
    }

    if (report.recommendations.length > 0) {
      console.group('💡 Recommendations');
      report.recommendations.forEach(rec => console.info(rec));
      console.groupEnd();
    }

    console.groupEnd();
  }

  /**
   * Check if a video format can be played
   */
  private canPlayFormat(video: HTMLVideoElement, mimeType: string): boolean {
    const canPlay = video.canPlayType(mimeType);
    return canPlay === 'probably' || canPlay === 'maybe';
  }

  /**
   * Test autoplay support
   */
  private supportsAutoplay(): boolean {
    // This is a simplified check - real autoplay support depends on many factors
    const video = document.createElement('video');
    video.muted = true;
    return 'autoplay' in video;
  }

  /**
   * Get device type from user agent
   */
  private getDeviceType(userAgent: string): 'desktop' | 'mobile' | 'tablet' {
    if (/iPad/.test(userAgent)) return 'tablet';
    if (/iPhone|iPod|Android.*Mobile|BlackBerry|Windows Phone/.test(userAgent)) return 'mobile';
    return 'desktop';
  }

  /**
   * Get browser name from user agent
   */
  private getBrowser(userAgent: string): string {
    if (/Chrome/.test(userAgent) && !/Edge/.test(userAgent)) return 'Chrome';
    if (/Safari/.test(userAgent) && !/Chrome/.test(userAgent)) return 'Safari';
    if (/Firefox/.test(userAgent)) return 'Firefox';
    if (/Edge/.test(userAgent)) return 'Edge';
    if (/Opera/.test(userAgent)) return 'Opera';
    return 'Unknown';
  }

  /**
   * Get OS from user agent
   */
  private getOS(userAgent: string): string {
    if (/Windows/.test(userAgent)) return 'Windows';
    if (/Mac OS X/.test(userAgent)) return 'macOS';
    if (/iPhone|iPad|iPod/.test(userAgent)) return 'iOS';
    if (/Android/.test(userAgent)) return 'Android';
    if (/Linux/.test(userAgent)) return 'Linux';
    return 'Unknown';
  }

  /**
   * Get human-readable error message from media error code
   */
  private getMediaErrorMessage(errorCode: number): string {
    switch (errorCode) {
      case 1: return 'MEDIA_ERR_ABORTED - Video loading was aborted';
      case 2: return 'MEDIA_ERR_NETWORK - Network error occurred';
      case 3: return 'MEDIA_ERR_DECODE - Video decoding error';
      case 4: return 'MEDIA_ERR_SRC_NOT_SUPPORTED - Video format not supported';
      default: return `Unknown media error (code: ${errorCode})`;
    }
  }
}

// Export for console debugging
if (typeof window !== 'undefined') {
  (window as any).VideoDiagnostics = VideoDiagnostics;
}