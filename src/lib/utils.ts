import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isEmpty(obj: any) {
  return (
    obj === null || 
    obj === undefined || 
    (typeof obj === "object" && Object.keys(obj).length === 0) 
  );
}