-- =========================================================
-- Fix: recria a trigger de novo usuário apontando para
-- o schema "pessoas" correto.
-- SQL Editor → New Query → Cole → Run
-- =========================================================

-- Remove trigger antiga (qualquer versão)
DROP TRIGGER IF EXISTS ao_criar_usuario ON auth.users;

-- Remove função antiga do schema public (se existir)
DROP FUNCTION IF EXISTS public.lidar_novo_usuario();

-- Recria a função no schema pessoas (já deve existir, mas garante)
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

-- Recria a trigger apontando para pessoas.lidar_novo_usuario
CREATE TRIGGER ao_criar_usuario
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION pessoas.lidar_novo_usuario();

-- Confirma
SELECT tgname, pronamespace::regnamespace, proname
FROM pg_trigger t
JOIN pg_proc p ON p.oid = t.tgfoid
WHERE t.tgname = 'ao_criar_usuario';
