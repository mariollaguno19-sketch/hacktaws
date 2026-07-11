import streamlit as st
import json
import os
from backend_ia import enviar_mensaje_agente, generar_reporte_para_crm

# Configuración de la página web
st.set_page_config(
    page_title="IA Comercial & CRM - Track 1",
    page_icon="🤖",
    layout="wide"
)

ARCHIVO_CRM = "crm_datos.json"

# Funciones auxiliares para manejar la base de datos simulada[cite: 1, 2]
def cargar_datos_crm():
    if not os.path.exists(ARCHIVO_CRM):
        return []
    with open(ARCHIVO_CRM, "r", encoding="utf-8") as f:
        try:
            return json.load(f)
        except:
            return []

def guardar_datos_crm(datos):
    with open(ARCHIVO_CRM, "w", encoding="utf-8") as f:
        json.dump(datos, f, indent=4, ensure_ascii=False)

# Inicializar variables de sesión para el Chat
if "mensajes_chat" not in st.session_state:
    st.session_state.mensajes_chat = []
if "interaction_id" not in st.session_state:
    st.session_state.interaction_id = None

# Título Principal
st.title("🤖 Sistema Agéntico Comercial & Tutor IA (Track 1)")
st.markdown("---")

# Crear 2 Pestañas en la interfaz web[cite: 1]
tab_cliente, tab_ejecutivo = st.tabs(["💬 Pestaña 1: Chat del Prospecto (HU 1 & HU 2)", "👔 Pestaña 2: Bandeja de Gestión Comercial (HU 3)"])

# =====================================================================
# PESTAÑA 1: CHAT CON EL PROSPECTO / TUTOR ACADEMY[cite: 1]
# =====================================================================
with tab_cliente:
    st.subheader("Interacción en Vivo con el Agente Comercial y Tutor Futuro Academy")
    
    # Contenedor para mostrar el historial de chat
    for msj in st.session_state.mensajes_chat:
        with st.chat_message(msj["rol"]):
            st.markdown(msj["texto"])
            
    # Entrada de texto del usuario
    if prompt_usuario := st.chat_input("Escribe tu consulta financiera aquí... (Ej: Hola, soy empresa B2B y quiero invertir)"):
        # Mostrar mensaje del usuario en UI
        st.session_state.mensajes_chat.append({"rol": "user", "texto": prompt_usuario})
        with st.chat_message("user"):
            st.markdown(prompt_usuario)
            
        # Llamar al backend agéntico con Gemini
        with st.chat_message("assistant"):
            with st.spinner("El Agente IA está analizando tu perfil y consultando Futuro Academy..."):
                respuesta_ia, nuevo_id = enviar_mensaje_agente(prompt_usuario, st.session_state.interaction_id)
                st.session_state.interaction_id = nuevo_id
                st.markdown(respuesta_ia)
                st.session_state.mensajes_chat.append({"rol": "assistant", "texto": respuesta_ia})

    st.markdown("---")
    col1, col2 = st.columns([1, 2])
    with col1:
        if st.button("✨ Evaluar Lead y Enviar al CRM (Simular Cierre)", type="primary", use_container_width=True):
            if st.session_state.interaction_id:
                with st.spinner("Generando reporte de calificación con Pydantic y guardando en el CRM..."):
                    nuevo_reporte = generar_reporte_para_crm(st.session_state.interaction_id)
                    
                    # Guardar en crm_datos.json[cite: 1]
                    datos_actuales = cargar_datos_crm()
                    datos_actuales.append(nuevo_reporte)
                    guardar_datos_crm(datos_actuales)
                    
                    st.success("¡Lead procesado exitosamente! Ve a la pestaña '👔 Bandeja de Gestión Comercial' para ver el análisis.")
            else:
                st.warning("¡Primero debes iniciar una conversación en el chat!")
    with col2:
        if st.button("🗑️ Reiniciar Conversación", use_container_width=True):
            st.session_state.mensajes_chat = []
            st.session_state.interaction_id = None
            st.rerun()

# =====================================================================
# PESTAÑA 2: BANDEJA DEL EJECUTIVO (HUMAN-IN-THE-LOOP)[cite: 1, 2]
# =====================================================================
with tab_ejecutivo:
    st.subheader("Bandeja de Leads Calificados y Supervisión Comercial")
    st.markdown("Las acciones reguladas o sensibles quedan como **propuesta o solicitud de aprobación**[cite: 1, 2]. El ejecutivo debe revisar la acción sugerida por la IA antes de enviarla[cite: 1].")
    
    leads = cargar_datos_crm()
    
    if not leads:
        st.info("📭 No hay leads registrados aún. Ve a la Pestaña 1, conversa con el agente y presiona 'Evaluar Lead y Enviar al CRM'.")
    else:
        for index, lead in enumerate(reversed(leads)):
            # Índice original en el archivo para poder editarlo
            idx_real = len(leads) - 1 - index
            
            with st.expander(f"📌 Lead #{idx_real + 1} | Tipo: {lead['tipo_cliente']} | Prioridad: {lead['puntaje_prioridad']}/10 | Estado: {lead.get('estado_aprobacion', 'Pendiente')}", expanded=True):
                col_i, col_d = st.columns([2, 1])
                
                with col_i:
                    st.write(f"**💡 Interés Principal:** {lead['interes_principal']}")
                    st.write(f"**📝 Resumen de Necesidad:** {lead['resumen_necesidad']}")
                    st.write(f"**🛡️ Objeciones Detectadas:** {', '.join(lead['objeciones_detectadas'])}")
                    st.write(f"**📊 Etapa del Embudo:** `{lead['etapa_embudo']}`")
                    
                    st.markdown("---")
                    st.markdown("**🤖 Acción Propuesta por la IA para el Cliente:**")
                    # Campo de texto editable para cumplir con el requisito "Editar" de HU 3[cite: 1]
                    accion_editada = st.text_area("Puedes modificar la propuesta antes de aprobarla:", value=lead['accion_sugerida_ejecutivo'], key=f"txt_{idx_real}")
                
                with col_d:
                    st.write("### Acción del Ejecutivo")
                    st.write("Selecciona una decisión:")
                    
                    # Botones de control humano obligatorios (HU 3)[cite: 1]
                    if st.button("✅ Aprobar Acción", key=f"aprob_{idx_real}", type="primary", use_container_width=True):
                        leads[idx_real]['accion_sugerida_ejecutivo'] = accion_editada
                        leads[idx_real]['estado_aprobacion'] = "✅ APROBADO (Enviado al cliente)"
                        guardar_datos_crm(leads)
                        st.success("¡Acción aprobada y ejecutada!")
                        st.rerun()
                        
                    if st.button("✏️ Guardar Edición", key=f"edit_{idx_real}", use_container_width=True):
                        leads[idx_real]['accion_sugerida_ejecutivo'] = accion_editada
                        leads[idx_real]['estado_aprobacion'] = "✏️ EDITADO POR EJECUTIVO"
                        guardar_datos_crm(leads)
                        st.info("¡Propuesta editada correctamente!")
                        st.rerun()
                        
                    if st.button("❌ Rechazar Propuesta", key=f"rech_{idx_real}", use_container_width=True):
                        leads[idx_real]['estado_aprobacion'] = "❌ RECHAZADO"
                        guardar_datos_crm(leads)
                        st.error("Propuesta rechazada.")
                        st.rerun()