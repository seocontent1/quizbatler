import store from "cordova-plugin-purchase";
import { supabase } from "@/lib/supabase";

export function initIAP() {
  document.addEventListener("deviceready", async () => {
    console.log("📦 Iniciando IAP...");

    // Registrar os produtos
    store.register([
      { id: "booster_30", type: store.CONSUMABLE },
      { id: "booster_50", type: store.CONSUMABLE },
      { id: "booster_100", type: store.CONSUMABLE }
    ]);

    // Helper para vincular compras
    const onPurchase = (id: string, amount: number) => {
      store.when(id).approved(async (p) => {
        console.log("🔥 Compra aprovada:", id);
        await giveBoost(amount);
        p.finish();
      });
    };

    onPurchase("booster_30", 30);
    onPurchase("booster_50", 50);
    onPurchase("booster_100", 100);

    store.refresh();
  });
}
async function giveBoost(amount: number) {
  console.log("🎁 Adicionando boosters ao Supabase:", amount);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.warn("❌ Nenhum usuário logado.");
    return;
  }

  // Pega boosters atuais
  const { data: inventory } = await supabase
    .from("user_inventory")
    .select("boosters")
    .eq("user_id", user.id)
    .single();

  const current = inventory?.boosters || 0;
  const updated = current + amount;

  // Atualiza no Supabase
  const { error } = await supabase
    .from("user_inventory")
    .update({ boosters: updated })
    .eq("user_id", user.id);

  if (error) {
    console.error("❌ Erro ao adicionar booster:", error);
  } else {
    console.log(`✅ ${amount} boosters adicionados! Total agora = ${updated}`);
  }
}
