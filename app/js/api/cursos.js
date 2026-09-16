// Funções de acesso a dados relacionadas a cursos/módulos/aulas.
// Mantidas isoladas das páginas para que, no futuro, uma página possa ser
// reescrita em React sem precisar reescrever a lógica de acesso ao banco.
import { supabase } from "../supabaseClient.js";

/** Lista os cursos em que o aluno logado está matriculado, com % de progresso. */
export async function listarMeusCursos() {
  const { data: matriculas, error } = await supabase
    .from("matriculas")
    .select("id, status, curso:cursos(id, titulo, slug, capa_url)")
    .eq("status", "ativa");

  if (error) throw error;

  // Progresso é calculado por curso: aulas concluídas / total de aulas.
  const cursosComProgresso = await Promise.all(
    matriculas.map(async (m) => {
      const progresso = await calcularProgressoCurso(m.curso.id);
      return { ...m.curso, progresso };
    })
  );

  return cursosComProgresso;
}

/** Retorna 0–100 representando quanto do curso já foi concluído pelo aluno logado. */
export async function calcularProgressoCurso(cursoId) {
  const { data: aulas, error: erroAulas } = await supabase
    .from("aulas")
    .select("id, modulo:modulos!inner(curso_id)")
    .eq("modulo.curso_id", cursoId);
  if (erroAulas) throw erroAulas;
  if (!aulas.length) return 0;

  const { data: concluidas, error: erroProgresso } = await supabase
    .from("progresso_aulas")
    .select("aula_id")
    .eq("concluida", true)
    .in(
      "aula_id",
      aulas.map((a) => a.id)
    );
  if (erroProgresso) throw erroProgresso;

  return Math.round((concluidas.length / aulas.length) * 100);
}

/** Busca um curso publicado pelo slug, com seus módulos e aulas (metadados). */
export async function buscarCursoPorSlug(slug) {
  const { data: curso, error } = await supabase
    .from("cursos")
    .select(
      "id, titulo, slug, descricao, capa_url, preco_centavos, modulos(id, titulo, ordem, aulas(id, titulo, tipo, ordem))"
    )
    .eq("slug", slug)
    .eq("status", "publicado")
    .single();

  if (error) throw error;

  curso.modulos.sort((a, b) => a.ordem - b.ordem);
  curso.modulos.forEach((m) => m.aulas.sort((a, b) => a.ordem - b.ordem));

  return curso;
}

/** Verifica se o aluno logado tem matrícula ativa no curso. */
export async function estaMatriculado(cursoId) {
  const { data, error } = await supabase
    .from("matriculas")
    .select("id")
    .eq("curso_id", cursoId)
    .eq("status", "ativa")
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

/** Cria a matrícula para um curso gratuito (cursos pagos passam pelo checkout, não por aqui). */
export async function matricularEmCursoGratuito(cursoId) {
  const { error } = await supabase
    .from("matriculas")
    .insert({ curso_id: cursoId, status: "ativa", origem: "gratuita" });
  if (error) throw error;
}

/** Busca uma aula específica (só retorna dados se o aluno estiver matriculado — garantido pela RLS). */
export async function buscarAula(aulaId) {
  const { data, error } = await supabase
    .from("aulas")
    .select("id, titulo, tipo, youtube_video_id, conteudo_texto, modulo_id")
    .eq("id", aulaId)
    .single();
  if (error) throw error;
  return data;
}
