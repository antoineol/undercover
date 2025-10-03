import { getGameInstructionsText } from '@/domains/ui/ui-helpers.service';
import { RoomWithPlayers } from '@/lib/convex-types';
import AnimateHeight from 'react-animate-height';
import Card from '../ui/Card';

interface GameInstructionsProps {
  room: RoomWithPlayers;
}

export default function GameInstructions({ room }: GameInstructionsProps) {
  return (
    <AnimateHeight
      height={room.gameState === 'waiting' ? 'auto' : 0}
      duration={300}
      easing='ease-in-out'
      animateOpacity
    >
      <Card className='bg-blue-50 mt-6'>
        <h3 className='text-lg font-semibold mb-2'>Comment Jouer</h3>
        <ul className='text-sm text-gray-700 space-y-1'>
          {getGameInstructionsText().map((instruction, index) => (
            <li key={index}>{instruction}</li>
          ))}
        </ul>
      </Card>
    </AnimateHeight>
  );
}
