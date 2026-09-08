export default function Footer() {
  return (
    <footer className="border-t border-border bg-card text-muted">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-6 py-8 text-sm sm:flex-row sm:items-center sm:justify-between">
        <span>Built and self-hosted on a home Ubuntu/Docker server.</span>
        <span className="font-mono text-[11px] tracking-[0.1em] text-muted/70 uppercase">
          MySQL &middot; MinIO &middot; Airflow &middot; Tailscale
        </span>
      </div>
    </footer>
  );
}
