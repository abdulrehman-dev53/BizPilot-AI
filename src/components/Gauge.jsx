// Cockpit-instrument style radial gauge — the page's signature element.
// Sweeps 220° (like an altimeter dial) with tick marks and a needle.
export default function Gauge({ value, size = 132 }) {
  const hasValue = value !== null && value !== undefined;
  const pct = hasValue ? Math.max(0, Math.min(100, value)) : 0;

  const startAngle = -220; // degrees, measured from 12 o'clock going counter-clockwise
  const sweep = 220;
  const angle = startAngle + (pct / 100) * sweep;

  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 14;

  const toXY = (deg) => {
    const rad = (deg - 90) * (Math.PI / 180);
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
  };

  const ticks = Array.from({ length: 12 }, (_, i) => {
    const deg = startAngle + (i / 11) * sweep;
    const [x1, y1] = toXY(deg);
    const inner = r - 7;
    const rad = (deg - 90) * (Math.PI / 180);
    const x2 = cx + inner * Math.cos(rad);
    const y2 = cy + inner * Math.sin(rad);
    const major = i % 3 === 0;
    return { x1, y1, x2, y2, major };
  });

  const arcPath = (fromDeg, toDeg, radius) => {
    const [x1, y1] = toXY(fromDeg);
    const [x2, y2] = toXY(toDeg);
    const largeArc = toDeg - fromDeg > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  const color = !hasValue ? 'var(--text-faint)' : pct >= 70 ? 'var(--green)' : pct >= 40 ? 'var(--amber)' : 'var(--coral)';
  const [needleX, needleY] = toXY(angle);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <path d={arcPath(startAngle, startAngle + sweep, r)} fill="none" stroke="var(--border)" strokeWidth="8" strokeLinecap="round" />
      {hasValue && (
        <path d={arcPath(startAngle, angle, r)} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" />
      )}
      {ticks.map((t, i) => (
        <line
          key={i}
          x1={t.x1}
          y1={t.y1}
          x2={t.x2}
          y2={t.y2}
          stroke="var(--border)"
          strokeWidth={t.major ? 2 : 1}
        />
      ))}
      {hasValue && (
        <>
          <line x1={cx} y1={cy} x2={needleX} y2={needleY} stroke={color} strokeWidth="2" strokeLinecap="round" />
          <circle cx={cx} cy={cy} r="4" fill={color} />
        </>
      )}
      <text x={cx} y={cy + r * 0.55} textAnchor="middle" fontFamily="var(--font-display)" fontSize="20" fontWeight="700" fill="var(--text)">
        {hasValue ? Math.round(pct) : '—'}
      </text>
    </svg>
  );
}
