import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

export default function InviteListener() {
  const { user } = useAuth();
  const [invite, setInvite] = useState<any>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("invites")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "matches",
          filter: `player2_id=eq.${user.id}`,
        },
        (payload) => {
          // Só mostra se o status for pending
          if (payload.new.status === "pending") {
            setInvite(payload.new);
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const handleAccept = async () => {
    if (!invite) return;

    // 1. Atualiza o status no banco para 'playing'
    // Isso vai avisar o jogador que criou a sala que o jogo começou
    const { error } = await supabase
      .from("matches")
      .update({ status: "playing" })
      .eq("id", invite.id);

    if (!error) {
      setInvite(null);
      // 2. Redireciona para a sala
      setLocation(`/multiplayer/${invite.id}`);
    }
  };

  if (!invite) return null;

  return (
    <div className="fixed top-4 right-4 bg-white p-4 shadow-xl rounded-lg border-l-4 border-blue-500 z-[9999] animate-bounce-in">
      <p className="font-bold text-gray-800">⚔️ Desafio Recebido!</p>
      <p className="text-sm text-gray-600 mb-2">Um amigo te convidou para um duelo.</p>
      <div className="flex gap-2">
        <button onClick={handleAccept} className="bg-green-500 text-white px-4 py-1 rounded text-sm font-bold">Aceitar</button>
        <button onClick={() => setInvite(null)} className="bg-red-300 text-white px-3 py-1 rounded text-sm">Ignorar</button>
      </div>
    </div>
  );
}