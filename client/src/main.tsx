import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { Capacitor } from "@capacitor/core";
import { App as CapApp } from "@capacitor/app";
import { supabase } from "@/lib/supabase";
import "./capacitor-auth-listener";

createRoot(document.getElementById("root")!).render(<App />);

function giveBoost(amount: number) {
  const prev = Number(localStorage.getItem("boostsLeft") || "0");
  const updated = prev + amount;
  localStorage.setItem("boostsLeft", String(updated));
  console.log("🎁 Novo total de booster:", updated);
}

// inicializar compras
initRevenueCat();
