import { useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// PÁGINAS
import QuizGame from "@/pages/QuizGame";
import NotFound from "@/pages/not-found";
import RankingPage from "@/pages/Ranking";
import StartPage from "@/pages/StartPage";
import Store from "@/pages/Store";
import ProfilePage from "@/pages/Profile";
import TasksPage from "@/pages/TasksPage";
// 👇 IMPORTAR A PÁGINA MULTIPLAYER
import MultiplayerQuizGame from "@/pages/MultiplayerQuizGame";

// 👇 IMPORTAR O LISTENER DE CONVITES
import InviteListener from "@/components/InviteListener";

import { useAuth } from "@/hooks/useAuth";
import { initRevenueCat } from "@/services/revenuecat";
import { Capacitor } from "@capacitor/core";
import { setAppStatusBar } from "./utils/statusBar";

function Router() {
  return (
    <Switch>
      <Route path="/start" component={StartPage} />
      <Route path="/store" component={Store} />
      <Route path="/ranking" component={RankingPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/tasks" component={TasksPage} />

      {/* Rota do Multiplayer */}
      <Route path="/multiplayer/:id" component={MultiplayerQuizGame} />

      <Route exact path="/" component={QuizGame} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  const { user } = useAuth();
  const [location] = useLocation();

  useEffect(() => {
    if (user) {
      initRevenueCat(user.id);
    }
  }, [user]);

  useEffect(() => {
    // roda só quando empacotado (android/ios)
    if (Capacitor.getPlatform() !== "web") {
      setAppStatusBar();
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />

        {/* 👇 ADICIONE AQUI! Assim ele funciona em todas as telas */}
        <InviteListener />

        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}