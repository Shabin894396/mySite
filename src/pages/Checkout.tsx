import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";

export default function Checkout() {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  useEffect(() => {
    loadAddresses();
  }, []);

  async function loadAddresses() {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    const { data } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", userData.user.id)
      .order("is_default", { ascending: false }); // default first
    setAddresses(data || []);
    const defaultAddr = (data || []).find((a: any) => a.is_default) ?? (data || [])[0];
    setSelectedAddressId(defaultAddr?.id ?? null);
  }

  async function handlePlaceOrder() {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) { toast.error("Please login"); navigate("/login"); return; }
    if (!selectedAddressId) { toast.error("Please select an address"); navigate("/address"); return; }
    if (cart.length === 0) { toast.error("Cart is empty"); return; }

    setLoading(true);

    // create order
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        user_id: userData.user.id,
        total,
        status: "pending",
        address_id: selectedAddressId
      })
      .select()
      .single();

    if (orderErr || !order) {
      console.error(orderErr);
      toast.error("Failed to create order");
      setLoading(false);
      return;
    }

    // insert order items
    const items = cart.map((c) => ({
      order_id: order.id,
      product_id: c.id,
      quantity: c.quantity,
      price: c.price,
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(items);

    if (itemsError) {
      console.error(itemsError);
      toast.error("Failed to save order items");
      setLoading(false);
      return;
    }

    // decrement stock - simple implementation: call RPC decrement_stock you created earlier OR update directly
    for (const c of cart) {
      // if you already created an RPC 'decrement_stock' adapt names. Example below uses simple update:
      await supabase
        .from("products")
        .update({ stock_quantity: supabase.raw('stock_quantity - ?', [c.quantity]) })
        .eq('id', c.id);
    }

    clearCart();
    toast.success("Order placed!");
    setLoading(false);
    navigate("/orders");
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Card className="mb-4">
            <CardContent className="p-4">
              <h2 className="text-xl font-semibold mb-3">Delivery Address</h2>
              {addresses.length === 0 ? (
                <>
                  <p>No saved addresses. <a className="text-primary" href="/address">Add address</a></p>
                </>
              ) : (
                <div className="space-y-3">
                  {addresses.map((a) => (
                    <label key={a.id} className={`block p-3 rounded border ${selectedAddressId === a.id ? 'border-primary bg-background/50' : 'border-border'}`}>
                      <input type="radio" checked={selectedAddressId === a.id} onChange={() => setSelectedAddressId(a.id)} className="mr-2" />
                      <div className="font-medium">{a.full_name} {a.is_default && <span className="text-sm text-green-600">• Default</span>}</div>
                      <div className="text-sm text-muted-foreground">{a.address_line}, {a.city}, {a.state} - {a.pincode}</div>
                      <div className="text-sm text-muted-foreground">Phone: {a.phone}</div>
                    </label>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardContent className="p-4">
              <h2 className="text-xl font-semibold mb-3">Order Summary</h2>
              {cart.map((c) => (
                <div key={c.id} className="flex justify-between mb-2">
                  <div>{c.name} × {c.quantity}</div>
                  <div>₹{(c.price * c.quantity).toFixed(2)}</div>
                </div>
              ))}

              <div className="flex justify-between font-bold mt-4">
                <div>Total</div>
                <div>₹{total.toFixed(2)}</div>
              </div>

              <Button className="w-full mt-4" onClick={handlePlaceOrder} disabled={loading}>
                {loading ? "Placing order..." : "Place Order"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
