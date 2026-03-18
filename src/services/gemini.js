const config = require('../config');
const { EJEMPLOS_CLASIFICACION } = require('../utils/templates');

/**
 * Clasificar la respuesta de un cliente usando Gemini AI.
 *
 * @param {object} params
 * @param {string} params.primerNombre - Nombre del cliente
 * @param {string} params.fechaCita - Fecha de la cita
 * @param {string} params.horaCita - Hora de la cita (HH:MM)
 * @param {string} params.producto - Tipo de reunión
 * @param {string} params.enlaceZoom - Enlace de Zoom
 * @param {string} params.enlaceCalendlyReagendar - Enlace para reagendar
 * @param {string} params.mensajesFormateados - Conversación formateada
 *
 * @returns {Promise<{clasificacion: string, respuesta_agente: string}>}
 */
async function clasificarRespuesta({
  primerNombre,
  fechaCita,
  horaCita,
  producto,
  enlaceZoom,
  enlaceCalendlyReagendar,
  mensajesFormateados,
}) {
  const ejemplosTexto = EJEMPLOS_CLASIFICACION.map(
    (e) =>
      `- Mensaje: "${e.mensaje}" → Clasificación: ${e.clasificacion}, Respuesta: "${e.respuesta}"`
  ).join('\n');

  const prompt = `Eres un clasificador de respuestas para citas de Derecho Virtual. Clasifica la respuesta del cliente y elige UNA opción: confirmado, cancelado, reprogramado, cuestionamiento, discutido.

DATOS DE LA CITA:
- Nombre: ${primerNombre}
- Fecha: ${fechaCita}
- Hora: ${horaCita}
- Tipo de reunión: ${producto}
- Enlace Zoom: ${enlaceZoom}
- Enlace reprogramación: ${enlaceCalendlyReagendar}

ÚLTIMOS MENSAJES CON EL CLIENTE: "${mensajesFormateados}"

⚠️ IMPORTANTE:
* SIEMPRE ANTES DE CLASIFICAR UTILIZA LOS EJEMPLOS DE CLASIFICACIÓN para responder como un agente humano de nuestro equipo
* Responde ÚNICAMENTE en formato JSON válido. No agregues texto adicional.

Formato de respuesta:{"clasificacion": "", "respuesta_agente": ""}

CLASIFICACIONES:
1. confirmado: Confirma/Acepta asistir a la cita (no importa si hay dudas)
2. cancelado: No puede/quiere asistir (sin dudas en su respuesta)
3. reprogramado: Quiere cambiar fecha/hora (sin dudas en su respuesta)
4. cuestionamiento: Pregunta precios/info/dudas/quiere hablar con persona, no esta seguro o notas duda en su respuesta para cancelar/reprogramar
5. discutido: No está claro o conversación que no encaja en otros tipos

EJEMPLOS DE CLASIFICACIÓN (de la base de datos):
${ejemplosTexto}

EJEMPLOS ADICIONALES:
- "Dale, confirmo" → {"clasificacion": "confirmado", "respuesta_agente": "Perfecto ${primerNombre}, te espero en la llamada a las ${horaCita} 😊"}
- "No puedo asistir" → {"clasificacion": "cancelado", "respuesta_agente": "Entiendo ${primerNombre}, ¿te gustaría reagendar para otra fecha?"}
- "Mi móvil no coge videollamadas" → {"clasificacion": "cuestionamiento", "respuesta_agente": "Te entiendo ${primerNombre}, te contactará un miembro del equipo para ayudarte con alternativas"}
- "Hola" → {"clasificacion": "discutido", "respuesta_agente": "Buenas ${primerNombre}, ¿en qué te puedo ayudar?"}
- "quizas en otro momento si pueda" → {"clasificacion": "cuestionamiento", "respuesta_agente": "Vale, podrias decirme si quieres reprogramar?"}
- "quisiera confirmar" → {"clasificacion": "confirmado", "respuesta_agente": "Perfecto ${primerNombre}, te espero en la llamada a las ${horaCita} 😊"}
- "podemos aplazarlo a mañana?" → {"clasificacion": "cuestionamiento", "respuesta_agente": "Dejame confirmo con mi equipo, si lo podemos aplazar"}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.gemini.model}:generateContent?key=${config.gemini.apiKey}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`[Gemini] Error clasificando: ${res.status} - ${text}`);
    return { clasificacion: 'discutido', respuesta_agente: 'No pude procesar tu mensaje. Un miembro del equipo te contactará pronto.' };
  }

  const data = await res.json();

  try {
    const responseText =
      data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const parsed = JSON.parse(responseText);
    return {
      clasificacion: parsed.clasificacion || 'discutido',
      respuesta_agente: parsed.respuesta_agente || '',
    };
  } catch (err) {
    console.error('[Gemini] Error parseando respuesta:', err.message);
    return { clasificacion: 'discutido', respuesta_agente: 'No pude procesar tu mensaje. Un miembro del equipo te contactará pronto.' };
  }
}

module.exports = { clasificarRespuesta };
