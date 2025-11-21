import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { ShoppingBag, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function checkUser() {
      const { data } = await supabase.auth.getUser();

      if (data.user) {
        setUser(data.user);
        setRole(data.user.user_metadata?.role || "user");
      } else {
        setUser(null);
        setRole(null);
      }
    }

    checkUser();

    // Listen for login/logout events
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      checkUser();
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <ShoppingBag className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">ShopHub</span>
        </Link>

        {/* CENTER MENU (hidden on mobile) */}
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/" className="hover:text-primary">Home</Link>
          <Link to="/about" className="hover:text-primary">About</Link>

          {user && role === "user" && (
            <>
              <Link to="/my-orders" className="hover:text-primary">Orders</Link>
            </>
          )}

          {user && role === "admin" && (
            <>
              <Link to="/admin" className="hover:text-primary">Admin Dashboard</Link>
              <Link to="/admin/orders" className="hover:text-primary">Orders</Link>
              <Link to="/admin/products" className="hover:text-primary">Products</Link>
              <Link to="/admin/reviews" className="hover:text-primary">Reviews</Link>
            </>
          )}
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center space-x-3">

          {/* USER AREA */}
          {user && role === "user" && (
            <>
              <Link to="/cart">
                <Button variant="ghost" size="icon">
                  <ShoppingBag className="w-5 h-5" />
                </Button>
              </Link>

              <Link to="/profile">
                <Button variant="ghost" size="icon">
                  <User className="w-5 h-5" />
                </Button>
              </Link>
            </>
          )}

          {/* ADMIN AREA */}
          {user && role === "admin" && (
            <span className="text-sm text-primary font-semibold">ADMIN</span>
          )}

          {/* LOGIN / LOGOUT */}
          {!user ? (
            <Link to="/login">
              <Button>Login</Button>
            </Link>
          ) : (
            <Button onClick={handleLogout} variant="destructive" size="sm">
              <LogOut className="w-4 h-4 mr-1" /> Logout
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
