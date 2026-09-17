// API de cursos — usa schema "ead" e "pessoas"
import { supabase } from "../supabaseClient.js";

export async function listarMeusCursos() {
  const { data: matriculas, error } = await supabase
    .schema("pessoas")
    .from("matriculas")
    .select("id, status, curso:ead.cursos(id, titulo, slug, capa_url)")
    .eq("status", "ativa");

  if (error) throw error;

  const cursosComProgresso = await Promise.all(
    matriculas.map(async (m) => {
      const progresso = await calcularProgressoCurso(m.curso.id);
      return { ...m.curso, progresso };
    })
  );

  return cursosComProgresso;
}

export async function calcularProgressoCurso(cursoId) {
  const { data: aulas, error: erroAulas } = await supabase
    .schema("ead")
    .from("aulas")
    .select("id, modulo:modulos!inner(curso_id)")
    .eq("modulo.curso_id", cursoId);

  if (erroAulas) throw erroAulas;
  if (!aulas.length) return 0;

  const { data: concluidas, error: erroProgresso } = await supabase
    .schema("pessoas")
    .from("progresso_aulas")
    .select("aula_id")
    .eq("concluida", true)
    .in("aula_id", aulas.map((a) => a.id));

  if (erroProgresso) throw erroProgresso;
  return Math.round((concluidas.length / aulas.length) * 100);
}

export async function buscarCursoPorSlug(slug) {
  const { data: curso, error } = await supabase
    .schema("ead")
    .from("cursos")
    .select("id, titulo, slug, descricao, capa_url, preco_centavos, modulos(id, titulo, ordem, aulas(id, titulo, tipo, ordem))")
    .eq("slug", slug)
    .eq("status", "publicado")
    .single();

  if (error) throw error;
  curso.modulos.sort((a, b) => a.ordem - b.ordem);
  curso.modulos.forEach((m) => m.aulas.sort((a, b) => a.ordem - b.ordem));
  return curso;
}

export async function estaMatriculado(cursoId) {
  const { data, error } = await supabase
    .schema("pessoas")
    .from("matriculas")
    .select("id")
    .eq("curso_id", cursoId)
    .eq("status", "ativa")
    .maybeSingle();

  if (error) throw error;
  return Boolean(data);
}

export async function matricularEmCursoGratuito(cursoId) {
  const { error } = await supabase
    .schema("pessoas")
    .from("matriculas")
    .insert({ curso_id: cursoId, status: "ativa", origem: "gratuita" });

  if (error) throw error;
}

export async function buscarAula(aulaId) {
  const { data, error } = await supabase
    .schema("ead")
    .from("aulas")
    .select("id, titulo, tipo, youtube_video_id, conteudo_texto, modulo_id")
    .eq("id", aulaId)
    .single();

  if (error) throw error;
  return data;
}
