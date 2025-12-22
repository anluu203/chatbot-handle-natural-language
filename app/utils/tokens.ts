interface AuthTokens {
  access: string;
  refresh: string;
}

// Utility functions
export function getTokens(): AuthTokens | null {
  if (typeof window === "undefined") return null;

  const access = localStorage.getItem("access_token");
  const refresh = localStorage.getItem("refresh_token");

  if (!access || !refresh) return null;

  return { access, refresh };
}

export function saveTokens(tokens: AuthTokens): void {
  if (typeof window === "undefined") return;

  localStorage.setItem("access_token", tokens.access);
  localStorage.setItem("refresh_token", tokens.refresh);
}

export function removeTokens(): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const exp = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= exp;
  } catch {
    return true;
  }
}
