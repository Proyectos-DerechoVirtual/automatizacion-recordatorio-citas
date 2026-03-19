require('dotenv').config();

const env = (key) => (process.env[key] || '').trim();

const config = {
  baileys: {
    url: env('BAILEYS_URL'),
    secret: env('BAILEYS_SECRET'),
  },
  calendly: {
    token: env('CALENDLY_TOKEN'),
    org: env('CALENDLY_ORG'),
    users: [
      env('CALENDLY_DERECHO_VIRTUAL_1'),
      env('CALENDLY_DERECHO_VIRTUAL_2'),
      env('CALENDLY_LUCIA_VERGARA'),
      env('CALENDLY_JORGE_CHENARD'),
      env('CALENDLY_BRAYAN_ROMERO'),
    ].filter(Boolean),
  },
  supabase: {
    url: env('SUPABASE_URL'),
    serviceKey: env('SUPABASE_SERVICE_KEY'),
  },
  gemini: {
    apiKey: env('GEMINI_API_KEY'),
    model: 'gemini-3-flash-preview',
  },
  admin: {
    group: env('ADMIN_GROUP'),
    groupAgendadas: env('ADMIN_GROUP_AGENDADAS'),
    agentNumber: env('AGENT_NUMBER'),
  },
  dryRun: env('DRY_RUN') === 'true',
};

module.exports = config;
