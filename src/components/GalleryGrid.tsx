"use client";

import { useEffect, useState } from "react";

interface Photo {
  name: string;
  date: string;
  size: number;
  url: string;
}

export default function GalleryGrid({ photos }: { photos: Photo[] }) {
  const [lightboxPhoto, setLightboxPhoto] = useState<Photo | null>(null);

  useEffect(() => {
    if (!lightboxPhoto) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxPhoto(null);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [lightboxPhoto]);

  if (photos.length === 0) {
    return (
      <div className="border-2 border-foreground-bright p-12 text-center">
        <p className="font-mono text-sm text-muted">
          The Nextcloud folder is wired up, just empty &mdash; drop images in and they&apos;ll appear here.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="gallery-grid">
        {photos.map((photo) => (
          <GalleryTile key={photo.name} photo={photo} onOpen={() => setLightboxPhoto(photo)} />
        ))}
      </div>

      {lightboxPhoto && (
        <div
          className="lightbox open"
          onClick={(e) => e.target === e.currentTarget && setLightboxPhoto(null)}
        >
          <button className="lightbox-close" onClick={() => setLightboxPhoto(null)}>
            Close &#10005;
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element -- proxied Nextcloud bytes, not optimizable by next/image */}
          <img src={lightboxPhoto.url} alt={lightboxPhoto.name} />
          <div className="lightbox-caption">
            {lightboxPhoto.name} &mdash; {new Date(lightboxPhoto.date).toLocaleDateString()}
          </div>
        </div>
      )}

      <style jsx>{`
        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          grid-auto-rows: 260px;
          grid-auto-flow: dense;
          gap: 2px;
        }
        @media (max-width: 480px) {
          .gallery-grid {
            grid-template-columns: repeat(auto-fill, minmax(46vw, 1fr));
          }
        }

        .lightbox {
          position: fixed;
          inset: 0;
          background: rgba(17, 16, 16, 0.92);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          z-index: 100;
        }
        .lightbox :global(img) {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        }
        .lightbox-caption {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 20px;
          text-align: center;
          font-family: var(--font-mono), ui-monospace, monospace;
          font-size: 0.7rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--background);
        }
        .lightbox-close {
          position: absolute;
          top: 20px;
          right: 28px;
          font-family: var(--font-mono), ui-monospace, monospace;
          font-size: 0.9rem;
          color: var(--background);
          background: none;
          border: 1px solid var(--background);
          padding: 6px 12px;
          cursor: pointer;
        }
        .lightbox-close:hover {
          background: var(--accent);
          border-color: var(--accent);
        }
      `}</style>
    </>
  );
}

function GalleryTile({ photo, onOpen }: { photo: Photo; onOpen: () => void }) {
  const [wide, setWide] = useState(false);

  return (
    <figure className={`gallery-plate ${wide ? "wide" : ""}`} onClick={onOpen}>
      {/* eslint-disable-next-line @next/next/no-img-element -- proxied Nextcloud bytes, not optimizable by next/image */}
      <img
        src={photo.url}
        alt={photo.name}
        loading="lazy"
        onLoad={(e) => {
          const img = e.currentTarget;
          if (img.naturalWidth > img.naturalHeight * 1.1) setWide(true);
        }}
      />
      <figcaption>
        <div className="plate-name">{photo.name}</div>
        <div className="plate-date">{new Date(photo.date).toLocaleDateString()}</div>
      </figcaption>

      <style jsx>{`
        .gallery-plate {
          margin: 0;
          position: relative;
          overflow: hidden;
          cursor: pointer;
          background: var(--border-soft);
          transform: scale(1);
          transition: transform 0.35s ease;
        }
        .gallery-plate.wide {
          grid-column: span 2;
        }
        .gallery-plate:hover {
          transform: scale(1.12);
          z-index: 5;
          box-shadow: 0 12px 32px rgba(17, 16, 16, 0.35);
        }
        .gallery-plate img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        figcaption {
          position: absolute;
          inset: auto 0 0 0;
          padding: 28px 14px 12px;
          background: linear-gradient(to top, rgba(17, 16, 16, 0.85), rgba(17, 16, 16, 0));
          opacity: 0;
          transform: translateY(6px);
          transition: opacity 0.2s ease, transform 0.2s ease;
          pointer-events: none;
        }
        .gallery-plate:hover figcaption {
          opacity: 1;
          transform: translateY(0);
        }
        .plate-name {
          font-family: var(--font-sans), sans-serif;
          font-weight: 700;
          font-size: 0.85rem;
          color: var(--background);
          margin-bottom: 3px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .plate-date {
          font-family: var(--font-mono), ui-monospace, monospace;
          font-size: 0.6rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(248, 245, 239, 0.75);
        }
      `}</style>
    </figure>
  );
}
