import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    setLoading(true);

    // Fetch total products
    const { count: productCount } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true });

    // Fetch total orders
    const { count: orderCount } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true });

    // Fetch pending orders
    const { count: pendingCount } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    // Fetch total revenue
    const { data: earnings } = await supabase
      .from("orders")
      .select("total");

    const totalRevenue = earnings?.reduce((sum, o) => sum + o.total, 0) || 0;

    // Fetch last 5 orders
    const { data: recent } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);

    setStats({
      productCount,
      orderCount,
      pendingCount,
      revenue: totalRevenue
    });

    setRecentOrders(recent || []);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-10">

        <h1 className="text-4xl font-bold mb-6">Admin Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">

          <Card>
            <CardContent className="p-5">
              <p className="text-muted-foreground">Total Products</p>
              <h2 className="text-3xl font-bold">{stats.productCount}</h2>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <p className="text-muted-foreground">Total Orders</p>
              <h2 className="text-3xl font-bold">{stats.orderCount}</h2>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <p className="text-muted-foreground">Pending Orders</p>
              <h2 className="text-3xl font-bold">{stats.pendingCount}</h2>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <p className="text-muted-foreground">Revenue</p>
              <h2 className="text-3xl font-bold">₹{stats.revenue.toFixed(2)}</h2>
            </CardContent>
          </Card>

        </div>

        {/* Quick Action Buttons */}
        <div className="flex gap-4 mb-10">
          <Button onClick={() => navigate("/admin/products")} className="bg-primary">
            Manage Products
          </Button>

          <Button onClick={() => navigate("/admin/orders")}>
            Manage Orders
          </Button>

          <Button onClick={() => navigate("/admin/reviews")}>
            Manage Reviews
          </Button>
        </div>

        {/* Recent Orders Table */}
        <h2 className="text-2xl font-semibold mb-4">Recent Orders</h2>

        <div className="border rounded-lg p-4">
          {recentOrders.length === 0 ? (
            <p>No recent orders.</p>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="py-2">Order ID</th>
                  <th className="py-2">User</th>
                  <th className="py-2">Total</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id} className="border-b">
                    <td className="py-2">{o.id.slice(0, 8)}</td>
                    <td className="py-2">{o.user_id}</td>
                    <td className="py-2">₹{o.total}</td>
                    <td className="py-2">{o.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}
