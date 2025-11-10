import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          About ShopHub
        </h1>
        <div className="prose max-w-none text-muted-foreground">
          <p className="mb-4">
            Welcome to ShopHub, your trusted destination for quality products at affordable prices.
          </p>
          <p className="mb-4">
            We are committed to delivering excellence in every purchase, with customer satisfaction as our top priority.
          </p>
          <p>
            Our curated collection features products across multiple categories, all carefully selected to meet your needs.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
