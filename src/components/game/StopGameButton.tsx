import { retryWithBackoff } from "@/lib/utils";
import { useMutation } from "convex/react";
import { api } from "cvx/api";
import { useIsHost, useRoomSafe } from "~/app/room/[roomCode]/_utils/utils";
import { AnimateHeightSimple } from "~/components/ui/AnimateHeightSimple";
import Button from "../ui/Button";

export default function StopGameButton() {
  const room = useRoomSafe();
  const isHost = useIsHost();
  const stopGame = useMutation(api.game.stopGame);

  const handleStopGame = async () => {
    if (room && isHost) {
      const confirmed = confirm(
        "Êtes-vous sûr de vouloir arrêter le jeu en cours ? Tous les joueurs retourneront à l'écran de configuration.",
      );

      if (confirmed) {
        try {
          await retryWithBackoff(() =>
            stopGame({
              roomId: room._id,
            }),
          );
        } catch (error: unknown) {
          console.error("Failed to stop game:", error);
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          alert(`Erreur: ${errorMessage}`);
        }
      }
    }
  };

  const shouldShow =
    isHost && room.gameState !== "waiting" && room.gameState !== "results";

  return (
    <AnimateHeightSimple open={shouldShow}>
      <div className="fixed bottom-4 left-4 z-10">
        <Button
          onClick={handleStopGame}
          variant="secondary"
          size="sm"
          className="border-gray-300 text-xs text-gray-600 hover:bg-red-50 hover:text-red-600"
          title="Arrêter le jeu et retourner à la configuration"
        >
          Arrêter le jeu
        </Button>
      </div>
    </AnimateHeightSimple>
  );
}
