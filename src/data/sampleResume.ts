import type { ResumeData } from '../types/resume';

export const sampleResume: ResumeData = {
  resumeTitle: 'Alex Morgan — Software Developer',
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
  education: [{
    id: '1',
    institution: 'Nova Scotia Community College',
    degree: 'Diploma in Information Technology',
    dates: '2019 — 2021',
  }],
  projects: [{
    id: '1',
    name: 'Resume Designer',
    description: 'A cross-platform resume builder with live themes and PDF export.',
    link: 'github.com/jherney/resume-designer',
  }],
};
