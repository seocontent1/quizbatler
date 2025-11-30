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
  const [lastTitle, setLastTitle] = useState("");
  const { user, setUser } = useAuth();
  const [loadingData, setLoadingData] = useState(true);
  const nextTitle = TITLES.find((t) => t.minScore > score) || null;
  const progress = nextTitle ? Math.min(100, (score / nextTitle.minScore) * 100) : 100;

  // preload badge images
  useEffect(() => {
    TITLES.forEach(t => {
      if (t.badge) {
        const img = new Image();
        img.src = t.badge;
      }
    });
  }, []);

  useEffect(() => {
      const fetchData = async () => {
        const { data: auth } = await supabase.auth.getUser();
        if (!auth || !auth.user) {
          setLoadingData(false);
          return;
        }

        // SCORE
        const { data: scoreData } = await supabase
          .from("scores")
          .select("score")
          .eq("email", auth.user.email)
          .maybeSingle();

        setScore(scoreData?.score ?? 0);

        // INVENTORY
        const { data: inv } = await supabase
          .from("user_inventory")
          .select("coins, boosters")
          .eq("user_id", auth.user.id)
          .maybeSingle();

        setCoins(inv?.coins ?? 0);
        setBoosters(inv?.boosters ?? 0);

        // DESLIGA LOADING
        setLoadingData(false);
      };

      fetchData();
    }, []);

  const title = getTitleByScore(score);

  useEffect(() => {
    if (!user) return;
    if (loadingData) return; // ⛔ só roda quando os dados já carregaram

    const checkLevelUp = async () => {
      const { data: scoreRow } = await supabase
        .from("scores")
        .select("last_title")
        .eq("email", user.email)
        .maybeSingle();

      const savedTitle = scoreRow?.last_title || null;

      // primeira vez → salva e não mostra popup
      if (!savedTitle) {
        await supabase
          .from("scores")
          .update({ last_title: title.title })
          .eq("email", user.email);
        return;
      }

      // se não mudou → não mostra popup
      if (savedTitle === title.title) return;

      // mudou → popup
      setShowLevelUp(true);

      // salva o novo título
      await supabase
        .from("scores")
        .update({ last_title: title.title })
        .eq("email", user.email);

      setTimeout(() => setShowLevelUp(false), 3000);
    };

    checkLevelUp();
  }, [user, loadingData, title]);


if (loadingData) {
  return (
    <div className="min-h-screen p-6 flex justify-center">
      <div className="w-full max-w-xl space-y-6 animate-pulse">

        {/* Avatar + título */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 rounded-full bg-gray-200" />
          <div className="h-6 w-40 bg-gray-200 mx-auto rounded" />
          <div className="h-4 w-32 bg-gray-100 mx-auto rounded" />
        </div>

        {/* Card do título */}
        <div className="bg-gray-100 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-200 rounded-xl" />
            <div className="space-y-2 flex-1">
              <div className="h-5 w-32 bg-gray-100 rounded" />
              <div className="h-4 w-48 bg-gray-100 rounded" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="h-4 w-40 bg-gray-200 rounded" />
            <div className="h-3 w-full bg-gray-100 rounded" />
            <div className="h-3 w-24 bg-gray-200 rounded" />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-5">
          <div className="bg-gray-100 rounded-2xl p-5 flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded" />
            <div className="space-y-2">
              <div className="h-4 w-20 bg-gray-100 rounded" />
              <div className="h-5 w-14 bg-gray-200 rounded" />
            </div>
          </div>

          <div className="bg-gray-100 rounded-2xl p-5 flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded" />
            <div className="space-y-2">
              <div className="h-4 w-20 bg-gray-100 rounded" />
              <div className="h-5 w-14 bg-gray-200 rounded" />
            </div>
          </div>
        </div>

        {/* Boosters */}
        <div className="bg-gray-100 rounded-2xl p-5 flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded" />
          <div className="space-y-2">
            <div className="h-4 w-20 bg-gray-100 rounded" />
            <div className="h-5 w-12 bg-gray-200 rounded" />
          </div>
        </div>

        {/* Badges */}
        <div className="bg-gray-100 rounded-2xl p-5">
          <div className="h-5 w-40 bg-gray-200 rounded mb-4" />
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-2 flex flex-col items-center">
                <div className="w-12 h-12 bg-gray-100 rounded-md" />
                <div className="h-3 w-14 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

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
                  className="h-full bg-blue-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <p className="text-xs text-gray-600 mt-1">
                {score} / {nextTitle.minScore} pontos
              </p>
            </div>
          )}
        </div>

        {/* stats */}
        <div className="grid grid-cols-3 gap-5">
          <div className="bg-white rounded-full shadow-md border border-black/10 p-5 flex items-center gap-3">
            <Coins size={40} color="#fca311" strokeWidth={1.75} />
            <div>
              <p className="text-gray-700 text-sm">Moedas</p>
              <p className="text-2xl font-bold">{coins}</p>
            </div>
          </div>

          <div className="bg-white rounded-full shadow-md border border-black/10 p-5 flex items-center gap-3">
            <Swords size={40} color="#0080ff" strokeWidth={1.75} />
            <div>
              <p className="text-gray-700 text-sm">Score Total</p>
              <p className="text-2xl font-bold">{score}</p>
            </div>
          </div>

             {/* BOOSTERS */}
            <div className="bg-white rounded-full shadow-md border border-black/10 p-5 flex items-center gap-3">
              <Zap size={40} color="#efbb50" strokeWidth={1.75} />
              <div>
                <p className="text-sm text-gray-700">Boosters</p>
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

            {/* fundo escuro suave */}
            <div className="absolute inset-0 animate-fadeInEpic"></div>

            {/* container principal */}
            <div className="relative bg-white rounded-2xl px-6 py-5 shadow-2xl animate-fadeInEpic scale-100 text-center">

              {/* glow atrás da badge */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="absolute w-28 h-28 bg-yellow-300 rounded-full blur-xl opacity-30 animate-badgeGlow"></div>
              </div>

              {/* particles (4 explosões ao redor) */}
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

              {/* badge */}
              <img
                src={title.badge}
                alt="badge"
                className="relative z-10 w-24 h-24 mx-auto animate-badgePop"
              />

              {/* textos */}
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
