import { Redirect } from "wouter";
import { useAuth } from "@/hooks/useAuth";

export default function ProtectedRoute({
  children,
  guestMode,
}: {
  children: React.ReactNode;
  guestMode: boolean;
}) {
  const { user, loading } = useAuth();

  if (loading) return <p>Carregando...</p>;

  if (!user && !guestMode) return <Redirect to="/" />;

  return <>{children}</>;
}
