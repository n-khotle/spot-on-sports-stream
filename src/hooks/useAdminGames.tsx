import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Game } from '@/types/admin';

export const useAdminGames = () => {
  const { toast } = useToast();
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingGame, setEditingGame] = useState<Game | null>(null);

  const fetchGames = async () => {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGames(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch games",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  const handleEditGame = (game: Game) => {
    setEditingGame(game);
  };

  const handleGameSaved = () => {
    setEditingGame(null);
    fetchGames();
  };

  const handleCancel = () => {
    setEditingGame(null);
  };

  return {
    games,
    isLoading,
    editingGame,
    handleEditGame,
    handleGameSaved,
    handleCancel,
    fetchGames,
  };
};