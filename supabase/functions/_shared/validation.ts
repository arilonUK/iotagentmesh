
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

// Request validation schemas
export const apiKeyAuthSchema = z.object({
  authorization: z.string().regex(/^Bearer iot_[a-zA-Z0-9]{32,}$/, 'Invalid API key format')
});

export const jwtAuthSchema = z.object({
  authorization: z.string().regex(/^Bearer [A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/, 'Invalid JWT format')
});

// Response validation schemas
export const authResponseSchema = z.object({
  success: z.boolean(),
  api_key_id: z.string().uuid().optional(),
  organization_id: z.string().uuid().optional(),
  scopes: z.array(z.string()).optional(),
  error: z.string().optional(),
  processing_time_ms: z.number().optional(),
  timestamp: z.string().datetime().optional()
});

// Input sanitization
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
};

// Validation middleware factory
export const createValidationMiddleware = (schema: z.ZodSchema) => {
  return async (ctx: any) => {
    try {
      const authHeader = ctx.request.headers.get('Authorization');
      
      if (!authHeader) {
        ctx.error = 'Missing Authorization header';
        return ctx;
      }
      
      const sanitizedHeader = sanitizeInput(authHeader);
      const validationResult = schema.safeParse({ authorization: sanitizedHeader });
      
      if (!validationResult.success) {
        ctx.error = `Invalid authorization format: ${validationResult.error.errors[0].message}`;
        return ctx;
      }
      
      console.log('Validation middleware: Authorization header validated');
      return ctx;
    } catch (error) {
      console.error('Validation middleware error:', error);
      ctx.error = 'Validation error';
      return ctx;
    }
  };
};
