import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const navigate = useNavigate();

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>

      {cart.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-lg text-muted-foreground mb-4">
            Your cart is empty.
          </p>
          <Button onClick={() => navigate("/")}>Continue Shopping</Button>
        </div>
      ) : (
        <>
          <div className="grid gap-4">
            {cart.map((item) => (
              <Card key={item.id} className="shadow-card">
                <CardContent className="flex items-center justify-between p-4">
                  
                  {/* IMAGE */}
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded"
                  />

                  {/* ITEM INFO */}
                  <div className="flex-1 px-4">
                    <h2 className="font-semibold text-lg">{item.name}</h2>
                    <p className="text-muted-foreground">
                      ${item.price.toFixed(2)}
                    </p>
                  </div>

                  {/* QUANTITY CONTROL */}
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updateQuantity(item.id, Math.max(1, item.quantity - 1))
                      }
                    >
                      -
                    </Button>
                    <span className="text-lg font-medium">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </Button>
                  </div>

                  {/* DELETE BUTTON */}
                  <Button
                    variant="destructive"
                    size="icon"
                    className="ml-4"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* TOTAL + BUTTONS */}
          <div className="mt-6 p-4 border rounded-lg shadow-card bg-background">
            <div className="flex justify-between text-xl font-bold">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>

            <div className="mt-6 flex space-x-4">
              <Button
                className="flex-1 bg-gradient-primary"
                onClick={() => navigate("/checkout")}
              >
                Checkout
              </Button>

              <Button
                className="flex-1"
                variant="outline"
                onClick={clearCart}
              >
                Clear Cart
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CartPage;
