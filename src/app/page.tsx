"use client";

import RoomLobby from "@/components/RoomLobby";

export default function Home() {
  const handleJoinRoom = async (roomCode: string) => {
    // TODO use nextjs routing
    window.location.href = `/room/${roomCode}`;
  };

  return (
    <div className="flex min-h-screen items-center justify-center max-sm:bg-white sm:bg-gradient-to-br sm:from-blue-500 sm:to-purple-600">
      <div className="flex w-full flex-col gap-4 rounded-lg bg-white p-4 sm:max-w-md sm:gap-8 sm:p-8 sm:shadow-xl">
        <h1 className="mb-2 text-center text-3xl font-bold text-gray-800">
          Undercover
        </h1>

        <RoomLobby onJoinRoom={handleJoinRoom} />
      </div>
    </div>
  );
}
