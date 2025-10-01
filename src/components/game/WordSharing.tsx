import { Room, Player } from '@/lib/types';
import { UI_MESSAGES } from '@/lib/constants';
import { validateSharedWord } from '@/lib/validation';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface WordSharingProps {
  room: Room;
  currentPlayer: Player;
  wordToShare: string;
  setWordToShare: (word: string) => void;
  onShareWord: () => void;
  isMyTurn: boolean;
  currentTurnPlayer?: Player;
  alivePlayers: Player[];
}

export default function WordSharing({
  room,
  currentPlayer,
  wordToShare,
  setWordToShare,
  onShareWord,
  isMyTurn,
  currentTurnPlayer,
  alivePlayers,
}: WordSharingProps) {
  if (room.gameState !== 'discussion' || !currentPlayer) {
    return null;
  }

  const hasSharedWord = currentPlayer.hasSharedWord || false;
  const playersWhoShared = room.players.filter((p: any) => p.isAlive && p.hasSharedWord).length;
  const sharingProgress = alivePlayers.length > 0 ? (playersWhoShared / alivePlayers.length) * 100 : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate the word before sharing
    const validation = validateSharedWord(wordToShare);
    if (!validation.isValid) {
      alert(validation.error);
      return;
    }

    onShareWord();
  };

  return (
    <Card className="mb-6">
      <h2 className="text-xl font-semibold mb-4">Partage de Mot</h2>

      {/* Show whose turn it is */}
      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-blue-800 font-medium">
          {isMyTurn ? "🎯 C'est votre tour de partager un mot" : `⏳ C'est au tour de ${currentTurnPlayer?.name || "quelqu'un"}`}
        </p>
        {/* Show word sharing progress */}
        <div className="mt-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-blue-600">
              Progression: {playersWhoShared}/{alivePlayers.length} joueurs vivants ont partagé leur mot
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${sharingProgress}%` }}
            />
          </div>
        </div>
      </div>

      {!hasSharedWord ? (
        <div className="space-y-4">
          {isMyTurn ? (
            <>
              <p className="text-gray-700">
                Décrivez votre mot en un seul mot sans le révéler directement.
              </p>
              <form onSubmit={handleSubmit}>
                <div className="flex space-x-2">
                  <Input
                    type="text"
                    value={wordToShare}
                    onChange={(e) => setWordToShare(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        onShareWord();
                      }
                    }}
                    placeholder="Votre mot descriptif..."
                    maxLength={20}
                    className="flex-1"
                    autoFocus
                  />
                  <Button
                    type="submit"
                    disabled={!wordToShare.trim()}
                  >
                    {UI_MESSAGES.BUTTONS.SHARE_WORD}
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-yellow-800">
                ⏳ En attente que {currentTurnPlayer?.name} partage son mot...
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-green-800 font-medium">✅ Vous avez partagé votre mot</p>
          <p className="text-sm text-green-600 mt-1">
            {isMyTurn ? "En attente que tous les joueurs partagent leur mot..." : `En attente que ${currentTurnPlayer?.name} partage son mot...`}
          </p>
        </div>
      )}
    </Card>
  );
}
