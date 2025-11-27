import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowLeft, Zap, ShoppingBag, Package } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { buyProduct } from "@/services/revenuecat";

async function buyBooster(productId: string) {
  console.log("🛒 Comprando:", productId);
  await buyProduct(productId);
}

export default function Store() {
  const { user } = useAuth();
  const [boosts, setBoosts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // ✅ Load boosters on mount
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
      .select("boosters")
      .eq("user_id", user.id)
      .single();

    if (data) setBoosts(data.boosters);
    setLoading(false);
  };

  const buyBoosts = async (amount: number) => {
    if (processing) return;
    setProcessing(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
      .from("user_inventory")
      .update({ boosters: boosts + amount })
      .eq("user_id", user.id);

    if (!error) {
      setBoosts((b) => b + amount);
      alert(`✅ Você comprou ${amount} boosters!`);
    }

    setProcessing(false);
  };

  const packs = [
    {
      amount: 30,
      price: "R$ 1,99",
      color: "bg-[#C1FFC1]",
      icon: <Zap className="w-10 h-10" />,
      productId: "booster_30",
    },
    {
      amount: 50,
      price: "R$ 3,99",
      color: "bg-[#06d6a0]",
      icon: <Package className="w-10 h-10" />,
      productId: "booster_50",
    },
    {
      amount: 100,
      price: "R$ 5,99",
      color: "bg-[#f5cb5c]",
      icon: <ShoppingBag className="w-10 h-10" />,
      productId: "booster_100",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0038B8] to-[#001F5E] p-6 flex flex-col items-center text-white">
      {/* HEADER */}
      <div className="w-full"><Link href="/">
      <Button variant="ghost" className="text-white">
      <ArrowLeft className="mr-2" /> Voltar
      </Button>
      </Link></div>
      <div className="w-full flex items-center mb-6">

        <h1 className="text-7xl font-bold mx-auto">Loja</h1>

      </div>
<div className="flex text-center mb-6"><p>Compre recursos para você usar na sua jornada!<br />Adicione mais tempo ou congele as perguntas!</p></div>
      {/* BOOSTER DISPLAY */}
      <Card className="max-w-md w-full mb-8 text-center shadow-xl bg-white/90 backdrop-blur rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-black">Seus Boosters</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-black">Carregando...</p>
          ) : (
            <p className="text-5xl font-bold text-[#0038B8]">⚡ {boosts}</p>
          )}
        </CardContent>
      </Card>

      {/* PACK OPTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        {packs.map((pack) => (
          <Card
            key={pack.amount}
            className={`${pack.color} shadow-[0_6px_0_0_rgba(0,0,0,1)] rounded-2xl text-black`}
          >
            <CardHeader className="text-center space-y-2">
              <div className="flex justify-center">{pack.icon}</div>
              <CardTitle className="text-2xl font-bold">
                +{pack.amount} Boosters
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4 pb-6">
              <p className="text-xl font-semibold">{pack.price}</p>

              <Button
                disabled={processing}
                onClick={() => buyBooster(pack.productId)}
                className="w-full bg-black text-white text-lg py-6 rounded-xl shadow-[0_4px_0_0_rgba(0,0,0,1)] hover:brightness-110"
              >
                Comprar
              </Button>{packs.map((pack) => (
                         <button
                           key={pack.productId}
                           onClick={() => buyProduct(pack.productId)}
                           className="btn-purchase"
                         >
                           {pack.title}
                         </button>
                       ))}

            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
