import GameCard from "./GameCard";

const FeaturedGames = () => {
  const games = [
    {
      homeTeam: "Real Madrid",
      awayTeam: "Barcelona",
      league: "La Liga",
      date: "Today",
      time: "5:00 PM EST",
      price: "$12.99",
      status: "live" as const,
      viewers: 45000
    },
    {
      homeTeam: "Chelsea",
      awayTeam: "Arsenal",
      league: "Premier League",
      date: "Tomorrow",
      time: "10:00 AM EST", 
      price: "$9.99",
      status: "upcoming" as const
    },
    {
      homeTeam: "Bayern Munich",
      awayTeam: "Dortmund",
      league: "Bundesliga",
      date: "Dec 18",
      time: "2:30 PM EST",
      price: "$11.99",
      status: "upcoming" as const
    },
    {
      homeTeam: "PSG",
      awayTeam: "Marseille",
      league: "Ligue 1",
      date: "Dec 19",
      time: "12:00 PM EST",
      price: "$8.99",
      status: "upcoming" as const
    },
    {
      homeTeam: "Juventus",
      awayTeam: "AC Milan",
      league: "Serie A",
      date: "Dec 15",
      time: "Finished",
      price: "$7.99",
      status: "ended" as const
    },
    {
      homeTeam: "Atletico Madrid",
      awayTeam: "Valencia",
      league: "La Liga",
      date: "Dec 20",
      time: "4:00 PM EST",
      price: "$9.99",
      status: "upcoming" as const
    }
  ];

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">Featured Games</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Don't miss these exciting matches. Get instant access to live and upcoming games.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game, index) => (
            <GameCard key={index} {...game} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedGames;