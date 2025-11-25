import { Purchases } from "@revenuecat/purchases-capacitor";
import { supabase } from "@/lib/supabase";

export const RC_PRODUCTS = {
  booster_30: 30,
  booster_50: 50,
  booster_100: 100,
};

export async function initRevenueCat(userId?: string) {
  await Purchases.configure({ appUserID: userId });
}

export async function buyProduct(productId: string) {
  try {
    const purchase = await Purchases.purchaseProduct(productId);

    if (purchase.customerInfo) {
      const amount = RC_PRODUCTS[productId];
      if (amount) await addBoostToUser(amount);

      return { success: true };
    }
  } catch (err: any) {
    console.error("❌ Erro compra:", err);
    return { success: false, error: err };
  }
}

async function addBoostToUser(amount: number) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await supabase
    .from("user_inventory")
    .update({ boosters: amount })
    .eq("user_id", user.id);
}
