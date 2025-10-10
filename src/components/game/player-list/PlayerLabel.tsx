import type { ConvexPlayer } from "@/lib/convex-types";
import { useRenderAsPlayerTurn } from "~/app/room/[roomCode]/_utils/utils";

interface PlayerLabelProps {
  player: ConvexPlayer;
}

export function PlayerLabel({ player }: PlayerLabelProps) {
  const shouldShowAsCurrentTurn = useRenderAsPlayerTurn(player);

  return (
    <span className="font-medium">
      {shouldShowAsCurrentTurn && " →"} {!player.isAlive && "💀"} {player.name}
    </span>
  );
}
