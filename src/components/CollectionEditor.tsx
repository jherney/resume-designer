import type { EducationItem, ExperienceItem, ProjectItem } from '../types/resume';
import { CollapsibleSection } from './CollapsibleSection';

type Collection = 'experience' | 'education' | 'projects';
type CollectionItem = ExperienceItem | EducationItem | ProjectItem;

interface CollectionEditorProps {
  collection: Collection;
  items: CollectionItem[];
  onUpdate: (items: CollectionItem[]) => void;
}

const labels: Record<Collection, string> = { experience: 'Experience', education: 'Education', projects: 'Projects' };
const createItem = (collection: Collection): CollectionItem => {
  const id = crypto.randomUUID();
  if (collection === 'experience') return { id, company: '', role: '', dates: '', bullets: [''] };
  if (collection === 'education') return { id, institution: '', degree: '', dates: '' };
  return { id, name: '', description: '', link: '' };
};

export function CollectionEditor({ collection, items, onUpdate }: CollectionEditorProps) {
  const add = () => onUpdate([...items, createItem(collection)]);
  const remove = (id: string) => onUpdate(items.filter((item) => item.id !== id));
  const update = (id: string, patch: Partial<CollectionItem>) => onUpdate(items.map((item) => item.id === id ? { ...item, ...patch } : item));

  return <CollapsibleSection title={labels[collection]} action={<button type="button" className="add-button" onClick={(event) => { event.preventDefault(); add(); }}>+ Add</button>}>
    {items.map((item) => <div className="editor-card" key={item.id}>
      <button type="button" className="remove-button" onClick={() => remove(item.id)}>Remove</button>
      {collection === 'experience' && <>
        <input placeholder="Job title" value={(item as ExperienceItem).role} onChange={(e) => update(item.id, { role: e.target.value })} />
        <input placeholder="Company" value={(item as ExperienceItem).company} onChange={(e) => update(item.id, { company: e.target.value })} />
        <input placeholder="Dates" value={(item as ExperienceItem).dates} onChange={(e) => update(item.id, { dates: e.target.value })} />
        <textarea rows={3} placeholder="One achievement per line" value={(item as ExperienceItem).bullets.join('\n')} onChange={(e) => update(item.id, { bullets: e.target.value.split('\n') })} />
      </>}
      {collection === 'education' && <>
        <input placeholder="Degree or certificate" value={(item as EducationItem).degree} onChange={(e) => update(item.id, { degree: e.target.value })} />
        <input placeholder="Institution" value={(item as EducationItem).institution} onChange={(e) => update(item.id, { institution: e.target.value })} />
        <input placeholder="Dates" value={(item as EducationItem).dates} onChange={(e) => update(item.id, { dates: e.target.value })} />
      </>}
      {collection === 'projects' && <>
        <input placeholder="Project name" value={(item as ProjectItem).name} onChange={(e) => update(item.id, { name: e.target.value })} />
        <textarea rows={3} placeholder="Project description" value={(item as ProjectItem).description} onChange={(e) => update(item.id, { description: e.target.value })} />
        <input placeholder="Project link" value={(item as ProjectItem).link ?? ''} onChange={(e) => update(item.id, { link: e.target.value })} />
      </>}
    </div>)}
    {items.length === 0 && <p className="empty-state">No entries yet. Use “+ Add” to create one.</p>}
  </CollapsibleSection>;
}
