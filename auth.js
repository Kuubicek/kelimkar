// auth.js

// 1) Inicializace Supabase
const SUPABASE_URL = 'https://bdqyljmjdolpycjjmcmu.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkcXlsam1qZG9scHljamptY211Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1NTM1MjUsImV4cCI6MjA2NzEyOTUyNX0.w5M01wvhI52x2vLy1G5rL7TWAYMCj1c3LptJXO3GfnI';

window.supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY,
  {
    auth: {
      persistSession: true,
      detectSessionInUrl: false
    }
  }
);

// ✅ 🔄 NOVÉ: Opravené session recovery
window.recoverSession = async function () {
  const { data: { session }, error } = await supabaseClient.auth.getSession();

  if (!session) {
    console.log("⚠️ No session, attempting to refresh...");
    const { data, error: refreshError } = await supabaseClient.auth.refreshSession();

    if (refreshError) {
      console.warn("❌ Session refresh failed, redirecting to login...");
      await supabaseClient.auth.signOut(); // jistota
      window.location.replace('index.html');
    } else {
      console.log("✅ Session successfully recovered from refresh token");
    }
  } else {
    console.log("✅ Session is already active");
  }
};

// 2) Přesměruje z loginu, pokud už session je
window.redirectIfLoggedIn = async function () {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) return;
  const { data: profile } = await supabaseClient
    .from('profiles').select('role').eq('id', session.user.id).single();
  switch (profile.role) {
    case 'kelimkar': return window.location.replace('kelimkar.html');
    case 'stankar': return window.location.replace('stankar.html');
    case 'nadrizeny': return window.location.replace('nadrizeny.html');
  }
};

// 3) Zajistí, že jsi přihlášený, jinak tě pošle na login
window.requireAuth = async function () {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    window.location.replace('index.html');
    throw new Error('Redirecting to login');
  }
  // načti profil a vrať ho
  const { data: profile } = await supabaseClient
    .from('profiles').select('name, role').eq('id', session.user.id).single();
  return profile;
};
