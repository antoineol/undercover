import { Room, Player } from '@/lib/types';
import { UI_MESSAGES } from '@/lib/constants';
import Card from '../ui/Card';
import Button from '../ui/Button';

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
    <Card className="mb-6">
      <h2 className="text-xl font-semibold mb-4">Joueurs ({room.players.length})</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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

          return (
            <div
              key={player._id}
              className={`p-3 rounded-lg border ${
                player.isAlive
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              } ${isMe ? "ring-2 ring-blue-500" : ""} ${
                shouldShowAsCurrentTurn && (isDiscussionPhase || isVotingPhase)
                  ? "ring-2 ring-yellow-500 bg-yellow-50"
                  : ""
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">{player.name}</span>
                <div className="flex space-x-1">
                  {shouldShowAsCurrentTurn && (isDiscussionPhase || isVotingPhase) && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      Tour
                    </span>
                  )}
                  {player.isHost && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      Hôte
                    </span>
                  )}
                </div>
              </div>

              {room.gameState !== "waiting" && (
                <div className="text-sm text-gray-600 mt-1">
                  {player.isAlive ? UI_MESSAGES.PLAYER_STATUS.ALIVE : UI_MESSAGES.PLAYER_STATUS.DEAD}
                </div>
              )}

              {/* Show role for dead players */}
              {!player.isAlive && room.gameState !== "waiting" && (
                <div className="text-sm mt-1">
                  <span className="font-medium">Rôle révélé: </span>
                  <span className={`px-2 py-1 rounded text-xs ${getRoleBadgeColor(player.role)}`}>
                    {getRoleDisplayName(player.role)}
                  </span>
                </div>
              )}

              {/* Show if player is skipped in current turn */}
              {isDiscussionPhase && !player.isAlive && (
                <div className="text-xs text-gray-500 mt-1">
                  {UI_MESSAGES.PLAYER_STATUS.SKIPPED}
                </div>
              )}

              {/* Show if player is current turn (only in active game phases) */}
              {shouldShowAsCurrentTurn && (isDiscussionPhase || isVotingPhase) && (
                <div className="text-xs text-yellow-600 mt-1">
                  {UI_MESSAGES.PLAYER_STATUS.CURRENT_TURN}
                </div>
              )}

              {/* Show shared word if player has shared */}
              {isDiscussionPhase && player.hasSharedWord && player.sharedWord && (
                <div className="text-sm text-blue-600 mt-1">
                  Mot: &quot;{player.sharedWord}&quot;
                </div>
              )}

              {/* Show vote counts during voting */}
              {isVotingPhase && voteCounts[player._id] > 0 && (
                <div className="text-sm text-red-600 mt-1">
                  Votes: {voteCounts[player._id]} ({voterNames[player._id]?.join(", ")})
                </div>
              )}

              {/* Show if current player has voted for this player - only for alive players */}
              {isVotingPhase && player.isAlive && player.name !== playerName && currentPlayer && currentPlayer.isAlive && (
                <div className="mt-2">
                  {currentPlayer?.votes.includes(player._id) ? (
                    <Button
                      onClick={() => onVote(player._id)}
                      variant="success"
                      size="sm"
                      className="w-full"
                    >
                      {UI_MESSAGES.BUTTONS.VOTED}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => onVote(player._id)}
                      variant="danger"
                      size="sm"
                      className="w-full"
                    >
                      {UI_MESSAGES.BUTTONS.VOTE_AGAINST}
                    </Button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
