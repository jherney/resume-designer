import { useEffect, useRef, useState } from 'react';
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
  const remove = (id: string) => {
    const index = items.findIndex((item) => item.id === id);
    if (index >= 0) setStatus(`Removed ${itemName(items[index], index)}`);
    onUpdate(items.filter((item) => item.id !== id));
  };
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const moveTo = (from: number, to: number) => {
    if (from === to || to < 0 || to >= items.length) return;
    const next = [...items];
    next.splice(to, 0, next.splice(from, 1)[0]);
    onUpdate(next);
  };
  const itemName = (item: CollectionItem, index: number) => ('role' in item ? item.role || item.company : 'degree' in item ? item.degree || item.institution : item.name) || `${labels[collection]} ${index + 1}`;
  const [status, setStatus] = useState('');
  const pendingFocus = useRef<{ id: string; action: string } | null>(null);
  useEffect(() => {
    const target = pendingFocus.current;
    if (!target) return;
    pendingFocus.current = null;
    document.querySelector<HTMLElement>(`[data-item-id="${CSS.escape(target.id)}"] [data-action="${target.action}"]`)?.focus();
  }, [items]);
  const moveByButton = (index: number, delta: number, action: 'up' | 'down') => {
    const to = index + delta;
    if (to < 0 || to >= items.length) return;
    pendingFocus.current = { id: items[index].id, action };
    setStatus(`Moved ${itemName(items[index], index)} to position ${to + 1} of ${items.length}`);
    moveTo(index, to);
  };
  const endDrag = () => { setDragIndex(null); setOverIndex(null); };
  const duplicate = (index: number) => {
    const source = items[index];
    pendingFocus.current = { id: source.id, action: 'duplicate' };
    setStatus(`Duplicated ${itemName(source, index)}`);
    const copy = { ...source, id: crypto.randomUUID() } as CollectionItem;
    if ('bullets' in copy) copy.bullets = [...copy.bullets];
    onUpdate([...items.slice(0, index + 1), copy, ...items.slice(index + 1)]);
  };
  const update = (id: string, patch: Partial<CollectionItem>) => onUpdate(items.map((item) => item.id === id ? { ...item, ...patch } : item));

  return <CollapsibleSection title={labels[collection]} action={<button type="button" className="add-button" onClick={(event) => { event.preventDefault(); add(); }}>+ Add</button>}>
    {items.map((item, index) => <div
      className={`editor-card${dragIndex === index ? ' dragging' : ''}${overIndex === index && dragIndex !== index ? ' drop-target' : ''}`}
      key={item.id}
      data-item-id={item.id}
      onDragOver={(event) => { if (dragIndex === null) return; event.preventDefault(); setOverIndex(index); }}
      onDrop={(event) => { event.preventDefault(); if (dragIndex !== null) moveTo(dragIndex, index); endDrag(); }}
    >
      <div className="card-actions">
        <span
          className="drag-handle"
          aria-hidden="true"
          title="Drag to reorder"
          draggable
          onDragStart={(event) => {
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData('application/x-resume-item', item.id);
            const card = event.currentTarget.closest('.editor-card');
            if (card) event.dataTransfer.setDragImage(card, 16, 16);
            setDragIndex(index);
          }}
          onDragEnd={endDrag}
        >⠿</span>
        <button type="button" className="icon-button" data-action="up" aria-label={`Move ${itemName(item, index)} up`} title="Move up" aria-disabled={index === 0} onClick={() => moveByButton(index, -1, 'up')}>↑</button>
        <button type="button" className="icon-button" data-action="down" aria-label={`Move ${itemName(item, index)} down`} title="Move down" aria-disabled={index === items.length - 1} onClick={() => moveByButton(index, 1, 'down')}>↓</button>
        <button type="button" className="icon-button" data-action="duplicate" aria-label={`Duplicate ${itemName(item, index)}`} onClick={() => duplicate(index)}>Duplicate</button>
        <button type="button" className="remove-button" aria-label={`Remove ${itemName(item, index)}`} onClick={() => remove(item.id)}>Remove</button>
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
    <div role="status" aria-live="polite" className="sr-only">{status}</div>
    {items.length === 0 && <p className="empty-state">No entries yet. Use “+ Add” to create one.</p>}
  </CollapsibleSection>;
}
