"use client";

import { useQuery } from "convex/react";
import { api } from "cvx/api";
import GameRoom from "~/app/room/[roomCode]/_components/GameRoom";
import { JoinRoom } from "~/app/room/[roomCode]/_components/join-room/JoinRoom";
import { LoadingRoom } from "~/app/room/[roomCode]/_components/join-room/LoadingRoom";
import { RoomNotFound } from "~/app/room/[roomCode]/_components/join-room/RoomNotFound";
import { useCurrentPlayer } from "../_utils/utils";

interface RoomPageClientProps {
  roomCode: string;
}

export function RoomPageClient({ roomCode }: RoomPageClientProps) {
  const room = useQuery(api.rooms.getRoom, { roomCode });
  const currentPlayer = useCurrentPlayer();

  if (room === undefined) {
    return <LoadingRoom />;
  }

  if (room === null) {
    return <RoomNotFound roomCode={roomCode} />;
  }

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
