// ── Sesión ──
function obtenerToken() {
    return sessionStorage.getItem('crm_token');
}

function guardarSesion(datos) {
    sessionStorage.setItem('crm_token', datos.token);
    sessionStorage.setItem('crm_nombre', datos.nombre || 'Ejecutivo');
}

function limpiarSesion() {
    sessionStorage.removeItem('crm_token');
    sessionStorage.removeItem('crm_nombre');
}

// Peticiones autenticadas
async function fetchAutenticado(url, opciones = {}) {
    opciones.headers = Object.assign({}, opciones.headers, {
        'Authorization': `Bearer ${obtenerToken()}`
    });
    const res = await fetch(url, opciones);
    if (res.status === 401) {
        limpiarSesion();
        mostrarLogin('Su sesión ha expirado o no es válida. Inicie sesión nuevamente.');
        throw new Error('Sesión no válida');
    }
    return res;
}

function mostrarLogin(mensaje) {
    document.getElementById('admin-dashboard-section').classList.remove('active');
    document.getElementById('admin-login-section').classList.add('active');
    const errorEl = document.getElementById('login-error');
    errorEl.textContent = mensaje || '';
}

function mostrarDashboard() {
    document.getElementById('admin-login-section').classList.remove('active');
    document.getElementById('admin-dashboard-section').classList.add('active');
    const nombre = sessionStorage.getItem('crm_nombre') || 'Ejecutivo';
    document.getElementById('admin-nombre').textContent = nombre;
    loadLeads();
}

async function loginAdmin() {
    const usuario = document.getElementById('admin-user').value.trim();
    const password = document.getElementById('admin-pass').value;
    const errorEl = document.getElementById('login-error');
    const boton = document.getElementById('login-btn');

    if (!usuario || !password) {
        errorEl.textContent = 'Ingrese usuario y contraseña.';
        return;
    }

    boton.disabled = true;
    boton.innerText = 'Verificando...';
    errorEl.textContent = '';

    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario, password })
        });
        const data = await res.json();

        if (!res.ok) {
            errorEl.textContent = `${data.error || 'Credenciales incorrectas.'}`;
            return;
        }

        guardarSesion(data);
        document.getElementById('admin-pass').value = '';
        mostrarDashboard();
    } catch (e) {
        errorEl.textContent = 'No se pudo establecer conexión con el servidor.';
    } finally {
        boton.disabled = false;
        boton.innerText = 'Ingresar al Dashboard';
    }
}

async function logoutAdmin() {
    try {
        await fetchAutenticado('/api/auth/logout', { method: 'POST' });
    } catch (e) { /* Limpieza local procede en cualquier caso */ }
    limpiarSesion();
    window.location.href = 'index.html';
}

// ── Lógica de Filtros, Ordenación y KPIs ──
let allLeads = [];

async function loadLeads() {
    const container = document.getElementById('leads-container');
    container.textContent = 'Cargando prospectos desde la base de datos...';

    try {
        const res = await fetchAutenticado('/api/leads');
        allLeads = await res.json();
        applyFilters();
    } catch (e) {
        if (e.message !== 'Sesión no válida') {
            container.textContent = 'Error al cargar la base de datos del servidor.';
        }
    }
}

function updateKPIs(leads) {
    document.getElementById('kpi-total').textContent = leads.length;
    
    const b2b = leads.filter(l => l.tipo_cliente === 'B2B').length;
    document.getElementById('kpi-b2b').textContent = b2b;
    
    const b2c = leads.filter(l => l.tipo_cliente === 'B2C').length;
    document.getElementById('kpi-b2c').textContent = b2c;
    
    if (leads.length === 0) {
        document.getElementById('kpi-priority').textContent = "0.0";
    } else {
        const avg = leads.reduce((sum, l) => sum + (l.puntaje_prioridad || 5), 0) / leads.length;
        document.getElementById('kpi-priority').textContent = avg.toFixed(1);
    }
}

