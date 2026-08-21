import type { ResumeData, StoredResumeState, ThemeName } from '../types/resume';

export type ValidationErrors = Partial<Record<'resumeTitle' | 'name' | 'title' | 'email', string>>;

const themes: ThemeName[] = ['modern', 'classic', 'minimal'];
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateResume(resume: ResumeData): ValidationErrors {
  const errors: ValidationErrors = {};
  if (!resume.resumeTitle.trim()) errors.resumeTitle = 'Add a title so you can identify this resume.';
  if (!resume.name.trim()) errors.name = 'Your name is required.';
  if (!resume.title.trim()) errors.title = 'Add a professional title.';
  if (!resume.email.trim()) errors.email = 'Email is required.';
  else if (!emailPattern.test(resume.email.trim())) errors.email = 'Enter a valid email address.';
  return errors;
}

const text = (value: unknown, fallback = '') => typeof value === 'string' ? value : fallback;
const list = <T>(value: unknown): T[] => Array.isArray(value) ? value as T[] : [];

export function normalizeState(value: unknown, fallback: StoredResumeState): StoredResumeState {
  if (!value || typeof value !== 'object') return fallback;
  const input = value as Partial<StoredResumeState>;
  const source = input.resume && typeof input.resume === 'object' ? input.resume : {};
  const resume = source as Partial<ResumeData>;
  return {
    theme: themes.includes(input.theme as ThemeName) ? input.theme as ThemeName : fallback.theme,
    resume: {
      ...fallback.resume,
      ...resume,
      resumeTitle: text(resume.resumeTitle, fallback.resume.resumeTitle),
      name: text(resume.name),
      title: text(resume.title),
      email: text(resume.email),
      location: text(resume.location),
      summary: text(resume.summary),
      skills: list<string>(resume.skills).filter((skill) => typeof skill === 'string'),
      experience: list(resume.experience),
      education: list(resume.education),
      projects: list(resume.projects),
    },
  };
}
