"use client";

import { useState } from "react";

/**
 * "SURO-苏瑞膜" video block. Clicking the round play button reveals the video
 * overlay (`.mu-video-iframe-display`, as the source's custom.js does); clicking
 * the overlay closes it again.
 */
export default function VideoSection({
  heading,
  body,
  src,
}: {
  heading: string;
  body: string;
  src: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div id="mu-video">
      <div className="container">
        <div className="row">
          <div className="col-md-6">
            <div className="mu-video-left">
              <a
                href="#"
                className="mu-video-play-btn"
                onClick={(e) => {
                  e.preventDefault();
                  setOpen(true);
                }}
              >
                <i className="fa fa-play" aria-hidden="true" />
              </a>
            </div>
          </div>
          <div className="col-md-6">
            <div className="mu-video-right">
              <h3>{heading}</h3>
              <br />
              <p dangerouslySetInnerHTML={{ __html: body }} />
            </div>
          </div>
        </div>

        <div className="mu-video-popup">
          <div
            className={`mu-video-iframe-area${open ? " mu-video-iframe-display" : ""}`}
            onClick={() => setOpen(false)}
          >
            <video width={800} controls>
              <source src={src} type="video/mp4" />
            </video>
          </div>
        </div>
      </div>
    </div>
  );
}
