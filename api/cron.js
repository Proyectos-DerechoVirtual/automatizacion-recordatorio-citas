const reminderFlow = require('../src/flows/reminderFlow');
const classificationFlow = require('../src/flows/classificationFlow');
const newAppointmentFlow = require('../src/flows/newAppointmentFlow');

module.exports = async function handler(req, res) {
  // Vercel Cron envía Authorization: Bearer <CRON_SECRET>
  const authHeader = req.headers['authorization'];
  const expected = `Bearer ${process.env.CRON_SECRET}`;

  if (authHeader !== expected) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const dryRun = process.env.DRY_RUN === 'true';
  const inicio = Date.now();
  const resultados = { reminder: null, classification: null, newAppointment: null };

  try {
    await reminderFlow.ejecutar();
    resultados.reminder = 'ok';
  } catch (err) {
    console.error('[Cron] Error en reminderFlow:', err.message);
    resultados.reminder = err.message;
  }

  try {
    await classificationFlow.ejecutar();
    resultados.classification = 'ok';
  } catch (err) {
    console.error('[Cron] Error en classificationFlow:', err.message);
    resultados.classification = err.message;
  }

  try {
    await newAppointmentFlow.ejecutar();
    resultados.newAppointment = 'ok';
  } catch (err) {
    console.error('[Cron] Error en newAppointmentFlow:', err.message);
    resultados.newAppointment = err.message;
  }

  const duracion = ((Date.now() - inicio) / 1000).toFixed(1);

  return res.status(200).json({
    ok: true,
    dryRun,
    duracion: `${duracion}s`,
    timestamp: new Date().toISOString(),
    resultados,
  });
};
