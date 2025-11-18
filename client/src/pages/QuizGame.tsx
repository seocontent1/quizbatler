import { useState, useEffect } from "react";
import BattleArena from "@/components/BattleArena";
import QuestionCard from "@/components/QuestionCard";
import AnswerButton from "@/components/AnswerButton";
import ScoreDisplay from "@/components/ScoreDisplay";
import GameOverModal from "@/components/GameOverModal";
import StartScreen from "@/components/StartScreen";
import Timer from "@/components/Timer";
import { Progress } from "@/components/ui/progress";

//todo: remove mock functionality - replace with real quiz questions from backend
const MOCK_QUESTIONS = [
  {
    id: "1",
    question: "What is the capital of France?",
    options: ["London", "Berlin", "Paris", "Madrid"],
    correctAnswer: 2,
    difficulty: "easy",
  },
  {
    id: "2",
    question: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    correctAnswer: 1,
    difficulty: "easy",
  },
  {
    id: "3",
    question: "What is the largest ocean on Earth?",
    options: ["Atlantic", "Indian", "Arctic", "Pacific"],
    correctAnswer: 3,
    difficulty: "easy",
  },
  {
    id: "4",
    question: "Who painted the Mona Lisa?",
    options: ["Vincent van Gogh", "Leonardo da Vinci", "Pablo Picasso", "Claude Monet"],
    correctAnswer: 1,
    difficulty: "medium",
  },
  {
    id: "5",
    question: "What is the smallest prime number?",
    options: ["0", "1", "2", "3"],
    correctAnswer: 2,
    difficulty: "medium",
  },
  {
    id: "6",
    question: "In what year did World War II end?",
    options: ["1943", "1944", "1945", "1946"],
    correctAnswer: 2,
    difficulty: "medium",
  },
  {
    id: "7",
    question: "What is the chemical symbol for gold?",
    options: ["Go", "Gd", "Au", "Ag"],
    correctAnswer: 2,
    difficulty: "hard",
  },
  {
    id: "8",
    question: "Which programming language was developed by Guido van Rossum?",
    options: ["Java", "Python", "Ruby", "JavaScript"],
    correctAnswer: 1,
    difficulty: "hard",
  },
  {
    id: "9",
    question: "What is the speed of light in vacuum?",
    options: ["299,792 km/s", "150,000 km/s", "500,000 km/s", "1,000,000 km/s"],
    correctAnswer: 0,
    difficulty: "hard",
  },
  {
    id: "10",
    question: "Who wrote 'To Kill a Mockingbird'?",
    options: ["Harper Lee", "Mark Twain", "Ernest Hemingway", "F. Scott Fitzgerald"],
    correctAnswer: 0,
    difficulty: "medium",
  },
];

type AnimationState = "idle" | "attack" | "hit" | "victory";

