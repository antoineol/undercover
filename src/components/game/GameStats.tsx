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

  return (
    <Card className="mb-6">
      <h2 className="text-xl font-semibold mb-4">État du Jeu</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{alivePlayers.length}</div>
          <div className="text-sm text-gray-600">Joueurs Vivants</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{room.currentRound}</div>
          <div className="text-sm text-gray-600">Tour Actuel</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{room.maxRounds}</div>
          <div className="text-sm text-gray-600">Tours Maximum</div>
        </div>
      </div>

      {/* Voting Progress */}
      {room.gameState === 'voting' && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Progression du Vote</span>
            <span className="text-sm text-gray-600">
              {playersWhoVoted.length}/{alivePlayers.length} joueurs vivants ont voté
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${votingProgress}%` }}
            />
          </div>
          {votingProgress === 100 && (
            <p className="text-sm text-green-600 mt-2 font-medium">
              ✅ Tous les joueurs vivants ont voté - Traitement des résultats...
            </p>
          )}
          {currentPlayer && currentPlayer.votes.length > 0 && (
            <p className="text-sm text-blue-600 mt-2">
              🗳️ Vous avez voté pour: {room.players.find((p: any) => p._id === currentPlayer.votes[0])?.name}
            </p>
          )}
        </div>
      )}
    </Card>
  );
}
