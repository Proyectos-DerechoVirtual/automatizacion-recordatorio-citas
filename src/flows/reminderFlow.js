const calendly = require('../services/calendly');
const supabase = require('../services/supabase');
const whatsapp = require('../services/whatsapp');
const {
  extraerPrimerNombre,
  calcularFechaFinalCita,
  horaEspana,
  calcularHorasRestantes,
  esCitaTemprana,
} = require('../utils/helpers');
const { normalizarWhatsApp, extraerWhatsApp } = require('../utils/whatsapp');
const {
  plantillaPrimerContacto,
  plantilla3h,
  plantilla1h,
  msgAutocanceladoAdmin,
  msgAutocanceladoUsuario,
} = require('../utils/templates');
const config = require('../config');

const REMITENTE = 'Soy Jorge, de Derecho Virtual';

/**
 * Formatear un evento de Calendly combinado con datos de Supabase
 * en un objeto de cita unificado.
 */
function formatearCita(evento, invitados, datosExtra) {
  const citaId = evento.uri.split('/').pop();
  const invitado = invitados[0] || {};
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
  const primerNombre = datosExtra?.primer_nombre || extraerPrimerNombre(nombreCompleto);

  return {
    fecha_cita: fechaCita.toISOString(),
    fecha_final_cita: fechaFinalCita,
    hora_cita: horaCita,
    producto: evento.name,
    whatsapp,
    email: invitado.email || datosExtra?.email || '',
    citaId,
    nombre_completo: nombreCompleto,
    primer_nombre: primerNombre,
    eventUri: evento.uri,
    enlaceZoom: evento.location?.join_url || '',
    horasRestantes,
    estado_evento: evento.status || 'unknown',
    estado_invitado: invitado.status || 'unknown',
    respuesta_usuario: datosExtra?.respuesta_usuario || null,
    tipo_recordatorio: datosExtra?.tipo_recordatorio || null,
  };
}

/**
 * Determinar si debe enviar recordatorio y cuál plantilla usar.
 */
function determinarRecordatorio(cita) {
  const { horasRestantes, estado_evento, respuesta_usuario, tipo_recordatorio, hora_cita } = cita;

  if (estado_evento !== 'active') return null;

  const citaTemprana = esCitaTemprana(hora_cita);

  function debeEnviar(resp) {
    return (
      resp === null ||
      resp === undefined ||
      resp === '' ||
      resp === 'null' ||
      (typeof resp === 'string' && resp.trim() === '') ||
      (typeof resp === 'string' && resp.trim().toLowerCase() === 'discutido')
    );
  }

  function yaEnviado(anterior, actual) {
    return anterior === actual;
  }

  const nombre = cita.primer_nombre || 'Cliente';
  const enlaceZoom = cita.enlaceZoom || '';
  const horaCitaCorta = hora_cita ? hora_cita.slice(0, 5) : '';
  const producto = cita.producto || '';

  if (citaTemprana) {
    // Citas tempranas: solo recordatorios de 3h (como primer contacto) y 1h
    if (horasRestantes >= 2.9 && horasRestantes <= 3) {
      if (yaEnviado(tipo_recordatorio, 'recordatorio3h')) return null;
      return {
        tipo: 'recordatorio3h',
        plantilla: plantillaPrimerContacto(producto, nombre, horaCitaCorta, enlaceZoom, REMITENTE),
      };
    }
    if (horasRestantes >= 0.9 && horasRestantes <= 1) {
      if (yaEnviado(tipo_recordatorio, 'recordatorio1h')) return null;
      if (!debeEnviar(respuesta_usuario)) return null;
      return {
        tipo: 'recordatorio1h',
        plantilla: plantilla1h(producto, nombre, enlaceZoom),
      };
    }
  } else {
    // Citas normales: recordatorios de 5h, 3h y 1h
    if (horasRestantes >= 4.9 && horasRestantes <= 5) {
      if (yaEnviado(tipo_recordatorio, 'recordatorio5h')) return null;
      return {
        tipo: 'recordatorio5h',
        plantilla: plantillaPrimerContacto(producto, nombre, horaCitaCorta, enlaceZoom, REMITENTE),
      };
    }
    if (horasRestantes >= 2.9 && horasRestantes <= 3) {
      if (yaEnviado(tipo_recordatorio, 'recordatorio3h')) return null;
      if (!debeEnviar(respuesta_usuario)) return null;
      return {
        tipo: 'recordatorio3h',
        plantilla: plantilla3h(producto, nombre),
      };
    }
    if (horasRestantes >= 0.9 && horasRestantes <= 1) {
      if (yaEnviado(tipo_recordatorio, 'recordatorio1h')) return null;
      if (!debeEnviar(respuesta_usuario)) return null;
      return {
        tipo: 'recordatorio1h',
        plantilla: plantilla1h(producto, nombre, enlaceZoom),
      };
    }
  }

  return null;
}

/**
 * Verificar si una cita debe ser auto-cancelada por demora.
 * Condiciones: <11 min restantes, >0, sin respuesta, estado activo.
 */
