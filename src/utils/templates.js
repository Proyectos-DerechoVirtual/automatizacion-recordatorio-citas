// ============================================================
// Plantillas de mensajes de recordatorio (5h, 3h, 1h)
// ============================================================

function plantillaPrimerContacto(nombreEvento, nombre, horaCita, enlaceZoom, remitente) {
  const ev = nombreEvento.trim();

  if (ev === 'Formación Justicia Express') {
    return `Buenas, ${nombre} ¿Qué tal todo? Soy Jorge, de Derecho Virtual, te escribo porque a las  ${horaCita}, tenemos una llamada para abordar tu preparación de las oposiciones de justicia estas semanas finales y ayudarte a conseguir plaza.\n\nTe dejo el link para la reunion: ${enlaceZoom}\n\nConfírmame cuando puedas tu asistencia, para saber que asistirás a la llamada 😊`;
  }
  if (ev === 'Formación Oposiciones de Justicia') {
    return `Buenas ${nombre}, ¿Qué tal todo?\n\n${remitente} 😊. Tenemos una llamada a las ${horaCita} (Hora España Peninsular) para abordar tu preparación de las Oposiciones de Justicia.\n\nTe dejo el enlace a la videollamada: ${enlaceZoom}\n\nConfírmame por este medio cuando puedas tu asistencia ☑`;
  }
  if (ev === 'Demostración Gratuita Videoleyes') {
    return `Buenas ${nombre}, ¿Qué tal todo?\n\n${remitente} 😊. Tenemos una llamada a las ${horaCita} (Hora España Peninsular) para abordar la forma en que vienes preparando las Leyes de tu Oposición y ayudarte a conseguir Plaza.\n\nTe dejo el enlace a la videollamada: ${enlaceZoom}\n\nConfírmame por este medio cuando puedas tu asistencia ☑`;
  }
  if (ev === 'Demostración Gratuita Derecho Virtual.') {
    return `Buenas ${nombre}, ¿Qué tal todo?\n\n${remitente} 😊. Tenemos una llamada a las ${horaCita} (Hora España Peninsular) para ayudarte a sacar la carrera de Derecho con la mejor nota posible. \n\nTe dejo el enlace a la videollamada por zoom: ${enlaceZoom}\n\nConfírmame por este medio cuando puedas tu asistencia ☑`;
  }
  if (ev === 'Formación IIPP Express') {
    return `Buenas ${nombre}, ¿Qué tal todo?\n\n${remitente}. Tenemos una llamada a las ${horaCita} (Hora España Peninsular) para la ${nombreEvento}.\n\nTe dejo el enlace a la videollamada: ${enlaceZoom}\n\nConfírmame por este medio cuando puedas tu asistencia ☑`;
  }
  // Default
  return `Buenas ${nombre}, ¿Qué tal todo?\n\n${remitente}. Tenemos una llamada a las ${horaCita} (Hora España Peninsular) para la ${nombreEvento}.\n\nTe dejo el enlace a la videollamada: ${enlaceZoom}\n\nConfírmame por este medio cuando puedas tu asistencia ☑`;
}

function plantilla3h(nombreEvento, nombre) {
  const ev = nombreEvento.trim();

  if (ev === 'Formación Justicia Express') {
    return `¿${nombre}?, en unas horas tenemos la videollamada para abordar tu preparación para el próximo 27 septiembre.\n\n Confírmame cuando tengas un minuto tu asistencia ✅`;
  }
  if (ev === 'Formación Oposiciones de Justicia') {
    return `Buenas, recuerda que en 3 horas tienes llamada para abordar tu preparación de las Oposiciones de Justicia.\n\nPor favor confirma tu asistencia, en caso contrario tu cita sera cancelada 10 minutos antes de que inicie la reunion 😊`;
  }
  if (ev === 'Demostración Gratuita Videoleyes') {
    return `Buenas ${nombre} te recuerdo que en 3 horas tienes la videollamada donde te mostramos nuestra academia y como preparar las leyes claves de tu oposición \n\nPor favor confirma tu asistencia, en caso contrario tu cita sera cancelada 10 minutos antes de que inicie la reunion 😊`;
  }
  if (ev === 'Demostración Gratuita Derecho Virtual.') {
    return `Buenas, recuerda que en 3 horas tienes llamada para ayudarte a abordar las asignaturas de tu carrera.\n\nPor favor confirma tu asistencia, en caso contrario tu cita sera cancelada 10 minutos antes de que inicie la reunion 😊`;
  }
  // Default (includes IIPP Express and others)
  return `Buenas, recuerda que en 3 horas tienes llamada para la ${nombreEvento}.\n\nPor favor confirma tu asistencia, en caso contrario tu cita sera cancelada 10 minutos antes de que inicie la reunion 😊`;
}

