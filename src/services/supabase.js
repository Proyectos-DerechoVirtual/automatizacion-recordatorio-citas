const config = require('../config');

const BASE_URL = `${config.supabase.url}/rest/v1/citas`;

const HEADERS = {
  apikey: config.supabase.serviceKey,
  Authorization: `Bearer ${config.supabase.serviceKey}`,
  'Content-Type': 'application/json',
};

/**
 * Upsert (insertar o actualizar) una cita.
 * Usa resolución merge-duplicates basada en citaId.
 */
async function upsertCita(citaData) {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      ...HEADERS,
      Prefer: 'return=representation,resolution=merge-duplicates',
    },
    body: JSON.stringify(citaData),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`[Supabase] Error upsert cita ${citaData.citaId}: ${res.status} - ${text}`);
    return null;
  }
  return res.json();
}

/**
 * Actualizar campos de una cita por citaId.
 */
async function actualizarCita(citaId, campos) {
  const res = await fetch(`${BASE_URL}?citaId=eq.${citaId}`, {
    method: 'PATCH',
    headers: {
      ...HEADERS,
      Prefer: 'return=representation',
    },
    body: JSON.stringify(campos),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`[Supabase] Error actualizando cita ${citaId}: ${res.status} - ${text}`);
    return null;
  }
  return res.json();
}

/**
 * Obtener citas confirmadas (dentro de rango +-6 horas).
 */
async function obtenerCitasConfirmadas() {
  const ahora = new Date();
  const desde = new Date(ahora.getTime() - 6 * 3600000).toISOString().split('T')[0];
  const hasta = new Date(ahora.getTime() + 6 * 3600000).toISOString().split('T')[0];

  const url = `${BASE_URL}?fecha_cita=gte.${desde}T00:00:00Z&fecha_cita=lte.${hasta}T23:59:59Z`;
  const res = await fetch(url, {
    headers: { ...HEADERS, Prefer: 'return=representation' },
  });

  if (!res.ok) {
    console.error(`[Supabase] Error obteniendo citas confirmadas: ${res.status}`);
    return [];
  }
  return res.json();
}

/**
 * Obtener citas cercanas que necesitan clasificación de respuesta.
 * Citas activas, con recordatorio enviado, sin respuesta o con respuesta "discutido",
 * entre 0 y 5 horas restantes.
 */
async function obtenerCitasCercanas() {
  const ahora = new Date();
  const desde = new Date(ahora.getTime() - 24 * 3600000).toISOString().split('T')[0];
  const hasta = new Date(ahora.getTime() + 24 * 3600000).toISOString().split('T')[0];

  const params = [
    `fecha_cita=gte.${desde}T00:00:00Z`,
    `fecha_cita=lte.${hasta}T23:59:59Z`,
    'estado_evento=eq.active',
    'horasRestantes=gt.0',
    'horasRestantes=lt.5',
    'not.or=(tipo_recordatorio.is.null,tipo_recordatorio.eq.)',
    'or=(respuesta_usuario.is.null,respuesta_usuario.eq.,respuesta_usuario.eq.discutido)',
    'whatsapp=not.is.null',
    'whatsapp=neq.',
  ].join('&');

  const res = await fetch(`${BASE_URL}?${params}`, {
    headers: { ...HEADERS, Prefer: 'return=representation' },
  });

  if (!res.ok) {
    console.error(`[Supabase] Error obteniendo citas cercanas: ${res.status}`);
    return [];
  }
  return res.json();
}

/**
 * Obtener citas programadas (rango +-240 horas / 10 días).
 */
async function obtenerCitasProgramadas() {
  const ahora = new Date();
  const desde = new Date(ahora.getTime() - 240 * 3600000).toISOString().split('T')[0];
  const hasta = new Date(ahora.getTime() + 240 * 3600000).toISOString().split('T')[0];

  const url = `${BASE_URL}?fecha_cita=gte.${desde}T00:00:00Z&fecha_cita=lte.${hasta}T23:59:59Z`;
  const res = await fetch(url, {
    headers: { ...HEADERS, Prefer: 'return=representation' },
  });

  if (!res.ok) {
    console.error(`[Supabase] Error obteniendo citas programadas: ${res.status}`);
    return [];
  }
  return res.json();
}

module.exports = {
  upsertCita,
  actualizarCita,
  obtenerCitasConfirmadas,
  obtenerCitasCercanas,
  obtenerCitasProgramadas,
};
