import { z } from 'zod';

export const EnvironmentSchema = z
  .object(
    {
      NODE_ENV: z.enum(['PROD', 'DEV']),
      PORT: z.coerce.number().positive(),
      API_PREFIX: z.string().startsWith('/'),
      ALLOWED_ORIGINS: z.string(),
      JWT_SECRET: z.string().min(1),
      DATABASE_URL: z.string().min(1),
      NODE_EMAILER_SERVICE: z.string().min(1),
      NODE_EMAILER_USER: z.string().min(1),
      NODE_EMAILER_FROM: z.string().min(1),
      NODE_EMAILER_PASS: z.string().min(1),
    },
    { required_error: '.env file is required' },
  )
  .superRefine((environment, ctx) => {
    environment.ALLOWED_ORIGINS.split(';').forEach((origin) => {
      const result = z
        .string()
        .url(`Invalid origin url(${origin})`)
        .safeParse(origin);

      if (result.success === false) {
        ctx.addIssue({ ...result.error.errors[0], path: ['ALLOWED_ORIGINS'] });
      }
    });
  });
