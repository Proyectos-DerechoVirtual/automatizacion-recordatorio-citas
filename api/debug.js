module.exports = async function handler(req, res) {
  const token = req.headers['authorization'];
  if (token !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const results = {};

  // Test Supabase
  try {
    const r = await fetch(`${process.env.SUPABASE_URL}/rest/v1/citas?limit=1`, {
      headers: {
        apikey: process.env.SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
      },
    });
    results.supabase = { status: r.status, ok: r.ok, body: (await r.text()).substring(0, 200) };
  } catch (err) {
    results.supabase = { error: err.message };
  }

  // Test Baileys
  try {
    const r = await fetch(`${process.env.BAILEYS_URL}/health`);
    results.baileys = { status: r.status, body: await r.text() };
  } catch (err) {
    results.baileys = { error: err.message };
  }

  // Test Calendly
  try {
    const r = await fetch('https://api.calendly.com/users/me', {
      headers: { Authorization: `Bearer ${process.env.CALENDLY_TOKEN}` },
    });
    results.calendly = { status: r.status, ok: r.ok };
  } catch (err) {
    results.calendly = { error: err.message };
  }

  // Env check
  results.env = {
    SUPABASE_URL: process.env.SUPABASE_URL ? process.env.SUPABASE_URL.substring(0, 30) + '...' : 'MISSING',
    BAILEYS_URL: process.env.BAILEYS_URL ? process.env.BAILEYS_URL.substring(0, 30) + '...' : 'MISSING',
    DRY_RUN: process.env.DRY_RUN,
    CALENDLY_BRAYAN: process.env.CALENDLY_BRAYAN_ROMERO || 'MISSING',
    CALENDLY_BRAYAN_LEN: (process.env.CALENDLY_BRAYAN_ROMERO || '').length,
    CALENDLY_USERS: [
      process.env.CALENDLY_DERECHO_VIRTUAL_1,
      process.env.CALENDLY_DERECHO_VIRTUAL_2,
      process.env.CALENDLY_LUCIA_VERGARA,
      process.env.CALENDLY_JORGE_CHENARD,
      process.env.CALENDLY_BRAYAN_ROMERO,
    ].filter(Boolean).length,
  };

  return res.status(200).json(results);
};
