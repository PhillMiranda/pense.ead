-- =========================================================
-- Passo 1: Ver o código da trigger que bloqueia
-- Cole APENAS isso primeiro para entender o que ela valida
-- =========================================================
SELECT prosrc 
FROM pg_proc 
WHERE proname = 'handle_new_user';
