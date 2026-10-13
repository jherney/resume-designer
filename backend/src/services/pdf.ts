import PDFDocument from 'pdfkit';
import { ResumeData } from '../types/index.js';
import { PassThrough } from 'stream';

const COLORS = {
  modern: { primary: '#635bff', secondary: '#222', text: '#18202a', muted: '#687384', accent: '#eeedff' },
  classic: { primary: '#222', secondary: '#222', text: '#18202a', muted: '#555', accent: '#f5f5f5' },
  minimal: { primary: '#687384', secondary: '#687384', text: '#18202a', muted: '#687384', accent: '#fafafa' },
};

const FONTS = {
  regular: 'Helvetica',
  bold: 'Helvetica-Bold',
  italic: 'Helvetica-Oblique',
  boldItalic: 'Helvetica-BoldOblique',
};

function drawHeader(doc: PDFKit.PDFDocument, resume: ResumeData, theme: keyof typeof COLORS) {
  const c = COLORS[theme];
  const pageWidth = doc.page.width - 128; // 64px margins each side

  // Name
  doc.font(FONTS.bold).fontSize(28).fillColor(c.text).text(resume.name || 'Your Name', 64, 64, { width: pageWidth });
  
  // Title
  doc.font(FONTS.regular).fontSize(14).fillColor(c.primary).text(resume.title || 'Professional Title', { width: pageWidth });
  
  // Contact
  const contact = [resume.email, resume.location].filter(Boolean).join(' · ');
  doc.fontSize(10).fillColor(c.muted).text(contact, { width: pageWidth });
  
  // Divider line
  doc.moveTo(64, doc.y + 16).lineTo(doc.page.width - 64, doc.y + 16).strokeColor(c.primary).lineWidth(theme === 'minimal' ? 0.5 : 2).stroke();
  
  return doc.y + 24;
}

function drawSectionTitle(doc: PDFKit.PDFDocument, title: string, theme: keyof typeof COLORS) {
  const c = COLORS[theme];
  doc.font(FONTS.bold).fontSize(9).fillColor(c.primary).text(title.toUpperCase(), { characterSpacing: 1.5 });
  doc.moveDown(0.5);
}

function drawBullet(doc: PDFKit.PDFDocument, text: string, indent: number, theme: keyof typeof COLORS) {
  const c = COLORS[theme];
  const x = 64 + indent;
  const width = doc.page.width - 128 - indent;
  
  doc.font(FONTS.regular).fontSize(10).fillColor(c.text);
  
  const bullet = '•  ';
  const bulletWidth = doc.widthOfString(bullet);
  
  doc.text(bullet, x, doc.y, { width: bulletWidth, continued: true });
  doc.text(text, { width: width - bulletWidth });
}

function drawExperience(doc: PDFKit.PDFDocument, resume: ResumeData, theme: keyof typeof COLORS) {
  if (resume.experience.length === 0) return;
  
  drawSectionTitle(doc, 'Experience', theme);
  
  for (const exp of resume.experience) {
    const c = COLORS[theme];
    
    // Role and dates
    doc.font(FONTS.bold).fontSize(11).fillColor(c.text).text(exp.role || 'Job title', { continued: true });
    doc.font(FONTS.regular).fillColor(c.muted).fontSize(10).text(`  ${exp.dates}`);
    
    // Company
    doc.font(FONTS.bold).fontSize(10).fillColor(c.text).text(exp.company);
    
    // Bullets
    for (const bullet of exp.bullets.filter(Boolean)) {
      drawBullet(doc, bullet, 12, theme);
    }
    
    doc.moveDown(0.8);
  }
}

function drawEducation(doc: PDFKit.PDFDocument, resume: ResumeData, theme: keyof typeof COLORS) {
  if (resume.education.length === 0) return;
  
  drawSectionTitle(doc, 'Education', theme);
  
  for (const edu of resume.education) {
    const c = COLORS[theme];
    
    doc.font(FONTS.bold).fontSize(11).fillColor(c.text).text(edu.degree || 'Degree', { continued: true });
    doc.font(FONTS.regular).fillColor(c.muted).fontSize(10).text(`  ${edu.dates}`);
    doc.font(FONTS.bold).fontSize(10).fillColor(c.text).text(edu.institution);
    
    doc.moveDown(0.6);
  }
}

function drawProjects(doc: PDFKit.PDFDocument, resume: ResumeData, theme: keyof typeof COLORS) {
  if (resume.projects.length === 0) return;
  
  drawSectionTitle(doc, 'Projects', theme);
  
  for (const proj of resume.projects) {
    const c = COLORS[theme];
    
    doc.font(FONTS.bold).fontSize(11).fillColor(c.text).text(proj.name || 'Project name');
    doc.font(FONTS.regular).fontSize(10).fillColor(c.text).text(proj.description);
    
    if (proj.link) {
      doc.font(FONTS.italic).fillColor(c.primary).fontSize(9).text(proj.link, { link: proj.link });
    }
    
    doc.moveDown(0.6);
  }
}

function drawSkills(doc: PDFKit.PDFDocument, resume: ResumeData, theme: keyof typeof COLORS) {
  if (resume.skills.length === 0) return;
  
  drawSectionTitle(doc, 'Skills', theme);
  
  const c = COLORS[theme];
  doc.font(FONTS.regular).fontSize(10).fillColor(c.text);
  
  let line = '';
  for (const skill of resume.skills) {
    const testLine = line ? `${line}, ${skill}` : skill;
    if (doc.widthOfString(testLine) > doc.page.width - 128) {
      doc.text(line);
      line = skill;
    } else {
      line = testLine;
    }
  }
  if (line) doc.text(line);
}

function drawProfile(doc: PDFKit.PDFDocument, resume: ResumeData, theme: keyof typeof COLORS) {
  if (!resume.summary) return;
  
  drawSectionTitle(doc, 'Profile', theme);
  doc.font(FONTS.regular).fontSize(10).fillColor(COLORS[theme].text).text(resume.summary, { lineGap: 2 });
  doc.moveDown(0.8);
}

export function generateResumePDF(resume: ResumeData, theme: keyof typeof COLORS = 'modern'): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 64, size: 'A4' });
    const chunks: Buffer[] = [];
    const stream = new PassThrough();

    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);

    doc.pipe(stream);

    // Register fonts if custom fonts are available
    // doc.registerFont('CustomFont', 'path/to/font.ttf');

    let y = drawHeader(doc, resume, theme);
    doc.y = y;

    drawProfile(doc, resume, theme);
    drawExperience(doc, resume, theme);
    drawEducation(doc, resume, theme);
    drawProjects(doc, resume, theme);
    drawSkills(doc, resume, theme);

    doc.end();
  });
}