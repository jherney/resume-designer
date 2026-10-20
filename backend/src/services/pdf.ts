import { readFileSync } from 'fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import puppeteer, { type Browser } from 'puppeteer';
import { ResumePreview } from '../../../shared/resume/ResumePreview.js';
import type { ResumeData, ThemeName } from '../../../shared/resume/types.js';

// Same component and stylesheet as the app's live preview, so the PDF matches it.
// The relative path holds both from src/ (tsx) and dist/backend/src/ (build copies the CSS).
const previewCss = readFileSync(new URL('../../../shared/resume/preview.css', import.meta.url), 'utf8');

let browser: Promise<Browser> | null = null;

function getBrowser(): Promise<Browser> {
  if (!browser) {
    browser = puppeteer.launch({ headless: true });
    browser.then((b) => b.on('disconnected', () => { browser = null; }), () => { browser = null; });
  }
  return browser;
}

function renderHtml(resume: ResumeData, theme: ThemeName): string {
  const body = renderToStaticMarkup(createElement(ResumePreview, { resume, theme }));
  return `<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0}${previewCss}</style></head><body>${body}</body></html>`;
}

export async function generateResumePDF(resume: ResumeData, theme: ThemeName = 'modern'): Promise<Buffer> {
  const page = await (await getBrowser()).newPage();
  try {
    // The document is self-contained: no scripts, no network.
    await page.setJavaScriptEnabled(false);
    await page.setRequestInterception(true);
    page.on('request', (req) => void (req.url().startsWith('data:') ? req.continue() : req.abort()));
    await page.setContent(renderHtml(resume, theme), { waitUntil: 'load' });
    return Buffer.from(await page.pdf({ preferCSSPageSize: true, printBackground: true }));
  } finally {
    await page.close();
  }
}
