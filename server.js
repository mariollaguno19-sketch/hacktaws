const express = require('express');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { GoogleGenAI } = require('@google/genai');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const CRM_FILE = path.join(__dirname, 'crm_datos.json');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const FUENTE_FUTURO_ACADEMY = `
1. Renta Fija: Inversiones donde se conoce la rentabilidad de antemano (ej. Bonos, Pólizas de acumulación). Bajo riesgo.
2. Fondos Mutuos: Aporte colectivo de dinero gestionado por profesionales para diversificar inversiones en diferentes activos.
3. Regla de Oro: Nunca inviertas dinero que necesites para tu gasto corriente mensual o fondo de emergencia.
`;

const CONFIG_FILE = path.join(__dirname, 'config_preguntas.json');

function getPreguntasConfigurables() {
    try {
        if (fs.existsSync(CONFIG_FILE)) {
            const data = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
            if (data.preguntas && data.preguntas.length > 0) return data.preguntas;
        }
    } catch (e) {}
    return [
        "¿Es tu empresa o tú como persona quien quiere invertir?",
        "¿Qué rango de inversión estás considerando?",
        "¿Qué tan urgente es para ti recibir asesoría?"
    ];
}

function getSystemInstruction() {
    const preguntas = getPreguntasConfigurables();
    const preguntasTexto = preguntas.map((p, i) => `  ${i + 1}. "${p}"`).join('\n');
    return `
Eres un Agente Comercial e IA Tutor Financiero para una entidad financiera en Ecuador.
Tus 4 responsabilidades:
1. CALIFICACIÓN: Identifica conversando si el usuario es B2B (empresa) o B2C (persona individual), su presupuesto aproximado, perfil de riesgo y urgencia. Usa estas preguntas configurables durante la conversación para calificar al prospecto:
${preguntasTexto}
2. TUTORÍA: Si el usuario quiere aprender, explícale de forma sencilla BASÁNDOTE EXCLUSIVAMENTE en esta base de conocimiento:
${FUENTE_FUTURO_ACADEMY}
   Además, después de explicar, ofrece una ruta breve de aprendizaje de 2 pasos y UN QUIZ de 3 preguntas de opción múltiple para evaluar su comprensión. El quiz debe estar al final de tu respuesta tutoría, en el siguiente formato:
   ||QUIZ||
   Pregunta 1: ...
   a) ... b) ... c) ...
   Pregunta 2: ...
   a) ... b) ... c) ...
   Pregunta 3: ...
   a) ... b) ... c) ...
   ||FIN_QUIZ||
   Pregunta al usuario si quiere responder el quiz.
3. SEÑAL COMERCIAL: Cuando identifiques el tema de interés del usuario (ej. renta fija, fondos mutuos, etc.), pregunta explícitamente si autoriza a compartir ese interés como señal comercial con el equipo de asesores. Si el usuario acepta, agrega al final de tu respuesta: ||CONSENTIMIENTO_INTERES||
4. DESBLOQUEO DEL CRM: En cuanto sientas que ya tienes los datos suficientes del cliente (sepas si es B2B/B2C, tengas idea de su presupuesto y su urgencia), debes obligatoriamente agregar AL FINAL de tu respuesta la palabra clave oculta: ||LEAD_LISTO||
No pongas ||LEAD_LISTO|| en el saludo inicial ni si aún te faltan datos clave. Solo ponlo al final del mensaje cuando consideres que el lead ya está calificado.

REGLA DE ESTILO: Habla de forma natural, cercana, profesional y humana. Cuando uses información de la academia, intégrala fluidamente en tu diálogo diciendo algo como "Según enseñamos en Futuro Academy..." o "De acuerdo con nuestro manual...". NUNCA uses corchetes, ni códigos ni etiquetas de fuentes.
`;
}

function getCRMData() {
    if (!fs.existsSync(CRM_FILE)) return [];
    try { return JSON.parse(fs.readFileSync(CRM_FILE, 'utf8')); } catch (e) { return []; }
}

function saveCRMData(data) {
    fs.writeFileSync(CRM_FILE, JSON.stringify(data, null, 4), 'utf8');
}

// Endpoint de Chat
app.post('/api/chat', async (req, res) => {
    const { message, previous_id } = req.body;
    console.log(`\n[${new Date().toLocaleTimeString()}] 💬 MENSAJE USUARIO: "${message}"`);
    
    try {
        let inputData = message;
        if (!previous_id) {
            inputData = `${getSystemInstruction()}\n\n--- INICIO DE LA CONVERSACIÓN ---\nUsuario: ${message}`;
        }

        const options = { model: "gemini-3.5-flash", input: inputData };
        if (previous_id) options.previous_interaction_id = previous_id;

        const interaction = await ai.interactions.create(options);
        console.log(`[${new Date().toLocaleTimeString()}] 🤖 RESPUESTA IA LISTA.`);
        
        const reply = interaction.output_text;
        
        // Detectar señales en la respuesta
        const signals = {};
        if (reply.includes('||QUIZ||')) signals.hasQuiz = true;
        if (reply.includes('||CONSENTIMIENTO_INTERES||')) signals.hasConsentimiento = true;
        if (reply.includes('||LEAD_LISTO||')) signals.hasLeadListo = true;
        
        res.json({ reply, interaction_id: interaction.id, signals });
    } catch (error) {
        console.error("❌ ERROR GEMINI:", error.message || error);
        res.status(500).json({ error: "No se pudo conectar con la IA." });
    }
});

