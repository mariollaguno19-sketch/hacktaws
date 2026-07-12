# PDR — Aspectos Legales, Regulatorios y de Cumplimiento (ESTA)

> **Proyecto:** Sistema Agéntico Comercial & Tutor IA — Track 1
> **Hackathon:** Agentic Scale Ecuador Tech Week 2026 — TAWS
> **Versión:** 1.0

---

## 1. Marco Regulatorio Aplicable (Ecuador)

Este sistema, al operar en el sector financiero ecuatoriano, debe considerar:

| Normativa | Alcance |
|---|---|
| **Ley de Compañías** | Regula la promoción de productos de inversión |
| **Ley de Mercado de Valores** | Aplica si se mencionan instrumentos como bonos o fondos mutuos |
| **Ley Orgánica de Protección de Datos Personales (LOPDP)** | Vigente en Ecuador desde 2021 — regula el tratamiento de datos financieros |
| **Ley de Gestión de la Identidad y Datos Electrónicos** | Validez de consentimientos digitales |
| **Normas de la Superintendencia de Bancos** | Aplican si la entidad usuaria es un banco o cooperativa regulada |
| **Normas de la Superintendencia de Compañías** | Aplican si se perfilan personas jurídicas (B2B) |
| **Ley de Defensa del Consumidor** | Aplica a la comunicación comercial con personas naturales (B2C) |

---

## 2. Consentimiento del Usuario (ESTA — Consentimiento Informado)

### 2.1. Punto de Recolección
El sistema solicita el correo electrónico antes de iniciar la conversación (`usuario.html:33-37`). Este es el punto donde debe presentarse el aviso de privacidad.

### 2.2. Texto Propuesto para el Aviso de Consentimiento
> Al ingresar tu correo y usar este chat, aceptas los siguientes términos:
> - Tus datos de contacto y el historial de la conversación serán almacenados y compartidos con un ejecutivo comercial para fines de asesoría de inversiones.
> - La IA puede perfilar tu tipo de cliente (B2B/B2C), presupuesto estimado y urgencia para priorizar tu atención.
> - No se ejecutarán transacciones financieras de forma automatizada. Toda acción sensible requiere aprobación humana.
> - Puedes solicitar la eliminación de tus datos en cualquier momento contactando al ejecutivo asignado.
> - El tratamiento de tus datos se rige por la Ley Orgánica de Protección de Datos Personales del Ecuador.

### 2.3. Derechos del Usuario (ARCO)
El sistema debe garantizar:
- **Acceso**: El usuario puede conocer qué datos suyos se almacenaron.
- **Rectificación**: Puede corregir datos incorrectos vía el ejecutivo.
- **Cancelación**: El ejecutivo puede eliminar el registro (`DELETE /api/leads/:index`).
- **Oposición**: Puede negarse a que sus datos sean usados para perfiles automatizados.

---

## 3. Limitaciones de Responsabilidad (Disclaimer Legal)

Debe incluirse en el sitio web y en la bandeja del ejecutivo:

> **AVISO IMPORTANTE**
>
> Este sistema utiliza inteligencia artificial generativa (Google Gemini 3.5 Flash) con fines de **asesoría preliminar y educativa**. No constituye asesoría financiera legalmente vinculante. Las recomendaciones generadas por la IA deben ser validadas por un asesor financiero certificado antes de cualquier toma de decisión de inversión.
>
> La entidad financiera no se responsabiliza por:
> - Decisiones de inversión tomadas basándose únicamente en la conversación con la IA
> - Alucinaciones o imprecisiones en los datos generados por el modelo
> - Daños derivados del uso no autorizado del sistema
>
> Todas las propuestas comerciales están sujetas a **aprobación humana obligatoria** (Human-in-the-Loop) antes de ser comunicadas al cliente.

---

## 4. Human-in-the-Loop (Obligatorio para el Sector Financiero)

