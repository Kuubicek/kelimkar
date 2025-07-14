// auth.js

const SUPABASE_URL = 'https://bdqyljmjdolpycjjmcmu.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkcXlsam1qZG9scHljamptY211Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1NTM1MjUsImV4cCI6MjA2NzEyOTUyNX0.w5M01wvhI52x2vLy1G5rL7TWAYMCj1c3LptJXO3GfnI'; // zkráceno pro přehlednost

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

// 🆕 IndexedDB fallback pomocí localForage
(async () => {
  if (!window.localforage) {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/localforage/1.10.0/localforage.min.js';
    document.head.appendChild(script);
    await new Promise(res => script.onload = res);
  }
})();

// 🆕 Ukládání session do IndexedDB při změně
supabaseClient.auth.onAuthStateChange((event, session) => {
  if (session) {
    localforage.setItem('sb-session', session);
  } else {
    localforage.removeItem('sb-session');
  }
});

// 🆕 Obnovení session z IndexedDB
window.recoverSession = async function () {
  const { data: { session }, error } = await supabaseClient.auth.getSession();

  if (!session) {
    console.log("⚠️ No active session, trying IndexedDB fallback...");
    const storedSession = await localforage.getItem('sb-session');
    if (storedSession) {
      const { error: setError } = await supabaseClient.auth.setSession(storedSession);
      if (setError) {
        console.warn("❌ Failed to set session from IndexedDB:", setError);
        window.location.replace('index.html');
      } else {
        console.log("✅ Session restored from IndexedDB");
      }
    } else {
      console.warn("❌ No session in IndexedDB, redirecting...");
      window.location.replace('index.html');
    }
  } else {
    console.log("✅ Session is active");
  }
};

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

window.requireAuth = async function () {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    window.location.replace('index.html');
    throw new Error('Redirecting to login');
  }
  const { data: profile } = await supabaseClient
    .from('profiles').select('name, role').eq('id', session.user.id).single();
  return profile;
};
