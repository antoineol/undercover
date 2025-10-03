'use client';

import { UI_MESSAGES } from '@/lib/constants';
import { GameRoomProps } from '@/lib/types';
import { copyToClipboard, retryWithBackoff } from '@/lib/utils';
import { useMutation, useQuery } from 'convex/react';
import Image from 'next/image';
import QRCode from 'qrcode';
import { useEffect, useState } from 'react';
import AnimateHeight from 'react-animate-height';
import { api } from '../../convex/_generated/api';
import GameHeader from './game/GameHeader';
import GameResults from './game/GameResults';
import PlayerList from './game/PlayerList';
import WordSharing from './game/WordSharing';
import Button from './ui/Button';
import Card from './ui/Card';

export default function GameRoom({
  roomCode,
  playerName,
  isHost,
  onLeave,
}: GameRoomProps) {
  const [showWords, setShowWords] = useState(false);
  const [wordToShare, setWordToShare] = useState('');
  const [numUndercovers, setNumUndercovers] = useState(1);
  const [hasMrWhite, setHasMrWhite] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [shareButtonText, setShareButtonText] = useState('📋 Partager le Lien');
  const [showQR, setShowQR] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');

  const room = useQuery(api.rooms.getRoom, { roomCode });
  const gameWords = useQuery(
    api.game.getGameWords,
    room ? { roomId: room._id } : 'skip'
  );

  const startGame = useMutation(api.game.startGame);
  const shareWord = useMutation(api.game.shareWord);
  const votePlayer = useMutation(api.game.votePlayer);
  const validateGameState = useMutation(api.game.validateGameState);
  const restartGame = useMutation(api.game.restartGame);

  const handleStartGame = async () => {
    if (room && isHost) {
      try {
        await retryWithBackoff(() =>
          startGame({
            roomId: room._id,
            numUndercovers,
            hasMrWhite,
          })
        );
      } catch (error: any) {
        console.error('Failed to start game:', error);
        alert(`Erreur: ${error.message}`);
      }
    }
  };

  const handleShareWord = async () => {
    if (room && wordToShare.trim()) {
      const currentPlayer = room.players.find(
        (p: { name: string }) => p.name === playerName
      );
      if (currentPlayer) {
        try {
          await shareWord({
            playerId: currentPlayer._id,
            word: wordToShare.trim(),
          });
          setWordToShare('');
        } catch (error) {
          console.error('Échec du partage du mot:', error);
          alert('Erreur: ' + ((error as Error).message || 'Erreur inconnue'));
        }
      }
    }
  };

  const handleVote = async (targetId: string) => {
    if (room) {
      const currentPlayer = room.players.find(
        (p: { name: string }) => p.name === playerName
      );
      if (currentPlayer) {
        try {
          await retryWithBackoff(() =>
            votePlayer({
              roomId: room._id,
              voterId: currentPlayer._id,
              targetId: targetId as any,
            })
          );
        } catch (error) {
          console.error('Échec du vote:', error);
          alert(
            'Erreur lors du vote: ' +
              ((error as Error).message || 'Erreur inconnue')
          );
        }
      }
    }
  };

  const handleShareLink = async () => {
    const roomUrl = `${window.location.origin}/room/${roomCode}`;
    const success = await copyToClipboard(roomUrl);
    if (success) {
      setShareButtonText('✅ Lien copié !');
      setTimeout(() => {
        setShareButtonText('📋 Partager le Lien');
      }, 2000);
    } else {
      setShareButtonText('❌ Erreur de copie');
      setTimeout(() => {
        setShareButtonText('📋 Partager le Lien');
      }, 2000);
    }
  };

  const handleValidateGameState = async () => {
    if (room && !isValidating) {
      setIsValidating(true);
      try {
        const result = await retryWithBackoff(() =>
          validateGameState({ roomId: room._id })
        );
        if (result.action !== 'no_action_needed') {
          if (result.action === 'skipped_dead_player') {
            alert('Joueur mort ignoré - passage au joueur suivant');
          } else {
            alert(`Game state fixed: ${result.action}`);
          }
        } else {
          alert('Game state is valid - no action needed');
        }
      } catch (error: any) {
        console.error('Failed to validate game state after retries:', error);
        alert('Failed to validate game state after multiple attempts');
      } finally {
        setIsValidating(false);
      }
    }
  };

  const handleRestartGame = async () => {
    if (room && isHost) {
      try {
        await restartGame({ roomId: room._id });
      } catch (error) {
        console.error('Failed to restart game:', error);
        alert('Échec du redémarrage du jeu');
      }
    }
  };

  const handleToggleConfig = () => {
    setShowConfig(!showConfig);
  };

  const handleShowQR = async () => {
    if (!showQR) {
      const roomUrl = `${window.location.origin}/room/${roomCode}`;
      try {
        const qrDataUrl = await QRCode.toDataURL(roomUrl, {
          width: 200,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        });
        setQrCodeDataUrl(qrDataUrl);
      } catch (error) {
        console.error('Failed to generate QR code:', error);
      }
    }
    setShowQR(!showQR);
  };

  const handleCloseQR = () => {
    setShowQR(false);
  };

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showQR) {
        handleCloseQR();
      }
    };

    if (showQR) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [showQR]);

  if (!room) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p className='text-gray-600'>Chargement de la salle...</p>
        </div>
      </div>
    );
  }

  const currentPlayer = room.players.find(
    (p: { name: string }) => p.name === playerName
  );
  const alivePlayers = room.players.filter((p: any) => p.isAlive);
  const isVotingPhase = room.gameState === 'voting';
  const isDiscussionPhase = room.gameState === 'discussion';

  // Calculate voting progress (only alive players)
  const playersWhoVoted = alivePlayers.filter((p: any) => p.votes.length > 0);
  const votingProgress =
    alivePlayers.length > 0
      ? (playersWhoVoted.length / alivePlayers.length) * 100
      : 0;

  // Get current player whose turn it is to share word
  const currentTurnPlayerId = room.playerOrder?.[room.currentPlayerIndex || 0];
  const currentTurnPlayer = room.players.find(
    (p: { _id: string }) => p._id === currentTurnPlayerId
  );
  const isMyTurn = currentTurnPlayerId === currentPlayer?._id;

  // Get vote counts for display
  const voteCounts: Record<string, number> = {};
  const voterNames: Record<string, string[]> = {};

  alivePlayers.forEach((player: { votes: string[]; name: string }) => {
    player.votes.forEach((voteId: string) => {
      voteCounts[voteId] = (voteCounts[voteId] || 0) + 1;
      if (!voterNames[voteId]) voterNames[voteId] = [];
      voterNames[voteId].push(player.name);
    });
  });

  return (
    <div className='min-h-screen bg-gray-100'>
      <GameHeader
        room={room}
        onLeave={onLeave}
        onToggleConfig={handleToggleConfig}
        showConfig={showConfig}
      />

      <div className='max-w-4xl mx-auto px-4 py-6 flex flex-col gap-6'>
        {/* Start Game Button - Host Only, at top of content */}
        <AnimateHeight
          height={isHost && room.gameState === 'waiting' ? 'auto' : 0}
          duration={300}
          easing='ease-in-out'
          animateOpacity
          className='contents'
        >
          <div className='flex flex-col gap-6'>
            <Button
              onClick={handleStartGame}
              disabled={room.players.length < 3}
              variant='success'
              size='lg'
              className='w-full min-h-[56px] text-lg font-semibold'
            >
              {UI_MESSAGES.BUTTONS.START_GAME} ({room.players.length}/3+)
            </Button>

            {/* Game Configuration - Host Only, Collapsible with Animation */}
            <AnimateHeight
              height={showConfig ? 'auto' : 0}
              duration={300}
              easing='ease-in-out'
              animateOpacity
              className='contents'
            >
              <Card className='bg-yellow-50'>
                <h3 className='text-lg font-semibold mb-4'>
                  ⚙️ Configuration du Jeu
                </h3>

                <div className='space-y-4'>
                  {/* Number of Undercovers */}
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Nombre d&apos;Undercovers: {numUndercovers}
                    </label>
                    <input
                      type='range'
                      min='1'
                      max={Math.min(
                        Math.floor(room.players.length / 2),
                        room.players.length - 1
                      )}
                      value={numUndercovers}
                      onChange={e =>
                        setNumUndercovers(parseInt(e.target.value))
                      }
                      className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer'
                    />
                    <div className='flex justify-between text-xs text-gray-500 mt-1'>
                      <span>1</span>
                      <span>
                        Max:{' '}
                        {Math.min(
                          Math.floor(room.players.length / 2),
                          room.players.length - 1
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Mr. White Toggle */}
                  <div>
                    <label className='flex items-center space-x-3'>
                      <input
                        type='checkbox'
                        checked={hasMrWhite}
                        onChange={e => setHasMrWhite(e.target.checked)}
                        className='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500'
                      />
                      <span className='text-sm font-medium text-gray-700'>
                        Inclure Mr. White (ne connaît aucun mot)
                      </span>
                    </label>
                  </div>

                  {/* Validation Info */}
                  <div className='bg-gray-100 rounded p-3 text-sm'>
                    <div className='font-medium mb-1'>
                      Configuration actuelle:
                    </div>
                    <div>
                      • {numUndercovers} Undercover
                      {numUndercovers > 1 ? 's' : ''}
                    </div>
                    <div>
                      • {hasMrWhite ? '1 Mr. White' : 'Pas de Mr. White'}
                    </div>
                    <div>
                      •{' '}
                      {room.players.length -
                        numUndercovers -
                        (hasMrWhite ? 1 : 0)}{' '}
                      Civil
                      {room.players.length -
                        numUndercovers -
                        (hasMrWhite ? 1 : 0) >
                      1
                        ? 's'
                        : ''}
                    </div>
                  </div>
                </div>
              </Card>
            </AnimateHeight>
          </div>
        </AnimateHeight>
        <GameResults
          room={room}
          isHost={isHost}
          onRestartGame={handleRestartGame}
        />

        {/* Game Words (for current player) */}
        <AnimateHeight
          height={
            room.gameState !== 'waiting' && currentPlayer && gameWords
              ? 'auto'
              : 0
          }
          duration={300}
          easing='ease-in-out'
          animateOpacity
          className='contents'
        >
          <div className='flex flex-col gap-4'>
            <div className='flex justify-between items-center'>
              <Button
                onClick={() => setShowWords(!showWords)}
                variant='primary'
              >
                {showWords ? 'Masquer' : 'Afficher'} le Mot
              </Button>
            </div>

            <AnimateHeight
              height={showWords ? 'auto' : 0}
              duration={300}
              easing='ease-in-out'
              animateOpacity
              className='contents'
            >
              <div className='bg-gray-50 p-4 rounded-lg'>
                <div>
                  <span className='text-lg font-bold text-blue-600'>
                    {currentPlayer?.role === 'undercover'
                      ? gameWords?.undercoverWord
                      : currentPlayer?.role === 'mr_white'
                        ? 'Vous êtes Mr. White.'
                        : gameWords?.civilianWord}
                  </span>
                </div>
              </div>
            </AnimateHeight>
          </div>
        </AnimateHeight>

        {/* <GameStats
          room={room}
          alivePlayers={alivePlayers}
          votingProgress={votingProgress}
          playersWhoVoted={playersWhoVoted}
          currentPlayer={currentPlayer}
        /> */}
        <WordSharing
          room={room}
          currentPlayer={currentPlayer!}
          wordToShare={wordToShare}
          setWordToShare={setWordToShare}
          onShareWord={handleShareWord}
          isMyTurn={isMyTurn}
          currentTurnPlayer={currentTurnPlayer}
          alivePlayers={alivePlayers}
        />
        <AnimateHeight
          height={currentPlayer ? 'auto' : 0}
          duration={300}
          easing='ease-in-out'
          animateOpacity
          className='contents'
        >
          <PlayerList
            room={room}
            currentPlayer={currentPlayer!}
            playerName={playerName}
            isVotingPhase={isVotingPhase}
            isDiscussionPhase={isDiscussionPhase}
            currentTurnPlayerId={currentTurnPlayerId}
            voteCounts={voteCounts}
            voterNames={voterNames}
            onVote={handleVote}
            votingProgress={votingProgress}
          />
        </AnimateHeight>

        {/* Game Instructions */}
        <AnimateHeight
          height={room.gameState === 'waiting' ? 'auto' : 0}
          duration={300}
          easing='ease-in-out'
          animateOpacity
          className='contents'
        >
          <Card className='bg-blue-50'>
            <h3 className='text-lg font-semibold mb-2'>Comment Jouer</h3>
            <ul className='text-sm text-gray-700 space-y-1'>
              <li>• 3-10 joueurs peuvent rejoindre cette salle</li>
              <li>• La plupart des joueurs sont des Civils avec un mot</li>
              <li>• 1-3 joueurs sont Undercovers avec un mot différent</li>
              <li>• Mr. White (4+ joueurs) ne connaît aucun mot</li>
              <li>• Discutez et votez contre les joueurs suspects</li>
              <li>• Les Civils gagnent en éliminant tous les Undercovers</li>
              <li>
                • Les Undercovers gagnent en survivant ou en surpassant les
                Civils
              </li>
            </ul>
          </Card>
        </AnimateHeight>
        {/* QR Code Modal */}
        <AnimateHeight
          height={showQR ? 'auto' : 0}
          duration={300}
          easing='ease-in-out'
          animateOpacity
          className='contents'
        >
          <div
            className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
            onClick={handleCloseQR}
          >
            <div
              className='bg-white rounded-lg p-6 max-w-sm w-full'
              onClick={e => e.stopPropagation()}
            >
              <div className='flex justify-between items-center mb-4'>
                <h3 className='text-lg font-semibold'>Code QR de la Salle</h3>
                <button
                  onClick={handleCloseQR}
                  className='text-gray-500 hover:text-gray-700 text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors'
                  aria-label='Fermer le modal'
                >
                  ×
                </button>
              </div>
              <AnimateHeight
                height={qrCodeDataUrl ? 'auto' : 0}
                duration={300}
                easing='ease-in-out'
                animateOpacity
                className='contents'
              >
                <div className='text-center'>
                  <Image
                    src={qrCodeDataUrl!}
                    alt='QR Code'
                    width={200}
                    height={200}
                    className='mx-auto mb-4'
                  />
                  <p className='text-sm text-gray-600'>
                    Scannez ce code pour rejoindre la salle
                  </p>
                </div>
              </AnimateHeight>
            </div>
          </div>
        </AnimateHeight>

        {/* Show validate button for non-waiting states */}
        <AnimateHeight
          height={room.gameState !== 'waiting' ? 'auto' : 0}
          duration={300}
          easing='ease-in-out'
          animateOpacity
          className='contents'
        >
          <Button
            onClick={handleValidateGameState}
            disabled={isValidating}
            variant='warning'
            size='md'
            className='flex-shrink-0 min-h-[44px] px-4 mt-20'
            title="Valider et corriger l'état du jeu"
          >
            {isValidating
              ? UI_MESSAGES.BUTTONS.VALIDATING
              : UI_MESSAGES.BUTTONS.VALIDATE_GAME}
          </Button>
        </AnimateHeight>
      </div>

      {/* Share Buttons - Fixed on Mobile, Normal Flow on Desktop */}
      <AnimateHeight
        height={room.gameState === 'waiting' ? 'auto' : 0}
        duration={300}
        easing='ease-in-out'
        animateOpacity
        className='contents'
      >
        <div className='fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 md:hidden'>
          <div className='flex gap-3'>
            <Button
              onClick={handleShowQR}
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
              onClick={handleShowQR}
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
      </AnimateHeight>

      {/* Bottom padding for mobile to prevent content from being hidden behind fixed buttons */}
      <div className='h-24 md:hidden'></div>
    </div>
  );
}
