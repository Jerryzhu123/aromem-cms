import { positioning } from "@/data/positioning";

/**
 * 首页第一屏定位条（中英文共用）。
 *
 * 位置：页头之下、轮播之上 —— 原站第一屏是纯图片轮播，没有文字，
 * 定位调整后需要第一眼看得到「做什么 + 三大产品分区」。
 *
 * 样式用内联：不依赖只在滤芯页面加载的 fc.css，也不新增全局 CSS 文件；
 * 图片轮播保留在下方，不动克隆来的轮播数据。
 */
export default function PositioningHero({ lang }: { lang: "zh" | "en" }) {
  const c = positioning(lang);
  const zh = lang === "zh";

  return (
    <section
      id="mu-positioning"
      style={{
        background: "linear-gradient(120deg, #06283d 0%, #0a4f75 55%, #0091ea 100%)",
        color: "#fff",
        padding: zh ? "46px 0 42px" : "46px 0 42px",
      }}
    >
      <div className="container">
        <div
          style={{
            fontSize: 13,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            opacity: 0.85,
            marginBottom: 10,
          }}
        >
          {c.brand}
        </div>

        <h1
          style={{
            fontSize: zh ? 34 : 32,
            lineHeight: 1.25,
            margin: "0 0 12px",
            fontWeight: 600,
            color: "#fff",
          }}
        >
          {c.headline}
        </h1>

        <p style={{ maxWidth: 760, margin: "0 0 22px", fontSize: 15, lineHeight: 1.7, opacity: 0.92 }}>
          {c.sub}
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 22 }}>
          {c.lines.map((line) =>
            line.href ? (
              <a
                key={line.label}
                href={line.href}
                style={{
                  display: "inline-block",
                  padding: "10px 16px",
                  border: "1px solid rgba(255,255,255,.45)",
                  borderRadius: 3,
                  color: "#fff",
                  fontSize: 14,
                  lineHeight: 1,
                }}
              >
                {line.label}
              </a>
            ) : (
              <span
                key={line.label}
                style={{
                  display: "inline-block",
                  padding: "10px 16px",
                  border: "1px dashed rgba(255,255,255,.35)",
                  borderRadius: 3,
                  color: "rgba(255,255,255,.72)",
                  fontSize: 14,
                  lineHeight: 1,
                }}
              >
                {line.label}
                {line.note ? ` · ${line.note}` : ""}
              </span>
            ),
          )}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {c.ctas.map((cta) => (
            <a
              key={cta.label}
              href={cta.href}
              style={{
                display: "inline-block",
                padding: "11px 20px",
                borderRadius: 3,
                fontSize: 14,
                lineHeight: 1,
                background: cta.primary ? "#fff" : "transparent",
                color: cta.primary ? "#0a4f75" : "#fff",
                border: cta.primary ? "1px solid #fff" : "1px solid rgba(255,255,255,.6)",
                fontWeight: cta.primary ? 600 : 400,
              }}
            >
              {cta.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
