function loginAdmin() {
    const user = document.getElementById('admin-user').value.trim();
    const pass = document.getElementById('admin-pass').value.trim();
    
    if (user === 'admin' && pass === 'admin') {
        document.getElementById('admin-login-section').classList.remove('active');
        document.getElementById('admin-dashboard-section').classList.add('active');
        loadLeads();
    } else {
        alert("❌ Credenciales incorrectas. El usuario y contraseña deben ser: admin");
    }
}

function logoutAdmin() {
    window.location.href = "index.html";
}

async function loadLeads() {
    const container = document.getElementById('leads-container');
    container.innerHTML = "<p>Cargando prospectos desde la base de datos...</p>";

    try {
        const res = await fetch('/api/leads');
        const leads = await res.json();
        container.innerHTML = "";

        if (leads.length === 0) {
            container.innerHTML = "<p style='text-align:center; padding: 40px;'>📭 No hay prospectos registrados aún en el CRM.</p>";
            return;
        }

        leads.reverse().forEach((lead, index) => {
            const realIndex = leads.length - 1 - index;
            const card = document.createElement('div');
            card.className = "lead-card";
            
            // PROTECCIÓN VISUAL CONTRA UNDEFINED
            const correo = lead.correo_cliente || "Correo no registrado";
            const prioridad = lead.puntaje_prioridad !== undefined ? lead.puntaje_prioridad : 5;
            const tipo = lead.tipo_cliente || "Por clasificar";
            const etapa = lead.etapa_embudo || "Calificado";
            const interes = lead.interes_principal || "Asesoría general";
            const resumen = lead.resumen_necesidad || "Sin resumen disponible.";
            const objeciones = (lead.objeciones_detectadas && lead.objeciones_detectadas.length > 0) 
                                ? lead.objeciones_detectadas.join(', ') : "Ninguna detectada";
            const accion = lead.accion_sugerida_ejecutivo || "Contactar al cliente.";
            const estado = lead.estado_aprobacion || "Pendiente";

            // Asignar color según el estado
            let colorEstado = "#f29900"; // Naranja para pendiente
            if (estado.includes("APROBADO")) colorEstado = "#1e8e3e"; // Verde
            if (estado.includes("RECHAZADO")) colorEstado = "#d93025"; // Rojo

            card.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <h3 style="margin:0; color:#1a73e8;">📌 Prospecto: ${correo}</h3>
                    <span style="background:#e8f0fe; color:#1a73e8; padding:6px 12px; border-radius:15px; font-weight:bold;">Prioridad: ${prioridad}/10</span>
                </div>
                <p><strong>🏢 Tipo de Cliente:</strong> ${tipo} | <strong>📊 Etapa:</strong> ${etapa}</p>
                <p><strong>💡 Interés Principal:</strong> ${interes}</p>
                <p><strong>📝 Resumen Necesidad:</strong> ${resumen}</p>
                <p><strong>🛡️ Objeciones Detectadas:</strong> ${objeciones}</p>
                <p><strong>⚡ Estado de Gestión:</strong> <span style="font-weight:bold; color:${colorEstado};">${estado}</span></p>
                <hr style="border:0; border-top:1px dashed #ccc; margin:15px 0;">
                
                <label><strong>🤖 Propuesta de Acción de la IA (Human-in-the-loop - Puedes editarla):</strong></label><br>
                <textarea id="action-${realIndex}" rows="3">${accion}</textarea><br>
                
                <div style="margin-top:15px; display:flex; justify-content:space-between; flex-wrap:wrap; gap:10px;">
                    <div>
                        <button class="btn btn-success" onclick="takeAction(${realIndex}, '✅ APROBADO (Enviado al cliente)')">Aprobar Propuesta</button>
                        <button class="btn btn-warning" onclick="takeAction(${realIndex}, '✏️ EDITADO POR EJECUTIVO')">Guardar Edición</button>
                        <button class="btn btn-danger" onclick="takeAction(${realIndex}, '❌ RECHAZADO')">Rechazar</button>
                    </div>
                    <div>
                        <button class="btn btn-secondary" style="background:#5f6368;" onclick="deleteLead(${realIndex})">🗑️ Eliminar Registro</button>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (e) {
        container.innerHTML = "<p>⚠️ Error al cargar la base de datos del servidor.</p>";
    }
}

async function takeAction(index, actionType) {
    const actionText = document.getElementById(`action-${index}`).value;
    try {
        await fetch(`/api/leads/${index}/action`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: actionType, accion_sugerida: actionText })
        });
        alert(`✔ Acción registrada: ${actionType}\n\n(En un sistema bancario real, esto enviaría la propuesta de inmediato al correo del cliente).`);
        loadLeads();
    } catch (e) {
        alert("Error al actualizar el estado en el servidor.");
    }
}

// NUEVA FUNCIÓN PARA BORRAR PROPUESTAS
async function deleteLead(index) {
    if (!confirm("¿Estás seguro de que deseas eliminar este prospecto del CRM de forma definitiva?")) return;
    try {
        await fetch(`/api/leads/${index}`, { method: 'DELETE' });
        loadLeads();
    } catch (e) {
        alert("Error al intentar eliminar el registro.");
    }
}