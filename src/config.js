require('dotenv').config();

const config = {
  baileys: {
    url: process.env.BAILEYS_URL,
    secret: process.env.BAILEYS_SECRET,
  },
  calendly: {
    token: process.env.CALENDLY_TOKEN,
    org: process.env.CALENDLY_ORG,
    users: [
      process.env.CALENDLY_DERECHO_VIRTUAL_1,
      process.env.CALENDLY_DERECHO_VIRTUAL_2,
      process.env.CALENDLY_LUCIA_VERGARA,
      process.env.CALENDLY_JORGE_CHENARD,
      process.env.CALENDLY_BRAYAN_ROMERO,
    ].filter(Boolean),
  },
  supabase: {
    url: process.env.SUPABASE_URL,
    serviceKey: process.env.SUPABASE_SERVICE_KEY,
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    model: 'gemini-2.0-flash-exp',
  },
  admin: {
    group: process.env.ADMIN_GROUP,
    groupAgendadas: process.env.ADMIN_GROUP_AGENDADAS,
    agentNumber: process.env.AGENT_NUMBER,
  },
  dryRun: process.env.DRY_RUN === 'true',
};

module.exports = config;
