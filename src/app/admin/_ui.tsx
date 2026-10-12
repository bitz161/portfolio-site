"use client";

import { useState, type ReactNode } from "react";

export const inputCls =
  "w-full rounded-xl border border-line bg-white/[0.03] px-4 py-2.5 text-sm text-ink placeholder:text-muted/70 transition-colors focus:border-steel-soft focus:outline-none";

export function Field({ label, hint, children, wide }: { label: string; hint?: string; children: ReactNode; wide?: boolean }) {
  return (
    <label className={`block ${wide ? "sm:col-span-2" : ""}`}>
      <span className="mb-1.5 block text-sm text-ink">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="surface p-6">
      <legend className="label px-2">{title}</legend>
      <div className="grid gap-5 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

/** Wraps a fetch so forms get busy / error / success state without repeating it. */
export function useSubmit() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  async function run(req: () => Promise<Response>, okText: string) {
    setBusy(true);
    setMsg(null);
    try {
      const res = await req();
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
      setMsg({ ok: true, text: okText });
      return data;
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Something went wrong." });
      return null;
    } finally {
      setBusy(false);
    }
  }
  return { busy, msg, run };
}

export function SubmitBar({ busy, msg, label }: { busy: boolean; msg: { ok: boolean; text: string } | null; label: string }) {
  return (
    <div className="sticky bottom-4 z-10 flex items-center gap-4 rounded-full border border-line bg-bg/85 py-2 pr-2 pl-5 backdrop-blur-xl">
      <p role="status" className={`flex-1 text-sm ${msg ? (msg.ok ? "text-brass-soft" : "text-ember-soft") : "text-muted"}`}>
        {msg?.text ?? "Unsaved changes are lost if you leave."}
      </p>
      <button type="submit" disabled={busy} className="btn disabled:opacity-50">
        {busy ? "Saving…" : label}
      </button>
    </div>
  );
}
