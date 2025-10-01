import { Room } from '@/lib/types';
import { UI_MESSAGES } from '@/lib/constants';
import Button from '../ui/Button';

interface GameHeaderProps {
  room: Room;
  isHost: boolean;
  onShareLink: () => void;
  onValidateGame: () => void;
  onStartGame: () => void;
  onLeave: () => void;
  isValidating: boolean;
}

export default function GameHeader({
  room,
  isHost,
  onShareLink,
  onValidateGame,
  onStartGame,
  onLeave,
  isValidating,
}: GameHeaderProps) {
  const getGameStateMessage = () => {
    switch (room.gameState) {
      case 'waiting':
        return UI_MESSAGES.GAME_STATES.WAITING;
      case 'discussion':
        return UI_MESSAGES.GAME_STATES.DISCUSSION;
      case 'voting':
        return UI_MESSAGES.GAME_STATES.VOTING;
      case 'results':
        return UI_MESSAGES.GAME_STATES.RESULTS;
      default:
        return '';
    }
  };

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-gray-600">{getGameStateMessage()}</p>
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={onShareLink}
              variant="primary"
              title="Copier le lien de la salle pour partager"
            >
              {UI_MESSAGES.BUTTONS.SHARE_LINK}
            </Button>

            {room.gameState !== 'waiting' && (
              <Button
                onClick={onValidateGame}
                disabled={isValidating}
                variant="warning"
                title="Valider et corriger l'état du jeu"
              >
                {isValidating ? UI_MESSAGES.BUTTONS.VALIDATING : UI_MESSAGES.BUTTONS.VALIDATE_GAME}
              </Button>
            )}

            {isHost && room.gameState === 'waiting' && (
              <Button
                onClick={onStartGame}
                disabled={room.players.length < 3}
                variant="success"
              >
                {UI_MESSAGES.BUTTONS.START_GAME} ({room.players.length}/3+)
              </Button>
            )}

            <Button
              onClick={onLeave}
              variant="secondary"
            >
              {UI_MESSAGES.BUTTONS.LEAVE_ROOM}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
