
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const roleColors = {
  owner: 'bg-purple-500 hover:bg-purple-600',
  admin: 'bg-blue-500 hover:bg-blue-600',
  member: 'bg-green-500 hover:bg-green-600',
  viewer: 'bg-yellow-500 hover:bg-yellow-600'
};
