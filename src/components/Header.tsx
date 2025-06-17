import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { Play, User, Search, Menu, Settings } from "lucide-react";

const Header = () => {
  const { user, isAdmin } = useAuth();

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Play className="w-4 h-4 text-primary-foreground fill-current" />
            </div>
            <span className="text-xl font-bold">Spot On</span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#" className="text-foreground hover:text-primary transition-colors">Live</a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Sports</a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Schedule</a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">News</a>
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="hidden md:flex">
            <Search className="w-4 h-4" />
          </Button>
          
          {user ? (
            <div className="flex items-center space-x-2">
              {isAdmin && (
                <Button variant="outline" size="sm" asChild>
                  <a href="/admin">
                    <Settings className="w-4 h-4 mr-2" />
                    Admin
                  </a>
                </Button>
              )}
              <Button variant="outline" size="sm">
                <User className="w-4 h-4 mr-2" />
                Profile
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" asChild>
              <a href="/auth">
                <User className="w-4 h-4 mr-2" />
                Sign In
              </a>
            </Button>
          )}
          
          <Button className="md:hidden" variant="ghost" size="sm">
            <Menu className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;