-- =========================================================
-- Fix: garante que o superusuário dev tem perfil criado
-- SQL Editor → New Query → Cole → Run
-- =========================================================

-- Cria o perfil do dev caso não exista
INSERT INTO pessoas.perfis (id, nome)
SELECT id, 'Dev Admin'
FROM auth.users
WHERE email = 'dev@pense.ead.app'
ON CONFLICT (id) DO NOTHING;

-- Confirma
SELECT u.email, p.nome, p.papel, p.criado_em
FROM auth.users u
LEFT JOIN pessoas.perfis p ON p.id = u.id
WHERE u.email = 'dev@pense.ead.app';
