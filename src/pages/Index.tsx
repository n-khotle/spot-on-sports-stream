import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FeaturedGames from "@/components/FeaturedGames";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background dark">
      <Header />
      <Hero />
      <FeaturedGames />
      <Footer />
    </div>
  );
};

export default Index;
