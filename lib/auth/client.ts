'use client';

/** Clears the server session cookie, then hard-navigates to reset client state. */
export async function signOutAndRedirect(redirectTo: string) {
  await fetch('/api/auth/signout', { method: 'POST', credentials: 'same-origin' });
  window.location.assign(redirectTo);
}
