module.exports = async function handler(req, res) {
  return res.status(200).json({
    ok: true,
    timestamp: new Date().toISOString(),
    service: 'automatizacion-recordatorio-citas',
  });
};
