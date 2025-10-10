import type { ConvexPlayer } from "@/lib/convex-types";
import {
  useCurrentPlayerSafe,
  useIsDiscussionPhase,
  useIsVotingPhase,
  useRenderAsPlayerTurn,
} from "~/app/room/[roomCode]/_utils/utils";

interface PlayerCardProps {
  player: ConvexPlayer;
  children: React.ReactNode;
}

export function PlayerCard({ player, children }: PlayerCardProps) {
  const currentPlayerSafe = useCurrentPlayerSafe();
  const shouldShowAsCurrentTurn = useRenderAsPlayerTurn(player);
  const isDiscussionPhase = useIsDiscussionPhase();
  const isVotingPhase = useIsVotingPhase();

  const isMe = player._id === currentPlayerSafe._id;

  return (
    <div
      className={`rounded-lg border p-3 ${
        player.isAlive
          ? "border-green-200 bg-green-50"
          : "border-red-200 bg-red-50"
      } ${isMe ? "ring-2 ring-blue-500" : ""} ${
        shouldShowAsCurrentTurn && (isDiscussionPhase || isVotingPhase)
          ? "bg-yellow-50 ring-2 ring-yellow-500"
          : ""
      }`}
    >
      {children}
    </div>
  );
}
