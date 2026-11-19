const recoveryKey = 'skywing.password-recovery-user';
let inMemoryUserId: string | null = null;

// UI flow marker only. Supabase validates the authenticated session for every password update.
export function recoveryUserId(): string | null {
  try { return sessionStorage.getItem(recoveryKey) ?? inMemoryUserId; } catch { return inMemoryUserId; }
}

export function markPasswordRecovery(userId: string | null) {
  inMemoryUserId = userId;
  try {
    if (userId) sessionStorage.setItem(recoveryKey, userId);
    else sessionStorage.removeItem(recoveryKey);
  } catch { /* Recovery still works in the current mounted session. */ }
}
