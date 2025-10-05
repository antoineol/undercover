import { RoomPageClient } from "./_components/RoomPageClient";

interface RoomPageProps {
  params: Promise<{
    roomCode: string;
  }>;
}

export default async function RoomPage({ params }: RoomPageProps) {
  const { roomCode } = await params;

  return <RoomPageClient roomCode={roomCode} />;
}
