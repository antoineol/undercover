import { useQuery } from "convex/react";
import { api } from "cvx/api";
import memoizeOne from "memoize-one";
import { useParams } from "next/navigation";
import type { ConvexPlayer, RoomWithPlayers } from "~/lib/convex-types";
import { useSessionStore } from "~/lib/stores/session-store";
import type { Player, Room } from "~/lib/types";

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

const selectCurrentTurnPlayer = memoizeOne((room: Room) => {
  const currentTurnPlayerId =
    room.playerOrder?.[room.currentPlayerIndex ?? -1] ?? null;

  if (!currentTurnPlayerId) return null;

  return room.players.find((p) => p._id === currentTurnPlayerId) ?? null;
});

const selectVotingProgress = memoizeOne((room: RoomWithPlayers) => {
  const players = room.players;
  const alivePlayers = players.filter((p) => p.isAlive);
  if (alivePlayers.length === 0) return 0;

  const playersWhoVoted = alivePlayers.filter((p) => p.hasVoted === true);
  return (playersWhoVoted.length / alivePlayers.length) * 100;
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

export function useIsVotingPhase() {
  const room = useRoomSafe();
  return room.gameState === "voting";
}

export function useCurrentTurnPlayer() {
  const room = useRoomSafe();

  return selectCurrentTurnPlayer(room);
}

// Horribly complex function. To refactor later. May be simpler.
export function useRenderAsPlayerTurn(player: ConvexPlayer) {
  const currentTurnPlayer = useCurrentTurnPlayer();
  const isVotingPhase = useIsVotingPhase();
  const isDiscussionPhase = useIsDiscussionPhase();

  const isCurrentTurn = player._id === currentTurnPlayer?._id;
  const hasCompletedAction = isDiscussionPhase
    ? player.hasSharedWord
    : isVotingPhase
      ? player.hasVoted === true
      : false;

  return isCurrentTurn && !hasCompletedAction;
}

export function useVotingProgress() {
  const room = useRoomSafe();
  return selectVotingProgress(room);
}
