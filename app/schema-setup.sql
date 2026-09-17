-- =========================================================
-- Execute este script no SQL Editor do seu projeto Supabase
-- Dashboard → SQL Editor → New Query → Cole e clique em Run
-- =========================================================

-- Extensão para certificados
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------
-- 1. Perfis
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS perfis (
  id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome       text NOT NULL,
  avatar_url text,
  papel      text NOT NULL DEFAULT 'aluno' CHECK (papel IN ('aluno','instrutor','admin')),
  criado_em  timestamptz NOT NULL DEFAULT now()
);

-- Trigger: cria perfil automaticamente ao cadastrar usuário
CREATE OR REPLACE FUNCTION lidar_novo_usuario()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO perfis (id, nome)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email,'@',1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS ao_criar_usuario ON auth.users;
CREATE TRIGGER ao_criar_usuario
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION lidar_novo_usuario();

-- ---------------------------------------------------------
-- 2. Categorias e cursos
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS categorias (
  id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  slug text NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS cursos (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria_id     uuid REFERENCES categorias(id),
  titulo           text NOT NULL,
  slug             text NOT NULL UNIQUE,
  descricao        text,
  capa_url         text,
  preco_centavos   integer NOT NULL DEFAULT 0,
  status           text NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho','publicado')),
  criado_em        timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS modulos (
  id       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  curso_id uuid NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
  titulo   text NOT NULL,
  ordem    integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS aulas (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  modulo_id          uuid NOT NULL REFERENCES modulos(id) ON DELETE CASCADE,
  titulo             text NOT NULL,
  tipo               text NOT NULL DEFAULT 'video' CHECK (tipo IN ('video','texto','quiz')),
  youtube_video_id   text,
  conteudo_texto     text,
  duracao_segundos   integer,
  ordem              integer NOT NULL DEFAULT 0
);

-- ---------------------------------------------------------
-- 3. Matrículas e progresso
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS matriculas (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id  uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  curso_id    uuid NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
  status      text NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente','ativa')),
  origem      text NOT NULL DEFAULT 'gratuita' CHECK (origem IN ('gratuita','compra')),
  criado_em   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (usuario_id, curso_id)
);

CREATE TABLE IF NOT EXISTS progresso_aulas (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id  uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  aula_id     uuid NOT NULL REFERENCES aulas(id) ON DELETE CASCADE,
  concluida   boolean NOT NULL DEFAULT false,
  concluida_em timestamptz,
  UNIQUE (usuario_id, aula_id)
);

-- ---------------------------------------------------------
-- 4. Certificados
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS certificados (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id        uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  curso_id          uuid NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
  codigo_validacao  text NOT NULL UNIQUE DEFAULT upper(substr(encode(gen_random_bytes(6),'hex'),1,10)),
  pdf_url           text,
  emitido_em        timestamptz NOT NULL DEFAULT now(),
  UNIQUE (usuario_id, curso_id)
);

-- ---------------------------------------------------------
-- 5. Row Level Security
-- ---------------------------------------------------------
ALTER TABLE perfis           ENABLE ROW LEVEL SECURITY;
ALTER TABLE cursos           ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias       ENABLE ROW LEVEL SECURITY;
ALTER TABLE modulos          ENABLE ROW LEVEL SECURITY;
ALTER TABLE aulas            ENABLE ROW LEVEL SECURITY;
ALTER TABLE matriculas       ENABLE ROW LEVEL SECURITY;
ALTER TABLE progresso_aulas  ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificados     ENABLE ROW LEVEL SECURITY;

-- Perfis
DROP POLICY IF EXISTS "ver_proprio_perfil"    ON perfis;
DROP POLICY IF EXISTS "editar_proprio_perfil" ON perfis;
CREATE POLICY "ver_proprio_perfil"    ON perfis FOR SELECT USING (auth.uid() = id);
CREATE POLICY "editar_proprio_perfil" ON perfis FOR UPDATE USING (auth.uid() = id);

-- Catálogo público
DROP POLICY IF EXISTS "categorias_publicas"        ON categorias;
DROP POLICY IF EXISTS "cursos_publicados_publicos"  ON cursos;
DROP POLICY IF EXISTS "modulos_visiveis"            ON modulos;
CREATE POLICY "categorias_publicas"       ON categorias FOR SELECT USING (true);
CREATE POLICY "cursos_publicados_publicos" ON cursos    FOR SELECT USING (status = 'publicado');
CREATE POLICY "modulos_visiveis"          ON modulos    FOR SELECT USING (
  EXISTS (SELECT 1 FROM cursos c WHERE c.id = modulos.curso_id AND c.status = 'publicado')
);

-- Aulas: só matriculados
DROP POLICY IF EXISTS "aulas_para_matriculados" ON aulas;
CREATE POLICY "aulas_para_matriculados" ON aulas FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM modulos m
    JOIN matriculas mt ON mt.curso_id = m.curso_id
    WHERE m.id = aulas.modulo_id
      AND mt.usuario_id = auth.uid()
      AND mt.status = 'ativa'
  )
);

-- Matrículas
DROP POLICY IF EXISTS "ver_proprias_matriculas"  ON matriculas;
DROP POLICY IF EXISTS "criar_propria_matricula"  ON matriculas;
CREATE POLICY "ver_proprias_matriculas" ON matriculas FOR SELECT USING (auth.uid() = usuario_id);
CREATE POLICY "criar_propria_matricula" ON matriculas FOR INSERT WITH CHECK (auth.uid() = usuario_id);

-- Progresso
DROP POLICY IF EXISTS "ver_proprio_progresso"     ON progresso_aulas;
DROP POLICY IF EXISTS "editar_proprio_progresso"  ON progresso_aulas;
DROP POLICY IF EXISTS "atualizar_proprio_progresso" ON progresso_aulas;
CREATE POLICY "ver_proprio_progresso"       ON progresso_aulas FOR SELECT USING (auth.uid() = usuario_id);
CREATE POLICY "editar_proprio_progresso"    ON progresso_aulas FOR INSERT WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "atualizar_proprio_progresso" ON progresso_aulas FOR UPDATE USING (auth.uid() = usuario_id);

-- Certificados
DROP POLICY IF EXISTS "ver_proprio_certificado" ON certificados;
CREATE POLICY "ver_proprio_certificado" ON certificados FOR SELECT USING (auth.uid() = usuario_id);

-- ---------------------------------------------------------
-- 6. Curso de exemplo para testar o dashboard
-- ---------------------------------------------------------
INSERT INTO categorias (nome, slug) VALUES ('Programação', 'programacao')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO cursos (titulo, slug, descricao, status, categoria_id)
VALUES (
  'TypeScript: Introdução e Boas Práticas',
  'typescript-introducao',
  'Aprenda TypeScript do zero com exemplos práticos e exercícios.',
  'publicado',
  (SELECT id FROM categorias WHERE slug = 'programacao')
)
ON CONFLICT (slug) DO NOTHING;

-- Matricula o superusuário dev no curso de exemplo (se ele existir)
INSERT INTO matriculas (usuario_id, curso_id, status, origem)
SELECT u.id, c.id, 'ativa', 'gratuita'
FROM auth.users u, cursos c
WHERE u.email = 'dev@pense.ead.app'
  AND c.slug  = 'typescript-introducao'
ON CONFLICT (usuario_id, curso_id) DO NOTHING;
