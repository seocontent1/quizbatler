import { Purchases } from "@revenuecat/purchases-capacitor";
import { Capacitor } from "@capacitor/core";
import { supabase } from "@/lib/supabase";

const RC_API_KEY = import.meta.env.VITE_REVENUECAT_API_KEY;

export const RC_PRODUCTS = {
  booster_30: 30,
  booster_50: 50,
  booster_100: 100,
};

export async function initRevenueCat(userId?: string) {
  // ✅ Web não usa RevenueCat
  if (!Capacitor.isNativePlatform()) {
    console.log("🖥️ Rodando no navegador — RevenueCat desativado");
    return;
  }

  if (!RC_API_KEY) {
    console.error("❌ RevenueCat API Key não encontrada");
    return;
  }

  console.log("✅ RevenueCat iniciando com user:", userId);

  await Purchases.setDebugLogsEnabled(true);
  await Purchases.configure({
    apiKey: RC_API_KEY,
    appUserID: userId,
  });
}

async function addBoostToUser(amount: number) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

await supabase.rpc("increment_boosters", {
  user_id_input: user.id,
  amount_input: amount,
  });
}

export async function buyProduct(productId: string) {
  try {
    // ✅ Web não pode comprar
    if (!Capacitor.isNativePlatform()) {
      console.warn("🛑 Compras só funcionam no app nativo");
      return { success: false, error: "not_native" };
    }

    console.log("🛒 Tentando comprar:", productId);

    const purchase = await Purchases.purchaseProduct(productId);

    if (purchase.customerInfo) {
      const amount = RC_PRODUCTS[productId];

      if (amount) {
        await addBoostToUser(amount);
      }

      console.log("✅ Compra concluída!");
      return { success: true };
    }

    return { success: false };
  } catch (err) {
    console.error("❌ Erro na compra:", err);
    return { success: false, error: err };
  }
}
