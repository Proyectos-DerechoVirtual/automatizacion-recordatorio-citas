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
      process.env.CALENDLY_USER_1,
      process.env.CALENDLY_USER_2,
      process.env.CALENDLY_USER_3,
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
