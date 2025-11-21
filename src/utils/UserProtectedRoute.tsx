import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Navigate } from "react-router-dom";

export default function UserProtectedRoute({ children }: any) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });
  }, []);

  if (loading) return null;

  if (!user) return <Navigate to="/login" />;

  return children;
}
