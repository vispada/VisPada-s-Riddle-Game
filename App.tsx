import React, { useState, useCallback, useEffect } from 'react';
import { GameState, Riddle, TimerDuration, Theme } from './types';
import { generateRiddles, verifyImage, generateHint } from './services/geminiService';
import { TOTAL_RIDDLES, STORAGE_KEY_RIDDLES, STORAGE_KEY_INDEX, STORAGE_KEY_TIMER_DURATION, STORAGE_KEY_SCORE, STORAGE_KEY_SKIPS, POINTS_PER_RIDDLE, HINT_COST, MAX_SKIPS, SKIP_COST } from './constants';
import StartScreen from './components/StartScreen';
import GameScreen from './components/GameScreen';
import EndScreen from './components/EndScreen';
import TimeUpScreen from './components/TimeUpScreen';
import Header from './components/Header';
import { playSound } from './services/soundService';

function App() {
  const [gameState, setGameState] = useState<GameState>('start');
  const [riddles, setRiddles] = useState<Riddle[]>([]);
  const [currentRiddleIndex, setCurrentRiddleIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [skipsLeft, setSkipsLeft] = useState<number>(MAX_SKIPS);
  const [timerDuration, setTimerDuration] = useState<TimerDuration>(0);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isHintLoading, setIsHintLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; isCorrect: boolean } | null>(null);

  // Load game state from localStorage on initial mount
  useEffect(() => {
    try {
      const savedRiddlesRaw = localStorage.getItem(STORAGE_KEY_RIDDLES);
      const savedIndexRaw = localStorage.getItem(STORAGE_KEY_INDEX);
      const savedTimerDurationRaw = localStorage.getItem(STORAGE_KEY_TIMER_DURATION);
      const savedScoreRaw = localStorage.getItem(STORAGE_KEY_SCORE);
      const savedSkipsRaw = localStorage.getItem(STORAGE_KEY_SKIPS);

      if (savedRiddlesRaw && savedIndexRaw && savedTimerDurationRaw && savedScoreRaw && savedSkipsRaw) {
        const savedRiddles = JSON.parse(savedRiddlesRaw);
        const savedIndex = JSON.parse(savedIndexRaw);
        const savedTimerDuration = JSON.parse(savedTimerDurationRaw) as TimerDuration;
        const savedScore = JSON.parse(savedScoreRaw);
        const savedSkips = JSON.parse(savedSkipsRaw);

        if (Array.isArray(savedRiddles) && savedRiddles.length > 0 && typeof savedIndex === 'number' && savedIndex < savedRiddles.length && typeof savedScore === 'number' && typeof savedSkips === 'number') {
          setRiddles(savedRiddles);
          setCurrentRiddleIndex(savedIndex);
          setTimerDuration(savedTimerDuration);
          setScore(savedScore);
          setSkipsLeft(savedSkips);
          if (savedTimerDuration > 0) {
            setTimeLeft(savedTimerDuration);
          }
          setGameState('playing');
        }
      }
    } catch (e) {
      console.error("Failed to load saved game state from localStorage", e);
      // Clear potentially corrupted storage
      localStorage.removeItem(STORAGE_KEY_RIDDLES);
      localStorage.removeItem(STORAGE_KEY_INDEX);
      localStorage.removeItem(STORAGE_KEY_TIMER_DURATION);
      localStorage.removeItem(STORAGE_KEY_SCORE);
      localStorage.removeItem(STORAGE_KEY_SKIPS);
    }
  }, []);

  // Save progress to localStorage whenever it changes while playing
  useEffect(() => {
    if (gameState === 'playing' && riddles.length > 0) {
      localStorage.setItem(STORAGE_KEY_RIDDLES, JSON.stringify(riddles));
      localStorage.setItem(STORAGE_KEY_INDEX, JSON.stringify(currentRiddleIndex));
      localStorage.setItem(STORAGE_KEY_TIMER_DURATION, JSON.stringify(timerDuration));
      localStorage.setItem(STORAGE_KEY_SCORE, JSON.stringify(score));
      localStorage.setItem(STORAGE_KEY_SKIPS, JSON.stringify(skipsLeft));
    }
  }, [riddles, currentRiddleIndex, gameState, timerDuration, score, skipsLeft]);

  // Countdown timer logic
  useEffect(() => {
    if (gameState !== 'playing' || timerDuration === 0) {
      return;
    }

    if (timeLeft <= 0) {
      setGameState('timeup');
      clearSavedProgress();
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [gameState, timeLeft, timerDuration]);
  
  // Game state change sound effects
  useEffect(() => {
    if (gameState === 'end') {
        playSound('end');
    } else if (gameState === 'timeup') {
        playSound('timeup');
    }
  }, [gameState]);


  const clearSavedProgress = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY_RIDDLES);
    localStorage.removeItem(STORAGE_KEY_INDEX);
    localStorage.removeItem(STORAGE_KEY_TIMER_DURATION);
    localStorage.removeItem(STORAGE_KEY_SCORE);
    localStorage.removeItem(STORAGE_KEY_SKIPS);
  }, []);

  const startGame = useCallback(async (duration: TimerDuration, theme: Theme) => {
    setIsLoading(true);
    setError(null);
    setFeedback(null);
    clearSavedProgress();
    setTimerDuration(duration);
    setScore(0);
    setSkipsLeft(MAX_SKIPS);
    if (duration > 0) {
        setTimeLeft(duration);
    }
    playSound('start');

    try {
      const newRiddles = await generateRiddles(TOTAL_RIDDLES, theme);
      if (newRiddles.length < TOTAL_RIDDLES) {
        throw new Error("Could not generate enough riddles. Please try again.");
      }
      setRiddles(newRiddles);
      setCurrentRiddleIndex(0);
      setGameState('playing');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setGameState('start');
    } finally {
      setIsLoading(false);
    }
  }, [clearSavedProgress]);

  const handleImageSubmit = useCallback(async (imageFile: File) => {
    setIsLoading(true);
    setError(null);
    setFeedback(null);

    try {
      const currentRiddle = riddles[currentRiddleIndex];
      const isCorrect = await verifyImage(imageFile, currentRiddle.answer);

      if (isCorrect) {
        playSound('correct');
        setScore(prev => prev + POINTS_PER_RIDDLE);
        setFeedback({ message: `Correct! +${POINTS_PER_RIDDLE} Points`, isCorrect: true });
        setTimeout(() => {
          if (currentRiddleIndex + 1 < riddles.length) {
            setCurrentRiddleIndex(prev => prev + 1);
            if (timerDuration > 0) {
                setTimeLeft(timerDuration);
            }
            setFeedback(null);
          } else {
            setGameState('end');
            clearSavedProgress(); // Clear progress on game completion
          }
          setIsLoading(false);
        }, 1500);
      } else {
        playSound('incorrect');
        setFeedback({ message: 'Not quite... Try again!', isCorrect: false });
        setIsLoading(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred while verifying the image.');
      setIsLoading(false);
    }
  }, [riddles, currentRiddleIndex, clearSavedProgress, timerDuration]);
  
  const handleTextSubmit = useCallback(async (answer: string) => {
    setIsLoading(true);
    setError(null);
    setFeedback(null);

    const currentRiddle = riddles[currentRiddleIndex];
    const isCorrect = answer.trim().toLowerCase() === currentRiddle.answer.toLowerCase();

    if (isCorrect) {
      playSound('correct');
      setScore(prev => prev + POINTS_PER_RIDDLE);
      setFeedback({ message: `Correct! +${POINTS_PER_RIDDLE} Points`, isCorrect: true });
      setTimeout(() => {
        if (currentRiddleIndex + 1 < riddles.length) {
          setCurrentRiddleIndex(prev => prev + 1);
          if (timerDuration > 0) {
              setTimeLeft(timerDuration);
          }
          setFeedback(null);
        } else {
          setGameState('end');
          clearSavedProgress();
        }
        setIsLoading(false);
      }, 1500);
    } else {
      playSound('incorrect');
      setFeedback({ message: 'Not quite... Try again!', isCorrect: false });
      setIsLoading(false);
    }
  }, [riddles, currentRiddleIndex, timerDuration, clearSavedProgress]);

  const handleGetHint = useCallback(async () => {
    if (isHintLoading || riddles[currentRiddleIndex]?.hint) {
        return;
    }
    
    playSound('hint');
    setIsHintLoading(true);
    setError(null);
    setScore(prev => Math.max(0, prev - HINT_COST));

    try {
        const currentRiddle = riddles[currentRiddleIndex];
        const hint = await generateHint(currentRiddle.riddle, currentRiddle.answer);

        setRiddles(prevRiddles => {
            const newRiddles = [...prevRiddles];
            newRiddles[currentRiddleIndex] = { ...newRiddles[currentRiddleIndex], hint };
            return newRiddles;
        });

    } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred while getting the hint.');
    } finally {
        setIsHintLoading(false);
    }
  }, [riddles, currentRiddleIndex, isHintLoading]);

  const handleSkipRiddle = useCallback(() => {
    if (skipsLeft <= 0 || isLoading) {
        return;
    }

    playSound('skip');
    setSkipsLeft(prev => prev - 1);
    setScore(prev => Math.max(0, prev - SKIP_COST));
    setFeedback({ message: `Riddle skipped! -${SKIP_COST} Points`, isCorrect: false });

    setTimeout(() => {
        if (currentRiddleIndex + 1 < riddles.length) {
            setCurrentRiddleIndex(prev => prev + 1);
            if (timerDuration > 0) {
                setTimeLeft(timerDuration);
            }
            setFeedback(null);
        } else {
            setGameState('end');
            clearSavedProgress();
        }
    }, 1500);
  }, [skipsLeft, isLoading, riddles.length, currentRiddleIndex, timerDuration, clearSavedProgress]);


  const restartGame = useCallback(() => {
    setGameState('start');
    setRiddles([]);
    setCurrentRiddleIndex(0);
    setScore(0);
    setError(null);
    setFeedback(null);
    setIsLoading(false);
    setTimerDuration(0);
    setTimeLeft(0);
    clearSavedProgress(); // Clear progress on restart
  }, [clearSavedProgress]);

  const renderContent = () => {
    switch (gameState) {
      case 'start':
        return <StartScreen onStart={startGame} isLoading={isLoading} error={error} />;
      case 'playing':
        if (riddles.length > 0) {
          return (
            <GameScreen
              riddle={riddles[currentRiddleIndex]}
              riddleNumber={currentRiddleIndex + 1}
              totalRiddles={riddles.length}
              onImageSubmit={handleImageSubmit}
              onTextSubmit={handleTextSubmit}
              isLoading={isLoading}
              feedback={feedback}
              onGetHint={handleGetHint}
              isHintLoading={isHintLoading}
              onSkipRiddle={handleSkipRiddle}
              skipsLeft={skipsLeft}
              timeLeft={timeLeft}
              timerDuration={timerDuration}
              score={score}
            />
          );
        }
        return null;
      case 'end':
        return <EndScreen onRestart={restartGame} score={score}/>;
      case 'timeup':
        return <TimeUpScreen onRestart={restartGame} score={score} />;
      default:
        return <StartScreen onStart={startGame} isLoading={isLoading} error={error} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 font-sans flex flex-col items-center p-4">
      <Header />
      <main className="w-full max-w-2xl mx-auto flex-grow flex flex-col justify-center">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
