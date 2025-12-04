import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { taskDefinitions } from "@/data/tasks";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import FooterNav from "@/components/FooterNav";
import { Zap, Coins, Flame, ListTodo } from "lucide-react";

export default function TasksPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [claimed, setClaimed] = useState<Record<string, boolean>>({});
  const [claimingMap, setClaimingMap] = useState<Record<string, boolean>>({});
  const [scorePoints, setScorePoints] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  // 🚀 Carregamento do score
  useEffect(() => {
    if (!user) return;

    const loadScore = async () => {
      try {
        const { data: scoreData } = await supabase
          .from("scores")
          .select("score, best_streak")
          .eq("email", user.email)
          .maybeSingle();

        if (!scoreData) return;

        setScorePoints(scoreData.score ?? 0);
        setBestStreak(scoreData.best_streak ?? 0);
      } catch (err) {
        console.error(err);
      }
    };

    loadScore();
  }, [user]);

  // 🚀 Carregamento das task claims
  useEffect(() => {
    if (!user) return;

    const loadClaims = async () => {
      try {
        const { data: claimsData } = await supabase
          .from("task_claims")
          .select("task_key")
          .eq("user_id", user.id);

        const map: Record<string, boolean> = {};
        claimsData?.forEach((c) => (map[c.task_key] = true));
        setClaimed(map);
      } catch (err) {
        console.error(err);
        toast({
          title: "Erro ao carregar",
          description: "Não foi possível carregar as tarefas.",
        });
      }
    };

    loadClaims();
  }, [user, toast]);

  const corrects = Math.floor(scorePoints / 10);

  const claimReward = async (task: any) => {
    if (!user) {
      toast({ title: "Faça login para continuar." });
      return;
    }

    if (claimed[task.key]) {
      toast({ title: "Recompensa já coletada." });
      return;
    }

    setClaimed((s) => ({ ...s, [task.key]: true }));
    setClaimingMap((s) => ({ ...s, [task.key]: true }));

    const { error } = await supabase.rpc("claim_task_reward", {
      p_user_id: user.id,
      p_task_key: task.key,
      p_reward_boosters: task.rewardBoosters ?? 0,
      p_reward_coins: task.rewardCoins ?? 0,
    });

    if (error) {
      console.error(error);

      setClaimed((s) => {
        const copy = { ...s };
        delete copy[task.key];
        return copy;
      });

      toast({
        title: "Erro",
        description: "Não foi possível coletar essa recompensa.",
      });
    } else {
      toast({
        title: "Recompensa coletada!",
        description: `${task.rewardBoosters ?? 0} boosters + ${task.rewardCoins ?? 0} moedas`,
      });
    }

    setClaimingMap((s) => ({ ...s, [task.key]: false }));
  };

  return (
    <div className="min-h-screen bg-[#f5f6fa] pb-28 relative font-sans">

          {/* 🔵 HEADER CURVADO (Igual ao Ranking) */}
       <div className="bg-gradient-to-b from-[#003997] to-blue-500 h-[280px] w-full rounded-b-[40px] flex flex-col items-center pt-8 text-white relative z-0 shadow-lg">

            {/* Botão Voltar Absoluto */}
            <button
                      onClick={() => window.history.back()}
                      className="absolute left-4 top-4 text-white text-sm opacity-80"
                    >
                      ← Voltar
            </button>

            <div className="mt-6 flex flex-col items-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3 backdrop-blur-sm">
                    <ListTodo size={24} className="text-white" />
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight">Tarefas</h1>
            </div>
       </div>
      <div className="max-w-xl mx-auto pt-8 space-y-4">
        {taskDefinitions.map((task) => {
          let isCompleted = false;
          let progressValue = 0;
          let progressText = "";

          if (task.key === "perfect_10") {
            isCompleted = bestStreak >= 10;
            progressValue = Math.min(bestStreak, 10);
            progressText = `${progressValue} / 10`;
          } else {
            isCompleted = corrects >= task.required;
            progressValue = corrects;
            progressText = `${corrects} / ${task.required}`;
          }

          const isClaimed = claimed[task.key];
          const isClaiming = claimingMap[task.key];

          const progressPercent =
            task.key === "perfect_10"
              ? Math.min((bestStreak / 10) * 100, 100)
              : Math.min((corrects / task.required) * 100, 100);

          return (
            <div
              key={task.key}
              className="bg-white rounded-2xl shadow-lg p-4 flex items-center gap-4"
            >
              {/* ⬅️ LADO ESQUERDO: Informações */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-gray-900">
                    {task.label}
                  </h2>
                  {task.key === "perfect_10" && (
                    <Flame className="w-5 h-5 text-orange-500" />
                  )}
                </div>

                <p className="text-sm text-gray-600">
                  {task.key === "perfect_10"
                    ? "Acerte 10 perguntas seguidas sem errar em uma partida"
                    : `Acertos necessários: `}
                  {task.key !== "perfect_10" && (
                    <span className="font-semibold text-gray-900">
                      {task.required}
                    </span>
                  )}
                </p>

                {/* Recompensas com ícones */}
                <div className="flex items-center gap-3 text-sm">
                  {task.rewardBoosters > 0 && (
                    <div className="flex items-center gap-1 text-yellow-600">
                      <Zap size={16} strokeWidth={2.5} />
                      <span className="font-semibold">
                        {task.rewardBoosters} Booster
                      </span>
                    </div>
                  )}
                  {task.rewardCoins > 0 && (
                    <div className="flex items-center gap-1 text-orange-500">
                      <Coins size={16} strokeWidth={2.5} />
                      <span className="font-semibold">
                        {task.rewardCoins} Moedas
                      </span>
                    </div>
                  )}
                </div>

                {/* Barra de progresso */}
                <div className="pt-1">
                  <p className="text-xs text-gray-600 font-medium mb-1">
                    Progresso: <span className="font-bold">{progressText}</span>
                  </p>

                  <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        task.key === "perfect_10"
                          ? "bg-gradient-to-r from-orange-500 to-red-500"
                          : "bg-gradient-to-r from-blue-500 to-blue-600"
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* ➡️ LADO DIREITO: Botão arredondado */}
              <div className="flex-shrink-0">
                {isClaimed ? (
                  <button className="w-24 h-24 rounded-full bg-gray-300 text-gray-700 font-bold text-sm flex items-center justify-center cursor-not-allowed shadow-md">
                    Coletado
                    <span className="block text-xl mt-1">✓</span>
                  </button>
                ) : (
                  <button
                    onClick={() => claimReward(task)}
                    disabled={!isCompleted || isClaiming}
                    className={`w-24 h-24 rounded-full font-bold text-sm flex flex-col items-center justify-center shadow-lg transition-all ${
                      !isCompleted
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-gradient-to-br from-green-500 to-green-600 text-white hover:scale-105 active:scale-95"
                    }`}
                  >
                    {isClaiming ? (
                      <span className="text-xs">Coletando...</span>
                    ) : isCompleted ? (
                      <>
                        <span className="text-2xl mb-1">🎁</span>
                        <span>Coletar</span>
                      </>
                    ) : (
                      <>
                        <span className="text-2xl mb-1">🔒</span>
                        <span>Bloqueado</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <FooterNav />
    </div>
  );
}