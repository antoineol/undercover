'use client';

import RoomLobby from '@/components/RoomLobby';
import { usePlayerStore } from '@/lib/stores/player-store';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

export default function Home() {
  const createRoom = useMutation(api.rooms.createRoom);
  const { setPlayer, saveToSessionStorage } = usePlayerStore();

  const handleCreateRoom = async (name: string) => {
    try {
      const result = await createRoom({ hostName: name });
      // Add a small delay to ensure room is fully created
      await new Promise(resolve => setTimeout(resolve, 500));

      // Store host data in Zustand store and sessionStorage
      setPlayer({
        playerName: name,
        isHost: true,
        sessionId: result.sessionId,
        roomCode: result.roomCode,
      });
      saveToSessionStorage(result.roomCode);

      // Redirect to room URL
      window.location.href = `/room/${result.roomCode}`;
    } catch (error) {
      console.error('Failed to create room:', error);
    }
  };

  const handleJoinRoom = async (roomCode: string) => {
    // Redirect to room URL instead of setting state
    window.location.href = `/room/${roomCode}`;
  };

  return (
    <div className='min-h-screen flex items-center justify-center sm:bg-gradient-to-br sm:from-blue-500 sm:to-purple-600 max-sm:bg-white'>
      <div className='bg-white rounded-lg sm:shadow-xl p-4 sm:p-8 w-full sm:max-w-md flex flex-col gap-4 sm:gap-8'>
        <h1 className='text-3xl text-center font-bold text-gray-800 mb-2'>
          Undercover
        </h1>

        <RoomLobby
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
        />
      </div>
    </div>
  );
}
