-- ==========================================
-- SCHEMA SQL - SYNAPSE CRM & IA DATABASE
-- ==========================================
-- Copia y pega este script en el editor SQL de tu panel de Supabase:
-- https://supabase.com/dashboard/project/utwkppgkdircotkhmntf/sql

-- 1. TABLA: usuarios_admin
CREATE TABLE IF NOT EXISTS usuarios_admin (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario TEXT UNIQUE NOT NULL CHECK (char_length(usuario) BETWEEN 3 AND 100),
    password_hash TEXT NOT NULL,
    nombre TEXT NOT NULL,
    rol TEXT NOT NULL CHECK (rol IN ('admin', 'ejecutivo')),
    activo BOOLEAN DEFAULT true,
    creado_en TIMESTAMPTZ DEFAULT now()
);

-- 2. TABLA: sesiones
CREATE TABLE IF NOT EXISTS sesiones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios_admin(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expira_en TIMESTAMPTZ NOT NULL,
    creado_en TIMESTAMPTZ DEFAULT now()
);

-- 3. TABLA: leads
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    correo_cliente TEXT NOT NULL,
    -- 'Por clasificar' es el valor por defecto que asigna el backend cuando la IA no pudo clasificar
    tipo_cliente TEXT NOT NULL CHECK (tipo_cliente IN ('B2B', 'B2C', 'Por clasificar')),
    interes_principal TEXT,
    puntaje_prioridad INTEGER CHECK (puntaje_prioridad BETWEEN 1 AND 10),
    monto_estimado NUMERIC(14,2),
    nivel_riesgo TEXT CHECK (nivel_riesgo IN ('Conservador', 'Moderado', 'Agresivo', 'Por determinar')),
    telefono TEXT,
    asesor_asignado TEXT,
    notas_internas TEXT CHECK (char_length(notas_internas) <= 4000),
    etapa_embudo TEXT DEFAULT 'Listo para asesor',
    resumen_necesidad TEXT,
    objeciones_detectadas JSONB DEFAULT '[]'::jsonb,
    accion_sugerida_ejecutivo TEXT,
    -- Historia 3: la acción sugerida cae en una de tres categorías explícitas
    accion_categoria TEXT CHECK (accion_categoria IS NULL OR accion_categoria IN
        ('Agendar reunión', 'Enviar material educativo', 'Derivar a especialista')),
    estado_aprobacion TEXT DEFAULT 'Pendiente',
    historial JSONB DEFAULT '[]'::jsonb,
    horizonte_inversion TEXT,
    portafolio_distribucion JSONB DEFAULT '{}'::jsonb,
    portafolio_justificacion TEXT,
    -- Historia 2 (Tutor IA): el tema educativo SOLO puede existir con consentimiento explícito
    tema_interes_educativo TEXT CHECK (tema_interes_educativo IS NULL OR tema_interes_educativo IN
        ('Renta Fija', 'Fondos Mutuos', 'Renta Variable', 'Perfiles de Riesgo', 'Reglas de Oro', 'Conceptos Clave')),
    consentimiento_educativo BOOLEAN NOT NULL DEFAULT false,
    quiz_puntaje INTEGER CHECK (quiz_puntaje IS NULL OR quiz_puntaje BETWEEN 0 AND 3),
    CONSTRAINT leads_tema_requiere_consentimiento CHECK (
        tema_interes_educativo IS NULL OR consentimiento_educativo = true
    ),
    creado_en TIMESTAMPTZ DEFAULT now(),
    actualizado_en TIMESTAMPTZ DEFAULT now()
);

-- 4. TABLA: historial_acciones (Auditoría / Bitácora)
CREATE TABLE IF NOT EXISTS historial_acciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    usuario TEXT NOT NULL,
    accion TEXT NOT NULL,
    detalle TEXT,
    creado_en TIMESTAMPTZ DEFAULT now()
);

-- 5. VISTA: estadisticas_crm
CREATE OR REPLACE VIEW estadisticas_crm AS
SELECT 
    COUNT(*)::int AS total_leads,
    COUNT(CASE WHEN tipo_cliente = 'B2B' THEN 1 END)::int AS total_b2b,
    COUNT(CASE WHEN tipo_cliente = 'B2C' THEN 1 END)::int AS total_b2c,
    COUNT(CASE WHEN estado_aprobacion = 'Pendiente' THEN 1 END)::int AS pendientes,
    COUNT(CASE WHEN estado_aprobacion = '✅ APROBADO (Enviado al cliente)' THEN 1 END)::int AS aprobados,
    COUNT(CASE WHEN estado_aprobacion = '❌ RECHAZADO' THEN 1 END)::int AS rechazados,
    COALESCE(ROUND(AVG(puntaje_prioridad), 1), 0.0) AS prioridad_promedio,
    COALESCE(SUM(monto_estimado), 0.0)::numeric(14,2) AS monto_total_pipeline,
    COUNT(CASE WHEN puntaje_prioridad >= 8 THEN 1 END)::int AS leads_calientes
FROM leads;

-- 6. SEGURIDAD: RLS activado y sin políticas públicas (solo el backend con service role accede)
ALTER TABLE usuarios_admin ENABLE ROW LEVEL SECURITY;
ALTER TABLE sesiones ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_acciones ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON usuarios_admin, sesiones, leads, historial_acciones FROM anon, authenticated;

-- 7. USUARIO ADMINISTRADOR INICIAL (admin / admin — SOLO PARA DEMO)
-- Hash bcrypt REAL del valor 'admin' (verificado con bcryptjs.compareSync):
INSERT INTO usuarios_admin (usuario, password_hash, nombre, rol, activo)
VALUES (
    'admin',
    '$2a$10$fbQ2h8c1Yjy.bMjiHckW1Og54mo/VZ1Q8Uo42kwqzSVYFHxDo6DDS',
    'Administrador Synapse',
    'admin',
    true
)
ON CONFLICT (usuario) DO NOTHING;
