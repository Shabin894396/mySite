import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  review: string;
  created_at: string;
  edited_at?: string;
  email?: string;
  product_name?: string;
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [searchText, setSearchText] = useState("");
  const [filterProduct, setFilterProduct] = useState("all");

  useEffect(() => {
    loadProducts();
    loadReviews();
  }, []);

  // -----------------------------------------
  // Load product list for filtering dropdown
  // -----------------------------------------
  async function loadProducts() {
    const { data } = await supabase.from("products").select("id, name");
    setProducts(data || []);
  }

  // -----------------------------------------
  // Load all reviews + attach user email + product name
  // -----------------------------------------
  async function loadReviews() {
    const { data: reviewRows } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });

    if (!reviewRows) return;

    const final: Review[] = [];

    for (const r of reviewRows) {
      // Fetch user email
      const { data: userInfo } = await supabase.auth.admin.getUserById(r.user_id);
      const email = userInfo?.user?.email ?? "Unknown User";

      // Fetch product name
      let product_name = "";
      const { data: productInfo } = await supabase
        .from("products")
        .select("name")
        .eq("id", r.product_id)
        .single();

      if (productInfo) product_name = productInfo.name;

      final.push({
        ...r,
        email,
        product_name,
      });
    }

    setReviews(final);
  }

  // -----------------------------------------
  // Delete Review
  // -----------------------------------------
  async function deleteReview(id: string) {
    if (!confirm("Delete this review?")) return;

    const { error } = await supabase.from("reviews").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete review");
      console.error(error);
      return;
    }

    toast.success("Review deleted");
    loadReviews();
  }

  // -----------------------------------------
  // FILTER + SEARCH
  // -----------------------------------------
  const filteredReviews = reviews.filter((r) => {
    const matchesProduct = filterProduct === "all" || r.product_id === filterProduct;
    const matchesSearch = r.email?.toLowerCase().includes(searchText.toLowerCase());
    return matchesProduct && matchesSearch;
  });

  return (
    <div>
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Admin Review Dashboard</h1>

        {/* FILTER BAR */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

          {/* Search User Email */}
          <Input
            placeholder="Search by user email..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />

          {/* Filter by Product */}
          <select
            className="border rounded p-2"
            value={filterProduct}
            onChange={(e) => setFilterProduct(e.target.value)}
          >
            <option value="all">All Products</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <Button variant="outline" onClick={loadReviews}>
            Refresh
          </Button>
        </div>

        {/* REVIEWS LIST */}
        <div className="space-y-4">
          {filteredReviews.length === 0 ? (
            <p className="text-muted-foreground">No reviews found.</p>
          ) : (
            filteredReviews.map((r) => (
              <Card key={r.id} className="shadow-sm">
                <CardContent className="py-4 px-3 flex items-start justify-between">

                  {/* LEFT SIDE — Review Content */}
                  <div className="w-[80%]">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold">{r.email}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(r.created_at).toLocaleString()}
                      </p>
                    </div>

                    <p className="text-sm text-muted-foreground mb-2">
                      Product: <span className="font-medium">{r.product_name}</span>
                    </p>

                    <p className="text-yellow-500 mb-2">
                      {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                    </p>

                    <p>{r.review}</p>

                    {r.edited_at && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Edited: {new Date(r.edited_at).toLocaleString()}
                      </p>
                    )}
                  </div>

                  {/* RIGHT SIDE — Delete Button */}
                  <div>
                    <Button
                      variant="destructive"
                      onClick={() => deleteReview(r.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
