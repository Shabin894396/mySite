import { createContext, useContext, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabaseClient";   // ✅ ADDED
import { toast } from "sonner";                   // ✅ ADDED

interface CartItem {
  id: string;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  updateQuantity: (id: string, quantity: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  // --------------------------------------
  // ADD TO CART (with stock validation)
  // --------------------------------------
  async function addToCart(item: CartItem) {
    // Fetch latest stock from Supabase
    const { data, error } = await supabase
      .from("products")
      .select("stock_quantity")
      .eq("id", item.id)
      .single();

    if (error || !data) {
      toast.error("Product not available");
      return;
    }

    const stock = data.stock_quantity;

    if (stock <= 0) {
      toast.error("Product is out of stock");
      return;
    }

    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);

      // If already in cart, validate remaining stock
      if (existing) {
        if (existing.quantity + item.quantity > stock) {
          toast.error(`Only ${stock} left in stock`);
          return prev;
        }

        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      }

      // Add new item
      return [...prev, item];
    });

    toast.success("Added to cart!");
  }

  // --------------------------------------
  // REMOVE ITEM
  // --------------------------------------
  function removeFromCart(id: string) {
    setCart((prev) => prev.filter((i) => i.id !== id));
  }

  // --------------------------------------
  // CLEAR CART
  // --------------------------------------
  function clearCart() {
    setCart([]);
  }

  // --------------------------------------
  // UPDATE QUANTITY
  // --------------------------------------
  function updateQuantity(id: string, quantity: number) {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    );
  }

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, clearCart, updateQuantity }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
