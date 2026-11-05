import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  /** Action ou indicateur affiché à droite du titre. */
  children?: ReactNode;
}) {
  return (
    <section className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="mb-1 text-sm font-medium text-eyebrow">{eyebrow}</p>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        <p className="mt-2 text-sm text-muted">{description}</p>
      </div>
      {children}
    </section>
  );
}
