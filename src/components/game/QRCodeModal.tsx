import { useUIStore } from '@/lib/stores/ui-store';
import Image from 'next/image';
import AnimateHeight from 'react-animate-height';

export default function QRCodeModal() {
  const { showQR, setShowQR, qrCodeDataUrl } = useUIStore();

  const handleClose = () => setShowQR(false);

  return (
    <AnimateHeight
      height={showQR ? 'auto' : 0}
      duration={300}
      easing='ease-in-out'
      animateOpacity
    >
      <div
        className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 mt-6'
        onClick={handleClose}
      >
        <div
          className='bg-white rounded-lg p-6 max-w-sm w-full'
          onClick={e => e.stopPropagation()}
        >
          <div className='flex justify-between items-center mb-4'>
            <h3 className='text-lg font-semibold'>Code QR de la Salle</h3>
            <button
              onClick={handleClose}
              className='text-gray-500 hover:text-gray-700 text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors'
              aria-label='Fermer le modal'
            >
              ×
            </button>
          </div>
          {qrCodeDataUrl && (
            <div className='text-center'>
              <Image
                src={qrCodeDataUrl}
                alt='QR Code'
                width={200}
                height={200}
                className='mx-auto mb-4'
              />
              <p className='text-sm text-gray-600'>
                Scannez ce code pour rejoindre la salle
              </p>
            </div>
          )}
        </div>
      </div>
    </AnimateHeight>
  );
}
