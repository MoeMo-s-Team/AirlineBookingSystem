import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn((url: string, key: string) => ({ url, key, auth: { onAuthStateChange: vi.fn() } })),
}));

describe('supabase client', () => {
  beforeEach(() => {
    vi.resetModules();
    sessionStorage.clear();
    vi.stubEnv('VITE_SUPABASE_URL', 'https://test-project.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key');
  });

  it('captures recovery events before React mounts and clears the marker on sign-out', async () => {
    const { supabase } = await import('./supabase');
    const { recoveryUserId } = await import('../utils/passwordRecovery');
    const callback = vi.mocked(supabase.auth.onAuthStateChange).mock.calls[0][0];
    callback('PASSWORD_RECOVERY', { user: { id: 'early-recovery-user' } } as any);
    expect(recoveryUserId()).toBe('early-recovery-user');
    callback('SIGNED_OUT', null);
    expect(recoveryUserId()).toBeNull();
  });

  it('initializes createClient with configured environment variables', async () => {
    const { createClient } = await import('@supabase/supabase-js');
    const { supabase } = await import('./supabase');

    expect(createClient).toHaveBeenCalledWith(
      'https://test-project.supabase.co',
      'test-anon-key'
    );
    expect(supabase).toBeDefined();
  });
});
