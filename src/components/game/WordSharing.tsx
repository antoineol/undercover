import { calculateSharingProgress } from '@/domains/ui/ui-helpers.service';
import { UI_MESSAGES } from '@/lib/constants';
import { Player, Room } from '@/lib/types';
import { validateSharedWord } from '@/lib/validation';
import { useMutation } from 'convex/react';
import { useEffect } from 'react';
import AnimateHeight from 'react-animate-height';
import { api } from '../../../convex/_generated/api';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Input from '../ui/Input';
import ProgressBar from '../ui/ProgressBar';

interface WordSharingProps {
  room: Room;
  currentPlayer: Player | null;
  wordToShare: string;
  setWordToShare: (word: string) => void;
  onShareWord: () => void;
  isMyTurn: boolean;
  currentTurnPlayer?: Player;
  alivePlayers: Player[];
  isSubmitting?: boolean;
}

// Internal component that handles the word sharing logic
function WordSharingContent({
  room,
  currentPlayer,
  wordToShare,
  setWordToShare,
  onShareWord,
  isMyTurn,
  currentTurnPlayer,
  alivePlayers,
  isSubmitting = false,
}: WordSharingProps) {
  const hasSharedWord = currentPlayer?.hasSharedWord || false;
  const playersWhoShared = room.players.filter(
    p => p.isAlive && p.hasSharedWord
  ).length;
  const sharingProgress = calculateSharingProgress(
    playersWhoShared,
    alivePlayers.length
  );

  // Robust check: if it's my turn but I've already shared, there's a data inconsistency
  // This can happen due to race conditions or data sync issues
  const isDataInconsistent = isMyTurn && hasSharedWord;

  // Auto-fix the inconsistency
  const fixDataInconsistency = useMutation(
    api.game_management.fixDataInconsistency
  );

  useEffect(() => {
    if (isDataInconsistent && room._id) {
      // Automatically try to fix the inconsistency
      fixDataInconsistency({ roomId: room._id as any }).catch(console.error);
    }
  }, [isDataInconsistent, room._id, fixDataInconsistency]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate the word before sharing
    const validation = validateSharedWord(wordToShare);
    if (!validation.isValid) {
      alert(validation.error);
      return;
    }

    onShareWord();
  };

  return (
    <div className='flex flex-col gap-6 mt-6'>
      <ProgressBar progress={sharingProgress} />

      <div className='flex flex-col'>
        <AnimateHeight
          height={isMyTurn ? 'auto' : 0}
          duration={300}
          easing='ease-in-out'
          animateOpacity
        >
          <div className='p-3 bg-blue-50 rounded-lg'>
            <p className='text-blue-800 font-medium'>
              <span className='animate-pulse'>🎯</span> C&apos;est votre tour de
              partager un mot
            </p>
            {isDataInconsistent && (
              <p className='text-blue-600 text-sm mt-2'>
                🔄 Correction automatique en cours...
              </p>
            )}
          </div>
        </AnimateHeight>

        <AnimateHeight
          height={!isMyTurn ? 'auto' : 0}
          duration={300}
          easing='ease-in-out'
          animateOpacity
        >
          <div className='bg-yellow-50 p-3 rounded-lg mt-6'>
            <p className='text-yellow-800'>
              ⏳ En attente que {currentTurnPlayer?.name} partage son mot...
            </p>
          </div>
        </AnimateHeight>

        <AnimateHeight
          height={
            isMyTurn && !hasSharedWord && !isDataInconsistent ? 'auto' : 0
          }
          duration={300}
          easing='ease-in-out'
          animateOpacity
        >
          <Card className='flex flex-col gap-4 mt-6'>
            <p className='text-gray-700'>
              Décrivez votre mot en un seul mot sans le révéler directement.
            </p>
            <form onSubmit={handleSubmit}>
              <div className='flex space-x-2'>
                <Input
                  type='text'
                  value={wordToShare}
                  onChange={e => setWordToShare(e.target.value)}
                  placeholder='Votre mot descriptif...'
                  maxLength={20}
                  className='flex-1'
                  autoFocus
                />
                <Button
                  type='submit'
                  disabled={!wordToShare.trim() || isSubmitting}
                >
                  {isSubmitting
                    ? 'Partage en cours...'
                    : UI_MESSAGES.BUTTONS.SHARE_WORD}
                </Button>
              </div>
            </form>
          </Card>
        </AnimateHeight>
      </div>
    </div>
  );
}

// Wrapper component that uses AnimateHeight instead of early return
export default function WordSharing(props: WordSharingProps) {
  const { room, currentPlayer } = props;
  const shouldShow = currentPlayer && room.gameState === 'discussion';

  return (
    <AnimateHeight
      height={shouldShow ? 'auto' : 0}
      duration={300}
      easing='ease-in-out'
      animateOpacity
    >
      <WordSharingContent {...props} />
    </AnimateHeight>
  );
}
