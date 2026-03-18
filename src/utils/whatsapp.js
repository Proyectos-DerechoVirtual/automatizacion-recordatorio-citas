/**
 * Normalizar números de WhatsApp españoles.
 * Si tiene 9 dígitos y empieza con 6, 7 o 9, agregar prefijo 34.
 */
function normalizarWhatsApp(numero) {
  if (!numero) return '';
  numero = String(numero);
  if (numero.length === 9 && /^[679]/.test(numero)) {
    return '34' + numero;
  }
  return numero;
}

/**
 * Extraer WhatsApp de las preguntas de Calendly (questions_and_answers).
 */
function extraerWhatsApp(questionsAndAnswers) {
  if (!Array.isArray(questionsAndAnswers)) return '';

  const preguntaTelefono = questionsAndAnswers.find(
    (qa) => qa.question && qa.question.toLowerCase().includes('teléfono')
  );

  if (preguntaTelefono && preguntaTelefono.answer) {
    let num = preguntaTelefono.answer.replace(/\D/g, '');
    return normalizarWhatsApp(num);
  }

  if (questionsAndAnswers[0]?.answer) {
    const primerAnswer = questionsAndAnswers[0].answer;
    if (/^\+?\d[\d\s\-()]+$/.test(primerAnswer.trim())) {
      let num = primerAnswer.replace(/\D/g, '');
      return normalizarWhatsApp(num);
    }
  }

  return '';
}

/**
 * Comparar número de cita con número de mensaje WhatsApp,
 * teniendo en cuenta el formato mexicano (52 vs 521).
 */
function normalizarNumeroParaComparacion(numeroCita, numeroMensaje) {
  const numeroLimpio = numeroMensaje.replace('@c.us', '');
  if (numeroCita.startsWith('52') && numeroLimpio.startsWith('521')) {
    return '521' + numeroCita.slice(2) === numeroLimpio;
  }
  return numeroCita === numeroLimpio;
}

/**
 * Obtener el número formateado para WhatsApp (@c.us).
 * Para números mexicanos, agrega el 1 después del 52.
 */
function obtenerNumeroWhatsApp(numeroCita) {
  if (numeroCita.startsWith('52')) {
    return '521' + numeroCita.slice(2) + '@c.us';
  }
  return numeroCita + '@c.us';
}

module.exports = {
  normalizarWhatsApp,
  extraerWhatsApp,
  normalizarNumeroParaComparacion,
  obtenerNumeroWhatsApp,
};
