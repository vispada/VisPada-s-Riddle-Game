import { TimerDuration, Theme } from './types';

export const TOTAL_RIDDLES = 5;
export const GEMINI_TEXT_MODEL = 'gemini-2.5-flash';
export const GEMINI_VISION_MODEL = 'gemini-2.5-flash';

export const STORAGE_KEY_RIDDLES = 'scavengerHuntRiddles';
export const STORAGE_KEY_INDEX = 'scavengerHuntCurrentIndex';
export const STORAGE_KEY_TIMER_DURATION = 'scavengerHuntTimerDuration';
export const STORAGE_KEY_SCORE = 'scavengerHuntScore';
export const STORAGE_KEY_SKIPS = 'scavengerHuntSkipsLeft';

export const THEMES: Theme[] = ['Cricket', 'Soccer', 'Books', 'Geography', 'Social Media'];

export const TIMER_OPTIONS: { label: string; value: TimerDuration }[] = [
    { label: '30s', value: 30 },
    { label: '1m', value: 60 },
    { label: '2m', value: 120 },
    { label: 'None', value: 0 },
];

export const POINTS_PER_RIDDLE = 100;
export const HINT_COST = 25;
export const SKIP_COST = 50;
export const MAX_SKIPS = 2;
