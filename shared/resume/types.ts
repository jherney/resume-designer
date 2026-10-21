// Each theme needs a matching `.theme-<name>` block in preview.css and a `.thumb-<name>` in styles.css.
export const THEMES = ['modern', 'classic', 'minimal', 'editorial', 'slate', 'forest'] as const;
export type ThemeName = (typeof THEMES)[number];

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
