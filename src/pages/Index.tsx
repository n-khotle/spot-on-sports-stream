import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FeaturedGames from "@/components/FeaturedGames";
import Footer from "@/components/Footer";

const Index = () => {
  const [games, setGames] = useState([]);

  useEffect(() => {
    fetchPublishedGames();
  }, []);

  const fetchPublishedGames = async () => {
    const { data } = await supabase
      .from('games')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false });
    
    setGames(data || []);
  };

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
