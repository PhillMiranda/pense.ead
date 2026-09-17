-- =========================================================
-- pense.ead — Setup completo do banco Supabase
-- SQL Editor → New Query → Cole tudo → Run
--
-- Schemas:
--   auth      → gerenciado pelo Supabase (não mexemos)
--   ead       → domínio principal: cursos, módulos, aulas
--   pessoas   → perfis e matrículas dos alunos
--   financeiro → pagamentos e certificados
-- =========================================================

-- ---------------------------------------------------------
-- 0. Extensões
-- ---------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------
-- 1. Criar schemas
-- ---------------------------------------------------------
CREATE SCHEMA IF NOT EXISTS ead;
CREATE SCHEMA IF NOT EXISTS pessoas;
CREATE SCHEMA IF NOT EXISTS financeiro;

-- ---------------------------------------------------------
-- 2. Permissões de uso dos schemas para o Supabase
--    (anon = visitante, authenticated = logado,
--     service_role = Edge Functions / backend)
-- ---------------------------------------------------------
GRANT USAGE ON SCHEMA ead        TO anon, authenticated, service_role;
GRANT USAGE ON SCHEMA pessoas    TO anon, authenticated, service_role;
GRANT USAGE ON SCHEMA financeiro TO anon, authenticated, service_role;

-- Garante que tabelas futuras nos schemas também herdam permissões
ALTER DEFAULT PRIVILEGES IN SCHEMA ead
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA ead
  GRANT SELECT ON TABLES TO anon;

ALTER DEFAULT PRIVILEGES IN SCHEMA pessoas
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA financeiro
  GRANT SELECT ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA financeiro
  GRANT INSERT, UPDATE ON TABLES TO service_role;

-- ---------------------------------------------------------
-- 3. Schema PESSOAS
-- ---------------------------------------------------------

-- 3.1 Perfis de usuário
CREATE TABLE IF NOT EXISTS pessoas.perfis (
  id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome       text NOT NULL,
  avatar_url text,
  papel      text NOT NULL DEFAULT 'aluno'
               CHECK (papel IN ('aluno', 'instrutor', 'admin')),
  criado_em  timestamptz NOT NULL DEFAULT now()
);

-- Trigger: cria perfil automaticamente ao cadastrar
CREATE OR REPLACE FUNCTION pessoas.lidar_novo_usuario()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO pessoas.perfis (id, nome)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email,'@',1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
   SET search_path = pessoas, public;

DROP TRIGGER IF EXISTS ao_criar_usuario ON auth.users;
CREATE TRIGGER ao_criar_usuario
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION pessoas.lidar_novo_usuario();

-- 3.2 Matrículas
CREATE TABLE IF NOT EXISTS pessoas.matriculas (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id  uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  curso_id    uuid NOT NULL,  -- FK para ead.cursos adicionada após criar a tabela
  status      text NOT NULL DEFAULT 'pendente'
                CHECK (status IN ('pendente', 'ativa')),
  origem      text NOT NULL DEFAULT 'gratuita'
                CHECK (origem IN ('gratuita', 'compra')),
  criado_em   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (usuario_id, curso_id)
);

-- 3.3 Progresso por aula
CREATE TABLE IF NOT EXISTS pessoas.progresso_aulas (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  aula_id      uuid NOT NULL,  -- FK para ead.aulas adicionada após criar a tabela
  concluida    boolean NOT NULL DEFAULT false,
  concluida_em timestamptz,
  UNIQUE (usuario_id, aula_id)
);

-- ---------------------------------------------------------
-- 4. Schema EAD
-- ---------------------------------------------------------

-- 4.1 Categorias de cursos
CREATE TABLE IF NOT EXISTS ead.categorias (
  id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  slug text NOT NULL UNIQUE
);

-- 4.2 Cursos
CREATE TABLE IF NOT EXISTS ead.cursos (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria_id   uuid REFERENCES ead.categorias(id),
  titulo         text NOT NULL,
  slug           text NOT NULL UNIQUE,
  descricao      text,
  capa_url       text,
  preco_centavos integer NOT NULL DEFAULT 0,
  status         text NOT NULL DEFAULT 'rascunho'
                   CHECK (status IN ('rascunho', 'publicado')),
  criado_em      timestamptz NOT NULL DEFAULT now()
);

-- 4.3 Módulos
CREATE TABLE IF NOT EXISTS ead.modulos (
  id       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  curso_id uuid NOT NULL REFERENCES ead.cursos(id) ON DELETE CASCADE,
  titulo   text NOT NULL,
  ordem    integer NOT NULL DEFAULT 0
);

-- 4.4 Aulas
CREATE TABLE IF NOT EXISTS ead.aulas (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  modulo_id        uuid NOT NULL REFERENCES ead.modulos(id) ON DELETE CASCADE,
  titulo           text NOT NULL,
  tipo             text NOT NULL DEFAULT 'video'
                     CHECK (tipo IN ('video', 'texto', 'quiz')),
  youtube_video_id text,
  conteudo_texto   text,
  duracao_segundos integer,
  ordem            integer NOT NULL DEFAULT 0
);

