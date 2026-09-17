-- Ver código completo das 3 funções handle_new_user
SELECT pronamespace::regnamespace AS schema, proname, prosrc 
FROM pg_proc 
WHERE proname = 'handle_new_user'
ORDER BY pronamespace::regnamespace;
