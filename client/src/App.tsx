import { useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import QuizGame from "@/pages/QuizGame";
import NotFound from "@/pages/not-found";
import RankingPage from "@/pages/Ranking";
import StartPage from "@/pages/StartPage";
import Store from "@/pages/Store";

import { useAuth } from "@/hooks/useAuth";
import { initRevenueCat } from "@/services/revenuecat";

function Router() {
  return (
    <Switch>
      <Route path="/start" component={StartPage} />
      <Route path="/store" component={Store} />
      <Route path="/ranking" component={RankingPage} />
      <Route path="/" component={QuizGame} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      initRevenueCat(user.id);
    }
  }, [user]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
