# 🤖 Synapse — Agente Comercial IA & Tutor Financiero (Track 1)
**Hackathon de Agentes Financieros IA - Agentic Scale Ecuador Tech Week 2026**[cite: 1, 2]

---

## 🎯 Definición de Producto

> **Synapse es para cooperativas de ahorro y crédito y casas de valores cuyos ejecutivos comerciales hoy pierden horas respondiendo mensajes de curiosos y persiguiendo formularios vacíos. Con Synapse, cada mañana abren su bandeja y encuentran solo prospectos ya calificados — con monto, perfil de riesgo y urgencia — listos para cerrar en una llamada.**

* **Qué es:** la capa conversacional de preventa que alimenta tu CRM. No compite con el CRM: hace el trabajo que el CRM no hace (capturar y calificar 24/7 conversando) y entrega registros estructurados listos para integrarse a Salesforce, HubSpot o el CRM propio de la institución.
* **Qué NO es:** un asesor de inversión autónomo. Synapse brinda **educación financiera general** y calificación comercial; toda recomendación y acción sensible la valida un **ejecutivo humano** (human-in-the-loop). Este diseño mantiene el producto fuera del perímetro de la asesoría de inversión regulada.

## 🔑 Credenciales de Evaluación (solo demo)

Para el jurado / evaluadores del demo local:
* **Panel del Ejecutivo (CRM):** usuario `admin` / contraseña `admin` *(solo en modo simulado; en la base real las contraseñas son hashes bcrypt)*.
* La sesión de admin usa **cookies httpOnly** (el token nunca es accesible desde JavaScript), con expiración de 8 horas y bloqueo por fuerza bruta.

---

## 🌟 Competencia por Premio Especial
> **✨ Best Use of Google Gemini:** Este proyecto hace uso intensivo del nuevo SDK oficial (`@google/genai`) y la **API de Interactions** con el modelo de vanguardia `gemini-3.5-flash`, aprovechando capacidades de memoria de servidor con estado (`previous_interaction_id`), generación estructurada de JSON y razonamiento de baja latencia.

---

## 📋 1. Información del Reto y Alcance
* **Track Asignado:** Track 1: Inteligencia Conversacional para Ventas y Gestión de Clientes (CRM)[cite: 1, 2].
* **Nicho objetivo:** Cooperativas de ahorro y crédito y casas de valores en Ecuador que ofrecen productos de inversión corporativos (**B2B**) y personales (**B2C**)[cite: 1, 2].
* **Problema que resuelve:** Capta, califica y nutre prospectos 24/7 en lenguaje natural mientras registra el contexto comercial y educativo directamente en un CRM, eliminando la fricción de los formularios tradicionales[cite: 1]. El ejecutivo deja de calificar leads fríos a mano y recibe solo prospectos accionables.

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
|  |        y Tutor Synapse        |     |    (JSON Structured Output)  |  |
|  +--------------+---------------+     +---------------+--------------+  |
+-----------------|-------------------------------------|-----------------+
                  |                                     |
                  v                                     v
+-------------------------------------------------------------------------+
|                  CEREBRO IA & ALMACENAMIENTO DE DATOS                   |
|   +-------------------------------+   +-----------------------------+   |
|   |     Google Gemini 3.5 Flash   |   |     Base de Datos CRM       |   |
|   |    (API de Interactions)      |   |   (Supabase / Simulado)     |   |
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
* **Grounding Estricto:** El Tutor IA cuenta con un *System Instruction* que le prohibe terminantemente inventar tasas, legales o datos fuera de la base de conocimiento de **Synapse**[cite: 1, 2].
* **Estilo Conversacional Limpio:** La IA referencia la academia de forma natural en su discurso sin exponer etiquetas técnicas ni corchetes al cliente[cite: 1].
* **Protección de Datos:** El sistema solicita el consentimiento explícito del cliente antes de perfilar su información financiera[cite: 1].

