import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import FooterNav from "@/components/FooterNav";
import { ArrowLeft, Zap, Coins, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";

// 🚧 Compras reais desativadas
async function buyBooster(productId: string) {
  alert(
    "🚧 Compras reais ainda não estão habilitadas!\n\nUse as moedas para comprar boosters."
  );
}

// Componente visual de carregamento (Skeleton) - Mais visível
function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-300 rounded-md ${className}`} />;
}

export default function Store() {
  const { user } = useAuth();
  const [boosts, setBoosts] = useState<number | null>(null); // Null indica que ainda não carregou
  const [coins, setCoins] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // 🔵 Carregar inventário
  useEffect(() => {
    // Se o usuário já estiver carregado, busca os dados
    if (user) {
      loadInventory();
    }
  }, [user]);

  const loadInventory = async () => {
    try {
        const { data, error } = await supabase
        .from("user_inventory")
        .select("boosters, coins")
        .eq("user_id", user.id)
        .single();

        if (error && error.code !== 'PGRST116') {
            console.error("Erro ao carregar inventário", error);
        }

        if (data) {
            setBoosts(data.boosters);
            setCoins(data.coins ?? 0);
        } else {
            // Caso não tenha registro (novo usuário), assume 0
            setBoosts(0);
            setCoins(0);
        }
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  // 🟡 Comprar booster com moedas
  const buyBoostWithCoins = async (cost: number, amount: number) => {
    // Verifica se moedas já carregaram antes de checar saldo
    if (coins === null) return;

    if (coins < cost) {
      alert("Moedas insuficientes!");
      return;
    }
    setProcessing(true);

    const { data: rpcData, error } = await supabase.rpc(
      "buy_boosters_with_coins",
      { p_cost: cost, p_booster_amount: amount }
    );

    if (error) {
      console.log(error);
      alert("Erro ao comprar com moedas.");
      setProcessing(false);
      return;
    }

    setBoosts(rpcData.new_boosters);
    setCoins(rpcData.new_coins);
    alert(`🎉 Você comprou ${amount} boosters!`);
    setProcessing(false);
  };

  const packs = [
    {
      amount: 130,
      amountLabel: "130 Boosters",
      promoLabel: "MAIS POPULAR",
      price: "R$ 1,99",
      iconColor: "bg-green-100 text-green-600",
      productId: "booster_30",
      coinPrice: 2500,
    },
    {
      amount: 50,
      amountLabel: "50 Boosters",
      price: "R$ 3,99",
      iconColor: "bg-blue-100 text-blue-600",
      productId: "booster_50",
      coinPrice: 5000,
    },
    {
      amount: 100,
      amountLabel: "100 Boosters",
      price: "R$ 5,99",
      iconColor: "bg-yellow-100 text-yellow-600",
      productId: "booster_100",
      coinPrice: 7000,
    },
  ];

  return (
    <div className="min-h-screen bg-[#f5f6fa] pb-28 relative font-sans">

      {/* 🔵 HEADER CURVADO */}
      <div className="bg-gradient-to-b from-[#003997] to-blue-500 h-[280px] w-full rounded-b-[40px] flex flex-col items-center pt-8 text-white relative z-0 shadow-lg">

        {/* Botão Voltar Absoluto */}
        <Link href="/">
          <button className="absolute left-4 top-6 text-white/80 hover:text-white flex items-center gap-1 text-sm font-medium transition-colors hover:bg-white/10 px-3 py-1 rounded-full">
            <ArrowLeft size={18} /> Voltar
          </button>
        </Link>

        <div className="mt-6 flex flex-col items-center">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3 backdrop-blur-sm">
                <ShoppingBag size={24} className="text-white" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Loja Oficial</h1>
            <p className="text-blue-100 text-md/2 mt-1 opacity-90 text-center max-w-xs px-4">
            Adquira recursos para vencer mais batalhas e subir no ranking!
            </p>
        </div>
      </div>

      {/* 📦 INVENTÁRIO FLUTUANTE */}
      <div className="-mt-10 px-4 flex justify-center relative z-10 mb-8">
        {/* Removida a animação de opacidade para aparecer instantaneamente */}
        <div className="bg-white rounded-3xl shadow-xl p-6 w-full max-w-md border border-gray-100">
          <div className="flex items-center justify-between mb-4">
             <h2 className="text-gray-400 text-xs font-bold uppercase tracking-widest">Seu Saldo</h2>
             {loading && <div className="text-xs text-blue-500 animate-pulse font-bold">Atualizando...</div>}
          </div>

          <div className="flex w-full justify-between items-center divide-x divide-gray-100">
            {/* Boosters */}
            <div className="flex flex-col items-center flex-1 px-2">
               <div className="bg-yellow-50 p-2.5 rounded-2xl mb-2 shadow-sm">
                 <Zap className="text-yellow-500 fill-yellow-500" size={24} />
               </div>

               {/* Skeleton ou Valor */}
               {boosts === null ? (
                 <Skeleton className="h-8 w-16 mb-1" />
               ) : (
                 <span className="text-3xl font-black text-gray-800 animate-in fade-in duration-300">{boosts}</span>
               )}

               <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wide mt-1">Boosters</span>
            </div>

            {/* Coins */}
            <div className="flex flex-col items-center flex-1 px-2">
               <div className="bg-blue-50 p-2.5 rounded-2xl mb-2 shadow-sm">
                 <Coins className="text-blue-500 fill-blue-500" size={24} />
               </div>

               {/* Skeleton ou Valor */}
               {coins === null ? (
                 <Skeleton className="h-8 w-20 mb-1" />
               ) : (
                 <span className="text-3xl font-black text-gray-800 animate-in fade-in duration-300">{coins}</span>
               )}

               <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wide mt-1">Moedas</span>
            </div>
          </div>
        </div>
      </div>

      {/* 🛒 LISTA DE PACOTES */}
      <div className="px-4 max-w-5xl mx-auto">
        <div className="flex items-center gap-2 mb-4 ml-1">
            <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
            <h3 className="text-gray-700 text-sm font-bold uppercase tracking-wider">Pacotes de Energia</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {packs.map((pack, index) => (
            <motion.div
              key={pack.productId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:border-blue-300 hover:shadow-md transition-all relative overflow-hidden group"
            >
              {/* Badge Promocional */}
              {pack.promoLabel && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-sm z-10">
                  {pack.promoLabel}
                </div>
              )}

              <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 ${pack.iconColor} rounded-2xl flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform`}>
                    <Zap size={28} className="fill-current" />
                  </div>
                  <div className="text-right">
                      <span className="block text-gray-400 text-[10px] font-bold uppercase">Preço</span>
                      <span className="text-xl font-black text-gray-800">{pack.price}</span>
                  </div>
              </div>

              <div className="mb-6">
                <h4 className="text-lg font-bold text-gray-800 leading-tight">
                  {pack.amountLabel}
                </h4>
                <p className="text-xs text-gray-400 mt-1">Recarga instantânea para jogar mais.</p>
              </div>

              <div className="space-y-3">
                {/* Botão R$ (Principal) */}
                <button
                  disabled={processing}
                  onClick={() => buyBooster(pack.productId)}
                  className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-black active:scale-[0.98] transition-all flex justify-center items-center gap-2"
                >
                  Comprar Agora
                </button>

                {/* Botão Moedas (Secundário) */}
                <button
                  disabled={processing || coins === null || coins < pack.coinPrice}
                  onClick={() => buyBoostWithCoins(pack.coinPrice, pack.amount)}
                  className={`w-full py-2.5 border-2 rounded-xl font-bold text-xs flex justify-center items-center gap-2 transition-colors active:scale-[0.98] ${
                    coins !== null && coins >= pack.coinPrice
                      ? "border-green-100 bg-green-200 text-green-700 hover:bg-green-100 hover:border-green-200"
                      : "border-gray-100 bg-gray-300 text-gray-600 cursor-not-allowed opacity-60"
                  }`}
                >
                  <Coins size={14} className={coins !== null && coins >= pack.coinPrice ? "fill-green-600" : ""} />
                  Usar {pack.coinPrice} moedas
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <FooterNav />
    </div>
  );
}