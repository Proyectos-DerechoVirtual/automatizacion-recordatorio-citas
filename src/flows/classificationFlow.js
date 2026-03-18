const supabase = require('../services/supabase');
const ultramsg = require('../services/ultramsg');
const calendly = require('../services/calendly');
const gemini = require('../services/gemini');
const { obtenerNumeroWhatsApp } = require('../utils/whatsapp');
const {
  ENLACES_CALENDLY,
  msgConfirmacionAdmin,
  msgCancelacionAdmin,
  msgCancelacionCliente,
  msgReprogramarCliente,
  msgReprogramarAdmin,
  msgPreguntaAdmin,
} = require('../utils/templates');
const config = require('../config');

/**
 * Filtrar solo mensajes de chat válidos.
 */
function filtrarMensajesChat(conversaciones) {
  return conversaciones.filter(
    (msg) => msg.type === 'chat' && msg.body && msg.body.trim() !== ''
  );
}

/**
 * Determinar si el agente ya respondió al último mensaje del cliente.
 */
function agenteYaRespondio(numeroWhatsapp, conversaciones) {
  const numFmt = obtenerNumeroWhatsApp(numeroWhatsapp);

  const msgs = filtrarMensajesChat(
    conversaciones.filter((m) => m.from === numFmt || m.to === numFmt)
  );

  if (msgs.length === 0) return null; // sin coincidencia

  msgs.sort((a, b) => b.timestamp - a.timestamp);
  return msgs[0].fromMe;
}

/**
 * Obtener conversaciones de un número y formatearlas.
 */
function obtenerYFormatearConversaciones(numeroWhatsapp, conversaciones) {
  const numFmt = obtenerNumeroWhatsApp(numeroWhatsapp);

  const msgs = filtrarMensajesChat(
    conversaciones.filter((m) => m.from === numFmt || m.to === numFmt)
  ).sort((a, b) => a.timestamp - b.timestamp);

  if (msgs.length === 0) return { mensajes: [], formateados: 'No hay mensajes disponibles' };

  const formateados = msgs
    .map((msg, i) => {
      const quien = msg.fromMe ? 'AGENTE' : 'CLIENTE';
      const fecha = new Date(msg.timestamp * 1000).toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      return `${i + 1}. [${fecha}] ${quien}: ${msg.body}`;
    })
    .join('\n\n');

  return { mensajes: msgs, formateados };
}

/**
 * Flujo de clasificación de respuestas con IA.
 */
async function ejecutar() {
  console.log('[ClassificationFlow] Iniciando...');

  try {
    // 1. Obtener citas cercanas que necesitan clasificación
    const citas = await supabase.obtenerCitasCercanas();
    console.log(`[ClassificationFlow] ${citas.length} citas para clasificar`);

    if (citas.length === 0) return;

    // 2. Obtener chats de WhatsApp para cada cita
    for (const cita of citas) {
      if (!cita.whatsapp) continue;

      const chatId = `${cita.whatsapp}@c.us`;
      const conversaciones = await ultramsg.obtenerChat(chatId, 2);

      if (!Array.isArray(conversaciones) || conversaciones.length === 0) continue;

      // 3. Verificar si el agente ya respondió
      const yaRespondio = agenteYaRespondio(cita.whatsapp, conversaciones);
      if (yaRespondio === null || yaRespondio === true) continue;

      // 4. Obtener conversaciones formateadas
      const { formateados } = obtenerYFormatearConversaciones(
        cita.whatsapp,
        conversaciones
      );

      const enlaceCalendly = ENLACES_CALENDLY[cita.producto] || 'No disponible';
      const horaCitaCorta = cita.hora_cita ? cita.hora_cita.slice(0, 5) : '';

      // 5. Clasificar con Gemini AI
      console.log(
        `[ClassificationFlow] Clasificando respuesta de ${cita.primer_nombre} (${cita.whatsapp})`
      );

      const resultado = await gemini.clasificarRespuesta({
        primerNombre: cita.primer_nombre,
        fechaCita: cita.fecha_cita,
        horaCita: horaCitaCorta,
        producto: cita.producto,
        enlaceZoom: cita.enlaceZoom,
        enlaceCalendlyReagendar: enlaceCalendly,
        mensajesFormateados: formateados,
      });

      console.log(
        `[ClassificationFlow] ${cita.primer_nombre}: ${resultado.clasificacion}`
      );

      // 6. Ejecutar acción según clasificación
      await ejecutarAccion(resultado, cita, enlaceCalendly, horaCitaCorta);
    }

    console.log('[ClassificationFlow] Completado.');
  } catch (err) {
    console.error('[ClassificationFlow] Error:', err.message);
  }
}

