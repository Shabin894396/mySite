import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleAdminLogin(e: any) {
    e.preventDefault();

    // Login request
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error("Invalid credentials");
      return;
    }

    const user = data.user;

    // 🛑 IMPORTANT: Check role from Supabase metadata
    if (user.user_metadata.role !== "admin") {
      toast.error("You are NOT an admin!");

      // Log out non-admin user
      await supabase.auth.signOut();
      return;
    }

    toast.success("Admin Login Successful");
    navigate("/admin"); // Admin dashboard
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-background">
      <Card className="w-[380px] shadow-lg">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-5 text-center">Admin Login</h2>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <input
              type="email"
              placeholder="Admin Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded-md"
              required
            />

            <input
              type="password"
              placeholder="Admin Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded-md"
              required
            />

            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
