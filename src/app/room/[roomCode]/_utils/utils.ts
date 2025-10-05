import { useQuery } from "convex/react";
import { api } from "cvx/api";
import memoizeOne from "memoize-one";
import { useParams } from "next/navigation";
import { useSessionStore } from "~/lib/stores/session-store";
import type { Player } from "~/lib/types";

const findPlayerBySessionId = memoizeOne(
  (players: Player[] | undefined, sessionId: string | null) => {
    return players?.find((p) => p.sessionId === sessionId);
  },
);

export function useCurrentPlayer() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const { sessionId } = useSessionStore();
  const room = useQuery(api.rooms.getRoom, { roomCode });

  return findPlayerBySessionId(room?.players, sessionId);
}
