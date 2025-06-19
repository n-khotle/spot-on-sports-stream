import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Play } from "lucide-react";
import { format } from "date-fns";

interface NewsArticle {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  featured_image_url: string | null;
  video_url: string | null;
  author_name: string;
  published: boolean;
  featured: boolean;
  tags: string[] | null;
  created_at: string;
}

const News = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [featuredArticle, setFeaturedArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('news_articles')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false });
    
    if (data) {
      // Separate featured article from regular articles
      const featured = data.find(article => article.featured);
      const regular = data.filter(article => !article.featured);
      
      setFeaturedArticle(featured || null);
      setArticles(regular);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="text-lg">Loading news...</div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12 lg:py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Latest News
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Stay updated with the latest sports news, match analysis, and exclusive content from our team.
          </p>
        </div>

        {/* Featured Article */}
        {featuredArticle && (
          <div className="mb-16">
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-2xl font-bold">Featured Story</h2>
              <Badge variant="destructive" className="bg-gradient-to-r from-red-600 to-red-500">
                FEATURED
              </Badge>
            </div>
            
            <Card className="overflow-hidden border-border/50 shadow-xl bg-card/50 backdrop-blur-sm">
              <div className="grid lg:grid-cols-2 gap-0 min-h-[400px]">
                <div className="relative aspect-video lg:aspect-auto">
                  {featuredArticle.video_url ? (
                    <div className="relative w-full h-full bg-secondary">
                      <video
                        src={featuredArticle.video_url}
                        poster={featuredArticle.featured_image_url || undefined}
                        controls
                        preload="metadata"
                        className="w-full h-full object-cover"
                        style={{ minHeight: '300px' }}
                      >
                        Your browser does not support the video tag.
                      </video>
                      <div className="absolute top-4 left-4 z-10">
                        <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm shadow-sm">
                          <Play className="w-4 h-4 mr-2" />
                          Featured Video
                        </Badge>
                      </div>
                    </div>
                  ) : featuredArticle.featured_image_url ? (
                    <img 
                      src={featuredArticle.featured_image_url} 
                      alt={featuredArticle.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-secondary to-secondary/50 flex items-center justify-center">
                      <div className="text-muted-foreground text-center">
                        <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No image available</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="p-8 flex flex-col justify-center">
                  <div className="space-y-4">
                    {featuredArticle.tags && featuredArticle.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {featuredArticle.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    <h3 className="text-3xl font-bold leading-tight">
                      {featuredArticle.title}
                    </h3>
                    
                    {featuredArticle.excerpt && (
                      <p className="text-lg text-muted-foreground leading-relaxed">
                        {featuredArticle.excerpt}
                      </p>
                    )}
                    
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground pt-4">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{format(new Date(featuredArticle.created_at), "MMMM d, yyyy")}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Regular Articles Grid */}
        {articles.length > 0 ? (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold">All Stories</h2>
            
            <div className="grid sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {articles.map((article) => (
                <Card key={article.id} className="group hover:shadow-xl transition-all duration-300 border-border/50 overflow-hidden bg-card/50 backdrop-blur-sm hover:bg-card/80">
                  <div className="aspect-video relative overflow-hidden rounded-t-lg">
                    {article.video_url ? (
                      <div className="relative w-full h-full bg-secondary group cursor-pointer">
                        <video
                          src={article.video_url}
                          poster={article.featured_image_url || undefined}
                          controls
                          preload="metadata"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onLoadStart={(e) => {
                            const video = e.target as HTMLVideoElement;
                            video.currentTime = 1; // Show a frame from the video
                          }}
                        >
                          Your browser does not support the video tag.
                        </video>
                        <div className="absolute top-3 left-3 z-10">
                          <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm text-xs shadow-sm">
                            <Play className="w-3 h-3 mr-1" />
                            Video
                          </Badge>
                        </div>
                        {/* Play button overlay */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                          <div className="w-16 h-16 bg-background/90 rounded-full flex items-center justify-center shadow-lg">
                            <Play className="w-6 h-6 text-foreground ml-1" />
                          </div>
                        </div>
                      </div>
                    ) : article.featured_image_url ? (
                      <img 
                        src={article.featured_image_url} 
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-secondary to-secondary/50 flex items-center justify-center">
                        <Calendar className="w-8 h-8 text-muted-foreground opacity-50" />
                      </div>
                    )}
                  </div>

                  <CardHeader className="pb-2">
                    {article.tags && article.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {article.tags.slice(0, 2).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {article.excerpt && (
                      <p className="text-muted-foreground text-sm line-clamp-3">
                        {article.excerpt}
                      </p>
                    )}
                    
                     <div className="flex items-center justify-center text-xs text-muted-foreground">
                       <div className="flex items-center space-x-1">
                         <Calendar className="w-3 h-3" />
                         <span>{format(new Date(article.created_at), "MMM d")}</span>
                       </div>
                     </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : !featuredArticle && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground text-lg mb-2">No news articles available yet.</p>
            <p className="text-muted-foreground text-sm">Check back later for the latest updates!</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default News;