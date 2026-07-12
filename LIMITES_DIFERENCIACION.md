# Límites del Sistema y Estrategia de Diferenciación

> **Proyecto:** Sistema Agéntico Comercial & Tutor IA — Track 1
> **Hackathon:** Agentic Scale Ecuador Tech Week 2026 — TAWS
> **Versión:** 1.0

---

## 1. ¿Qué PUEDE Hacer el Sistema?

| Capacidad | Detalle |
|---|---|
| Conversación natural 24/7 | El prospecto puede chatear en lenguaje natural para recibir asesoría y calificación |
| Tutoría financiera educativa | Explica conceptos de inversión basándose en la base de conocimiento de Futuro Academy |
| **Quiz de 3 preguntas** | El Tutor IA genera un mini-quiz de opción múltiple para evaluar comprensión |
| **Ruta de aprendizaje** | El Tutor IA sugiere una ruta breve de 2 pasos después de explicar |
| Calificación de prospectos (B2B/B2C) | La IA evalúa tipo de cliente, presupuesto, urgencia y perfil de riesgo |
| **Preguntas configurables** | El ejecutivo puede configurar las preguntas de calificación desde el panel admin |
| **Señal comercial con consentimiento** | Registra el tema de interés del usuario solo si autoriza explícitamente |
| Generación de resumen estructurado | Al finalizar, produce un JSON normalizado con todos los datos del lead |
| Propuesta de acción al ejecutivo | La IA sugiere qué hacer (ej. "Agendar reunión") para que el humano decida |
| Almacenamiento local de datos | Los leads se guardan en `crm_datos.json` en el servidor |
| Eliminación de registros | El ejecutivo puede borrar leads del CRM |
| Edición de propuestas | El ejecutivo puede modificar la acción sugerida antes de aprobar |

---

## 2. ¿Qué NO PUEDE Hacer el Sistema (y Por Qué)?

| Restricción | Motivo | Cómo se Aplica |
|---|---|---|
| **NO ejecuta transacciones financieras** | Cumplimiento regulatorio (Superintendencia de Bancos) | Human-in-the-loop obligatorio — la IA solo propone, el humano aprueba |
| **NO da tasas ni números concretos** | Riesgo de alucinación financiera | System Instruction prohíbe inventar datos fuera de la base de conocimiento |
| **NO perfila sin consentimiento** | LOPDP Ecuador — Art. 8 | Checkbox obligatorio en login + señal comercial requiere autorización explícita |
| **NO usa señal comercial sin autorización** | LOPDP Ecuador — Art. 8 | La IA pregunta si el usuario autoriza compartir su interés como señal |
| **NO almacena en cloud externo** | Privacidad de datos financieros | Todo queda en `crm_datos.json` local (servidor propio) |
| **NO expone datos a terceros** | Confidencialidad bancaria | No hay webhooks ni APIs externas de datos compartidos |
| **NO fuerza ventas** | Enfoque educativo y consultivo | La IA empodera al usuario con conocimiento antes de vender |
| **NO funciona sin conexión a Gemini** | Dependencia del modelo | Requiere API key de Google AI Studio |

---

## 3. Análisis de Competencia (Escenario del Hackathon)

### 3.1. ¿Qué Van a Hacer los Demás?

Según el patrón típico de proyectos en hackathones de agentes financieros:

| Enfoque Común | Descripción |
|---|---|
| **Chatbot básico + formulario** | Bot que deriva a un formulario Google Forms — desconexión total |
| **Agente que ejecuta** | Sistemas que intentan automatizar la venta completa (peligro regulatorio) |
| **CRUD sin IA** | Panel CRM tradicional sin inteligencia conversacional |
| **IA genérica sin grounding** | Chatbot con Gemini básico que alucina tasas y datos |
| **Sin consentimiento** | Recolectan datos sin aviso de privacidad |
| **Sin human-in-the-loop** | Flujo completamente automatizado (no viable en banca real) |

### 3.2. Nuestra Diferenciación (Ventajas Competitivas)

