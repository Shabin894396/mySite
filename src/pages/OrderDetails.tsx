import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Order {
  id: string;
  created_at: string;
  total: number;
  status: string;
}

interface OrderItem {
  id: string;
  order_id: string;
  quantity: number;
  price: number;
  products: {
    name: string;
    image_url: string;
  };
}

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState<any | null>(null);


  useEffect(() => {
    loadOrder();
  }, []);

  async function loadOrder() {
    setLoading(true);

    // after loading orderData
// fetch address if available
let addressData = null;
if (orderData.address_id) {
  const { data: addr, error: addrErr } = await supabase
    .from("addresses")
    .select("*")
    .eq("id", orderData.address_id)
    .single();
  if (!addrErr) addressData = addr;
}
setOrder(orderData);
// set a state for address:
setAddress(addressData);


    // 1. Load order
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .single();

    if (orderError || !orderData) {
      toast.error("Order not found.");
      navigate("/orders");
      return;
    }

    setOrder(orderData);

    // 2. Load order items with product info
    const { data: itemData, error: itemsError } = await supabase
      .from("order_items")
      .select(`
        id,
        order_id,
        quantity,
        price,
        products: products!order_items_product_id_fkey (
          name,
          image_url
        )
      `)
      .eq("order_id", id);

    if (itemsError) {
      toast.error("Failed to load order items.");
      return;
    }

    setItems(itemData || []);
    setLoading(false);
  }
  async function handleCancelOrder() {
  if (!confirm("Are you sure you want to cancel this order?")) return;

  // 1. Update order status → cancelled
  const { data: updated, error: statusErr } = await supabase
    .from("orders")
    .update({ status: "cancelled" })
    .eq("id", id)
    .select()
    .single();

  if (statusErr) {
    toast.error("Failed to cancel order.");
    return;
  }

  // 2. Restore stock only once
  if (!updated.stock_restored) {
    const { data: orderItems, error: itemErr } = await supabase
      .from("order_items")
      .select("product_id, quantity")
      .eq("order_id", id);

    if (itemErr) {
      toast.error("Failed to restore stock.");
      return;
    }

    // Restore stock via RPC function
    for (const item of orderItems) {
      await supabase.rpc("restore_stock", {
        product_id_input: item.product_id,
        qty_input: item.quantity,
      });
    }

    // Mark restored
    await supabase
      .from("orders")
      .update({ stock_restored: true })
      .eq("id", id);
  }

  toast.success("Order cancelled successfully!");
  navigate("/orders");
}


  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : !order ? (
          <p>Order not found.</p>
        ) : (
          <div>
            <Button
              variant="outline"
              className="mb-6"
              onClick={() => navigate("/orders")}
            >
              ← Back to Orders
            </Button>

            <h1 className="text-3xl font-bold mb-4">
              Order #{order.id.slice(0, 8)}
            </h1>

            <p className="text-muted-foreground mb-6">
              Placed on: {new Date(order.created_at).toLocaleString()}
            </p>

            {/* STATUS TIMELINE */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <h2 className="text-xl font-semibold mb-3">Order Status</h2>

                <div className="flex items-center justify-between">
                  {["pending", "packed", "shipped", "delivered"].map(
                    (stage, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <div
                          className={`h-4 w-4 rounded-full ${
                            order.status === stage ||
                            ["packed", "shipped", "delivered"].includes(
                              order.status
                            ) &&
                              i <
                                ["pending", "packed", "shipped", "delivered"].indexOf(
                                  order.status
                                )
                              ? "bg-primary"
                              : "bg-gray-400"
                          }`}
                        ></div>
                        <p className="text-xs mt-1 capitalize">{stage}</p>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>

            {/* ORDER ITEMS */}
            <Card>
              <CardContent className="p-4">
                <h2 className="text-xl font-semibold mb-4">Items</h2>

                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <img
                        src={item.products.image_url}
                        alt={item.products.name}
                        className="w-20 h-20 rounded object-cover"
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

                <div className="flex justify-between text-xl font-bold mt-6">
                  <span>Total:</span>
                  <span>₹{order.total.toFixed(2)}</span>
                </div>
              </CardContent>
              {/* CANCEL ORDER BUTTON (Only for pending orders) */}
{order.status === "pending" && (
  <Button
    variant="destructive"
    className="mb-6"
    onClick={handleCancelOrder}
  >
    Cancel Order
  </Button>
)}

            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
