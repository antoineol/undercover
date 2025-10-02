import { Room } from '@/lib/types';
import AnimateHeight from 'react-animate-height';
import Card from '../ui/Card';

interface GameStatsProps {
  room: Room;
  votingProgress: number;
}

// Internal component that handles the game stats logic
function GameStatsContent({ room, votingProgress }: GameStatsProps) {
  return (
    <Card>
      {/* Voting Progress */}
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
          className='contents'
        >
          <p className='text-sm text-green-600 mt-2 font-medium'>
            ✅ Tous les joueurs ont voté - Traitement des résultats...
          </p>
        </AnimateHeight>
      </div>
    </Card>
  );
}

// Wrapper component that uses AnimateHeight instead of early return
export default function GameStats(props: GameStatsProps) {
  const { room } = props;
  const shouldShow =
    room.gameState !== 'waiting' && room.gameState === 'voting';

  return (
    <AnimateHeight
      height={shouldShow ? 'auto' : 0}
      duration={300}
      easing='ease-in-out'
      animateOpacity
      className='contents'
    >
      {shouldShow && <GameStatsContent {...props} />}
    </AnimateHeight>
  );
}
