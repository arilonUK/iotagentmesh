
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const roleColors = {
  owner: 'bg-purple-600 hover:bg-purple-700',
  admin: 'bg-blue-600 hover:bg-blue-700',
  member: 'bg-green-600 hover:bg-green-700',
  viewer: 'bg-gray-600 hover:bg-gray-700',
}
