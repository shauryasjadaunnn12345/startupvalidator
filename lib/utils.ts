import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Validates if an email address is a valid Gmail address
 * @param email - The email address to validate
 * @returns true if the email is a valid Gmail address, false otherwise
 */
export function isValidGmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  // Normalize email: trim and convert to lowercase
  const normalizedEmail = email.trim().toLowerCase();
  
  // Gmail validation regex - matches @gmail.com domain
  // Also handles common variations like @googlemail.com (Gmail's alternative domain)
  const gmailRegex = /^[a-zA-Z0-9._+-]+@(gmail|googlemail)\.com$/;
  
  return gmailRegex.test(normalizedEmail);
}
