-- =========================================================
-- Fix definitivo: remove trigger antiga, recria usuário dev
-- SQL Editor → New Query → Cole → Run
-- =========================================================

-- 1. Remove trigger antiga que exige CPF (era do projeto anterior)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user        ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Garante que a trigger correta (pessoas schema) está ativa
DROP TRIGGER IF EXISTS ao_criar_usuario ON auth.users;

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

CREATE TRIGGER ao_criar_usuario
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION pessoas.lidar_novo_usuario();

-- 3. Remove perfil e usuário corrompido
DELETE FROM pessoas.perfis
WHERE id = (SELECT id FROM auth.users WHERE email = 'dev@pense.ead.app');

DELETE FROM auth.users WHERE email = 'dev@pense.ead.app';

-- 4. Recria do zero com email confirmado e senha correta
INSERT INTO auth.users (
  instance_id, id, aud, role, email,
  encrypted_password, email_confirmed_at,
  raw_user_meta_data, created_at, updated_at
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated', 'authenticated',
  'dev@pense.ead.app',
  crypt('PenseEAD@2025!', gen_salt('bf')),
  now(),
  '{"nome": "Dev Admin"}'::jsonb,
  now(), now()
);

-- 5. Matricula no curso de exemplo
INSERT INTO pessoas.matriculas (usuario_id, curso_id, status, origem)
SELECT u.id, c.id, 'ativa', 'gratuita'
FROM auth.users u, ead.cursos c
WHERE u.email = 'dev@pense.ead.app'
  AND c.slug  = 'typescript-introducao'
ON CONFLICT (usuario_id, curso_id) DO NOTHING;

-- 6. Confirma tudo
SELECT u.email, u.email_confirmed_at, p.nome, p.papel
FROM auth.users u
JOIN pessoas.perfis p ON p.id = u.id
WHERE u.email = 'dev@pense.ead.app';
