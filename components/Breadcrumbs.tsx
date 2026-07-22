import { Link } from '@/i18n/navigation';

// One crumb in the trail. Ancestors carry an `href` (locale-prefixed by
// next-intl's Link); the current page omits it. Server-renderable so the
// links stay in the crawlable HTML — and reusable by any section (project
// detail, oferta subpages, …) that passes its own ordered items.
export type Crumb = {
  label: string;
  href?: string;
};

export default function Breadcrumbs({
  items,
  className,
}: {
  items: Crumb[];
  className?: string;
}) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] md:text-[12px] font-[600] uppercase tracking-[0.15em]">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="flex items-center gap-x-3">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="text-muted transition-colors duration-200 hover:text-dark"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-dark" aria-current={isLast ? 'page' : undefined}>
                  {item.label}
                </span>
              )}
              {!isLast && (
                <span aria-hidden="true" className="text-muted">
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
