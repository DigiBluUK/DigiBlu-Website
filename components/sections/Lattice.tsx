import lattice from "@/content/lattice.json";

// The About figure: a 30x30 dot lattice in which the DigiBlu db is drawn by
// dot size alone, plus a second copy of the 78 mark dots filled with the
// brand sweep, whose opacity the geo script drives with --mark-lit. Rendered
// from content/lattice.json (extracted from the old inline SVG by
// scripts/extract-lattice.cjs) rather than 60KB of JSX. The gradient's
// extent is the generator's mark box: OFF = (384 - 0.78 * 384) / 2.
type Dot = { cls: string; cx: number; cy: number; r: number };
const OFF = 42.24;
const BOX = 299.52;

export default function Lattice() {
  const { field, lit } = lattice as { field: Dot[]; lit: Dot[] };
  return (
    <svg className="geo-flow" viewBox="0 0 384 384" fill="currentColor" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="geoBrand" gradientUnits="userSpaceOnUse" x1={OFF} y1={OFF} x2={OFF + BOX} y2={OFF + BOX}>
          <stop offset="0" className="gb1" />
          <stop offset="0.55" className="gb2" />
          <stop offset="1" className="gb3" />
        </linearGradient>
      </defs>
      {field.map((d, i) => (
        <circle key={i} className={d.cls} cx={d.cx} cy={d.cy} r={d.r} />
      ))}
      <g className="mk-lit">
        {lit.map((d, i) => (
          <circle key={i} className={d.cls} cx={d.cx} cy={d.cy} r={d.r} />
        ))}
      </g>
    </svg>
  );
}
