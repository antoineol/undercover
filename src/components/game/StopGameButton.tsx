import { RoomWithPlayers } from '@/lib/convex-types';
import { retryWithBackoff } from '@/lib/utils';
import { useMutation } from 'convex/react';
import AnimateHeight from 'react-animate-height';
import { api } from '../../../convex/_generated/api';
import Button from '../ui/Button';

interface StopGameButtonProps {
  room: RoomWithPlayers;
  isHost: boolean;
}

export default function StopGameButton({ room, isHost }: StopGameButtonProps) {
  const stopGame = useMutation(api.game.stopGame);

  const handleStopGame = async () => {
    if (room && isHost) {
      const confirmed = confirm(
        "Êtes-vous sûr de vouloir arrêter le jeu en cours ? Tous les joueurs retourneront à l'écran de configuration."
      );

      if (confirmed) {
        try {
          await retryWithBackoff(() =>
            stopGame({
              roomId: room._id,
            })
          );
        } catch (error: unknown) {
          console.error('Failed to stop game:', error);
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
          alert(`Erreur: ${errorMessage}`);
        }
      }
    }
  };

  const shouldShow =
    isHost && room.gameState !== 'waiting' && room.gameState !== 'results';

  return (
    <AnimateHeight
      height={shouldShow ? 'auto' : 0}
      duration={300}
      easing='ease-in-out'
      animateOpacity
    >
      <div className='fixed bottom-4 left-4 z-10'>
        <Button
          onClick={handleStopGame}
          variant='secondary'
          size='sm'
          className='text-xs text-gray-600 hover:text-red-600 hover:bg-red-50 border-gray-300'
          title='Arrêter le jeu et retourner à la configuration'
        >
          Arrêter le jeu
        </Button>
      </div>
    </AnimateHeight>
  );
}
