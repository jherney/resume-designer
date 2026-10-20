import type { Request } from 'express';

export type { EducationItem, ExperienceItem, ProjectItem, ResumeData, ThemeName } from '../../../shared/resume/types.js';

export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

// Express 5 types route params as string | string[]; the only param used is :id.
export interface AuthRequest extends Request<{ id: string }> {
  user?: JWTPayload;
}