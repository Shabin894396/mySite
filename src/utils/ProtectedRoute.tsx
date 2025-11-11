import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../integrations/supabase/client";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user has an active session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    // Listen for sign-in / sign-out events
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <p className="text-white text-center mt-20">Checking access...</p>;

  // If no session, redirect to login page
  if (!session) return <Navigate to="/login" replace />;

  return children;
}
