'use client';

import {
  calculateMaxUndercovers,
  calculateVoteData,
  calculateVotingProgress,
  generateRoomUrl,
  getCurrentPlayerByName,
  getCurrentTurnPlayer,
  getGameConfigurationDisplay,
  isDiscussionPhase,
  isMyTurn,
  isVotingPhase,
} from '@/domains/room/room-management.service';
import {
  generateShareButtonTextWithTimeout,
  getGameInstructionsText,
  getMrWhiteGuessingText,
  getStartGameButtonText,
  getWordDisplayText,
} from '@/domains/ui/ui-helpers.service';
import { GAME_CONFIG } from '@/lib/constants';
import { GameRoomProps, RoomWithPlayers } from '@/lib/convex-types';
import { copyToClipboard, retryWithBackoff } from '@/lib/utils';
import { useMutation, useQuery } from 'convex/react';
import Image from 'next/image';
import QRCode from 'qrcode';
import { useEffect, useState } from 'react';
import AnimateHeight from 'react-animate-height';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
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
  const [numMrWhites, setNumMrWhites] = useState(0);
  // const [isValidating, setIsValidating] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [shareButtonText, setShareButtonText] = useState('📋 Partager le Lien');
  const [showQR, setShowQR] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [mrWhiteGuessInput, setMrWhiteGuessInput] = useState('');
  const [isSharingWord, setIsSharingWord] = useState(false);

  const room = useQuery(api.rooms.getRoom, {
    roomCode,
  }) as RoomWithPlayers | null;
  const gameWords = useQuery(
    api.game.getGameWords,
    room ? { roomId: room._id } : 'skip'
  );

  const startGame = useMutation(api.game.startGame);
  const shareWord = useMutation(api.game.shareWord);
  const votePlayer = useMutation(api.game.votePlayer);
  // const validateGameState = useMutation(api.game.validateGameState);
  const restartGame = useMutation(api.game.restartGame);
  const mrWhiteGuess = useMutation(api.game.mrWhiteGuess);
  const stopGame = useMutation(api.game.stopGame);

  const handleStartGame = async () => {
    if (room && isHost) {
      try {
        await retryWithBackoff(() =>
          startGame({
            roomId: room._id,
            numUndercovers,
            numMrWhites,
          })
        );
      } catch (error: unknown) {
        console.error('Failed to start game:', error);
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        alert(`Erreur: ${errorMessage}`);
      }
    }
  };

  const handleStopGame = async () => {
    if (room && isHost) {
      const confirmed = confirm(
        "Êtes-vous sûr de vouloir arrêter le jeu en cours ? Tous les joueurs retourneront à l'écran de configuration."
      );

      if (confirmed) {
        try {
          await retryWithBackoff(() =>
            stopGame({
              roomId: room._id,
            })
          );
        } catch (error: unknown) {
          console.error('Failed to stop game:', error);
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
          alert(`Erreur: ${errorMessage}`);
        }
      }
    }
  };

  const handleShareWord = async () => {
    if (room && wordToShare.trim() && !isSharingWord) {
      const currentPlayer = room.players.find(
        (p: { name: string }) => p.name === playerName
      );
      if (currentPlayer) {
        setIsSharingWord(true);
        try {
          await retryWithBackoff(() =>
            shareWord({
              playerId: currentPlayer._id,
              word: wordToShare.trim(),
            })
          );
          setWordToShare('');
        } catch (error) {
          console.error('Échec du partage du mot:', error);
          alert('Erreur: ' + ((error as Error).message || 'Erreur inconnue'));
        } finally {
          setIsSharingWord(false);
        }
      }
    }
  };

  const handleVote = async (targetId: Id<'players'>) => {
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
              targetId: targetId,
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

  const handleMrWhiteGuess = async () => {
    if (room && mrWhiteGuessInput.trim()) {
      try {
        await mrWhiteGuess({
          roomId: room._id,
          guess: mrWhiteGuessInput.trim(),
        });
        setMrWhiteGuessInput('');
      } catch (error) {
        console.error('Échec de la devinette:', error);
        alert('Erreur: ' + ((error as Error).message || 'Erreur inconnue'));
      }
    }
  };

  const handleShareLink = async () => {
    const roomUrl = generateRoomUrl(roomCode);
    const success = await copyToClipboard(roomUrl);
    const newButtonText = generateShareButtonTextWithTimeout(success, !success);
    setShareButtonText(newButtonText);
    setTimeout(() => {
      setShareButtonText('📋 Partager le Lien');
    }, 2000);
  };

  // const handleValidateGameState = async () => {
  //   if (room && !isValidating) {
  //     setIsValidating(true);
  //     try {
  //       const result = await retryWithBackoff(() =>
  //         validateGameState({ roomId: room._id })
  //       );
  //       const message = getValidationResultMessage(result.action);
  //       alert(message);
  //     } catch (error: unknown) {
  //       console.error('Failed to validate game state after retries:', error);
  //       alert('Failed to validate game state after multiple attempts');
  //     } finally {
  //       setIsValidating(false);
  //     }
  //   }
  // };

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
      const roomUrl = generateRoomUrl(roomCode);
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

  // Use pure functions for business logic calculations
  const currentPlayer = getCurrentPlayerByName(room.players, playerName);
  const alivePlayers = room.players.filter(p => p.isAlive);
  const isVotingPhaseState = isVotingPhase(room);
  const isDiscussionPhaseState = isDiscussionPhase(room);

  // Calculate voting progress using pure function
  const votingProgress = calculateVotingProgress(room.players);

  // Get current turn player using pure function
  const currentTurnPlayer = getCurrentTurnPlayer(room, room.players);
  const isMyTurnState = currentPlayer
    ? isMyTurn(currentPlayer._id, room)
    : false;

  // Calculate vote data using pure function
  const { voteCounts, voterNames } = calculateVoteData(room.players);

  return (
    <div className='min-h-screen bg-gray-100'>
      <GameHeader
        room={room}
        onLeave={onLeave}
        onToggleConfig={handleToggleConfig}
        showConfig={showConfig}
      />

      <div className='max-w-4xl mx-auto px-4 py-6 flex flex-col mb-10'>
        {/* Start Game Button - Host Only, at top of content */}
        <AnimateHeight
          height={isHost && room.gameState === 'waiting' ? 'auto' : 0}
          duration={300}
          easing='ease-in-out'
          animateOpacity
        >
          <div className='flex flex-col mt-6'>
            <Button
              onClick={handleStartGame}
              disabled={room.players.length < 3}
              variant='success'
              size='lg'
              className='w-full min-h-[56px] text-lg font-semibold'
            >
              {getStartGameButtonText(room.players.length)}
            </Button>

            {/* Game Configuration - Host Only, Collapsible with Animation */}
            <AnimateHeight
              height={showConfig ? 'auto' : 0}
              duration={300}
              easing='ease-in-out'
              animateOpacity
            >
              <Card className='bg-yellow-50 mt-6'>
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
                      max={calculateMaxUndercovers(room.players.length)}
                      value={numUndercovers}
                      onChange={e =>
                        setNumUndercovers(parseInt(e.target.value))
                      }
                      className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer'
                    />
                    <div className='flex justify-between text-xs text-gray-500 mt-1'>
                      <span>1</span>
                      <span>
                        Max: {calculateMaxUndercovers(room.players.length)}
                      </span>
                    </div>
                  </div>

                  {/* Number of Mr. Whites */}
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Nombre de Mr. White: {numMrWhites}
                    </label>
                    <input
                      type='range'
                      min='0'
                      max={Math.max(
                        0,
                        room.players.length - numUndercovers - 1
                      )}
                      value={numMrWhites}
                      onChange={e => setNumMrWhites(parseInt(e.target.value))}
                      className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer'
                    />
                    <div className='flex justify-between text-xs text-gray-500 mt-1'>
                      <span>0</span>
                      <span>
                        Max:{' '}
                        {Math.max(0, room.players.length - numUndercovers - 1)}
                      </span>
                    </div>
                    <p className='text-xs text-gray-600 mt-1'>
                      Mr. White ne connaît aucun mot
                    </p>
                  </div>

                  {/* Validation Info */}
                  <div className='bg-gray-100 rounded p-3 text-sm'>
                    <div className='font-medium mb-1'>
                      Configuration actuelle:
                    </div>
                    <div className='whitespace-pre-line'>
                      {getGameConfigurationDisplay({
                        numUndercovers,
                        numMrWhites,
                        totalPlayers: room.players.length,
                      })}
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
        >
          <div className='flex flex-col mt-6'>
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
            >
              <div className='bg-gray-50 p-4 rounded-lg mt-4'>
                <div>
                  <span className='text-lg font-bold text-blue-600'>
                    {getWordDisplayText(
                      currentPlayer?.role || '',
                      gameWords
                        ? {
                            civilianWord: gameWords.civilianWord,
                            undercoverWord: gameWords.undercoverWord,
                          }
                        : null
                    )}
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
          currentPlayer={currentPlayer}
          wordToShare={wordToShare}
          setWordToShare={setWordToShare}
          onShareWord={handleShareWord}
          isMyTurn={isMyTurnState}
          currentTurnPlayer={currentTurnPlayer || undefined}
          alivePlayers={alivePlayers}
          isSubmitting={isSharingWord}
        />

        {/* Mr. White Guessing Phase */}
        <AnimateHeight
          height={room.gameState === 'mr_white_guessing' ? 'auto' : 0}
          duration={300}
          easing='ease-in-out'
          animateOpacity
        >
          <Card className='bg-yellow-50 border-yellow-200 mt-6'>
            <div className='text-center'>
              {(() => {
                const mrWhiteText = getMrWhiteGuessingText();
                return (
                  <>
                    <h3 className='text-lg font-semibold mb-4 text-yellow-800'>
                      {mrWhiteText.title}
                    </h3>
                    <p className='text-sm text-yellow-700 mb-4'>
                      {mrWhiteText.description}
                    </p>
                    <div className='flex flex-col gap-3 max-w-md mx-auto'>
                      <input
                        type='text'
                        value={mrWhiteGuessInput}
                        onChange={e => setMrWhiteGuessInput(e.target.value)}
                        placeholder={mrWhiteText.placeholder}
                        className='px-4 py-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent'
                        maxLength={GAME_CONFIG.MAX_WORD_LENGTH}
                      />
                      <Button
                        onClick={handleMrWhiteGuess}
                        variant='primary'
                        disabled={!mrWhiteGuessInput.trim()}
                        className='bg-yellow-600 hover:bg-yellow-700'
                      >
                        {mrWhiteText.buttonText}
                      </Button>
                    </div>
                  </>
                );
              })()}
            </div>
          </Card>
        </AnimateHeight>
        <AnimateHeight
          height={currentPlayer ? 'auto' : 0}
          duration={300}
          easing='ease-in-out'
          animateOpacity
        >
          <PlayerList
            room={room}
            currentPlayer={currentPlayer}
            playerName={playerName}
            isVotingPhase={isVotingPhaseState}
            isDiscussionPhase={isDiscussionPhaseState}
            currentTurnPlayerId={currentTurnPlayer?._id}
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
        >
          <Card className='bg-blue-50 mt-6'>
            <h3 className='text-lg font-semibold mb-2'>Comment Jouer</h3>
            <ul className='text-sm text-gray-700 space-y-1'>
              {getGameInstructionsText().map((instruction, index) => (
                <li key={index}>{instruction}</li>
              ))}
            </ul>
          </Card>
        </AnimateHeight>
        {/* QR Code Modal */}
        <AnimateHeight
          height={showQR ? 'auto' : 0}
          duration={300}
          easing='ease-in-out'
          animateOpacity
        >
          <div
            className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 mt-6'
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

        {/* Show validate button for non-waiting states */}
        {/* <AnimateHeight
          height={room.gameState !== 'waiting' ? 'auto' : 0}
          duration={300}
          easing='ease-in-out'
          animateOpacity
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
        </AnimateHeight> */}
      </div>

      {/* Share Buttons - Fixed on Mobile, Normal Flow on Desktop */}
      <AnimateHeight
        height={room.gameState === 'waiting' ? 'auto' : 0}
        duration={300}
        easing='ease-in-out'
        animateOpacity
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

      {/* Discrete Stop Game Button - Host Only, during active gameplay */}
      {isHost &&
        room.gameState !== 'waiting' &&
        room.gameState !== 'results' && (
          <div className='fixed bottom-4 left-4 z-10'>
            <Button
              onClick={handleStopGame}
              variant='secondary'
              size='sm'
              className='text-xs text-gray-600 hover:text-red-600 hover:bg-red-50 border-gray-300'
              title='Arrêter le jeu et retourner à la configuration'
            >
              Arrêter le jeu
            </Button>
          </div>
        )}
    </div>
  );
}
