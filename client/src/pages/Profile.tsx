import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Coins, Swords, Award, Lock, Zap } from "lucide-react";
import FooterNav from "@/components/FooterNav";
import { useAuth } from "@/hooks/useAuth";

// Titles progression with badge paths
const TITLES = [
  { minScore: 0, title: "Iniciando", desc: "Ler a Bíblia às vezes.", badge: "/badges/visitante.svg" },
  { minScore: 1500, title: "Leitor Bíblico", desc: "Ler a Bíblia com mais frequência.", badge: "/badges/leitor.svg" },
  { minScore: 3000, title: "Estudante Bíblico", desc: "Mantém constância no estudo Bíblico.", badge: "/badges/estudante.svg" },
  { minScore: 4500, title: "Pesquisador Bíblico", desc: "Aprofunda seus conhecimentos bíblicos.", badge: "/badges/pesquisador.svg" },
  { minScore: 6500, title: "Teólogo", desc: "Conhecedor Bíblico com nível consistente.", badge: "/badges/teologo.svg" },
  { minScore: 8500, title: "Apologeta", desc: "Conhecedor de conceitos Bíblico avançado.", badge: "/badges/apologeta.svg" },
  { minScore: 10000, title: "Exegeta", desc: "Um erudito que domina o conteúdo bíblico.", badge: "/badges/exegeta.svg" },
  { minScore: 20000, title: "Apóstolo", desc: "De tanto conhecimentos. Quase um escolhido de Jesus.", badge: "/badges/teologo.svg" }
];

function getTitleByScore(score) {
  let result = TITLES[0];
  for (const t of TITLES) {
    if (score >= t.minScore) result = t;
  }
  return result;
}

