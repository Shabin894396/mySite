import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Order {
  id: string;
  user_id: string;
  total: number;
  status: string;
  created_at: string;
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
  };
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    setLoading(true);

    // 1. Fetch all orders
    const { data: orderList, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (orderError) {
      console.error(orderError);
      toast.error("Failed to load orders.");
      setLoading(false);
      return;
    }

    setOrders(orderList || []);

    // 2. Fetch all items with proper JOIN using foreign key name
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
      `);

    if (itemsError) {
      console.error(itemsError);
      toast.error("Failed to load order items.");
      setLoading(false);
      return;
    }

    setItems(itemList || []);
    setLoading(false);
  }

  // -------------------------------
  //  UPDATE ORDER STATUS
  // -------------------------------
  async function updateStatus(orderId: string, newStatus: string) {
  // First update order status
  const { data: updatedOrder, error: statusError } = await supabase
    .from("orders")
    .update({ status: newStatus })
    .eq("id", orderId)
    .select()
    .single();

  if (statusError) {
    toast.error("Status update failed.");
    return;
  }

  toast.success(`Status set to "${newStatus}"`);

  // ---------------------------------------------
  //  RESTORE STOCK IF ORDER IS CANCELLED
  // ---------------------------------------------
  if (newStatus === "cancelled" && !updatedOrder.stock_restored) {
    
    // Step 1: Fetch all items for this order
    const { data: orderItems, error: itemError } = await supabase
      .from("order_items")
      .select("product_id, quantity")
      .eq("order_id", orderId);

    if (itemError || !orderItems) {
      console.error(itemError);
      toast.error("Failed to load order items for stock restore.");
      return;
    }

    // Step 2: Restore each product’s stock
    for (const item of orderItems) {
      await supabase.rpc("restore_stock", {
        product_id_input: item.product_id,
        qty_input: item.quantity,
      });
    }

    // Step 3: Mark order as restored
    await supabase
      .from("orders")
      .update({ stock_restored: true })
      .eq("id", orderId);

    toast.success("Stock restored successfully.");
  }

  loadOrders(); // Refresh dashboard
}


  // -------------------------------
  //  DELETE ORDER
  // -------------------------------
  async function deleteOrder(orderId: string) {
    if (!confirm("Delete this order permanently?")) return;

    // First delete order items (foreign key dependency)
    await supabase.from("order_items").delete().eq("order_id", orderId);

    const { error } = await supabase
      .from("orders")
      .delete()
      .eq("id", orderId);

    if (error) {
      toast.error("Failed to delete order");
      return;
    }

    toast.success("Order deleted successfully!");
    loadOrders();
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-6">Admin – Order Management</h1>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : orders.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="shadow-card border">
                <CardContent className="p-5">

                  {/* ORDER SUMMARY */}
                  <div className="flex justify-between mb-4">
                    <div>
                      <h2 className="font-bold text-xl">
                        Order #{order.id.slice(0, 8)}
                      </h2>

                      <p className="text-muted-foreground text-sm">
                        User: {order.user_id}
                      </p>

                      <p className="text-muted-foreground text-sm">
                        {new Date(order.created_at).toLocaleString()}
                      </p>
                    </div>

                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => deleteOrder(order.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* ORDER ITEMS */}
                  <div className="border rounded-lg p-3 space-y-3">
                    {items
                      .filter((i) => i.order_id === order.id)
                      .map((item) => (
                        <div key={item.id} className="flex items-center space-x-3">
                          <img
                            src={item.products.image_url}
                            alt={item.products.name}
                            className="w-16 h-16 rounded object-cover"
                          />

                          <div className="flex-1">
                            <p className="font-medium">{item.products.name}</p>
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

                  {/* TOTAL */}
                  <div className="flex justify-between text-xl font-bold mt-4">
                    <span>Total:</span>
                    <span>₹{order.total.toFixed(2)}</span>
                  </div>

                  {/* STATUS BUTTONS */}
                  <div className="mt-5 flex flex-wrap gap-2">
                    {["pending", "packed", "shipped", "delivered", "cancelled"].map(
                      (status) => (
                        <Button
                          key={status}
                          variant={
                            order.status === status ? "default" : "outline"
                          }
                          onClick={() => updateStatus(order.id, status)}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Button>
                      )
                    )}
                  </div>

                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
