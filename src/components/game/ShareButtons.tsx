import { useUIStore } from "@/lib/stores/ui-store";
import { useRoomSafe } from "~/app/room/[roomCode]/_utils/utils";
import { AnimateHeightSimple } from "~/components/ui/AnimateHeightSimple";
import Button from "../ui/Button";
import ShareButton from "./ShareButton";

export default function ShareButtons() {
  const room = useRoomSafe();
  const { showQR, setShowQR } = useUIStore();

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
          <ShareButton className="min-h-[56px] flex-1 text-lg font-semibold" />
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
          <ShareButton className="min-h-[56px] flex-1 text-lg font-semibold" />
        </div>
      </div>

      {/* Bottom padding for mobile */}
      <div className="h-24 md:hidden"></div>
    </AnimateHeightSimple>
  );
}
