import { useStore } from '../store';

export function ResumeSidebar() {
  const resumes = useStore((s) => s.resumes);
  const currentId = useStore((s) => s.currentId);
  const selectResume = useStore((s) => s.selectResume);
  const createResume = useStore((s) => s.createResume);
  const deleteResume = useStore((s) => s.deleteResume);
  const duplicateResume = useStore((s) => s.duplicateResume);
  const togglePublic = useStore((s) => s.togglePublic);

  return (
    <aside className="resume-sidebar">
      <button type="button" className="primary-button sidebar-new" onClick={() => void createResume()}>+ New resume</button>
      <ul className="resume-list">
        {resumes.length === 0 && <li className="resume-empty">No resumes yet. Create your first one.</li>}
        {resumes.map((r) => (
          <li key={r.id} className={r.id === currentId ? 'resume-item active' : 'resume-item'}>
            <button type="button" className="resume-item-title" onClick={() => void selectResume(r.id)}>
              <span>{r.title || 'Untitled'}</span>
              {r.isPublic && <span className="resume-badge" title="Public link enabled">public</span>}
            </button>
            <div className="resume-item-actions">
              <button type="button" onClick={() => void duplicateResume(r.id)}>Duplicate</button>
              <button type="button" onClick={() => void togglePublic(r.id, !r.isPublic)}>{r.isPublic ? 'Make private' : 'Make public'}</button>
              <button type="button" className="danger" onClick={() => { if (window.confirm(`Delete "${r.title}"? This cannot be undone.`)) void deleteResume(r.id); }}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}
