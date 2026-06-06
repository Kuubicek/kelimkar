// auth.js

// Login přes backend
window.login = async function(email, password) {
  const response = await fetch('/backend/api/login', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!response.ok) throw new Error('Login failed');
  const data = await response.json();
  console.log('Přihlášený uživatel:', data.user);
};

// Kontrola session při vstupu na stránku
window.requireAuth = async function() {
  const response = await fetch('/backend/api/session', {
    credentials: 'include'
  });
  if (response.ok) {
    const data = await response.json();
    console.log('Session OK:', data.user);
    return data.user;
  } else {
    console.log('Žádná aktivní session');
    window.location.replace('index.html');
    throw new Error('Redirecting to login');
  }
};

// Logout
window.logout = async function() {
  const response = await fetch('/backend/api/logout', {
    method: 'POST',
    credentials: 'include'
  });
  if (response.ok) {
    console.log('Odhlášeno');
    window.location.replace('index.html');
  }
};
