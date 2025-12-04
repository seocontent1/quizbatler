// src/components/ChestReward.tsx
import { useState, useEffect } from "react";
import { X, Clock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import ARCA from "/assets/bau.svg";
import LOCK_ARCA from "/assets/lock_arca.svg";

// Tipos de baú e seus cooldowns
const CHEST_TYPES = [
  { id: "12h", label: "Baú Rápido", hours: 12, color: "from-gray-400 to-gray-600" },
  { id: "24h", label: "Baú Premium", hours: 24, color: "from-blue-400 to-blue-600" },
  { id: "36h", label: "Baú Lendário", hours: 36, color: "from-[#c3a500] to-[#fddb24]" },
];

// Sistema de recompensas com probabilidades
const REWARDS = {
  "12h": [
    { type: "boosters", amount: 1, chance: 100 },
    { type: "coins", amount: 10, chance: 100 },
    { type: "boosters", amount: 2, chance: 60 },
    { type: "coins", amount: 25, chance: 60 },
  ],
  "24h": [
    { type: "boosters", amount: 3, chance: 100 },
    { type: "coins", amount: 50, chance: 100 },
    { type: "boosters", amount: 3, chance: 60 },
    { type: "coins", amount: 100, chance: 60 },
    { type: "boosters", amount: 3, chance: 35 },
    { type: "coins", amount: 120, chance: 35 },
  ],
  "36h": [
    { type: "boosters", amount: 3, chance: 100 },
    { type: "coins", amount: 130, chance: 100 },
    { type: "boosters", amount: 3, chance: 60 },
    { type: "coins", amount: 150, chance: 60 },
    { type: "boosters", amount: 5, chance: 35 },
    { type: "coins", amount: 250, chance: 35 },
    { type: "boosters", amount: 5, chance: 5 },
    { type: "coins", amount: 500, chance: 5 },
  ],
};

function selectRandomReward(chestType: string) {
  const rewards = REWARDS[chestType];
  const availableRewards = rewards.filter(r => Math.random() * 100 <= r.chance);
  return availableRewards[Math.floor(Math.random() * availableRewards.length)];
}

function formatTimeRemaining(ms: number) {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((ms % (1000 * 60)) / 1000);

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

export default function ChestReward() {
  const { user } = useAuth();

  const [showModal, setShowModal] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [reward, setReward] = useState<any>(null);
  const [chestStates, setChestStates] = useState<Record<string, { available: boolean; timeLeft: number }>>({});

  useEffect(() => {
    [ARCA, LOCK_ARCA].forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  useEffect(() => {
    if (!user) return;

    const loadChestStates = async () => {
      const { data, error } = await supabase.rpc('check_chest_availability', {
        p_user_id: user.id
      });

      if (error) {
        console.error("Erro ao verificar baús:", error);
        return;
      }

      // O servidor retorna o estado de cada baú
      const states: Record<string, { available: boolean; timeLeft: number }> = {};

      data.forEach((chest: any) => {
        states[chest.chest_type] = {
          available: chest.available,
          timeLeft: chest.time_left_ms
        };
      });

      setChestStates(states);
    };

    loadChestStates();
    const interval = setInterval(loadChestStates, 1000);
    return () => clearInterval(interval);
  }, [user]);

  const handleOpenChest = async (chestType: string) => {
    if (!user || claiming) return;

    setClaiming(true);
    const selectedReward = selectRandomReward(chestType);

    try {
      const { data, error } = await supabase.rpc("claim_chest_reward", {
        p_user_id: user.id,
        p_chest_type: chestType,
        p_reward_type: selectedReward.type,
        p_reward_amount: selectedReward.amount,
      });

      if (error) throw error;

      setReward(selectedReward);
      setShowModal(false);
      setShowReward(true);

      setTimeout(() => {
        setShowReward(false);
        setReward(null);
      }, 3000);

    } catch (error) {
      console.error("Erro ao coletar baú:", error);
    } finally {
      setClaiming(false);
    }
  };

  if (!user) return null;

  // 🔒 Verifica se tem PELO MENOS UM baú disponível
  const hasAvailableChest = Object.values(chestStates).some(s => s.available);

  return (
    <>
      {/* Botão do Baú - SÓ APARECE QUANDO TEM BAÚ DISPONÍVEL */}
      {hasAvailableChest && (
        <button
          onClick={() => setShowModal(true)}
          className="fixed bottom-24 right-4 z-50 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full shadow-2xl hover:scale-110 transition-transform"
        >
          <div className="relative">
            <img src={ARCA} className="w-20 h-20" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          </div>
        </button>
      )}

      {/* Modal de Seleção de Baú */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[999] p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>

            <h2 className="text-2xl font-bold mb-6 text-center">Arca da Recompensa</h2>

            <div className="space-y-4">
              {CHEST_TYPES.map((chest) => {
                const state = chestStates[chest.id];
                const isAvailable = state?.available ?? false;
                const timeLeft = state?.timeLeft ?? 0;

                return (
                  <div
                    key={chest.id}
                    className={`p-4 rounded-xl border-2 ${
                      isAvailable
                        ? "border-green-500 bg-green-50"
                        : "border-gray-300 bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                      <span className="text-3xl">
                        {isAvailable ? (
                          <img src={ARCA} className="w-10 h-10 inline-block" />
                        ) : (
                          <img src={LOCK_ARCA} className="w-10 h-10 inline-block" />
                        )}
                      </span>
                        <div>
                          <h3 className="font-bold text-lg">{chest.label}</h3>
                          <p className="text-sm text-gray-600">
                            Tempo: {chest.hours}h
                          </p>
                        </div>
                      </div>

                      {isAvailable ? (
                        <button
                          onClick={() => handleOpenChest(chest.id)}
                          disabled={claiming}
                          className={`px-4 py-2 rounded-lg font-bold text-white bg-gradient-to-r ${chest.color} hover:scale-105 transition-transform disabled:opacity-50`}
                        >
                          {claiming ? "Abrindo..." : "Abrir"}
                        </button>
                      ) : (
                        <div className="flex items-center gap-1 text-gray-600 text-sm">
                          <Clock size={16} />
                          <span>{formatTimeRemaining(timeLeft)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-gray-500 text-center mt-6">
              Os baús ficam disponíveis após o tempo de espera
            </p>
          </div>
        </div>
      )}

      {/* Modal de Recompensa */}
      {showReward && reward && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] animate-fadeIn">
          <div className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 rounded-3xl p-8 text-center relative overflow-hidden shadow-2xl animate-scaleIn">
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-transparent animate-shimmer" />

            <div className="relative text-center z-10 mb-4">
                <img src={ARCA} className="w-12 h-12 inline-block animate-bounce" />
            </div>

            <div className="relative z-10 bg-white rounded-2xl p-6 shadow-xl">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">
                Você ganhou!
              </h2>

              <div className="flex items-center justify-center gap-3 mb-2">
                <span className="text-5xl">
                  {reward.type === "boosters" ? "⚡" : "🪙"}
                </span>
                <span className="text-5xl font-extrabold text-gray-900">
                  {reward.amount}
                </span>
              </div>

              <p className="text-gray-600 font-medium">
                {reward.type === "boosters" ? "Boosters" : "Moedas"}
              </p>
            </div>

            <div className="absolute inset-0 pointer-events-none">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute animate-confetti"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 0.5}s`,
                  }}
                >
                  ✨
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scaleIn {
          from { transform: scale(0.5); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        @keyframes shimmer {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }

        @keyframes confetti {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100px) rotate(360deg); opacity: 0; }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }

        .animate-confetti {
          animation: confetti 2s ease-out forwards;
        }
      `}</style>
    </>
  );
}