"use client";

import { useUIStore } from "@/lib/stores/ui-store";
import Image from "next/image";
import QRCode from "qrcode";
import { useEffect } from "react";

export function RoomQRCode() {
  const { qrCodeDataUrl, setQrCodeDataUrl } = useUIStore();

  useEffect(() => {
    const generateQRCode = async () => {
      const roomUrl = `${window.location.origin}${window.location.pathname}`;
      try {
        const qrDataUrl = await QRCode.toDataURL(roomUrl, {
          width: 150,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        });
        setQrCodeDataUrl(qrDataUrl);
      } catch (error) {
        console.error("Failed to generate QR code:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        alert(`Erreur: ${errorMessage}`);
      }
    };

    void generateQRCode();
  }, [setQrCodeDataUrl]);

  if (!qrCodeDataUrl) {
    return null;
  }

  return (
    <div className="mt-6 text-center">
      <Image
        src={qrCodeDataUrl}
        alt="QR Code"
        width={150}
        height={150}
        className="mx-auto"
      />
      <p className="mt-2 text-sm text-gray-600">Scannez pour rejoindre</p>
    </div>
  );
}
