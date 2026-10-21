import type { ResumeData, ThemeName } from '../types/resume';
import type { ValidationErrors } from '../utils/validation';

interface PersonalInfoEditorProps {
  resume: ResumeData;
  theme: ThemeName;
  errors: ValidationErrors;
  onUpdate: <K extends keyof ResumeData>(field: K, value: ResumeData[K]) => void;
  onThemeChange: (theme: ThemeName) => void;
}

const themes: Array<{ name: ThemeName; label: string }> = [
  { name: 'modern', label: 'Modern' },
  { name: 'classic', label: 'Classic' },
  { name: 'minimal', label: 'Minimal' },
];

export function PersonalInfoEditor({ resume, theme, errors, onUpdate, onThemeChange }: PersonalInfoEditorProps) {
  const field = (name: keyof ValidationErrors) => errors[name] ? { 'aria-invalid': true, 'aria-describedby': `${name}-error` } : {};
  return <>
    <h2>Your information</h2>
    <label>Resume title<input {...field('resumeTitle')} value={resume.resumeTitle} onChange={(e) => onUpdate('resumeTitle', e.target.value)} />{errors.resumeTitle && <span className="field-error" id="resumeTitle-error">{errors.resumeTitle}</span>}</label>
    <label>Name<input {...field('name')} value={resume.name} onChange={(e) => onUpdate('name', e.target.value)} />{errors.name && <span className="field-error" id="name-error">{errors.name}</span>}</label>
    <label>Professional title<input {...field('title')} value={resume.title} onChange={(e) => onUpdate('title', e.target.value)} />{errors.title && <span className="field-error" id="title-error">{errors.title}</span>}</label>
    <label>Email<input {...field('email')} type="email" value={resume.email} onChange={(e) => onUpdate('email', e.target.value)} />{errors.email && <span className="field-error" id="email-error">{errors.email}</span>}</label>
    <label>Location<input value={resume.location} onChange={(e) => onUpdate('location', e.target.value)} /></label>
    <label>Summary<textarea rows={4} value={resume.summary} onChange={(e) => onUpdate('summary', e.target.value)} /></label>
    <fieldset className="theme-picker">
      <legend>Theme</legend>
      <div className="theme-options">
        {themes.map(({ name, label }) => (
          <label key={name} className="theme-option">
            <input type="radio" name="theme" value={name} checked={theme === name} onChange={() => onThemeChange(name)} />
            <span className={`theme-thumb thumb-${name}`} aria-hidden="true" />
            <span>{label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  </>;
}
