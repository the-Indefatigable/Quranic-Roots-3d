import type { navItems } from './navItems';

type NavEntry = (typeof navItems)[number];

/**
 * Which nav item should be marked as the current page.
 *
 * A plain `pathname.startsWith(href)` lights up every ancestor: on
 * /admin/feedback both "Admin" (/admin) and "Feedback" (/admin/feedback)
 * rendered as aria-current="page", so screen readers announced two current
 * pages. This picks the single longest matching href instead, and only matches
 * on path segment boundaries so /roots does not match /rootsomething.
 */
export function isActiveNav(pathname: string, href: string, allHrefs: string[]): boolean {
  const matches = (candidate: string) =>
    pathname === candidate || pathname.startsWith(candidate.endsWith('/') ? candidate : `${candidate}/`);

  if (!matches(href)) return false;

  // Another, more specific item also matches — defer to it.
  return !allHrefs.some((other) => other.length > href.length && matches(other));
}

/** Every href in a nav item list, for use with isActiveNav. */
export function navHrefs(items: readonly NavEntry[]): string[] {
  return items
    .filter((i): i is Extract<NavEntry, { href: string }> => 'href' in i)
    .map((i) => i.href);
}
