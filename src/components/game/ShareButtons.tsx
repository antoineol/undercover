import { generateRoomUrl } from "@/domains/room/room-management.service";
import { generateShareButtonTextWithTimeout } from "@/domains/ui/ui-helpers.service";
import type { RoomWithPlayers } from "@/lib/convex-types";
import { useUIStore } from "@/lib/stores/ui-store";
import { copyToClipboard } from "@/lib/utils";
import { AnimateHeightSimple } from "~/components/ui/AnimateHeightSimple";
import Button from "../ui/Button";

interface ShareButtonsProps {
  room: RoomWithPlayers;
}

export default function ShareButtons({ room }: ShareButtonsProps) {
  const { showQR, setShowQR, shareButtonText, setShareButtonText } =
    useUIStore();

  const handleShareLink = async () => {
    const roomUrl = generateRoomUrl(room.code);
    const success = await copyToClipboard(roomUrl);
    const newButtonText = generateShareButtonTextWithTimeout(success, !success);
    setShareButtonText(newButtonText);
    setTimeout(() => {
      setShareButtonText("📋 Partager le Lien");
    }, 2000);
  };

  return (
    <AnimateHeightSimple open={room.gameState === "waiting"}>
      {/* Mobile Share Buttons - Fixed */}
      <div className="fixed right-0 bottom-0 left-0 border-t bg-white p-4 shadow-lg md:hidden">
        <div className="flex gap-3">
          <Button
            onClick={() => setShowQR(!showQR)}
            variant="secondary"
            size="lg"
            className="min-h-[56px] flex-shrink-0 px-6 text-lg"
          >
            📱 QR
          </Button>
          <Button
            onClick={handleShareLink}
            variant="primary"
            size="lg"
            className="min-h-[56px] flex-1 text-lg font-semibold"
          >
            {shareButtonText}
          </Button>
        </div>
      </div>

      {/* Desktop Share Buttons - Normal Flow */}
      <div className="mx-auto hidden max-w-4xl px-4 pb-6 md:block">
        <div className="flex gap-3">
          <Button
            onClick={() => setShowQR(!showQR)}
            variant="secondary"
            size="lg"
            className="min-h-[56px] flex-shrink-0 px-6 text-lg"
          >
            📱 QR Code
          </Button>
          <Button
            onClick={handleShareLink}
            variant="primary"
            size="lg"
            className="min-h-[56px] flex-1 text-lg font-semibold"
          >
            {shareButtonText}
          </Button>
        </div>
      </div>

      {/* Bottom padding for mobile */}
      <div className="h-24 md:hidden"></div>
    </AnimateHeightSimple>
  );
}
