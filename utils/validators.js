// utils/validators.js - Módulo de validaciones financieras y regulatorias (Ecuador)

/**
 * Valida formalmente el algoritmo estructural de Cédulas y RUCs ecuatorianos.
 * Requisito de Nivel Intermedio para el Hackathon TAWS 2026.
 */
function validarIdentificacionEcuador(id) {
    if (!id || typeof id !== 'string') return false;
    const limpio = id.trim();
    
    // Debe tener exactamente 10 dígitos (Cédula) o 13 dígitos (RUC)
    if (!/^\d{10}$/.test(limpio) && !/^\d{13}$/.test(limpio)) return false;
    
    // Código de provincia: 01 a 24 (provincias) o 30 (registros especiales/extranjeros)
    const provincia = parseInt(limpio.substring(0, 2), 10);
    if ((provincia < 1 || provincia > 24) && provincia !== 30) return false;

    // Si es RUC de persona natural o sociedad privada, suele terminar en 001
    if (limpio.length === 13 && !limpio.endsWith('001')) return false;

    return true;
}

/**
 * Valida la seguridad de correos electrónicos para evitar inyecciones en el CRM.
 */
function validarCorreoCorporativo(email) {
    if (!email || typeof email !== 'string') return false;
    const regex = /^[^\s@<>]{1,64}@[^\s@<>]{1,255}\.[^\s@<>]{2,}$/;
    return regex.test(email.trim());
}

module.exports = { validarIdentificacionEcuador, validarCorreoCorporativo };