// Endpoint de Cierre (Con valores por defecto para evitar undefined)
app.post('/api/evaluate', async (req, res) => {
    console.log(`\n==================================================`);
    console.log(`[${new Date().toLocaleTimeString()}] 🔥 EVALUACIÓN DE LEAD EN SERVIDOR 🔥`);
    console.log(`==================================================`);
    
    const { email, history, consentimiento_interes, quiz_resultados } = req.body;

    try {
        const prompt = `
        Analiza el siguiente historial de conversación con el cliente con correo "${email}":
        ${JSON.stringify(history)}

        Genera una respuesta estrictamente en formato JSON válido sin texto adicional:
        {
            "correo_cliente": "${email}",
            "tipo_cliente": "B2B o B2C",
            "interes_principal": "Tema principal de interés",
            "puntaje_prioridad": 8,
            "etapa_embudo": "Listo para asesor",
            "resumen_necesidad": "Resumen claro de lo que busca el cliente y monto",
            "objeciones_detectadas": ["Duda o temor 1"],
            "ruta_aprendizaje": "Breve ruta de aprendizaje sugerida por el tutor",
            "quiz_resultados": "Resultados del quiz si el usuario lo respondió",
            "tema_interes": "Tema financiero específico que el usuario quería aprender",
            "accion_sugerida_ejecutivo": "Acción clara para el asesor (ej. Agendar reunión para presentar portafolio)",
            "estado_aprobacion": "Pendiente"
        }`;

        const interaction = await ai.interactions.create({
            model: "gemini-3.5-flash",
            input: prompt,
            response_format: { type: "text", mime_type: "application/json" }
        });

        let text = interaction.output_text.replace(/```json|```/g, '').trim();
        let leadData = JSON.parse(text);

        // PROTECCIÓN CONTRA UNDEFINED
        leadData = {
            correo_cliente: leadData.correo_cliente || email || "Cliente sin correo",
            tipo_cliente: leadData.tipo_cliente || "Por clasificar",
            interes_principal: leadData.interes_principal || "Asesoría general",
            puntaje_prioridad: leadData.puntaje_prioridad || 5,
            etapa_embudo: leadData.etapa_embudo || "Calificado",
            resumen_necesidad: leadData.resumen_necesidad || "El cliente solicitó contacto comercial.",
            objeciones_detectadas: leadData.objeciones_detectadas || ["Ninguna"],
            ruta_aprendizaje: leadData.ruta_aprendizaje || "",
            quiz_resultados: quiz_resultados || leadData.quiz_resultados || "",
            tema_interes: leadData.tema_interes || "",
            señal_comercial_autorizada: consentimiento_interes || false,
            accion_sugerida_ejecutivo: leadData.accion_sugerida_ejecutivo || "Contactar al cliente para evaluar necesidades.",
            estado_aprobacion: leadData.estado_aprobacion || "Pendiente"
        };

        const crm = getCRMData();
        crm.push(leadData);
        saveCRMData(crm);

        console.log(`✅ LEAD GUARDADO EXITOSAMENTE: ${leadData.correo_cliente}`);
        res.json({ success: true, data: leadData });
    } catch (error) {
        console.error("❌ ERROR EVALUANDO LEAD:", error.message || error);
        res.status(500).json({ error: "No se pudo generar el reporte del lead." });
    }
});

// Endpoints del Administrador (Incluye Eliminar)
app.get('/api/leads', (req, res) => res.json(getCRMData()));

app.post('/api/leads/:index/action', (req, res) => {
    const { index } = req.params;
    const { action, accion_sugerida } = req.body;
    let crm = getCRMData();
    if (crm[index]) {
        if (accion_sugerida) crm[index].accion_sugerida_ejecutivo = accion_sugerida;
        crm[index].estado_aprobacion = action;
        saveCRMData(crm);
        res.json({ success: true, lead: crm[index] });
    } else {
        res.status(404).json({ error: "Lead no encontrado" });
    }
});

// NUEVO: Ruta para eliminar un lead
app.delete('/api/leads/:index', (req, res) => {
    const { index } = req.params;
    let crm = getCRMData();
    if (crm[index]) {
        const borrado = crm.splice(index, 1);
        saveCRMData(crm);
        console.log(`🗑️ REGISTRO ELIMINADO: ${borrado[0].correo_cliente}`);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: "Lead no encontrado" });
    }
});

// Endpoints para preguntas configurables
app.get('/api/config-preguntas', (req, res) => {
    res.json({ preguntas: getPreguntasConfigurables() });
});

app.post('/api/config-preguntas', (req, res) => {
    const { preguntas } = req.body;
    if (!preguntas || !Array.isArray(preguntas) || preguntas.length < 1) {
        return res.status(400).json({ error: "Debe enviar un array de preguntas con al menos 1 elemento." });
    }
    fs.writeFileSync(CONFIG_FILE, JSON.stringify({ preguntas }, null, 4), 'utf8');
    console.log(`⚙️ PREGUNTAS CONFIGURABLES ACTUALIZADAS (${preguntas.length} preguntas)`);
    res.json({ success: true, preguntas });
});

app.listen(PORT, () => {
    console.log(`🚀 SERVIDOR CORRIENDO EN: http://localhost:${PORT}`);
});