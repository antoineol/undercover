"use client";

import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import RoomLobby from "@/components/RoomLobby";

export default function Home() {
  const createRoom = useMutation(api.rooms.createRoom);

  const handleCreateRoom = async (name: string) => {
    try {
      const result = await createRoom({ hostName: name });
      // Add a small delay to ensure room is fully created
      await new Promise(resolve => setTimeout(resolve, 500));
      // Redirect to room URL with name as parameter
      window.location.href = `/room/${result.roomCode}?name=${encodeURIComponent(name)}&isHost=true`;
    } catch (error) {
      console.error("Failed to create room:", error);
    }
  };

  const handleJoinRoom = async (roomCode: string) => {
    // Redirect to room URL instead of setting state
    window.location.href = `/room/${roomCode}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Undercover</h1>
          <p className="text-gray-600">Un jeu de déduction sociale</p>
        </div>

        <RoomLobby
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
        />
      </div>
    </div>
  );
}