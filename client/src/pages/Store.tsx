import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import FooterNav from "@/components/FooterNav";

// 🚧 Compras reais desativadas — Evita erro de função inexistente
async function buyBooster(productId: string) {
  alert(
    "🚧 Compras reais ainda não estão habilitadas!\n\nUse as moedas para comprar boosters."
  );
}

export default function Store() {
  const { user } = useAuth();
  const [boosts, setBoosts] = useState(0);
  const [coins, setCoins] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // 🔵 Carregar inventário
  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("user_inventory")
      .select("boosters, coins")
      .eq("user_id", user.id)
      .single();

    if (data) {
      setBoosts(data.boosters);
      setCoins(data.coins ?? 0);
    }

    setLoading(false);
  };

  // 🟡 Comprar booster com moedas
  const buyBoostWithCoins = async (cost: number, amount: number) => {
    if (coins < cost) {
      alert("Moedas insuficientes!");
      return;
    }

    setProcessing(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: rpcData, error } = await supabase.rpc(
      "buy_boosters_with_coins",
      {
        p_cost: cost,
        p_booster_amount: amount,
      }
    );

    if (error) {
      console.log(error);
      alert("Erro ao comprar com moedas.");
      setProcessing(false);
      return;
    }

    // Atualiza UI
    setBoosts(rpcData.new_boosters);
    setCoins(rpcData.new_coins);

    alert(`🎉 Você comprou ${amount} boosters!`);

    setProcessing(false);
  };

  // lista de packs (coloque dentro do componente ou num arquivo .ts(x) importado)
  const packs = [
    {
      amount: 130, // valor numérico que vai para o BD
      amountLabel: (
        <>
          <span className="line-through text-gray-400 mr-2">30</span>
          <span className="text-black-600 font-bold">+130</span>
        </>
      ),
      price: "R$ 1,99",
      color: "bg-[#C1FFC1]",
      productId: "booster_30",
      coinPrice: 2500,
    },
    {
      amount: 50,
      // sem label promocional -> renderiza apenas o número
      price: "R$ 3,99",
      color: "bg-[#06d6a0]",
      productId: "booster_50",
      coinPrice: 5000,
    },
    {
      amount: 100,
      price: "R$ 5,99",
      color: "bg-[#f5cb5c]",
      productId: "booster_100",
      coinPrice: 7000,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#003997] to-blue-500 p-6 pb-20 flex flex-col items-center text-white">

      {/* HEADER */}
      <div className="w-full">
        <Link href="/">
          <Button variant="ghost" className="text-white">
            <ArrowLeft className="mr-2" /> Voltar
          </Button>
        </Link>
      </div>

      <div className="w-full flex items-center mb-6">
        <h1 className="text-4xl font-extrabold mx-auto">Loja</h1>
      </div>

      <div className="flex text-center mb-6">
        <p>
          Compre recursos para usar na sua jornada! <br />
          Boosters podem ser adquiridos com moedas ou dinheiro.
        </p>
      </div>

      {/* INVENTÁRIO */}
      <Card className="max-w-md w-full mb-8 text-center bg-white/90 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-black">
            Seu Inventário
          </CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-black">Carregando...</p>
          ) : (
            <>
              <p className="text-2xl font-bold text-[#0038B8]">⚡ {boosts} Booster</p>
              <p className="text-2xl font-bold text-yellow-600 mt-2">
                🪙 {coins} Moedas
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* PACKS */}
      <div className="grid grid-cols-1 border-0 md:grid-cols-3 gap-6 w-full max-w-4xl">
        {packs.map((pack) => (
          <Card
            key={pack.amount}
            className={`${pack.color} shadow-md border-0 rounded-2xl text-black`}
          >
            <CardHeader className="text-center space-y-2">
              <div className="text-4xl flex justify-center">⚡</div>
              <CardTitle className="text-2xl font-bold">
                {pack.amountLabel ?? pack.amount} Boosters
              </CardTitle>
            </CardHeader>

            <CardContent className="flex flex-col items-center gap-4 pb-6">

              {/* PREÇO REAL */}
              <p className="text-xl font-semibold">{pack.price}</p>

              {/* BOTÃO DE COMPRAR COM DINHEIRO REAL */}
              <Button
                disabled={processing}
                onClick={() => buyBooster(pack.productId)}
                className="w-full bg-black text-white text-lg py-6 rounded-xl border-0"
              >
                Comprar
              </Button>

              {/* 🪙 COMPRAR COM MOEDAS */}
              <Button
                disabled={processing || coins < pack.coinPrice}
                onClick={() => buyBoostWithCoins(pack.coinPrice, pack.amount)}
                className="w-full bg-[#44d900] text-black text-lg py-4 rounded-xl mt-2 border-0"
              >
                🪙 {pack.coinPrice} moedas
              </Button>

            </CardContent>
          </Card>
        ))}
      </div>
      <FooterNav />
    </div>
  );
}
