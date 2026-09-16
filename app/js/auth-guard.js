// Protege páginas que exigem login e expõe o usuário atual + o perfil dele.
// Uso em qualquer página protegida:
//
//   import { exigirLogin } from "./auth-guard.js";
//   const { usuario, perfil } = await exigirLogin();
//
import { supabase } from "./supabaseClient.js";

/**
 * Garante que existe uma sessão ativa. Se não houver, redireciona para o
 * login (guardando a página atual para voltar depois de autenticar).
 * @returns {Promise<{ usuario: object, perfil: object }>}
 */
export async function exigirLogin() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    const destino = encodeURIComponent(location.pathname + location.search);
    location.href = `login.html?redirect=${destino}`;
    // interrompe a execução do restante da página enquanto redireciona
    await new Promise(() => {});
  }

  const usuario = session.user;

  const { data: perfil, error } = await supabase
    .from("perfis")
    .select("*")
    .eq("id", usuario.id)
    .single();

  if (error) {
    console.error("Não foi possível carregar o perfil do usuário:", error);
  }

  return { usuario, perfil };
}

/** Encerra a sessão e volta para a página de login. */
export async function sair() {
  await supabase.auth.signOut();
  location.href = "login.html";
}
