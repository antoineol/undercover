"use client";

import GameRoom from "~/app/room/[roomCode]/_components/GameRoom";
import { JoinRoom } from "~/app/room/[roomCode]/_components/join-room/JoinRoom";
import { LoadingRoom } from "~/app/room/[roomCode]/_components/join-room/LoadingRoom";
import { RoomNotFound } from "~/app/room/[roomCode]/_components/join-room/RoomNotFound";
import { useCurrentPlayer, useRoom } from "../_utils/utils";
import { useParams } from "next/navigation";

export function RoomPageClient() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const room = useRoom();
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

  return <GameRoom />;
}
