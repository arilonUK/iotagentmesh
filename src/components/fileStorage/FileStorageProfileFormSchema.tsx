
import { z } from 'zod';

export const formSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  path: z.string().min(1, 'Path is required'),
  public_read: z.boolean().default(false),
  index_file: z.string().default('index.html'),
});

export type FormValues = z.infer<typeof formSchema>;
