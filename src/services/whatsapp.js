const config = require('../config');

const HEADERS = {
  'Content-Type': 'application/json',
  'x-api-secret': config.baileys.secret,
};

/**
 * Enviar un mensaje de WhatsApp via Baileys.
 * @param {string} to - Número de destino (ej: 34612345678 o 34612345678@s.whatsapp.net)
 * @param {string} body - Cuerpo del mensaje
 */
async function enviarMensaje(to, body) {
  if (config.dryRun) {
    console.log(`[WhatsApp][DRY_RUN] Enviar a ${to}: ${body.substring(0, 80)}...`);
    return { status: 'dry_run' };
  }

  const res = await fetch(`${config.baileys.url}/messages/send`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({ to, message: body }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`[WhatsApp] Error enviando mensaje a ${to}: ${res.status} - ${text}`);
    return null;
  }

  return res.json();
}

/**
 * Obtener los últimos mensajes de un chat.
 * @param {string} chatId - ID del chat (ej: 34612345678@s.whatsapp.net)
 * @param {number} limit - Número de mensajes a obtener
 */
async function obtenerChat(chatId, limit = 50) {
  const params = new URLSearchParams({ chatId, limit: String(limit) });

  const res = await fetch(`${config.baileys.url}/messages/chat?${params}`, {
    headers: HEADERS,
  });

  if (!res.ok) {
    console.error(`[WhatsApp] Error obteniendo chat ${chatId}: ${res.status}`);
    return [];
  }

  const data = await res.json();
  return data.messages || [];
}

module.exports = {
  enviarMensaje,
  obtenerChat,
};
