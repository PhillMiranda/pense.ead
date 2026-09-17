-- =========================================================
-- Fix: confirma email e cria perfil do superusuário dev
-- SQL Editor → New Query → Cole → Run
-- =========================================================

-- Confirma o email do dev (sem a coluna gerada confirmed_at)
UPDATE auth.users 
SET email_confirmed_at = now()
WHERE email = 'dev@pense.ead.app';

-- Cria o perfil caso não exista
INSERT INTO pessoas.perfis (id, nome)
SELECT id, 'Dev Admin'
FROM auth.users
WHERE email = 'dev@pense.ead.app'
ON CONFLICT (id) DO NOTHING;

-- Confirma resultado
SELECT email, email_confirmed_at FROM auth.users 
WHERE email = 'dev@pense.ead.app';
