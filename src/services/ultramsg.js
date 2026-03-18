const config = require('../config');

/**
 * Enviar un mensaje de WhatsApp via UltraMsg.
 * @param {string} to - Número de destino (con o sin @c.us)
 * @param {string} body - Cuerpo del mensaje
 */
async function enviarMensaje(to, body) {
  const url = `${config.ultramsg.baseUrl}/messages/chat`;

  const params = new URLSearchParams({
    token: config.ultramsg.token,
    to,
    body,
  });

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`[UltraMsg] Error enviando mensaje a ${to}: ${res.status} - ${text}`);
    return null;
  }

  const data = await res.json();
  return data;
}

/**
 * Obtener los últimos mensajes de un chat.
 * @param {string} chatId - ID del chat (ej: 34612345678@c.us)
 * @param {number} limit - Número de mensajes a obtener
 */
async function obtenerChat(chatId, limit = 2) {
  const params = new URLSearchParams({
    token: config.ultramsg.token,
    chatId,
    limit: String(limit),
  });

  const url = `${config.ultramsg.baseUrl}/chats/messages?${params}`;

  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  if (!res.ok) {
    console.error(`[UltraMsg] Error obteniendo chat ${chatId}: ${res.status}`);
    return [];
  }

  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

module.exports = {
  enviarMensaje,
  obtenerChat,
};