---

## 🧪 5. Evidencia de Calidad y Pruebas (Testing - Nivel Mínimo/Básico)
Se ejecutaron pruebas sistemáticas manuales y automáticas sobre el flujo de extremo a extremo[cite: 1, 2]:
* **Prueba de Continuidad:** Se verificó que el servidor recuerde el contexto al pasar el `previous_interaction_id`, evitando alucinaciones por pérdida de memoria[cite: 2].
* **Validación de Señal Oculta:** Se probó que el botón de envío al CRM solo aparezca de forma dinámica cuando la IA emite la directiva de calificación completa (`||LEAD_LISTO||`), evitando envíos prematuros de leads vacíos[cite: 1].
* **Resiliencia de Datos:** Se implementaron validaciones de tipado en el backend que asignan valores por defecto si un lead llega incompleto, garantizando **cero errores de `undefined`** en el panel del ejecutivo.
* **Pruebas de Seguridad en la Bandeja:** La bandeja del ejecutivo está protegida con **autenticación real en el servidor**: las credenciales se verifican contra Supabase (contraseñas hasheadas con **bcrypt**) y cada sesión usa un token con expiración de 8 horas. Todos los endpoints administrativos (`GET/POST/DELETE /api/leads`) exigen el token vía cabecera `Authorization: Bearer`[cite: 1].
* **Protección contra XSS:** El panel del ejecutivo renderiza todos los datos del cliente con `textContent` (nunca `innerHTML`), evitando inyección de scripts a través de la conversación o el correo del prospecto.
* **Límite de peticiones (Rate Limiting):** Los endpoints de chat, evaluación y login tienen límites por IP para proteger la cuota de la API de Gemini y prevenir ataques de fuerza bruta.
* **Persistencia real:** Los leads, usuarios y sesiones viven en **Supabase (PostgreSQL)** con Row Level Security activado; solo el backend puede acceder a los datos con su clave secreta.

---

