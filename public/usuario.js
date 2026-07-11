let currentEmail = "";
let currentInteractionId = null;
let chatHistoryBackup = []; // Respaldo infalible para enviar al CRM

function loginUser() {
    const email = document.getElementById('user-email').value.trim();
    if (!email || !email.includes('@')) {
        alert("Por favor ingresa un correo electrónico válido.");
        return;
    }
    currentEmail = email;
    document.getElementById('display-email').textContent = currentEmail;
    document.getElementById('login-section').classList.remove('active');
    document.getElementById('chat-section').classList.add('active');
    document.getElementById('chat-input').focus();
    
    // Guardar saludo en el respaldo
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
        
        // ANALIZAR SI LA IA DECIDIÓ QUE EL LEAD ESTÁ LISTO
        let botReply = data.reply;
        if (botReply.includes('||LEAD_LISTO||')) {
            // 1. Limpiamos la etiqueta secreta para que el usuario no la vea
            botReply = botReply.replace('||LEAD_LISTO||', '').trim();
            
            // 2. DESBLOQUEAMOS EL BOTÓN EN LA INTERFAZ
            document.getElementById('finish-container').style.display = 'block';
            
            // Hacemos un scroll suave para que el usuario vea que apareció el botón
            setTimeout(() => {
                document.getElementById('finish-container').scrollIntoView({ behavior: 'smooth' });
            }, 500);
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

    const finishBtn = document.getElementById('finish-btn');
    finishBtn.disabled = true;
    finishBtn.innerText = "⏳ Evaluando con IA y enviando al CRM...";

    try {
        const res = await fetch('/api/evaluate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                email: currentEmail,
                history: chatHistoryBackup 
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