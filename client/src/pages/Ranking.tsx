// client/src/pages/Ranking.tsx

import { useEffect } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import FooterNav from "@/components/FooterNav";

export default function Ranking() {
  const { user } = useAuth();

  // ✅ Fetch TOP 100
  const { data: top = [] } = useQuery({
    queryKey: ["ranking"],
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scores")
        .select("*")
        .order("score", { ascending: false })
        .limit(100);

      if (error) throw error;
      return data || [];
    },
  });

const queryClient = useQueryClient();

useEffect(() => {
  const channel = supabase
    .channel("scores-realtime")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "scores" },
      () => {
        console.log("♻️ Realtime → atualizando ranking...");
        queryClient.invalidateQueries({ queryKey: ["ranking"] });
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}, [queryClient]);

  return (
    <div className="relative min-h-screen bg-[#f5f6fa] pb-20">

      {/* 🔵 TOPO VIOLETA */}
      <div className="bg-gradient-to-b from-[#003997] to-blue-500 h-[260px] w-full rounded-b-[40px] flex flex-col items-center justify-center text-white relative z-0 min-h-[180px] sm:min-h-[220px] md:min-h-[260px]">
        <button
          onClick={() => window.history.back()}
          className="absolute left-4 top-4 text-white text-sm opacity-80"
        >
          ← Voltar
        </button>

        <h1 className="text-3xl font-bold mb-16">Ranking Global</h1>
      </div>

      {/* 🏆 PÓDIO SOBREPOSTO */}
      <div className="-mt-24 px-1 flex items-center relative z-10 sm:-mt-24 sm:px-6">
        {top.length >= 3 && (
          <div
            className="flex sm:flex-row items-center sm:items-end gap-6 sm:gap-4 mx-auto w-full max-w-lg">
            {/* 2º lugar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white shadow-lg rounded-2xl p-4 w-28 text-center"
            >
              <div className="bg-gray-300 text-white w-10 h-10 flex items-center justify-center rounded-full mx-auto -mt-8 font-bold">
                2
              </div>
              <img src={top[1].avatar_url || "avatars/default.png"} className="w-14 h-14 rounded-full mx-auto" />
              <p className="text-sm font-medium mt-2">{top[1].player_name}</p>
              <p className="text-purple-600 font-bold">{top[1].score}</p>
            </motion.div>

            {/* 1º lugar */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white shadow-xl rounded-2xl p-6 w-36 text-center scale-110"
            >
              <div className="bg-yellow-400 text-white w-12 h-12 flex items-center justify-center rounded-full mx-auto -mt-10 font-bold text-xl">
                ★
              </div>
              <img src={top[0].avatar_url || "avatars/default.png"} className="w-20 h-20 rounded-full mx-auto" />
              <p className="text-base font-semibold mt-2">{top[0].player_name}</p>
              <p className="text-purple-600 font-bold text-lg">{top[0].score}</p>
            </motion.div>

            {/* 3º lugar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white shadow-lg rounded-2xl p-4 w-28 text-center"
            >
              <div className="bg-amber-300 text-white w-10 h-10 flex items-center justify-center rounded-full mx-auto -mt-8 font-bold">
                3
              </div>
              <img src={top[2].avatar_url || "avatars/default.png"} className="w-14 h-14 rounded-full mx-auto" />
              <p className="text-sm font-medium mt-2">{top[2].player_name}</p>
              <p className="text-purple-600 font-bold">{top[2].score}</p>
            </motion.div>

          </div>
        )}
      </div>

      {/* 🔽 LISTA 4–100 */}
      <div className="mt-10 px-4">
        <h3 className="text-gray-400 text-sm mb-2">Top 4–100</h3>

        {top.slice(3, 100).map((p, index) => {
          const isYou = user?.email && p.email === user.email;

          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-center justify-between bg-white rounded-xl p-4 mb-2 shadow-sm ${
                isYou ? "border-2 border-purple-500" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-purple-600 font-bold w-6">
                  {index + 4}
                </span>
                <img
                  src={p.avatar_url || "avatars/default.png"}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="font-medium">{p.player_name}</p>
                  {isYou && <p className="text-xs text-purple-500">Você</p>}
                </div>
              </div>

              <span className="text-purple-600 font-bold">{p.score}</span>
            </motion.div>
          );
        })}
      </div>
      <FooterNav />
    </div>
  );
}
// @ts-ignore
