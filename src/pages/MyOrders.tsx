import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface OrderItem {
  id: string;
  quantity: number;
  total: number;
  status: string;
  created_at: string;
  product: {
    name: string;
    image_url: string;
    price: number;
  };
}

export default function MyOrders() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  async function loadOrders() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      navigate("/login");
      return;
    }

    // Fetch orders + join products
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        id,
        quantity,
        total,
        status,
        created_at,
        product:products (
          name,
          image_url,
          price
        )
      `
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setOrders(data as OrderItem[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <p className="text-muted-foreground">You have no orders yet.</p>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <Card key={order.id} className="shadow-card">
              <CardHeader>
                <CardTitle className="flex justify-between">
                  <span>Order #{order.id.slice(0, 8)}</span>
                  <span className="capitalize text-primary">{order.status}</span>
                </CardTitle>
              </CardHeader>

              <CardContent className="flex gap-4">
                <img
                  src={order.product.image_url}
                  alt={order.product.name}
                  className="w-24 h-24 rounded object-cover border"
                />

                <div className="flex-1 space-y-1">
                  <p className="font-semibold">{order.product.name}</p>
                  <p className="text-muted-foreground">
                    Quantity: {order.quantity}
                  </p>
                  <p className="text-muted-foreground">
                    Price: ${order.product.price}
                  </p>
                  <p className="font-bold text-primary">
                    Total: ${order.total.toFixed(2)}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    Ordered on {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
