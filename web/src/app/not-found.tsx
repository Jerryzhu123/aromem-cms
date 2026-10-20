import Link from "next/link";

/** 404 兜底页（静态导出会生成 404.html，由 Nginx error_page 指向它） */
export default function NotFound() {
  return (
    <section className="section" style={{ textAlign: "center" }}>
      <div className="wrap">
        <h1 style={{ color: "var(--navy)" }}>Page Not Found</h1>
        <p style={{ color: "var(--muted)", margin: "12px 0 28px" }}>
          The page you are looking for does not exist or has been moved.
        </p>
        <Link href="/" className="btn">
          Back to Home
        </Link>
      </div>
    </section>
  );
}