function applyFilters() {
    const container = document.getElementById('leads-container');
    const filterType = document.getElementById('filter-type').value;
    const sortOrder = document.getElementById('sort-leads').value;

    // 1. Filtrar
    let leads = [...allLeads];
    if (filterType !== 'ALL') {
        leads = leads.filter(l => l.tipo_cliente === filterType);
    }

    // 2. Ordenar
    leads.sort((a, b) => {
        if (sortOrder === 'PRIORITY_DESC') {
            return (b.puntaje_prioridad || 0) - (a.puntaje_prioridad || 0);
        } else if (sortOrder === 'PRIORITY_ASC') {
            return (a.puntaje_prioridad || 0) - (b.puntaje_prioridad || 0);
        } else {
            // RECENT (creado_en)
            const dateA = new Date(a.creado_en || 0);
            const dateB = new Date(b.creado_en || 0);
            return dateB - dateA;
        }
    });

    // 3. Actualizar KPIs con la lista total
    updateKPIs(allLeads);

    // 4. Renderizar
    container.textContent = '';

    if (leads.length === 0) {
        const vacio = document.createElement('p');
        vacio.style.cssText = 'text-align:center; padding: 40px; color: #94a3b8;';
        vacio.textContent = 'No hay prospectos que coincidan con los criterios.';
        container.appendChild(vacio);
        return;
    }

    leads.forEach(lead => {
        const card = crearTarjetaLead(lead);
        container.appendChild(card);
    });
}

function crearLinea(etiqueta, valor) {
    const p = document.createElement('p');
    const strong = document.createElement('strong');
    strong.textContent = etiqueta + ' ';
    p.appendChild(strong);
    p.appendChild(document.createTextNode(valor));
    return p;
}

