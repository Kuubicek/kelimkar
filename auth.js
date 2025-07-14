// auth.js

// 1) Inicializace Supabase
const SUPABASE_URL = 'https://bdqyljmjdolpycjjmcmu.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // tvůj klíč
window.supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY,
  { auth: { persistSession: true, detectSessionInUrl: false }}
);

// 2) Načti localForage
(function(){
  if (!window.localforage) {
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/localforage/1.10.0/localforage.min.js';
    document.head.appendChild(s);
  }
})();

// 3) Ukládání session
supabaseClient.auth.onAuthStateChange((event, session) => {
  if (session) {
    localforage.setItem('sb-session', session).catch(console.error);
    document.cookie = `sb-refresh-token=${session.refresh_token}; path=/; max-age=604800`;
  } else {
    localforage.removeItem('sb-session').catch(console.error);
    document.cookie = 'sb-refresh-token=; path=/; max-age=0';
  }
});

// 4) Cookie helper
function getCookie(name) {
  const v = `; ${document.cookie}`.split(`; ${name}=`);
  return v.length === 2 ? v.pop().split(';').shift() : null;
}

// 5) recoverSession (už NEredirectuje)
window.recoverSession = async function() {
  const { data:{ session } } = await supabaseClient.auth.getSession();
  console.log('🔄 recoverSession, session=', session);
  if (session) {
    console.log('✅ Session active');
    return;
  }

  // 5a) IndexedDB fallback
  try {
    const stored = await localforage.getItem('sb-session');
    if (stored?.refresh_token) {
      const { error } = await supabaseClient.auth.setSession({refresh_token: stored.refresh_token});
      if (!error) { console.log('✅ Restored from localforage'); return; }
      console.warn('❌ LF restore failed:', error.message);
    }
  } catch(e) { console.error('❌ LF error', e); }

  // 5b) Cookie fallback
  const rt = getCookie('sb-refresh-token');
  if (rt) {
    const { error } = await supabaseClient.auth.setSession({refresh_token: rt});
    if (!error) { console.log('✅ Restored from cookie'); return; }
    console.warn('❌ Cookie restore failed:', error.message);
  }

  // 5c) Konec – nech stránku tam, kde je (login)
  console.log('⚠️ No session found – stay on login');
};

// 6) redirectIfLoggedIn
window.redirectIfLoggedIn = async function() {
  const { data:{ session }} = await supabaseClient.auth.getSession();
  if (!session) return;
  const { data:profile } = await supabaseClient
    .from('profiles').select('role').eq('id', session.user.id).single();

  switch(profile.role) {
    case 'kelimkar':   window.location.replace('kelimkar.html'); break;
    case 'stankar':    window.location.replace('stankar.html'); break;
    case 'nadrizeny':  window.location.replace('nadrizeny.html'); break;
  }
};

// 7) requireAuth (pro podstránky)
window.requireAuth = async function() {
  const { data:{ session }} = await supabaseClient.auth.getSession();
  if (!session) {
    window.location.replace('index.html');
    throw new Error('Redirecting to login');
  }
  const { data:profile } = await supabaseClient
    .from('profiles').select('name, role').eq('id', session.user.id).single();
  return profile;
};
