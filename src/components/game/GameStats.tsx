import { Room } from '@/lib/types';
import Card from '../ui/Card';

interface GameStatsProps {
  room: Room;
  alivePlayers: any[];
  votingProgress: number;
  playersWhoVoted: any[];
  currentPlayer?: any;
}

export default function GameStats({
  room,
  alivePlayers,
  votingProgress,
  playersWhoVoted,
  currentPlayer,
}: GameStatsProps) {
  if (room.gameState === 'waiting') {
    return null;
  }

  if (room.gameState !== 'voting') return null;

  return (
    <Card>
      {/* Voting Progress */}
      {room.gameState === 'voting' && (
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
          {votingProgress === 100 && (
            <p className='text-sm text-green-600 mt-2 font-medium'>
              ✅ Tous les joueurs ont voté - Traitement des résultats...
            </p>
          )}
        </div>
      )}
    </Card>
  );
}
