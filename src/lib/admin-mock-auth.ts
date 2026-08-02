/* WARNING: This is a FRONTEND MOCK for UI demonstration only. In production, this MUST be replaced with a secure backend authentication provider like Supabase Auth. Never hardcode credentials in production frontend code. */

export const ADMIN_AUTH_KEY = "dz_admin_auth";

const MOCK_EMAIL = "sadekplus@gmail.com";
const MOCK_PASSWORD = "sdxrnx123@@";

export function checkMockCredentials(email: string, password: string): boolean {
  return email.trim().toLowerCase() === MOCK_EMAIL && password === MOCK_PASSWORD;
}

export function isAdminAuthed(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(ADMIN_AUTH_KEY) === "true";
}

export function setAdminAuthed(): void {
  window.localStorage.setItem(ADMIN_AUTH_KEY, "true");
}

export function clearAdminAuthed(): void {
  window.localStorage.removeItem(ADMIN_AUTH_KEY);
}