export default function ProfilePage() {
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [boosters, setBoosters] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const { user } = useAuth();

  // Estados de carregamento individuais (opcional, para animações)
  const [loadingScore, setLoadingScore] = useState(true);
  const [loadingInventory, setLoadingInventory] = useState(true);

  const title = getTitleByScore(score);
  const nextTitle = TITLES.find((t) => t.minScore > score) || null;
  const progress = nextTitle ? Math.min(100, (score / nextTitle.minScore) * 100) : 100;

  // Preload badge images
  useEffect(() => {
    TITLES.forEach(t => {
      if (t.badge) {
        const img = new Image();
        img.src = t.badge;
      }
    });
  }, []);

  // 🚀 CARREGAMENTO PARALELO E INDEPENDENTE
  useEffect(() => {
    const fetchScore = async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) {
        setLoadingScore(false);
        return;
      }

      const { data: scoreData } = await supabase
        .from("scores")
        .select("score")
        .eq("email", auth.user.email)
        .maybeSingle();

      setScore(scoreData?.score ?? 0);
      setLoadingScore(false);
    };

    fetchScore();
  }, []);

  useEffect(() => {
    const fetchInventory = async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) {
        setLoadingInventory(false);
        return;
      }

      const { data: inv } = await supabase
        .from("user_inventory")
        .select("coins, boosters")
        .eq("user_id", auth.user.id)
        .maybeSingle();

      setCoins(inv?.coins ?? 0);
      setBoosters(inv?.boosters ?? 0);
      setLoadingInventory(false);
    };

    fetchInventory();
  }, []);

  // Level up check (só roda após carregar o score)
  useEffect(() => {
    if (!user || loadingScore) return;

    const checkLevelUp = async () => {
      const { data: scoreRow } = await supabase
        .from("scores")
        .select("last_title")
        .eq("email", user.email)
        .maybeSingle();

      const savedTitle = scoreRow?.last_title || null;

      if (!savedTitle) {
        await supabase
          .from("scores")
          .update({ last_title: title.title })
          .eq("email", user.email);
        return;
      }

      if (savedTitle === title.title) return;

      setShowLevelUp(true);

      await supabase
        .from("scores")
        .update({ last_title: title.title })
        .eq("email", user.email);

      setTimeout(() => setShowLevelUp(false), 3000);
    };

    checkLevelUp();
  }, [user, loadingScore, title]);

  // ✨ RENDERIZAÇÃO IMEDIATA - sem loading state global
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#003997] to-blue-500 p-6 pb-20 flex justify-center">
      <div className="w-full max-w-xl space-y-6">

        {/* header */}
        <div className="text-center text-white space-y-1 drop-shadow-sm">
          <h1 className="text-4xl font-extrabold">Meu Perfil</h1>
          <p className="text-md opacity-90">Sua caminhada de estudos bíblicos</p>

          <div className="mt-3 flex justify-center">
            <img
              src={user?.user_metadata?.avatar_url}
              className="w-20 h-20 rounded-full border-4 border-white shadow-md"
              alt="avatar"
            />
          </div>

          <p className="mt-2 text-white font-semibold">{user?.user_metadata?.full_name || "Usuário"}</p>
        </div>

        {/* title card */}
        <div className="bg-white rounded-2xl shadow-md border border-black/10 p-5">
          <div className="flex items-center gap-3">
            <img src={title.badge} alt="badge" className="w-16 h-16 rounded-lg drop-shadow-lg" />
            <div>
              <h2 className="text-xl font-bold">{title.title}</h2>
              <p className="text-gray-600 text-sm">{title.desc}</p>
            </div>
          </div>

          {title && nextTitle && (
            <div className="mt-4">
              <p className="text-sm text-gray-700 font-medium">
                Progresso para: <span className="font-bold">{nextTitle.title}</span>
              </p>

              <div className="w-full bg-gray-200 h-3 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <p className="text-xs text-gray-600 mt-1">
                {score} / {nextTitle.minScore} pontos
              </p>
            </div>
          )}
        </div>

       <div className="grid grid-cols-3 gap-3">

         <div className="bg-white rounded-xl lg:rounded-full shadow-md border border-black/10 p-3 flex items-center gap-2">
           <Coins size={36} color="#fca311" strokeWidth={2.75} />
           <div>
             <p className="text-gray-700 text-xs">Moedas</p>
             <p className="text-xl font-bold">{coins}</p>
           </div>
         </div>

         <div className="bg-white rounded-xl lg:rounded-full shadow-md border border-black/10 p-3 flex items-center gap-2">
           <Swords size={36} color="#0080ff" strokeWidth={2.75} />
           <div>
             <p className="text-gray-700 text-xs">Pontos</p>
             <p className="text-xl font-bold">{score}</p>
           </div>
         </div>

         <div className="bg-white rounded-xl lg:rounded-full shadow-md border border-black/10 p-3 flex items-center gap-2">
           <Zap size={36} color="#efbb50" strokeWidth={2.75} />
           <div>
             <p className="text-gray-700 text-xs">Boosters</p>
             <p className="text-xl font-bold">{boosters}</p>
           </div>
         </div>

       </div>

        {/* badges gallery */}
        <div className="bg-white rounded-2xl shadow-md border border-black/10 p-5">
          <h3 className="text-xl font-bold mb-3">Coleção de Títulos</h3>

          <div className="grid grid-cols-4 gap-4">
            {TITLES.map((t) => {
              const unlocked = score >= t.minScore;
              return (
                <div key={t.title} className="flex flex-col items-center">
                  <div className="relative">
                    <img
                      src={t.badge}
                      alt={t.title}
                      className={`w-12 h-12 rounded-md transition-all ${unlocked ? "opacity-100 scale-100" : "opacity-30 grayscale scale-95"}`}
                    />
                    {!unlocked && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <Lock className="w-5 h-5 text-black/60" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-center mt-1">{t.title}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* level-up toast */}
        {showLevelUp && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center pointer-events-none">
            <div className="absolute inset-0 animate-fadeInEpic"></div>

            <div className="relative bg-white rounded-2xl px-6 py-5 shadow-2xl animate-fadeInEpic scale-100 text-center">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="absolute w-28 h-28 bg-yellow-300 rounded-full blur-xl opacity-30 animate-badgeGlow"></div>
              </div>

              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-10 h-10 bg-yellow-200 rounded-full opacity-0 blur-md"
                  style={{
                    animation: `particles 1.4s ease-out ${i * 0.1}s`,
                    left: ["-40px", "40px", "-20px", "20px"][i],
                    top: ["-20px", "-20px", "40px", "40px"][i],
                  }}
                ></div>
              ))}

              <img
                src={title.badge}
                alt="badge"
                className="relative z-10 w-24 h-24 mx-auto animate-badgePop"
              />

              <h2 className="relative z-10 mt-3 text-xl font-extrabold text-gray-900 animate-floatUp">
                Novo Título Desbloqueado!
              </h2>
              <p className="relative z-10 text-gray-700 animate-floatUp" style={{ animationDelay: "0.6s" }}>
                {title.title}
              </p>
            </div>
          </div>
        )}

      </div>
      <FooterNav />
    </div>
  );
}