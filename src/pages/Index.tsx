import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/components/Navbar";
import OfferBanner from "@/components/OfferBanner";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";
import { Loader2 } from "lucide-react";
import { useState } from "react";



const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");

  const { data: products, isLoading } = useQuery({
  queryKey: ["products", selectedCategory, searchTerm],
  queryFn: async () => {
    let query = supabase.from("products").select("*");

    if (selectedCategory) {
      query = query.eq("category", selectedCategory);
    }

    if (searchTerm.trim() !== "") {
      query = query.ilike("name", `%${searchTerm}%`);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  }
});


  const categories = [
    "Electronics",
    "Clothing",
    "Shoes",
    "Accessories",
    "Home",
    "Sports",
  ];

  return (
    
    <div className="min-h-screen bg-background">
      
      <Navbar />

      {/* =============== HERO SECTION =============== */}
      <section className="relative bg-gradient-to-r from-primary/90 to-primary/60 text-white py-20 px-6">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-extrabold mb-4">
            Discover the Latest Trends
          </h1>
          <p className="text-lg mb-6 opacity-90">
            Premium products, unbeatable prices — shop with confidence.
          </p>
          <a
            href="#products"
            className="inline-block bg-white text-primary font-semibold py-3 px-6 rounded-lg shadow hover:bg-gray-200 transition"
          >
            NextBuy
          </a>
        </div>
      </section>

      <OfferBanner />
      
            {/* =============== SEARCH BAR =============== */}
      <section className="container mx-auto px-4 mt-10">
        <div className="flex justify-center">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-1/2 px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-primary"
          />
        </div>

        {searchTerm && (
          <p className="text-center text-sm text-muted-foreground mt-2">
            Showing results for: <span className="font-semibold">{searchTerm}</span>
          </p>
        )}
      </section>

      {/* =============== CATEGORY SECTION =============== */}
      <section className="container mx-auto px-4 py-10">
        <h2 className="text-3xl font-bold mb-6">Shop by Category</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <div
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`cursor-pointer border rounded-xl p-4 text-center font-semibold transition hover:bg-primary hover:text-white ${
                selectedCategory === cat
                  ? "bg-primary text-white"
                  : "bg-card text-card-foreground"
              }`}
            >
              {cat}
            </div>
          ))}

          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory(null)}
              className="col-span-full mt-3 mx-auto text-sm underline text-primary"
            >
              Clear Filter
            </button>
          )}
        </div>
      </section>

      {/* =============== FEATURED PRODUCTS =============== */}
      <main id="products" className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Featured Products</h1>
          <p className="text-muted-foreground">
            Hand-picked selection of our most popular items
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : products?.length === 0 ? (
          <div className="text-center text-muted-foreground py-10">
  <p className="text-lg">No products match your search.</p>
</div>

        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Index;
