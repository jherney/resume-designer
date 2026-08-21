import { useEffect, useState } from 'react';
import { CollapsibleSection } from './components/CollapsibleSection';
import { CollectionEditor } from './components/CollectionEditor';
import { PersonalInfoEditor } from './components/PersonalInfoEditor';
import { ResumePreview } from './components/ResumePreview';
import { sampleResume } from './data/sampleResume';
import type { ResumeData, StoredResumeState, ThemeName } from './types/resume';

const STORAGE_KEY = 'resume-designer-state';

function loadState(): StoredResumeState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved) as StoredResumeState;
  } catch { /* Ignore malformed or unavailable browser storage. */ }
  return { resume: sampleResume, theme: 'modern' };
}

function App() {
  const [initialState] = useState(loadState);
  const [resume, setResume] = useState<ResumeData>(initialState.resume);
  const [theme, setTheme] = useState<ThemeName>(initialState.theme);
  const [saveState, setSaveState] = useState<'saved' | 'saving'>('saved');

  useEffect(() => {
    setSaveState('saving');
    const timer = window.setTimeout(() => {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ resume, theme })); } catch { /* Storage may be unavailable. */ }
      setSaveState('saved');
    }, 300);
    return () => window.clearTimeout(timer);
  }, [resume, theme]);

  const update = <K extends keyof ResumeData>(field: K, value: ResumeData[K]) => setResume((current) => ({ ...current, [field]: value }));
  const resetResume = () => {
    if (window.confirm('Reset this resume to the sample data? Your current local changes will be replaced.')) {
      setResume(structuredClone(sampleResume));
      setTheme('modern');
    }
  };

  return <main className="app-shell">
    <header className="topbar">
      <div><span className="eyebrow">Resume Designer</span><h1>Build a resume that feels like you.</h1><p className="save-status">{saveState === 'saving' ? 'Saving locally…' : 'Saved locally'}</p></div>
      <div className="topbar-actions"><button type="button" className="secondary-button" onClick={resetResume}>Reset sample</button><button type="button" className="primary-button" onClick={() => window.print()}>Export PDF</button></div>
    </header>
    <section className="workspace">
      <aside className="panel editor-panel">
        <CollapsibleSection title="Personal information"><PersonalInfoEditor resume={resume} theme={theme} onUpdate={update} onThemeChange={setTheme} /></CollapsibleSection>
        <CollectionEditor collection="experience" items={resume.experience} onUpdate={(items) => update('experience', items as ResumeData['experience'])} />
        <CollectionEditor collection="education" items={resume.education} onUpdate={(items) => update('education', items as ResumeData['education'])} />
        <CollectionEditor collection="projects" items={resume.projects} onUpdate={(items) => update('projects', items as ResumeData['projects'])} />
      </aside>
      <ResumePreview resume={resume} theme={theme} />
    </section>
  </main>;
}

export default App;
