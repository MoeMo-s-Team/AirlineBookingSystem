import { createClient } from '@supabase/supabase-js';
import { markPasswordRecovery } from '../utils/passwordRecovery';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Capture recovery before React mounts; the SDK may consume the URL during initialization.
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'PASSWORD_RECOVERY' && session) markPasswordRecovery(session.user.id);
  if (event === 'SIGNED_OUT') markPasswordRecovery(null);
});
