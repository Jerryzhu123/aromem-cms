/**
 * Renders the CMS-authored body of a cloned page.
 *
 * The source site stores these bodies as rich HTML (with inline styles, tables
 * and images), so the extraction pass keeps them verbatim and rewrites only the
 * links. Rendering the original markup is what makes the copy, tables and
 * inline formatting match 1:1.
 */
export default function RichContent({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  return (
    <div
      className={className ? `cloned-content ${className}` : "cloned-content"}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
