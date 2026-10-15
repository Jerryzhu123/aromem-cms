
interface FooterLink {
  label: string;
  href: string;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export interface FooterContact {
  title: string;
  address: string;
  phone: string;
  qr: string;
  emails: string[];
}

export interface FooterConfig {
  col1: FooterColumn;
  col2: FooterColumn;
  col3: FooterColumn;
  contact: FooterContact;
  copyright: string;
  icp: { label: string; href: string };
}

/**
 * Reproduces <footer id="mu-footer"> — four link columns plus the copyright
 * bar, identical to the source site in both languages.
 */
export default function SiteFooter({ config }: { config: FooterConfig }) {
  const columns = [config.col1, config.col2, config.col3];
  const { contact } = config;

  return (
    <footer id="mu-footer">
      <div className="mu-footer-top">
        <div className="container">
          <div className="row">
            {columns.map((col) => (
              <div className="col-md-3" key={col.title}>
                <div className="mu-single-footer">
                  <h3>{col.title}</h3>
                  <ul className="mu-useful-links">
                    {col.links.map((link) => (
                      <li key={link.label}>
                        <a href={link.href}>{link.label}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}

            <div className="col-md-3">
              <div className="mu-single-footer">
                <h3>{contact.title}</h3>
                <ul className="list-unstyled">
                  <li className="media">
                    <div className="media-body">
                      <p>{contact.address}</p>
                      <p>
                        {contact.phone}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={contact.qr} style={{ float: "right" }} alt="" />
                      </p>
                      <p>
                        {contact.emails[0]}
                        <br />
                        {contact.emails[1]}
                        <br />
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mu-footer-bottom">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="mu-footer-bottom-area">
                <p className="mu-copy-right">
                  {config.copyright}{" "}
                  <a href={config.icp.href} target="_blank" rel="noreferrer">
                    {config.icp.label}
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
