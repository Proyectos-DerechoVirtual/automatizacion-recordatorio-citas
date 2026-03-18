require('dotenv').config();

const config = {
  ultramsg: {
    token: process.env.ULTRAMSG_TOKEN,
    instance: process.env.ULTRAMSG_INSTANCE,
    baseUrl: `https://api.ultramsg.com/${process.env.ULTRAMSG_INSTANCE}`,
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
};

module.exports = config;