export default function QuizGame() {
  const [gameState, setGameState] = useState<"start" | "playing" | "gameover">("start");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [playerLives, setPlayerLives] = useState(3);
  const [opponentLives, setOpponentLives] = useState(3);
  const [maxLives, setMaxLives] = useState(3);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerState, setAnswerState] = useState<"default" | "correct" | "incorrect">("default");
  const [playerAnimation, setPlayerAnimation] = useState<AnimationState>("idle");
  const [opponentAnimation, setOpponentAnimation] = useState<AnimationState>("idle");
  const [questionVisible, setQuestionVisible] = useState(true);
  const [timerReset, setTimerReset] = useState(false);
  const [timerPaused, setTimerPaused] = useState(false);

  const currentQuestion = MOCK_QUESTIONS[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / MOCK_QUESTIONS.length) * 100;

  const handleStart = (selectedDifficulty: "easy" | "medium" | "hard") => {
    setDifficulty(selectedDifficulty);
    const lives = selectedDifficulty === "easy" ? 5 : 3;
    setMaxLives(lives);
    setPlayerLives(lives);
    setOpponentLives(lives);
    setGameState("playing");
    resetGame();
  };

  const resetGame = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setCorrectAnswers(0);
    setCurrentStreak(0);
    setSelectedAnswer(null);
    setAnswerState("default");
    setPlayerAnimation("idle");
    setOpponentAnimation("idle");
    setQuestionVisible(true);
  };

  const handleAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null) return;

    setTimerPaused(true);
    setSelectedAnswer(answerIndex);
    const isCorrect = answerIndex === currentQuestion.correctAnswer;

    if (isCorrect) {
      setAnswerState("correct");
      setCorrectAnswers((prev) => prev + 1);
      setCurrentStreak((prev) => prev + 1);
      const points = 100 + currentStreak * 10;
      setScore((prev) => prev + points);

      setQuestionVisible(false);
      setTimeout(() => setPlayerAnimation("attack"), 200);
      setTimeout(() => setOpponentAnimation("hit"), 600);
      setTimeout(() => {
        setOpponentLives((prev) => Math.max(0, prev - 1));
        setPlayerAnimation("idle");
        setOpponentAnimation("idle");
      }, 1000);
    } else {
      setAnswerState("incorrect");
      setCurrentStreak(0);

      setTimeout(() => setOpponentAnimation("attack"), 200);
      setTimeout(() => setPlayerAnimation("hit"), 400);
      setTimeout(() => {
        setPlayerLives((prev) => Math.max(0, prev - 1));
        setPlayerAnimation("idle");
        setOpponentAnimation("idle");
      }, 800);
    }

    setTimeout(() => {
      if (currentQuestionIndex < MOCK_QUESTIONS.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
        setSelectedAnswer(null);
        setAnswerState("default");
        setQuestionVisible(true);
        setTimerReset(!timerReset);
        setTimerPaused(false);
      } else {
        setTimeout(() => {
          setGameState("gameover");
        }, 500);
      }
    }, 1800);
  };

  const handleTimeout = () => {
    if (selectedAnswer !== null) return;

    setTimerPaused(true);
    setCurrentStreak(0);
    
    setTimeout(() => setOpponentAnimation("attack"), 200);
    setTimeout(() => setPlayerAnimation("hit"), 400);
    setTimeout(() => {
      setPlayerLives((prev) => Math.max(0, prev - 1));
      setPlayerAnimation("idle");
      setOpponentAnimation("idle");
    }, 800);

    setTimeout(() => {
      if (currentQuestionIndex < MOCK_QUESTIONS.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
        setSelectedAnswer(null);
        setAnswerState("default");
        setQuestionVisible(true);
        setTimerReset(!timerReset);
        setTimerPaused(false);
      } else {
        setTimeout(() => {
          setGameState("gameover");
        }, 500);
      }
    }, 1800);
  };

  useEffect(() => {
    if (playerLives === 0) {
      setTimeout(() => setGameState("gameover"), 1000);
    } else if (opponentLives === 0) {
      setPlayerAnimation("victory");
      setTimeout(() => setGameState("gameover"), 1500);
    }
  }, [playerLives, opponentLives]);

  const handleRestart = () => {
    setGameState("start");
    const lives = difficulty === "easy" ? 5 : 3;
    setMaxLives(lives);
    setPlayerLives(lives);
    setOpponentLives(lives);
    resetGame();
  };

  const handleClose = () => {
    setGameState("start");
  };

  if (gameState === "start") {
    return <StartScreen onStart={handleStart} />;
  }

  return (
    <div className="min-h-screen p-4 bg-gradient-to-b from-background via-background to-muted/10">
      <div className="max-w-6xl mx-auto pt-8">
        <Progress value={progress} className="mb-8 h-2" data-testid="progress-quiz" />

        <BattleArena
          playerLives={playerLives}
          opponentLives={opponentLives}
          maxLives={maxLives}
          playerAnimation={playerAnimation}
          opponentAnimation={opponentAnimation}
        />

        <div className="mt-12 mb-8">
          <QuestionCard
            question={currentQuestion.question}
            roundNumber={currentQuestionIndex + 1}
            totalRounds={MOCK_QUESTIONS.length}
            isVisible={questionVisible}
          />
        </div>

        <div className="max-w-3xl mx-auto space-y-6">
          <ScoreDisplay
            correctAnswers={correctAnswers}
            currentStreak={currentStreak}
            totalScore={score}
          />

          <Timer 
            duration={7}
            onTimeout={handleTimeout}
            isPaused={timerPaused}
            reset={timerReset}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestion.options.map((option, index) => (
              <AnswerButton
                key={index}
                text={option}
                onClick={() => handleAnswer(index)}
                state={
                  selectedAnswer === null
                    ? "default"
                    : selectedAnswer === index
                    ? answerState
                    : "default"
                }
                disabled={selectedAnswer !== null}
                index={index}
              />
            ))}
          </div>
        </div>
      </div>

      <GameOverModal
        isOpen={gameState === "gameover"}
        isVictory={opponentLives === 0}
        finalScore={score}
        correctAnswers={correctAnswers}
        totalQuestions={MOCK_QUESTIONS.length}
        onRestart={handleRestart}
        onClose={handleClose}
      />
    </div>
  );
}
