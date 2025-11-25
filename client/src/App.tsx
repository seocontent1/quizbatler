import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import QuizGame from "@/pages/QuizGame";
import NotFound from "@/pages/not-found";
import RankingPage from "@/pages/Ranking";
import StartPage from "@/pages/StartPage";
import ProtectedRoute from "@/components/ProtectedRoute";
import Store from "@/pages/Store";
function Router() {
  return (
    <Switch>
      {/* Tela inicial */}
      <Route path="/start" component={StartPage} />
      <Route path="/store" component={Store} />
      {/* Ranking */}
      <Route path="/ranking" component={RankingPage} />
      <Route path="/" component={QuizGame} />
      {/* 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
