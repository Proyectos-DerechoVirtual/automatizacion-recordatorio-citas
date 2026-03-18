/**
 * Extraer el primer nombre de un nombre completo.
 */
function extraerPrimerNombre(nombreCompleto) {
  if (!nombreCompleto || typeof nombreCompleto !== 'string') return '';
  return nombreCompleto.trim().split(' ')[0];
}

/**
 * Calcular la fecha final de la cita.
 * Si no hay end_time, asumir 15 minutos de duración.
 */
function calcularFechaFinalCita(fechaInicio, fechaFin) {
  if (fechaFin) return new Date(fechaFin).toISOString();
  const inicio = new Date(fechaInicio);
  return new Date(inicio.getTime() + 15 * 60 * 1000).toISOString();
}

/**
 * Obtener la hora en formato HH:MM en zona horaria Europe/Madrid.
 */
function horaEspana(fecha) {
  return new Date(fecha).toLocaleTimeString('es-ES', {
    timeZone: 'Europe/Madrid',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/**
 * Calcular horas restantes hasta una fecha.
 */
function calcularHorasRestantes(fechaCita) {
  const ahora = new Date();
  const cita = new Date(fechaCita);
  const horas = (cita - ahora) / (1000 * 60 * 60);
  return Math.max(0, Math.round(horas * 100) / 100);
}

/**
 * Verificar si la hora de la cita es antes de las 11:00.
 */
function esCitaTemprana(horaCita) {
  if (!horaCita) return false;
  const [horas] = horaCita.split(':').map(Number);
  return horas < 11;
}

/**
 * Formatear fecha ISO a formato legible en español.
 */
function formatearFechaEspanol(fechaISO) {
  return new Date(fechaISO).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Europe/Madrid',
  });
}

/**
 * Obtener fecha ISO de hoy +/- horas en formato YYYY-MM-DD.
 */
function fechaISO(offsetHoras = 0) {
  const d = new Date(Date.now() + offsetHoras * 3600000);
  return d.toISOString().split('T')[0];
}

module.exports = {
  extraerPrimerNombre,
  calcularFechaFinalCita,
  horaEspana,
  calcularHorasRestantes,
  esCitaTemprana,
  formatearFechaEspanol,
  fechaISO,
};
