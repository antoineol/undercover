'use client';

import GameRoom from '@/components/GameRoom';
import { usePlayerStore } from '@/lib/stores/player-store';
import { useUIStore } from '@/lib/stores/ui-store';
import { Room } from '@/lib/types';
import { useMutation, useQuery } from 'convex/react';
import Image from 'next/image';
import Link from 'next/link';
import QRCode from 'qrcode';
import { useCallback, useEffect, useState } from 'react';
import { api } from '../../../../convex/_generated/api';

interface RoomPageClientProps {
  roomCode: string;
}

export function RoomPageClient({ roomCode }: RoomPageClientProps) {
  const {
    playerName,
    isHost,
    setPlayer,
    clearPlayer,
    loadFromSessionStorage,
    saveToSessionStorage,
  } = usePlayerStore();
  const { qrCodeDataUrl, setQrCodeDataUrl } = useUIStore();
  const [isLoading, setIsLoading] = useState(true);
  const [joinError, setJoinError] = useState('');

  const room = useQuery(api.rooms.getRoom, { roomCode });
  const joinRoom = useMutation(api.rooms.joinRoom);

  const handleJoinRoom = useCallback(
    async (name: string, isHostPlayer: boolean = false, sessionId?: string) => {
      try {
        setJoinError('');
        const result = await joinRoom({
          roomCode,
          playerName: name,
          sessionId: sessionId, // Pass sessionId for rejoining
          isHost: isHostPlayer,
        });

        // Save player data to Zustand store and sessionStorage
        setPlayer({
          playerName: name,
          isHost: isHostPlayer,
          sessionId: result.sessionId,
          roomCode,
        });
        saveToSessionStorage(roomCode);

        // Log if this is a rejoin (for debugging)
        if (result.isExisting) {
          console.log('Player rejoined existing room');
        }
      } catch (error) {
        console.error('Failed to join room:', error);
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';

        // Show specific error messages for different cases
        if (errorMessage.includes('name already exists')) {
          setJoinError(
            'Un joueur avec ce nom existe déjà dans la salle. Veuillez choisir un autre nom.'
          );
        } else if (errorMessage.includes('Invalid session')) {
          setJoinError(
            'Session invalide. Veuillez rejoindre avec un nouveau nom.'
          );
        } else if (errorMessage.includes('Room not found')) {
          setJoinError('Salle introuvable. Vérifiez le code de la salle.');
        } else if (errorMessage.includes('Game has already started')) {
          setJoinError(
            'La partie a déjà commencé. Vous ne pouvez plus rejoindre cette salle.'
          );
        } else if (errorMessage.includes('Room is full')) {
          setJoinError('La salle est pleine. Maximum 10 joueurs autorisés.');
        } else {
          setJoinError(
            'Impossible de rejoindre la salle. Vérifiez le code de la salle ou essayez un nom différent.'
          );
        }
      }
    },
    [roomCode, joinRoom, setPlayer, saveToSessionStorage]
  );

  // Check for existing player data on mount and generate QR code
  useEffect(() => {
    // Load from sessionStorage first
    loadFromSessionStorage(roomCode);

    // Auto-join if we have saved data
    if (playerName && roomCode) {
      handleJoinRoom(playerName, isHost, undefined);
    }
    setIsLoading(false);

    // Generate QR code automatically
    const generateQRCode = async () => {
      const roomUrl = `${window.location.origin}/room/${roomCode}`;
      try {
        const qrDataUrl = await QRCode.toDataURL(roomUrl, {
          width: 150,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        });
        setQrCodeDataUrl(qrDataUrl);
      } catch (error) {
        console.error('Failed to generate QR code:', error);
      }
    };

    generateQRCode();
  }, [
    roomCode,
    handleJoinRoom,
    isHost,
    playerName,
    setQrCodeDataUrl,
    loadFromSessionStorage,
  ]);

  const handleLeave = () => {
    // Clear saved player data from both Zustand and sessionStorage
    clearPlayer();
    sessionStorage.removeItem(`player_${roomCode}`);
    setJoinError('');
  };

  if (isLoading || room === undefined) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p className='text-gray-600'>Chargement de la salle...</p>
        </div>
      </div>
    );
  }

  if (room === null) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600'>
        <div className='bg-white rounded-lg shadow-xl p-8 w-full max-w-md'>
          <div className='text-center mb-8'>
            <h1 className='text-3xl font-bold text-red-600 mb-2'>
              Salle Introuvable
            </h1>
            <p className='text-gray-600'>
              Le code de salle &quot;{roomCode}&quot; n&apos;existe pas.
            </p>
          </div>
          <Link
            href='/'
            className='w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 text-center block'
          >
            Retour à l&apos;Accueil
          </Link>
        </div>
      </div>
    );
  }

  if (playerName) {
    return (
      <GameRoom
        roomCode={roomCode}
        playerName={playerName}
        isHost={isHost}
        onLeave={handleLeave}
      />
    );
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600'>
      <div className='bg-white rounded-lg shadow-xl p-8 w-full max-w-md'>
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-gray-800 mb-2'>
            Rejoindre une Salle
          </h1>
          <p className='text-gray-600'>
            Code de la Salle :{' '}
            <span className='font-mono font-bold'>{roomCode}</span>
          </p>
        </div>

        <JoinRoomForm onJoin={handleJoinRoom} error={joinError} room={room} />

        {/* QR Code Section */}
        {qrCodeDataUrl && (
          <div className='mt-6 text-center'>
            <Image
              src={qrCodeDataUrl}
              alt='QR Code'
              width={150}
              height={150}
              className='mx-auto'
            />
            <p className='text-sm text-gray-600 mt-2'>Scannez pour rejoindre</p>
          </div>
        )}
      </div>
    </div>
  );
}

interface JoinRoomFormProps {
  onJoin: (name: string, isHost?: boolean) => void;
  error: string;
  room: Room;
}

function JoinRoomForm({ onJoin, error, room }: JoinRoomFormProps) {
  const [name, setName] = useState('');
  const [isHost, setIsHost] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onJoin(name.trim(), isHost);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      {error && (
        <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded'>
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor='name'
          className='block text-sm font-medium text-gray-700 mb-2'
        >
          Votre Nom
        </label>
        <input
          type='text'
          id='name'
          value={name}
          onChange={e => setName(e.target.value)}
          className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
          placeholder='Entrez votre nom'
          required
          maxLength={20}
          autoFocus
        />
      </div>

      {room.players.length === 0 && (
        <div className='flex items-center'>
          <input
            type='checkbox'
            id='isHost'
            checked={isHost}
            onChange={e => setIsHost(e.target.checked)}
            className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
          />
          <label htmlFor='isHost' className='ml-2 block text-sm text-gray-700'>
            Je suis l&apos;hôte de cette salle
          </label>
        </div>
      )}

      <button
        type='submit'
        disabled={!name.trim()}
        className='w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
      >
        Rejoindre la Salle
      </button>

      <div className='text-center'>
        <Link href='/' className='text-blue-600 hover:text-blue-800 text-sm'>
          ← Retour à l&apos;Accueil
        </Link>
      </div>
    </form>
  );
}
