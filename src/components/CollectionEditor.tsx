import { useState } from 'react';
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
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const moveTo = (from: number, to: number) => {
    if (from === to || to < 0 || to >= items.length) return;
    const next = [...items];
    next.splice(to, 0, next.splice(from, 1)[0]);
    onUpdate(next);
  };
  const endDrag = () => { setDragIndex(null); setOverIndex(null); };
  const duplicate = (index: number) => {
    const source = items[index];
    const copy = { ...source, id: crypto.randomUUID() } as CollectionItem;
    if ('bullets' in copy) copy.bullets = [...copy.bullets];
    onUpdate([...items.slice(0, index + 1), copy, ...items.slice(index + 1)]);
  };
  const update = (id: string, patch: Partial<CollectionItem>) => onUpdate(items.map((item) => item.id === id ? { ...item, ...patch } : item));

  return <CollapsibleSection title={labels[collection]} action={<button type="button" className="add-button" onClick={(event) => { event.preventDefault(); add(); }}>+ Add</button>}>
    {items.map((item, index) => <div
      className={`editor-card${dragIndex === index ? ' dragging' : ''}${overIndex === index && dragIndex !== index ? ' drop-target' : ''}`}
      key={item.id}
      onDragOver={(event) => { if (dragIndex === null) return; event.preventDefault(); setOverIndex(index); }}
      onDrop={(event) => { event.preventDefault(); if (dragIndex !== null) moveTo(dragIndex, index); endDrag(); }}
    >
      <div className="card-actions">
        <span
          className="drag-handle"
          role="img"
          aria-label="Drag to reorder"
          title="Drag to reorder"
          draggable
          onDragStart={(event) => {
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData('text/plain', item.id);
            const card = event.currentTarget.closest('.editor-card');
            if (card) event.dataTransfer.setDragImage(card, 16, 16);
            setDragIndex(index);
          }}
          onDragEnd={endDrag}
        >⠿</span>
        <button type="button" className="icon-button" aria-label="Move up" title="Move up" disabled={index === 0} onClick={() => moveTo(index, index - 1)}>↑</button>
        <button type="button" className="icon-button" aria-label="Move down" title="Move down" disabled={index === items.length - 1} onClick={() => moveTo(index, index + 1)}>↓</button>
        <button type="button" className="icon-button" onClick={() => duplicate(index)}>Duplicate</button>
        <button type="button" className="remove-button" onClick={() => remove(item.id)}>Remove</button>
      </div>
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
