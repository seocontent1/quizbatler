import { useState, useEffect, useRef } from "react";
import BattleArena from "@/components/BattleArena";
import QuestionCard from "@/components/QuestionCard";
import AnswerButton from "@/components/AnswerButton";
import ScoreDisplay from "@/components/ScoreDisplay";
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
import { Swords, Zap, Crown, Eye, ClockPlus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { loginWithGoogle } from "@/services/auth";

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

    console.log(`🔍 Tentando salvar streak: ${streak} para email: ${user.email}`);

    try {
      // Busca o best_streak atual do usuário
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
      console.log(`📊 Best streak atual no banco: ${currentBest}`);

      // Só atualiza se o novo streak for maior
      if (streak > currentBest) {
        const { data: updateData, error: updateError } = await supabase
          .from("scores")
          .update({ best_streak: streak })
          .eq("email", user.email)
          .select();

        if (updateError) {
          console.error("❌ Erro ao atualizar best_streak:", updateError);
        } else {
          console.log(`✅ Best streak atualizado de ${currentBest} para ${streak}`);
          console.log("📦 Dados atualizados:", updateData);
        }
      } else {
        console.log(`ℹ️ Streak ${streak} não é maior que ${currentBest} - não atualizado`);
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

      // 🔥 INCREMENTAR STREAK DA PARTIDA
      const newStreak = currentMatchStreak + 1;
      setCurrentMatchStreak(newStreak);

      // 🔥 ATUALIZAR MELHOR STREAK DA PARTIDA
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
      // 🔥 ERROU: QUEBRA A STREAK
      setAnswerState("incorrect");
      setCurrentStreak((prev) => prev + 1);
      setIncorrectAnswers(prev => prev + 1);

      // 🔥 SALVAR BEST STREAK ANTES DE RESETAR
      if (currentMatchStreak > 0) {
        await updateBestStreakInDB(currentMatchStreak);
      }

      // 🔥 RESETAR STREAK DA PARTIDA
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

    // 🔥 TIMEOUT TAMBÉM QUEBRA A STREAK
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

  const addCoinsToUser = async (amount: number) => {
    try {
      await supabase.rpc("add_coins_to_inventory", {
        amount_to_add: amount
      });
    } catch (error) {
      console.error("Erro ao adicionar moedas:", error);
    }
  };

  useEffect(() => {
    const handleGameoverCoins = async () => {
      if (coinsAwardedRef.current) return;
      if (playerLife > 0 && opponentLife > 0) return;

      coinsAwardedRef.current = true;
      setGameState("gameover");

      // 🔥 SALVAR BEST STREAK NO FINAL DA PARTIDA
      const finalBest = Math.max(currentMatchStreak, bestMatchStreak);
      console.log(`🎯 Final da partida - currentMatchStreak: ${currentMatchStreak}, bestMatchStreak: ${bestMatchStreak}, finalBest: ${finalBest}`);

      if (finalBest > 0) {
        console.log(`💾 Salvando best streak: ${finalBest}`);
        await updateBestStreakInDB(finalBest);
      } else {
        console.log("⚠️ Nenhuma streak para salvar (finalBest = 0)");
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
          const { data, error } = await supabase.rpc("add_coins_to_inventory", {
            p_amount: totalEarned,
            p_user_id: user.id,
          });

          if (error) {
            console.error("Erro RPC add_coins_to_inventory:", error);
          } else {
            console.log("RPC add_coins_to_inventory retornou:", data);
          }
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
      <div className="min-h-screen p-4">
        <p>Carregando perguntas...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-1 bg-gradient-to-b from-background via-background to-muted/10">
      <div className="max-w-6xl mx-auto p-1 sm:p-2">
        <div className="max-w-3xl mx-auto space-y-3">
          <ScoreDisplay
            correctAnswers={correctAnswers}
            currentStreak={currentStreak}
            totalScore={score}
            boostsLeft={boostsLeft}
          />

          {/* 🔥 EXIBIR STREAK ATUAL DA PARTIDA - SÓ A PARTIR DE 6 */}
          {currentMatchStreak >= 6 && (
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-lg text-center font-bold shadow-lg animate-pulse">
              🔥 Sequência Perfeita: {currentMatchStreak} acertos consecutivos!
            </div>
          )}

          <div className="flex justify-end mb-4">
            <button
              onClick={openConfirmPopup}
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm"
              data-testid="btn-return-home"
            >
              Voltar ao início
            </button>
          </div>

          <Progress value={progress} className="mb-8 h-4" data-testid="progress-quiz" />
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

          <div className="mt-1 mb-1">
            <QuestionCard
              question={currentQuestion.question}
              roundNumber={currentQuestionIndex + 1}
              totalRounds={currentQuestions.length}
              isVisible={questionVisible}
            />
          </div>

          <Timer
            duration={TIME_PER_LEVEL[difficulty]}
            extraTimeEvent={extraTimeEvent}
            extraTimeAmount={extraTimeAmount}
            onTimeout={handleTimeout}
            isPaused={timerPaused || isFrozen}
            reset={timerReset}
          />

          {boostsLeft > 0 ? (
            <div className="flex flex-wrap gap-3 justify-center w-full">
              <button
                onClick={() => {
                  const cost = BOOST_COST[10];
                  if (boostsLeft < cost) return;
                  addExtraTime(10);
                }}
                disabled={boostsLeft < BOOST_COST[10] || usedBoosts[10]}
                className="px-1 py-1 bg-yellow-500 !border-none text-white rounded disabled:opacity-40"
              >
                <div className="flex items-center gap-1 w-full min-w-0">
                  <ClockPlus className="w-3 h-3 text-white-500" />
                  10s ⚡1
                </div>
              </button>

              <button
                onClick={() => {
                  const cost = BOOST_COST[20];
                  if (boostsLeft < cost) return;
                  addExtraTime(20);
                }}
                disabled={boostsLeft < BOOST_COST[20] || usedBoosts[20]}
                className="px-1 py-1 bg-orange-500 !border-none text-white rounded disabled:opacity-40"
              >
                <div className="flex items-center gap-1 w-full min-w-0">
                  <ClockPlus className="w-3 h-3 text-white-500" />
                  20s ⚡2
                </div>
              </button>

              <button
                onClick={() => {
                  const cost = BOOST_COST[30];
                  if (boostsLeft < cost) return;
                  addExtraTime(30);
                }}
                disabled={boostsLeft < BOOST_COST[30] || usedBoosts[30]}
                className="px-1 py-1 bg-red-500 text-white !border-none rounded disabled:opacity-40"
              >
                <div className="flex items-center gap-1 w-full min-w-0">
                  <ClockPlus className="w-3 h-3 text-white-500" />
                  30s ⚡3
                </div>
              </button>

              <Button
                onClick={useFreezer}
                disabled={usedFreezer || boostsLeft < 8 || selectedAnswer !== null}
                className="px-1 py-1 bg-blue-500 text-white !border-none rounded disabled:opacity-40"
              >
                <div className="flex items-center gap-1 w-full min-w-0">
                  ❄️Freeze ⚡8
                </div>
              </Button>

              <Button
                onClick={useReveal}
                disabled={usedReveal || boostsLeft < REVEAL_COST || selectedAnswer !== null}
                className="px-3 py-2 bg-[#42e521] text-white !border-none rounded disabled:opacity-40"
              >
                <div className="flex items-center gap-1 w-full min-w-0">
                  <Eye className="w-3 h-3 text-white-500" />
                  Revelação ⚡10
                </div>
              </Button>
            </div>
          ) : (
            <div className="justify-center w-full mt-4">
              {isBlocked ? (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="px-4 py-3 bg-[#ffbc42] w-full rounded-md font-semibold text-black"
                >
                  Comprar Booster
                </button>
              ) : (
                <Link href="/store">
                  <button className="px-4 py-3 bg-[#ffbc42] w-full rounded-md font-semibold text-black">
                    Comprar Booster
                  </button>
                </Link>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-xl shadow-xl w-xs text-center">
            <h2 className="text-lg font-bold mb-3">Sair do jogo?</h2>
            <p className="mb-4">Você perderá todo o progresso do jogo!</p>
            <div className="flex gap-3 justify-center">
              <button onClick={cancelReturn} className="px-4 py-2 bg-gray-300 rounded-lg">Cancelar</button>
              <button onClick={confirmReturn} className="px-4 py-2 bg-red-500 text-white rounded-lg">Sair</button>
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
        <DialogContent className="text-center max-w-sm">
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
            className="w-full bg-blue-600 text-md text-white border-none"
          >
            Entrar com Google
          </Button>
          <span className="text-md text-muted-foreground">
            Participa de partidas Rankeadas, Rank global e pode comprar recursos!
          </span>
          <Button
            onClick={() => {
              localStorage.setItem("guestMode", "true");
              setShowLoginModal(false);
            }}
            className="w-full bg-[#b3dee2] text-md border-none"
          >
            Jogar como Convidado
          </Button>
          <span className="text-md text-muted-foreground">
            Não participa de partidas Rankeadas, nem Rank global e nem pode comprar recursos!
          </span>
        </DialogContent>
      </Dialog>
    </div>
  );
}