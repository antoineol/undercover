import { UI_MESSAGES } from '@/lib/constants';
import { Room } from '@/lib/types';
import Button from '../ui/Button';
import Card from '../ui/Card';

interface GameResultsProps {
  room: Room;
  isHost: boolean;
  onRestartGame: () => void;
}

export default function GameResults({
  room,
  isHost,
  onRestartGame,
}: GameResultsProps) {
  if (room.gameState !== 'results') {
    return null;
  }

  const determineWinner = () => {
    const alivePlayers = room.players.filter((p: any) => p.isAlive);
    const aliveUndercovers = alivePlayers.filter(
      (p: any) => p.role === 'undercover'
    );
    const aliveCivilians = alivePlayers.filter(
      (p: any) => p.role === 'civilian'
    );
    const aliveMrWhite = alivePlayers.filter((p: any) => p.role === 'mr_white');

    let winner = '';
    let winnerColor = '';
    let winnerMessage = '';

    if (aliveUndercovers.length === 0 && aliveMrWhite.length === 0) {
      winner = 'Les civils';
      winnerColor = 'text-blue-600';
      winnerMessage =
        'Les civils ont éliminé tous les Undercovers et Mr. White !';
    } else if (
      aliveUndercovers.length >= aliveCivilians.length &&
      aliveMrWhite.length === 0
    ) {
      winner = 'Les undercovers';
      winnerColor = 'text-red-600';
      winnerMessage = 'Les Undercovers ont survécu et surpassé les civils !';
    } else if (
      aliveMrWhite.length > 0 &&
      aliveCivilians.length > 0 &&
      aliveUndercovers.length === 0 &&
      alivePlayers.length === 2
    ) {
      winner = 'Mr. White';
      winnerColor = 'text-gray-600';
      winnerMessage = "Mr. White a survécu jusqu'à la fin !";
    } else if (
      aliveCivilians.length === 0 &&
      aliveUndercovers.length > 0 &&
      aliveMrWhite.length > 0
    ) {
      winner = 'Les undercovers & Mr. White';
      winnerColor = 'text-purple-600';
      winnerMessage =
        'Les Undercovers et Mr. White ont éliminé tous les civils !';
    } else {
      // Fallback: Game ended but no clear winner (shouldn't happen)
      winner = 'Personne';
      winnerColor = 'text-gray-600';
      winnerMessage =
        "Le jeu s'est terminé sans vainqueur clair. Veuillez recommencer.";
    }

    return { winner, winnerColor, winnerMessage };
  };

  const { winner, winnerColor, winnerMessage } = determineWinner();
  const alivePlayers = room.players.filter((p: any) => p.isAlive);

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'undercover':
        return 'Undercover';
      case 'mr_white':
        return 'Mr. White';
      case 'civilian':
        return 'Civil';
      default:
        return role;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'undercover':
        return 'bg-red-100 text-red-800';
      case 'mr_white':
        return 'bg-gray-100 text-gray-800';
      case 'civilian':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className='flex flex-col gap-6'>
      <h2 className='text-2xl font-bold text-center'>🎉 Jeu Terminé !</h2>

      <div className='text-center flex flex-col gap-4'>
        <div className={`text-4xl font-bold ${winnerColor}`}>
          {winner}{' '}
          {winner === 'Mr. White' || winner === 'Personne'
            ? 'gagne'
            : 'gagnent'}{' '}
          !
        </div>
        <p className='text-lg text-gray-700'>{winnerMessage}</p>

        <div className='bg-gray-50 rounded-lg p-4'>
          <h3 className='font-semibold mb-2'>Joueurs Survivants</h3>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2'>
            {alivePlayers.map((player: any) => (
              <div key={player._id} className='text-sm'>
                <span className='font-medium'>{player.name}</span>
                <span
                  className={`ml-2 px-2 py-1 rounded text-xs ${getRoleBadgeColor(player.role)}`}
                >
                  {getRoleDisplayName(player.role)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Restart Game Button - Only for Host */}
      {isHost ? (
        <div className='text-center'>
          <Button onClick={onRestartGame} variant='success' size='lg'>
            {UI_MESSAGES.BUTTONS.RESTART_GAME}
          </Button>
        </div>
      ) : (
        <p className='text-sm text-gray-600 text-center'>
          Seul l&apos;hôte peut redémarrer le jeu
        </p>
      )}
    </Card>
  );
}
