import { supabase } from "@/lib/supabase";
import { Capacitor } from "@capacitor/core";

export async function loginWithGoogle() {
  const isMobile = Capacitor.isNativePlatform();

  const redirectTo = isMobile
    ? "com.jesusquiz.battle33://auth/callback"
    : window.location.origin; // web → ex: https://meusite.com

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      flow: "pkce",
    },
  });

  if (!error) {
    localStorage.removeItem("guestMode");
  }

  return { data, error };
}

export async function logout() {
  await supabase.auth.signOut();
  localStorage.removeItem("guestMode");
}