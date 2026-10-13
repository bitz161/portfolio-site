"use client";

import { useState } from "react";
import { LayoutGroup, motion } from "motion/react";

type Props = { initial: Record<string, string>; groups: string[]; uncategorized: string };
type Msg = { ok: boolean; text: string } | null;

async function call(url: string, method: string, body: unknown) {
  const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).catch(() => null);
  const data = await res?.json().catch(() => ({}));
  if (!res?.ok) throw new Error(data?.error ?? "Request failed.");
  return data;
}

/**
 * One column per skill group, skills as chips. Drag a chip to another column, or click it
 * and then "Move here" (keyboard/touch). Columns can be added, renamed (click the title)
 * and deleted when empty. The Uncategorized column is fixed and always first.
 */
export default function SkillBoard({ initial, groups: initialGroups, uncategorized }: Props) {
  const [map, setMap] = useState(initial);
  const [groups, setGroups] = useState(initialGroups);
  const [picked, setPicked] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [status, setStatus] = useState<Msg>(null);

  const fail = (e: unknown) => setStatus({ ok: false, text: e instanceof Error ? e.message : "Something went wrong." });

  async function move(skill: string, group: string) {
    const prev = map[skill];
    setPicked(null);
    setOver(null);
    if (prev === group) return;
    setMap((m) => ({ ...m, [skill]: group }));
    try {
      await call("/api/admin/skill-categories", "PATCH", { skill, category: group });
      setStatus({ ok: true, text: `${skill} → ${group}` });
    } catch (e) {
      setMap((m) => ({ ...m, [skill]: prev }));
      fail(e);
    }
  }

  async function addGroup(name: string) {
    try {
      const { name: saved } = await call("/api/admin/skill-groups", "POST", { name });
      setGroups((g) => [...g, saved]);
      setStatus({ ok: true, text: `Added column “${saved}”.` });
      return true;
    } catch (e) {
      fail(e);
      return false;
    }
  }

  async function renameGroup(from: string, to: string) {
    setEditing(null);
    if (!to.trim() || to.trim() === from) return;
    try {
      const { name: saved } = await call("/api/admin/skill-groups", "PATCH", { from, to });
      setGroups((g) => g.map((x) => (x === from ? saved : x)));
      setMap((m) => Object.fromEntries(Object.entries(m).map(([s, c]) => [s, c === from ? saved : c])));
      setStatus({ ok: true, text: `Renamed “${from}” to “${saved}”.` });
    } catch (e) {
      fail(e);
    }
  }

  async function deleteGroup(name: string) {
    try {
      await call("/api/admin/skill-groups", "DELETE", { name });
      setGroups((g) => g.filter((x) => x !== name));
      setStatus({ ok: true, text: `Deleted column “${name}”.` });
    } catch (e) {
      fail(e);
    }
  }

  const skills = Object.keys(map).sort((a, b) => a.localeCompare(b));
  const columns = [uncategorized, ...groups.filter((g) => g !== uncategorized)];

  return (
    <>
      <p role="status" className={`mb-4 h-5 text-sm ${status?.ok ? "text-brass-soft" : "text-ember-soft"}`}>
        {picked ? `Moving “${picked}”: pick a column, or click it again to cancel.` : status?.text}
      </p>
      <LayoutGroup>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
          {columns.map((group) => {
            const items = skills.filter((s) => map[s] === group);
            const fixed = group === uncategorized;
            const target = picked && map[picked] !== group;
            return (
              <motion.section
                layout
                key={group}
                onDragOver={(e) => {
                  e.preventDefault();
                  setOver(group);
                }}
                onDragLeave={() => setOver((o) => (o === group ? null : o))}
                onDrop={(e) => {
                  e.preventDefault();
                  const skill = e.dataTransfer.getData("text/plain");
                  if (skill) move(skill, group);
                }}
                className={`surface flex min-h-40 flex-col p-4 transition-colors duration-200 ${over === group ? "border-ember/60 bg-ember/5" : ""} ${fixed && items.length > 0 ? "border-ember/40" : ""}`}
              >
                <header className="mb-3 flex items-center justify-between gap-2">
                  {editing === group ? (
                    <input
                      autoFocus
                      defaultValue={group}
                      maxLength={40}
                      aria-label={`Rename ${group}`}
                      onBlur={(e) => renameGroup(group, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") e.currentTarget.blur();
                        if (e.key === "Escape") setEditing(null);
                      }}
                      className="w-full rounded-md border border-steel-soft bg-transparent px-2 py-0.5 font-mono text-xs tracking-[0.2em] text-steel-soft uppercase focus:outline-none"
                    />
                  ) : fixed ? (
                    <h2 className={`label ${items.length ? "text-ember-soft" : ""}`} title="New skills land here. This column can't be renamed or deleted.">
                      {group}
                    </h2>
                  ) : (
                    <button onClick={() => setEditing(group)} title="Click to rename" className="label truncate text-left hover:text-ink">
                      {group}
                    </button>
                  )}
                  {target ? (
                    <button onClick={() => move(picked!, group)} className="shrink-0 rounded-full bg-ember px-2.5 py-0.5 text-xs font-medium text-bg">
                      Move here
                    </button>
                  ) : !fixed && items.length === 0 && editing !== group ? (
                    <button onClick={() => deleteGroup(group)} aria-label={`Delete column ${group}`} className="shrink-0 rounded-full px-1.5 text-muted hover:text-ember-soft">
                      ×
                    </button>
                  ) : (
                    <span className="shrink-0 font-mono text-xs text-muted">{items.length}</span>
                  )}
                </header>
                <ul className="flex flex-wrap content-start gap-1.5">
                  {items.map((s) => (
                    <motion.li key={s} layout layoutId={`skill-${s}`} transition={{ type: "spring", stiffness: 420, damping: 34 }}>
                      <button
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("text/plain", s);
                          e.dataTransfer.effectAllowed = "move";
                        }}
                        onDragEnd={() => setOver(null)}
                        onClick={() => setPicked((p) => (p === s ? null : s))}
                        aria-pressed={picked === s}
                        className={`cursor-grab rounded-full border px-3 py-1 text-sm transition-colors active:cursor-grabbing ${picked === s ? "border-ember bg-ember/15 text-ink" : "border-line bg-white/[0.03] text-ink/90 hover:border-white/25"}`}
                      >
                        {s}
                      </button>
                    </motion.li>
                  ))}
                  {items.length === 0 && <li className="text-sm text-muted">{fixed ? "New skills land here" : "Drop skills here"}</li>}
                </ul>
              </motion.section>
            );
          })}
          <AddColumn onAdd={addGroup} />
        </div>
      </LayoutGroup>
    </>
  );
}

function AddColumn({ onAdd }: { onAdd: (name: string) => Promise<boolean> }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  if (!open)
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex min-h-40 items-center justify-center rounded-2xl border border-dashed border-line text-sm text-muted transition-colors hover:border-white/25 hover:text-ink"
      >
        + Add column
      </button>
    );
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const input = e.currentTarget.elements.namedItem("name") as HTMLInputElement;
        setBusy(true);
        if (await onAdd(input.value)) setOpen(false);
        setBusy(false);
      }}
      className="flex min-h-40 flex-col justify-center gap-3 rounded-2xl border border-dashed border-ember/50 p-4"
    >
      <input name="name" autoFocus required maxLength={40} placeholder="Column name" aria-label="New column name" className="rounded-xl border border-line bg-white/[0.03] px-3 py-2 text-sm focus:border-steel-soft focus:outline-none" />
      <div className="flex gap-2">
        <button disabled={busy} className="rounded-full bg-ink px-4 py-1.5 text-sm font-medium text-bg disabled:opacity-50">{busy ? "Adding…" : "Add"}</button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-full px-3 py-1.5 text-sm text-muted hover:text-ink">Cancel</button>
      </div>
    </form>
  );
}
