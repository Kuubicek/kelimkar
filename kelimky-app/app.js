// 1) Inicializace – globální `supabase` už existuje z CDN
const supabaseClient = supabase.createClient(
  'https://bdqyljmjdolpycjjmcmu.supabase.co', // ← Tvůj Project URL
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkcXlsam1qZG9scHljamptY211Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1NTM1MjUsImV4cCI6MjA2NzEyOTUyNX0.w5M01wvhI52x2vLy1G5rL7TWAYMCj1c3LptJXO3GfnI'               // ← Tvůj anon public API key
);

// 2) Po DOM načtení připoj handler
document.getElementById('btnLogin').addEventListener('click', login);

async function login() {
  const statusEl = document.getElementById('status');
  statusEl.textContent = ''; // clear

  const email    = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    // přihlášení
    const { data: session, error: signInErr } =
      await supabaseClient.auth.signInWithPassword({ email, password });
    if (signInErr) throw signInErr;

    // načti profil (role)
    const userId = session.user.id;
    const { data: profiles, error: profErr } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', userId);
    if (profErr) throw profErr;
    if (!profiles || profiles.length === 0) {
      throw new Error('Profil nenalezen');
    }

    // redirect podle role
    const role = profiles[0].role;
    if (role === 'kelimkar')    return window.location.href = 'kelimkar.html';
    else if (role === 'stankar') return window.location.href = 'stankar.html';
    else if (role === 'nadrizeny') return window.location.href = 'nadrizeny.html';

    throw new Error('Neznámá role');

  } catch (err) {
    console.error(err);
    statusEl.textContent = '❌ ' + (err.message || 'Chyba při přihlášení');
  }
}