| Acción | Automatizada por IA | Requiere Aprobación Humana |
|---|---|---|
| Calificar prospecto (B2B/B2C) | ✅ Sí | ❌ No (es análisis interno) |
| Generar resumen de necesidad | ✅ Sí | ❌ No (es análisis interno) |
| Sugerir acción comercial | ✅ Sí | ❌ No (es propuesta) |
| **Enviar propuesta al cliente** | **❌ NO** | **✅ Sí — El ejecutivo debe aprobar** |
| Ejecutar transacciones | **❌ NO** | **✅ Sí — Nunca automatizado** |
| Eliminar datos del usuario | **❌ NO** | **✅ Sí — Solo el ejecutivo vía CRM** |

---

## 5. Protección de Datos (LOPDP Ecuador)

### 5.1. Datos Recolectados
- Correo electrónico (identificación)
- Historial de conversación (incluye posible información financiera sensible)
- Perfil de cliente inferido por la IA (tipo, presupuesto, urgencia, objeciones)
- **Señal comercial**: tema de interés del usuario, solo si autoriza explícitamente (campo `señal_comercial_autorizada` en el JSON)
- **Resultados de quiz educativo**: respuestas del usuario al mini-quiz del Tutor IA

### 5.2. Medidas Implementadas
| Medida | Estado |
|---|---|
| Consentimiento previo a la recolección | ✅ Checkbox obligatorio en `usuario.html` antes del login |
| Consentimiento para señal comercial | ✅ La IA pregunta durante la conversación (`||CONSENTIMIENTO_INTERES||`) y confirma al enviar al CRM |
| Almacenamiento local (no cloud externo) | ✅ Datos en `crm_datos.json` (servidor local) |
| Eliminación física de registros | ✅ Endpoint `DELETE /api/leads/:index` |
| Acceso restringido al CRM | ✅ Autenticación básica (admin/admin) |
| No compartición con terceros | ✅ Por defecto — no hay integración externa |
| Grounding para evitar alucinaciones | ✅ System Instruction restringe la base de conocimiento |

### 5.3. Recomendaciones de Mejora
1. Reemplazar autenticación básica por un sistema de credenciales más robusto para producción
2. Agregar política de retención de datos (ej. eliminar leads después de 90 días)
3. En producción real, el JSON debe reemplazarse por una base de datos con cifrado

---

## 6. Términos de Uso (ESTA — Extracto para el Sistema)

1. **Aceptación**: Al usar el chat, el usuario acepta estos términos.
2. **Uso Apropiado**: El sistema es para fines de asesoría preliminar y educativa. No debe usarse para transacciones en tiempo real.
3. **Privacidad**: Los datos del usuario se tratan según la LOPDP.
4. **Disponibilidad**: El servicio se provee "tal cual". No se garantiza disponibilidad 24/7 en esta fase.
5. **Menores de Edad**: El sistema no debe ser usado por menores de 18 años sin supervisión de un tutor financiero.
6. **Propiedad Intelectual**: El código y la interfaz pertenecen al equipo desarrollador. El contenido generado por la IA no constituye propiedad intelectual exclusiva.

---

## 7. Checklist de Cumplimiento para la Demo del Hackathon

- [x] Aviso de privacidad visible antes de recolectar el correo
- [x] Consentimiento explícito (checkbox) implementado
- [x] Consentimiento para señal comercial (`||CONSENTIMIENTO_INTERES||`)
- [ ] Disclaimer legal visible en la pantalla de chat y en la bandeja del ejecutivo
- [x] Botón de eliminación de datos funcional
- [x] Human-in-the-loop documentado y visible
- [x] System Instruction de grounding configurada
- [x] Validación de que la IA no ejecuta transacciones
- [x] Evaluación diagnóstica / quiz de 3 preguntas (`||QUIZ||`)
- [x] Ruta de aprendizaje sugerida por el Tutor IA
- [x] Preguntas de calificación configurables desde el panel admin
