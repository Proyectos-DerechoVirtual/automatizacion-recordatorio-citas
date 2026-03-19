const calendly = require('../services/calendly');
const supabase = require('../services/supabase');
const whatsapp = require('../services/whatsapp');
const {
  extraerPrimerNombre,
  calcularFechaFinalCita,
  horaEspana,
  calcularHorasRestantes,
  formatearFechaEspanol,
} = require('../utils/helpers');
const { normalizarWhatsApp, extraerWhatsApp } = require('../utils/whatsapp');
const { msgCitaAgendadaAdmin } = require('../utils/templates');
const config = require('../config');

/**
 * Flujo de detección y notificación de nuevas citas agendadas.
 * Usa Calendly user 1 con count=100 para obtener todos los eventos recientes.
 */
async function ejecutar() {
  console.log('[NewAppointmentFlow] Iniciando...');

  try {
    // 1. Obtener eventos de Calendly (user 1, count=100)
    const eventos = await calendly.obtenerEventos(
      config.calendly.users[0],
      100
    );
    console.log(`[NewAppointmentFlow] ${eventos.length} eventos obtenidos`);

    if (eventos.length === 0) return;

    // 2. Obtener invitados para cada evento
    const eventosConInvitados = await Promise.all(
      eventos.map(async (ev) => {
        const invitados = await calendly.obtenerInvitados(ev.uri);
        return { evento: ev, invitados };
      })
    );

    // 3. Obtener citas existentes de Supabase (rango +-10 días)
    const citasExistentes = await supabase.obtenerCitasProgramadas();
    const citasMap = new Map(citasExistentes.map((c) => [c.citaId, c]));

    // 4. Procesar cada evento
    let nuevas = 0;
    for (const { evento, invitados } of eventosConInvitados) {
      const citaId = evento.uri.split('/').pop();
      const datosExtra = citasMap.get(citaId);

      // Si ya se envió aviso de cita programada, skip
      if (datosExtra?.aviso_cita_programada === 'enviado') continue;

      // Si la cita está cancelada, skip
      if (evento.status === 'canceled') continue;

      const invitado = invitados[0] || {};
      if (invitado.status === 'canceled') continue;

      const fechaCita = new Date(evento.start_time);
      const horaCita = horaEspana(evento.start_time);
      const fechaFinalCita = calcularFechaFinalCita(evento.start_time, evento.end_time);
      const horasRestantes = calcularHorasRestantes(evento.start_time);

      let whatsapp = '';
      if (invitado.questions_and_answers) {
        whatsapp = extraerWhatsApp(invitado.questions_and_answers);
      }
      if (!whatsapp && datosExtra?.whatsapp) {
        whatsapp = normalizarWhatsApp(datosExtra.whatsapp);
      }

      const nombreCompleto = invitado.name || datosExtra?.nombre || '';
      const primerNombre = extraerPrimerNombre(nombreCompleto);
      const email = invitado.email || datosExtra?.email || '';

      // 5. Notificar admin sobre nueva cita
      const horaCitaCorta = horaCita.slice(0, 5);
      const fechaFormateada = formatearFechaEspanol(evento.start_time);

      console.log(
        `[NewAppointmentFlow] Nueva cita: ${primerNombre} - ${evento.name} - ${horaCitaCorta}`
      );

      await whatsapp.enviarMensaje(
        config.admin.groupAgendadas,
        msgCitaAgendadaAdmin(
          primerNombre,
          whatsapp,
          horaCitaCorta,
          fechaFormateada,
          email,
          evento.name
        )
      );

      // 6. Upsert cita a Supabase con aviso_cita_programada = 'enviado'
      await supabase.upsertCita({
        fecha_cita: fechaCita.toISOString(),
        fecha_final_cita: fechaFinalCita,
        hora_cita: horaCita,
        producto: evento.name,
        whatsapp,
        email,
        citaId,
        nombre_completo: nombreCompleto,
        primer_nombre: primerNombre,
        enlaceZoom: evento.location?.join_url || '',
        horasRestantes,
        estado_evento: evento.status || 'unknown',
        estado_invitado: invitado.status || 'unknown',
        respuesta_usuario: datosExtra?.respuesta_usuario || null,
        tipo_recordatorio: datosExtra?.tipo_recordatorio || null,
        aviso_cita_programada: 'enviado',
      });

      nuevas++;
    }

    console.log(`[NewAppointmentFlow] ${nuevas} nuevas citas notificadas. Completado.`);
  } catch (err) {
    console.error('[NewAppointmentFlow] Error:', err.message);
  }
}

module.exports = { ejecutar };
