// auth.js

const SUPABASE_URL = 'https://bdqyljmjdolpycjjmcmu.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkcXlsam1qZG9scHljamptY211Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1NTM1MjUsImV4cCI6MjA2NzEyOTUyNX0.w5M01wvhI52x2vLy1G5rL7TWAYMCj1c3LptJXO3GfnI'; // tvůj anon key

window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    detectSessionInUrl: false
  }
});

// 🔥 Ulož refresh token do cookie při loginu
supabaseClient.auth.onAuthStateChange((event, session) => {
  if (session && session.refresh_token) {
    document.cookie = `sb-refresh-token=${session.refresh_token}; path=/; secure; samesite=strict; max-age=604800`;
  } else {
    document.cookie = 'sb-refresh-token=; Max-Age=0; path=/';
  }
});

// 🔥 Načti refresh token z cookie
function getRefreshTokenFromCookie() {
  return document.cookie
    .split('; ')
    .find(row => row.startsWith('sb-refresh-token='))
    ?.split('=')[1];
}

// 🔥 Obnov session z localStorage nebo cookie
window.recoverSession = async function () {
  const { data: { session } } = await supabaseClient.auth.getSession();

  if (session) {
    console.log("✅ Session active");
    return;
  }

  console.log("⚠️ No session, trying cookie fallback...");
  const refreshToken = getRefreshTokenFromCookie();
  if (refreshToken) {
    const { error } = await supabaseClient.auth.setSession({
      refresh_token: refreshToken
    });
    if (!error) {
      console.log("✅ Session restored from cookie");
      return;
    }
    console.error("❌ Failed to restore from cookie:", error.message);
  }

  console.warn("❌ No session found. Redirecting to login.");
  window.location.replace('index.html');
};

  return profile;
};
