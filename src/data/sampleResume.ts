import type { ResumeData } from '../types/resume';

export const sampleResume: ResumeData = {
  name: 'Alex Morgan',
  title: 'Full-Stack Developer',
  email: 'alex@example.com',
  location: 'Sydney, Nova Scotia',
  summary: 'Full-stack developer focused on dependable web applications, automation, and thoughtful user experiences.',
  skills: ['React', 'TypeScript', 'Rust', 'PostgreSQL', 'Docker'],
  experience: [{
    id: '1',
    company: 'Northstar Labs',
    role: 'Software Developer',
    dates: '2023 — Present',
    bullets: ['Built full-stack applications with React and .NET.', 'Automated deployment workflows and improved release reliability.'],
  }],
};
