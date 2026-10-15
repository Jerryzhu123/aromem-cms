/*
 * The stylesheets below are the SOURCE SITE'S OWN CSS, served verbatim from
 * /public/static/index/css/. They are deliberately loaded as plain <link> tags
 * rather than imported through the bundler: the original files reference their
 * images with relative `url(../images/...)` paths, so moving them into the
 * bundle would break every background image and icon font. Tailwind is
 * intentionally not used either — its preflight would reset Bootstrap's base
 * styles and destroy the 1:1 reproduction.
 */
/* eslint-disable @next/next/no-css-tags, @next/next/google-font-display, @next/next/no-page-custom-font */

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SURMEM | Industrial Filtration & Membrane Solutions",
  description:
    "Industrial filter cartridges, filter housings and RO membrane elements: per-model specifications, cross-reference for the part you run today, and export documentation support.",
  keywords: "SURMEM, filter cartridges, filter housings, RO membrane, cross-reference",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Favicon — the same asset the original site uses. */}
        <link rel="shortcut icon" type="image/icon" href="/favicon.png" />

        {/* The original stylesheet cascade, in the exact order the source site
            loads it (Bootstrap → slick → magnific-popup → the template CSS).
            These are served verbatim from /public/static/index/css/. */}
        <link href="/static/index/css/font-awesome.min.css" rel="stylesheet" />
        <link rel="stylesheet" href="/static/index/css/bootstrap.min.css" />
        <link href="/static/index/css/slick.css" rel="stylesheet" />
        <link href="/static/index/css/magnific-popup.css" rel="stylesheet" />
        <link
          rel="stylesheet"
          type="text/css"
          href="/static/index/css/circle.css"
        />
        <link
          rel="stylesheet"
          type="text/css"
          href="/static/index/css/mystyle.css"
        />
        <link
          rel="stylesheet"
          type="text/css"
          href="/static/index/css/down.css"
        />
        <link href="/static/index/css/style.css" rel="stylesheet" />

        {/* 2026-10-11 导航排版修复：英文不再被挤到第二行（见 mu-nav-fix.css） */}
        <link href="/mu-nav-fix.css" rel="stylesheet" />

        {/* Kept for parity with the source. The source loads them from Google
            Fonts and degrades gracefully when that is unreachable, which is the
            case on the Chinese network — the clone behaves identically. */}
        <link
          href="https://fonts.googleapis.com/css?family=Raleway:300,400,400i,500,500i,600,700"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css?family=Open+Sans:400,400i,600,700,800"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
