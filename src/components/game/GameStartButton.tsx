import { getStartGameButtonText } from "@/domains/ui/ui-helpers.service";
import type { RoomWithPlayers } from "@/lib/convex-types";
import { retryWithBackoff } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import { api } from "cvx/api";
import Button from "../ui/Button";

interface GameStartButtonProps {
  room: RoomWithPlayers;
  isHost: boolean;
}

export default function GameStartButton({
  room,
  isHost,
}: GameStartButtonProps) {
  const startGame = useMutation(api.game.startGame);
  const gameConfig = useQuery(api.room_config.getGameConfig, {
    roomId: room._id,
  });

  const handleStartGame = async () => {
    if (room && isHost && gameConfig) {
      try {
        await retryWithBackoff(() =>
          startGame({
            roomId: room._id,
            numUndercovers: gameConfig.numUndercovers,
            numMrWhites: gameConfig.numMrWhites,
          }),
        );
      } catch (error: unknown) {
        console.error("Failed to start game:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        alert(`Erreur: ${errorMessage}`);
      }
    }
  };

  if (!isHost || room.gameState !== "waiting") {
    return null;
  }

  return (
    <Button
      onClick={handleStartGame}
      disabled={room.players.length < 3}
      variant="success"
      size="lg"
      className="min-h-[56px] w-full text-lg font-semibold"
    >
      {getStartGameButtonText(room.players.length)}
    </Button>
  );
}
