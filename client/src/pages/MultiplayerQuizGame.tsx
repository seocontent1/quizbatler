import { useState, useEffect, useRef, useCallback } from "react";
import { useRoute } from "wouter";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { MOCK_QUESTIONS } from "@/data/question";
import { updateMatchScore, finishMatch } from "@/services/multiplayer";
import { submitScore } from "@/services/ranking";
import { Loader2, LogOut, AlertTriangle } from "lucide-react";

import BattleArena from "@/components/BattleArena";
import QuestionCard from "@/components/QuestionCard";
import AnswerButton from "@/components/AnswerButton";
import { Progress } from "@/components/ui/progress";

// SPRITES
import PLAYER_IDLE from "/character_sprites/jesus.png";
import PLAYER_ATK from "/character_sprites/atk.png";
import ENEMY_IDLE from "/character_sprites/enemy.png";
import ENEMY_HIT from "/character_sprites/enemy_hit.png";
import ENEMY_ATK from "/character_sprites/luc_atk.png";
import EFFECT_IMAGE from "/character_sprites/efect.svg";
import POW_IMAGE from "/character_sprites/pow.svg";

type AnimationState = "idle" | "attack" | "hit" | "victory";

// Helper para salvar progresso local (30 dias sem repetir)
const saveProgress = (id: string) => {
  try {
    const STORAGE_KEY = "quiz_progress_v1";
    const raw = localStorage.getItem(STORAGE_KEY);
    let store = raw ? JSON.parse(raw) : { answered: [] };

    // Remove se já existir para atualizar o timestamp
    store.answered = store.answered.filter((a: any) => a.id !== id);
    // Adiciona com data atual
    store.answered.push({ id, ts: Date.now() });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch(e) {
    console.error("Erro ao salvar progresso:", e);
  }
}

export default function MultiplayerQuizGame() {
  const [match, params] = useRoute("/multiplayer/:id");
  const matchId = params?.id;
  const { user } = useAuth();

  const timeoutsRef = useRef<number[]>([]);
  const QUESTION_TIME_LIMIT = 15;
  const POINTS_PER_HIT = 4;

  // --- ESTADOS DO MULTIPLAYER ---
  const [matchStatus, setMatchStatus] = useState<"pending" | "playing" | "finished">("pending");
  const [isPlayer1, setIsPlayer1] = useState(false);
  const [opponentScore, setOpponentScore] = useState(0);
  const [opponentStatus, setOpponentStatus] = useState("playing");

  // Estados de Jogo
  const [gameResult, setGameResult] = useState<"win" | "lose" | "draw" | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [waitingForOpponentFinish, setWaitingForOpponentFinish] = useState(false);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false); // Estado do Modal de Sair

  // Estados Lógicos do Quiz
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME_LIMIT);
  const [isTimerPaused, setIsTimerPaused] = useState(false);

  // Estados Visuais
  const [playerLife, setPlayerLife] = useState(100);
  const [opponentLife, setOpponentLife] = useState(100);

  const [playerImage, setPlayerImage] = useState(PLAYER_IDLE);
  const [opponentImage, setOpponentImage] = useState(ENEMY_IDLE);
  const [playerAnimation, setPlayerAnimation] = useState<AnimationState>("idle");
  const [opponentAnimation, setOpponentAnimation] = useState<AnimationState>("idle");
  const [showHolyBlast, setShowHolyBlast] = useState(false);
  const [impactParticles, setImpactParticles] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerState, setAnswerState] = useState<"default" | "correct" | "incorrect">("default");

  // 1. PRÉ-CARREGAR IMAGENS
  useEffect(() => {
    [PLAYER_IDLE, PLAYER_ATK, ENEMY_IDLE, ENEMY_HIT, ENEMY_ATK, EFFECT_IMAGE, POW_IMAGE].forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  useEffect(() => {
    if (impactParticles > 0) {
      const t = setTimeout(() => setImpactParticles(0), 500);
      return () => clearTimeout(t);
    }
  }, [impactParticles, setImpactParticles]);

  useEffect(() => {
    return () => timeoutsRef.current.forEach(clearTimeout);
  }, []);

  // 2. SETUP DA PARTIDA E REALTIME
  useEffect(() => {
    if (!matchId || !user) return;

    const fetchMatchData = async () => {
      const { data, error } = await supabase.from("matches").select("*").eq("id", matchId).single();
      if (error || !data) return;

      const amIPlayer1 = data.player1_id === user.id;
      setIsPlayer1(amIPlayer1);
      setMatchStatus(data.status);

      const opponentDone = amIPlayer1 ? data.player2_done : data.player1_done;
      if (opponentDone) setOpponentStatus("done");

      const opponentPoints = amIPlayer1 ? data.player2_score : data.player1_score;
      setOpponentScore(opponentPoints || 0);

      const matchQuestionIds = data.question_ids || [];

      // Ordena as perguntas conforme o array sorteado no banco
      const orderedQuestions = matchQuestionIds
        .map((id: string) => MOCK_QUESTIONS.find(q => q.id === id))
        .filter((q: any) => !!q);

      const finalQuestions = orderedQuestions.length > 0 ? orderedQuestions : MOCK_QUESTIONS.slice(0, 10);

      setQuestions(finalQuestions);
      setLoadingData(false);
    };
    fetchMatchData();

    const channel = supabase
      .channel(`match-${matchId}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "matches", filter: `id=eq.${matchId}` }, (payload) => {
          const newData = payload.new;
          if (newData.status === 'playing') setMatchStatus('playing');

          if (isPlayer1) {
            setOpponentScore(newData.player2_score);
            if (newData.player2_done) setOpponentStatus("done");
          } else {
            setOpponentScore(newData.player1_score);
            if (newData.player1_done) setOpponentStatus("done");
          }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [matchId, user, isPlayer1]);

  // 3. TIMER
  useEffect(() => {
    if (matchStatus !== 'playing') return;
    // PAUSA O TIMER SE O MODAL DE SAIR ESTIVER ABERTO (showQuitConfirm)
    if (loadingData || waitingForOpponentFinish || gameResult || isTimerPaused || showQuitConfirm) return;

    if (timeLeft <= 0) {
      handleTimeout();
      return;
    }
    const timerId = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearTimeout(timerId);
  }, [timeLeft, matchStatus, loadingData, waitingForOpponentFinish, gameResult, isTimerPaused, showQuitConfirm]);

  // --- 🔥 FUNÇÃO DE SAIR DA PARTIDA 🔥 ---
  const handleQuitGame = async () => {
    // 1. Marca no banco que "terminei" (para avisar o oponente que saí/parei)
    await finishMatch(matchId, isPlayer1);

    // 2. Redireciona de volta (SEM SALVAR PONTOS no Ranking Global)
    window.history.back();
  };

  // LÓGICA DE JOGO

  const handleTimeout = () => {
    if (selectedAnswer !== null) return;
    handleAnswer(-1, true);
  };

  const handleAnswer = async (index: number, isTimeout = false) => {
    if (selectedAnswer !== null && !isTimeout) return;

    setIsTimerPaused(true);
    setSelectedAnswer(index);
    setPlayerAnimation("idle");
    setPlayerImage(PLAYER_IDLE);

    const currentQ = questions[currentQuestionIndex];
    if (!currentQ) { goToNextQuestion(); return; }

    const isCorrect = !isTimeout && (index === currentQ.correctAnswer);
    let nextPlayerLife = playerLife;
    let nextOpponentLife = opponentLife;

    if (isCorrect) {
      setAnswerState("correct");
      saveProgress(currentQ.id);

      const newScore = score + POINTS_PER_HIT;
      setScore(newScore);
      updateMatchScore(matchId, isPlayer1, newScore);

      setPlayerAnimation("attack");
      setPlayerImage(PLAYER_ATK);
      setShowHolyBlast(true);

      const hitTimeout = window.setTimeout(() => {
        setOpponentAnimation("hit");
        setOpponentImage(ENEMY_HIT);
        nextOpponentLife = Math.max(0, opponentLife - 10);
        setOpponentLife(nextOpponentLife);
      }, 600);
      timeoutsRef.current.push(hitTimeout);

      const resetTimeout = window.setTimeout(() => {
        setPlayerAnimation("idle");
        setPlayerImage(PLAYER_IDLE);
        setOpponentAnimation("idle");
        setOpponentImage(ENEMY_IDLE);
        checkEndGame(nextPlayerLife, nextOpponentLife);
      }, 1600);
      timeoutsRef.current.push(resetTimeout);

    } else {
      setAnswerState("incorrect");
      setOpponentAnimation("attack");
      setOpponentImage(ENEMY_ATK);

      const hitTimeout = window.setTimeout(() => {
        setPlayerAnimation("hit");
        nextPlayerLife = Math.max(0, playerLife - 10);
        setPlayerLife(nextPlayerLife);
      }, 400);
      timeoutsRef.current.push(hitTimeout);

      const resetTimeout = window.setTimeout(() => {
        setPlayerAnimation("idle");
        setPlayerImage(PLAYER_IDLE);
        setOpponentAnimation("idle");
        setOpponentImage(ENEMY_IDLE);
        checkEndGame(nextPlayerLife, nextOpponentLife);
      }, 1200);
      timeoutsRef.current.push(resetTimeout);
    }
  };

  const checkEndGame = (pLife: number, oLife: number) => {
    if (pLife <= 0 || oLife <= 0) {
      handleLocalFinish();
    } else {
      goToNextQuestion();
    }
  };

  const goToNextQuestion = () => {
    setSelectedAnswer(null);
    setAnswerState("default");
    setCurrentQuestionIndex(prev => (prev + 1) % questions.length);
    setTimeLeft(QUESTION_TIME_LIMIT);
    setIsTimerPaused(false);
  };

  const handleLocalFinish = async () => {
    setWaitingForOpponentFinish(true);

    // Se terminou normalmente, SALVA os pontos
    if (score > 0) {
        await submitScore(score);
    }

    await finishMatch(matchId, isPlayer1);
  };

  useEffect(() => {
    if (waitingForOpponentFinish && opponentStatus === "done") {
      setTimeout(() => {
        if (score > opponentScore) setGameResult("win");
        else if (score < opponentScore) setGameResult("lose");
        else setGameResult("draw");
        setWaitingForOpponentFinish(false);
      }, 500);
    }
  }, [waitingForOpponentFinish, opponentStatus, score, opponentScore]);


  // RENDERIZAÇÃO
  if (loadingData) return <div className="min-h-screen bg-white flex items-center justify-center">Carregando...</div>;

  if (matchStatus === 'pending') {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-600 to-blue-800 text-white p-4 relative">

            {/* Botão de Cancelar no Lobby */}
            <button onClick={() => window.history.back()} className="absolute top-4 right-4 p-2 bg-white/20 rounded-full hover:bg-white/30 text-white transition-colors">
                <LogOut size={24} />
            </button>

            <div className="bg-white/10 p-8 rounded-2xl backdrop-blur-md text-center shadow-xl max-w-sm w-full">
                <Loader2 className="w-16 h-16 animate-spin mx-auto mb-6 text-yellow-400" />
                <h2 className="text-2xl font-bold mb-2">Aguardando Oponente</h2>
                <span className="text-blue-100 mb-6 block">Esperando seu amigo aceitar o desafio...</span>
                <span className="text-blue-200 text-sm mb-6 block"> Sem poderes e habilidades. Quem acertar mais vence!</span>
                <button onClick={() => window.history.back()} className="mt-8 text-sm text-white/60 hover:text-white underline">Cancelar</button>
            </div>
        </div>
    );
  }

  if (gameResult) {
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-[#003997] to-blue-500 flex flex-col items-center justify-center text-white z-50 p-4">
        <h1 className="text-4xl font-bold mb-6 uppercase">{gameResult === "win" ? "Vitória!" : gameResult === "draw" ? "Empate" : "Derrota"}</h1>
        <div className="flex gap-10 text-2xl mb-8">
            <div>Você: <span className="text-yellow-400">{score}</span></div>
            <div>Oponente: <span className="text-red-500">{opponentScore}</span></div>
        </div>
        <p className="text-sm text-gray-400 mb-8">Seus pontos foram adicionados à sua conta!</p>
        <button onClick={() => window.history.back()} className="px-6 py-3 bg-white text-black font-bold rounded-full">Voltar ao Ranking</button>
      </div>
    );
  }

  if (waitingForOpponentFinish) {
    return (
       <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
         <h2 className="text-2xl font-bold text-gray-800">Você terminou!</h2>
         <p className="text-gray-600 animate-pulse">Aguardando oponente finalizar...</p>
         {/* Botão de emergência caso trave */}
         <button onClick={() => window.history.back()} className="mt-8 px-4 py-2 text-gray-500 hover:text-red-500 border border-gray-300 rounded text-sm">
            Sair (Pode perder sincronia)
         </button>
       </div>
    )
  }

  const currentQ = questions[currentQuestionIndex];
  if (!currentQ) return <div className="p-10">Carregando perguntas...</div>;

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  let timerColor = "bg-green-500 border-green-600";
  if(timeLeft < 10) timerColor = "bg-yellow-400 border-yellow-500";
  if(timeLeft < 5) timerColor = "bg-red-500 border-red-600";

  return (
    <div className="min-h-screen p-1 bg-gradient-to-b from-background via-background to-muted/10 overflow-hidden relative">

      {/* --- 🔥 BOTÃO DE SAIR NO TOPO (VISÍVEL DURANTE O JOGO) 🔥 --- */}
      <button
        onClick={() => {
            setIsTimerPaused(true); // Pausa o timer
            setShowQuitConfirm(true); // Abre o modal
        }}
        className="absolute top-2 right-2 sm:right-4 z-50 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-transform active:scale-95"
        title="Sair da partida"
      >
        <LogOut size={20} />
      </button>

      {/* --- 🔥 MODAL DE CONFIRMAÇÃO DE SAÍDA 🔥 --- */}
      {showQuitConfirm && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center border-2 border-red-100">
                <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Abandonar Partida?</h3>
                <p className="text-sm text-gray-600 mb-6">
                    Se você sair agora, <strong>perderá todos os pontos</strong> conquistados nesta partida.
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={() => {
                            setShowQuitConfirm(false);
                            setIsTimerPaused(false); // Retoma o timer
                        }}
                        className="flex-1 py-2 px-4 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                    >
                        Continuar
                    </button>
                    <button
                        onClick={handleQuitGame}
                        className="flex-1 py-2 px-4 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                    >
                        Sair
                    </button>
                </div>
            </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto p-1 sm:p-2 relative">
        <div className="max-w-3xl mx-auto space-y-3 relative z-10">

          <div className="grid grid-cols-3 items-center bg-white/70 p-2 rounded-xl mb-2 backdrop-blur-md border border-gray-200 shadow-sm">
             <div className="flex flex-col pl-2">
                <span className="text-[12px] uppercase text-gray-500">Você</span>
                <span className="text-xl font-black text-blue-600">{score}</span>
             </div>
             <div className="flex justify-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 shadow-md ${timerColor} text-white font-bold`}>
                    {timeLeft}
                </div>
             </div>
             <div className="flex flex-col items-end pr-2">
                <span className="text-[12px] uppercase text-gray-500">
                    {/* NOTIFICAÇÃO DE STATUS DO OPONENTE */}
                    {opponentStatus === 'done' ? (
                        <span className="text-red-500 font-bold animate-pulse">OPONENTE SAIU</span>
                    ) : 'Oponente'}
                </span>
                <span className="text-xl font-black text-red-600">{opponentScore}</span>
             </div>
          </div>

          <Progress value={progress} className="mb-4 h-2" />

          <BattleArena
             playerLife={playerLife}
             opponentLife={opponentLife}
             maxLife={100}
             playerAnimation={playerAnimation}
             opponentAnimation={opponentAnimation}
             playerImage={playerImage}
             opponentImage={opponentImage}
             impactParticles={impactParticles}
             setImpactParticles={setImpactParticles}
             showHolyBlast={showHolyBlast}
             setShowHolyBlast={setShowHolyBlast}
             playerImgKey={0}
             revealEffectData={null}
             setShowRevealEffect={() => {}}
          />

          <div className="mt-2">
            <QuestionCard
                question={currentQ.question}
                roundNumber={currentQuestionIndex + 1}
                totalRounds={questions.length}
                isVisible={true}
              />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
            {currentQ.options.map((option: string, index: number) => (
              <AnswerButton
                key={index}
                text={option}
                onClick={() => handleAnswer(index)}
                state={selectedAnswer === index ? answerState : "default"}
                disabled={selectedAnswer !== null}
                index={index}
              />
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}