-- 4.5 Quizzes
CREATE TABLE IF NOT EXISTS ead.quizzes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  modulo_id   uuid REFERENCES ead.modulos(id) ON DELETE CASCADE,
  titulo      text NOT NULL,
  nota_minima integer NOT NULL DEFAULT 70
);

CREATE TABLE IF NOT EXISTS ead.quiz_perguntas (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id         uuid NOT NULL REFERENCES ead.quizzes(id) ON DELETE CASCADE,
  enunciado       text NOT NULL,
  opcoes          jsonb NOT NULL,
  resposta_correta integer NOT NULL,
  ordem           integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS ead.quiz_tentativas (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_id    uuid NOT NULL REFERENCES ead.quizzes(id) ON DELETE CASCADE,
  nota       integer NOT NULL,
  aprovado   boolean NOT NULL,
  respostas  jsonb NOT NULL,
  criado_em  timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------
-- 5. Schema FINANCEIRO
-- ---------------------------------------------------------

-- 5.1 Certificados
CREATE TABLE IF NOT EXISTS financeiro.certificados (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  curso_id         uuid NOT NULL REFERENCES ead.cursos(id) ON DELETE CASCADE,
  codigo_validacao text NOT NULL UNIQUE
                     DEFAULT upper(substr(encode(gen_random_bytes(6),'hex'),1,10)),
  pdf_url          text,
  emitido_em       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (usuario_id, curso_id)
);

-- 5.2 Pagamentos
CREATE TABLE IF NOT EXISTS financeiro.pagamentos (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id           uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  curso_id             uuid NOT NULL REFERENCES ead.cursos(id),
  gateway              text NOT NULL DEFAULT 'mercado_pago',
  gateway_pagamento_id text,
  valor_centavos       integer NOT NULL,
  status               text NOT NULL DEFAULT 'pendente'
                         CHECK (status IN ('pendente', 'aprovado', 'recusado')),
  criado_em            timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------
-- 6. FKs cruzadas entre schemas (adicionadas após criar tabelas)
-- ---------------------------------------------------------
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_matriculas_curso'
  ) THEN
    ALTER TABLE pessoas.matriculas
      ADD CONSTRAINT fk_matriculas_curso
      FOREIGN KEY (curso_id) REFERENCES ead.cursos(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_progresso_aula'
  ) THEN
    ALTER TABLE pessoas.progresso_aulas
      ADD CONSTRAINT fk_progresso_aula
      FOREIGN KEY (aula_id) REFERENCES ead.aulas(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ---------------------------------------------------------
-- 7. Row Level Security
-- ---------------------------------------------------------

-- pessoas
ALTER TABLE pessoas.perfis          ENABLE ROW LEVEL SECURITY;
ALTER TABLE pessoas.matriculas      ENABLE ROW LEVEL SECURITY;
ALTER TABLE pessoas.progresso_aulas ENABLE ROW LEVEL SECURITY;

-- ead
ALTER TABLE ead.categorias      ENABLE ROW LEVEL SECURITY;
ALTER TABLE ead.cursos          ENABLE ROW LEVEL SECURITY;
ALTER TABLE ead.modulos         ENABLE ROW LEVEL SECURITY;
ALTER TABLE ead.aulas           ENABLE ROW LEVEL SECURITY;
ALTER TABLE ead.quizzes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE ead.quiz_perguntas  ENABLE ROW LEVEL SECURITY;
ALTER TABLE ead.quiz_tentativas ENABLE ROW LEVEL SECURITY;

-- financeiro
ALTER TABLE financeiro.certificados ENABLE ROW LEVEL SECURITY;
ALTER TABLE financeiro.pagamentos   ENABLE ROW LEVEL SECURITY;

-- ── pessoas.perfis ────────────────────────────────────────
DROP POLICY IF EXISTS "perfil_select" ON pessoas.perfis;
DROP POLICY IF EXISTS "perfil_update" ON pessoas.perfis;
CREATE POLICY "perfil_select" ON pessoas.perfis
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "perfil_update" ON pessoas.perfis
  FOR UPDATE USING (auth.uid() = id);

-- ── ead (catálogo público) ────────────────────────────────
DROP POLICY IF EXISTS "categorias_public"  ON ead.categorias;
DROP POLICY IF EXISTS "cursos_publicados"  ON ead.cursos;
DROP POLICY IF EXISTS "modulos_publicados" ON ead.modulos;
CREATE POLICY "categorias_public"  ON ead.categorias
  FOR SELECT USING (true);
CREATE POLICY "cursos_publicados"  ON ead.cursos
  FOR SELECT USING (status = 'publicado');
CREATE POLICY "modulos_publicados" ON ead.modulos
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM ead.cursos c
            WHERE c.id = modulos.curso_id AND c.status = 'publicado')
  );

-- ── ead.aulas: só matriculados ────────────────────────────
DROP POLICY IF EXISTS "aulas_matriculados" ON ead.aulas;
CREATE POLICY "aulas_matriculados" ON ead.aulas
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM ead.modulos m
      JOIN pessoas.matriculas mt ON mt.curso_id = m.curso_id
      WHERE m.id = aulas.modulo_id
        AND mt.usuario_id = auth.uid()
        AND mt.status = 'ativa'
    )
  );

