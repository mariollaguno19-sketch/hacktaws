/**
 * SIMULACIÓN DE FLUJO CONVERSACIONAL Y CRM (END-TO-END TEST)
 * Este script actúa de forma secuencial como el prospecto y como el ejecutivo CRM,
 * verificando que todos los flujos de la aplicación (captación, calificación IA,
 * almacenamiento Supabase, análisis psicológico, bitácora y auditoría) se cumplan.
 */

const BASE = 'http://localhost:3000';
let crmCookie = null;

async function pedir(ruta, opciones = {}) {
    try {
        if (!opciones.headers) opciones.headers = {};
        if (crmCookie) {
            opciones.headers['Cookie'] = crmCookie;
        }
        const res = await fetch(BASE + ruta, opciones);
        
        // Guardar la cookie httpOnly devuelta por el servidor
        const setCookie = res.headers.get('set-cookie');
        if (setCookie) {
            crmCookie = setCookie;
        }

        let cuerpo = null;
        const texto = await res.text();
        try { cuerpo = JSON.parse(texto); } catch (e) { cuerpo = texto; }
        return { status: res.status, cuerpo };
    } catch (e) {
        return { status: 0, cuerpo: null, error: e.message };
    }
}

function postJson(ruta, datos) {
    const headers = { 'Content-Type': 'application/json' };
    return pedir(ruta, { method: 'POST', headers, body: JSON.stringify(datos) });
}

function patchJson(ruta, datos) {
    const headers = { 'Content-Type': 'application/json' };
    return pedir(ruta, { method: 'PATCH', headers, body: JSON.stringify(datos) });
}

function getJson(ruta) {
    return pedir(ruta, { method: 'GET' });
}

function deleteJson(ruta) {
    return pedir(ruta, { method: 'DELETE' });
}

const esperar = ms => new Promise(r => setTimeout(r, ms));

