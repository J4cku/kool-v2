import type { ReactNode } from 'react';

type WithChildren = {
  children: ReactNode;
  className?: string;
};

function cx(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(' ');
}

export function DsPage({ children, className }: WithChildren) {
  return (
    <main className={cx('min-h-screen pt-[120px] md:pt-[160px] pb-24', className)}>
      {children}
    </main>
  );
}

export function DsContainer({ children, className }: WithChildren) {
  return (
    <div className={cx('max-w-content mx-auto px-5 md:px-10 lg:px-12', className)}>
      {children}
    </div>
  );
}

export function DsSection({
  eyebrow,
  title,
  children,
  className,
}: WithChildren & {
  eyebrow?: string;
  title: string;
}) {
  return (
    <section className={cx('py-12 md:py-16 border-t border-coral/40', className)}>
      <div className="grid gap-8 md:grid-cols-[minmax(180px,0.28fr)_1fr]">
        <div>
          {eyebrow && (
            <p className="text-[12px] font-[700] uppercase tracking-[0.14em] text-coral/70">
              {eyebrow}
            </p>
          )}
          <h2 className="mt-2 text-[28px] md:text-[40px] font-[800] leading-[1.05] uppercase text-dark">
            {title}
          </h2>
        </div>
        <div>{children}</div>
      </div>
    </section>
  );
}

export function DsDisplayText({ children, className }: WithChildren) {
  return (
    <p className={cx('uppercase text-dark font-[700] leading-[1.1] text-[32px] md:text-[54px]', className)}>
      {children}
    </p>
  );
}

export function DsBodyText({ children, className }: WithChildren) {
  return (
    <p className={cx('text-[15px] md:text-[18px] leading-[1.7] font-[300] text-dark', className)}>
      {children}
    </p>
  );
}

export function DsTextLink({
  children,
  href,
  className,
}: WithChildren & {
  href: string;
}) {
  return (
    <a
      href={href}
      className={cx('inline-flex text-[15px] font-[600] uppercase text-coral transition-opacity hover:opacity-60', className)}
    >
      {children}
    </a>
  );
}

export function TokenSwatch({
  name,
  value,
  className,
}: {
  name: string;
  value: string;
  className: string;
}) {
  return (
    <div className="grid gap-3">
      <div className={cx('aspect-[4/3] border border-dark/15', className)} />
      <div>
        <p className="text-[13px] font-[700] uppercase text-dark">{name}</p>
        <p className="text-[13px] font-[400] text-dark/60">{value}</p>
      </div>
    </div>
  );
}

export function TypeSample({
  label,
  children,
  className,
}: WithChildren & {
  label: string;
}) {
  return (
    <div className="border-t border-dark/20 py-5">
      <p className="mb-3 text-[12px] font-[600] uppercase tracking-[0.12em] text-dark/60">
        {label}
      </p>
      <div className={className}>{children}</div>
    </div>
  );
}

export function MediaFrame({ children, className }: WithChildren) {
  return (
    <div className={cx('relative overflow-hidden bg-dark/5', className)}>
      {children}
    </div>
  );
}
