# Resume Designer

A cross-platform resume designer built with React, TypeScript, Vite, Tauri, and Rust. The first milestone is a browser-based editor with live preview, theme selection, and print-to-PDF export.

## Development

```bash
npm install
npm run dev
```

## Roadmap

- [x] Structured resume data
- [x] Live preview
- [x] Initial themes
- [x] Editable experience, education, projects, and skills
- [x] Auto-save (debounced, to the backend)
- [x] Reusable editor components and collapsible sections
- [x] Client-side validation
- [x] Browser print-to-PDF
- [x] Authentication and cloud persistence (JWT + Prisma/SQLite)
- [x] Hosted API with resume CRUD
- [x] Server-side PDF generation
- [x] Tauri desktop packaging

## Desktop app (Tauri)

Requires Rust and the Tauri system dependencies (on Linux: `webkit2gtk-4.1`).
The desktop app is a thin shell around the web UI and still talks to the backend API.

```bash
npm run tauri dev                      # dev window with hot reload
VITE_API_URL=https://your-api/api npm run tauri build   # installers in src-tauri/target/release/bundle
```

Add `tauri://localhost,http://tauri.localhost` to the backend's comma-separated `FRONTEND_URL`
so the desktop webview passes CORS. PDF export opens a native save dialog.

## PDF export

The backend renders the same `shared/resume` preview component and stylesheet the editor shows, then prints it
with headless Chrome via Puppeteer, so exports match the live preview. Install Puppeteer's browser with
`cd backend && npx puppeteer browsers install chrome`, or set `PUPPETEER_EXECUTABLE_PATH` in `backend/.env`
to an installed Chrome.
