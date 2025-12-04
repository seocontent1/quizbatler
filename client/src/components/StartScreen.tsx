import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Swords, Zap, Star, Shield, LockKeyhole, Crown, HelpCircle, Store as StoreIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { loginWithGoogle, logout } from "@/services/auth";
import { supabase } from "@/lib/supabase";
import FooterNav from "@/components/FooterNav";
import ChestReward from "@/components/ChestReward";
import { motion } from "framer-motion";
import { useLocation } from "wouter"; // 🔥 Importado para navegação rápida

const LEVEL_REQUIREMENTS = {
  easy: 0,
  medium: 500,
  hard: 1500,
  super: 3000,
} as const;

interface StartScreenProps {
  onStart: (difficulty: "easy" | "medium" | "hard" | "super") => void;
  boostsLeft: number;
}

export default function StartScreen({ onStart, boostsLeft }: StartScreenProps) {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { user, loading } = useAuth();
  const [coins, setCoins] = useState(0);
  const [score, setScore] = useState(0);
  const [guestMode, setGuestMode] = useState(
    localStorage.getItem("guestMode") === "true"
  );

  // 🔥 Hook de navegação do wouter
  const [, setLocation] = useLocation();

  useEffect(() => {
    async function loadUserData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: inv } = await supabase
        .from("user_inventory")
        .select("coins")
        .eq("user_id", user.id)
        .single();

      if (inv) setCoins(inv.coins);

      const { data: scoreData } = await supabase
        .from("scores")
        .select("score")
        .eq("email", user.email)
        .single();

      if (scoreData) {
        setScore(scoreData.score);
      }
    }

    loadUserData();
  }, []);

  function canPlayLevel(level: "easy" | "medium" | "hard" | "super") {
    if (!user && !guestMode) return false;
    return score >= LEVEL_REQUIREMENTS[level];
  }

  // Componente Auxiliar para o Cartão de Nível
  const LevelCard = ({
    level,
    label,
    desc,
    icon: Icon,
    colorClass,
    iconBg,
    req,
    onClick
  }: any) => {
    const locked = user && !canPlayLevel(level);
    const needLogin = !user && !guestMode;
    const isLocked = locked || needLogin;

    // Extrai a classe de cor do texto (ex: text-green-500) para aplicar ao fundo do ícone
    const iconBgClass = colorClass.split(" ").find((c: string) => c.startsWith("text-"))?.replace("text-", "bg-") || "bg-gray-500";

    return (
      <motion.button
        whileTap={!isLocked ? { scale: 0.98 } : {}}
        onClick={onClick}
        className={cn(
          "w-full relative overflow-hidden rounded-2xl p-4 transition-all border-b-4 text-left flex items-center gap-4",
          isLocked
            ? "bg-gray-100 border-gray-300 text-gray-400 grayscale"
            : `bg-white ${colorClass} shadow-lg hover:shadow-xl`
        )}
      >
        <div className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md",
          isLocked ? "bg-gray-300" : (iconBg || iconBgClass) // Usa a cor passada ou extraída
        )}>
           <Icon size={24} className="text-white" />
        </div>

        <div className="flex-1">
          <h3 className={cn("font-black text-lg uppercase", isLocked ? "text-gray-500" : "text-gray-800")}>
            {label}
          </h3>
          <p className="text-xs font-medium opacity-80 leading-tight">
            {needLogin
              ? "Faça login para liberar"
              : locked
                ? `Desbloqueia com ${req} pontos`
                : desc}
          </p>
        </div>

        {isLocked && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-gray-200/50 p-2 rounded-full">
            <LockKeyhole className="w-6 h-6 text-gray-500" />
          </div>
        )}
      </motion.button>
    );
  };

  return (
    <div className="min-h-screen flex flex-col pb-28 items-center justify-start relative bg-[#f5f6fa] font-sans">

      {/* 🔵 BACKGROUND CURVADO & DECORAÇÃO */}
      <div className="absolute top-0 left-0 w-full h-[45vh] bg-gradient-to-b from-[#003997] to-blue-500 z-0 rounded-b-[50px] shadow-2xl overflow-hidden">
         <div className="absolute inset-0 opacity-10 bg-[url('/character_sprites/bg.svg')] bg-cover bg-center mix-blend-overlay"></div>
         {/* Partículas decorativas */}
         <div className="absolute top-10 left-10 w-20 h-20 bg-white/5 rounded-full blur-2xl"></div>
         <div className="absolute bottom-10 right-10 w-32 h-32 bg-yellow-400/10 rounded-full blur-3xl"></div>
      </div>

      {/* 🎁 RECOMPENSA (Baú) */}
      <div className="absolute top-4 right-4 z-50">
        <ChestReward />
      </div>

      {/* 🟡 LOGO/TÍTULO */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 mt-8 mb-4 px-8"
      >
        <img
          src="/character_sprites/title.png"
          className="w-full max-w-[280px] drop-shadow-2xl mx-auto hover:scale-105 transition-transform duration-500"
          alt="Jesus Quiz Battle"
        />
      </motion.div>

      <div className="w-full max-w-md px-4 space-y-6 relative z-20">

        {/* 👤 PAINEL DO JOGADOR (Se logado) */}
        {!loading && user && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-white shadow-lg flex items-center gap-4"
          >
            <div className="relative">
                <img
                    src={user.user_metadata.avatar_url || "avatars/default.png"}
                    alt="Avatar"
                    className="w-14 h-14 rounded-full border-2 border-white shadow-sm"
                />
                <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-black text-[10px] font-bold px-1.5 rounded-full border border-white">
                    NV. {Math.floor(score/500) + 1}
                </div>
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs text-blue-100 uppercase font-bold tracking-wider">Bem-vindo,</p>
                <p className="font-bold text-lg truncate leading-tight">{user.user_metadata.full_name}</p>
                <div className="flex gap-3 mt-1 text-xs font-medium text-blue-50">
                    <span className="flex items-center gap-1">🪙 {coins}</span>
                    <span className="flex items-center gap-1">🏆 {score} pts</span>
                </div>
            </div>
            <button
                onClick={logout}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-xs text-blue-200 hover:text-white"
            >
                Sair
            </button>
          </motion.div>
        )}

        {/* 🛒 BOTÃO LOJA (Destaque) */}
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
                if (!user || guestMode) {
                  setShowLoginModal(true);
                  return;
                }
                // 🔥 CORREÇÃO: Usando setLocation para navegação SPA instantânea
                setLocation("/store");
            }}
            className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-white font-black text-lg py-4 rounded-2xl shadow-[0_4px_15px_rgba(251,191,36,0.4)] border-b-4 border-yellow-600 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-3 relative overflow-hidden group"
        >
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
            <div className="bg-white/20 p-1.5 rounded-full">
                <StoreIcon size={20} className="text-white" />
            </div>
            <span>LOJA DE ITENS</span>
        </motion.button>

        {/* 🎮 SELEÇÃO DE NÍVEIS */}
        <div className="space-y-3">
            <div className="flex items-center gap-2 px-2 mb-2">
                <Swords size={16} className="text-gray-400" />
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Modo Campanha</h2>
            </div>

            <LevelCard
                level="easy"
                label="Iniciante"
                desc="Ideal para começar sua jornada"
                req={LEVEL_REQUIREMENTS.easy}
                icon={Star}
                iconBg="bg-green-500"
                colorClass="border-green-500 text-green-500"
                onClick={() => {
                    if (!user && !guestMode) { setShowLoginModal(true); return; }
                    if (!canPlayLevel("easy")) return;
                    onStart("easy");
                }}
            />

            <LevelCard
                level="medium"
                label="Estudante"
                desc="Perguntas para quem estuda a palavra"
                req={LEVEL_REQUIREMENTS.medium}
                icon={Zap}
                iconBg="bg-blue-500"
                colorClass="border-blue-500 text-blue-500"
                onClick={() => {
                    if (!user) { setShowLoginModal(true); return; }
                    if (!canPlayLevel("medium")) return;
                    onStart("medium");
                }}
            />

            <LevelCard
                level="hard"
                label="Teólogo"
                desc="Desafios profundos para sábios"
                req={LEVEL_REQUIREMENTS.hard}
                icon={Crown}
                iconBg="bg-orange-500"
                colorClass="border-orange-500 text-orange-500"
                onClick={() => {
                    if (!user) { setShowLoginModal(true); return; }
                    if (!canPlayLevel("hard")) return;
                    onStart("hard");
                }}
            />

            <LevelCard
                level="super"
                label="Exegeta"
                desc="O nível supremo de conhecimento"
                req={LEVEL_REQUIREMENTS.super}
                icon={Shield}
                iconBg="bg-purple-600"
                colorClass="border-purple-600 text-purple-600"
                onClick={() => {
                    if (!user) { setShowLoginModal(true); return; }
                    if (!canPlayLevel("super")) return;
                    onStart("super");
                }}
            />
        </div>

        {/* ℹ️ COMO JOGAR */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
            <HelpCircle size={18} className="text-blue-500" />
            Regras do Jogo
          </h3>
          <ul className="space-y-3 text-sm text-gray-500 font-medium">
            <li className="flex items-start gap-2">
                <span className="text-green-500 text-lg leading-none">•</span>
                Responda rápido para causar mais dano no oponente.
            </li>
            <li className="flex items-start gap-2">
                <span className="text-blue-500 text-lg leading-none">•</span>
                Acumule pontos para desbloquear novos níveis.
            </li>
            <li className="flex items-start gap-2">
                <span className="text-red-500 text-lg leading-none">•</span>
                Cuidado! Erros dão chance para o inimigo atacar.
            </li>
            <li className="flex items-start gap-2">
                <span className="text-yellow-500 text-lg leading-none">•</span>
                Colete o baú diário para ganhar moedas grátis!
            </li>
          </ul>
        </div>

      </div>

      {/* MODAL DE LOGIN (Mantido Original) */}
      <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
        <DialogContent className="text-center max-w-sm rounded-2xl">
          <DialogHeader className="text-left">
            <DialogTitle className="text-xl">Faça login para continuar</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Você precisa estar logado para salvar seu progresso e acessar o ranking.
            </p>
          </DialogHeader>

          <div className="space-y-3 mt-4">
            <Button
              onClick={async () => {
                await loginWithGoogle();
                setShowLoginModal(false);
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-xl font-bold text-md shadow-lg transition-all"
            >
              Entrar com Google
            </Button>

            <div className="relative py-2">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-muted-foreground">Ou</span></div>
            </div>

            <Button
              variant="outline"
              onClick={() => {
                localStorage.setItem("guestMode", "true");
                setGuestMode(true);
                setShowLoginModal(false);
              }}
              className="w-full border-2 border-blue-100 text-blue-600 py-6 rounded-xl font-bold hover:bg-blue-50 transition-all"
            >
              Jogar como Convidado
            </Button>
            <p className="text-xs text-gray-400 text-center px-4">
              *Modo convidado não salva pontuação no ranking global.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <FooterNav />
    </div>
  );
}