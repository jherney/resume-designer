import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required').max(100).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const resumeDataSchema = z.object({
  resumeTitle: z.string().min(1, 'Resume title is required'),
  name: z.string().min(1, 'Name is required'),
  title: z.string().min(1, 'Professional title is required'),
  email: z.string().email('Invalid email address'),
  location: z.string().optional(),
  summary: z.string().optional(),
  skills: z.array(z.string()).optional(),
  experience: z.array(z.object({
    id: z.string(),
    company: z.string(),
    role: z.string(),
    dates: z.string(),
    bullets: z.array(z.string()),
  })).optional(),
  education: z.array(z.object({
    id: z.string(),
    institution: z.string(),
    degree: z.string(),
    dates: z.string(),
  })).optional(),
  projects: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    link: z.string().optional(),
  })).optional(),
});

export const createResumeSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  data: resumeDataSchema,
  theme: z.enum(['modern', 'classic', 'minimal']).optional(),
  isPublic: z.boolean().optional(),
});

export const updateResumeSchema = createResumeSchema.partial();

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateResumeInput = z.infer<typeof createResumeSchema>;
export type UpdateResumeInput = z.infer<typeof updateResumeSchema>;
export type ResumeDataInput = z.infer<typeof resumeDataSchema>;