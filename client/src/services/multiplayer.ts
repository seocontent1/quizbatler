import { supabase } from "@/lib/supabase";
import { MOCK_QUESTIONS } from "@/data/question";

// Configuração do LocalStorage (Mesma do Single Player)
const STORAGE_KEY = "quiz_progress_v1";
const COOLDOWN_DAYS = 30;
const COOLDOWN_MS = COOLDOWN_DAYS * 24 * 60 * 60 * 1000;

// 🔥 Algoritmo Fisher-Yates: O padrão ouro para embaralhamento aleatório.
function fisherYatesShuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Função auxiliar para filtrar questões já respondidas
function getAvailableQuestions(): any[] {
  let pool = [...MOCK_QUESTIONS];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const store = JSON.parse(raw);
      const now = Date.now();
      const cutoff = now - COOLDOWN_MS;

      // Pega IDs de perguntas respondidas nos últimos 30 dias
      const recentIds = new Set(
        store.answered
          .filter((a: any) => a.ts > cutoff)
          .map((a: any) => a.id)
      );

      // Filtra o pool removendo as recentes
      const filtered = pool.filter(q => !recentIds.has(q.id));

      console.log(`Pool original: ${pool.length}. Filtradas (30 dias): ${filtered.length}`);

      // Se sobrar poucas perguntas (ex: menos de 20), usa o pool completo para não quebrar o jogo
      if (filtered.length >= 20) {
        return filtered;
      }
    }
  } catch (e) {
    console.error("Erro ao ler progresso local:", e);
  }

  return pool;
}

export async function createMatchInvite(friendId: string) {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error("Não logado");

  // 1. Pega perguntas disponíveis (excluindo as respondidas recentemente)
  const availableQuestions = getAvailableQuestions();

  // 2. Embaralha TODAS as perguntas disponíveis
  const shuffled = fisherYatesShuffle(availableQuestions);

  // 3. Mapeia os IDs na ordem sorteada
  const selectedIds = shuffled.map(q => q.id);

  // Debug
  console.log(`Perguntas sorteadas para a partida: ${selectedIds.length}`);

  const { data, error } = await supabase
    .from("matches")
    .insert({
      player1_id: user.user.id,
      player2_id: friendId,
      status: "pending",
      question_ids: selectedIds,
      player1_score: 0,
      player2_score: 0
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function acceptMatch(matchId: string) {
  const { error } = await supabase
    .from("matches")
    .update({ status: "playing" })
    .eq("id", matchId);

  if (error) throw error;
}

export async function updateMatchScore(matchId: string, isPlayer1: boolean, newScore: number) {
  const field = isPlayer1 ? "player1_score" : "player2_score";

  await supabase
    .from("matches")
    .update({ [field]: newScore })
    .eq("id", matchId);
}

export async function finishMatch(matchId: string, isPlayer1: boolean) {
  const field = isPlayer1 ? "player1_done" : "player2_done";

  await supabase
    .from("matches")
    .update({ [field]: true })
    .eq("id", matchId);
}