function crearTarjetaLead(lead) {
    const correo = lead.correo_cliente || 'Correo no registrado';
    const prioridad = lead.puntaje_prioridad !== undefined ? lead.puntaje_prioridad : 5;
    const objeciones = (Array.isArray(lead.objeciones_detectadas) && lead.objeciones_detectadas.length > 0)
        ? lead.objeciones_detectadas.join(', ') : 'Ninguna detectada';
    const estadoRaw = lead.estado_aprobacion || 'Pendiente';

    // Normalizar texto de estado sin emojis
    let estado = estadoRaw;
    if (estadoRaw.includes('APROBADO')) estado = 'Aprobado (Enviado al cliente)';
    if (estadoRaw.includes('EDITADO')) estado = 'Editado por el ejecutivo';
    if (estadoRaw.includes('RECHAZADO')) estado = 'Rechazado';

    let colorEstado = '#d97706'; // Naranja/Ambar para pendiente
    if (estado.startsWith('Aprobado')) colorEstado = '#059669'; // Verde
    if (estado.startsWith('Rechazado')) colorEstado = '#dc2626'; // Rojo

    const card = document.createElement('div');
    card.className = 'lead-card';
    card.style.borderLeftColor = colorEstado;

    // Encabezado
    const encabezado = document.createElement('div');
    encabezado.className = 'lead-header';
    
    const titulo = document.createElement('h3');
    titulo.textContent = `Prospecto: ${correo}`;
    
    const chip = document.createElement('span');
    chip.className = 'priority-badge';
    chip.textContent = `Prioridad: ${prioridad}/10`;
    
    encabezado.appendChild(titulo);
    encabezado.appendChild(chip);
    card.appendChild(encabezado);

    // Contenedor de información
    const infoGrid = document.createElement('div');
    infoGrid.className = 'lead-info-grid';

    const col1 = document.createElement('div');
    col1.className = 'lead-info-item';
    col1.appendChild(crearLinea('Tipo de Cliente:', lead.tipo_cliente || 'Por clasificar'));
    col1.appendChild(crearLinea('Etapa de Embudo:', lead.etapa_embudo || 'Calificado'));
    col1.appendChild(crearLinea('Interés Principal:', lead.interes_principal || 'Asesoría general'));

    const col2 = document.createElement('div');
    col2.className = 'lead-info-item';
    col2.appendChild(crearLinea('Resumen Necesidad:', lead.resumen_necesidad || 'Sin resumen disponible.'));
    col2.appendChild(crearLinea('Objeciones:', objeciones));

    infoGrid.appendChild(col1);
    infoGrid.appendChild(col2);
    card.appendChild(infoGrid);

    // Estado
    const estadoRow = document.createElement('div');
    estadoRow.className = 'lead-status-row';
    
    const estadoStrong = document.createElement('strong');
    estadoStrong.textContent = 'Estado de Gestión: ';
    
    const estadoSpan = document.createElement('span');
    estadoSpan.className = 'status-indicator';
    estadoSpan.style.color = colorEstado;
    estadoSpan.textContent = estado;
    
    estadoRow.appendChild(estadoStrong);
    estadoRow.appendChild(estadoSpan);
    card.appendChild(estadoRow);

    // Propuesta editable
    const propuestaArea = document.createElement('div');
    propuestaArea.className = 'proposal-area';

    const label = document.createElement('label');
    const labelStrong = document.createElement('strong');
    labelStrong.textContent = 'Propuesta de Acción Recomendada (Editable):';
    label.appendChild(labelStrong);
    propuestaArea.appendChild(label);

    const textarea = document.createElement('textarea');
    textarea.rows = 3;
    textarea.value = lead.accion_sugerida_ejecutivo || 'Contactar al cliente.';
    propuestaArea.appendChild(textarea);
    card.appendChild(propuestaArea);

    // Botones
    const actionArea = document.createElement('div');
    actionArea.className = 'lead-actions';

    const leftGroup = document.createElement('div');
    leftGroup.style.display = 'flex';
    leftGroup.style.gap = '8px';

    const btnAprobar = document.createElement('button');
    btnAprobar.className = 'btn-action btn-approve';
    btnAprobar.textContent = 'Aprobar Propuesta';
    btnAprobar.addEventListener('click', () => takeAction(lead.id, 'APROBADO', textarea.value));

    const btnEditar = document.createElement('button');
    btnEditar.className = 'btn-action btn-edit';
    btnEditar.textContent = 'Guardar Edición';
    btnEditar.addEventListener('click', () => takeAction(lead.id, 'EDITADO', textarea.value));

    const btnRechazar = document.createElement('button');
    btnRechazar.className = 'btn-action btn-reject';
    btnRechazar.textContent = 'Rechazar';
    btnRechazar.addEventListener('click', () => takeAction(lead.id, 'RECHAZADO', textarea.value));

    leftGroup.appendChild(btnAprobar);
    leftGroup.appendChild(btnEditar);
    leftGroup.appendChild(btnRechazar);

    const rightGroup = document.createElement('div');
    const btnEliminar = document.createElement('button');
    btnEliminar.className = 'btn-action btn-delete';
    btnEliminar.textContent = 'Eliminar Registro';
    btnEliminar.addEventListener('click', () => deleteLead(lead.id));
    rightGroup.appendChild(btnEliminar);

    actionArea.appendChild(leftGroup);
    actionArea.appendChild(rightGroup);
    card.appendChild(actionArea);

    return card;
}

async function takeAction(leadId, accion, textoAccion) {
    try {
        const res = await fetchAutenticado(`/api/leads/${leadId}/action`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: accion, accion_sugerida: textoAccion })
        });
        const data = await res.json();
        if (!res.ok) {
            alert(`Error: ${data.error || 'No se pudo registrar la acción.'}`);
            return;
        }
        alert(`Acción registrada: ${accion}\n\n(En un sistema bancario real, esto enviaría la propuesta de inmediato al correo del cliente).`);
        loadLeads();
    } catch (e) {
        if (e.message !== 'Sesión no válida') alert('Error al actualizar el estado en el servidor.');
    }
}

async function deleteLead(leadId) {
    if (!confirm('¿Estás seguro de que deseas eliminar este prospecto del CRM de forma definitiva?')) return;
    try {
        const res = await fetchAutenticado(`/api/leads/${leadId}`, { method: 'DELETE' });
        const data = await res.json();
        if (!res.ok) {
            alert(`Error: ${data.error || 'No se pudo eliminar el registro.'}`);
            return;
        }
        loadLeads();
    } catch (e) {
        if (e.message !== 'Sesión no válida') alert('Error al intentar eliminar el registro.');
    }
}

document.getElementById('admin-pass').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') loginAdmin();
});

if (obtenerToken()) {
    mostrarDashboard();
}
