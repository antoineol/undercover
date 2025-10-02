import { UI_MESSAGES } from '@/lib/constants';
import { Player, Room } from '@/lib/types';
import { validateSharedWord } from '@/lib/validation';
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

export default function WordSharing({
  room,
  currentPlayer,
  wordToShare,
  setWordToShare,
  onShareWord,
  isMyTurn,
  currentTurnPlayer,
  alivePlayers,
}: WordSharingProps) {
  if (room.gameState !== 'discussion' || !currentPlayer) {
    return null;
  }

  const hasSharedWord = currentPlayer.hasSharedWord || false;
  const playersWhoShared = room.players.filter(
    (p: any) => p.isAlive && p.hasSharedWord
  ).length;
  const sharingProgress =
    alivePlayers.length > 0
      ? (playersWhoShared / alivePlayers.length) * 100
      : 0;

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

      <AnimateHeight
        height={'auto'}
        duration={300}
        easing='ease-in-out'
        animateOpacity
        contentClassName='flex flex-col gap-6'
      >
        {isMyTurn ? (
          <div className='p-3 bg-blue-50 rounded-lg'>
            <p className='text-blue-800 font-medium'>
              <span className='animate-pulse'>🎯</span> C&apos;est votre tour de
              partager un mot
            </p>
          </div>
        ) : (
          <div className='bg-yellow-50 p-3 rounded-lg'>
            <p className='text-yellow-800'>
              ⏳ En attente que {currentTurnPlayer?.name} partage son mot...
            </p>
          </div>
        )}

        {isMyTurn && !hasSharedWord && (
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
        )}
      </AnimateHeight>
    </div>
  );
}
