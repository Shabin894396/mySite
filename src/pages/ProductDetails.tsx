import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import ReviewSection from "@/components/ReviewSection";
import ImageGallery from "@/components/ImageGallery";

export default function ProductDetails() {
  const { id, slug } = useParams(); // support both id and slug
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<any>(null);

  useEffect(() => {
    loadProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, slug]);

  async function loadProduct() {
    let query = supabase.from("products").select("*").limit(1);
    if (slug) {
      query = query.eq("slug", slug);
    } else if (id) {
      query = query.eq("id", id);
    } else {
      toast.error("Product not found");
      return;
    }

    const { data, error } = await query.single();

    if (error) {
      console.error(error);
      toast.error("Failed to load product");
      return;
    }

    setProduct(data);
  }

  async function handleOrder() {
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user) {
      toast.error("Please log in to place an order.");
      navigate("/login");
      return;
    }

    if (product.stock_quantity <= 0) {
      toast.error("Out of stock");
      return;
    }

    const { error } = await supabase.from("orders").insert({
      user_id: user.id,
      product_id: product.id,
      quantity: 1,
      total: product.price,
      status: "pending",
    });

    if (error) {
      toast.error("Failed to place order");
      return;
    }

    toast.success("Order placed successfully!");
  }

  function handleAddToCart() {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      quantity: 1,
    });
    toast.success("Added to cart");
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <div className="text-center py-20">Loading product…</div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

          {/* IMAGE GALLERY */}
          <ImageGallery images={product.gallery ?? [product.image_url]} />

          {/* DETAILS */}
          <div>
            <h1 className="text-4xl font-bold mb-4">{product.name}</h1>

            <p className="text-muted-foreground mb-4">
              Category: {product.category}
            </p>

            <div className="flex items-center mb-4">
              <Star className="fill-yellow-400 mr-2" />
              <span className="text-lg font-medium">{product.rating}</span>
            </div>

            <p className="text-3xl font-bold text-primary mb-6">
              ₹{product.price}
            </p>

            <p className="text-sm text-muted-foreground mb-4">
              In Stock: {product.stock_quantity}
            </p>

            {product.stock_quantity === 0 ? (
              <p className="text-red-600 font-semibold mb-4">
                Out of Stock
              </p>
            ) : (
              <>
                <Button className="w-full bg-gradient-primary mb-3" onClick={handleOrder}>Order Now</Button>
                <Button className="w-full" onClick={handleAddToCart}>Add to Cart</Button>
              </>
            )}
          </div>
        </div>

        <ReviewSection productId={product.id} />
      </div>
    </div>
  );
}
