import { UI_MESSAGES } from '@/lib/constants';
import { Room } from '@/lib/types';
import { determineWinner } from '@/domains/game/game-logic.service';
import {
  getRoleDisplayName,
  getRoleBadgeColor,
  formatWinnerText,
} from '@/domains/ui/ui-helpers.service';
import AnimateHeight from 'react-animate-height';
import Button from '../ui/Button';
import Card from '../ui/Card';

interface GameResultsProps {
  room: Room;
  isHost: boolean;
  onRestartGame: () => void;
}

// Internal component that handles the game results logic
function GameResultsContent({ room, isHost, onRestartGame }: GameResultsProps) {
  const alivePlayers = room.players.filter((p: any) => p.isAlive);
  const { winner, winnerColor, winnerMessage } = determineWinner(alivePlayers);

  return (
    <Card className='flex flex-col gap-6'>
      <h2 className='text-2xl font-bold text-center'>🎉 Jeu Terminé !</h2>

      <div className='text-center flex flex-col gap-4'>
        <div className={`text-4xl font-bold ${winnerColor}`}>
          {winner} {formatWinnerText(winner)} !
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

// Wrapper component that uses AnimateHeight instead of early return
export default function GameResults(props: GameResultsProps) {
  const { room } = props;
  const shouldShow = room.gameState === 'results';

  return (
    <AnimateHeight
      height={shouldShow ? 'auto' : 0}
      duration={300}
      easing='ease-in-out'
      animateOpacity
      className='contents'
    >
      <GameResultsContent {...props} />
    </AnimateHeight>
  );
}
