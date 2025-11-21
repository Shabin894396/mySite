import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullname, setFullname] = useState("");
  const navigate = useNavigate();

  async function handleSignup(e) {
    e.preventDefault();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullname,
          role: "user", // SET DEFAULT USER ROLE
        },
      },
    });

    if (error) return toast.error(error.message);

    toast.success("Account created! Check your email for verification.");
    navigate("/login");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md p-6">
        <CardContent>
          <h2 className="text-2xl font-bold mb-4 text-center">Create Account</h2>

          <form onSubmit={handleSignup} className="space-y-4">

            <input
              placeholder="Full Name"
              className="w-full border p-3 rounded"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              required
            />

            <input
              type="email"
              placeholder="Email"
              className="w-full border p-3 rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full border p-3 rounded"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button className="w-full">Sign Up</Button>
          </form>

        </CardContent>
      </Card>
    </div>
  );
}
