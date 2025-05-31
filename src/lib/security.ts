
import { z } from 'zod';

/**
 * Security utilities for input validation and sanitization
 */

// Password complexity validation schema
export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

// Email validation schema
export const emailSchema = z.string().email('Invalid email address');

// Input sanitization functions
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
};

// HTML escape function for user-generated content
export const escapeHtml = (unsafe: string): string => {
  if (!unsafe) return '';
  
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// Validate numeric inputs with bounds
export const validateNumericInput = (
  value: number,
  min: number = Number.MIN_SAFE_INTEGER,
  max: number = Number.MAX_SAFE_INTEGER
): boolean => {
  return !isNaN(value) && value >= min && value <= max;
};

// Generate secure tokens
export const generateSecureToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Rate limiting helper (simple in-memory implementation)
class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();
  
  isAllowed(key: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean {
    const now = Date.now();
    const attempt = this.attempts.get(key);
    
    if (!attempt || now > attempt.resetTime) {
      this.attempts.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }
    
    if (attempt.count >= maxAttempts) {
      return false;
    }
    
    attempt.count++;
    return true;
  }
  
  reset(key: string): void {
    this.attempts.delete(key);
  }
}

export const rateLimiter = new RateLimiter();

// CSP nonce generator
export const generateCSPNonce = (): string => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
};

// Validation schemas for common inputs
export const deviceNameSchema = z.string()
  .min(1, 'Device name is required')
  .max(100, 'Device name must be less than 100 characters')
  .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Device name contains invalid characters');

export const organizationNameSchema = z.string()
  .min(1, 'Organization name is required')
  .max(100, 'Organization name must be less than 100 characters')
  .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Organization name contains invalid characters');

export const descriptionSchema = z.string()
  .max(500, 'Description must be less than 500 characters')
  .optional();

export const urlSchema = z.string().url('Invalid URL format').optional();
