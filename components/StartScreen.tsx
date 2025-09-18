import React, { useState } from 'react';
import Spinner from './Spinner';
import { TimerDuration, Theme } from '../types';
import { TIMER_OPTIONS, THEMES } from '../constants';

interface StartScreenProps {
  onStart: (duration: TimerDuration, theme: Theme) => void;
  isLoading: boolean;
  error: string | null;
}

function StartScreen({ onStart, isLoading, error }: StartScreenProps) {
  const [selectedDuration, setSelectedDuration] = useState<TimerDuration>(TIMER_OPTIONS[0].value);
  const [selectedTheme, setSelectedTheme] = useState<Theme>(THEMES[0]);

  return (
    <div className="text-center bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-slate-700 flex flex-col items-center animate-fade-in">
      <h2 className="text-3xl font-bold text-cyan-400 mb-4">Welcome!</h2>
      <p className="text-slate-300 mb-6 max-w-md">
        Get ready for a scavenger hunt! Choose a theme, I'll give you a riddle, and you find the object and take a picture of it. Let's see how many you can get right.
      </p>

      <div className="mb-6 w-full">
        <label className="block text-slate-300 mb-3 font-semibold">Select a Theme:</label>
        <div className="flex flex-wrap justify-center gap-2">
            {THEMES.map((theme) => (
                <button
                    key={theme}
                    onClick={() => setSelectedTheme(theme)}
                    className={`px-4 py-2 rounded-lg font-bold transition-all duration-200 border-2 text-sm ${selectedTheme === theme ? 'bg-cyan-500 border-cyan-500 text-white' : 'bg-slate-700 border-slate-600 text-slate-300 hover:border-cyan-500'}`}
                >
                    {theme}
                </button>
            ))}
        </div>
      </div>

      <div className="mb-8 w-full">
        <label className="block text-slate-300 mb-3 font-semibold">Timer per Riddle:</label>
        <div className="flex justify-center space-x-2 sm:space-x-4">
            {TIMER_OPTIONS.map(({label, value}) => (
                <button
                    key={value}
                    onClick={() => setSelectedDuration(value)}
                    className={`px-4 py-2 rounded-lg font-bold transition-all duration-200 border-2 ${selectedDuration === value ? 'bg-cyan-500 border-cyan-500 text-white' : 'bg-slate-700 border-slate-600 text-slate-300 hover:border-cyan-500'}`}
                >
                    {label}
                </button>
            ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-500/20 text-red-300 p-3 rounded-lg mb-6 w-full">
          <p><strong>Error:</strong> {error}</p>
        </div>
      )}
      <button
        onClick={() => onStart(selectedDuration, selectedTheme)}
        disabled={isLoading}
        className="w-full max-w-xs bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-lg focus:outline-none focus:ring-4 focus:ring-cyan-500/50 flex items-center justify-center space-x-3"
      >
        {isLoading && <Spinner size="sm" />}
        <span>{isLoading ? 'Generating Riddles...' : 'Start the Hunt!'}</span>
      </button>
    </div>
  );
}

export default StartScreen;
