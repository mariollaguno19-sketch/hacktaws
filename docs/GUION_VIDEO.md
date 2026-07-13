# Guion de Video — Synapse (3 minutos)
**Prioridades del guion:** quiz educativo con fuente citada (nuevo, H2) · momento de aprobación humana · modelo de negocio ("¿quién paga?").

---

## 0:00 – 0:25 · El problema (voz sobre la landing)

> "En una cooperativa de ahorro y crédito, un ejecutivo comercial pierde horas al día respondiendo mensajes de curiosos y persiguiendo formularios que llegan vacíos. Synapse es la capa conversacional de preventa que hace ese trabajo por él: conversa, educa y califica 24/7 — y le entrega solo prospectos listos para cerrar."

**En pantalla:** hero de la landing ("Cada mañana, una bandeja de prospectos listos para cerrar") → scroll rápido por "Hoy sin Synapse / Con Synapse".

## 0:25 – 1:20 · Historia 2: el Tutor IA con fuente citada + quiz (LA NOVEDAD)

**En pantalla:** entrar al chat como prospecto.

1. Escribir: **"Quiero aprender qué es la renta fija"**.
2. Señalar la respuesta: educa en lenguaje simple y **cita su fuente** en pantalla: *"Fuente: Guía Educativa Synapse — Renta Fija"*.
   > "Cada respuesta educativa cita su fuente. El agente solo puede enseñar desde una base de conocimiento controlada — cero tasas inventadas, cero alucinaciones."
3. Aceptar el quiz: **responder las 3 preguntas** (mostrar el feedback inmediato verde/rojo con explicación).
   > "El tutor refuerza lo aprendido con un quiz de tres preguntas y retroalimentación inmediata."
4. **El momento clave del consentimiento:** aparece "¿Puedo registrar tu interés en Renta Fija como parte de tu perfil comercial?" → clic en "Sí, registrar mi interés".
   > "Y aquí la educación se convierte en inteligencia comercial: con consentimiento explícito y separado, el interés del cliente pasa a ser una señal en el CRM."

## 1:20 – 1:50 · Historia 1: calificación conversacional

**En pantalla:** continuar el chat: "a título personal" → "unos 20 mil dólares" → "este mes".

> "Sin un solo formulario, el agente ya sabe: cliente personal, veinte mil dólares, urgente. Cuando el perfil está completo, se desbloquea el envío al ejecutivo."

Clic en **"Transmitir perfil al Ejecutivo Comercial"**.

## 1:50 – 2:35 · Historia 3: la bandeja del ejecutivo (HUMAN-IN-THE-LOOP)

**En pantalla:** login ejecutivo → bandeja CRM.

1. Mostrar los KPIs (pipeline en dólares, B2B/B2C) y el lead recién llegado **arriba con su prioridad**.
2. Abrir el lead: señalar **"Interés Educativo: Renta Fija (quiz: 3/3) — consentido"** y **"Acción Recomendada: Agendar reunión"**.
   > "La IA no dice 'contactar': clasifica la siguiente acción en una de tres categorías concretas — agendar reunión, enviar material educativo o derivar a especialista."
3. **El momento de la aprobación humana** (pausar aquí, es el diferenciador):
   > "Y esto es lo más importante: nada sale de Synapse sin un humano. El ejecutivo revisa la propuesta de la IA, la edita si quiere… y solo entonces la aprueba. Cada decisión queda en una auditoría inmutable — quién aprobó qué y cuándo."
   Editar el texto de la propuesta → clic en **Aprobar**.

## 2:35 – 3:00 · Modelo de negocio y cierre

**En pantalla:** volver a la landing, sección "¿Quién paga?".

> "¿Quién paga por esto? La institución, no el cliente: suscripción por agencia o pago por lead calificado — el costo queda alineado al valor. Synapse no reemplaza tu CRM: lo alimenta, con conectores listos para Salesforce o HubSpot. Synapse — cada conversación, un cliente."

---

## Notas de producción

- Correr con `GEMINI_API_KEY` real en el `.env` para que el badge diga "Gemini Activo" (o en modo simulado, que es determinista y nunca falla en vivo).
- Tener 2 pestañas listas: chat de prospecto y bandeja de ejecutivo (login hecho antes de grabar).
- Si el tiempo aprieta, recortar la sección 0:00 a 15 segundos — el quiz con consentimiento (0:25–1:20) es lo que ningún otro equipo va a tener.
