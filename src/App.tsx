import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import UserProtectedRoute from "./utils/UserProtectedRoute";
import AdminProtectedRoute from "./utils/AdminProtectedRoute";

import Index from "./pages/Index";
import UserLogin from "./pages/UserLogin";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";

import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import MyOrders from "./pages/MyOrders";
import OrderDetails from "./pages/OrderDetails";
import Address from "./pages/Address";
import OrderSuccess from "./pages/OrderSuccess";

import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminOrders from "./pages/AdminOrders";
import AdminProducts from "./pages/AdminProducts"; // renamed
import AdminReviews from "./pages/AdminReviews";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />

      <BrowserRouter>
        <Routes>

          {/* ---------------- USER ROUTES ---------------- */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<UserLogin />} />
          <Route path="/signup" element={<Signup />} />

          <Route
            path="/profile"
            element={
              <UserProtectedRoute>
                <Profile />
              </UserProtectedRoute>
            }
          />

          <Route path="/product/:id" element={<ProductDetails />} />

          <Route
            path="/cart"
            element={
              <UserProtectedRoute>
                <Cart />
              </UserProtectedRoute>
            }
          />

          <Route
            path="/checkout"
            element={
              <UserProtectedRoute>
                <Checkout />
              </UserProtectedRoute>
            }
          />

          <Route
            path="/address"
            element={
              <UserProtectedRoute>
                <Address />
              </UserProtectedRoute>
            }
          />

          <Route
            path="/my-orders"
            element={
              <UserProtectedRoute>
                <MyOrders />
              </UserProtectedRoute>
            }
          />

          <Route
            path="/order/:id"
            element={
              <UserProtectedRoute>
                <OrderDetails />
              </UserProtectedRoute>
            }
          />

          <Route
            path="/order-success"
            element={
              <UserProtectedRoute>
                <OrderSuccess />
              </UserProtectedRoute>
            }
          />

          {/* ---------------- ADMIN ROUTES ---------------- */}
          <Route path="/admin/login" element={<AdminLogin />} />

          <Route
            path="/admin"
            element={
              <AdminProtectedRoute>
                <AdminDashboard />
              </AdminProtectedRoute>
            }
          />

          <Route
            path="/admin/products"
            element={
              <AdminProtectedRoute>
                <AdminProducts />
              </AdminProtectedRoute>
            }
          />

          <Route
            path="/admin/orders"
            element={
              <AdminProtectedRoute>
                <AdminOrders />
              </AdminProtectedRoute>
            }
          />

          <Route
            path="/admin/reviews"
            element={
              <AdminProtectedRoute>
                <AdminReviews />
              </AdminProtectedRoute>
            }
          />

          {/* ---------------- 404 ---------------- */}
          <Route path="*" element={<NotFound />} />

        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
