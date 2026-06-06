// Shared Supabase client – requires supabase CDN + config.js loaded first

window.getClient = function () {
  if (!window._supabaseClient) {
    window._supabaseClient = supabase.createClient(
      window.SUPABASE_CONFIG.url,
      window.SUPABASE_CONFIG.anonKey
    );
  }
  return window._supabaseClient;
};

window.requireAuth = async function () {
  const { data: { session } } = await window.getClient().auth.getSession();
  if (!session) {
    window.location.replace('index.html');
    throw new Error('Not authenticated');
  }
  return { ...session.user, access_token: session.access_token };
};

window.logout = async function () {
  await window.getClient().auth.signOut();
  window.location.replace('index.html');
};
