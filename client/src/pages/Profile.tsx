import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Coins, Swords, Award, Lock, Zap, Users, ArrowLeft } from "lucide-react";
import FooterNav from "@/components/FooterNav";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";

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

  // ✨ LAYOUT RESPONSIVO E COM SCROLL CORRETO
  return (
    <div className="min-h-screen bg-[#f5f6fa] relative pb-20 font-sans">

      {/* HEADER AZUL FIXO NO TOPO */}
      <div className="bg-gradient-to-b from-[#003997] to-blue-500 h-[380px] w-full rounded-b-[40px] flex flex-col items-center pt-8 text-white relative z-0 shadow-xl px-4">

        <button
          onClick={() => window.history.back()}
          className="absolute left-4 top-6 text-white/80 hover:text-white flex items-center gap-1 text-sm font-medium transition-colors hover:bg-white/10 px-3 py-1 rounded-full"
        >
          <ArrowLeft size={18} /> Voltar
        </button>

        <div className="text-center space-y-2 mt-2">
            <div className="w-12 h-12 bg-white/20 rounded-full inline-flex items-center justify-center backdrop-blur-md mb-2">
              <Users size={24} className="text-white" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Meu Perfil</h1>
            <p className="text-blue-100 text-sm opacity-90">Sua caminhada de estudos bíblicos</p>

            <div className="mt-4 flex flex-col items-center">
                <div className="p-1 bg-white/20 rounded-full">
                    <img
                    src={user?.user_metadata?.avatar_url}
                    className="w-24 h-24 rounded-full border-4 border-white shadow-2xl object-cover"
                    alt="avatar"
                    />
                </div>
                <p className="mt-3 text-xl font-bold text-white tracking-wide drop-shadow-md">
                    {user?.user_metadata?.full_name || "Usuário"}
                </p>
            </div>
        </div>
      </div>

      {/* CONTEÚDO PRINCIPAL (Flutuando sobre o header) */}
      <div className="px-4 -mt-10 relative z-10 max-w-xl mx-auto space-y-6">

        {/* title card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-50 rounded-2xl">
                <img src={title.badge} alt="badge" className="w-16 h-16 drop-shadow-sm" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-gray-800">{title.title}</h2>
              <p className="text-gray-500 text-sm leading-tight mt-1">{title.desc}</p>
            </div>
          </div>

          {title && nextTitle && (
            <div className="mt-5">
              <div className="flex justify-between items-end mb-2">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                  Próximo: <span className="text-blue-600">{nextTitle.title}</span>
                </p>
                <p className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded-lg">
                  {score} / {nextTitle.minScore} pts
                </p>
              </div>

              <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-700 ease-out rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 flex flex-col items-center justify-center text-center gap-1 hover:shadow-md transition-shadow">
                <Coins size={28} className="text-yellow-500 mb-1" strokeWidth={2.5} />
                <p className="text-xl font-black text-gray-800">{coins}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Moedas</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 flex flex-col items-center justify-center text-center gap-1 hover:shadow-md transition-shadow">
                <Swords size={28} className="text-blue-500 mb-1" strokeWidth={2.5} />
                <p className="text-xl font-black text-gray-800">{score}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Pontos</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 flex flex-col items-center justify-center text-center gap-1 hover:shadow-md transition-shadow">
                <Zap size={28} className="text-orange-400 mb-1" strokeWidth={2.5} />
                <p className="text-xl font-black text-gray-800">{boosters}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Boosters</p>
            </div>
        </div>

        {/* badges gallery */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
              Sua Coleção
          </h3>

          <div className="grid grid-cols-4 gap-y-6 gap-x-2">
            {TITLES.map((t) => {
              const unlocked = score >= t.minScore;
              return (
                <div key={t.title} className="flex flex-col items-center group">
                  <div className="relative mb-2">
                    <img
                      src={t.badge}
                      alt={t.title}
                      className={`w-14 h-14 transition-all duration-300 ${
                          unlocked
                          ? "opacity-100 scale-100 drop-shadow-md group-hover:scale-110"
                          : "opacity-20 grayscale scale-90"
                      }`}
                    />
                    {!unlocked && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-gray-200/80 p-1.5 rounded-full">
                            <Lock className="w-4 h-4 text-gray-500" />
                        </div>
                      </div>
                    )}
                  </div>
                  <p className={`text-[10px] text-center font-medium leading-tight px-1 ${unlocked ? "text-gray-700" : "text-gray-400"}`}>
                      {t.title}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* level-up toast */}
        {showLevelUp && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center pointer-events-none p-4">
            <div className="absolute inset-0 animate-fadeInEpic bg-black/20 backdrop-blur-sm"></div>

            <div className="relative bg-white rounded-3xl px-8 py-8 shadow-2xl animate-fadeInEpic scale-100 text-center w-full max-w-sm border-4 border-yellow-100">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="absolute w-40 h-40 bg-yellow-300 rounded-full blur-2xl opacity-40 animate-badgeGlow"></div>
              </div>

              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-3 h-3 bg-yellow-400 rounded-full opacity-0"
                  style={{
                    animation: `particles 1.2s ease-out ${i * 0.1}s`,
                    left: "50%",
                    top: "50%",
                    transform: `rotate(${i * 60}deg) translate(80px)`,
                  }}
                ></div>
              ))}

              <img
                src={title.badge}
                alt="badge"
                className="relative z-10 w-32 h-32 mx-auto animate-badgePop drop-shadow-xl"
              />

              <h2 className="relative z-10 mt-6 text-2xl font-black text-gray-800 animate-floatUp uppercase tracking-tight">
                Novo Título!
              </h2>
              <p className="relative z-10 text-blue-600 font-bold text-lg animate-floatUp mt-1" style={{ animationDelay: "0.2s" }}>
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