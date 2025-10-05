"use client";

import { useSessionStore } from "@/lib/stores/session-store";
import { useQuery } from "convex/react";
import { api } from "cvx/api";
import GameRoom from "~/app/room/[roomCode]/_components/GameRoom";
import { JoinRoom } from "~/app/room/[roomCode]/_components/join-room/JoinRoom";
import { LoadingRoom } from "~/app/room/[roomCode]/_components/join-room/LoadingRoom";
import { RoomNotFound } from "~/app/room/[roomCode]/_components/join-room/RoomNotFound";

interface RoomPageClientProps {
  roomCode: string;
}

export function RoomPageClient({ roomCode }: RoomPageClientProps) {
  const { sessionId } = useSessionStore();

  const room = useQuery(api.rooms.getRoom, { roomCode });
  const isLoading = room === undefined;

  if (isLoading || room === undefined) {
    return <LoadingRoom />;
  }

  if (room === null) {
    return <RoomNotFound roomCode={roomCode} />;
  }

  const currentPlayer = room?.players.find((p) => p.sessionId === sessionId);

  if (!currentPlayer) {
    return <JoinRoom roomCode={roomCode} room={room} />;
  }

  return (
    <GameRoom
      roomCode={roomCode}
      playerName={currentPlayer.name}
      isHost={currentPlayer.isHost}
    />
  );
}
