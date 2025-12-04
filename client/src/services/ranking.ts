import { supabase } from "@/lib/supabase";

export async function submitScore(score: number) {
  const { data: session } = await supabase.auth.getSession();
  const user = session?.session?.user;
  const email = user?.email;

  if (!email || !user) {
    console.error("Usuário não logado!");
    return false;
  }

  // Buscar registro existente
  const { data: existing, error: selectError } = await supabase
    .from("scores")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (selectError) {
    console.error("Erro ao buscar score:", selectError);
  }

  // Se já existe, atualizar
  if (existing) {
    const total = existing.score + score;

    const { error: updateError } = await supabase
      .from("scores")
      .update({
          score: total,
          user_id: user.id // <--- GARANTIR QUE ATUALIZA O ID TAMBÉM
      })
      .eq("email", email);

    if (updateError) return false;
    return true;
  }

  // Criar novo registro
  const { error: insertError } = await supabase
    .from("scores")
    .insert({
      user_id: user.id, // <--- ADICIONE ESTA LINHA OBRIGATÓRIA
      email,
      player_name: user.user_metadata.full_name || "Jogador",
      score,
    });

  if (insertError) {
    console.error("Erro ao inserir novo score:", insertError);
    return false;
  }

  return true;
}

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