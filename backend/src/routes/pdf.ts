import { Router, Response } from 'express';
import { prisma } from '../utils/prisma.js';
import { authMiddleware, optionalAuthMiddleware, AuthRequest } from '../middleware/auth.js';
import { generateResumePDF } from '../services/pdf.js';
import { ResumeData } from '../types/index.js';

const router = Router();

function parseData(data: string): ResumeData {
  try {
    return JSON.parse(data);
  } catch {
    return {} as ResumeData;
  }
}

// Generate PDF for authenticated user's resume
router.post('/generate', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { resumeId, data, theme } = req.body as { resumeId?: string; data?: ResumeData; theme?: string };
  
  let resumeData: ResumeData;
  const resumeTheme = (theme as 'modern' | 'classic' | 'minimal') || 'modern';

  if (resumeId) {
    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId: req.user!.userId },
    });
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    resumeData = parseData(resume.data);
  } else if (data) {
    resumeData = data;
  } else {
    return res.status(400).json({ error: 'Either resumeId or data is required' });
  }

  try {
    const pdfBuffer = await generateResumePDF(resumeData, resumeTheme);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${resumeData.resumeTitle || 'resume'}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

// Generate PDF for public resume (no auth required)
router.get('/public/:id', optionalAuthMiddleware, async (req: AuthRequest, res: Response) => {
  const resume = await prisma.resume.findFirst({
    where: { id: req.params.id, isPublic: true },
  });

  if (!resume) {
    return res.status(404).json({ error: 'Resume not found or not public' });
  }

  try {
    const resumeData = parseData(resume.data);
    const pdfBuffer = await generateResumePDF(resumeData, resume.theme as 'modern' | 'classic' | 'minimal');
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${resume.title}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

export default router;