import { useEffect, useMemo } from 'react';
import { CollapsibleSection } from './components/CollapsibleSection';
import { CollectionEditor } from './components/CollectionEditor';
import { PersonalInfoEditor } from './components/PersonalInfoEditor';
import { ResumePreview } from '../shared/resume/ResumePreview';
import { AuthScreen } from './components/AuthScreen';
import { ResumeSidebar } from './components/ResumeSidebar';
import { useStore } from './store';
import { validateResume } from './utils/validation';
import type { ResumeData } from './types/resume';

function hasErrorsFor(resume: ResumeData | null): boolean {
  return resume ? Object.keys(validateResume(resume)).length > 0 : false;
}

function Editor() {
  const resume = useStore((s) => s.resume);
  const theme = useStore((s) => s.theme);
  const updateField = useStore((s) => s.updateField);
  const setTheme = useStore((s) => s.setTheme);

  const errors = useMemo(() => (resume ? validateResume(resume) : {}), [resume]);

  if (!resume) {
    return (
      <section className="workspace">
        <aside className="panel editor-panel"><p className="empty-state">Select or create a resume to start editing.</p></aside>
      </section>
    );
  }

  return (
    <section className="workspace">
      <aside className="panel editor-panel">
        <CollapsibleSection title="Personal information">
          <PersonalInfoEditor resume={resume} theme={theme} errors={errors} onUpdate={updateField} onThemeChange={setTheme} />
        </CollapsibleSection>
        <CollectionEditor collection="experience" items={resume.experience} onUpdate={(items) => updateField('experience', items as ResumeData['experience'])} />
        <CollectionEditor collection="education" items={resume.education} onUpdate={(items) => updateField('education', items as ResumeData['education'])} />
        <CollectionEditor collection="projects" items={resume.projects} onUpdate={(items) => updateField('projects', items as ResumeData['projects'])} />
      </aside>
      <ResumePreview resume={resume} theme={theme} />
    </section>
  );
}

export default function App() {
  const init = useStore((s) => s.init);
  const user = useStore((s) => s.user);
  const logout = useStore((s) => s.logout);
  const exportPDF = useStore((s) => s.exportPDF);
  const saveState = useStore((s) => s.saveState);
  const resume = useStore((s) => s.resume);
  const resetCurrent = useStore((s) => s.resetCurrent);

  useEffect(() => {
    void init();
  }, [init]);

  if (!user) return <AuthScreen />;

  const hasErrors = hasErrorsFor(resume);
  const statusText =
    saveState === 'saving' ? 'Saving…' : saveState === 'error' ? 'Save failed' : 'All changes saved';

  const resetResume = () => {
    if (window.confirm('Reset this resume to the sample data? Your saved changes will be replaced.')) {
      resetCurrent();
    }
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <span className="eyebrow">Resume Designer</span>
          <h1>Build a resume that feels like you.</h1>
          <p className="save-status">
            {statusText}
            {hasErrors && ' · Fix required fields before exporting'}
          </p>
        </div>
        <div className="topbar-actions">
          <span className="user-email">{user.email}</span>
          <button type="button" className="secondary-button" onClick={resetResume}>Reset sample</button>
          <button type="button" className="secondary-button" onClick={() => void logout()}>Sign out</button>
          <button type="button" className="primary-button" disabled={hasErrors} onClick={() => void exportPDF()}>Export PDF</button>
        </div>
      </header>
      <div className="layout">
        <ResumeSidebar />
        <Editor />
      </div>
    </main>
  );
}
