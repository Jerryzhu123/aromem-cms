/** Shape of a single cloned page, produced by the extraction pass. */
export interface Banner {
  /** Original element id, e.g. `mu-page-header-about`. */
  id: string;
  /** The banner markup exactly as it appears on the source site. */
  html: string;
}

export interface Crumb {
  text: string;
  /** Already rewritten to a clone route; `null` for the active crumb. */
  href: string | null;
}

export interface PageData {
  /** Source URL on aromem.com. */
  url: string;
  title: string;
  banner: Banner | null;
  breadcrumb: Crumb[];
  /** Body markup (page header removed), with links rewritten to clone routes. */
  content: string;
}

export interface NavItem {
  label: string;
  href: string;
  children?: Array<{ label: string; href: string }>;
}
