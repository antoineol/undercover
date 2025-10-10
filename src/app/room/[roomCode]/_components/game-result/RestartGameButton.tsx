import { UI_MESSAGES } from "@/lib/constants";
import { useMutation } from "convex/react";
import { api } from "cvx/api";
import { useIsHost, useRoomSafe } from "~/app/room/[roomCode]/_utils/utils";
import Button from "../../../../../components/ui/Button";

export default function RestartGameButton() {
  const room = useRoomSafe();
  const isHost = useIsHost();

  const restartGame = useMutation(api.game.restartGame);

  const handleRestartGame = async () => {
    if (room && isHost) {
      try {
        await restartGame({ roomId: room._id });
      } catch (error) {
        console.error("Failed to restart game:", error);
        alert("Échec du redémarrage du jeu");
      }
    }
  };

  if (!isHost) {
    return (
      <p className="text-center text-sm text-gray-600">
        Seul l&apos;hôte peut redémarrer le jeu
      </p>
    );
  }

  return (
    <div className="text-center">
      <Button onClick={handleRestartGame} variant="success" size="lg">
        {UI_MESSAGES.BUTTONS.RESTART_GAME}
      </Button>
    </div>
  );
}
