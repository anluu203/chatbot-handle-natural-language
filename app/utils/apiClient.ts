"use client"

import { getTokens, removeTokens } from "./tokens"

// Fetch với auto-refresh token
export async function apiClient(
  url: string, 
  options: RequestInit = {}, 
  refreshAccessToken: () => Promise<boolean>
): Promise<Response> {
  const tokens = getTokens()
  if (!tokens) {
    throw new Error('No authentication tokens found')
  }

    // Add Authorization header
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
      'Authorization': `Bearer ${tokens.access}`,
    }

    // First attempt
    let response = await fetch(url, {
      ...options,
      headers,
    })

    // Nếu 401 (token hết hạn), thử refresh token
    if (response.status === 401) {
      const refreshed = await refreshAccessToken()
      console.log(refreshed, 'refresh');
      
      if (!refreshed) {
        // Refresh failed, redirect to login
        handleAuthFailure()
        throw new Error('Authentication failed')
      }

      // Retry request với token mới
      const newTokens = getTokens()
      if (newTokens) {
        response = await fetch(url, {
          ...options,
          headers: {
            ...headers,
            'Authorization': `Bearer ${newTokens.access}`,
          },
        })
      }
    }

    return response
}

// Handle auth failure (logout)
function handleAuthFailure(): void {
  removeTokens()
  
  // Trigger logout in AuthProvider
  window.dispatchEvent(new CustomEvent('auth-failure'))
  
  // Redirect to login if not already there
  if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
    window.location.href = '/login'
  }
}


