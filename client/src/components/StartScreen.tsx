import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Swords, Zap, Flame, StarHalf, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { loginWithGoogle, logout } from "@/services/auth";

interface StartScreenProps {
  onStart: (difficulty: "easy" | "medium" | "hard") => void;
  boostsLeft: number;
}

export default function StartScreen({ onStart, boostsLeft }: StartScreenProps) {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { user, loading } = useAuth();
    // guestMode armazenado no navegador
  const [guestMode, setGuestMode] = useState(
    localStorage.getItem("guestMode") === "true"
  );

  function startGuest() {
    localStorage.setItem("guestMode", "true");
    setGuestMode(true);
  }

  // trava botões se não estiver logado e não for convidado
  const buttonsLocked = !user && !guestMode;
  const storeLocked = !user && !guestMode;
  return (
    <div className="min-h-screen flex flex-col items-center justify-start relative overflow-hidden">
        {/* 🔵 BACKGROUND AZUL */}
       <div className="absolute top-0 left-0 w-full h-[55vh] bg-[#0038B8] z-0 rounded-b-[40px] overflow-hidden" />
        {/* 🌟 OVERLAY SVG BASE64 */}
          <div
            className="absolute top-0 left-0 w-full h-[50vh] rounded-b-[40px] overflow-hidden z-0 bg-[#0038B8]"
            style={{
              backgroundImage: "url('/character_sprites/bg.svg')",
              backgroundSize: "cover",      // mantém proporção e corta o excesso
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              mixBlendMode: "overlay",      // mescla com o azul
              opacity: 0.6                  // opcional
            }}
          />
        {/* 🟡 TITLE IMAGE */}
        <img
          src="/character_sprites/title.png"
          className="relative z-20 p-8"
        />

      <div className="w-full space-y-8 relative z-20">

        <div className="text-center">
          {loading ? (
            <p>Carregando...</p>
          ) : user ? (
            <div className="space-y-2">
              <p className="font-semibold text-white">Olá, {user.user_metadata.full_name}. Vamos ajudar Jesus a derrotar Satanas?</p>
              <button
                onClick={logout}
                className="px-4 py-1 bg-red-500 text-white rounded"
              >
                Sair
              </button>

            </div>
          ) : null}
        </div>

        <Card className="w-full max-w-lg p-4 mx-auto overflow-visible">
         <div className="flex justify-evenly">
           <div
             onClick={() => {
               if (!user || guestMode) {
                 setShowLoginModal(true);
                 return;
               }

               // ✅ só logado pode acessar
               window.location.href = "/store";
             }}
             className="rounded-md bg-[#ffbc42] p-3 w-full text-center font-semibold shadow-[0_3px_0_0_rgba(0,0,0,0.5)] md:shadow-[0_4px_0_0_rgba(0,0,0,0.5)] cursor-pointer"
           >
             <span className="text-xl">Comprar Booster</span>
           </div>
         </div>

          <h2 className="text-2xl font-semibold mb-6 mt-6 text-center">Selecione a dificuldade</h2>
          <div className="flex flex-col gap-4 w-full">

            {/* FÁCIL */}
            <Button
              onClick={() => {
                  if (buttonsLocked) {
                    setShowLoginModal(true);
                    return;
                  }
                    onStart("easy");
                }}
                size="lg"
                variant="outline"
                className={cn(
                "w-full",
                buttonsLocked && "opacity-50 opacity-50 select-none",
                "!border-2 !border-black !rounded-md",
                "text-black",
                // --- Responsividade ---
                "px-4 py-3 md:px-6",
                "h-auto min-h-[64px]",
                "text-base md:text-lg",
                "gap-3 md:gap-4",
                // --- Sombra estilo Feastables ---
                "shadow-[0_6px_0_0_rgba(0,0,0,1)] md:shadow-[0_8px_0_0_rgba(0,0,0,1)]"
              )}
            >
              <StarHalf className="w-6 h-6 text-primary" />
              <div className="flex-1 text-left leading-tight">
                <div className="font-semibold">Nível Fácil</div>
                <div className="text-black">Ler a Bíblia às vezes!</div>
              </div>
            </Button>

            {/* MÉDIO */}
            <Button
              onClick={() => {
                  if (buttonsLocked) {
                    setShowLoginModal(true);
                    return;
                  }
                  onStart("medium");
              }}
              size="lg"
              variant="outline"
              className={cn(
                "w-full",
                buttonsLocked && "opacity-50 select-none",
                "!border-2 !border-black !rounded-md",
                "text-black",
                // --- Responsividade ---
                "px-4 py-3 md:px-6",
                "h-auto min-h-[64px]",
                "text-base md:text-lg",
                "gap-3 md:gap-4",
                // --- Sombra estilo Feastables ---
                "shadow-[0_6px_0_0_rgba(0,0,0,1)] md:shadow-[0_8px_0_0_rgba(0,0,0,1)]"
              )}
            >
              <Swords className="w-6 h-6 text-cyan-400" />
              <div className="flex-1 text-left leading-tight">
                <div className="font-semibold">Nível Médio</div>
                <div className="text-black">Estudante da Bíblia</div>
              </div>
            </Button>

            {/* DIFÍCIL */}
            <Button
             onClick={() => {
                 if (buttonsLocked) {
                   setShowLoginModal(true);
                   return;
                 }
                 onStart("hard");
              }}
              size="lg"
              variant="outline"
              className={cn(
                "w-full",
                buttonsLocked && "opacity-50 select-none",
                "!border-2 !border-black !rounded-md",
                "text-black",
                // --- Responsividade ---
                "px-4 py-3 md:px-6",
                "h-auto min-h-[64px]",
                "text-base md:text-lg",
                "gap-3 md:gap-4",
                // --- Sombra estilo Feastables ---
                "shadow-[0_6px_0_0_rgba(0,0,0,1)] md:shadow-[0_8px_0_0_rgba(0,0,0,1)]"
              )}
            >
              <Flame className="w-6 h-6 text-orange-400" />
              <div className="flex-1 text-left leading-tight">
                <div className="font-semibold">Nível Difícil</div>
                <div className="text-black">Nível Teólogo.</div>
              </div>
            </Button>

            {/* SUPER */}
            <Button
            onClick={() => {
                if (buttonsLocked) {
                  setShowLoginModal(true);
                  return;
                }
                onStart("super");
              }}
              size="lg"
              variant="outline"
              className={cn(
                "w-full",
                buttonsLocked && "opacity-50 select-none",
                "!border-2 !border-black !rounded-md",
                "text-black",
                // --- Responsividade ---
                "px-4 py-3 md:px-6",
                "h-auto min-h-[64px]",
                "text-base md:text-lg",
                "gap-3 md:gap-4",
                // --- Sombra estilo Feastables ---
                "shadow-[0_6px_0_0_rgba(0,0,0,1)] md:shadow-[0_8px_0_0_rgba(0,0,0,1)]"
              )}
            >
              <Shield className="w-6 h-6 text-destructive" />
              <div className="flex-1 text-left leading-tight">
              <div className="font-semibold">Nível Exegeta</div>
              <div className="text-black">Especialista em Bíblia.</div>
              </div>
            </Button>

          </div>
        </Card>
        <div className="w-full max-w-lg mx-auto p-4 overflow-visible">
        <Button
          asChild
          size="lg"
          variant="outline"
          className="w-full !border-2 !border-black !rounded-md px-4 py-3"
        >
          <Link href="/ranking">
            Ver Ranking Global
          </Link>
        </Button>
        </div>
        <Card className="bg-muted/50 max-w-2xl p-4 mx-auto w-fit">
          <h3 className="font-semibold mb-3">Como Jogar</h3>
          <ul className="space-y-2 text-muted-foreground">
            <li>• O tempo também é seu inimigo. Seja rápido ou perderemos!</li>
            <li>• Se você é leitor fiel da Bíblia ajudará Jesus nessa luta!</li>
            <li>• Responda às perguntas corretamente para acabar com satanas!</li>
            <li>• Não erre, ou satanas poderá vencer a batalha!</li>
            <li>• Quanto mais rápido você responder mais vida você tira dele!</li>
            <li>• Vamos salvar o mundo dos laços de Satanas!</li>
          </ul>
        </Card>
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
    </div>
  );
}
