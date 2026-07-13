const request = require('supertest');
const app = require('../server');

describe('🧪 [NIVEL BÁSICO E INTERMEDIO] Suite Agéntica y Mocks de IA[cite: 1]', () => {
    
    test('🤖 [Agente IA] POST /api/chat - Debe responder de forma coherente en lenguaje natural[cite: 1]', async () => {
        const res = await request(app)
            .post('/api/chat')
            .send({ message: 'Hola, represento a una empresa B2B y quiero invertir en Renta Fija.' });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('reply');
        expect(typeof res.body.reply).toBe('string');
        expect(res.body.reply.length).toBeGreaterThan(15); // Confirma coherencia y longitud del mensaje[cite: 1]
    });

    test('🧠 [LLM Mock] POST /api/evaluate - Debe extraer el perfil en formato JSON estructurado[cite: 1]', async () => {
        const payload = {
            email: 'prospecto.b2b@empresa.com',
            history: [
                { role: 'user', text: 'Quiero invertir $10,000 en fondos de bajo riesgo para mi empresa.' },
                { role: 'model', text: 'Entendido. Evaluando perfil de Renta Fija. ||LEAD_LISTO||' }
            ]
        };

        const res = await request(app)
            .post('/api/evaluate')
            .send(payload);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('correo_cliente', 'prospecto.b2b@empresa.com');
        expect(res.body.data).toHaveProperty('puntaje_prioridad');
        expect(res.body.data).toHaveProperty('accion_sugerida_ejecutivo');
    });

    test('🛡️ [Seguridad CRM] POST /api/auth/login - Debe proteger la bandeja del ejecutivo', async () => {
        const resFallido = await request(app)
            .post('/api/auth/login')
            .send({ usuario: 'admin', password: 'clave_incorrecta_hack' });

        expect(resFallido.statusCode).toBe(401);
    });
});