/**
 * Ejecutar la acción correspondiente a la clasificación.
 */
async function ejecutarAccion(resultado, cita, enlaceCalendly, horaCitaCorta) {
  const { clasificacion, respuesta_agente } = resultado;
  const adminGroup = config.admin.group;

  switch (clasificacion) {
    case 'confirmado':
      // Notificar admin
      await ultramsg.enviarMensaje(
        adminGroup,
        msgConfirmacionAdmin(
          cita.primer_nombre,
          cita.whatsapp,
          horaCitaCorta,
          cita.email,
          cita.producto
        )
      );
      // Confirmar al cliente
      await ultramsg.enviarMensaje(cita.whatsapp, respuesta_agente);
      // Actualizar Supabase
      await supabase.actualizarCita(cita.citaId, { respuesta_usuario: 'confirmado' });
      break;

    case 'cancelado':
      // Cancelar en Calendly
      await calendly.cancelarEvento(cita.citaId);
      // Notificar admin
      await ultramsg.enviarMensaje(
        adminGroup,
        msgCancelacionAdmin(
          cita.primer_nombre,
          cita.whatsapp,
          horaCitaCorta,
          cita.email,
          cita.producto
        )
      );
      // Notificar cliente
      await ultramsg.enviarMensaje(
        cita.whatsapp,
        msgCancelacionCliente(cita.primer_nombre, enlaceCalendly)
      );
      // Actualizar Supabase
      await supabase.actualizarCita(cita.citaId, {
        respuesta_usuario: 'cancelado',
        estado_evento: 'canceled',
        estado_invitado: 'canceled',
      });
      break;

    case 'reprogramado':
      // Cancelar en Calendly
      await calendly.cancelarEvento(
        cita.citaId,
        'Reprogramación solicitada via WhatsApp'
      );
      // Enviar link para reprogramar al cliente
      await ultramsg.enviarMensaje(
        cita.whatsapp,
        msgReprogramarCliente(cita.primer_nombre, enlaceCalendly)
      );
      // Notificar admin
      await ultramsg.enviarMensaje(
        adminGroup,
        msgReprogramarAdmin(
          cita.primer_nombre,
          cita.whatsapp,
          horaCitaCorta,
          cita.email,
          cita.producto
        )
      );
      // Actualizar Supabase
      await supabase.actualizarCita(cita.citaId, {
        respuesta_usuario: 'reprogramado',
        estado_evento: 'canceled',
        estado_invitado: 'canceled',
      });
      break;

    case 'cuestionamiento':
      // Enviar mensaje de espera al usuario
      await ultramsg.enviarMensaje(cita.whatsapp, respuesta_agente);
      // Notificar admin
      await ultramsg.enviarMensaje(
        adminGroup,
        msgPreguntaAdmin(cita.primer_nombre, cita.whatsapp, cita.producto)
      );
      // Actualizar Supabase
      await supabase.actualizarCita(cita.citaId, { respuesta_usuario: 'cuestionamiento' });
      break;

    case 'discutido':
    default:
      // Respuesta no clara -> enviar respuesta del agente
      await ultramsg.enviarMensaje(cita.whatsapp, respuesta_agente);
      // Actualizar Supabase
      await supabase.actualizarCita(cita.citaId, { respuesta_usuario: 'discutido' });
      break;
  }
}

module.exports = { ejecutar };
