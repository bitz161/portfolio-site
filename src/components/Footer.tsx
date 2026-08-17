export default function Footer() {
  return (
    <footer className="border-t border-border-soft">
      <div className="mx-auto flex max-w-4xl flex-col gap-1 px-6 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <span>Built and self-hosted on a home Ubuntu/Docker server.</span>
        <span className="text-xs uppercase tracking-wide text-muted/70">
          MySQL &middot; MinIO &middot; Airflow &middot; Tailscale
        </span>
      </div>
    </footer>
  );
}
