import { Router, Response } from 'express';
import { prisma } from '../utils/prisma.js';
import { authMiddleware, optionalAuthMiddleware, AuthRequest } from '../middleware/auth.js';
import { generateResumePDF } from '../services/pdf.js';
import { pdfRequestSchema, resumeDataSchema, themeSchema } from '../utils/validation.js';
import { ResumeData, ThemeName } from '../types/index.js';

const router = Router();

async function sendPDF(res: Response, resume: ResumeData, theme: ThemeName, filename: string) {
  try {
    const pdfBuffer = await generateResumePDF(resume, theme);
    res.attachment(`${filename}.pdf`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
}

// Render the editor's current (possibly unsaved) resume.
router.post('/generate', authMiddleware, async (req: AuthRequest, res: Response) => {
  const parsed = pdfRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid resume data', details: parsed.error.flatten() });
  }
  const { data, theme } = parsed.data;
  await sendPDF(res, data, theme, data.resumeTitle || 'resume');
});

// Generate PDF for public resume (no auth required)
router.get('/public/:id', optionalAuthMiddleware, async (req: AuthRequest, res: Response) => {
  const resume = await prisma.resume.findFirst({
    where: { id: req.params.id, isPublic: true },
  });
  if (!resume) {
    return res.status(404).json({ error: 'Resume not found or not public' });
  }

  let data: unknown;
  try {
    data = JSON.parse(resume.data);
  } catch {
    data = null;
  }
  const parsed = resumeDataSchema.safeParse(data);
  if (!parsed.success) {
    return res.status(422).json({ error: 'Stored resume data is invalid' });
  }
  const theme = themeSchema.catch('modern').parse(resume.theme);
  await sendPDF(res, parsed.data, theme, resume.title);
});

export default router;
