import type { Banner } from "@/types/content";

/**
 * The source site repeats one "page header" banner block on almost every inner
 * page, differing only by a suffix in the id/class names (`-about`, `-news`,
 * `-project`, `-product`, `-producten`, `-join`, …). Each suffix swaps the
 * background image through style.css. This component rebuilds that block from
 * the extracted id so the markup is not duplicated per page.
 */
export default function PageBanner({ banner }: { banner: Banner }) {
  const suffix = banner.id.replace(/^mu-page-header-?/, "");
  const base = suffix ? `mu-page-header-${suffix}` : "mu-page-header";

  // Everything the source puts inside <h1> (some banners carry `&nbsp;<br/>&nbsp;`)
  // and everything between </h1> and the closing </div> (usually three <br />).
  const h1Match = /<h1[^>]*>([\s\S]*?)<\/h1>/i.exec(banner.html);
  const titleHtml = h1Match?.[1] ?? "";
  const afterH1 = h1Match ? banner.html.slice(h1Match.index + h1Match[0].length) : "";
  const closeIdx = afterH1.indexOf("</div>");
  const tailHtml = (closeIdx >= 0 ? afterH1.slice(0, closeIdx) : afterH1).trim();

  return (
    <div id={banner.id}>
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <div className={`${base}-area`}>
              <h1
                className={`${base}-title`}
                dangerouslySetInnerHTML={{ __html: titleHtml }}
              />
              {tailHtml ? (
                <span dangerouslySetInnerHTML={{ __html: tailHtml }} />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
