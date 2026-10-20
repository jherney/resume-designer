import { create } from 'zustand';
import { api, getAuthToken, setAuthToken, clearAuthToken } from './api/client';
import { sampleResume } from './data/sampleResume';
import { normalizeState } from './utils/validation';
import type { ResumeData, ThemeName } from './types/resume';

interface User {
  id: string;
  email: string;
  name?: string;
}

export interface ResumeMeta {
  id: string;
  title: string;
  theme: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

type SaveState = 'saved' | 'saving' | 'error';

const FALLBACK: { resume: ResumeData; theme: ThemeName } = { resume: sampleResume, theme: 'modern' };

function normalize(data: unknown, theme: unknown): { resume: ResumeData; theme: ThemeName } {
  return normalizeState({ resume: data, theme }, FALLBACK);
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;

interface AppState {
  user: User | null;
  resumes: ResumeMeta[];
  currentId: string | null;
  resume: ResumeData | null;
  theme: ThemeName;
  saveState: SaveState;
  busy: boolean;
  error: string | null;

  init: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;

  loadResumes: () => Promise<void>;
  selectResume: (id: string) => Promise<void>;
  createResume: () => Promise<void>;
  deleteResume: (id: string) => Promise<void>;
  duplicateResume: (id: string) => Promise<void>;
  togglePublic: (id: string, isPublic: boolean) => Promise<void>;

  updateField: <K extends keyof ResumeData>(field: K, value: ResumeData[K]) => void;
  setTheme: (theme: ThemeName) => void;
  resetCurrent: () => void;
  exportPDF: () => Promise<void>;
}

export const useStore = create<AppState>((set, get) => {
  function scheduleSave() {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => void persist(), 500);
  }

  async function persist() {
    const { currentId, resume, theme } = get();
    if (!currentId || !resume) return;
    try {
      const { resume: saved } = await api.resumes.update(currentId, {
        title: resume.resumeTitle,
        data: resume,
        theme,
      });
      set((state) => ({
        saveState: 'saved',
        resumes: state.resumes.map((r) =>
          r.id === currentId ? { ...r, title: saved.title ?? resume.resumeTitle, theme } : r,
        ),
      }));
    } catch {
      set({ saveState: 'error' });
    }
  }

  return {
    user: null,
    resumes: [],
    currentId: null,
    resume: null,
    theme: 'modern',
    saveState: 'saved',
    busy: false,
    error: null,

    async init() {
      const token = getAuthToken();
      if (!token) return;
      try {
        const { user } = await api.auth.me();
        set({ user, error: null });
        await get().loadResumes();
      } catch {
        clearAuthToken();
        set({ user: null });
      }
    },

    async login(email, password) {
      set({ busy: true, error: null });
      try {
        const { user, token } = await api.auth.login(email, password);
        setAuthToken(token);
        set({ user });
        await get().loadResumes();
      } finally {
        set({ busy: false });
      }
    },

    async register(email, password, name) {
      set({ busy: true, error: null });
      try {
        const { user, token } = await api.auth.register(email, password, name);
        setAuthToken(token);
        set({ user });
        await get().loadResumes();
      } finally {
        set({ busy: false });
      }
    },

    logout() {
      if (saveTimer) clearTimeout(saveTimer);
      saveTimer = null;
      clearAuthToken();
      void api.auth.logout().catch(() => undefined);
      set({ user: null, resumes: [], currentId: null, resume: null, theme: 'modern', error: null });
    },

    async loadResumes() {
      const { resumes } = await api.resumes.list();
      set({ resumes });
      if (resumes.length > 0 && !get().currentId) {
        await get().selectResume(resumes[0].id);
      } else if (resumes.length === 0) {
        set({ currentId: null, resume: null });
      }
    },

    async selectResume(id) {
      // Flush a pending edit so it is saved to the resume being left, not the new one.
      if (saveTimer) {
        clearTimeout(saveTimer);
        saveTimer = null;
        await persist();
      }
      const { resume } = await api.resumes.get(id);
      const normalized = normalize(resume.data, resume.theme);
      set({
        currentId: id,
        resume: normalized.resume,
        theme: normalized.theme,
        saveState: 'saved',
      });
    },

    async createResume() {
      const data = structuredClone(sampleResume);
      data.resumeTitle = 'Untitled Resume';
      const { resume } = await api.resumes.create({ title: data.resumeTitle, data, theme: 'modern' });
      const normalized = normalize(resume.data, resume.theme);
      const meta: ResumeMeta = {
        id: resume.id,
        title: resume.title,
        theme: resume.theme,
        isPublic: resume.isPublic ?? false,
        createdAt: resume.createdAt,
        updatedAt: resume.updatedAt,
      };
      set((state) => ({
        resumes: [meta, ...state.resumes],
        currentId: resume.id,
        resume: normalized.resume,
        theme: normalized.theme,
        saveState: 'saved',
      }));
    },

    async deleteResume(id) {
      await api.resumes.delete(id);
      const remaining = get().resumes.filter((r) => r.id !== id);
      set({ resumes: remaining });
      if (get().currentId === id) {
        if (remaining.length > 0) {
          await get().selectResume(remaining[0].id);
        } else {
          set({ currentId: null, resume: null });
        }
      }
    },

    async duplicateResume(id) {
      const { resume } = await api.resumes.duplicate(id);
      const meta: ResumeMeta = {
        id: resume.id,
        title: resume.title,
        theme: resume.theme,
        isPublic: resume.isPublic ?? false,
        createdAt: resume.createdAt,
        updatedAt: resume.updatedAt,
      };
      set((state) => ({ resumes: [meta, ...state.resumes] }));
    },

    async togglePublic(id, isPublic) {
      await api.resumes.update(id, { isPublic });
      set((state) => ({
        resumes: state.resumes.map((r) => (r.id === id ? { ...r, isPublic } : r)),
      }));
    },

    updateField(field, value) {
      set((state) => ({
        resume: state.resume ? { ...state.resume, [field]: value } : null,
        saveState: 'saving',
      }));
      scheduleSave();
    },

    setTheme(theme) {
      set({ theme, saveState: 'saving' });
      scheduleSave();
    },

    resetCurrent() {
      const data = structuredClone(sampleResume);
      set({ resume: data, theme: 'modern', saveState: 'saving' });
      scheduleSave();
    },

    async exportPDF() {
      const { theme, resume } = get();
      if (!resume) return;
      const blob = await api.pdf.generate(resume, theme);
      const filename = `${resume.resumeTitle || 'resume'}.pdf`;
      if ('__TAURI_INTERNALS__' in window) {
        // Webview ignores anchor downloads; ask where to save and write the file natively.
        const [{ save }, { writeFile }] = await Promise.all([
          import('@tauri-apps/plugin-dialog'),
          import('@tauri-apps/plugin-fs'),
        ]);
        const path = await save({ defaultPath: filename, filters: [{ name: 'PDF', extensions: ['pdf'] }] });
        if (path) await writeFile(path, new Uint8Array(await blob.arrayBuffer()));
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    },
  };
});
