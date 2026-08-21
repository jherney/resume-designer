import { useState } from 'react';
import { sampleResume } from './data/sampleResume';
import type { EducationItem, ExperienceItem, ProjectItem, ResumeData, ThemeName } from './types/resume';

const newExperience = (): ExperienceItem => ({ id: crypto.randomUUID(), company: '', role: '', dates: '', bullets: [''] });
const newEducation = (): EducationItem => ({ id: crypto.randomUUID(), institution: '', degree: '', dates: '' });
const newProject = (): ProjectItem => ({ id: crypto.randomUUID(), name: '', description: '', link: '' });

function App() {
  const [resume, setResume] = useState<ResumeData>(sampleResume);
  const [theme, setTheme] = useState<ThemeName>('modern');

  const update = <K extends keyof ResumeData>(field: K, value: ResumeData[K]) => {
    setResume((current) => ({ ...current, [field]: value }));
  };

  const updateExperience = (id: string, patch: Partial<ExperienceItem>) => {
    update('experience', resume.experience.map((item) => item.id === id ? { ...item, ...patch } : item));
  };

  const updateEducation = (id: string, patch: Partial<EducationItem>) => {
    update('education', resume.education.map((item) => item.id === id ? { ...item, ...patch } : item));
  };

  const updateProject = (id: string, patch: Partial<ProjectItem>) => {
    update('projects', resume.projects.map((item) => item.id === id ? { ...item, ...patch } : item));
  };

  const removeItem = <T extends { id: string }>(items: T[], id: string) => items.filter((item) => item.id !== id);

  return (
    <main className="app-shell">
      <header className="topbar">
        <div><span className="eyebrow">Resume Designer</span><h1>Build a resume that feels like you.</h1></div>
        <button className="primary-button" onClick={() => window.print()}>Export PDF</button>
      </header>
      <section className="workspace">
        <aside className="panel editor-panel">
          <h2>Your information</h2>
          <label>Name<input value={resume.name} onChange={(e) => update('name', e.target.value)} /></label>
          <label>Professional title<input value={resume.title} onChange={(e) => update('title', e.target.value)} /></label>
          <label>Email<input value={resume.email} onChange={(e) => update('email', e.target.value)} /></label>
          <label>Location<input value={resume.location} onChange={(e) => update('location', e.target.value)} /></label>
          <label>Summary<textarea rows={4} value={resume.summary} onChange={(e) => update('summary', e.target.value)} /></label>
          <label>Skills <span className="hint">comma-separated</span><input value={resume.skills.join(', ')} onChange={(e) => update('skills', e.target.value.split(',').map((skill) => skill.trim()).filter(Boolean))} /></label>
          <label>Theme<select value={theme} onChange={(e) => setTheme(e.target.value as ThemeName)}><option value="modern">Modern</option><option value="classic">Classic</option><option value="minimal">Minimal</option></select></label>

          <EditorSection title="Experience" onAdd={() => update('experience', [...resume.experience, newExperience()])}>
            {resume.experience.map((item) => <div className="editor-card" key={item.id}>
              <button className="remove-button" onClick={() => update('experience', removeItem(resume.experience, item.id))}>Remove</button>
              <input placeholder="Job title" value={item.role} onChange={(e) => updateExperience(item.id, { role: e.target.value })} />
              <input placeholder="Company" value={item.company} onChange={(e) => updateExperience(item.id, { company: e.target.value })} />
              <input placeholder="Dates" value={item.dates} onChange={(e) => updateExperience(item.id, { dates: e.target.value })} />
              <textarea rows={3} placeholder="One achievement per line" value={item.bullets.join('\n')} onChange={(e) => updateExperience(item.id, { bullets: e.target.value.split('\n') })} />
            </div>)}
          </EditorSection>

          <EditorSection title="Education" onAdd={() => update('education', [...resume.education, newEducation()])}>
            {resume.education.map((item) => <div className="editor-card" key={item.id}>
              <button className="remove-button" onClick={() => update('education', removeItem(resume.education, item.id))}>Remove</button>
              <input placeholder="Degree or certificate" value={item.degree} onChange={(e) => updateEducation(item.id, { degree: e.target.value })} />
              <input placeholder="Institution" value={item.institution} onChange={(e) => updateEducation(item.id, { institution: e.target.value })} />
              <input placeholder="Dates" value={item.dates} onChange={(e) => updateEducation(item.id, { dates: e.target.value })} />
            </div>)}
          </EditorSection>

          <EditorSection title="Projects" onAdd={() => update('projects', [...resume.projects, newProject()])}>
            {resume.projects.map((item) => <div className="editor-card" key={item.id}>
              <button className="remove-button" onClick={() => update('projects', removeItem(resume.projects, item.id))}>Remove</button>
              <input placeholder="Project name" value={item.name} onChange={(e) => updateProject(item.id, { name: e.target.value })} />
              <textarea rows={3} placeholder="Project description" value={item.description} onChange={(e) => updateProject(item.id, { description: e.target.value })} />
              <input placeholder="Project link" value={item.link} onChange={(e) => updateProject(item.id, { link: e.target.value })} />
            </div>)}
          </EditorSection>
        </aside>

        <article className={`resume-preview theme-${theme}`}>
          <div className="resume-header"><h2>{resume.name}</h2><p>{resume.title}</p><small>{resume.email} · {resume.location}</small></div>
          {resume.summary && <section><h3>Profile</h3><p>{resume.summary}</p></section>}
          {resume.experience.length > 0 && <section><h3>Experience</h3>{resume.experience.map((item) => <div className="experience" key={item.id}><div className="experience-heading"><strong>{item.role || 'Job title'}</strong><span>{item.dates}</span></div><p>{item.company}</p>{item.bullets.filter(Boolean).map((bullet) => <div className="bullet" key={bullet}>• {bullet}</div>)}</div>)}</section>}
          {resume.education.length > 0 && <section><h3>Education</h3>{resume.education.map((item) => <div className="experience" key={item.id}><div className="experience-heading"><strong>{item.degree || 'Degree'}</strong><span>{item.dates}</span></div><p>{item.institution}</p></div>)}</section>}
          {resume.projects.length > 0 && <section><h3>Projects</h3>{resume.projects.map((item) => <div className="experience" key={item.id}><strong>{item.name || 'Project name'}</strong><p>{item.description}</p>{item.link && <small>{item.link}</small>}</div>)}</section>}
          {resume.skills.length > 0 && <section><h3>Skills</h3><div className="skill-list">{resume.skills.map((skill) => <span key={skill}>{skill}</span>)}</div></section>}
        </article>
      </section>
    </main>
  );
}

function EditorSection({ title, onAdd, children }: { title: string; onAdd: () => void; children: React.ReactNode }) {
  return <section className="editor-section"><div className="section-heading"><h3>{title}</h3><button className="add-button" onClick={onAdd}>+ Add</button></div>{children}</section>;
}

export default App;
