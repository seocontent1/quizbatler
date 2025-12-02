import { Home, ShoppingBag, Trophy, ListChecks, User } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function FooterNav() {
  const [location] = useLocation();

  const links = [
    { to: "/", label: "Início", icon: <Home size={22} /> },
    { to: "/store", label: "Loja", icon: <ShoppingBag size={22} /> },
    { to: "/ranking", label: "Ranking", icon: <Trophy size={22} /> },
    { to: "/tasks", label: "Tarefas", icon: <ListChecks size={22} /> },
    { to: "/profile", label: "Perfil", icon: <User size={22} /> },
  ];

  return (
    <div className="
      fixed bottom-0 left-0 right-0
      bg-white border-t border-gray-300
      shadow-lg z-50
      flex justify-around items-center
      h-16
    ">
      {links.map((item) => {
        const active = location === item.to;

        return (
          <Link key={item.to} href={item.to}>
            <button
              className={`
                flex flex-col items-center justify-center
                text-xs transition-all
                ${active ? "text-blue-600 font-bold" : "text-gray-600"}
              `}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          </Link>
        );
      })}
    </div>
  );
}
