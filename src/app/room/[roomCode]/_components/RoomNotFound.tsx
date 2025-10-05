import Link from "next/link";

interface RoomNotFoundProps {
  roomCode: string;
}

export function RoomNotFound({ roomCode }: RoomNotFoundProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-red-600">
            Salle Introuvable
          </h1>
          <p className="text-gray-600">
            Le code de salle &quot;{roomCode}&quot; n&apos;existe pas.
          </p>
        </div>
        <Link
          href="/"
          className="block w-full rounded-md bg-blue-600 px-4 py-2 text-center text-white hover:bg-blue-700"
        >
          Retour à l&apos;Accueil
        </Link>
      </div>
    </div>
  );
}
