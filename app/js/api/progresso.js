import { supabase } from "../supabaseClient.js";

/** Marca (ou atualiza) uma aula como concluída para o aluno logado. */
export async function marcarAulaConcluida(aulaId) {
  const { data: sessao } = await supabase.auth.getSession();
  const usuarioId = sessao.session.user.id;

  const { error } = await supabase.from("progresso_aulas").upsert(
    {
      usuario_id: usuarioId,
      aula_id: aulaId,
      concluida: true,
      concluida_em: new Date().toISOString(),
    },
    { onConflict: "usuario_id,aula_id" }
  );

  if (error) throw error;
}

/** Retorna o conjunto de IDs de aulas já concluídas pelo aluno logado, dentro de uma lista de aulas. */
export async function aulasConcluidas(aulaIds) {
  if (!aulaIds.length) return new Set();

  const { data, error } = await supabase
    .from("progresso_aulas")
    .select("aula_id")
    .eq("concluida", true)
    .in("aula_id", aulaIds);

  if (error) throw error;
  return new Set(data.map((linha) => linha.aula_id));
}
