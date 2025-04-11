import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Define role colors for badges
export const roleColors = {
  owner: 'bg-purple-600',
  admin: 'bg-blue-600',
  member: 'bg-green-600',
  viewer: 'bg-gray-600'
};
