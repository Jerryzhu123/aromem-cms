import type { HomeData } from "@/types/home";

/** "关于我们" — three blog-style cards (culture / profile / contact). */
export default function AboutSection({
  about,
}: {
  about: NonNullable<HomeData["about"]>;
}) {
  return (
    <main>
      <section id="mu-from-blog">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="mu-from-blog-area">
                <div className="row">
                  <div className="col-md-12">
                    <div className="mu-title">
                      <h2>{about.title}</h2>
                    </div>
                  </div>

                  <div className="col-md-12">
                    <div className="mu-from-blog-content">
                      <div className="row">
                        {about.cards.map((card) => (
                          <div className="col-md-4" key={card.href + card.title}>
                            <article className="mu-blog-item">
                              <a href={card.href}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={card.image} alt={card.title} />
                              </a>
                              <div className="mu-blog-item-content">
                                <h2 className="mu-blog-item-title">
                                  <a href={card.href}>{card.title}</a>
                                </h2>
                                <p dangerouslySetInnerHTML={{ __html: card.body }} />
                                <a
                                  className="mu-blg-readmore-btn"
                                  href={card.href}
                                >
                                  {card.readMore}
                                </a>
                              </div>
                            </article>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
