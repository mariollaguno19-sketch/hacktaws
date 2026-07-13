const { validarIdentificacionEcuador, validarCorreoCorporativo } = require('../utils/validators');

describe('🧪 [NIVEL INTERMEDIO] Pruebas Unitarias de Funciones Críticas', () => {
    
    test('✔ Debe validar correctamente Cédulas ecuatorianas válidas (10 dígitos)', () => {
        expect(validarIdentificacionEcuador('0912345678')).toBe(true); // Guayas (09)
        expect(validarIdentificacionEcuador('1712345678')).toBe(true); // Pichincha (17)
    });

    test('✔ Debe validar correctamente RUCs corporativos (13 dígitos con sucursal 001)', () => {
        expect(validarIdentificacionEcuador('0912345678001')).toBe(true);
        expect(validarIdentificacionEcuador('1790012345001')).toBe(true);
    });

    test('✖ Debe rechazar identificaciones con provincias inexistentes o formato erróneo', () => {
        expect(validarIdentificacionEcuador('9912345678')).toBe(false); // Provincia 99 es falsa
        expect(validarIdentificacionEcuador('12345')).toBe(false);      // Muy corto
        expect(validarIdentificacionEcuador('0912345678ABC')).toBe(false); // Caracteres alfanuméricos
    });

    test('✔ Debe verificar la integridad de correos electrónicos para el CRM', () => {
        expect(validarCorreoCorporativo('gerencia@futuroacademy.ec')).toBe(true);
        expect(validarCorreoCorporativo('usuario.invalido@')).toBe(false);
        expect(validarCorreoCorporativo('<script>alert(1)</script>@hack.com')).toBe(false);
    });
});