function plantilla1h(nombreEvento, nombre, enlaceZoom) {
  const ev = nombreEvento.trim();

  if (ev === 'Formación Justicia Express') {
    return `¿Te llego el mensaje ${nombre}? En una hora tenemos la llamada, sería una pena que no pudiéramos ayudarte con la preparación. En caso de no confirmación se cancelará la llamada en 45 min.`;
  }
  if (ev === 'Formación Oposiciones de Justicia') {
    return `Buenas, recuerda que en una hora tienes llamada para abordar tu preparación de las Oposiciones de Justicia.\n\nTe dejo el enlace a la videollamada: ${enlaceZoom}\n\nEn caso de no recibir confirmación dentro de los próximos 45 minutos tu llamada será cancelada`;
  }
  // Default (Videoleyes, DV, IIPP, etc.)
  return `Perdona, ¿haz visto el mensaje? En caso de no recibir confirmación la llamada será cancelada dentro de 45 minutos debido a que tenemos otras llamadas pendientes luego.`;
}

// ============================================================
// Plantillas de notificaciones admin y cliente
// ============================================================

function msgAutocanceladoAdmin(nombre, horaCita) {
  return `❌ Se  cancelo  la reunión  con ${nombre} que tenias a las ${horaCita}  por demoras en la respuesta (faltan 10 mins para la reunion)`;
}

function msgAutocanceladoUsuario(horaCita) {
  return `❌ Se te cancelo la reunión de las  ${horaCita} a falta de 10 minutos, por demoras en la confirmación.\n\nEn caso de que se trate de un error o no hallas alcanzado a confirmar, puedes comunicarte con uno de los miembros de Derecho Virtual y reagendar tu llamada. Saludos  👋`;
}

function msgConfirmacionAdmin(nombre, whatsapp, horaCita, email, producto) {
  const waDis = whatsapp.startsWith('34') ? whatsapp.slice(2) : whatsapp;
  return `🟢 CITA CONFIRMADA\n\n👤 Cliente:${nombre} \n📞 WhatsApp: ${waDis}\n🕐 Hora: ${horaCita}\n📧 Email: ${email}\n🏯 Producto:${producto} \n\n✅ El cliente confirmó su asistencia.`;
}

function msgCancelacionAdmin(nombre, whatsapp, horaCita, email, producto) {
  const waDis = whatsapp.startsWith('34') ? whatsapp.slice(2) : whatsapp;
  return `🔴 CITA CANCELADA\n\n👤 Cliente: ${nombre}\n📞 WhatsApp: ${waDis}\n🕐 Hora: ${horaCita}\n📧 Email: ${email}\n🏯 Producto: ${producto}\n\n❌ El cliente canceló la cita.`;
}

function msgCancelacionCliente(nombre, enlaceCalendly) {
  return `¡Sin problema ${nombre}!\n\nTu cita anterior ha sido cancelada. \n\nPuedes agendar una nueva fecha aquí:\n👉 ${enlaceCalendly}\n\n¡Esperamos verte pronto! 😊`;
}

function msgReprogramarCliente(nombre, enlaceCalendly) {
  return `📅 ¡Sin problema ${nombre}!\n\nTu cita anterior ha sido cancelada. \n\nPuedes agendar una nueva fecha aquí:\n👉 ${enlaceCalendly}\n\n¡Esperamos verte pronto! 😊`;
}

