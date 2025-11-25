import { supabase } from "@/lib/supabase";

export async function submitScore(score: number) {

  const { data: session } = await supabase.auth.getSession();
  const email = session?.session?.user?.email;

  if (!email) {
    console.error("Usuário não logado!");
    return false;
  }

  // Buscar registro existente sem gerar erro
  const { data: existing, error: selectError } = await supabase
    .from("scores")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (selectError) {
    console.error("Erro ao buscar score existente:", selectError);
  }

  // Se já existe, atualizar somando
  if (existing) {
    const total = existing.score + score;

    const { error: updateError } = await supabase
      .from("scores")
      .update({ score: total })
      .eq("email", email);

    if (updateError) {
      console.error("Erro ao atualizar score:", updateError);
      return false;
    }

    return true;
  }

  // Criar novo registro
  const { error: insertError } = await supabase
    .from("scores")
    .insert({
      email,
      player_name: session.session.user.user_metadata.full_name,
      score,
    });

  if (insertError) {
    console.error("Erro ao inserir novo score:", insertError);
    return false;
  }

  return true;
}

// Ranking global
export async function getRanking(limit: number = 50) {
  const { data, error } = await supabase
    .from("scores")
    .select("*")
    .order("score", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Erro ao buscar ranking:", error);
    return [];
  }

  return data;
}
