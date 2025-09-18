
import React from 'react';

interface TimeUpScreenProps {
  onRestart: () => void;
  score: number;
}

function TimeUpScreen({ onRestart, score }: TimeUpScreenProps) {
  return (
    <div className="text-center bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-slate-700 flex flex-col items-center animate-fade-in">
      <h2 className="text-4xl font-bold text-red-400 mb-4">Time's Up!</h2>
      <p className="text-slate-300 mb-4 text-lg">
        You ran out of time. Better luck next time!
      </p>
      <p className="text-2xl font-bold text-violet-400 mb-8">
        Final Score: {score}
      </p>
      <button
        onClick={onRestart}
        className="w-full max-w-xs bg-violet-500 hover:bg-violet-600 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-lg focus:outline-none focus:ring-4 focus:ring-violet-500/50"
      >
        Play Again
      </button>
    </div>
  );
}

export default TimeUpScreen;
