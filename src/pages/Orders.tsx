import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Orders = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Your Orders
        </h1>
        <p className="text-muted-foreground">
          Order history and tracking will be displayed here.
        </p>
      </main>

      <Footer />
    </div>
  );
};

export default Orders;
