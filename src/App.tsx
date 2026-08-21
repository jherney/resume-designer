import { useState } from 'react';
import { sampleResume } from './data/sampleResume';
import type { ResumeData, ThemeName } from './types/resume';

function App() {
  const [resume, setResume] = useState<ResumeData>(sampleResume);
  const [theme, setTheme] = useState<ThemeName>('modern');

  const update = (field: keyof ResumeData, value: string) => {
    setResume((current) => ({ ...current, [field]: value }));
  };

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
          <label>Summary<textarea rows={5} value={resume.summary} onChange={(e) => update('summary', e.target.value)} /></label>
          <label>Theme<select value={theme} onChange={(e) => setTheme(e.target.value as ThemeName)}><option value="modern">Modern</option><option value="classic">Classic</option><option value="minimal">Minimal</option></select></label>
        </aside>
        <article className={`resume-preview theme-${theme}`}>
          <div className="resume-header"><h2>{resume.name}</h2><p>{resume.title}</p><small>{resume.email} · {resume.location}</small></div>
          <section><h3>Profile</h3><p>{resume.summary}</p></section>
          <section><h3>Experience</h3>{resume.experience.map((item) => <div className="experience" key={item.id}><div className="experience-heading"><strong>{item.role}</strong><span>{item.dates}</span></div><p>{item.company}</p>{item.bullets.map((bullet) => <div className="bullet" key={bullet}>• {bullet}</div>)}</div>)}</section>
          <section><h3>Skills</h3><div className="skill-list">{resume.skills.map((skill) => <span key={skill}>{skill}</span>)}</div></section>
        </article>
      </section>
    </main>
  );
}

export default App;
