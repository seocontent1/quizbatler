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
import { Link } from "wouter";
import { Swords, Zap, Crown, Eye, ClockPlus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { loginWithGoogle } from "@/services/auth";

const TIME_PER_LEVEL = {
  easy: 10,
  medium: 10,
  hard: 20,
  super: 20,
} as const;

const COOLDOWN_MS = 12 * 60 * 60 * 1000; // 12 horas
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
  } catch {
    // ignore quota errors
  }
}

function addAnswered(id: string) {
  const store = loadProgress();
  // avoid duplicates: update timestamp if exists
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

// filtered prepareQuestions that respects cooldown
function prepareQuestionsFiltered(allQuestions: any[], difficulty?: string, amount?: number) {
  // remove expired entries first

  const excluded = new Set(answeredIds());
  let pool = allQuestions.filter((q) => !excluded.has(q.id));
  if (difficulty) {
    pool = pool.filter((q) => q.difficulty === difficulty);
  }
  // if pool empty, fallback to allQuestions (so game can continue)
  if (pool.length === 0) pool = allQuestions;
  const shuffled = shuffleArray(pool);
  const selected = typeof amount === "number" ? shuffled.slice(0, amount) : shuffled;
  return selected.map((q) => shuffleOptions(q));
}

// (mantive as funções shuffleArray, shuffleOptions, prepareQuestions exatamente como no seu arquivo)

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
// perto dos outros useState
const [showRevealEffect, setShowRevealEffect] = useState(false);
const [revealEffectData, setRevealEffectData] = useState(null);

const [showConfirm, setShowConfirm] = useState(false);
const openConfirmPopup = () => setShowConfirm(true);
const cancelReturn = () => setShowConfirm(false);

const confirmReturn = () => {
  setShowConfirm(false);
  handleReturnHome();
};

  const FREEZER_COST = 10;
  const REVEAL_COST = 3;

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
    if (usedFreezer || boostsLeft < 10) return;

    // ✅ congela imediatamente
    setTimerPaused(true);
    setUsedFreezer(true);

    // ✅ desconta do banco
    await supabase.rpc("decrement_boosters", {
      amount_to_subtract: 8,
    });

    setBoostsLeft(prev => prev - 8);
  };
    const useReveal = async () => {
      if (usedReveal || boostsLeft < REVEAL_COST) return;

      // ✅ desconta booster
      await supabase.rpc("decrement_boosters", {
        amount_to_subtract: REVEAL_COST,
      });

      setBoostsLeft(prev => prev - REVEAL_COST);

      // ✅ ativa revelação
      setRevealAnswer(true);
      setUsedReveal(true);

      // ✅ animação do Jesus
      setPlayerAnimation("reveal");
      setPlayerImage("/character_sprites/rev.png");
      setShowRevealEffect(true);

    // posição aproximada do player
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

    // ✅ dispara evento no Timer
    setExtraTimeAmount(amount);
    setExtraTimeEvent(prev => prev + 1);

    // desativa botão usado
    setUsedBoosts(prev => ({
      ...prev,
      [amount]: true,
    }));
  };
    useEffect(() => {
      function handleTabChange() {
        if (document.hidden) {
          // ✅ força terminar a pergunta imediatamente
          onTimeout();
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

  // Image states (paths)
  const PLAYER_IDLE = "/character_sprites/jesus.png";
  const PLAYER_ATK  = "/character_sprites/atk.png";
  const ENEMY_IDLE  = "/character_sprites/enemy.png";
  const OPPONENT_HIT  = "/character_sprites/enemy_hit.png";
  const ENEMY_ATK  = "/character_sprites/luc_atk.png";

  // KEY + control states
  const [playerImgKey, setPlayerImgKey] = useState(0);
  const [inputsDisabled, setInputsDisabled] = useState(false);

  // timeout refs (use number | null for browser setTimeout)
  const attackTimeoutRef = useRef<number | null>(null);
  const recoveryTimeoutRef = useRef<number | null>(null);

  // estados principais (preservando o que você já tinha)
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
  const [difficulty, setDifficulty] = useState<
  "easy" | "medium" | "hard" | "super"
  >("medium");
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
  // BENEFÍCIOS
  const [timeBoosts, setTimeBoosts] = useState(1); // começa com 1 carga
  const [freezeAvailable, setFreezeAvailable] = useState(1); // começa com 1 freezer

  // controle do jogo
  const [extraTime, setExtraTime] = useState(0);
  const [isFrozen, setIsFrozen] = useState(false);

  const useTimeBoost = () => {
  if (timeBoosts <= 0) return;
  setTimeBoosts(prev => prev - 1);
  // adiciona 10 segundos ao timer atual
  setExtraTime(10);
  // força o Timer recalcular o tempo
  setTimeout(() => setTimerReset(false), 50);
  };

  const useFreeze = () => {
  if (freezeAvailable <= 0 || isFrozen) return;

  setFreezeAvailable(prev => prev - 1);
  setIsFrozen(true);

  // opcional: descongela depois de 6s
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

  // ref para armazenar timeouts ativos e limpá-los ao retornar para home / desmontar
  const timeoutsRef = useRef<number[]>([]);

  // guard: perguntas
  const QUESTIONS_PER_GAME = 1000;
  const [currentQuestions, setCurrentQuestions] = useState<any[]>(
    () => prepareQuestionsFiltered(MOCK_QUESTIONS, undefined, QUESTIONS_PER_GAME)
  );
  const currentQuestion = currentQuestions.length > 0 ? currentQuestions[currentQuestionIndex] : null;
  const progress = currentQuestions.length > 0 ? ((currentQuestionIndex + 1) / currentQuestions.length) * 100 : 0;

  // ----------------- helpers de timeout -----------------
  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach((id) => {
      try { clearTimeout(id); } catch (e) { /* ignore */ }
    });
    timeoutsRef.current = [];
    // também limpar refs controlados
    if (attackTimeoutRef.current) {
      clearTimeout(attackTimeoutRef.current);
      attackTimeoutRef.current = null;
    }
    if (recoveryTimeoutRef.current) {
      clearTimeout(recoveryTimeoutRef.current);
      recoveryTimeoutRef.current = null;
    }
  };

  // ------------------- Funções do jogo -------------------

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

  };

  const resetGame = () => {
    // limpamos timeouts ao reset para evitar qualquer interferência
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
  };

  const handleRestart = () => {
    clearAllTimeouts();
    setGameState("start");
    setPlayerLife(100);
    setOpponentLife(100);
    resetGame();
    const prepared = prepareQuestionsFiltered(MOCK_QUESTIONS, difficulty, QUESTIONS_PER_GAME);
    setCurrentQuestions(prepared);
  };

  const handleClose = () => {
    clearAllTimeouts();
    setGameState("start");
    setPlayerLife(100);
    setOpponentLife(100);
  };

  const handleReturnHome = () => {
    clearAllTimeouts();
    setTimerPaused(true);
    resetGame();
    setPlayerLife(100);
    setOpponentLife(100);
    setGameState("start");
  };

  // -------------------- Resposta do jogador --------------------

  // Trecho corrigido do handleAnswer - substitua a função completa

  const handleAnswer = (answerIndex: number) => {
    if (!currentQuestion) return;
    if (selectedAnswer !== null) return;
    setPlayerAnimation("idle");
    setPlayerImage(PLAYER_IDLE);
    setTimerPaused(false);
    setSelectedAnswer(answerIndex);
    const isCorrect = answerIndex === currentQuestion.correctAnswer;

    // mark question as answered (cooldown by ID)
    try { addAnswered(currentQuestion.id); } catch (e) { /* ignore */ }

    const timeTaken = (Date.now() - questionStartTime) / 1000;

    if (isCorrect) {
      setAnswerState("correct");
      setCorrectAnswers(prev => prev + 1);

      // ✅ SEQUÊNCIA CORRIGIDA - Player ataca
      setPlayerAnimation("attack");
      setPlayerImage(PLAYER_ATK);
      setShowHolyBlast(true);

      // ✅ Oponente leva hit após 600ms
      const hitTimeout = window.setTimeout(() => {
        setOpponentAnimation("hit");
        setOpponentImage(OPPONENT_HIT);

        // Calcula e aplica o dano
        let damage = 5;
        if (timeTaken < 5) damage = 10;
        else if (timeTaken >= 3 && timeTaken < 6) damage = 6;
        else if (timeTaken >= 6 && timeTaken < 8) damage = 4;
        else if (timeTaken >= 8 && timeTaken <= 10) damage = 3;

        setOpponentLife(prev => Math.max(0, prev - damage));
      }, 600);
      timeoutsRef.current.push(hitTimeout);

      // ✅ Volta ao idle após 1000ms (dá tempo do hit terminar)
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
      // ✅ RESPOSTA INCORRETA - Oponente ataca
      setAnswerState("incorrect");
      setCurrentStreak((prev) => prev + 1);
      setIncorrectAnswers(prev => prev + 1);

      // ✅ Oponente começa a atacar imediatamente
      setOpponentAnimation("attack");
      setOpponentImage(ENEMY_ATK);

      // ✅ Player leva hit após 400ms
      const playerHitTimeout = window.setTimeout(() => {
        setPlayerAnimation("hit");
      }, 400);
      timeoutsRef.current.push(playerHitTimeout);

      // ✅ Aplica dano e volta ao idle após 800ms
      const damageTimeout = window.setTimeout(() => {
        setPlayerLife((prev) => Math.max(0, prev - 10));
        setPlayerAnimation("idle");
        setOpponentAnimation("idle");
        setOpponentImage(ENEMY_IDLE);
      }, 800);
      timeoutsRef.current.push(damageTimeout);
    }

    // ✅ Avança para próxima pergunta (espera as animações terminarem)
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
    }, 500); // Aumentei para 1500ms para dar tempo das animações
    timeoutsRef.current.push(tAdvance);
  };


  // ✅ TIMEOUT CORRIGIDO TAMBÉM
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

    // ✅ Oponente ataca após 200ms
    const attackTimeout = window.setTimeout(() => {
      setOpponentAnimation("attack");
      setOpponentImage(ENEMY_ATK);
    }, 200);
    timeoutsRef.current.push(attackTimeout);

    // ✅ Player leva hit após 400ms
    const hitTimeout = window.setTimeout(() => {
      setPlayerAnimation("hit");
    }, 400);
    timeoutsRef.current.push(hitTimeout);

    // ✅ Aplica dano e volta ao idle após 800ms
    const damageTimeout = window.setTimeout(() => {
      setPlayerLife((prev) => Math.max(0, prev - 10));
      setPlayerAnimation("idle");
      setOpponentAnimation("idle");
      setOpponentImage(ENEMY_IDLE);
    }, 800);
    timeoutsRef.current.push(damageTimeout);

    // ✅ Avança para próxima pergunta
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
    }, 500); // Aumentei de 1800ms para 1500ms
    timeoutsRef.current.push(tAdvance2);
  };

  // -------------------- Efeitos --------------------

  useEffect(() => {
    // DERROTA
    if (playerLife <= 0) {
      setGameState("gameover");
      if (!guestMode && user) {
        submitScore(score);
      }
    }
    else if (opponentLife <= 0) {
      setGameState("gameover");

      if (!guestMode && user) {
        submitScore(score);
      }
    }
        setShowConfirm(false);
  }, [playerLife, opponentLife]);

  useEffect(() => {
    return () => {
      clearAllTimeouts();
    };
  }, []);

  // -------------------- Render --------------------

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
      <div className="max-w-6xl mx-auto p-3 sm:p-4 pt-6">
      <div className="max-w-3xl mx-auto space-y-3">
        <ScoreDisplay
          correctAnswers={correctAnswers}
          currentStreak={currentStreak}
          totalScore={score}
          boostsLeft={boostsLeft} // ✅ ENVIANDO O VALOR
        />

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
              extraTimeEvent={extraTimeEvent}     // ✅ novo
              extraTimeAmount={extraTimeAmount}   // ✅ novo
              onTimeout={handleTimeout}
              isPaused={timerPaused || isFrozen}
              reset={timerReset}
            />

            {/* ✅ Se tiver booster, mostra benefícios */}
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
                  10s ⚡1</div>
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
              /* ✅ Caso não tenha booster, mostrar compra */
              <div className="flex justify-center w-full mt-4">
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
      />
      <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
    <DialogContent className="text-center max-w-sm">
      <DialogHeader className="text-left">
        <DialogTitle>Faça login para continuar</DialogTitle>
        <p className="text-sm text-muted-foreground">
          Você precisa estar logado para percorrer uma jornada global.
        </p>
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
      <p className="text-md text-muted-foreground">Participa de partidas Rankeadas, Rank global e pode comprar recursos!</p>
      <Button
        onClick={() => {
          localStorage.setItem("guestMode", "true");
          setGuestMode(true);
          setShowLoginModal(false);
        }}
        className="w-full bg-[#b3dee2] text-md border-none"
      >
        Jogar como Convidado
      </Button>
      <p className="text-md text-muted-foreground">Não participa de partidas Rankeadas, nem Rank global e nem pode comprar recursos!</p>
    </DialogContent>
  </Dialog>
    </div>
  );
}
