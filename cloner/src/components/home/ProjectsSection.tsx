import type { HomeData } from "@/types/home";

/** "工程实例" — a grid of case-study cards. */
export default function ProjectsSection({
  projects,
}: {
  projects: NonNullable<HomeData["projects"]>;
}) {
  return (
    <section id="mu-service">
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <div className="mu-service-area">
              <div className="row">
                <div className="col-md-12">
                  <div className="mu-title">
                    <h2>{projects.title}</h2>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-12">
                  <div className="mu-service-content">
                    <div className="row">
                      {projects.cards.map((card) => (
                        <div className="col-md-4" key={card.href + card.title}>
                          <div className="mu-single-service">
                            <div className="mu-single-service-content">
                              <a href={card.href}>
                                <h3>{card.title}</h3>
                                <p>{card.subtitle}</p>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={card.image}
                                  width={350}
                                  height={200}
                                  alt={card.title}
                                />
                              </a>
                            </div>
                          </div>
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
  );
}
