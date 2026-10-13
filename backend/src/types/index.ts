import type { Request } from 'express';

export interface ResumeData {
  resumeTitle: string;
  name: string;
  title: string;
  email: string;
  location: string;
  summary: string;
  skills: string[];
  experience: ExperienceItem[];
  education: EducationItem[];
  projects: ProjectItem[];
}

export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  dates: string;
  bullets: string[];
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  dates: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  link?: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface AuthRequest extends Request {
  user?: JWTPayload;
}