function debeAutocancelar(cita) {
  const hrs = cita.horasRestantes;
  const sinRespuesta =
    !cita.respuesta_usuario || cita.respuesta_usuario === '';
  return hrs < 0.18 && hrs > 0 && sinRespuesta && cita.estado_evento === 'active';
}

/**
 * Flujo principal de recordatorios y auto-cancelación.
 */
async function ejecutar() {
  console.log('[ReminderFlow] Iniciando...');

  try {
    // 1. Obtener eventos de Calendly (todos los usuarios)
    const eventos = await calendly.obtenerTodosLosEventos(12);
    console.log(`[ReminderFlow] ${eventos.length} eventos obtenidos de Calendly`);

    if (eventos.length === 0) return;

    // 2. Obtener invitados para cada evento en paralelo
    const eventosConInvitados = await Promise.all(
      eventos.map(async (ev) => {
        const invitados = await calendly.obtenerInvitados(ev.uri);
        return { evento: ev, invitados };
      })
    );

    // 3. Obtener citas existentes de Supabase (para merge)
    const citasExistentes = await supabase.obtenerCitasConfirmadas();
    const citasMap = new Map(citasExistentes.map((c) => [c.citaId, c]));

    // 4. Formatear y filtrar citas (<5.01 horas)
    const citasFormateadas = eventosConInvitados
      .map(({ evento, invitados }) => {
        const citaId = evento.uri.split('/').pop();
        const datosExtra = citasMap.get(citaId);
        return formatearCita(evento, invitados, datosExtra);
      })
      .filter((c) => c.horasRestantes < 5.01);

    console.log(`[ReminderFlow] ${citasFormateadas.length} citas dentro de 5h`);

    // 5. Upsert citas a Supabase
    for (const cita of citasFormateadas) {
      await supabase.upsertCita({
        fecha_cita: cita.fecha_cita,
        fecha_final_cita: cita.fecha_final_cita,
        hora_cita: cita.hora_cita,
        producto: cita.producto,
        whatsapp: cita.whatsapp,
        email: cita.email,
        citaId: cita.citaId,
        nombre_completo: cita.nombre_completo,
        primer_nombre: cita.primer_nombre,
        enlaceZoom: cita.enlaceZoom,
        horasRestantes: cita.horasRestantes,
        estado_evento: cita.estado_evento,
        estado_invitado: cita.estado_invitado,
        respuesta_usuario: cita.respuesta_usuario,
        tipo_recordatorio: cita.tipo_recordatorio,
      });
    }

    // 6. Enviar recordatorios
    for (const cita of citasFormateadas) {
      if (!cita.whatsapp) continue;

      const recordatorio = determinarRecordatorio(cita);
      if (recordatorio) {
        console.log(
          `[ReminderFlow] Enviando ${recordatorio.tipo} a ${cita.primer_nombre} (${cita.whatsapp})`
        );
        await whatsapp.enviarMensaje(cita.whatsapp, recordatorio.plantilla);

        // Actualizar tipo de recordatorio en Supabase
        await supabase.upsertCita({
          citaId: cita.citaId,
          fecha_cita: cita.fecha_cita,
          hora_cita: cita.hora_cita,
          producto: cita.producto,
          whatsapp: cita.whatsapp,
          email: cita.email,
          primer_nombre: cita.primer_nombre,
          enlaceZoom: cita.enlaceZoom,
          horasRestantes: cita.horasRestantes,
          estado_evento: cita.estado_evento,
          estado_invitado: cita.estado_invitado,
          respuesta_usuario: cita.respuesta_usuario,
          tipo_recordatorio: recordatorio.tipo,
        });
      }
    }

    // 7. Auto-cancelar citas por demora
    const citasParaCancelar = citasFormateadas.filter(debeAutocancelar);
    console.log(`[ReminderFlow] ${citasParaCancelar.length} citas para auto-cancelar`);

    for (const cita of citasParaCancelar) {
      console.log(`[ReminderFlow] Auto-cancelando cita de ${cita.primer_nombre}`);

      // Cancelar en Calendly
      await calendly.cancelarEvento(cita.citaId, 'No Contesto al recordatorio');

      // Notificar admin
      const horaCitaCorta = cita.hora_cita ? cita.hora_cita.slice(0, 5) : '';
      await whatsapp.enviarMensaje(
        config.admin.group,
        msgAutocanceladoAdmin(cita.primer_nombre, horaCitaCorta)
      );

      // Notificar usuario
      await whatsapp.enviarMensaje(
        cita.whatsapp,
        msgAutocanceladoUsuario(horaCitaCorta)
      );

      // Actualizar en Supabase
      await supabase.actualizarCita(cita.citaId, {
        autocancelado: true,
        estado_evento: 'canceled',
        estado_invitado: 'canceled',
      });
    }

    console.log('[ReminderFlow] Completado.');
  } catch (err) {
    console.error('[ReminderFlow] Error:', err.message);
  }
}

module.exports = { ejecutar };
