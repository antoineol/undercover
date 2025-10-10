import { useMutation } from "convex/react";
import { api } from "cvx/api";
import type { Id } from "cvx/dataModel";
import {
  useCurrentPlayerSafe,
  useRoomSafe,
} from "~/app/room/[roomCode]/_utils/utils";
import { AnimateHeightSimple } from "~/components/ui/AnimateHeightSimple";
import Button from "~/components/ui/Button";
import { UI_MESSAGES } from "~/lib/constants";
import type { ConvexPlayer } from "~/lib/convex-types";
import { retryWithBackoff } from "~/lib/utils";

export function VoteButton({ player }: { player: ConvexPlayer }) {
  const currentPlayer = useCurrentPlayerSafe();
  const playerName = currentPlayer.name;
  const votePlayer = useMutation(api.game.votePlayer);
  const room = useRoomSafe();

  const handleVote = async (targetId: Id<"players">) => {
    if (room) {
      try {
        await retryWithBackoff(() =>
          votePlayer({
            roomId: room._id,
            voterId: currentPlayer._id,
            targetId: targetId,
          }),
        );
      } catch (error) {
        console.error("Échec du vote:", error);
        alert(
          "Erreur lors du vote: " +
            ((error as Error).message || "Erreur inconnue"),
        );
      }
    }
  };

  return (
    <AnimateHeightSimple
      open={
        player.isAlive && player.name !== playerName && currentPlayer?.isAlive
      }
    >
      <div className="mt-2">
        {currentPlayer?.votes?.includes?.(player._id) ? (
          <Button
            onClick={() => handleVote(player._id)}
            variant="success"
            size="sm"
            className="w-full"
          >
            {UI_MESSAGES.BUTTONS.VOTED}
          </Button>
        ) : (
          <Button
            onClick={() => handleVote(player._id)}
            variant="danger"
            size="sm"
            className="w-full"
          >
            {UI_MESSAGES.BUTTONS.VOTE_AGAINST}
          </Button>
        )}
      </div>
    </AnimateHeightSimple>
  );
}
