import { useReveal } from "../hooks/useReveal";

/** Section heading with a small blue index number in front of it. */
export default function SectionTitle({ id, index, children }) {
  const ref = useReveal();

  return (
    <h2
      id={id}
      ref={ref}
      className="reveal text-head flex items-baseline gap-4 font-medium tracking-[-0.02em] text-white"
    >
      <span className="text-small text-brand-400 font-medium tabular-nums">
        {String(index).padStart(2, "0")}
      </span>
      {children}
    </h2>
  );
}
