import memoizeOne from "memoize-one";
import type { ConvexPlayer } from "~/lib/convex-types";
import { useRoomSafe } from "../../_utils/utils";

const selectWinner = memoizeOne((players: ConvexPlayer[]) => {
  const alivePlayers = players.filter((p) => p.isAlive);
  const aliveUndercovers = alivePlayers.filter((p) => p.role === "undercover");
  const aliveCivilians = alivePlayers.filter((p) => p.role === "civilian");
  const aliveMrWhite = alivePlayers.filter((p) => p.role === "mr_white");

  if (aliveUndercovers.length === 0 && aliveMrWhite.length === 0) {
    return "civilians";
  }

  if (
    aliveUndercovers.length >= aliveCivilians.length &&
    aliveMrWhite.length === 0
  ) {
    return "undercovers";
  }

  if (
    aliveMrWhite.length > 0 &&
    aliveCivilians.length > 0 &&
    aliveUndercovers.length === 0 &&
    alivePlayers.length === 2
  ) {
    return "mr_white";
  }

  if (
    aliveCivilians.length === 0 &&
    aliveUndercovers.length > 0 &&
    aliveMrWhite.length > 0
  ) {
    return "undercovers_mr_white";
  }

  return "nobody";
});

export function useWinner() {
  const room = useRoomSafe();
  return selectWinner(room.players);
}
