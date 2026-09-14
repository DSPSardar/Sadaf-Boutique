import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div role="status" className="flex flex-col items-center px-4 py-16 text-center animate-rise-in">
      {icon ? <div className="mb-4 text-muted">{icon}</div> : null}
      <h3 className="font-display text-2xl">{title}</h3>
      {description ? <p className="mt-2 max-w-sm text-sm text-muted">{description}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
