// Tests del agente Synapse — Historias de Usuario 1, 2 y 3
// Runner nativo de Node (>=18): `npm test`  (no requiere dependencias adicionales)
// Levanta el servidor en modo simulado (sin claves) y prueba el flujo completo.

const { test, before, after } = require('node:test');
const assert = require('node:assert');
const { spawn } = require('node:child_process');
const path = require('node:path');

const PORT = 3499;
const BASE = `http://localhost:${PORT}`;
let servidor;

async function esperarServidor(intentos = 30) {
    for (let i = 0; i < intentos; i++) {
        try {
            const res = await fetch(`${BASE}/api/estado`);
            if (res.ok) return true;
        } catch (e) { /* aún no arranca */ }
        await new Promise(r => setTimeout(r, 300));
    }
    throw new Error('El servidor no arrancó a tiempo');
}

before(async () => {
    servidor = spawn(process.execPath, [path.join(__dirname, '..', 'server.js')], {
        env: { ...process.env, MOCK_GEMINI: 'true', MOCK_DATABASE: 'true', PORT: String(PORT) },
        stdio: 'ignore'
    });
    await esperarServidor();
});

after(() => {
    if (servidor) servidor.kill('SIGTERM');
});

// ── Historia 1: el agente conversacional responde de forma coherente ──
test('el agente responde coherentemente a un saludo', async () => {
    const res = await fetch(`${BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Hola, quiero invertir mis ahorros' })
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(typeof data.reply === 'string' && data.reply.length > 20, 'la respuesta debe tener contenido');
    assert.ok(data.interaction_id, 'debe devolver un id de interacción para la memoria conversacional');
    assert.match(data.reply, /personal|empresa/i, 'debe iniciar la calificación B2B/B2C');
});

test('el agente mantiene el hilo con previous_id y desbloquea el CRM al calificar', async () => {
    const r1 = await fetch(`${BASE}/api/chat`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Quiero invertir' })
    });
    const d1 = await r1.json();
    const r2 = await fetch(`${BASE}/api/chat`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'A título personal', previous_id: d1.interaction_id })
    });
    const d2 = await r2.json();
    const r3 = await fetch(`${BASE}/api/chat`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Unos 20 mil dólares', previous_id: d2.interaction_id })
    });
    const d3 = await r3.json();
    const r4 = await fetch(`${BASE}/api/chat`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Este mes, a un año', previous_id: d3.interaction_id })
    });
    const d4 = await r4.json();
    assert.ok(d4.reply.includes('||LEAD_LISTO||'), 'tras calificar, debe emitir la señal de lead listo');
});

// ── Historia 2: tutor educativo con fuente citada, quiz y consentimiento ──
test('una pregunta educativa recibe respuesta con fuente citada e invitación a quiz', async () => {
    const res = await fetch(`${BASE}/api/chat`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Quiero aprender qué es la renta fija' })
    });
    const data = await res.json();
    assert.match(data.reply, /Fuente: Guía Educativa Synapse/, 'debe citar la fuente educativa');
    assert.match(data.reply, /\|\|QUIZ:[a-z_]+\|\|/, 'debe invitar al quiz con la señal oculta');
});

test('el quiz devuelve 3 preguntas del banco controlado con fuente', async () => {
    const res = await fetch(`${BASE}/api/quiz/renta_fija`);
    assert.strictEqual(res.status, 200);
    const quiz = await res.json();
    assert.strictEqual(quiz.preguntas.length, 3, 'el quiz debe tener exactamente 3 preguntas');
    assert.match(quiz.fuente, /Guía Educativa Synapse/, 'el quiz debe citar su fuente');
    for (const p of quiz.preguntas) {
        assert.ok(p.opciones.length >= 3, 'cada pregunta tiene opciones múltiples');
        assert.ok(p.opciones[p.correcta] !== undefined, 'el índice de la respuesta correcta es válido');
        assert.ok(p.explicacion.length > 10, 'cada pregunta trae retroalimentación');
    }
});

test('un tema de quiz inexistente devuelve 404', async () => {
    const res = await fetch(`${BASE}/api/quiz/criptomonedas_meme`);
    assert.strictEqual(res.status, 404);
});

test('el tema de interés SOLO se registra con consentimiento explícito', async () => {
    // Con consentimiento: el tema queda en el lead
    const conConsent = await fetch(`${BASE}/api/evaluate`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'test.consentimiento@synapse.ec',
            history: [{ role: 'user', text: 'Quiero aprender sobre renta fija con 10000' }],
            tema_interes_educativo: 'Renta Fija',
            consentimiento_educativo: true,
            quiz_puntaje: 3
        })
    });
    const okData = await conConsent.json();
    assert.strictEqual(conConsent.status, 200);
    assert.strictEqual(okData.data.tema_interes_educativo, 'Renta Fija');
    assert.strictEqual(okData.data.quiz_puntaje, 3);

    // Sin consentimiento: el tema NO se guarda aunque venga en el payload
    const sinConsent = await fetch(`${BASE}/api/evaluate`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'test.sin.consentimiento@synapse.ec',
            history: [{ role: 'user', text: 'Quiero invertir 5000' }],
            tema_interes_educativo: 'Renta Fija',
            consentimiento_educativo: false
        })
    });
    const noData = await sinConsent.json();
    assert.strictEqual(noData.data.tema_interes_educativo ?? null, null, 'sin consentimiento el tema debe quedar vacío');
});

// ── Historia 3: la acción sugerida cae en una de tres categorías explícitas ──
test('la acción sugerida es una de las tres categorías del track', async () => {
    const res = await fetch(`${BASE}/api/evaluate`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'test.categorias@synapse.ec',
            history: [{ role: 'user', text: 'Mi empresa quiere invertir 80 mil dólares este mes' }]
        })
    });
    const data = await res.json();
    const CATEGORIAS = ['Agendar reunión', 'Enviar material educativo', 'Derivar a especialista'];
    assert.ok(CATEGORIAS.includes(data.data.accion_categoria),
        `accion_categoria "${data.data.accion_categoria}" debe ser una de: ${CATEGORIAS.join(' | ')}`);
});

// ── Seguridad: la bandeja del CRM exige autenticación ──
test('los endpoints del CRM rechazan peticiones sin sesión', async () => {
    const res = await fetch(`${BASE}/api/leads`);
    assert.strictEqual(res.status, 401);
});

test('el login de admin entrega sesión por cookie httpOnly sin exponer el token', async () => {
    const res = await fetch(`${BASE}/api/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario: 'admin', password: 'admin' })
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.token, undefined, 'el token NUNCA debe viajar en el cuerpo de la respuesta');
    const cookie = res.headers.get('set-cookie') || '';
    assert.match(cookie, /crm_sesion=/, 'debe setear la cookie de sesión');
    assert.match(cookie, /HttpOnly/, 'la cookie debe ser httpOnly');

    // Con la cookie se accede a la bandeja
    const token = cookie.split(';')[0];
    const leads = await fetch(`${BASE}/api/leads`, { headers: { Cookie: token } });
    assert.strictEqual(leads.status, 200);
    const lista = await leads.json();
    assert.ok(Array.isArray(lista) && lista.length > 0, 'la bandeja devuelve leads de demo');
});

