declare global {
    interface Window {
      gtag: (
        command: 'event' | 'config' | 'set',
        eventName: string,
        eventParams?: Record<string, any>
      ) => void;
    }
  }
  
  // Custom event types
  export type AnalyticsEvent = 
    | 'json_input'
    | 'text_analysis'
    | 'apply_changes'
    | 'enhance_json'
    | 'model_change'
    | 'provider_change'
    | 'copy_json'
    | 'error';
  
  // Event properties interface
  interface EventProperties {
    provider?: string;
    model?: string;
    error?: string;
    jsonLength?: number;
    textLength?: number;
    matchCount?: number;
    confidence?: number;
    context?: string; // Add context to known properties
    stack?: string;
  }
  
  export const trackEvent = (
    eventName: AnalyticsEvent, 
    properties?: EventProperties
  ) => {
    window.gtag('event', eventName, {
      ...properties,
      timestamp: new Date().toISOString()
    });
  }
  
  export const trackError = (error: Error, context: string) => {
    trackEvent('error', {
      error: error.message,
      context,
      stack: error.stack
    });
  }