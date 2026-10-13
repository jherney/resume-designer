import type { ResumeData, ThemeName } from '../../shared/resume/types';

export type { EducationItem, ExperienceItem, ProjectItem, ResumeData, ThemeName } from '../../shared/resume/types';

export interface StoredResumeState {
  resume: ResumeData;
  theme: ThemeName;
}
