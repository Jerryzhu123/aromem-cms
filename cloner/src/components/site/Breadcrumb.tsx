import type { Crumb } from "@/types/content";

/**
 * Reproduces <div id="mu-breadcrumb">. The source stores entities such as
 * `&reg;` inside crumb labels, so the text is injected as HTML to stay verbatim.
 */
export default function Breadcrumb({ items }: { items: Crumb[] }) {
  if (!items.length) return null;

  return (
    <div id="mu-breadcrumb">
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <nav aria-label="breadcrumb" role="navigation">
              <ol className="breadcrumb mu-breadcrumb">
                {items.map((item, index) => {
                  const isLast = index === items.length - 1;
                  const active = isLast || !item.href;
                  return (
                    <li
                      className={`breadcrumb-item${active ? " active" : ""}`}
                      aria-current={active ? "page" : undefined}
                      key={`${item.text}-${index}`}
                    >
                      {active || !item.href ? (
                        <span dangerouslySetInnerHTML={{ __html: item.text }} />
                      ) : (
                        <a href={item.href}>
                          <span dangerouslySetInnerHTML={{ __html: item.text }} />
                        </a>
                      )}
                    </li>
                  );
                })}
              </ol>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
