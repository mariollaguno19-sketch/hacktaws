let currentEmail = "";
let currentInteractionId = null;
let chatHistoryBackup = [];
let consentimientoInteres = false;
let quizResultados = "";

function loginUser() {
    const email = document.getElementById('user-email').value.trim();
    if (!email || !email.includes('@')) {
        alert("Por favor ingresa un correo electrónico válido.");
        return;
    }
    if (!document.getElementById('consent-check').checked) {
        alert("Debes aceptar el aviso de privacidad para usar el servicio.");
        return;
    }
    currentEmail = email;
    document.getElementById('display-email').textContent = currentEmail;
    document.getElementById('login-section').classList.remove('active');
    document.getElementById('chat-section').classList.add('active');
    document.getElementById('chat-input').focus();
    
    chatHistoryBackup.push({ role: "model", text: "¡Hola! Soy tu asesor e IA Tutor de Futuro Academy. ¿En qué te puedo ayudar hoy o qué te gustaría aprender sobre inversiones?" });
}

async function sendMessage() {
    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const text = input.value.trim();
    
    if (!text) return;

    appendMessage('user', text);
    chatHistoryBackup.push({ role: "user", text: text });
    input.value = "";

    input.disabled = true;
    input.placeholder = "⏳ La IA está analizando y redactando...";
    sendBtn.disabled = true;
    sendBtn.innerText = "⏳ Pensando...";

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text, previous_id: currentInteractionId })
        });
        
        const data = await response.json();
        
        if (!response.ok || data.error) {
            appendMessage('bot', `⚠️ ${data.error || "Hubo un error de comunicación con la IA."}`);
            return;
        }
        
        currentInteractionId = data.interaction_id;
        
        let botReply = data.reply;
        const signals = data.signals || {};
        
        // Señal: LEAD_LISTO
        if (botReply.includes('||LEAD_LISTO||')) {
            botReply = botReply.replace('||LEAD_LISTO||', '').trim();
            document.getElementById('finish-container').style.display = 'block';
            setTimeout(() => {
                document.getElementById('finish-container').scrollIntoView({ behavior: 'smooth' });
            }, 500);
        }
        
        // Señal: QUIZ — extraer y almacenar
        if (botReply.includes('||QUIZ||')) {
            const quizMatch = botReply.match(/\|\|QUIZ\|\|([\s\S]*?)\|\|FIN_QUIZ\|\|/);
            if (quizMatch) {
                quizResultados = quizMatch[1].trim();
            }
        }
        // Limpiar etiquetas del quiz del mensaje visible
        botReply = botReply.replace(/\|\|QUIZ\|\||\|\|FIN_QUIZ\|\|/g, '').trim();
        
        // Señal: CONSENTIMIENTO_INTERES — si el usuario ya respondió que sí, marcamos
        if (botReply.includes('||CONSENTIMIENTO_INTERES||')) {
            botReply = botReply.replace('||CONSENTIMIENTO_INTERES||', '').trim();
            // No marcamos aún — esperamos la respuesta del usuario por el chat
        }

        appendMessage('bot', botReply);
        chatHistoryBackup.push({ role: "model", text: botReply });
        
    } catch (e) {
        appendMessage('bot', "⚠️ Error de red: No se pudo contactar al servidor local.");
    } finally {
        input.disabled = false;
        input.placeholder = "Escribe tu consulta aquí...";
        sendBtn.disabled = false;
        sendBtn.innerText = "Enviar";
        input.focus();
    }
}

function appendMessage(sender, text) {
    const box = document.getElementById('chat-box');
    const div = document.createElement('div');
    div.className = `msg msg-${sender}`;
    div.innerText = text;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
}

document.getElementById('chat-input').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        if (!document.getElementById('send-btn').disabled) sendMessage();
    }
});

async function finishChat() {
    if (!confirm("¿Deseas enviar tu historial y perfil financiero al ejecutivo para agendar cita?")) return;

    // Preguntar por consentimiento de señal comercial si no se ha dado antes
    if (!consentimientoInteres) {
        consentimientoInteres = confirm("¿Autorizas a compartir tu interés de aprendizaje como señal comercial con nuestros asesores?");
    }

    const finishBtn = document.getElementById('finish-btn');
    finishBtn.disabled = true;
    finishBtn.innerText = "⏳ Evaluando con IA y enviando al CRM...";

    try {
        const res = await fetch('/api/evaluate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                email: currentEmail,
                history: chatHistoryBackup,
                consentimiento_interes: consentimientoInteres,
                quiz_resultados: quizResultados
            })
        });
        
        const data = await res.json();
        
        if (data.success) {
            alert("✅ ¡Perfil procesado y guardado en el CRM con éxito! El ejecutivo ya puede verlo en su bandeja.");
            window.location.href = "index.html";
        } else {
            alert(`⚠️ Error en el servidor: ${data.error}`);
            finishBtn.disabled = false;
            finishBtn.innerText = "✨ Enviar mi perfil al Ejecutivo Comercial";
        }
    } catch (e) {
        alert("⚠️ Error de conexión al intentar guardar en el CRM.");
        finishBtn.disabled = false;
        finishBtn.innerText = "✨ Enviar mi perfil al Ejecutivo Comercial";
    }
}