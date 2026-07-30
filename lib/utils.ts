import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatWatts(watts: number): string {
  if (watts >= 1000) return `${(watts / 1000).toFixed(1)} kW`;
  return `${watts} W`;
}

export function formatAmperes(watts: number, voltage: 110 | 220): string {
  return `${(watts / voltage).toFixed(1)} A`;
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 9);
}
