import { useEffect, useState } from 'react';

const parseSkills = (text: string) => text.split(',').map((skill) => skill.trim()).filter(Boolean);
const sameSkills = (a: string[], b: string[]) => a.length === b.length && a.every((skill, i) => skill === b[i]);

export function SkillsEditor({ skills, onUpdate }: { skills: string[]; onUpdate: (skills: string[]) => void }) {
  // Keep the raw text so a trailing comma survives while typing the next skill.
  const [text, setText] = useState(() => skills.join(', '));

  // Resync when skills change from outside this input (switching or resetting a resume).
  useEffect(() => {
    if (!sameSkills(parseSkills(text), skills)) setText(skills.join(', '));
  }, [skills]);

  return <label>Skills <span className="hint">comma-separated</span><input value={text} onChange={(e) => { setText(e.target.value); onUpdate(parseSkills(e.target.value)); }} /></label>;
}