-- ── ead.quizzes: só matriculados ─────────────────────────
DROP POLICY IF EXISTS "quizzes_matriculados"   ON ead.quizzes;
DROP POLICY IF EXISTS "perguntas_matriculados" ON ead.quiz_perguntas;
DROP POLICY IF EXISTS "tentativas_select"      ON ead.quiz_tentativas;
DROP POLICY IF EXISTS "tentativas_insert"      ON ead.quiz_tentativas;
CREATE POLICY "quizzes_matriculados" ON ead.quizzes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM ead.modulos m
      JOIN pessoas.matriculas mt ON mt.curso_id = m.curso_id
      WHERE m.id = quizzes.modulo_id
        AND mt.usuario_id = auth.uid() AND mt.status = 'ativa'
    )
  );
CREATE POLICY "perguntas_matriculados" ON ead.quiz_perguntas
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM ead.quizzes q
      JOIN ead.modulos m ON m.id = q.modulo_id
      JOIN pessoas.matriculas mt ON mt.curso_id = m.curso_id
      WHERE q.id = quiz_perguntas.quiz_id
        AND mt.usuario_id = auth.uid() AND mt.status = 'ativa'
    )
  );
CREATE POLICY "tentativas_select" ON ead.quiz_tentativas
  FOR SELECT USING (auth.uid() = usuario_id);
CREATE POLICY "tentativas_insert" ON ead.quiz_tentativas
  FOR INSERT WITH CHECK (auth.uid() = usuario_id);

-- ── pessoas.matriculas ────────────────────────────────────
DROP POLICY IF EXISTS "matriculas_select" ON pessoas.matriculas;
DROP POLICY IF EXISTS "matriculas_insert" ON pessoas.matriculas;
CREATE POLICY "matriculas_select" ON pessoas.matriculas
  FOR SELECT USING (auth.uid() = usuario_id);
CREATE POLICY "matriculas_insert" ON pessoas.matriculas
  FOR INSERT WITH CHECK (auth.uid() = usuario_id);

-- ── pessoas.progresso_aulas ───────────────────────────────
DROP POLICY IF EXISTS "progresso_select" ON pessoas.progresso_aulas;
DROP POLICY IF EXISTS "progresso_insert" ON pessoas.progresso_aulas;
DROP POLICY IF EXISTS "progresso_update" ON pessoas.progresso_aulas;
CREATE POLICY "progresso_select" ON pessoas.progresso_aulas
  FOR SELECT USING (auth.uid() = usuario_id);
CREATE POLICY "progresso_insert" ON pessoas.progresso_aulas
  FOR INSERT WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "progresso_update" ON pessoas.progresso_aulas
  FOR UPDATE USING (auth.uid() = usuario_id);

-- ── financeiro.certificados ───────────────────────────────
DROP POLICY IF EXISTS "cert_select" ON financeiro.certificados;
CREATE POLICY "cert_select" ON financeiro.certificados
  FOR SELECT USING (auth.uid() = usuario_id);

-- ── financeiro.pagamentos ─────────────────────────────────
DROP POLICY IF EXISTS "pgto_select" ON financeiro.pagamentos;
CREATE POLICY "pgto_select" ON financeiro.pagamentos
  FOR SELECT USING (auth.uid() = usuario_id);

-- ---------------------------------------------------------
-- 8. Dados de exemplo + superusuário dev
-- ---------------------------------------------------------
INSERT INTO ead.categorias (nome, slug)
VALUES ('Programação', 'programacao')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO ead.cursos (titulo, slug, descricao, status, categoria_id)
VALUES (
  'TypeScript: Introdução e Boas Práticas',
  'typescript-introducao',
  'Aprenda TypeScript do zero com exemplos práticos.',
  'publicado',
  (SELECT id FROM ead.categorias WHERE slug = 'programacao')
)
ON CONFLICT (slug) DO NOTHING;

-- Matricula o dev no curso de exemplo (roda depois do primeiro login)
DO $$
DECLARE v_uid uuid;
BEGIN
  SELECT id INTO v_uid FROM auth.users WHERE email = 'dev@pense.ead.app';
  IF v_uid IS NOT NULL THEN
    INSERT INTO pessoas.matriculas (usuario_id, curso_id, status, origem)
    SELECT v_uid, c.id, 'ativa', 'gratuita'
    FROM ead.cursos c WHERE c.slug = 'typescript-introducao'
    ON CONFLICT (usuario_id, curso_id) DO NOTHING;
  END IF;
END $$;
