# 🤖 Sistema Agéntico Comercial & Tutor IA - Track 1
**Hackathon de Agentes Financieros IA - Agentic Scale Ecuador Tech Week 2026**[cite: 1, 2]

---

## 🌟 Competencia por Premio Especial
> **✨ Best Use of Google Gemini:** Este proyecto hace uso intensivo del nuevo SDK oficial (`@google/genai`) y la **API de Interactions** con el modelo de vanguardia `gemini-3.5-flash`, aprovechando capacidades de memoria de servidor con estado (`previous_interaction_id`), generación estructurada de JSON y razonamiento de baja latencia.

---

## 📋 1. Información del Reto y Alcance
* **Track Asignado:** Track 1: Inteligencia Conversacional para Ventas y Gestión de Clientes (CRM)[cite: 1, 2].
* **Tipo de Negocio al que aplica:** Entidades financieras, bancos y cooperativas en Ecuador que ofrecen productos de inversión corporativos (**B2B**) y personales (**B2C**)[cite: 1, 2].
* **Problema que resuelve:** Capta, califica y nutre prospectos 24/7 en lenguaje natural mientras registra el contexto comercial y educativo directamente en un CRM, eliminando la fricción de los formularios tradicionales[cite: 1].

---

## 🏛️ 2. Diagrama de Arquitectura Agéntica
El sistema sigue una arquitectura desacoplada con separación clara de lógica, control de continuidad conversacional en el servidor y una capa de supervisión humana obligatoria:

```text
+-------------------------------------------------------------------------+
|                        CAPA DE CANALES / FRONTEND                       |
|   +-------------------------------+   +-----------------------------+   |
|   |  Portal Usuario / Prospecto   |   |   Bandeja Ejecutivo (CRM)   |   |
|   |  (HTML5 / CSS3 / JS - SPA)    |   |  (Control Human-in-the-Loop)|   |
+---+---------------+---------------+---+--------------+--------------+---+
                    |                                  ^
                    | REST API (JSON)                  | REST API (JSON)
                    v                                  |
+-------------------------------------------------------------------------+
|                     BACKEND AGÉNTICO (Node.js / Express)                |
|   +-----------------------------------------------------------------+   |
|   |                          Controlador API                        |   |
|   +--------------------------------+--------------------------------+   |
|                                    |                                    |
|         +--------------------------+--------------------------+         |
|         v                                                     v         |
|  +------------------------------+     +------------------------------+  |
|  |     Módulo Conversacional    |     |  Módulo de Calificación CRM  |  |
|  |   y Tutor Futuro Academy     |     |    (JSON Structured Output)  |  |
|  +--------------+---------------+     +---------------+--------------+  |
+-----------------|-------------------------------------|-----------------+
                  |                                     |
                  v                                     v
+-------------------------------------------------------------------------+
|                  CEREBRO IA & ALMACENAMIENTO DE DATOS                   |
|   +-------------------------------+   +-----------------------------+   |
|   |     Google Gemini 3.5 Flash   |   |     Base de Datos CRM       |   |
|   |    (API de Interactions)      |   |   (crm_datos.json Simulado) |   |
+-----------------------------------+---------------------------------+---+
```[cite: 1, 2]

---

## 💼 3. ¿Cómo se integraría a un Sistema Empresarial Existente?
Este producto está diseñado para ser de fácil adopción en arquitecturas bancarias reales mediante 3 puntos de integración[cite: 2]:
1. **Canal Omnicanal:** El frontend conversacional se puede embeber vía Webhook o WebSocket en la banca virtual web, app móvil, WhatsApp o kioscos físicos de la institución[cite: 1].
2. **Conexión CRM Enterprise:** El endpoint `/api/evaluate` exporta un objeto JSON puro y normalizado que se conecta directamente a APIs de **Salesforce Financial Services, HubSpot o Microsoft Dynamics** vía conectores REST[cite: 1, 2].
3. **Control y Regulación (Human-in-the-Loop):** Cumpliendo con estrictas normativas financieras locales, ninguna acción sensible (como aperturas de fondos o transferencias) se ejecuta automáticamente en producción[cite: 1, 2]. La IA actúa como un analista pre-ventas que deposita propuestas en una bandeja de entrada, donde el asesor humano tiene el control absoluto para **[Aprobar]**, **[Editar]** o **[Rechazar]**[cite: 1].

---

## 🛡️ 4. Mitigación de Riesgos y Antialucinación
* **Grounding Estricto:** El Tutor IA cuenta con un *System Instruction* que le prohibe terminantemente inventar tasas, legales o datos fuera de la base de conocimiento de **Futuro Academy**[cite: 1, 2].
* **Estilo Conversacional Limpio:** La IA referencia la academia de forma natural en su discurso sin exponer etiquetas técnicas ni corchetes al cliente[cite: 1].
* **Protección de Datos:** El sistema solicita el consentimiento explícito del cliente antes de perfilar su información financiera[cite: 1].

---

## 🧪 5. Evidencia de Calidad y Pruebas (Testing - Nivel Mínimo/Básico)
Se ejecutaron pruebas sistemáticas manuales y automáticas sobre el flujo de extremo a extremo[cite: 1, 2]:
* **Prueba de Continuidad:** Se verificó que el servidor recuerde el contexto al pasar el `previous_interaction_id`, evitando alucinaciones por pérdida de memoria[cite: 2].
* **Validación de Señal Oculta:** Se probó que el botón de envío al CRM solo aparezca de forma dinámica cuando la IA emite la directiva de calificación completa (`||LEAD_LISTO||`), evitando envíos prematuros de leads vacíos[cite: 1].
* **Resiliencia de Datos:** Se implementaron validaciones de tipado en el backend que asignan valores por defecto si un lead llega incompleto, garantizando **cero errores de `undefined`** en el panel del ejecutivo.
* **Pruebas de Seguridad en la Bandeja:** Se validó la restricción de acceso con credenciales (`admin`/`admin`), así como las acciones de actualización de estado y la eliminación física de registros vía método HTTP `DELETE`[cite: 1].

---

## 🚀 6. Guía Rápida de Instalación y Demo Local
1. **Clonar el repositorio:**
   ```bash
   git clone [https://github.com/mariollaguno19-sketch/hacktaws.git](https://github.com/mariollaguno19-sketch/hacktaws.git)
   cd hacktaws
Instalar dependencias:

npm install

Configurar la API Key de Gemini:
Crea un archivo .env en la raíz y agrega tu clave de Google AI Studio:

GEMINI_API_KEY="tu_api_key_aqui"

Iniciar el servidor:

node server.js