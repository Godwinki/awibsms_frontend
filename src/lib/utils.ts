import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format date to a human-readable string.
 * Example: "Jan 12, 2023"
 */
export function formatDate(date: Date): string {
  if (!date || isNaN(date.getTime())) {
    return 'N/A';
  }
  
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
}

/**
 * Format a number as a currency amount with proper formatting.
 * Example: 1000 -> "TZS 1,000.00"
 */
export function formatAmount(amount: number | string, currency: string = 'TZS'): string {
  if (amount === undefined || amount === null) return `${currency} 0.00`;
  
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) return `${currency} 0.00`;
  
  return `${currency} ${numAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}
