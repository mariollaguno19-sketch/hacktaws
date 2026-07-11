import os
import json
from dotenv import load_dotenv
from google import genai
from pydantic import BaseModel, Field
from typing import List, Optional

# 1. Cargar la API Key desde el archivo .env
load_dotenv()
if not os.getenv("GEMINI_API_KEY"):
    raise ValueError("¡Error! No se encontró GEMINI_API_KEY en el archivo .env")

# 2. Inicializar el nuevo cliente de la API de Interactions
client = genai.Client()

# 3. Base de Conocimiento para Futuro Academy (HU 2)
FUENTE_FUTURO_ACADEMY = """
[Fuente: Manual de Inversiones - Futuro Academy 2026]
1. Renta Fija: Inversiones donde se conoce la rentabilidad de antemano (ej. Bonos, Pólizas de acumulación). Bajo riesgo.
2. Fondos Mutuos: Aporte colectivo de dinero gestionado por profesionales para diversificar inversiones en diferentes activos.
3. Regla de Oro: Nunca inviertas dinero que necesites para tu gasto corriente mensual o fondo de emergencia.
"""

# 4. Definir el esquema Pydantic para los resultados estructurados del CRM (HU 1 y HU 3)
class ReporteCRM(BaseModel):
    tipo_cliente: str = Field(description="B2B o B2C (inferido o detectado en el chat)")
    interes_principal: str = Field(description="Tema financiero principal en el que mostró interés")
    puntaje_prioridad: int = Field(description="Número del 1 al 10 calculando urgencia, presupuesto e interés")
    etapa_embudo: str = Field(description="Etapa del embudo: Prospección, Calificado, Nutrición o Listo para asesor")
    resumen_necesidad: str = Field(description="Breve resumen de 2 líneas con la necesidad del prospecto")
    objeciones_detectadas: List[str] = Field(description="Lista de dudas, temores o frenos detectados")
    accion_sugerida_ejecutivo: str = Field(description="Propuesta clara de siguiente paso (Ej. Agendar reunión, derivar a especialista)")
    requiere_aprobacion_humana: bool = Field(default=True, description="Siempre True para garantizar supervisión humana en finanzas")

# 5. Instrucciones iniciales y personalidad del agente
instrucciones_sistema = f"""
Eres un Agente Comercial e IA Tutor Financiero para una entidad financiera en Ecuador.
Tus responsabilidades:
1. CALIFICACIÓN (CRM): Identifica amablemente si el usuario es cliente B2B (empresa) o B2C (persona individual) y haz preguntas breves para entender su interés, presupuesto, perfil y urgencia.
2. TUTORÍA (Futuro Academy): Si el usuario quiere aprender de inversiones, explícale de forma sencilla BASÁNDOTE ÚNICAMENTE en esta base de conocimiento:
{FUENTE_FUTURO_ACADEMY}
REGLA OBLIGATORIA: Siempre que expliques un concepto financiero, debes incluir al final la cita textual: "[Fuente: Manual de Inversiones - Futuro Academy 2026]".
3. CONSENTIMIENTO: Si el cliente muestra interés en un tema financiero, pídele permiso amablemente para registrar ese interés en su ficha.

Mantén un tono profesional, empático, claro y proactivo. No inventes datos financieros fuera de la fuente asignada.
"""

# Función para manejar la conversación multi-turno CON ESTADO en el servidor
def conversar(mensaje: str, previous_id: Optional[str] = None) -> str:
    print(f"\n👤 Usuario: {mensaje}")
    
    # Si es el primer turno, inyectamos las instrucciones y la base de conocimiento
    if previous_id is None:
        input_data = f"{instrucciones_sistema}\n\n--- INICIO DE LA CONVERSACIÓN ---\nUsuario: {mensaje}"
    else:
        input_data = mensaje
        
    # Llamada al modelo con estado (pasando previous_interaction_id)
    interaction = client.interactions.create(
        model="gemini-3.5-flash",
        input=input_data,
        previous_interaction_id=previous_id
    )
    
    print(f"🤖 Agente IA: {interaction.output_text}")
    return interaction.id # Retornamos el ID para encadenar el siguiente turno

# Función para generar la salida estructurada usando Pydantic
def generar_reporte_crm(previous_id: str) -> ReporteCRM:
    print("\n--- ⚙️ GENERANDO REPORTE ESTRUCTURADO PARA EL CRM (USANDO PYDANTIC) ---")
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
    
    # Validamos y convertimos el texto JSON devuelto directamente en nuestro modelo de Pydantic
    reporte = ReporteCRM.model_validate_json(interaction.output_text)
    return reporte

# =====================================================================
# SIMULACIÓN DE PRUEBA (De extremo a extremo)
# =====================================================================
if __name__ == "__main__":
    print("🚀 Iniciando Simulación del Agente CRM con API de Interactions (Ubuntu)...")
    
    # Turno 1: Saludo e identificación de empresa o persona (HU 1)
    id_conversa = conversar("Hola, soy emprendedor. Tengo una pequeña empresa de logística (B2B) y quiero invertir los excedentes de caja de mi negocio.")
    
    # Turno 2: Tutoría financiera con citación obligatoria y consentimiento (HU 2)
    id_conversa = conversar("¿Qué son los fondos mutuos? ¿Son seguros? Por favor guarda esto en mi ficha de cliente para que lo sepa el asesor.", previous_id=id_conversa)
    
    # Turno 3: Datos de presupuesto y urgencia
    id_conversa = conversar("Tengo un excedente de $10,000 dólares y quisiera agendar una reunión esta misma semana, aunque me da un poco de miedo el riesgo.", previous_id=id_conversa)
    
    # Generación de la propuesta para la bandeja del ejecutivo (HU 3)
    reporte_final = generar_reporte_crm(previous_id=id_conversa)
    
    print("\n📋 BANDEJA DEL EJECUTIVO COMERCIAL (JSON Estructurado Validado con Pydantic):")
    print(reporte_final.model_dump_json(indent=4))
    print("\n💡 NOTA DE AUDITORÍA: El sistema genera una propuesta y espera que el humano presione: [APROBAR ACCIÓN] | [EDITAR] | [RECHAZAR]")