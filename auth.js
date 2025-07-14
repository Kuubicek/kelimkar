// auth.js

// ––––––––––––––––––––––––––––––––––––––––––––––––––––  
// 1) Inicializace Supabase  
const SUPABASE_URL = 'https://bdqyljmjdolpycjjmcmu.supabase.co';  
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkcXlsam1qZG9scHljamptY211Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1NTM1MjUsImV4cCI6MjA2NzEyOTUyNX0.w5M01wvhI52x2vLy1G5rL7TWAYMCj1c3LptJXO3GfnI';  
window.supabaseClient = supabase.createClient(  
  SUPABASE_URL,  
  SUPABASE_KEY,  
  { auth: { persistSession: true, detectSessionInUrl: false }}  
);  

// ––––––––––––––––––––––––––––––––––––––––––––––––––––  
// 2) Load LocalForage (IndexedDB)  
(function(){  
  if (!window.localforage) {  
    const s = document.createElement('script');  
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/localforage/1.10.0/localforage.min.js';  
    document.head.appendChild(s);  
  }  
})();  

// ––––––––––––––––––––––––––––––––––––––––––––––––––––  
// 3) OnAuthStateChange → ukládej session + refresh_token do localforage i cookie  
supabaseClient.auth.onAuthStateChange((event, session) => {  
  if (session) {  
    // IndexedDB fallback  
    localforage.setItem('sb-session', session).catch(console.error);  
    // Cookie fallback (bez secure/sameSite kvůli testu na localhostu)  
    document.cookie = `sb-refresh-token=${session.refresh_token}; path=/; max-age=604800`;  
  } else {  
    localforage.removeItem('sb-session').catch(console.error);  
    document.cookie = 'sb-refresh-token=; path=/; max-age=0';  
  }  
});  

// ––––––––––––––––––––––––––––––––––––––––––––––––––––  
// 4) Pomocná funkce pro načtení cookie  
function getCookie(name) {  
  const v = `; ${document.cookie}`.split(`; ${name}=`);  
  return v.length === 2 ? v.pop().split(';').shift() : null;  
}  

// ––––––––––––––––––––––––––––––––––––––––––––––––––––  
// 5) recoverSession() → LOCALFORAGE → COOKIE → redirect  
window.recoverSession = async function() {  
  const { data: { session } } = await supabaseClient.auth.getSession();  
  if (session) {  
    console.log('✅ Session active');  
    return;  
  }  

  // 5a) Zkus localforage  
  try {  
    const stored = await localforage.getItem('sb-session');  
    if (stored?.refresh_token) {  
      const { error } = await supabaseClient.auth.setSession({ refresh_token: stored.refresh_token });  
      if (!error) { console.log('✅ Restored from localforage'); return; }  
      console.warn('❌ LF restore failed:', error.message);  
    }  
  } catch(e) { console.error('❌ LF error', e); }  

  // 5b) Zkus cookie  
  const rt = getCookie('sb-refresh-token');  
  if (rt) {  
    const { error } = await supabaseClient.auth.setSession({ refresh_token: rt });  
    if (!error) { console.log('✅ Restored from cookie'); return; }  
    console.warn('❌ Cookie restore failed:', error.message);  
  }  

  // 5c) Nic nevyšlo → login  
  console.warn('❌ No session → redirect to login');  
  window.location.replace('index.html');  
};  

// ––––––––––––––––––––––––––––––––––––––––––––––––––––  
// 6) Přesměruj pokud už jsi přihlášený  
window.redirectIfLoggedIn = async function() {  
  const { data: { session }} = await supabaseClient.auth.getSession();  
  if (!session) return;  
  const { data: profile } = await supabaseClient  
    .from('profiles').select('role').eq('id', session.user.id).single();  
  switch(profile.role) {  
    case 'kelimkar':   window.location.replace('kelimkar.html'); break;  
    case 'stankar':    window.location.replace('stankar.html'); break;  
    case 'nadrizeny':  window.location.replace('nadrizeny.html'); break;  
  }  
};  

// ––––––––––––––––––––––––––––––––––––––––––––––––––––  
// 7) Ověř, že jsi přihlášený, jinak login  
window.requireAuth = async function() {  
  const { data: { session }} = await supabaseClient.auth.getSession();  
  if (!session) { window.location.replace('index.html'); throw new Error('Redirecting'); }  
  const { data: profile } = await supabaseClient  
    .from('profiles').select('name, role').eq('id', session.user.id).single();  
  return profile;  
};  
