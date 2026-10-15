import NewsCarousel from "./NewsCarousel";
import type { HomeData } from "@/types/home";

/** "新闻资讯" — image carousel on the left, headline list + CTA on the right. */
export default function NewsSection({
  news,
}: {
  news: NonNullable<HomeData["news"]>;
}) {
  return (
    <section id="mu-about">
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <div className="mu-about-area">
              <div className="row">
                <div className="col-md-12">
                  <div className="mu-title">
                    <h2>{news.title}</h2>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="mu-about-left">
                    <NewsCarousel slides={news.slides} />
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="mu-about-right">
                    <ul>
                      {news.list.map((item) => (
                        <li key={item.href + item.title}>
                          <h3>
                            <a href={item.href}>{item.title}</a>
                          </h3>
                          <p>{item.excerpt}</p>
                        </li>
                      ))}
                    </ul>
                    {news.button ? (
                      <div className="mu-call-to-action-area">
                        <a
                          href={news.button.href}
                          className="mu-primary-btn mu-quote-btn"
                        >
                          {news.button.label}
                        </a>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
