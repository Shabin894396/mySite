import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";

interface Order {
  id: string;
  created_at: string;
  total: number;
  status: string;
}

interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  products: {
    name: string;
    image_url: string;
  } | null;
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    setLoading(true);

    // GET CURRENT USER
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    // 1. LOAD ORDERS
    const { data: orderList, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", userData.user.id)
      .order("created_at", { ascending: false });

    if (orderError) {
      console.error(orderError);
      setLoading(false);
      return;
    }

    setOrders(orderList ?? []);

    // Prevent empty IN() errors
    if (!orderList || orderList.length === 0) {
      setItems([]);
      setLoading(false);
      return;
    }

    // 2. LOAD ORDER ITEMS + PRODUCT DATA
    const { data: itemList, error: itemsError } = await supabase
      .from("order_items")
      .select(`
        id,
        order_id,
        product_id,
        quantity,
        price,
        products:products!order_items_product_id_fkey (
          name,
          image_url
        )
      `)
      .in(
        "order_id",
        orderList.map((o) => o.id)
      );

    if (itemsError) {
      console.error(itemsError);
      setLoading(false);
      return;
    }

    setItems((itemList as OrderItem[]) ?? []);
    setLoading(false);
  }

  async function handleCancel(orderId: string) {
  if (!confirm("Are you sure you want to cancel this order?")) return;

  // 1. Update status in orders table
  const { error } = await supabase
    .from("orders")
    .update({ status: "cancelled" })
    .eq("id", orderId);

  if (error) {
    console.error(error);
    alert("Failed to cancel order");
    return;
  }

  alert("Order cancelled successfully");

  // Reload updated orders
  loadOrders();
}


  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-6">My Orders</h1>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : orders.length === 0 ? (
          <p>You have no orders yet.</p>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="shadow-card">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="font-bold text-xl">
                      Order #{order.id.slice(0, 8)}
                    </h2>
                    <span className="text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleString()}
                    </span>
                  </div>

                  {/* PRODUCT ITEMS */}
                  <div className="border rounded p-3 space-y-3">
                    {items
                      .filter((i) => i.order_id === order.id)
                      .map((item) => (
                        <div key={item.id} className="flex space-x-3">
                          <img
                            src={item.products?.image_url ?? "/placeholder.png"}
                            alt={item.products?.name ?? "Product"}
                            className="w-16 h-16 object-cover rounded"
                          />

                          <div className="flex-1">
                            <p className="font-medium">
                              {item.products?.name ?? "Unknown Product"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Qty: {item.quantity}
                            </p>
                          </div>

                          <p className="font-semibold">
                            ₹{item.price.toFixed(2)}
                          </p>
                        </div>
                      ))}
                  </div>

                  <div className="flex justify-between mt-4 font-bold text-lg">
                    <span>Total:</span>
                    <span>₹{order.total.toFixed(2)}</span>
                  </div>

                  <div className="mt-2 text-sm text-primary font-medium">
                    Status: {order.status}
                  </div>

                  {/* Cancel Order Button (only when pending) */}
                  {order.status === "pending" && (
                  <button
                    className="mt-3 text-red-500 hover:underline font-medium" onClick={() => handleCancel(order.id)}
                      >         
                       Cancel Order
                 </button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
