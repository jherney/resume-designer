import type { Request } from 'express';

export type { EducationItem, ExperienceItem, ProjectItem, ResumeData, ThemeName } from '../../../shared/resume/types.js';

export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface AuthRequest extends Request {
  user?: JWTPayload;
}