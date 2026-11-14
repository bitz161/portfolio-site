"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

/**
 * A replay of the failover drill from the ProxySQL + Orchestrator write-up, in real time.
 * Every time and count is the measured one (drill of the live stack, kill at 06:15:45.4 UTC);
 * nothing here talks to a server.
 */
const END = 6.9; // kill → first successful write, seconds
const EVENTS: [number, string][] = [
  [0, "docker kill mysql. Nobody touches anything."],
  [0.4, "ProxySQL holds the in-flight write (limit 10 s)."],
  [5.4, "Orchestrator: DeadMaster."],
  [6.2, "mysql-replica promoted, the other replica re-pointed."],
  [6.8, "Old primary fenced: exited, restart policy no."],
  [END, "Write accepted by server_id=2. 0 failed, 0 lost."],
];
const ACKED = 2125; // acknowledged writes in the 1/s loop over the whole drill

type Role = "writer" | "replica" | "dead";
const SPRING = { type: "spring", stiffness: 300, damping: 26 } as const;

export default function FailoverDrill() {
  const [t, setT] = useState<number | null>(null); // seconds since the kill; null = healthy
  const [writes, setWrites] = useState(ACKED - 7);
  const raf = useRef(0);

  const running = t !== null && t < END;
  const done = t !== null && t >= END;
  const promoted = t !== null && t >= 6.2;

  // the 1-per-second write loop: runs while a writer exists
  useEffect(() => {
    if (running) return;
    const id = setInterval(() => setWrites((w) => w + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  function kill() {
    const start = performance.now();
    const tick = (now: number) => {
      const s = Math.min((now - start) / 1000, END);
      setT(s);
      if (s < END) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  }

  const nodes: { name: string; role: Role; note: string }[] = [
    { name: "mysql", role: t === null ? "writer" : "dead", note: t === null ? "primary, read-write" : t >= 6.8 ? "fenced" : "killed" },
    { name: "mysql-replica", role: promoted ? "writer" : "replica", note: promoted ? "primary, read-write" : "replica, lag 0" },
    { name: "mysql-replica-2", role: "replica", note: promoted ? "re-pointed, lag 0" : "replica, lag 0" },
  ];
  const log = t === null ? [] : EVENTS.filter(([at]) => at <= t);

  return (
    <div className="drill" data-ui>
      <div className="drill-top">
        <p>Kill to first write</p>
        <p className="drill-clock" role="timer" aria-live="off">{(t ?? 0).toFixed(1)} s</p>
      </div>

      <div className="drill-route">
        <span>ProxySQL :6033</span>
        <span className={running && !promoted ? "drill-wait" : undefined}>
          {t === null ? "writer: mysql" : promoted ? "writer: mysql-replica" : "writer: none, write held"}
        </span>
      </div>

      <div className="drill-nodes">
        {nodes.map((n) => (
          <motion.div key={n.name} layout className="drill-node" data-role={n.role} animate={{ scale: n.role === "writer" ? 1 : 0.96, y: n.role === "dead" ? 6 : 0 }} transition={SPRING}>
            <b>{n.name}</b>
            {n.note}
          </motion.div>
        ))}
      </div>

      <ol className="drill-log" aria-live="polite">
        <AnimatePresence initial={false}>
          {log.map(([at, text]) => (
            <motion.li key={at} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
              <span className="soft">+{at.toFixed(1)} s</span>
              <span>{text}</span>
            </motion.li>
          ))}
        </AnimatePresence>
        {t === null && <li><span className="soft">ready</span><span>Three servers, one endpoint, a write every second.</span></li>}
      </ol>

      <div className="drill-foot">
        <p>
          Writes acknowledged <b>{writes.toLocaleString("en-US")}</b> · failed <b>0</b>
        </p>
        <motion.button
          className="act act-sm"
          disabled={running}
          whileTap={{ scale: 0.95 }}
          onClick={() => (done ? setT(null) : kill())}
          style={running ? { opacity: 0.5 } : undefined}
        >
          {done ? "Rejoin and run it again" : running ? "Failing over…" : "Kill the primary"}
        </motion.button>
      </div>
    </div>
  );
}
