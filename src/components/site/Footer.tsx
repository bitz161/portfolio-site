import Link from "next/link";
import { SITE } from "@/lib/site";

const out = { target: "_blank", rel: "noopener noreferrer" };

export default function Footer() {
  return (
    <footer className="site-foot">
      <div className="shell foot-cols">
        <div>
          <p>Pages</p>
          <ul>
            <li><Link className="link" href="/projects">Work</Link></li>
            <li><Link className="link" href="/blog">Writing</Link></li>
            <li><Link className="link" href="/about">About</Link></li>
          </ul>
        </div>
        <div>
          <p>Elsewhere</p>
          <ul>
            <li><a className="link" href={SITE.github} {...out}>GitHub</a></li>
            <li><a className="link" href={SITE.linkedin} {...out}>LinkedIn</a></li>
            <li><a className="link" href={`mailto:${SITE.email}`}>Email</a></li>
          </ul>
        </div>
        <div>
          <p>This site</p>
          <p>Self-hosted on a home server: Docker, MySQL, MinIO, Tailscale.</p>
          <p>
            If it is down, <a className="link" href={SITE.statusPage}>here is how to reach me</a>.
          </p>
        </div>
        <div>
          <p>Photographs</p>
          <p>
            <a className="link" href="https://unsplash.com/photos/M5tzZtFCOfs" {...out}>Server racks</a> by Taylor Vick and{" "}
            <a className="link" href="https://unsplash.com/photos/eVWWr6nmDf8" {...out}>fibre switch</a> by Kirill Sh, on Unsplash.
          </p>
        </div>
      </div>
      <span />
      <div className="shell">
        {/* fitted to the width at every size: the name never wraps */}
        <svg className="foot-word" viewBox="0 0 640 96" role="img" aria-label="Josue Garcia">
          <text x="0" y="88" fontSize="118" textLength="640" lengthAdjust="spacingAndGlyphs">Josue Garcia</text>
        </svg>
        <p className="t-small mt-5">© 2026 Josue Garcia</p>
      </div>
    </footer>
  );
}
