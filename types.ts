export interface Riddle {
  riddle: string;
  answer: string;
  hint?: string;
}

export type GameState = 'start' | 'playing' | 'end' | 'timeup';

export type TimerDuration = 30 | 60 | 120 | 0;

export type Theme = 'Cricket' | 'Soccer' | 'Books' | 'Geography' | 'Social Media';
