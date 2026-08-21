import type { ResumeData, ThemeName } from '../types/resume';

interface PersonalInfoEditorProps {
  resume: ResumeData;
  theme: ThemeName;
  onUpdate: <K extends keyof ResumeData>(field: K, value: ResumeData[K]) => void;
  onThemeChange: (theme: ThemeName) => void;
}

export function PersonalInfoEditor({ resume, theme, onUpdate, onThemeChange }: PersonalInfoEditorProps) {
  return <>
    <h2>Your information</h2>
    <label>Resume title<input value={resume.resumeTitle} onChange={(e) => onUpdate('resumeTitle', e.target.value)} /></label>
    <label>Name<input value={resume.name} onChange={(e) => onUpdate('name', e.target.value)} /></label>
    <label>Professional title<input value={resume.title} onChange={(e) => onUpdate('title', e.target.value)} /></label>
    <label>Email<input type="email" value={resume.email} onChange={(e) => onUpdate('email', e.target.value)} /></label>
    <label>Location<input value={resume.location} onChange={(e) => onUpdate('location', e.target.value)} /></label>
    <label>Summary<textarea rows={4} value={resume.summary} onChange={(e) => onUpdate('summary', e.target.value)} /></label>
    <label>Skills <span className="hint">comma-separated</span><input value={resume.skills.join(', ')} onChange={(e) => onUpdate('skills', e.target.value.split(',').map((skill) => skill.trim()).filter(Boolean))} /></label>
    <label>Theme<select value={theme} onChange={(e) => onThemeChange(e.target.value as ThemeName)}><option value="modern">Modern</option><option value="classic">Classic</option><option value="minimal">Minimal</option></select></label>
  </>;
}
