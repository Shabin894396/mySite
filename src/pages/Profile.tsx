import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Profile = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Your Profile
        </h1>
        <p className="text-muted-foreground">
          Profile settings and information will be displayed here.
        </p>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
