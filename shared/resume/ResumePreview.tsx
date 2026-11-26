import type { ResumeData, ThemeName } from './types.js';

// Only http(s) links are clickable. A bare "example.com" gets https://; any other scheme (mailto:, javascript:) or non-URL text stays plain text.
function webHref(raw: string): string | undefined {
  const value = raw.trim();
  if (!/^https?:\/\//i.test(value) && /^[a-z][a-z0-9+.-]*:(?!\d)/i.test(value)) return undefined;
  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : undefined;
  } catch {
    return undefined;
  }
}

export function ResumePreview({ resume, theme }: { resume: ResumeData; theme: ThemeName }) {
  return <article className={`resume-preview theme-${theme}`}>
    <div className="resume-header"><h2>{resume.name || 'Your Name'}</h2><p>{resume.title || 'Professional Title'}</p><small>{resume.email}{resume.email && resume.location ? ' · ' : ''}{resume.location}</small></div>
    {resume.summary && <section><h3>Profile</h3><p>{resume.summary}</p></section>}
    {resume.experience.length > 0 && <section><h3>Experience</h3>{resume.experience.map((item) => <div className="experience" key={item.id}><div className="experience-heading"><strong>{item.role || 'Job title'}</strong><span>{item.dates}</span></div><p>{item.company}</p>{item.bullets.filter(Boolean).map((bullet, index) => <div className="bullet" key={`${item.id}-bullet-${index}`}>• {bullet}</div>)}</div>)}</section>}
    {resume.education.length > 0 && <section><h3>Education</h3>{resume.education.map((item) => <div className="experience" key={item.id}><div className="experience-heading"><strong>{item.degree || 'Degree'}</strong><span>{item.dates}</span></div><p>{item.institution}</p></div>)}</section>}
    {resume.projects.length > 0 && <section><h3>Projects</h3>{resume.projects.map((item) => <div className="experience" key={item.id}><strong>{item.name || 'Project name'}</strong><p>{item.description}</p>{item.link && <small>{webHref(item.link) ? <a href={webHref(item.link)} target="_blank" rel="noreferrer">{item.link}</a> : item.link}</small>}</div>)}</section>}
    {resume.skills.length > 0 && <section><h3>Skills</h3><div className="skill-list">{resume.skills.map((skill, index) => <span key={`${skill}-${index}`}>{skill}</span>)}</div></section>}
  </article>;
}
