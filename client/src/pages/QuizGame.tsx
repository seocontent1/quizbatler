import { useState, useEffect, useRef } from "react";
import BattleArena from "@/components/BattleArena";
import QuestionCard from "@/components/QuestionCard";
import AnswerButton from "@/components/AnswerButton";
import GameOverModal from "@/components/GameOverModal";
import StartScreen from "@/components/StartScreen";
import Timer from "@/components/Timer";
import { Progress } from "@/components/ui/progress";
import { MOCK_QUESTIONS } from "@/data/question";
import { submitScore } from "@/services/ranking";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { Swords, Zap, Crown, Eye, ClockPlus, ArrowLeft, LogOut, AlertTriangle, Snowflake, Trophy } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { loginWithGoogle } from "@/services/auth";
import { motion } from "framer-motion";

//sprites
import PLAYER_IDLE from "/character_sprites/jesus.png";
import PLAYER_ATK from "/character_sprites/atk.png";
import PLAYER_REV from "/character_sprites/rev.png";
import ENEMY_IDLE from "/character_sprites/enemy.png";
import ENEMY_HIT from "/character_sprites/enemy_hit.png";
import ENEMY_ATK from "/character_sprites/luc_atk.png";

type Question = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: string;
};

const TIME_PER_LEVEL = {
  easy: 10,
  medium: 10,
  hard: 20,
  super: 20,
} as const;

const COOLDOWN_MS = 12 * 60 * 60 * 1000;
const STORAGE_KEY = "quiz_progress_v1";
type AnswerRecord = { id: string; ts: number };
type ProgressStore = { answered: AnswerRecord[] };

function loadProgress(): ProgressStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { answered: [] };
    return JSON.parse(raw) as ProgressStore;
  } catch {
    return { answered: [] };
  }
}

function saveProgress(store: ProgressStore) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {}
}

function addAnswered(id: string) {
  const store = loadProgress();
  const exists = store.answered.find((a) => a.id === id);
  if (exists) {
    exists.ts = Date.now();
  } else {
    store.answered.push({ id, ts: Date.now() });
  }
  saveProgress(store);
}

function pruneAnswered(olderThanMs: number) {
  const store = loadProgress();
  const cutoff = Date.now() - olderThanMs;
  store.answered = store.answered.filter((rec) => rec.ts >= cutoff);
  saveProgress(store);
}

function answeredIds() {
  return loadProgress().answered.map((a) => a.id);
}

