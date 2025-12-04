import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import FooterNav from "@/components/FooterNav";
// Adicionado Share2 aos imports
import { UserPlus, Swords, UserCheck, Check, Share2, Globe } from "lucide-react";

import { createMatchInvite } from "@/services/multiplayer";
import { followUser } from "@/services/social";

export default function Ranking() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // 🔥 NOVO: Estado para armazenar IDs dos usuários online
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

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

  // 2. Buscar Lista de Amigos (Quem eu já sigo?)
  const { data: followingList = [] } = useQuery({
    queryKey: ["my_friends", user?.id],
    enabled: !!user, // Só busca se estiver logado
    queryFn: async () => {
      const { data, error } = await supabase
        .from("friends")
        .select("friend_id")
        .eq("user_id", user?.id);

      if (error) throw error;
      // Retorna apenas um array de IDs: ['id1', 'id2']
      return data.map((f: any) => f.friend_id);
    }
  });

  // 3. Monitorar Usuários Online (Supabase Presence)
  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel('global_presence', {
      config: { presence: { key: user.id } },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState();
        const onlineIds = new Set(Object.keys(newState));
        setOnlineUsers(onlineIds);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ online_at: new Date().toISOString() });
        }
      });

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  // Realtime Update (Scores)
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

    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  // --- AÇÕES ---

  async function handleChallenge(opponentId: string) {
    if (!user) return alert("Faça login para jogar!");
    try {
      const match = await createMatchInvite(opponentId);
      if (match) setLocation(`/multiplayer/${match.id}`);
    } catch (e) {
      console.error(e);
      alert("Erro ao criar desafio.");
    }
  }

  async function handleFollow(friendId: string) {
    if (!user) return alert("Faça login para seguir!");
    try {
      await followUser(friendId);
      queryClient.invalidateQueries({ queryKey: ["my_friends"] });
    } catch (e) {
      console.error(e);
      alert("Erro ao tentar seguir.");
    }
  }

  // --- FUNÇÃO DE COMPARTILHAR ---
  const handleShareGame = async () => {
    const shareData = {
      title: 'Jesus Quiz Battle',
      text: 'Olá, venha jogar comigo o Jesus Quiz Battle. Um Quiz de perguntas e respostas Bíblica.',
      url: 'https://play.google.com/store/apps/details?id=com.jesusquiz.battle33', // Link da PlayStore
    };

    try {
      // Tenta usar o compartilhamento nativo do celular
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback para PC: Copia para a área de transferência
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        alert("Link copiado! Envie para seus amigos.");
      }
    } catch (err) {
      console.error('Erro ao compartilhar:', err);
    }
  };

  const renderFollowButton = (playerId: string) => {
    if (!user || playerId === user.id) return null;

    const isFollowing = followingList.includes(playerId);

    if (isFollowing) {
      return (
        <button
            disabled
            className="flex items-center gap-1 bg-gray-200 text-gray-500 px-2 py-2 rounded-full text-[10px] sm:text-xs font-medium cursor-default opacity-80"
        >
            <Check size={14} /> Seguindo
        </button>
      );
    }

    return (
        <button
            onClick={() => handleFollow(playerId)}
            className="flex items-center shadow-lg gap-1 bg-blue-100 text-blue-600 px-2 py-2 rounded-full text-[10px] sm:text-xs font-bold hover:bg-blue-200 transition-colors"
        >
            <UserPlus size={14} /> Seguir
        </button>
    );
  };

  // Componente da Bolinha Online
  const OnlineBadge = () => (
    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-sm z-10" title="Online" />
  );

  return (
    <div className="min-h-screen bg-[#f5f6fa] pb-28 relative font-sans">

          {/* 🔵 HEADER CURVADO (Igual ao Ranking) */}
          <div className="bg-gradient-to-b from-[#003997] to-blue-500 h-[280px] w-full rounded-b-[40px] flex flex-col items-center pt-8 text-white relative z-0 shadow-lg">

            {/* Botão Voltar Absoluto */}
            <button
                      onClick={() => window.history.back()}
                      className="absolute left-4 top-4 text-white text-sm opacity-80"
                    >
                      ← Voltar
            </button>

            <div className="mt-6 flex flex-col items-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3 backdrop-blur-sm">
                    <Globe size={24} className="text-white" />
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight">Raking Global</h1>
            </div>
          </div>

      <div className="-mt-24 px-1 flex items-center relative z-10 sm:-mt-24 sm:px-6 justify-center">

        {top.length >= 3 && (
          <div className="flex sm:flex-row items-center sm:items-end gap-2 sm:gap-4 mx-auto w-full max-w-lg justify-center">

              <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white shadow-lg rounded-2xl p-4 w-28 text-center flex flex-col items-center h-[220px] justify-between"
            >
              <div className="flex flex-col items-center w-full">
                <div className="bg-gray-300 text-white w-10 h-10 flex items-center justify-center rounded-full mx-auto -mt-8 font-bold">2º</div>

                <div className="relative inline-block mt-2">
                  <img src={top[1]?.avatar_url || "avatars/default.png"} className="w-16 h-16 rounded-full border-4 border-white shadow-md object-cover" alt="avatar" />
                  {onlineUsers.has(top[1].user_id) && <OnlineBadge />}
                </div>

                <p className="text-sm font-medium mt-2 truncate w-full">{top[1].player_name}</p>

                <div className="flex flex-col gap-1 w-full items-center mt-1 min-h-[50px] justify-center">
                  {renderFollowButton(top[1].user_id)}

                  {/* SÓ MOSTRA SE FOR AMIGO */}
                  {user && top[1].user_id !== user.id && followingList.includes(top[1].user_id) && (
                      <button onClick={() => handleChallenge(top[1].user_id)} className="bg-red-500 text-white text-[10px] px-3 py-1 rounded-full font-bold w-full shadow-sm">⚔️</button>
                  )}
                </div>
              </div>

              <p className="text-purple-600 font-bold mb-2">{top[1].score}</p>
            </motion.div>

            {/* 1º lugar - FIXADO h-[250px] para ser maior e central */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white shadow-xl rounded-2xl p-4 w-36 text-center scale-110 z-20 flex flex-col items-center h-[250px] justify-between transform -translate-y-4"
            >
              <div className="flex flex-col items-center w-full">
                <div className="bg-yellow-400 text-white w-12 h-12 flex items-center justify-center rounded-full mx-auto -mt-8 font-bold text-xl ring-4 ring-[#f5f6fa]">1º</div>

                <div className="relative inline-block mt-1">
                  <img src={top[0]?.avatar_url || "avatars/default.png"} className="w-20 h-20 rounded-full mx-auto object-cover" />
                  {onlineUsers.has(top[0].user_id) && <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full z-10" />}
                </div>

                <p className="text-base font-semibold mt-2 truncate w-full">{top[0].player_name}</p>

                <div className="flex flex-col gap-1 w-full items-center mt-2 min-h-[50px] justify-center">
                  {renderFollowButton(top[0].user_id)}

                  {/* SÓ MOSTRA SE FOR AMIGO */}
                  {user && top[0].user_id !== user.id && followingList.includes(top[0].user_id) && (
                      <button onClick={() => handleChallenge(top[0].user_id)} className="bg-red-500 text-white text-xs px-4 py-1 rounded-full font-bold w-full shadow-md">⚔️</button>
                  )}
                </div>
              </div>

              <p className="text-purple-600 font-bold text-lg mb-4">{top[0].score}</p>
            </motion.div>

            {/* 3º lugar - FIXADO h-[220px] igual ao 2º */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white shadow-lg rounded-2xl p-4 w-28 text-center flex flex-col items-center h-[220px] justify-between"
            >
              <div className="flex flex-col items-center w-full">
                <div className="bg-amber-300 text-white w-10 h-10 flex items-center justify-center rounded-full mx-auto -mt-8 font-bold">3º</div>

                <div className="relative inline-block mt-2">
                  <img src={top[2]?.avatar_url || "avatars/default.png"} className="w-14 h-14 rounded-full mx-auto object-cover" />
                  {onlineUsers.has(top[2].user_id) && <OnlineBadge />}
                </div>

                <p className="text-sm font-medium mt-2 truncate w-full">{top[2].player_name}</p>

                <div className="flex flex-col gap-1 w-full items-center mt-1 min-h-[50px] justify-center">
                  {renderFollowButton(top[2].user_id)}

                  {/* SÓ MOSTRA SE FOR AMIGO */}
                  {user && top[2].user_id !== user.id && followingList.includes(top[2].user_id) && (
                      <button onClick={() => handleChallenge(top[2].user_id)} className="bg-red-500 text-white text-[10px] px-3 py-1 rounded-full font-bold w-full shadow-sm">⚔️</button>
                  )}
                </div>
              </div>

              <p className="text-purple-600 font-bold mb-2">{top[2].score}</p>
            </motion.div>
          </div>
        )}
      </div>

      {/* 🔽 LISTA 4–100 */}
      <div className="mt-12 px-4 pb-10 max-w-2xl mx-auto">

        {/* 🔥 BOTÃO DE COMPARTILHAR (Ajustado com margem e design) */}
        <div className="mb-8 flex justify-center">
            <button
            onClick={handleShareGame}
            className="w-full sm:w-auto bg-[#25D366] hover:bg-[#1ebc57] active:scale-95 transition-all text-white font-bold py-3 px-8 rounded-full shadow-lg flex items-center justify-center gap-3"
            >
            <Share2 size={22} strokeWidth={2.5} />
            <span className="text-base sm:text-lg">Convidar Amigos</span>
            </button>
        </div>

        <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3 ml-1">Top 4–100</h3>

        {top.slice(3, 100).map((p, index) => {
          const isYou = user?.email && p.email === user.email;
          const isOther = user && p.user_id && p.user_id !== user.id;
          const isFollowing = p.user_id && followingList.includes(p.user_id);

          // Verifica se está online
          const isOnline = p.user_id && onlineUsers.has(p.user_id);

          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-center justify-between bg-white rounded-xl p-4 mb-2 shadow-lg border border-transparent ${
                isYou ? "!border-purple-500 bg-purple-50" : ""
              }`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <span className="text-gray-400 font-bold w-6 text-center text-sm">
                  {index + 4}
                </span>

                {/* AVATAR COM BOLINHA ONLINE */}
                <div className="relative inline-block flex-shrink-0">
                    <img src={p.avatar_url || "avatars/default.png"} className="w-10 h-10 rounded-full object-cover bg-gray-100" />
                    {isOnline && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>}
                </div>

                <div className="min-w-0">
                  <p className="font-bold text-gray-800 text-sm truncate">{p.player_name}</p>
                  {isYou && <p className="text-[10px] text-purple-600 font-bold uppercase">Você</p>}
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                 <span className="text-purple-700 font-extrabold text-sm">{p.score}</span>

                 {isOther && (
                    <div className="flex flex-col sm:flex-row gap-2 items-center">
                        {renderFollowButton(p.user_id)}

                        {/* SÓ MOSTRA SE FOR AMIGO (isFollowing) */}
                        {isFollowing && (
                            <button
                                onClick={() => handleChallenge(p.user_id)}
                                className="bg-red-100 shadow-sm hover:bg-red-200 text-red-600 p-3 rounded-lg transition-colors"
                                title="Desafiar"
                            >
                                <Swords size={26} />
                            </button>
                        )}
                    </div>
                 )}
              </div>

            </motion.div>
          );
        })}
      </div>
      <FooterNav />
    </div>
  );
}