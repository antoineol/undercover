import { AnimateHeightSimple } from "~/components/ui/AnimateHeightSimple";
import { RoomQRCode } from "../join-room/RoomQRCode";

export interface QRCodeModalProps {
  open: boolean;
  handleClose: () => void;
}

export default function QRCodeModal({ open, handleClose }: QRCodeModalProps) {
  return (
    <AnimateHeightSimple open={open}>
      <div
        className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4"
        onClick={handleClose}
      >
        <div
          className="w-full max-w-sm rounded-lg bg-white p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Code QR de la Salle</h3>
            <button
              onClick={handleClose}
              className="flex h-8 w-8 items-center justify-center rounded-full text-xl font-bold text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
              aria-label="Fermer le modal"
            >
              ×
            </button>
          </div>
          <RoomQRCode />
        </div>
      </div>
    </AnimateHeightSimple>
  );
}