function prepareQuestionsFiltered(allQuestions: any[], difficulty?: string, amount?: number) {
  const excluded = new Set(answeredIds());
  let pool = allQuestions.filter((q) => !excluded.has(q.id));
  if (difficulty) {
    pool = pool.filter((q) => q.difficulty === difficulty);
  }
  if (pool.length === 0) pool = allQuestions;
  const shuffled = shuffleArray(pool);
  const selected = typeof amount === "number" ? shuffled.slice(0, amount) : shuffled;
  return selected.map((q) => shuffleOptions(q));
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function shuffleOptions(question: any) {
  const originalOptions = question.options ?? [];
  const options = shuffleArray(originalOptions);
  const correctValue = originalOptions[question.correctAnswer];
  return {
    ...question,
    options,
    correctAnswer: options.indexOf(correctValue),
  };
}

function prepareQuestions(allQuestions: any[], difficulty?: string, amount?: number) {
  let pool = allQuestions;
  if (difficulty) {
    pool = allQuestions.filter((q) => q.difficulty === difficulty);
    if (pool.length === 0) pool = allQuestions;
  }
  const shuffled = shuffleArray(pool);
  const selected = typeof amount === "number" ? shuffled.slice(0, amount) : shuffled;
  return selected.map((q) => shuffleOptions(q));
}

type AnimationState = "idle" | "attack" | "hit" | "victory";

export default function QuizGame() {
  const [boostsLeft, setBoostsLeft] = useState(0);
  const [timerPaused, setTimerPaused] = useState(false);
  const [usedFreezer, setUsedFreezer] = useState(false);
  const { user, loading } = useAuth();
  const guestMode = localStorage.getItem("guestMode") === "true";
  const [extraTimeEvent, setExtraTimeEvent] = useState(0);
  const [extraTimeAmount, setExtraTimeAmount] = useState(0);
  const [usedReveal, setUsedReveal] = useState(false);
  const [revealAnswer, setRevealAnswer] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const isBlocked = !user || guestMode;
  const [showHolyBlast, setShowHolyBlast] = useState(false);
  const [sessionCoins, setSessionCoins] = useState(0);
  const coinsAwardedRef = useRef(false);
  const [earnedThisMatch, setEarnedThisMatch] = useState(0);
  const [showRevealEffect, setShowRevealEffect] = useState(false);
  const [revealEffectData, setRevealEffectData] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // 🔥 NOVO: Rastreamento de streak na partida atual
  const [currentMatchStreak, setCurrentMatchStreak] = useState(0);
  const [bestMatchStreak, setBestMatchStreak] = useState(0);

  const openConfirmPopup = () => setShowConfirm(true);
  const cancelReturn = () => setShowConfirm(false);

  const [index, setIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const questions = MOCK_QUESTIONS as Question[];

  useEffect(() => {
    [
      PLAYER_IDLE,
      PLAYER_ATK,
      PLAYER_REV,
      ENEMY_IDLE,
      ENEMY_HIT,
      ENEMY_ATK
    ].forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  const confirmReturn = () => {
    setShowConfirm(false);
    handleReturnHome();
  };

  const FREEZER_COST = 8;
  const REVEAL_COST = 10;

  const [usedBoosts, setUsedBoosts] = useState({
    10: false,
    20: false,
    30: false,
  });

  const BOOST_COST: Record<number, number> = {
    10: 1,
    20: 2,
    30: 3,
  };

  const useFreezer = async () => {
    if (usedFreezer || boostsLeft < 8) return;
    setTimerPaused(true);
    setUsedFreezer(true);
    await supabase.rpc("decrement_boosters", {
      amount_to_subtract: 8,
    });
    setBoostsLeft(prev => prev - 8);
  };

  const useReveal = async () => {
    if (usedReveal || boostsLeft < REVEAL_COST) return;
    await supabase.rpc("decrement_boosters", {
      amount_to_subtract: REVEAL_COST,
    });
    setBoostsLeft(prev => prev - REVEAL_COST);
    setRevealAnswer(true);
    setUsedReveal(true);
    setPlayerAnimation("reveal");
    setPlayerImage(PLAYER_REV);
    setShowRevealEffect(true);
    setRevealEffectData({
      startX: window.innerWidth / 2,
      startY: 200
    });
  };

  async function refreshBoosters() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("user_inventory")
      .select("boosters")
      .eq("user_id", user.id)
      .single();
    if (data) setBoostsLeft(data.boosters);
  }

  async function consumeBooster(amount: number) {
    const cost = BOOST_COST[amount];
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.rpc("decrement_boosters", {
      amount_to_subtract: cost,
    });
    if (error) {
      console.error("Erro ao descontar booster:", error);
      return;
    }
    await refreshBoosters();
  }

  const addExtraTime = async (amount: number) => {
    const cost = BOOST_COST[amount];
    if (boostsLeft < cost || usedBoosts[amount]) return;
    await consumeBooster(amount);
    setExtraTimeAmount(amount);
    setExtraTimeEvent(prev => prev + 1);
    setUsedBoosts(prev => ({
      ...prev,
      [amount]: true,
    }));
  };

  useEffect(() => {
    function handleTabChange() {
      if (document.hidden) {
        handleTimeout();
      }
    }
    document.addEventListener("visibilitychange", handleTabChange);
    return () => {
      document.removeEventListener("visibilitychange", handleTabChange);
    };
  }, []);

  useEffect(() => {
    const loadBoosters = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from("user_inventory")
        .select("boosters")
        .eq("user_id", user.id)
        .single();
      if (!error && data) {
        setBoostsLeft(data.boosters);
      }
    };
    loadBoosters();
  }, []);

  const [playerImgKey, setPlayerImgKey] = useState(0);
  const [inputsDisabled, setInputsDisabled] = useState(false);
  const attackTimeoutRef = useRef<number | null>(null);
  const recoveryTimeoutRef = useRef<number | null>(null);

  const [playerImage, setPlayerImage] = useState(PLAYER_IDLE);
  const [opponentImage, setOpponentImage] = useState(ENEMY_IDLE);
  const [gameState, setGameState] = useState<"start" | "playing" | "gameover">("start");

  useEffect(() => {
    if (gameState === "start") {
      setUsedBoosts({
        10: false,
        20: false,
        30: false,
      });
    }
  }, [gameState]);

  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard" | "super">("easy");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [playerLife, setPlayerLife] = useState(100);
  const [opponentLife, setOpponentLife] = useState(100);
  const [maxLife] = useState(100);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerState, setAnswerState] = useState<"default" | "correct" | "incorrect">("default");
  const [playerAnimation, setPlayerAnimation] = useState<AnimationState>("idle");
  const [opponentAnimation, setOpponentAnimation] = useState<AnimationState>("idle");
  const [questionVisible, setQuestionVisible] = useState(true);
  const [timerReset, setTimerReset] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(0);
  const [impactParticles, setImpactParticles] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState(0);
  const [location] = useLocation();
  const [timeBoosts, setTimeBoosts] = useState(1);
  const [freezeAvailable, setFreezeAvailable] = useState(1);
  const [extraTime, setExtraTime] = useState(0);
  const [isFrozen, setIsFrozen] = useState(false);

  const useTimeBoost = () => {
    if (timeBoosts <= 0) return;
    setTimeBoosts(prev => prev - 1);
    setExtraTime(10);
    setTimeout(() => setTimerReset(false), 50);
  };

  const useFreeze = () => {
    if (freezeAvailable <= 0 || isFrozen) return;
    setFreezeAvailable(prev => prev - 1);
    setIsFrozen(true);
    setTimeout(() => {
      setIsFrozen(false);
    }, 6000);
  };

  useEffect(() => {
    if (impactParticles > 0) {
      const t = window.setTimeout(() => setImpactParticles(0), 400);
      return () => clearTimeout(t);
    }
  }, [impactParticles]);

  const timeoutsRef = useRef<number[]>([]);

  const QUESTIONS_PER_GAME = 1000;
  const [currentQuestions, setCurrentQuestions] = useState<any[]>(
    () => prepareQuestionsFiltered(MOCK_QUESTIONS, undefined, QUESTIONS_PER_GAME)
  );
  const currentQuestion = currentQuestions.length > 0 ? currentQuestions[currentQuestionIndex] : null;
  const progress = currentQuestions.length > 0 ? ((currentQuestionIndex + 1) / currentQuestions.length) * 100 : 0;

  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach((id) => {
      try { clearTimeout(id); } catch (e) {}
    });
    timeoutsRef.current = [];
    if (attackTimeoutRef.current) {
      clearTimeout(attackTimeoutRef.current);
      attackTimeoutRef.current = null;
    }
    if (recoveryTimeoutRef.current) {
      clearTimeout(recoveryTimeoutRef.current);
      recoveryTimeoutRef.current = null;
    }
  };

  const handleStart = (selectedDifficulty: "easy" | "medium" | "hard" | "super") => {
    setDifficulty(selectedDifficulty);
    setPlayerLife(100);
    setOpponentLife(100);
    const prepared = prepareQuestionsFiltered(MOCK_QUESTIONS, selectedDifficulty, QUESTIONS_PER_GAME);
    setCurrentQuestions(prepared);
    resetGame();
    setGameState("playing");
    setQuestionStartTime(Date.now());
    setUsedFreezer(false);

    // 🔥 RESETAR STREAKS AO INICIAR
    setCurrentMatchStreak(0);
    setBestMatchStreak(0);
  };

  const resetGame = () => {
    clearAllTimeouts();
    setCurrentQuestionIndex(0);
    setScore(0);
    setCorrectAnswers(0);
    setCurrentStreak(0);
    setSelectedAnswer(null);
    setAnswerState("default");
    setPlayerAnimation("idle");
    setOpponentAnimation("idle");
    setQuestionVisible(true);
    setTimerPaused(false);
    setQuestionStartTime(Date.now());
    setPlayerImage(PLAYER_IDLE);
    setOpponentImage(ENEMY_IDLE);
    setExtraTimeEvent(0);
    setExtraTimeAmount(0);

    // 🔥 RESETAR STREAKS
    setCurrentMatchStreak(0);
    setBestMatchStreak(0);
  };

  const handleRestart = () => {
    clearAllTimeouts();
    coinsAwardedRef.current = false;
    setEarnedThisMatch(0);
    setGameState("start");
    setPlayerLife(100);
    setOpponentLife(100);
    resetGame();
    const prepared = prepareQuestionsFiltered(MOCK_QUESTIONS, difficulty, QUESTIONS_PER_GAME);
    setCurrentQuestions(prepared);
    setRevealAnswer(false);
    setUsedReveal(false);
    setShowRevealEffect(false);
    setRevealEffectData(null);

  };

  const handleClose = () => {
    clearAllTimeouts();
    coinsAwardedRef.current = false;
    setEarnedThisMatch(0);
    setGameState("start");
    setPlayerLife(100);
    setOpponentLife(100);
    setRevealAnswer(false);
    setUsedReveal(false);
    setShowRevealEffect(false);
    setRevealEffectData(null);
  };

  const handleReturnHome = () => {
    clearAllTimeouts();
    coinsAwardedRef.current = false;
    setEarnedThisMatch(0);
    setTimerPaused(true);
    resetGame();
    setPlayerLife(100);
    setOpponentLife(100);
    setGameState("start");
    setRevealAnswer(false);
    setUsedReveal(false);
    setShowRevealEffect(false);
    setRevealEffectData(null);
  };

  // 🔥 FUNÇÃO PARA SALVAR BEST STREAK NO BANCO
  const updateBestStreakInDB = async (streak: number) => {
    if (!user || guestMode) {
      console.log("⚠️ Usuário não logado ou modo guest - streak não salvo");
      return;
    }

    try {
      const { data: currentData, error: fetchError } = await supabase
        .from("scores")
        .select("best_streak")
        .eq("email", user.email)
        .single();

      if (fetchError) {
        console.error("❌ Erro ao buscar best_streak:", fetchError);
        return;
      }

      const currentBest = currentData?.best_streak || 0;

      if (streak > currentBest) {
        await supabase
          .from("scores")
          .update({ best_streak: streak })
          .eq("email", user.email);
      }
    } catch (error) {
      console.error("❌ Erro geral ao atualizar best_streak:", error);
    }
  };

  const handleAnswer = async (answerIndex: number) => {
    if (!currentQuestion) return;
    if (selectedAnswer !== null) return;
    setPlayerAnimation("idle");
    setPlayerImage(PLAYER_IDLE);
    setTimerPaused(false);
    setSelectedAnswer(answerIndex);
    const isCorrect = answerIndex === currentQuestion.correctAnswer;

    const timeTaken = (Date.now() - questionStartTime) / 1000;

    if (isCorrect) {
      setAnswerState("correct");
      setCorrectAnswers(prev => prev + 1);
      setSessionCoins(prev => prev + 3);

      const newStreak = currentMatchStreak + 1;
      setCurrentMatchStreak(newStreak);

      if (newStreak > bestMatchStreak) {
        setBestMatchStreak(newStreak);
      }

      setPlayerAnimation("attack");
      setPlayerImage(PLAYER_ATK);
      setShowHolyBlast(true);

      const hitTimeout = window.setTimeout(() => {
        setOpponentAnimation("hit");
        setOpponentImage(ENEMY_HIT);

        let damage = 5;
        if (timeTaken < 5) damage = 10;
        else if (timeTaken >= 3 && timeTaken < 6) damage = 6;
        else if (timeTaken >= 6 && timeTaken < 8) damage = 4;
        else if (timeTaken >= 8 && timeTaken <= 10) damage = 3;

        setOpponentLife(prev => Math.max(0, prev - damage));
      }, 600);
      timeoutsRef.current.push(hitTimeout);

      const idleTimeout = window.setTimeout(() => {
        setPlayerAnimation("idle");
        setPlayerImage(PLAYER_IDLE);
        setOpponentAnimation("idle");
        setOpponentImage(ENEMY_IDLE);
        setInputsDisabled(false);
      }, 1000);
      timeoutsRef.current.push(idleTimeout);

      setScore((prev) => prev + 10);
      setQuestionVisible(false);

    } else {
      setAnswerState("incorrect");
      setCurrentStreak((prev) => prev + 1);
      setIncorrectAnswers(prev => prev + 1);

      if (currentMatchStreak > 0) {
        await updateBestStreakInDB(currentMatchStreak);
      }

      setCurrentMatchStreak(0);

      setOpponentAnimation("attack");
      setOpponentImage(ENEMY_ATK);

      const playerHitTimeout = window.setTimeout(() => {
        setPlayerAnimation("hit");
      }, 400);
      timeoutsRef.current.push(playerHitTimeout);

      const damageTimeout = window.setTimeout(() => {
        setPlayerLife((prev) => Math.max(0, prev - 10));
        setPlayerAnimation("idle");
        setOpponentAnimation("idle");
        setOpponentImage(ENEMY_IDLE);
      }, 800);
      timeoutsRef.current.push(damageTimeout);
    }

    const tAdvance = window.setTimeout(() => {
      setCurrentQuestionIndex((prev) =>
        currentQuestions.length > 0 ? (prev + 1) % currentQuestions.length : prev
      );
      setSelectedAnswer(null);
      setExtraTimeEvent(0);
      setExtraTimeAmount(0);
      setRevealAnswer(false);
      setUsedReveal(false);
      setUsedBoosts({
        10: false,
        20: false,
        30: false,
      });

      setAnswerState("default");
      setQuestionVisible(true);
      setTimerReset(prev => !prev);
      requestAnimationFrame(() => {
        setTimerPaused(false);
      });

      setQuestionStartTime(Date.now());
    }, 500);
    timeoutsRef.current.push(tAdvance);
  };

  const handleTimeout = () => {
    if (!currentQuestion) return;
    setPlayerAnimation("idle");
    setPlayerImage(PLAYER_IDLE);
    setRevealAnswer(false);
    setUsedReveal(false);
    setTimerPaused(true);
    setCurrentStreak((prev) => prev + 1);
    setAnswerState("incorrect");
    setIncorrectAnswers(prev => prev + 1);

    if (currentMatchStreak > 0) {
      updateBestStreakInDB(currentMatchStreak);
    }
    setCurrentMatchStreak(0);

    const attackTimeout = window.setTimeout(() => {
      setOpponentAnimation("attack");
      setOpponentImage(ENEMY_ATK);
    }, 200);
    timeoutsRef.current.push(attackTimeout);

    const hitTimeout = window.setTimeout(() => {
      setPlayerAnimation("hit");
    }, 400);
    timeoutsRef.current.push(hitTimeout);

    const damageTimeout = window.setTimeout(() => {
      setPlayerLife((prev) => Math.max(0, prev - 10));
      setPlayerAnimation("idle");
      setOpponentAnimation("idle");
      setOpponentImage(ENEMY_IDLE);
    }, 800);
    timeoutsRef.current.push(damageTimeout);

    const tAdvance2 = window.setTimeout(() => {
      setCurrentQuestionIndex((prev) =>
        currentQuestions.length > 0 ? (prev + 1) % currentQuestions.length : prev
      );
      setSelectedAnswer(null);
      setAnswerState("default");
      setQuestionVisible(true);
      setTimerReset(prev => !prev);
      requestAnimationFrame(() => {
        setTimerPaused(false);
      });
      setQuestionStartTime(Date.now());
    }, 500);
    timeoutsRef.current.push(tAdvance2);
  };

  useEffect(() => {
    const handleGameoverCoins = async () => {
      if (coinsAwardedRef.current) return;
      if (playerLife > 0 && opponentLife > 0) return;

      coinsAwardedRef.current = true;
      setGameState("gameover");

      const finalBest = Math.max(currentMatchStreak, bestMatchStreak);

      if (finalBest > 0) {
        await updateBestStreakInDB(finalBest);
      }

      if (!guestMode && user) {
        submitScore(score);
      }

      const playerWon = opponentLife <= 0;
      let totalEarned = sessionCoins;
      if (playerWon) totalEarned += 10;

      setEarnedThisMatch(totalEarned);

      if (!guestMode && user && totalEarned > 0) {
        try {
          await supabase.rpc("add_coins_to_inventory", {
            p_amount: totalEarned,
            p_user_id: user.id,
          });
        } catch (err) {
          console.error("Erro ao chamar RPC add_coins_to_inventory:", err);
        }
      }

      setSessionCoins(0);
    };

    handleGameoverCoins();
    setShowConfirm(false);
  }, [playerLife, opponentLife]);

  useEffect(() => {
    return () => {
      clearAllTimeouts();
    };
  }, []);

  if (gameState === "start") {
    return <StartScreen onStart={handleStart} boostsLeft={boostsLeft} />;
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center bg-[#f0f2f5]">
        <p className="text-gray-500 animate-pulse">Carregando perguntas...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] font-sans pb-10 relative overflow-hidden">

      {/* 🔵 CABEÇALHO AZUL (Fundo) */}
      <div className="bg-gradient-to-b from-[#0056e6] to-[#0235a6] h-[220px] rounded-b-[50px] shadow-2xl relative overflow-hidden">
         <div className="absolute inset-0 opacity-10 bg-[url('/character_sprites/bg.svg')] bg-cover bg-center"></div>
         <div className="absolute top-0 left-0 w-full h-full bg-blue-900/10 backdrop-blur-[1px]"></div>

         {/* Botão Sair */}
         <div className="relative z-10 p-4">
            <button
              onClick={openConfirmPopup}
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-md"
            >
              <ArrowLeft size={18} />
              <span className="text-xs font-bold uppercase">Sair</span>
            </button>
         </div>
                  {/* Barra de Progresso */}
                  <div className="bg-gray-200 h-2 rounded-full overflow-hidden w-full max-w-[20rem] mx-auto mb-2">
                     <div
                       className="h-full bg-green-500 transition-all duration-500 ease-out"
                       style={{ width: `${progress}%` }}
                     ></div>
                  </div>
      </div>

      {/* 🏟️ ARENA FLUTUANTE */}
      <div className="-mt-[140px] relative z-20 px-2 sm:px-4 mb-4">
         <motion.div
           initial={{ y: 20, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           className="bg-white/40 backdrop-blur-md rounded-[30px] shadow-lg border border-white/40 p-2 sm:p-4 max-w-4xl mx-auto overflow-hidden relative"
         >
            <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent pointer-events-none"></div>

            {/* ⏱️ TEMPO (Posicionado no centro da arena) com estilo personalizado */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 scale-90 sm:scale-100">
                <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center [&_svg]:hidden text-white font-black text-xl">
                    <Timer
                        duration={TIME_PER_LEVEL[difficulty]}
                        extraTimeEvent={extraTimeEvent}
                        extraTimeAmount={extraTimeAmount}
                        onTimeout={handleTimeout}
                        isPaused={timerPaused || isFrozen}
                        reset={timerReset}
                    />
                </div>
            </div>

            <BattleArena
                playerLife={playerLife}
                playerImgKey={playerImgKey}
                opponentLife={opponentLife}
                maxLife={maxLife}
                playerAnimation={playerAnimation}
                opponentAnimation={opponentAnimation}
                playerImage={playerImage}
                opponentImage={opponentImage}
                impactParticles={impactParticles}
                setImpactParticles={setImpactParticles}
                showHolyBlast={showHolyBlast}
                setShowHolyBlast={setShowHolyBlast}
                showRevealEffect={showRevealEffect}
                revealEffectData={revealEffectData}
                setShowRevealEffect={setShowRevealEffect}
            />
         </motion.div>
      </div>

      {/* 🎮 CONTROLES E PLACAR ABAIXO DA ARENA */}
      <div className="max-w-3xl mx-auto px-4 relative z-30 space-y-4">

         {/* 📊 BARRA DE STATUS (Score + Streak) - AGORA AQUI EMBAIXO! */}
         <div className="flex justify-between items-center bg-white rounded-2xl p-1 pr-[15px] pl-[15px] shadow-sm border border-gray-100 mb-2">
             <div className="flex flex-col">
                 <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Sua Pontuação</span>
                 <span className="text-3xl font-black text-blue-600 leading-none">{score}</span>
             </div>

             {/* Streak visual */}
             <div className="flex items-center gap-2">
                {currentMatchStreak >= 3 ? (
                    <div className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md animate-bounce flex items-center gap-1">
                        <Zap size={12} className="fill-white" />
                        Combo: {currentMatchStreak}x
                    </div>
                ) : (
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] text-gray-400 font-bold uppercase">Acertos</span>
                        <span className="text-xl font-bold text-gray-700">{correctAnswers}</span>
                    </div>
                )}
             </div>
         </div>

         {/* ⚡ BOOSTERS */}
         <div className="flex justify-center gap-3 mb-2 overflow-x-auto scrollbar-hide">
            {boostsLeft > 0 ? (
                <>
                  <button
                    onClick={() => { if(boostsLeft >= BOOST_COST[10]) addExtraTime(10); }}
                    disabled={boostsLeft < BOOST_COST[10] || usedBoosts[10]}
                    className="flex flex-col items-center gap-1 group disabled:opacity-40 disabled:cursor-not-allowed transition-transform active:scale-95"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-md border-2 border-white group-hover:scale-110 transition-transform">
                        <ClockPlus size={20} className="text-white" />
                    </div>
                    <span className="text-[10px] font-bold text-gray-500 bg-white px-1.5 rounded-md shadow-sm border border-gray-100">+10s</span>
                  </button>

                  <button
                    onClick={() => { if(boostsLeft >= BOOST_COST[20]) addExtraTime(20); }}
                    disabled={boostsLeft < BOOST_COST[20] || usedBoosts[20]}
                    className="flex flex-col items-center gap-1 group disabled:opacity-40 disabled:cursor-not-allowed transition-transform active:scale-95"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-md border-2 border-white group-hover:scale-110 transition-transform">
                        <ClockPlus size={20} className="text-white" />
                    </div>
                    <span className="text-[10px] font-bold text-gray-500 bg-white px-1.5 rounded-md shadow-sm border border-gray-100">+20s</span>
                  </button>

                  <button
                    onClick={useFreezer}
                    disabled={usedFreezer || boostsLeft < 8 || selectedAnswer !== null}
                    className="flex flex-col items-center gap-1 group disabled:opacity-40 disabled:cursor-not-allowed transition-transform active:scale-95"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-md border-2 border-white group-hover:scale-110 transition-transform">
                        <Snowflake size={20} className="text-white" />
                    </div>
                    <span className="text-[10px] font-bold text-gray-500 bg-white px-1.5 rounded-md shadow-sm border border-gray-100">Freeze</span>
                  </button>

                  <button
                    onClick={useReveal}
                    disabled={usedReveal || boostsLeft < REVEAL_COST || selectedAnswer !== null}
                    className="flex flex-col items-center gap-1 group disabled:opacity-40 disabled:cursor-not-allowed transition-transform active:scale-95"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-full flex items-center justify-center shadow-md border-2 border-white group-hover:scale-110 transition-transform">
                        <Eye size={20} className="text-white" />
                    </div>
                    <span className="text-[10px] font-bold text-gray-500 bg-white px-1.5 rounded-md shadow-sm border border-gray-100">Revelar</span>
                  </button>
                </>
            ) : (
                <div className="w-full">
                    {isBlocked ? (
                        <button onClick={() => setShowLoginModal(true)} className="w-full py-3 bg-yellow-400 rounded-xl font-bold text-black shadow-sm uppercase text-sm tracking-wide">
                            Comprar Boosters
                        </button>
                    ) : (
                        <Link href="/store">
                            <button className="w-full py-3 bg-yellow-400 rounded-xl font-bold text-black shadow-sm uppercase text-sm tracking-wide hover:bg-yellow-500 transition-colors">
                                🛒 Loja de Boosters
                            </button>
                        </Link>
                    )}
                </div>
            )}
         </div>

         {/* ❓ CARTÃO DE PERGUNTA */}
         <div className="mt-2">
            <QuestionCard
              question={currentQuestion.question}
              roundNumber={currentQuestionIndex + 1}
              totalRounds={currentQuestions.length}
              isVisible={questionVisible}
            />
         </div>

         {/* 🔘 RESPOSTAS */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-8">
            {currentQuestion.options.map((option: string, index: number) => (
              <AnswerButton
                key={index}
                text={option}
                onClick={() => handleAnswer(index)}
                state={
                  revealAnswer && index === currentQuestion.correctAnswer
                    ? "correct"
                    : selectedAnswer === null
                    ? "default"
                    : selectedAnswer === index
                    ? answerState
                    : "default"
                }
                disabled={selectedAnswer !== null || inputsDisabled}
                index={index}
              />
            ))}
         </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center border-2 border-red-100">
            <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut size={24} />
            </div>
            <h2 className="text-lg font-bold mb-2 text-gray-800">Sair da batalha?</h2>
            <p className="mb-6 text-sm text-gray-600">Você perderá todo o progresso atual.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={cancelReturn} className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors">Cancelar</button>
              <button onClick={confirmReturn} className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors shadow-lg shadow-red-200">Sair</button>
            </div>
          </div>
        </div>
      )}

      <GameOverModal
        isOpen={gameState === "gameover"}
        isVictory={opponentLife <= 0}
        finalScore={score}
        correctAnswers={correctAnswers}
        totalQuestions={currentQuestions.length}
        onRestart={handleRestart}
        onClose={handleClose}
        earnedCoins={earnedThisMatch}
      />

      <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
        <DialogContent className="text-center max-w-sm rounded-2xl">
          <DialogHeader className="text-left">
            <DialogTitle>Faça login para continuar</DialogTitle>
            <span className="text-sm text-muted-foreground">
              Você precisa estar logado para percorrer uma jornada global.
            </span>
          </DialogHeader>
          <Button
            onClick={async () => {
              await loginWithGoogle();
              setShowLoginModal(false);
            }}
            className="w-full bg-blue-600 text-md text-white border-none py-6 rounded-xl"
          >
            Entrar com Google
          </Button>
          <Button
            onClick={() => {
              localStorage.setItem("guestMode", "true");
              setShowLoginModal(false);
            }}
            className="w-full bg-[#b3dee2] text-md border-none py-6 rounded-xl text-blue-900"
          >
            Jogar como Convidado
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}