function msgReprogramarAdmin(nombre, whatsapp, horaCita, email, producto) {
  const waDis = whatsapp.startsWith('34') ? whatsapp.slice(2) : whatsapp;
  return `📆 CITA POR REPROGRAMAR\n\n👤 Cliente: ${nombre}\n📞 WhatsApp: ${waDis}\n🕐 Hora anterior: ${horaCita}\n📧 Email: ${email}\n🏯 Producto:${producto}\n\n📆 El cliente reprogramara la cita.`;
}

function msgPreguntaAdmin(nombre, whatsapp, producto) {
  const waDis = whatsapp.startsWith('34') ? whatsapp.slice(2) : whatsapp;
  return `El cliente: ${nombre} con  WhatsApp: ${waDis} necesita ayuda con su cita en  ${producto}`;
}

function msgCitaAgendadaAdmin(nombre, whatsapp, horaCita, fecha, email, producto) {
  const waDis = whatsapp.startsWith('34') ? whatsapp.slice(2) : whatsapp;
  return `⚪ CITA AGENDADA \n\n👤 Cliente:${nombre} \n📞 WhatsApp: ${waDis}\n🕐 Hora: ${horaCita}\n🗓️ Fecha: ${fecha} \n📧 Email: ${email}\n🏯 Producto:${producto} \n\n✅ El cliente acaba de agendar en Calendly.`;
}

// ============================================================
// Mapeo de productos a enlaces de Calendly para reagendar
// ============================================================

const ENLACES_CALENDLY = {
  'Formación Justicia Express': 'https://calendly.com/derecho-virtual/formacion-oposiciones-de-justicia-express?back=1&month=2025-06',
  'Entrevista Acceso Instituciones Penitenciarias. (clon)': 'https://calendly.com/derecho-virtual/entrevista-acceso-instituciones-penitenciarias-clon?back=1&month=2025-06',
  'Formación Oposiciones de Justicia': 'https://calendly.com/derecho-virtual/formacion-examen-de-acceso-abogacia-clon?back=1&month=2025-06',
  'Formación Examen de Acceso Abogacía': 'https://calendly.com/derecho-virtual/entrevista-para-acceder-a-abogacia-elite-clon-3?back=1&month=2025-06',
  'Entrevista para acceder a Abogacía Élite': 'https://calendly.com/derecho-virtual/entrevista-para-acceder-a-abogacia-elite?back=1&month=2025-06',
  'Llamada para Acceder a todos los Cursos de por Vida': 'https://calendly.com/derecho-virtual/entrevista-para-acceder-a-abogacia-elite-clon-2?back=1&month=2025-06',
  'Resolvemos tus dudas sobre las Mentorías 1 a 1': 'https://calendly.com/derecho-virtual/entrevista-para-acceder-a-abogacia-elite-clon-1?back=1&month=2025-06',
  'Entrevista para acceder a Abogacía Élite 2025': 'https://calendly.com/derecho-virtual/entrevista-para-acceder-a-abogacia-elite?back=1&month=2025-06',
  'Antiguo A. Elite': 'https://calendly.com/derecho-virtual/30min?back=1&month=2025-06',
  'Demostración Gratuita de Instituciones Penitenciarias': 'https://calendly.com/derecho-virtual/demostracion-gratis-oposicion-iipp?back=1&month=2025-06',
  'Demostración Gratuita Cursos DV': 'https://calendly.com/derecho-virtual/resolvemos-tus-dudas-sobre-los-packs-personalizados?back=1&month=2025-06',
  'Demostración Gratuita Videoleyes': 'https://calendly.com/derecho-virtual/resolvemos-tus-dudas-sobre-los-packs?back=1&month=2025-06',
  'Demostración Gratuita Derecho Virtual.': 'https://calendly.com/derecho-virtual/demostracion-gratuita-derechovirtual',
};

// ============================================================
// Datos de ejemplo para el clasificador AI (de Google Sheets)
// ============================================================

