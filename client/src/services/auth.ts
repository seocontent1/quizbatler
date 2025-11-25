import { supabase } from "@/lib/supabase";

export async function loginWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
  });

  // Se logar → desativa modo convidado
  if (!error) {
    localStorage.removeItem("guestMode");
  }

  return { data, error };
}

export async function logout() {
  await supabase.auth.signOut();

  // Sair também encerra modo convidado
  localStorage.removeItem("guestMode");
}

