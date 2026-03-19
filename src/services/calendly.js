const config = require('../config');

const HEADERS = {
  Authorization: `Bearer ${config.calendly.token}`,
  'Content-Type': 'application/json',
};

/**
 * Obtener eventos programados de un usuario Calendly.
 * @param {string} userUri - URI del usuario Calendly
 * @param {number} count - Número máximo de eventos
 */
async function obtenerEventos(userUri, count = 100) {
  const minStartTime = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  const params = new URLSearchParams({
    user: userUri,
    min_start_time: minStartTime,
    count: String(count),
    organization: config.calendly.org,
  });

  const res = await fetch(
    `https://api.calendly.com/scheduled_events?${params}`,
    { headers: HEADERS }
  );

  if (!res.ok) {
    console.error(`[Calendly] Error obteniendo eventos para ${userUri}: ${res.status}`);
    return [];
  }

  const data = await res.json();
  return data.collection || [];
}

/**
 * Obtener eventos de todos los usuarios configurados.
 */
async function obtenerTodosLosEventos(count = 100) {
  const results = await Promise.all(
    config.calendly.users.map((u) => obtenerEventos(u, count))
  );
  return results.flat();
}

/**
 * Obtener detalles de los invitados de un evento.
 * @param {string} eventUri - URI del evento
 */
async function obtenerInvitados(eventUri) {
  const eventId = eventUri.split('/').pop();
  const res = await fetch(
    `https://api.calendly.com/scheduled_events/${eventId}/invitees`,
    { headers: HEADERS }
  );

  if (!res.ok) {
    console.error(`[Calendly] Error obteniendo invitados de ${eventId}: ${res.status}`);
    return [];
  }

  const data = await res.json();
  return data.collection || [];
}

/**
 * Cancelar un evento en Calendly.
 * @param {string} citaId - ID del evento
 * @param {string} reason - Motivo de cancelación
 */
async function cancelarEvento(citaId, reason = '') {
  if (config.dryRun) {
    console.log(`[Calendly][DRY_RUN] Cancelar evento ${citaId} - Razón: ${reason || 'N/A'}`);
    return true;
  }

  const body = reason ? JSON.stringify({ reason }) : '{}';
  const res = await fetch(
    `https://api.calendly.com/scheduled_events/${citaId}/cancellation`,
    { method: 'POST', headers: HEADERS, body }
  );

  if (!res.ok) {
    const text = await res.text();
    console.error(`[Calendly] Error cancelando evento ${citaId}: ${res.status} - ${text}`);
    return false;
  }
  return true;
}

module.exports = {
  obtenerEventos,
  obtenerTodosLosEventos,
  obtenerInvitados,
  cancelarEvento,
};
