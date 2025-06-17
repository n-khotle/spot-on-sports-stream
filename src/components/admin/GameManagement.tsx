import GameForm from '@/components/admin/GameForm';
import GamesTable from '@/components/admin/GamesTable';
import { useAdminGames } from '@/hooks/useAdminGames';

const GameManagement = () => {
  const {
    games,
    editingGame,
    handleEditGame,
    handleGameSaved,
    handleCancel,
    fetchGames,
  } = useAdminGames();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <GameForm 
        editingGame={editingGame} 
        onGameSaved={handleGameSaved}
        onCancel={handleCancel}
      />
      <GamesTable 
        games={games} 
        onEditGame={handleEditGame}
        onGamesUpdated={fetchGames}
      />
    </div>
  );
};

export default GameManagement;