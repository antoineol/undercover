import { Room } from '@/lib/types';
import AnimateHeight from 'react-animate-height';
import Card from '../ui/Card';

interface GameStatsProps {
  room: Room;
  votingProgress: number;
}

export default function GameStats({ room, votingProgress }: GameStatsProps) {
  if (room.gameState === 'waiting') {
    return null;
  }

  if (room.gameState !== 'voting') return null;

  return (
    <Card>
      {/* Voting Progress */}
      <AnimateHeight
        height={room.gameState === 'voting' ? 'auto' : 0}
        duration={300}
        easing='ease-in-out'
        animateOpacity
      >
        <div className='p-4 bg-gray-50 rounded-lg'>
          <div className='flex justify-between items-center mb-2'>
            <span className='text-sm font-medium text-gray-700'>
              Progression du Vote
            </span>
          </div>
          <div className='w-full bg-gray-200 rounded-full h-2'>
            <div
              className='bg-blue-600 h-2 rounded-full transition-all duration-300'
              style={{ width: `${votingProgress}%` }}
            />
          </div>
          <AnimateHeight
            height={votingProgress === 100 ? 'auto' : 0}
            duration={300}
            easing='ease-in-out'
            animateOpacity
          >
            <p className='text-sm text-green-600 mt-2 font-medium'>
              ✅ Tous les joueurs ont voté - Traitement des résultats...
            </p>
          </AnimateHeight>
        </div>
      </AnimateHeight>
    </Card>
  );
}
