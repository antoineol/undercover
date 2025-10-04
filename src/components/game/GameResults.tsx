import { determineWinner } from "@/domains/game/game-logic.service";
import {
  formatWinnerText,
  getRoleBadgeColor,
  getRoleDisplayName,
} from "@/domains/ui/ui-helpers.service";
import { UI_MESSAGES } from "@/lib/constants";
import type { RoomWithPlayers } from "@/lib/convex-types";
import AnimateHeight from "react-animate-height";
import Button from "../ui/Button";
import Card from "../ui/Card";

interface GameResultsProps {
  room: RoomWithPlayers;
  isHost: boolean;
  onRestartGame: () => void;
}

// Internal component that handles the game results logic
function GameResultsContent({ room, isHost, onRestartGame }: GameResultsProps) {
  const alivePlayers = room.players.filter((p) => p.isAlive);
  const { winner, winnerColor, winnerMessage } = determineWinner(alivePlayers);

  return (
    <Card className="mt-6 flex flex-col gap-6">
      <h2 className="text-center text-2xl font-bold">🎉 Jeu Terminé !</h2>

      <div className="flex flex-col gap-4 text-center">
        <div className={`text-4xl font-bold ${winnerColor}`}>
          {winner} {formatWinnerText(winner)} !
        </div>
        <p className="text-lg text-gray-700">{winnerMessage}</p>

        <div className="rounded-lg bg-gray-50 p-4">
          <h3 className="mb-2 font-semibold">Joueurs Survivants</h3>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
            {alivePlayers.map((player) => (
              <div key={player._id} className="text-sm">
                <span className="font-medium">{player.name}</span>
                <span
                  className={`ml-2 rounded px-2 py-1 text-xs ${getRoleBadgeColor(player.role)}`}
                >
                  {getRoleDisplayName(player.role)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Restart Game Button - Only for Host */}
      {isHost ? (
        <div className="text-center">
          <Button onClick={onRestartGame} variant="success" size="lg">
            {UI_MESSAGES.BUTTONS.RESTART_GAME}
          </Button>
        </div>
      ) : (
        <p className="text-center text-sm text-gray-600">
          Seul l&apos;hôte peut redémarrer le jeu
        </p>
      )}
    </Card>
  );
}

// Wrapper component that uses AnimateHeight instead of early return
export default function GameResults(props: GameResultsProps) {
  const { room } = props;
  const shouldShow = room.gameState === "results";

  return (
    <AnimateHeight
      height={shouldShow ? "auto" : 0}
      duration={300}
      easing="ease-in-out"
      animateOpacity
    >
      <GameResultsContent {...props} />
    </AnimateHeight>
  );
}
