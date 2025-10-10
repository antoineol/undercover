import { useUIStore } from "@/lib/stores/ui-store";
import Image from "next/image";
import { AnimateHeightSimple } from "~/components/ui/AnimateHeightSimple";

export default function QRCodeModal() {
  const { showQR, setShowQR, qrCodeDataUrl } = useUIStore();

  const handleClose = () => setShowQR(false);

  return (
    <AnimateHeightSimple open={showQR}>
      <div
        className="bg-opacity-50 fixed inset-0 z-50 mt-6 flex items-center justify-center bg-black p-4"
        onClick={handleClose}
      >
        <div
          className="w-full max-w-sm rounded-lg bg-white p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Code QR de la Salle</h3>
            <button
              onClick={handleClose}
              className="flex h-8 w-8 items-center justify-center rounded-full text-xl font-bold text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
              aria-label="Fermer le modal"
            >
              ×
            </button>
          </div>
          {qrCodeDataUrl && (
            <div className="text-center">
              <Image
                src={qrCodeDataUrl}
                alt="QR Code"
                width={200}
                height={200}
                className="mx-auto mb-4"
              />
              <p className="text-sm text-gray-600">
                Scannez ce code pour rejoindre la salle
              </p>
            </div>
          )}
        </div>
      </div>
    </AnimateHeightSimple>
  );
}
