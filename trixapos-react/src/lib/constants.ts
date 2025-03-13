import { type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const DRAWER_SNAP_POINTS = ["260px", "400px", "600px", "90vh"] as const;

export const ANIMATION_DURATION = 0.2;

export const ANIMATION_TYPES = {
  SCALE: {
    initial: { scale: 0.96, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.96, opacity: 0 },
  },
  SLIDE_UP: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: 20, opacity: 0 },
  },
  SLIDE_RIGHT: {
    initial: { x: -20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -20, opacity: 0 },
  },
} as const;

export function cn(...inputs: ClassValue[]) {
  return twMerge(inputs);
}