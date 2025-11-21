import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Navigate } from "react-router-dom";

export default function AdminProtectedRoute({ children }: any) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });
  }, []);

  if (loading) return null;

  // Not logged in → admin login
  if (!user) return <Navigate to="/admin/login" />;

  // Must have role="admin"
  if (user.user_metadata?.role !== "admin") {
    return <Navigate to="/admin/login" />;
  }

  return children;
}
