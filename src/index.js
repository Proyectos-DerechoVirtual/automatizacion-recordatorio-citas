require('dotenv').config();
const reminderFlow = require('./flows/reminderFlow');
const classificationFlow = require('./flows/classificationFlow');
const newAppointmentFlow = require('./flows/newAppointmentFlow');

// Script local para testing manual (no se usa en Vercel)
async function ejecutarTodo() {
  const inicio = Date.now();
  console.log('=== Automatización Recordatorio Citas ===');
  console.log(`Ejecutando: ${new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })}\n`);

  try {
    await reminderFlow.ejecutar();
    await classificationFlow.ejecutar();
    await newAppointmentFlow.ejecutar();
  } catch (err) {
    console.error('[Main] Error:', err.message);
  }

  const duracion = ((Date.now() - inicio) / 1000).toFixed(1);
  console.log(`\nCompletado en ${duracion}s`);
}

ejecutarTodo();
