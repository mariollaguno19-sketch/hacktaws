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
    tipo_cliente TEXT NOT NULL CHECK (tipo_cliente IN ('B2B', 'B2C')),
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
    estado_aprobacion TEXT DEFAULT 'Pendiente',
    historial JSONB DEFAULT '[]'::jsonb,
    horizonte_inversion TEXT,
    portafolio_distribucion JSONB DEFAULT '{}'::jsonb,
    portafolio_justificacion TEXT,
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

-- 6. USUARIO ADMINISTRADOR INICIAL (admin / admin)
-- Se inserta con hash seguro bcrypt del valor 'admin':
INSERT INTO usuarios_admin (usuario, password_hash, nombre, rol, activo)
VALUES (
    'admin', 
    '$2a$10$wK1Wq6hCshYp9/f1FasQ1er0Jb9p2eL.lRj6K1.Wd7i8r5a1wN3t.', 
    'Administrador Synapse', 
    'admin', 
    true
)
ON CONFLICT (usuario) DO NOTHING;
