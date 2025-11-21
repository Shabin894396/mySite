import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    else window.location.href = "/admin";
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
      <form onSubmit={handleLogin} className="p-8 bg-gray-800 rounded-xl shadow-lg">
        <h1 className="text-xl mb-4 font-bold text-center">Admin Login</h1>
        <input className="p-2 mb-3 w-full text-black rounded" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="p-2 mb-3 w-full text-black rounded" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="text-red-400 mb-2">{error}</p>}
        <button className="w-full bg-blue-600 py-2 rounded hover:bg-blue-700">Login</button>
      </form>
    </div>
  );
}
