require('dotenv').config();
const express = require('express');
const supabase = require('@supabase/supabase-js');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

const supabaseAdmin = supabase.createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
);

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: true,
  credentials: true
}));

// Servíruje frontend (PWA)
app.use(express.static(path.join(__dirname, '..')));

// LOGIN API
app.post('/backend/api/login', async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabaseAdmin.auth.signInWithPassword({
    email,
    password
  });

  if (error) return res.status(401).json({ error: error.message });

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single();

  res.cookie('sb-access-token', data.session.access_token, {
    httpOnly: true,
    secure: false,
    maxAge: 1000 * 60 * 60 * 24 * 7
  });
  res.cookie('sb-refresh-token', data.session.refresh_token, {
    httpOnly: true,
    secure: false,
    maxAge: 1000 * 60 * 60 * 24 * 7
  });

  res.json({ user: data.user, role: profile?.role || null });
});

// CHECK SESSION API
app.get('/backend/api/session', async (req, res) => {
  const accessToken = req.cookies['sb-access-token'];
  if (!accessToken) return res.status(401).json({ error: 'No session' });

  const { data, error } = await supabaseAdmin.auth.getUser(accessToken);
  if (error) return res.status(401).json({ error: error.message });

  res.json({ user: { ...data.user, access_token: accessToken } });
});

// LOGOUT API
app.post('/backend/api/logout', (req, res) => {
  res.clearCookie('sb-access-token');
  res.clearCookie('sb-refresh-token');
  res.json({ message: 'Logged out' });
});

app.listen(port, () => {
  console.log(`✅ Backend běží na http://localhost:${port}`);
});
