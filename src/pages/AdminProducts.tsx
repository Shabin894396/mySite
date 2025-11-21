import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trash2, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";

/*
  Updated Admin Dashboard
  - Summary cards (counts + revenue)
  - Recent orders (quick actions)
  - Product management (list + add/edit/delete)
  - Lightweight, responsive layout
*/

type Product = {
  id: string;
  name: string;
  price: number;
  category?: string;
  stock_quantity?: number;
  image_url?: string;
  created_at?: string;
};

type Order = {
  id: string;
  user_id: string;
  total: number;
  status: string;
  created_at: string;
};

export default function Admin() {
  const qc = useQueryClient();

  // ---------- DATA QUERIES ----------
  const { data: products, isLoading: loadingProducts } = useQuery<Product[]>({
    queryKey: ["admin_products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: orders, isLoading: loadingOrders } = useQuery<Order[]>({
    queryKey: ["admin_orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(20);
      if (error) throw error;
      return data || [];
    },
  });

  // summary calculations (safe defaults)
  const totalProducts = products?.length ?? 0;
  const totalOrders = orders?.length ?? 0;
  const pendingOrders = orders?.filter((o) => o.status === "pending").length ?? 0;
  const deliveredOrders = orders?.filter((o) => o.status === "delivered").length ?? 0;
  const totalRevenue = orders?.reduce((s, o) => s + (o.total || 0), 0) ?? 0;
  const lowStockCount = products?.filter((p) => (p.stock_quantity ?? 0) <= 5).length ?? 0;

  // ---------- MUTATIONS ----------
  const updateOrderStatus = useMutation(async ({ id, status }: { id: string; status: string }) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) throw error;
  }, {
    onSuccess: () => {
      toast.success("Order status updated");
      qc.invalidateQueries(["admin_orders"]);
    },
    onError: () => toast.error("Failed to update status"),
  });

  const deleteOrder = useMutation(async (id: string) => {
    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (error) throw error;
  }, {
    onSuccess: () => { toast.success("Order deleted"); qc.invalidateQueries(["admin_orders"]); },
    onError: () => toast.error("Failed to delete order"),
  });

  const deleteProduct = useMutation(async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;
  }, {
    onSuccess: () => { toast.success("Product removed"); qc.invalidateQueries(["admin_products"]); },
    onError: () => toast.error("Failed to delete product"),
  });

  // ---------- LOCAL UI STATE (product add/edit) ----------
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: "", price: "", stock_quantity: "", category: "", image_url: "" });

  function openNewProduct() {
    setEditing(null);
    setForm({ name: "", price: "", stock_quantity: "", category: "", image_url: "" });
    setIsDialogOpen(true);
  }

  function openEditProduct(p: Product) {
    setEditing(p);
    setForm({ name: p.name, price: String(p.price || 0), stock_quantity: String(p.stock_quantity ?? 0), category: p.category || "", image_url: p.image_url || "" });
    setIsDialogOpen(true);
  }

  const saveProduct = async (e?: React.FormEvent) => {
    e?.preventDefault();
    try {
      const payload = {
        name: form.name,
        price: parseFloat(form.price || "0"),
        stock_quantity: parseInt(form.stock_quantity || "0"),
        category: form.category,
        image_url: form.image_url,
      };

      if (editing) {
        const { error } = await supabase.from("products").update(payload).eq("id", editing.id);
        if (error) throw error;
        toast.success("Product updated");
      } else {
        const { error } = await supabase.from("products").insert([payload]);
        if (error) throw error;
        toast.success("Product created");
      }
      setIsDialogOpen(false);
      qc.invalidateQueries(["admin_products"]);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save product");
    }
  };

  // ---------- LOGOUT ----------
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto p-4">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Overview & quick actions</p>
          </div>

          <div className="flex items-center space-x-3">
            <Button variant="ghost" onClick={handleLogout}>Logout</Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openNewProduct} className="flex items-center"><Plus className="mr-2" />New Product</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editing ? "Edit Product" : "Add Product"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={saveProduct} className="space-y-3">
                  <div>
                    <label className="text-sm block mb-1">Name</label>
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-sm block mb-1">Price</label>
                      <Input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
                    </div>
                    <div>
                      <label className="text-sm block mb-1">Stock</label>
                      <Input value={form.stock_quantity} onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })} required />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm block mb-1">Category</label>
                    <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm block mb-1">Image URL</label>
                    <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
                  </div>

                  <div className="flex justify-end space-x-2 pt-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                    <Button type="submit">Save</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <Card className="p-4">
            <CardHeader>
              <CardTitle>Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOrders}</div>
              <div className="text-sm text-muted-foreground">Pending: {pendingOrders}</div>
            </CardContent>
          </Card>

          <Card className="p-4">
            <CardHeader>
              <CardTitle>Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{totalRevenue.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">Delivered: {deliveredOrders}</div>
            </CardContent>
          </Card>

          <Card className="p-4">
            <CardHeader>
              <CardTitle>Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProducts}</div>
              <div className="text-sm text-muted-foreground">Low stock: {lowStockCount}</div>
            </CardContent>
          </Card>

          {/* placeholders for visual balance */}
          <Card className="p-4 hidden lg:block"><CardContent className="text-sm text-muted-foreground">Quick stats</CardContent></Card>
          <Card className="p-4 hidden lg:block"><CardContent className="text-sm text-muted-foreground">Shortcuts</CardContent></Card>
          <Card className="p-4 hidden lg:block"><CardContent className="text-sm text-muted-foreground">Tools</CardContent></Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingOrders ? (
                  <div className="flex justify-center"><Loader2 className="animate-spin" /></div>
                ) : orders?.length === 0 ? (
                  <div>No orders yet</div>
                ) : (
                  <div className="space-y-3">
                    {orders?.map((o) => (
                      <div key={o.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <div className="font-medium">Order #{o.id.slice(0,8)}</div>
                          <div className="text-sm text-muted-foreground">{new Date(o.created_at).toLocaleString()}</div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Badge>{o.status}</Badge>

                          <Button size="sm" onClick={() => updateOrderStatus.mutate({ id: o.id, status: "shipped" })}>Mark Shipped</Button>
                          <Button variant="destructive" size="sm" onClick={() => deleteOrder.mutate(o.id)}><Trash2 /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Products list */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Products</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingProducts ? (
                  <div className="flex justify-center"><Loader2 className="animate-spin" /></div>
                ) : products?.length === 0 ? (
                  <div>No products</div>
                ) : (
                  <div className="space-y-3">
                    {products?.map((p) => (
                      <div key={p.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center space-x-3">
                          <img src={p.image_url || "/placeholder.png"} alt={p.name} className="w-12 h-12 object-cover rounded" />
                          <div>
                            <div className="font-medium">{p.name}</div>
                            <div className="text-sm text-muted-foreground">₹{p.price}</div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button size="icon" variant="outline" onClick={() => openEditProduct(p)}><Pencil /></Button>
                          <Button size="icon" variant="destructive" onClick={() => deleteProduct.mutate(p.id)} disabled={deleteProduct.isLoading}><Trash2 /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

      </main>
    </div>
  );
}