const EJEMPLOS_CLASIFICACION = [
  { mensaje: 'Cual es la fecha de la cita?', respuesta: '{nombre}, la fecha de la cita es el 27 de mayo a las 2 de la tarde', clasificacion: 'discutido' },
  { mensaje: 'De que trata la cita', respuesta: 'Es sobre las opocisiones de justicia', clasificacion: 'discutido' },
  { mensaje: 'De donde eres?', respuesta: 'Soy de argentina, pero tengo familia en asturias', clasificacion: 'discutido' },
  { mensaje: 'No tenía previsto coger el coche a esa hora pero me surgió un contratiempo', respuesta: 'No hay problema, si quieres re agendar me avisas y te paso un enlace', clasificacion: 'cuestionamiento' },
  { mensaje: 'Si confirmo mi asistencia. Si me lo pasas mucho mejor', respuesta: 'Perfecto, ahora mismo te paso el enlace de zoom', clasificacion: 'confirmado' },
  { mensaje: 'Tendría que ser sobre las seis para que me diera tiempo tengo una reunión a última hora', respuesta: 'Hablo con uno de los socios para confirmar si podemos cambiar la hora para hoy', clasificacion: 'cuestionamiento' },
  { mensaje: 'Hola no podría realizar la llamada hoy. Gracias', respuesta: 'Vale, si quieres puedes reagendar aquí: {enlace_calendly_reagendar}', clasificacion: 'reprogramado' },
  { mensaje: 'Buenos días, no creo que pueda conectarme a las 16:45, pueden cambiar la videollamada para más tarde? Sobre las 19h seria posible? Gracias.', respuesta: 'Buenas, hablo con quien te ayudará con la llamada y te confirmo el cambio de hora', clasificacion: 'cuestionamiento' },
  { mensaje: 'Llamada perdida', respuesta: 'Buenas rocío este telefono no puede atender llamadas', clasificacion: 'cuestionamiento' },
  { mensaje: 'Gaston, discúlpame, pero me va a ser imposible. Sé lo que eso significa para vosotros, pero tengo un problema familiar...', respuesta: 'Sin problema Milagros! Tu cita anterior ha sido cancelada. Puedes agendar una nueva fecha aquí: 👉 {enlace_calendly_reagendar}', clasificacion: 'cancelado' },
  { mensaje: 'Necesito agendar otra cita para agosto', respuesta: 'Todavía no esta abierto el plazo pero lo podrás hacer mas adelante...', clasificacion: 'cuestionamiento' },
  { mensaje: 'A mí lo único que me interesaba era saber el precio del curso express', respuesta: 'La llamada es para determinar la situación en la que te encuentras...', clasificacion: 'cuestionamiento' },
  { mensaje: 'Se trata de un error xq descargué la app y estaba esperando la llamada', respuesta: 'Vale ya mismo te confirmo. Te comparto el enlace de nuevo.', clasificacion: 'cuestionamiento' },
  { mensaje: 'Me ha surgido un imprevisto y no voy a poder contestar a la llamada', respuesta: 'Sin Problema Milagros! Tu cita anterior ha sido cancelada...', clasificacion: 'cancelado' },
  { mensaje: 'Hola Gastón, te confirmo asistencia, en principio estoy en horario de trabajo, pero creo que podré', respuesta: '✅ ¡Perfecto {nombre}! Tu cita está confirmada para las {hora}. ¡Nos vemos pronto! 👋', clasificacion: 'confirmado' },
  { mensaje: 'tal vez no vaya a poder ir', respuesta: 'Vale {nombre}, podrias confirmarme si vas a reprogramar?', clasificacion: 'cuestionamiento' },
];

module.exports = {
  plantillaPrimerContacto,
  plantilla3h,
  plantilla1h,
  msgAutocanceladoAdmin,
  msgAutocanceladoUsuario,
  msgConfirmacionAdmin,
  msgCancelacionAdmin,
  msgCancelacionCliente,
  msgReprogramarCliente,
  msgReprogramarAdmin,
  msgPreguntaAdmin,
  msgCitaAgendadaAdmin,
  ENLACES_CALENDLY,
  EJEMPLOS_CLASIFICACION,
};
