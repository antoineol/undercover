import { generateRoomUrl } from '@/domains/room/room-management.service';
import { generateShareButtonTextWithTimeout } from '@/domains/ui/ui-helpers.service';
import { RoomWithPlayers } from '@/lib/convex-types';
import { useUIStore } from '@/lib/stores/ui-store';
import { copyToClipboard } from '@/lib/utils';
import AnimateHeight from 'react-animate-height';
import Button from '../ui/Button';

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
      setShareButtonText('📋 Partager le Lien');
    }, 2000);
  };

  return (
    <AnimateHeight
      height={room.gameState === 'waiting' ? 'auto' : 0}
      duration={300}
      easing='ease-in-out'
      animateOpacity
    >
      {/* Mobile Share Buttons - Fixed */}
      <div className='fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 md:hidden'>
        <div className='flex gap-3'>
          <Button
            onClick={() => setShowQR(!showQR)}
            variant='secondary'
            size='lg'
            className='flex-shrink-0 min-h-[56px] px-6 text-lg'
          >
            📱 QR
          </Button>
          <Button
            onClick={handleShareLink}
            variant='primary'
            size='lg'
            className='flex-1 min-h-[56px] text-lg font-semibold'
          >
            {shareButtonText}
          </Button>
        </div>
      </div>

      {/* Desktop Share Buttons - Normal Flow */}
      <div className='hidden md:block max-w-4xl mx-auto px-4 pb-6'>
        <div className='flex gap-3'>
          <Button
            onClick={() => setShowQR(!showQR)}
            variant='secondary'
            size='lg'
            className='flex-shrink-0 min-h-[56px] px-6 text-lg'
          >
            📱 QR Code
          </Button>
          <Button
            onClick={handleShareLink}
            variant='primary'
            size='lg'
            className='flex-1 min-h-[56px] text-lg font-semibold'
          >
            {shareButtonText}
          </Button>
        </div>
      </div>

      {/* Bottom padding for mobile */}
      <div className='h-24 md:hidden'></div>
    </AnimateHeight>
  );
}
