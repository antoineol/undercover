import { useQuery } from "convex/react";
import { api } from "cvx/api";
import memoizeOne from "memoize-one";
import { useParams } from "next/navigation";
import { useSessionStore } from "~/lib/stores/session-store";
import type { Player } from "~/lib/types";

const selectPlayerBySessionId = memoizeOne(
  (players: Player[] | undefined, sessionId: string | null) => {
    return players?.find((p) => p.sessionId === sessionId);
  },
);

const selectVotes = memoizeOne((players: Player[]) => {
  const alivePlayers = players.filter((p) => p.isAlive);
  const voteCounts: Record<string, number> = {};
  const voterNames: Record<string, string[]> = {};

  alivePlayers.forEach((player) => {
    player.votes.forEach((voteId) => {
      voteCounts[voteId] = (voteCounts[voteId] ?? 0) + 1;
      voterNames[voteId] ??= [];
      voterNames[voteId].push(player.name);
    });
  });
  return { voteCounts, voterNames };
});

export function useCurrentPlayer() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const { sessionId } = useSessionStore();
  const room = useQuery(api.rooms.getRoom, { roomCode });

  return selectPlayerBySessionId(room?.players, sessionId);
}

export function useCurrentPlayerSafe() {
  return useCurrentPlayer()!;
}

export function useRoom() {
  const { roomCode } = useParams<{ roomCode: string }>();
  return useQuery(api.rooms.getRoom, { roomCode });
}

export function useVotesSafe() {
  const room = useRoomSafe();
  return selectVotes(room.players);
}

export function useRoomSafe() {
  return useRoom()!;
}

export function useIsDiscussionPhase() {
  const room = useRoomSafe();
  return room.gameState === "discussion";
}
