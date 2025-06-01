// Authentication configuration for Supabase OAuth providers
// This centralizes all authentication-related configuration

/**
 * Configuration for OAuth providers
 */
export const oauthConfig = {
  google: {
    // Properly format the redirect URL to ensure it works consistently
    getRedirectUrl: () => {
      // Get the base URL dynamically to work in different environments
      const baseUrl = window.location.origin;
      return new URL('/dashboard', baseUrl).toString();
    },
    
    // Query parameters to ensure proper OAuth flow
    queryParams: {
      // Request offline access to get refresh token
      access_type: 'offline',
      // Force consent screen to avoid Google's "one-tap" flow which can cause issues
      prompt: 'consent'
    },
    
    // Request these scopes from Google
    scopes: 'email profile'
  }
};

/**
 * Common error messages and their user-friendly translations
 */
export const authErrorMessages = {
  'redirect_uri_mismatch': 'Authentication configuration error. Please contact support.',
  'invalid_client': 'OAuth client configuration is invalid. Please contact support.',
  'invalid_request': 'Invalid authentication request. Please try again.',
  'default': 'Authentication failed. Please try again later.'
};

/**
 * Helper to get a user-friendly error message
 */
export const getAuthErrorMessage = (error: any): string => {
  const errorMessage = error?.message || '';
  
  // Check if the error message contains any of our known error types
  for (const [errorType, message] of Object.entries(authErrorMessages)) {
    if (errorMessage.toLowerCase().includes(errorType.toLowerCase())) {
      return message;
    }
  }
  
  // Return the original error message or a default one
  return errorMessage || authErrorMessages.default;
};