// ── Integración de WhatsApp Retargeting ──
test('el endpoint de WhatsApp requiere autenticación', async () => {
    const res = await fetch(`${BASE}/api/leads/d1a2b3c4-0001-4a1b-9c2d-100000000001/whatsapp`);
    assert.strictEqual(res.status, 401);
});

test('el endpoint de WhatsApp genera plantillas correctas y registra auditoría', async () => {
    // 1. Obtener cookie de sesión de ejecutivo
    const resLogin = await fetch(`${BASE}/api/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario: 'admin', password: 'admin' })
    });
    const cookie = resLogin.headers.get('set-cookie').split(';')[0];

    // 2. Consultar borradores de WhatsApp para el lead con teléfono
    const leadId = 'd1a2b3c4-0001-4a1b-9c2d-100000000001';
    const resWa = await fetch(`${BASE}/api/leads/${leadId}/whatsapp`, { headers: { Cookie: cookie } });
    assert.strictEqual(resWa.status, 200);
    const data = await resWa.json();

    assert.ok(data.tiene_telefono, 'el lead de prueba debe tener teléfono');
    assert.ok(data.telefono_whatsapp.startsWith('593'), 'el teléfono formateado debe incluir prefijo país');
    assert.ok(Array.isArray(data.mensajes) && data.mensajes.length > 0, 'debe retornar un array de mensajes');

    for (const m of data.mensajes) {
        assert.ok(m.tipo, 'cada mensaje tiene un tipo (ej: primer_contacto)');
        assert.ok(m.texto, 'cada mensaje tiene un texto precargado');
        assert.ok(m.url_wa && m.url_wa.includes('wa.me'), 'el mensaje con teléfono debe incluir enlace wa.me');
    }

    // 3. Verificar que se haya registrado en la bitácora de auditoría
    const resAuditoria = await fetch(`${BASE}/api/leads/${leadId}`, { headers: { Cookie: cookie } });
    assert.strictEqual(resAuditoria.status, 200);
    const { historial_acciones } = await resAuditoria.json();
    const logWa = historial_acciones.find(log => log.accion === 'WHATSAPP_PREPARADO');
    assert.ok(logWa, 'debe registrarse la acción WHATSAPP_PREPARADO en la bitácora de auditoría');
});

