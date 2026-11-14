import { speedup } from "@/lib/site";
import { CountUp } from "@/components/motion/primitives";

/** Before and after, set as two figures; the after value counts up when seen. */
export default function MetricCard({ before, after, label }: { before: string; after: string; label: string | null }) {
  const factor = speedup(before, after);
  const num = parseFloat(after);
  const unit = after.replace(/^[\d.\s]+/, "");
  return (
    <figure className="field p-6 sm:p-8">
      <div className="flex flex-wrap items-baseline gap-x-10 gap-y-4">
        <p className="soft">
          <span className="t-head">{before}</span> before
        </p>
        <p>
          <span className="t-poster tabular-nums">
            {Number.isFinite(num) ? <CountUp to={num} decimals={(after.split(".")[1] ?? "").replace(/\D/g, "").length} /> : after}
            {Number.isFinite(num) && unit}
          </span>{" "}
          after
        </p>
      </div>
      <figcaption className="mt-5">
        {label}
        {factor ? `, ${factor.toFixed(1)} times faster.` : ""}
      </figcaption>
    </figure>
  );
}
