import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { Link } from "react-router-dom";


interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  stock_quantity: number;
  rating: number;
  slug?: string;
  gallery?: string[] | null;
}

const ProductCard = ({
  id,
  name,
  description,
  price,
  image_url,
  category,
  stock_quantity,
  rating,
}: ProductCardProps) => {
  const navigate = useNavigate();
  const { addToCart } = useCart(); // ✅ moved here (global)

  // 🔹 ADD TO CART FUNCTION
  function handleAddCart() {
    addToCart({
      id,
      name,
      image_url,
      price,
      quantity: 1,
    });

    toast.success("Added to cart!");
  }

  // 🔹 ORDER FUNCTION
  async function handleOrder() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Please log in to place an order.");
      navigate("/login");
      return;
    }

    const { error } = await supabase.from("orders").insert({
      user_id: user.id,
      product_id: id,
      quantity: 1,
      total: price,
      status: "pending",
    });

    if (error) {
      toast.error("Failed to place order");
      console.error(error);
    } else {
      toast.success("Order placed successfully!");
    }
  }

  return (
    <Card className="overflow-hidden shadow-card hover:shadow-hover transition-all duration-300 group">
      <Link to={`/product/${id}`}>
      <div className="relative overflow-hidden aspect-square">
        <img
          src={image_url}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
          {category}
        </Badge>
        {stock_quantity < 10 && (
  <Badge className="absolute top-3 right-3 bg-destructive text-destructive-foreground">
    Only {stock_quantity} left
  </Badge>
)}
      </div></Link>

      <CardContent className="p-4">
        <Link to={`/product/${id}`}>
        <h3 className="font-semibold text-lg text-card-foreground mb-2 line-clamp-1">
          {name}
        </h3></Link>

        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {description}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-primary">
            ${price.toFixed(2)}
          </span>
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 fill-accent text-accent" />
            <span className="text-sm font-medium text-foreground">
              {rating}
            </span>
          </div>
        </div>

        <div className="mt-3 text-sm text-muted-foreground">
          In Stock: {stock_quantity}
        </div>

        {/* LOW STOCK / OUT OF STOCK BADGES */}
{stock_quantity === 0 && (
  <Badge className="absolute top-3 right-3 bg-red-600 text-white">
    Out of Stock
  </Badge>
)}
{stock_quantity > 0 && stock_quantity <= 5 && (
  <Badge className="absolute top-3 right-3 bg-yellow-500 text-black">
    Low Stock: {stock_quantity}
  </Badge>
)}

        {/* ORDER NOW BUTTON */}
        <Button className="w-full mt-4 bg-gradient-primary" onClick={handleOrder} disabled={stock_quantity === 0}>
  {stock_quantity === 0 ? "Out of Stock" : "Order Now"}
</Button>

        {/* ADD TO CART BUTTON */}
        <Button className="w-full mt-2 bg-secondary" onClick={handleAddCart} disabled={stock_quantity === 0}>
  {stock_quantity === 0 ? "Cannot Add to Cart" : "Add to Cart"}
</Button>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
