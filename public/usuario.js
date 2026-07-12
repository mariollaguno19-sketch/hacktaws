let currentEmail = "";
let currentInteractionId = null;
let chatHistoryBackup = []; // Respaldo para enviar al CRM

function loginUser() {
    const email = document.getElementById('user-email').value.trim();
    if (!email || !email.includes('@')) {
        alert("Por favor ingrese una dirección de correo electrónico válida.");
        return;
    }
    currentEmail = email;
    document.getElementById('display-email').textContent = currentEmail;
    document.getElementById('login-section').classList.remove('active');
    document.getElementById('chat-section').classList.add('active');
    document.getElementById('chat-input').focus();
    
    // Guardar saludo en el respaldo
    chatHistoryBackup.push({ role: "model", text: "Bienvenido a la sesión de asesoría financiera de Futuro Academy. Por favor, indíqueme su tipo de consulta o qué temas de inversión desea evaluar hoy." });
}

async function sendMessage() {
    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const text = input.value.trim();
    const typingIndicator = document.getElementById('typing-indicator');
    const chatBox = document.getElementById('chat-box');
    
    if (!text) return;

    appendMessage('user', text);
    chatHistoryBackup.push({ role: "user", text: text });
    input.value = "";

    // Bloquear inputs
    input.disabled = true;
    input.placeholder = "Procesando consulta...";
    sendBtn.disabled = true;
    sendBtn.innerText = "Procesando...";

    // Mostrar indicador de escritura y moverlo al final
    typingIndicator.style.display = 'flex';
    chatBox.appendChild(typingIndicator);
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text, previous_id: currentInteractionId })
        });
        
        const data = await response.json();
        
        // Ocultar indicador
        typingIndicator.style.display = 'none';

        if (!response.ok || data.error) {
            appendMessage('bot', `Error de comunicación: ${data.error || "No se pudo obtener respuesta."}`);
            return;
        }
        
        currentInteractionId = data.interaction_id;
        
        let botReply = data.reply;
        if (botReply.includes('||LEAD_LISTO||')) {
            // Limpiar etiqueta secreta
            botReply = botReply.replace('||LEAD_LISTO||', '').trim();
            
            // Desbloquear el botón en la interfaz
            document.getElementById('finish-container').style.display = 'block';
            
            // Desplazar al banner
            setTimeout(() => {
                document.getElementById('finish-container').scrollIntoView({ behavior: 'smooth' });
            }, 300);
        }

        appendMessage('bot', botReply);
        chatHistoryBackup.push({ role: "model", text: botReply });
        
    } catch (e) {
        typingIndicator.style.display = 'none';
        appendMessage('bot', "Error de red: No se pudo establecer conexión con el servidor.");
    } finally {
        input.disabled = false;
        input.placeholder = "Escriba su consulta aquí...";
        sendBtn.disabled = false;
        sendBtn.innerText = "Enviar";
        input.focus();
        chatBox.scrollTop = chatBox.scrollHeight;
    }
}

function appendMessage(sender, text) {
    const box = document.getElementById('chat-box');
    const typingIndicator = document.getElementById('typing-indicator');
    
    const div = document.createElement('div');
    div.className = `msg msg-${sender}`;
    div.innerText = text;
    
    // Insertar antes del indicador de escritura para mantenerlo siempre al final
    box.insertBefore(div, typingIndicator);
    box.scrollTop = box.scrollHeight;
}

document.getElementById('chat-input').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        if (!document.getElementById('send-btn').disabled) sendMessage();
    }
});

async function finishChat() {
    if (!confirm("¿Confirma que desea enviar su perfil y el historial de conversación para la evaluación del ejecutivo comercial?")) return;

    const finishBtn = document.getElementById('finish-btn');
    finishBtn.disabled = true;
    finishBtn.innerText = "Procesando perfil y transmitiendo...";

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
            alert("El perfil ha sido procesado y registrado en el CRM con éxito.");
            window.location.href = "index.html";
        } else {
            alert(`Error en el servidor: ${data.error}`);
            finishBtn.disabled = false;
            finishBtn.innerText = "Transmitir perfil al Ejecutivo Comercial";
        }
    } catch (e) {
        alert("Error de red: No se pudo transmitir la información.");
        finishBtn.disabled = false;
        finishBtn.innerText = "Transmitir perfil al Ejecutivo Comercial";
    }
}