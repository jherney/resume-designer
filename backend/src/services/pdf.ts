import { readFileSync } from 'fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import puppeteer, { type Browser } from 'puppeteer-core';
import { ResumePreview } from '../../../shared/resume/ResumePreview.js';
import type { ResumeData, ThemeName } from '../../../shared/resume/types.js';

// Same component and stylesheet as the app's live preview, so the PDF matches it.
// The relative path holds both from src/ (tsx) and dist/backend/src/ (build copies the CSS).
const previewCss = readFileSync(new URL('../../../shared/resume/preview.css', import.meta.url), 'utf8');

// The PDF renderer blocks network requests, so the fonts the preview names are embedded.
const fontFace = (family: string, weight: number, file: string) => {
  const data = readFileSync(new URL(`../../../shared/resume/fonts/${file}`, import.meta.url)).toString('base64');
  return `@font-face{font-family:'${family}';font-weight:${weight};font-style:normal;src:url(data:font/woff2;base64,${data}) format('woff2');}`;
};
const fontCss = [
  fontFace('Public Sans', 400, 'public-sans-latin-400-normal.woff2'),
  fontFace('Public Sans', 600, 'public-sans-latin-600-normal.woff2'),
  fontFace('Newsreader', 500, 'newsreader-latin-500-normal.woff2'),
].join('');

let browser: Promise<Browser> | null = null;

async function launchBrowser(): Promise<Browser> {
  if (process.env.VERCEL) {
    // Serverless: use the bundled Chromium build.
    const { default: chromium } = await import('@sparticuz/chromium');
    return puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    });
  }
  // Local: puppeteer-core does not bundle Chrome, so point it at an installed binary.
  const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
  if (!executablePath) throw new Error('Set PUPPETEER_EXECUTABLE_PATH to a Chrome binary to export PDFs locally.');
  return puppeteer.launch({ executablePath, headless: true });
}

function getBrowser(): Promise<Browser> {
  if (!browser) {
    browser = launchBrowser();
    browser.then((b) => b.on('disconnected', () => { browser = null; }), () => { browser = null; });
  }
  return browser;
}

function renderHtml(resume: ResumeData, theme: ThemeName): string {
  const body = renderToStaticMarkup(createElement(ResumePreview, { resume, theme }));
  return `<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0}${fontCss}${previewCss}</style></head><body>${body}</body></html>`;
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
