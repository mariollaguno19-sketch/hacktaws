import os
from dotenv import load_dotenv
from google import genai
from pydantic import BaseModel, Field
from typing import List, Optional

# Cargar API Key
load_dotenv()
if not os.getenv("GEMINI_API_KEY"):
    raise ValueError("¡Error! No se encontró GEMINI_API_KEY en el archivo .env")

client = genai.Client()

# Base de conocimiento de Futuro Academy (HU 2)
FUENTE_FUTURO_ACADEMY = """
[Fuente: Manual de Inversiones - Futuro Academy 2026]
1. Renta Fija: Inversiones donde se conoce la rentabilidad de antemano (ej. Bonos, Pólizas de acumulación). Bajo riesgo.
2. Fondos Mutuos: Aporte colectivo de dinero gestionado por profesionales para diversificar inversiones en diferentes activos.
3. Regla de Oro: Nunca inviertas dinero que necesites para tu gasto corriente mensual o fondo de emergencia.
"""

# Esquema Pydantic para el CRM (HU 1 y HU 3)
class ReporteCRM(BaseModel):
    nombre_cliente: str = Field(default="Prospecto Web", description="Nombre o identificador del cliente")
    tipo_cliente: str = Field(description="B2B o B2C (inferido o detectado en el chat)")
    interes_principal: str = Field(description="Tema financiero principal en el que mostró interés")
    puntaje_prioridad: int = Field(description="Número del 1 al 10 calculando urgencia, presupuesto e interés")
    etapa_embudo: str = Field(description="Etapa del embudo: Prospección, Calificado, Nutrición o Listo para asesor")
    resumen_necesidad: str = Field(description="Breve resumen de 2 líneas con la necesidad del prospecto")
    objeciones_detectadas: List[str] = Field(description="Lista de dudas, temores o frenos detectados")
    accion_sugerida_ejecutivo: str = Field(description="Propuesta clara de siguiente paso (Ej. Agendar reunión, derivar a especialista)")
    requiere_aprobacion_humana: bool = Field(default=True, description="Siempre True para garantizar supervisión humana")
    estado_aprobacion: str = Field(default="Pendiente", description="Puede ser: Pendiente, Aprobado, Editado, Rechazado")

# Instrucciones del sistema
INSTRUCCIONES_SISTEMA = f"""
Eres un Agente Comercial e IA Tutor Financiero para una entidad financiera en Ecuador.
Tus responsabilidades:
1. CALIFICACIÓN (CRM): Identifica amablemente si el usuario es cliente B2B (empresa) o B2C (persona individual) y haz preguntas breves para entender su interés, presupuesto, perfil y urgencia.
2. TUTORÍA (Futuro Academy): Si el usuario quiere aprender de inversiones, explícale de forma sencilla BASÁNDOTE ÚNICAMENTE en esta base de conocimiento:
{FUENTE_FUTURO_ACADEMY}
REGLA OBLIGATORIA: Siempre que expliques un concepto financiero, debes incluir al final la cita textual: "[Fuente: Manual de Inversiones - Futuro Academy 2026]".
3. CONSENTIMIENTO: Si el cliente muestra interés en un tema financiero, pídele permiso amablemente para registrar ese interés en su ficha.

Mantén un tono profesional, empático, claro y proactivo. No inventes datos financieros fuera de la fuente asignada.
"""

def enviar_mensaje_agente(mensaje: str, previous_id: Optional[str] = None):
    """Envía un mensaje a la API de Interactions y devuelve el texto y el ID del turno."""
    if previous_id is None:
        input_data = f"{INSTRUCCIONES_SISTEMA}\n\n--- INICIO DE LA CONVERSACIÓN ---\nUsuario: {mensaje}"
    else:
        input_data = mensaje
        
    interaction = client.interactions.create(
        model="gemini-3.5-flash",
        input=input_data,
        previous_interaction_id=previous_id
    )
    return interaction.output_text, interaction.id

def generar_reporte_para_crm(previous_id: str) -> dict:
    """Genera el reporte estructurado en JSON y lo devuelve como diccionario para la web[cite: 1]."""
    prompt_crm = "Analiza toda nuestra conversación anterior y genera el reporte de calificación técnica y la propuesta de acción para el ejecutivo en formato estricto JSON."
    
    interaction = client.interactions.create(
        model="gemini-3.5-flash",
        input=prompt_crm,
        previous_interaction_id=previous_id,
        response_format={
            "type": "text",
            "mime_type": "application/json",
            "schema": ReporteCRM.model_json_schema()
        }
    )
    
    reporte = ReporteCRM.model_validate_json(interaction.output_text)
    return reporte.model_dump()