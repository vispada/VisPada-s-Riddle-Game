import React, { useState, useRef, useEffect } from 'react';
import { Riddle, TimerDuration } from '../types';
import Spinner from './Spinner';
import { HINT_COST, SKIP_COST } from '../constants';

interface GameScreenProps {
  riddle: Riddle;
  riddleNumber: number;
  totalRiddles: number;
  onImageSubmit: (imageFile: File) => void;
  onTextSubmit: (answer: string) => void;
  isLoading: boolean;
  feedback: { message: string; isCorrect: boolean } | null;
  onGetHint: () => void;
  isHintLoading: boolean;
  onSkipRiddle: () => void;
  skipsLeft: number;
  timeLeft: number;
  timerDuration: TimerDuration;
  score: number;
}

const CameraIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(1, '0')}:${String(secs).padStart(2, '0')}`;
};


function GameScreen({ riddle, riddleNumber, totalRiddles, onImageSubmit, onTextSubmit, isLoading, feedback, onGetHint, isHintLoading, onSkipRiddle, skipsLeft, timeLeft, timerDuration, score }: GameScreenProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [textAnswer, setTextAnswer] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTextAnswer('');
    setSelectedFile(null);
    setPreviewUrl(null);
  }, [riddle]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleImageFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (selectedFile && !isLoading) {
      onImageSubmit(selectedFile);
    }
  };

  const handleTextFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (textAnswer.trim() && !isLoading) {
      onTextSubmit(textAnswer);
    }
  };
  
  const triggerFileSelect = () => fileInputRef.current?.click();

  const feedbackColor = feedback?.isCorrect ? 'text-green-400' : 'text-red-400';

  return (
    <div className="w-full bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-700 flex flex-col items-center animate-fade-in">
      <div className="w-full mb-4 flex justify-between items-start">
        <div>
          <p className="text-cyan-400 font-bold text-lg">Riddle {riddleNumber} of {totalRiddles}</p>
          <div className="w-full bg-slate-700 rounded-full h-2.5 mt-1">
            <div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: `${(riddleNumber / totalRiddles) * 100}%` }}></div>
          </div>
        </div>
        <div className="text-right">
            {timerDuration > 0 && (
            <div className={`text-2xl font-mono p-2 rounded-lg ${timeLeft <= 10 && timeLeft > 0 ? 'text-red-400 animate-pulse' : 'text-slate-200'}`}>
                    {formatTime(timeLeft)}
            </div>
            )}
            <p className="text-lg font-bold text-violet-400 mt-1">Score: {score}</p>
        </div>
      </div>
      
      <p className="text-xl sm:text-2xl text-center text-slate-200 my-6 leading-relaxed">&ldquo;{riddle.riddle}&rdquo;</p>
      
      {riddle.hint && (
        <div className="w-full text-center mb-4 min-h-[50px] flex items-center justify-center">
            <div className="bg-slate-700/50 p-3 rounded-lg animate-fade-in w-full">
                <p className="text-slate-300"><span className="font-bold text-cyan-400">Hint:</span> {riddle.hint}</p>
            </div>
        </div>
      )}

      <div className="w-full flex justify-center items-center space-x-4 mb-6 min-h-[42px]">
        {isHintLoading ? (
            <div className="flex items-center space-x-2 text-slate-400">
                <Spinner size="sm" />
                <span>Getting hint...</span>
            </div>
        ) : !riddle.hint && (
          <button
            onClick={onGetHint}
            disabled={isLoading}
            className="text-slate-400 border border-slate-600 px-4 py-2 rounded-lg hover:bg-slate-700 hover:text-cyan-400 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
          >
            Get a Hint (-{HINT_COST} pts)
          </button>
        )}
        <button
            onClick={onSkipRiddle}
            disabled={isLoading || skipsLeft <= 0}
            className="text-slate-400 border border-slate-600 px-4 py-2 rounded-lg hover:bg-slate-700 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
        >
            Skip Riddle (-{SKIP_COST} pts) ({skipsLeft} left)
        </button>
      </div>

      <form onSubmit={handleTextFormSubmit} className="w-full max-w-md flex items-center space-x-2">
        <input
            type="text"
            value={textAnswer}
            onChange={(e) => setTextAnswer(e.target.value)}
            placeholder="Type your answer here..."
            disabled={isLoading}
            className="flex-grow bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
        />
        <button
            type="submit"
            disabled={!textAnswer.trim() || isLoading}
            className="bg-violet-500 hover:bg-violet-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg focus:outline-none focus:ring-4 focus:ring-violet-500/50"
        >
            Submit
        </button>
      </form>

      <div className="flex items-center my-4 w-full max-w-md">
        <div className="flex-grow border-t border-slate-600"></div>
        <span className="flex-shrink mx-4 text-slate-400 uppercase text-sm">Or</span>
        <div className="flex-grow border-t border-slate-600"></div>
      </div>

      <form onSubmit={handleImageFormSubmit} className="w-full flex flex-col items-center">
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
          ref={fileInputRef}
          disabled={isLoading}
        />
        
        {previewUrl ? (
          <div className="w-full max-w-md mb-4 rounded-lg overflow-hidden border-2 border-slate-600">
             <img src={previewUrl} alt="Selected preview" className="w-full h-auto object-cover" />
          </div>
        ) : (
            <div 
                onClick={triggerFileSelect} 
                className="w-full max-w-md h-48 mb-4 rounded-lg border-2 border-dashed border-slate-600 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-700/50 hover:border-cyan-500 cursor-pointer transition-colors"
            >
                <CameraIcon />
                <span>Tap to take a photo</span>
            </div>
        )}

        {previewUrl && (
          <button
            type="button"
            onClick={triggerFileSelect}
            disabled={isLoading}
            className="mb-4 text-cyan-400 hover:text-cyan-300 disabled:text-slate-500"
          >
            Choose a different picture
          </button>
        )}

        <div className="h-16 flex items-center justify-center">
            {isLoading ? (
                <div className="flex flex-col items-center space-y-2">
                    <Spinner />
                    <span className="text-slate-400">Thinking...</span>
                </div>
            ) : feedback ? (
                <p className={`text-xl font-bold animate-pulse ${feedbackColor}`}>{feedback.message}</p>
            ) : (
                 <button
                    type="submit"
                    disabled={!selectedFile || isLoading}
                    className="w-full max-w-xs bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-lg focus:outline-none focus:ring-4 focus:ring-cyan-500/50"
                  >
                   Check My Answer
                 </button>
            )}
        </div>
      </form>
    </div>
  );
}

export default GameScreen;