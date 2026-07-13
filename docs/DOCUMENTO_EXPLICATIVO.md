# Synapse — Documento Explicativo
**Hackathon de Agentes Financieros IA · Agentic Scale Ecuador Tech Week 2026 · Track 1**
Demo en vivo: https://synapse-five-khaki.vercel.app/ · Repositorio: https://github.com/mariollaguno19-sketch/hacktaws

---

## 1. Track asignado

**Track 1 — Inteligencia Conversacional para Ventas y Gestión de Clientes (CRM).**

Cobertura de las tres Historias de Usuario:

| Historia | Requisito | Cómo lo cumple Synapse |
|---|---|---|
| **H1 — Captación conversacional** | Conversar en lenguaje natural y capturar el perfil comercial | Agente "Synapse" (Gemini 2.5 Flash) con guion de calificación: B2B/B2C, monto, riesgo, horizonte y urgencia. Señal `\|\|LEAD_LISTO\|\|` desbloquea el envío al CRM |
| **H2 — Tutor IA (educación → intención)** | Educar con fuente citada y convertir el interés en señal comercial | Tutor con base de conocimiento controlada que **cita la fuente en cada respuesta** ("Fuente: Guía Educativa Synapse — [sección]"), ofrece un **quiz de 3 preguntas** con feedback inmediato, y registra el **tema de interés** en el CRM **solo con consentimiento explícito separado** |
| **H3 — Gestión ejecutiva** | Priorizar leads y sugerir la siguiente acción | Bandeja con prioridad 1-10, pipeline en dólares y **acción sugerida en una de tres categorías**: Agendar reunión / Enviar material educativo / Derivar a especialista |

## 2. Tipo de negocio al que aplica

**Cooperativas de ahorro y crédito y casas de valores en Ecuador** que venden productos de inversión (pólizas, depósitos a plazo, fondos) a clientes corporativos (B2B) y personales (B2C).

- **El dolor:** sus ejecutivos comerciales pierden horas calificando a mano consultas frías de WhatsApp y formularios web que llegan vacíos.
- **Quién paga:** la institución (no el cliente final) — suscripción por agencia o pago por lead calificado entregado.
- **Qué cambia:** el ejecutivo abre su bandeja y encuentra solo prospectos ya calificados con monto, perfil de riesgo, urgencia, objeciones e interés educativo, listos para cerrar en una llamada.

## 3. Diagrama de arquitectura agéntica

```text
+-------------------------------------------------------------------------+
|                        CAPA DE CANALES / FRONTEND                       |
|   +-------------------------------+   +-----------------------------+   |
|   |  Portal Prospecto (Chat SPA)  |   |   Bandeja Ejecutivo (CRM)   |   |
|   |  Tutor + Quiz + Consentimiento|   |  Human-in-the-Loop + Audit  |   |
+---+---------------+---------------+---+--------------+--------------+---+
                    | REST (JSON)                       ^ REST (JSON, cookie httpOnly)
                    v                                   |
+-------------------------------------------------------------------------+
|                  BACKEND AGÉNTICO (Node.js / Express / Vercel)          |
|  Rate limiting · Validación · Sanitización · CSP · Sesiones httpOnly    |
|   +----------------+  +----------------+  +---------------------------+ |
|   | Agente Comercial|  | Tutor + Banco  |  | Calificador de Leads     | |
|   | (calificación)  |  | de Quiz (H2)   |  | (JSON estructurado, H3)  | |
|   +--------+--------+  +-------+--------+  +------------+--------------+ |
+------------|-------------------|------------------------|----------------+
             v                   v                        v
+-------------------------------------------------------------------------+
|  Google Gemini 2.5 Flash        |  Supabase (PostgreSQL + RLS)          |
|  (SDK @google/genai,            |  leads · usuarios_admin · sesiones    |
|   generateContent + historial   |  historial_acciones (auditoría)      |
|   de sesión en servidor)        |  vista estadisticas_crm (KPIs)       |
+-------------------------------------------------------------------------+
```

**Flujo del agente:** el prospecto conversa → el agente educa (fuente citada) y califica en segundo plano → al detectar datos suficientes emite la señal de lead listo → una segunda llamada a Gemini con salida JSON estructurada convierte la conversación en un registro tipado → el registro entra a Supabase → el ejecutivo lo aprueba, edita o rechaza (ninguna comunicación sale sin decisión humana) → cada decisión queda en la tabla de auditoría inmutable.

## 4. Integración a un sistema empresarial existente

1. **Canal omnicanal:** el chat se embebe vía webhook/iframe en banca web, app móvil o WhatsApp Business (el mismo backend REST sirve cualquier canal).
2. **CRM enterprise:** `/api/evaluate` produce un JSON normalizado y tipado (validado contra restricciones de la BD) que mapea 1:1 a objetos Lead de **Salesforce Financial Services, HubSpot o Microsoft Dynamics** vía conectores REST estándar.
3. **Cumplimiento:** human-in-the-loop obligatorio (aprobación explícita antes de cualquier comunicación), disclaimer legal visible en el chat, consentimientos separados (datos generales vs. interés educativo, ambos registrados), y traza auditable de cada acción del ejecutivo (`historial_acciones`).

## 5. Seguridad (resumen para jurado técnico)

- API key de Gemini **solo server-side** (.env); nunca se pide ni acepta desde el navegador.
- Sesión de admin por **cookie httpOnly + SameSite=Strict**; el token nunca viaja en el body; hash SHA-256 en reposo.
- Contraseñas **bcrypt**; bloqueo por fuerza bruta; anti-enumeración por hash señuelo.
- Supabase con **RLS activado y privilegios revocados** a roles públicos; restricciones CHECK que la BD impone aunque el backend falle (incluida: *el tema educativo no puede existir sin consentimiento*).
- Rate limiting por IP, sanitización anti null-bytes/prototype-pollution, CSP estricta, renderizado con `textContent` (anti-XSS).

## 6. Evidencia de calidad

`MOCK_DATABASE=true MOCK_GEMINI=true npm test` → **16/16**: 7 pruebas Jest (unitarias de validadores + integración) y 9 pruebas end-to-end de las Historias de Usuario (node --test), incluyendo: fuente citada, quiz de 3 preguntas, consentimiento educativo (positivo y negativo), categorías de acción, y seguridad de sesión.
