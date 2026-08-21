import type { ReactNode } from 'react';

interface CollapsibleSectionProps {
  title: string;
  defaultOpen?: boolean;
  action?: ReactNode;
  children: ReactNode;
}

export function CollapsibleSection({ title, defaultOpen = true, action, children }: CollapsibleSectionProps) {
  return <details className="editor-section" open={defaultOpen}><summary><span>{title}</span>{action}</summary><div className="section-content">{children}</div></details>;
}
