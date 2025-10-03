import { UI_MESSAGES } from '@/lib/constants';
import { Player, Room } from '@/lib/types';
import { validateSharedWord } from '@/lib/validation';
import { calculateSharingProgress } from '@/domains/ui/ui-helpers.service';
import AnimateHeight from 'react-animate-height';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Input from '../ui/Input';

interface WordSharingProps {
  room: Room;
  currentPlayer: Player;
  wordToShare: string;
  setWordToShare: (word: string) => void;
  onShareWord: () => void;
  isMyTurn: boolean;
  currentTurnPlayer?: Player;
  alivePlayers: Player[];
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
}: WordSharingProps) {
  const hasSharedWord = currentPlayer.hasSharedWord || false;
  const playersWhoShared = room.players.filter(
    p => p.isAlive && p.hasSharedWord
  ).length;
  const sharingProgress = calculateSharingProgress(
    playersWhoShared,
    alivePlayers.length
  );

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
    <div className='flex flex-col gap-6'>
      <div className='w-full bg-gray-200 rounded-full h-2'>
        <div
          className='bg-blue-600 h-2 rounded-full transition-all duration-300'
          style={{ width: `${sharingProgress}%` }}
        />
      </div>

      <div className='flex flex-col gap-6'>
        <AnimateHeight
          height={isMyTurn ? 'auto' : 0}
          duration={300}
          easing='ease-in-out'
          animateOpacity
          className='contents'
        >
          <div className='p-3 bg-blue-50 rounded-lg'>
            <p className='text-blue-800 font-medium'>
              <span className='animate-pulse'>🎯</span> C&apos;est votre tour de
              partager un mot
            </p>
          </div>
        </AnimateHeight>

        <AnimateHeight
          height={!isMyTurn ? 'auto' : 0}
          duration={300}
          easing='ease-in-out'
          animateOpacity
          className='contents'
        >
          <div className='bg-yellow-50 p-3 rounded-lg'>
            <p className='text-yellow-800'>
              ⏳ En attente que {currentTurnPlayer?.name} partage son mot...
            </p>
          </div>
        </AnimateHeight>

        <AnimateHeight
          height={isMyTurn && !hasSharedWord ? 'auto' : 0}
          duration={300}
          easing='ease-in-out'
          animateOpacity
          className='contents'
        >
          <Card className='flex flex-col gap-4'>
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
                <Button type='submit' disabled={!wordToShare.trim()}>
                  {UI_MESSAGES.BUTTONS.SHARE_WORD}
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
  const shouldShow = room.gameState === 'discussion' && currentPlayer;

  return (
    <AnimateHeight
      height={shouldShow ? 'auto' : 0}
      duration={300}
      easing='ease-in-out'
      animateOpacity
      className='contents'
    >
      <WordSharingContent {...props} />
    </AnimateHeight>
  );
}
