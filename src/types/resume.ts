export type ThemeName = 'modern' | 'classic' | 'minimal';

export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  dates: string;
  bullets: string[];
}

export interface ResumeData {
  name: string;
  title: string;
  email: string;
  location: string;
  summary: string;
  skills: string[];
  experience: ExperienceItem[];
}
