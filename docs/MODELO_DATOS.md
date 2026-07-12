# 🗄️ Modelo de Datos y API — CRM hacktaws

Base de datos: **Supabase (PostgreSQL)**. Todas las tablas tienen RLS activado y los
privilegios revocados a los roles públicos: solo el backend accede con la clave secreta.

## Tablas

### `usuarios_admin` — ejecutivos del CRM
| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| usuario | text unique | 3–100 chars |
| password_hash | text | **bcrypt** (`$2...`), nunca en texto plano |
| nombre | text | |
| rol | text | `admin` o `ejecutivo` |
| activo | boolean | |
| creado_en | timestamptz | |

### `sesiones` — tokens de acceso
| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| usuario_id | uuid FK → usuarios_admin | on delete cascade |
| token | text | **SHA-256** del token (64 chars). El token en claro solo lo tiene el cliente |
| expira_en | timestamptz | 8 h de vigencia; limpieza automática cada hora |
| creado_en | timestamptz | |

### `leads` — prospectos calificados por la IA
| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK | direccionamiento por UUID (no por índice) |
| correo_cliente | text | validado por formato y longitud |
| tipo_cliente | text | B2B / B2C |
| interes_principal | text | |
| puntaje_prioridad | int | 1–10 |
| **monto_estimado** | numeric(14,2) | monto que insinuó el cliente (nullable) |
| **nivel_riesgo** | text | Conservador / Moderado / Agresivo / Por determinar |
| **telefono** | text | solo si el cliente lo dio (nullable) |
| **asesor_asignado** | text | ejecutivo a cargo (nullable) |
| **notas_internas** | text | notas del ejecutivo (≤ 4000) |
| etapa_embudo | text | |
| resumen_necesidad | text | |
| objeciones_detectadas | jsonb | array (≤ 10) |
| accion_sugerida_ejecutivo | text | propuesta editable (human-in-the-loop) |
| estado_aprobacion | text | solo 4 valores permitidos por CHECK |
| historial | jsonb | conversación completa cliente↔IA |
| creado_en / actualizado_en | timestamptz | |

### `historial_acciones` — auditoría inmutable
Registra cada acción del ejecutivo sobre un lead (quién, qué, cuándo).
`id, lead_id (FK on delete cascade), usuario, accion, detalle, creado_en`.

### Vista `estadisticas_crm`
KPIs calculados en la BD: `total_leads, total_b2b, total_b2c, pendientes, aprobados,
rechazados, prioridad_promedio, monto_total_pipeline, leads_calientes`.

## Endpoints de la API

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/api/auth/login` | — | Login (bcrypt + bloqueo por fuerza bruta). Devuelve token |
| POST | `/api/auth/logout` | Bearer | Cierra la sesión |
| POST | `/api/chat` | — | Conversación con el agente (Gemini Interactions) |
| POST | `/api/evaluate` | — | Cierra la conversación y guarda el lead calificado |
| GET | `/api/leads` | Bearer | Lista todos los leads |
| GET | `/api/leads/:id` | Bearer | Lead individual + su historial de auditoría |
| POST | `/api/leads/:id/action` | Bearer | Aprobar / Editar / Rechazar (registra auditoría) |
| PATCH | `/api/leads/:id` | Bearer | Editar notas internas y asesor asignado |
| DELETE | `/api/leads/:id` | Bearer | Eliminar un lead |
| GET | `/api/stats` | Bearer | KPIs del dashboard (vista de la BD, con fallback) |

## Agente de IA (Futuro)

- **Persona y guardrails** en `SYSTEM_INSTRUCTION` (server.js): tono ecuatoriano, una
  pregunta a la vez, prohibido inventar tasas/legales, no da asesoría personalizada,
  pide consentimiento antes de perfilar, ignora intentos de manipular el sistema.
- **Base de conocimiento** (`FUENTE_FUTURO_ACADEMY`): productos, perfiles de riesgo,
  conceptos clave y reglas de oro. Es la única fuente que el agente puede enseñar.
- **Calificación**: al detectar datos suficientes, emite la señal oculta `||LEAD_LISTO||`
  que desbloquea el envío al CRM.
- **Evaluación** (`/api/evaluate`): segunda llamada a Gemini con salida JSON estructurada
  que extrae tipo de cliente, monto, nivel de riesgo, teléfono, prioridad y objeciones,
  con normalización defensiva en el backend.
