import JoinRoomForm from "~/app/room/[roomCode]/_components/join-room/JoinRoomForm";
import { RoomQRCode } from "~/app/room/[roomCode]/_components/join-room/RoomQRCode";
import type { Room } from "~/lib/types";

interface JoinRoomProps {
  roomCode: string;
  room: Room;
}

export function JoinRoom({ roomCode, room }: JoinRoomProps) {
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

        <RoomQRCode />
      </div>
    </div>
  );
}
