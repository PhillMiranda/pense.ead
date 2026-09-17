-- =========================================================
-- Fix definitivo: deleta e recria o superusuário dev
-- SQL Editor → New Query → Cole → Run
-- =========================================================

-- 1. Remove perfil (cascade não funciona de pessoas→auth, então manual)
DELETE FROM pessoas.perfis
WHERE id = (SELECT id FROM auth.users WHERE email = 'dev@pense.ead.app');

-- 2. Remove o usuário do auth (isso apaga tudo ligado a ele)
DELETE FROM auth.users WHERE email = 'dev@pense.ead.app';

-- 3. Recria o usuário com email já confirmado e senha definida
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'dev@pense.ead.app',
  crypt('PenseEAD@2025!', gen_salt('bf')),
  now(),
  '{"nome": "Dev Admin"}'::jsonb,
  now(),
  now()
);

-- 4. Cria o perfil manualmente (trigger vai rodar, mas ON CONFLICT garante)
INSERT INTO pessoas.perfis (id, nome)
SELECT id, 'Dev Admin'
FROM auth.users
WHERE email = 'dev@pense.ead.app'
ON CONFLICT (id) DO NOTHING;

-- 5. Matricula no curso de exemplo
INSERT INTO pessoas.matriculas (usuario_id, curso_id, status, origem)
SELECT u.id, c.id, 'ativa', 'gratuita'
FROM auth.users u, ead.cursos c
WHERE u.email = 'dev@pense.ead.app'
  AND c.slug  = 'typescript-introducao'
ON CONFLICT (usuario_id, curso_id) DO NOTHING;

-- 6. Confirma
SELECT u.email, u.email_confirmed_at, p.nome, p.papel
FROM auth.users u
JOIN pessoas.perfis p ON p.id = u.id
WHERE u.email = 'dev@pense.ead.app';
