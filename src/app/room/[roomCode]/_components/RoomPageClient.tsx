"use client";

import { useSessionStore } from "@/lib/stores/session-store";
import { useQuery } from "convex/react";
import { api } from "cvx/api";
import GameRoom from "~/app/room/[roomCode]/_components/GameRoom";
import JoinRoomForm from "~/app/room/[roomCode]/_components/JoinRoomForm";
import { JoinRoomQRCode } from "~/app/room/[roomCode]/_components/JoinRoomQRCode";
import { RoomNotFound } from "~/app/room/[roomCode]/_components/RoomNotFound";
import type { Room } from "~/lib/types";

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

function LoadingRoom() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
        <p className="text-gray-600">Chargement de la salle...</p>
      </div>
    </div>
  );
}

function JoinRoom({ roomCode, room }: { roomCode: string; room: Room }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-800">
            Rejoindre une Salle
          </h1>
          <p className="text-gray-600">
            Code de la Salle :{" "}
            <span className="font-mono font-bold">{roomCode}</span>
          </p>
        </div>

        <JoinRoomForm roomCode={roomCode} room={room} />

        <JoinRoomQRCode />
      </div>
    </div>
  );
}
