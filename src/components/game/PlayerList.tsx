import { UI_MESSAGES } from '@/lib/constants';
import { Player, Room } from '@/lib/types';
import AnimateHeight from 'react-animate-height';
import Button from '../ui/Button';
import Card from '../ui/Card';

interface PlayerListProps {
  room: Room;
  currentPlayer: Player;
  playerName: string;
  isVotingPhase: boolean;
  isDiscussionPhase: boolean;
  currentTurnPlayerId?: string;
  voteCounts: Record<string, number>;
  voterNames: Record<string, string[]>;
  onVote: (playerId: string) => void;
  votingProgress: number;
}

export default function PlayerList({
  room,
  currentPlayer,
  playerName,
  isVotingPhase,
  isDiscussionPhase,
  currentTurnPlayerId,
  voteCounts,
  voterNames,
  onVote,
  votingProgress,
}: PlayerListProps) {
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
      <div className='w-full bg-gray-200 rounded-full h-2'>
        <div
          className='bg-blue-600 h-2 rounded-full transition-all duration-300'
          style={{ width: `${votingProgress}%` }}
        />
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
        {room.players.map((player: any) => {
          const isCurrentTurn = player._id === currentTurnPlayerId;
          const isMe = player.name === playerName;

          // Check if current turn player has already completed their action
          const hasCompletedAction = isDiscussionPhase
            ? player.hasSharedWord
            : isVotingPhase
              ? player.votes && player.votes.length > 0
              : false;

          // Only show as current turn if they haven't completed their action yet
          const shouldShowAsCurrentTurn = isCurrentTurn && !hasCompletedAction;
          // player.isAlive = false;

          return (
            <div
              key={player._id}
              className={`p-3 rounded-lg border ${
                player.isAlive
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              } ${isMe ? 'ring-2 ring-blue-500' : ''} ${
                shouldShowAsCurrentTurn && (isDiscussionPhase || isVotingPhase)
                  ? 'ring-2 ring-yellow-500 bg-yellow-50'
                  : ''
              }`}
            >
              <div className='flex justify-between items-center'>
                <span className='font-medium'>
                  {shouldShowAsCurrentTurn && ' →'} {!player.isAlive && '💀'}{' '}
                  {player.name}
                </span>
                <AnimateHeight
                  height={
                    isDiscussionPhase &&
                    player.hasSharedWord &&
                    player.sharedWord
                      ? 'auto'
                      : 0
                  }
                  duration={300}
                  easing='ease-in-out'
                  animateOpacity
                >
                  <div className='text-sm text-blue-600 mt-1'>
                    &quot;{player.sharedWord}&quot;
                  </div>
                </AnimateHeight>
              </div>

              {/* Show role for dead players */}

              <AnimateHeight
                height={
                  !player.isAlive && room.gameState !== 'waiting' ? 'auto' : 0
                }
                duration={300}
                easing='ease-in-out'
                animateOpacity
              >
                <div className='text-sm mt-1'>
                  <span
                    className={`px-2 py-1 rounded text-xs ${getRoleBadgeColor(player.role)}`}
                  >
                    {getRoleDisplayName(player.role)}
                  </span>
                </div>
              </AnimateHeight>

              {/* Show vote counts during voting */}
              <AnimateHeight
                height={isVotingPhase ? 'auto' : 0}
                duration={300}
                easing='ease-in-out'
                animateOpacity
              >
                <div className='text-sm text-red-600 mt-1'>
                  Votes :{' '}
                  {voteCounts[player._id] > 0 ? (
                    <>
                      {voteCounts[player._id]} (
                      {voterNames[player._id]?.join(', ')})
                    </>
                  ) : (
                    'aucun'
                  )}
                </div>

                {/* Show if current player has voted for this player - only for alive players */}
                <AnimateHeight
                  height={
                    player.isAlive &&
                    player.name !== playerName &&
                    currentPlayer &&
                    currentPlayer.isAlive
                      ? 'auto'
                      : 0
                  }
                  duration={300}
                  easing='ease-in-out'
                  animateOpacity
                >
                  <div className='mt-2'>
                    {currentPlayer?.votes.includes(player._id) ? (
                      <Button
                        onClick={() => onVote(player._id)}
                        variant='success'
                        size='sm'
                        className='w-full'
                      >
                        {UI_MESSAGES.BUTTONS.VOTED}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => onVote(player._id)}
                        variant='danger'
                        size='sm'
                        className='w-full'
                      >
                        {UI_MESSAGES.BUTTONS.VOTE_AGAINST}
                      </Button>
                    )}
                  </div>
                </AnimateHeight>
              </AnimateHeight>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
