import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

function giveBoost(amount: number) {
  const prev = Number(localStorage.getItem("boostsLeft") || "0");
  const updated = prev + amount;
  localStorage.setItem("boostsLeft", String(updated));
  console.log("🎁 Novo total de booster:", updated);
}

// inicializar compras
initIAP(giveBoost);