## 🚀 6. Guía Rápida de Instalación y Demo Local
1. **Clonar el repositorio:**
   ```bash
   git clone [https://github.com/mariollaguno19-sketch/hacktaws.git](https://github.com/mariollaguno19-sketch/hacktaws.git)
   cd hacktaws
2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar las variables de entorno:**
   Copia `.env.example` a `.env` y completa los valores:
   ```env
   GEMINI_API_KEY="tu_api_key_de_google_ai_studio"
   SUPABASE_URL="https://tu-proyecto.supabase.co"
   SUPABASE_SECRET_KEY="tu_clave_secreta_de_supabase"
   ```
   * La `GEMINI_API_KEY` se obtiene en [Google AI Studio](https://aistudio.google.com/apikey).
   * La `SUPABASE_SECRET_KEY` (service role) se copia desde el dashboard de Supabase → Settings → API Keys.
   * Para probar sin API key de Gemini, usa `MOCK_GEMINI="true"` (respuestas simuladas).

4. **Iniciar el servidor:**
   ```bash
   node server.js
   ```

5. **Acceso al CRM:** El usuario ejecutivo se administra en la tabla `usuarios_admin` de Supabase (contraseña hasheada con bcrypt; nunca en texto plano ni en el código).

## Calidad, Confiabilidad y Testing Automatizado

Para garantizar la resiliencia del software en un entorno bancario real y cumplir con los estándares técnicos más exigentes, el proyecto implementa una suite de pruebas automatizadas utilizando **Jest** y **Supertest**, cubriendo dos niveles estructurales de la arquitectura:

### 1. Nivel Intermedio: Pruebas Unitarias de Lógica Crítica (`tests/unit.test.js`)
Se modularizaron y evaluaron de forma aislada las funciones financieras y regulatorias clave (ubicadas en `utils/validators.js`), garantizando cero fallos lógicos en la captación:
* **Validación de Identificación Ecuatoriana:** Verificación algorítmica estricta de Cédulas de Ciudadanía (10 dígitos) y RUCs corporativos (13 dígitos con sufijo `001`), rechazando automáticamente códigos de provincia inexistentes o formatos malformados.
* **Sanitización de Correos:** Validación de integridad y formato de emails corporativos para evitar inyecciones en la base de datos del CRM.

### 2. Nivel Básico: Pruebas de Integración Agéntica y Mocks (`tests/agent.test.js`)
Se inspeccionó el comportamiento del servidor Express y del Agente Conversacional sin depender de la latencia o disponibilidad de internet, implementando variables de entorno de aislamiento (`MOCK_GEMINI=true` y `MOCK_DATABASE=true`):
* **Coherencia Conversacional (`POST /api/chat`):** Se verifica que el agente en Node.js procese mensajes en lenguaje natural, responda al contexto (ej. inversiones B2B en Renta Fija) y mantenga la continuidad de la sesión.
* **Generación Estructurada de JSON (`POST /api/evaluate`):** Se evalúa la capacidad del sistema para consumir el historial del chat y retornar un objeto JSON estricto y tipado con el perfil de riesgo, monto estimado y la acción sugerida para el ejecutivo.
* **Protección de Endpoints (`POST /api/auth/login`):** Validación de rechazo (`401 Unauthorized`) ante intentos de acceso no autorizados a la bandeja de administración del CRM.

### 3. Suite de Historias de Usuario del Track (`tests/test_agent.test.js`)
Con el runner nativo de Node (`node --test`, sin dependencias), 9 pruebas end-to-end validan el cumplimiento de las tres Historias de Usuario del Track 1 levantando el servidor real en modo simulado:
* **Historia 1:** el agente responde coherente a un saludo, mantiene el hilo con `previous_id` y emite `||LEAD_LISTO||` al calificar.
* **Historia 2 (Tutor IA):** una pregunta educativa recibe respuesta **con fuente citada** ("Fuente: Guía Educativa Synapse — …") e invitación al **quiz de 3 preguntas** del banco controlado; y el **tema de interés solo se registra con consentimiento explícito** (sin consentimiento, el campo queda vacío aunque venga en el payload).
* **Historia 3:** la acción sugerida cae siempre en una de las tres categorías del track: **Agendar reunión / Enviar material educativo / Derivar a especialista**.
* **Seguridad:** la bandeja exige sesión (401) y el login entrega la sesión por **cookie httpOnly sin exponer el token en el cuerpo**.

### Cómo ejecutar las suites en local

```bash
# Todo (Jest + node:test), sin claves reales:
MOCK_DATABASE=true MOCK_GEMINI=true npm test

# Solo una de las suites:
npm run test:jest      # unitarias + integración (Jest/Supertest)
npm run test:agente    # historias de usuario end-to-end (node --test)
```

Resultado esperado: **7 passed (Jest) + 9 pass (node:test) = 16/16**.

### Casos probados manualmente (evidencia adicional)

| Caso | Input | Resultado esperado | Resultado |
|---|---|---|---|
| Chat educativo | "Quiero aprender qué es la renta fija" | Respuesta con "Fuente: Guía Educativa Synapse — Renta Fija" + oferta de quiz | ✅ |
| Quiz completo | 3 respuestas en el chat | Feedback inmediato por pregunta + puntaje final | ✅ |
| Consentimiento educativo | "Sí, registrar mi interés" | El lead llega al CRM con "Interés Educativo: Renta Fija (quiz: n/3) — consentido" | ✅ |
| Rechazo de consentimiento | "No, gracias" | El lead llega SIN tema educativo | ✅ |
| Calificación completa | personal → 20 mil → este mes | Botón "Transmitir perfil" desbloqueado + lead con categoría de acción | ✅ |
| Human-in-the-loop | Aprobar/Editar/Rechazar en la bandeja | Estado actualizado + traza en `historial_acciones` | ✅ |