// API de progresso — usa schema "pessoas"
import { supabase } from "../supabaseClient.js";

export async function marcarAulaConcluida(aulaId) {
  const { data: sessao } = await supabase.auth.getSession();
  const usuarioId = sessao.session.user.id;

  const { error } = await supabase
    .schema("pessoas")
    .from("progresso_aulas")
    .upsert(
      { usuario_id: usuarioId, aula_id: aulaId, concluida: true, concluida_em: new Date().toISOString() },
      { onConflict: "usuario_id,aula_id" }
    );

  if (error) throw error;
}

export async function aulasConcluidas(aulaIds) {
  if (!aulaIds.length) return new Set();

  const { data, error } = await supabase
    .schema("pessoas")
    .from("progresso_aulas")
    .select("aula_id")
    .eq("concluida", true)
    .in("aula_id", aulaIds);

  if (error) throw error;
  return new Set(data.map((l) => l.aula_id));
}