async function run() {
    console.log('🤖 INICIANDO SIMULACIÓN DE USUARIO Y EJECUTIVO (E2E TEST)...\n');

    // ── PASO 0: Verificar Salud del Servidor ──
    const salud = await pedir('/');
    if (salud.status !== 200) {
        console.error('❌ El servidor no está corriendo en http://localhost:3000. Inícialo primero.');
        process.exit(1);
    }
    console.log('✅ Paso 0: Conexión con el servidor establecida.');

    // ── PASO 1: Conversación del Prospecto con la IA ──
    console.log('\n💬 PASO 1: El Prospecto inicia conversación de inversión...');
    let previousId = null;
    const mensajesProspecto = [
        "Hola, me gustaría aprender sobre Fondos Mutuos y cómo diversificar.",
        "Inversión de tipo personal, soy profesional independiente.",
        "Mi capital disponible es de $35,000 dólares.",
        "Deseo iniciar este mismo mes y mantener el capital a mediano plazo."
    ];

    const historialChat = [];
    for (const msg of mensajesProspecto) {
        console.log(`  👤 Prospecto: "${msg}"`);
        const resChat = await postJson('/api/chat', { message: msg, previous_id: previousId });
        if (resChat.status !== 200) {
            console.error(`  ❌ Error en chat: Status ${resChat.status}`, resChat.cuerpo);
            process.exit(1);
        }
        previousId = resChat.cuerpo.interaction_id;
        historialChat.push({ role: 'user', text: msg });
        historialChat.push({ role: 'model', text: resChat.cuerpo.reply });
        console.log(`  🤖 Synapse IA: "${resChat.cuerpo.reply.slice(0, 100)}..."`);
        await esperar(100);
    }
    console.log('✅ Paso 1: Conversación calificada completada con éxito.');

    // ── PASO 2: Evaluación y Registro del Lead ──
    console.log('\n🔥 PASO 2: Envío de perfil al CRM (Evaluación de IA)...');
    const emailTest = `validador_${Date.now()}@prospecto.ec`;
    const evaluacionPayload = {
        email: emailTest,
        history: historialChat,
        tema_interes_educativo: 'Fondos Mutuos',
        consentimiento_educativo: true,
        quiz_puntaje: 3
    };

    const resEval = await postJson('/api/evaluate', evaluacionPayload);
    if (resEval.status !== 200) {
        console.error(`  ❌ Error al evaluar lead: Status ${resEval.status}`, resEval.cuerpo);
        process.exit(1);
    }
    const leadRegistrado = resEval.cuerpo.data;
    const leadId = leadRegistrado.id;
    console.log(`  ✅ Lead registrado con ID: ${leadId}`);
    console.log(`  📋 Calificación CRM: Nivel de Riesgo = ${leadRegistrado.nivel_riesgo}, Tipo = ${leadRegistrado.tipo_cliente}, Prioridad = ${leadRegistrado.puntaje_prioridad}/10, Monto = $${leadRegistrado.monto_estimado}`);
    console.log('✅ Paso 2: Evaluación y almacenamiento de datos LOPDP completado.');

    // ── PASO 3: Acceso del Asesor Comercial (CRM Login & Dashboard) ──
    console.log('\n💼 PASO 3: El Ejecutivo de Cuenta inicia sesión en el CRM...');
    const resLogin = await postJson('/api/auth/login', { usuario: 'admin', password: 'admin' });
    if (resLogin.status !== 200) {
        console.error(`  ❌ Error de autenticación admin: Status ${resLogin.status}`, resLogin.cuerpo);
        process.exit(1);
    }
    console.log('  ✅ Sesión de administrador iniciada y Cookie crm_sesion capturada.');

    // Verificación de Lista de Leads
    const resLeads = await getJson('/api/leads');
    if (!Array.isArray(resLeads.cuerpo)) {
        console.error('  ❌ Error: La respuesta de leads no es un array válido.', resLeads.cuerpo);
        process.exit(1);
    }
    const encontrado = resLeads.cuerpo.some(l => l.id === leadId);
    if (!encontrado) {
        console.error('  ❌ Error: El lead calificado no aparece en la bandeja del CRM.');
        process.exit(1);
    }
    console.log('  ✅ Lead validado presente en la bandeja del ejecutivo.');

    // Verificación de Estadísticas del Dashboard
    const resStats = await getJson('/api/stats');
    console.log(`  📊 KPIs Actuales del CRM: Leads Totales = ${resStats.cuerpo.total_leads}, Pipeline = $${resStats.cuerpo.monto_total_pipeline.toLocaleString('en-US')}`);
    console.log('✅ Paso 3: Autenticación del asesor y visualización comercial validadas.');

    // ── PASO 4: Auditoría Psicológica Avanzada de Synapse AI ──
    console.log('\n🧠 PASO 4: Generación de reporte psicológico y estrategia comercial de IA...');
    const resAnalisis = await getJson(`/api/leads/${leadId}/synapse-analysis`);
    if (resAnalisis.status !== 200) {
        console.error(`  ❌ Error al generar análisis avanzado: Status ${resAnalisis.status}`, resAnalisis.cuerpo);
        process.exit(1);
    }
    const analisis = resAnalisis.cuerpo.analysis;
    console.log(`  🧠 Perfil de Comportamiento: "${analisis.perfil_comportamiento.slice(0, 100)}..."`);
    console.log(`  🎯 Objeción Detectada: "${analisis.objeciones_respuestas.slice(0, 100)}..."`);
    console.log('✅ Paso 4: Reporte avanzado y plantilla de email calificados.');

    // ── PASO 4.5: Generación de Borradores de WhatsApp ──
    console.log('\n💬 PASO 4.5: Generación de borradores de WhatsApp para retargeting...');
    const resWa = await getJson(`/api/leads/${leadId}/whatsapp`);
    if (resWa.status !== 200) {
        console.error(`  ❌ Error al generar borradores de WhatsApp: Status ${resWa.status}`, resWa.cuerpo);
        process.exit(1);
    }
    const waData = resWa.cuerpo;
    console.log(`  📞 Teléfono de destino: ${waData.telefono_whatsapp || 'No registrado'}`);
    console.log(`  💬 Cantidad de plantillas de retargeting: ${waData.mensajes.length}`);
    for (const m of waData.mensajes) {
        console.log(`    - [${m.etiqueta}]: "${m.texto.slice(0, 80)}..."`);
    }
    console.log('✅ Paso 4.5: Borradores de WhatsApp generados con éxito.');

    // ── PASO 5: Operación Comercial (Aprobación y Bitácora de Auditoría) ──
    console.log('\n⚙️ PASO 5: El Asesor aprueba la propuesta comercial para envío...');
    const accionPayload = {
        action: 'APROBADO',
        notes: 'Propuesta de portafolio diversificado moderado aprobada tras análisis automatizado.'
    };
    const resAccion = await postJson(`/api/leads/${leadId}/action`, accionPayload);
    if (resAccion.status !== 200) {
        console.error(`  ❌ Error al ejecutar acción comercial: Status ${resAccion.status}`, resAccion.cuerpo);
        process.exit(1);
    }
    console.log('  ✅ Acción comercial autorizada por el ejecutivo.');

    // Verificar Historial de Auditoría
    const resAuditoria = await getJson(`/api/leads/${leadId}`);
    const logs = resAuditoria.cuerpo.historial_acciones || [];
    const logAprobacion = logs.find(log => log.accion.toLowerCase() === 'aprobado');
    if (!logAprobacion) {
        console.error('  ❌ Error: La acción comercial no quedó registrada en la bitácora de auditoría.');
        process.exit(1);
    }
    console.log(`  🛡️ Registro en Bitácora de Auditoría: "${logAprobacion.usuario} realizó la acción: ${logAprobacion.accion} (${logAprobacion.detalle})"`);
    console.log('✅ Paso 5: Control comercial y bitácora de cumplimiento inmutable aprobados.');

    // ── PASO 6: Limpieza (Delete) ──
    console.log('\n🗑️ PASO 6: Eliminando el lead de prueba del CRM...');
    const resDelete = await deleteJson(`/api/leads/${leadId}`);
    if (resDelete.status !== 200) {
        console.error(`  ❌ Error al eliminar lead: Status ${resDelete.status}`, resDelete.cuerpo);
        process.exit(1);
    }
    console.log('  ✅ Lead de prueba eliminado exitosamente.');
    console.log('✅ Paso 6: Limpieza y resiliencia de datos verificada.');

    console.log('\n🎉 SIMULACIÓN EXITOSA: TODAS LAS FUNCIONES DE CAPTACIÓN, IA, CRM Y COMPLIANCE OPERAN CORRECTAMENTE EN SYNAPSE.');
}

run();
