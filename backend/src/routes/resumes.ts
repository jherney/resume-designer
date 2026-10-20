import { Router, Response } from 'express';
import { prisma } from '../utils/prisma.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { createResumeSchema, updateResumeSchema, CreateResumeInput, UpdateResumeInput, ResumeDataInput } from '../utils/validation.js';

const router = Router();

function stringifyData(data: ResumeDataInput): string {
  return JSON.stringify(data);
}

function parseData(data: string): ResumeDataInput {
  try {
    return JSON.parse(data);
  } catch {
    return data as any;
  }
}

router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res: Response) => {
  const resumes = await prisma.resume.findMany({
    where: { userId: req.user!.userId },
    orderBy: { updatedAt: 'desc' },
    select: { id: true, title: true, theme: true, isPublic: true, createdAt: true, updatedAt: true },
  });
  res.json({ resumes });
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  const resume = await prisma.resume.findFirst({
    where: { id: req.params.id, userId: req.user!.userId },
  });

  if (!resume) {
    return res.status(404).json({ error: 'Resume not found' });
  }

  res.json({ resume: { ...resume, data: parseData(resume.data) } });
});

router.post('/', async (req: AuthRequest, res: Response) => {
  const parse = createResumeSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ errors: parse.error.flatten().fieldErrors });
  }

  const { title, data, theme, isPublic }: CreateResumeInput = parse.data;

  const resume = await prisma.resume.create({
    data: {
      title,
      data: stringifyData(data),
      theme: theme || 'modern',
      isPublic: isPublic || false,
      userId: req.user!.userId,
    },
  });

  res.status(201).json({ resume: { ...resume, data: parseData(resume.data) } });
});

router.patch('/:id', async (req: AuthRequest, res: Response) => {
  const parse = updateResumeSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ errors: parse.error.flatten().fieldErrors });
  }

  const existing = await prisma.resume.findFirst({
    where: { id: req.params.id, userId: req.user!.userId },
  });

  if (!existing) {
    return res.status(404).json({ error: 'Resume not found' });
  }

  const { title, data, theme, isPublic }: UpdateResumeInput = parse.data;

  const resume = await prisma.resume.update({
    where: { id: req.params.id },
    data: {
      ...(title !== undefined && { title }),
      ...(data !== undefined && { data: stringifyData(data) }),
      ...(theme !== undefined && { theme }),
      ...(isPublic !== undefined && { isPublic }),
    },
  });

  res.json({ resume: { ...resume, data: parseData(resume.data) } });
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  const existing = await prisma.resume.findFirst({
    where: { id: req.params.id, userId: req.user!.userId },
  });

  if (!existing) {
    return res.status(404).json({ error: 'Resume not found' });
  }

  await prisma.resume.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

router.post('/:id/duplicate', async (req: AuthRequest, res: Response) => {
  const existing = await prisma.resume.findFirst({
    where: { id: req.params.id, userId: req.user!.userId },
  });

  if (!existing) {
    return res.status(404).json({ error: 'Resume not found' });
  }

  const resume = await prisma.resume.create({
    data: {
      title: `${existing.title} (Copy)`,
      data: existing.data,
      theme: existing.theme,
      isPublic: false,
      userId: req.user!.userId,
    },
  });

  res.status(201).json({ resume: { ...resume, data: parseData(resume.data) } });
});

export default router;