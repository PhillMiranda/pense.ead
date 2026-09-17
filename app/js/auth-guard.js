// Protege páginas que exigem login e expõe o usuário + perfil.
import { supabase } from "./supabaseClient.js";

export async function exigirLogin() {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    const destino = encodeURIComponent(location.pathname + location.search);
    location.href = `login.html?redirect=${destino}`;
    await new Promise(() => {});
  }

  const usuario = session.user;

  const { data: perfil, error } = await supabase
    .schema("pessoas")
    .from("perfis")
    .select("*")
    .eq("id", usuario.id)
    .single();

  if (error) console.error("Não foi possível carregar o perfil:", error);

  return { usuario, perfil };
}

export async function sair() {
  await supabase.auth.signOut();
  location.href = "/";
}
