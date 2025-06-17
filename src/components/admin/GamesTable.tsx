import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Edit, Trash2, Star } from 'lucide-react';

interface Game {
  id: string;
  title: string;
  description: string | null;
  featured_image_url: string | null;
  status: string;
  featured: boolean;
  created_at: string;
}

interface GamesTableProps {
  games: Game[];
  onEditGame: (game: Game) => void;
  onGamesUpdated: () => void;
}

const GamesTable = ({ games, onEditGame, onGamesUpdated }: GamesTableProps) => {
  const { toast } = useToast();

  const handleDeleteGame = async (gameId: string) => {
    if (!confirm('Are you sure you want to delete this game?')) return;

    try {
      const { error } = await supabase
        .from('games')
        .delete()
        .eq('id', gameId);

      if (error) throw error;
      toast({ title: "Success", description: "Game deleted successfully!" });
      onGamesUpdated();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleToggleFeatured = async (gameId: string, currentFeatured: boolean) => {
    try {
      const { error } = await supabase
        .from('games')
        .update({ featured: !currentFeatured })
        .eq('id', gameId);

      if (error) throw error;
      
      toast({ 
        title: "Success", 
        description: `Game ${!currentFeatured ? 'featured' : 'unfeatured'} successfully!` 
      });
      onGamesUpdated();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Games ({games.length})</CardTitle>
        <CardDescription>Manage your game content</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {games.map((game) => (
              <TableRow key={game.id}>
                <TableCell className="font-medium">{game.title}</TableCell>
                <TableCell>
                  <Badge variant={game.status === 'published' ? 'default' : 'secondary'}>
                    {game.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {game.featured && (
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    )}
                    <Button
                      onClick={() => handleToggleFeatured(game.id, game.featured)}
                      size="sm"
                      variant={game.featured ? "default" : "outline"}
                      className="h-6 text-xs"
                    >
                      {game.featured ? 'Featured' : 'Feature'}
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  {new Date(game.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => onEditGame(game)}
                      size="sm"
                      variant="outline"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDeleteGame(game.id)}
                      size="sm"
                      variant="destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {games.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No games created yet. Add your first game!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default GamesTable;