import { config } from 'dotenv';
import { expand } from 'dotenv-expand';

import { ValidationService } from '../../../shared/validation/validation.service';

import { EnvironmentType } from './types';

import { EnvironmentSchema } from './schemas/environment.schema';

const expanded = expand(config()).parsed;

export const Environment = ValidationService.validateWithZod(
  EnvironmentSchema,
  expanded,
) as EnvironmentType;