| Diferencial | Nosotros | La Competencia |
|---|---|---|
| **Grounding estricto** | Base de conocimiento acotada + System Instruction que prohíbe alucinar | Suelen dejar al modelo hablar sin restricciones |
| **Señal oculta `||LEAD_LISTO||`** | La IA decide cuándo el lead está calificado — no el usuario rellenando un formulario | Formularios fijos o derivación manual |
| **Quiz y ruta de aprendizaje** | El Tutor IA evalúa con 3 preguntas y sugiere ruta de aprendizaje | Solo explican, no evalúan comprensión |
| **Señal comercial con consentimiento** | Registra tema de interés solo con autorización explícita del usuario | No piden consentimiento o no registran señal |
| **Preguntas configurables** | El ejecutivo puede cambiar las preguntas de calificación en tiempo real | Preguntas fijas o inexistentes |
| **Human-in-the-loop real** | El ejecutivo aprueba, edita o rechaza — la IA nunca actúa sola | Automatización total (inviable en banca real) |
| **Tutoría educativa primero** | Enseña antes de vender — el prospecto aprende y confía | Enfocados solo en captura de lead frío |
| **JSON estructurado + protección anti-undefined** | Datos normalizados listos para CRM enterprise (Salesforce, HubSpot) | Datos sueltos sin estructura |
| **Consentimiento + cumplimiento LOPDP** | Marco legal documentado y aplicado desde el diseño | Sin consideraciones legales |
| **Eliminación de datos** | El ejecutivo puede borrar físicamente registros | Sin función de borrado |
| **Interfaz de supervisión (bandeja CRM)** | Panel completo para que el ejecutivo gestione | Sin interfaz de administración |

---

## 4. Argumento de Venta (Pitch Diferenciador)

> **"No somos un chatbot que vende. Somos un tutor que educa, califica y prepara leads para que el ejecutivo cierre con información perfecta."**

Mientras otros equipos construyen agentes que intentan reemplazar al asesor humano (inviable por regulación), nosotros construimos un **sistema que potencia al asesor humano**:
1. La IA educa al prospecto → genera confianza
2. La IA califica al prospecto → ahorra tiempo al ejecutivo
3. El humano aprueba la propuesta → cumple con la regulación
4. Los datos están limpios y estructurados → listos para cualquier CRM

---

## 5. Matriz FODA

| Fortalezas | Oportunidades |
|---|---|
| Grounding + anti-alucinación | Sector financiero ecuatoriano busca adopción de IA responsable |
| Human-in-the-loop desde el diseño | Regulación LOPDP reciente — ser pioneros en cumplimiento |
| Código modular y documentado | Puede escalarse a WhatsApp, banca web, kioscos |
| JSON listo para CRM enterprise | Integración con Salesforce/HubSpot |

| Debilidades | Amenazas |
|---|---|
| Autenticación básica (admin/admin) — débil para producción | Equipos con más experiencia en integración bancaria real |
| Almacenamiento en JSON (no BD real) | Equipos que usen bases de datos SQL/NoSQL |
| Sin conexión a Gemini no funciona | Dependencia de API key externa |
| UI básica (sin framework) | Equipos con React/Angular |

---

## 6. Recomendaciones para la Demo

1. **Menciona el cumplimiento LOPDP** al inicio — los jueces valoran la madurez regulatoria
2. **Demuestra la señal oculta `||LEAD_LISTO||`** — muestra que la IA detecta cuándo un lead está listo SIN que el usuario llene un formulario
3. **Muestra el quiz del Tutor IA** — pídele a la IA que explique un concepto y luego que evalúe con las 3 preguntas
4. **Muestra la configuración de preguntas** — en el panel admin, cambia las preguntas y reinicia el chat para mostrar que se actualizan
5. **Enfatiza el consentimiento de señal comercial** — demuestra que el usuario autoriza antes de compartir su interés
6. **Muestra el human-in-the-loop** — el ejecutivo aprueba/rechaza en vivo
7. **Enfatiza "No alucinamos"** — grounding + base de conocimiento acotada es un diferenciador enorme
8. **Prepárate para la pregunta:** "¿Qué pasa si la IA se equivoca?" → Respuesta: "El humano decide, la IA solo propone"
