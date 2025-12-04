// services/social.ts
import { supabase } from "@/lib/supabase";

export async function followUser(friendId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não logado");

  // Verifica se já segue
  const { data: existing } = await supabase
    .from("friends")
    .select("*")
    .eq("user_id", user.id)
    .eq("friend_id", friendId)
    .single();

  if (existing) return { status: "already_following" };

  const { error } = await supabase
    .from("friends")
    .insert({ user_id: user.id, friend_id: friendId });

  if (error) throw error;
  return { status: "success" };
}