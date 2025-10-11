import { generateRoomUrl } from "@/domains/room/room-management.service";
import { copyToClipboard } from "@/lib/utils";
import { useState } from "react";
import { useRoomSafe } from "~/app/room/[roomCode]/_utils/utils";
import Button from "../../../../../components/ui/Button";

interface ShareButtonProps {
  className?: string;
}

const label = "📋 Partager le Lien";
const successText = "✅ Lien copié !";
const errorText = "❌ Erreur de copie";

export default function ShareButton({ className }: ShareButtonProps) {
  const room = useRoomSafe();
  const [shareButtonText, setShareButtonText] = useState(label);

  const handleShareLink = async () => {
    const roomUrl = generateRoomUrl(room.code);
    try {
      await copyToClipboard(roomUrl);
      setShareButtonText(successText);
    } catch {
      setShareButtonText(errorText);
    }
    setTimeout(() => setShareButtonText(label), 2000);
  };

  return (
    <Button
      onClick={handleShareLink}
      variant="primary"
      size="lg"
      className={className}
    >
      {shareButtonText}
    </Button>
  );
}
