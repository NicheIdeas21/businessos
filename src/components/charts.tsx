// Minimal dependency-free chart components using SVG.

interface BarChartProps {
  data: { label: string; value: number }[];
  height?: number;
  formatValue?: (v: number) => string;
  accent?: string;
}

export function BarChart({ data, height = 180, formatValue = (v) => String(v), accent = '#3478F6' }: BarChartProps) {
  const max = Math.max(1, ...data.map(d => d.value));
  const barWidth = 100 / Math.max(1, data.length);
  return (
    <div className="w-full" style={{ height }}>
      <svg viewBox={`0 0 100 ${height / 3}`} preserveAspectRatio="none" className="w-full" style={{ height }}>
        {data.map((d, i) => {
          const h = (d.value / max) * (height / 3 - 8);
          const x = i * barWidth + barWidth * 0.2;
          const w = barWidth * 0.6;
          const y = height / 3 - h - 4;
          return (
            <g key={i}>
              <rect x={x} y={y} width={w} height={h} rx={1} fill={accent} opacity={0.9} />
            </g>
          );
        })}
      </svg>
      <div className="flex justify-between mt-2 text-[10px] text-cloud-500">
        {data.map((d, i) => (
          <div key={i} className="flex-1 text-center truncate px-1" title={`${d.label}: ${formatValue(d.value)}`}>{d.label}</div>
        ))}
      </div>
    </div>
  );
}

interface LineChartProps {
  data: { label: string; value: number }[];
  height?: number;
  formatValue?: (v: number) => string;
  accent?: string;
}

export function LineChart({ data, height = 180, formatValue = (v) => String(v), accent = '#3478F6' }: LineChartProps) {
  if (data.length === 0) return <div style={{ height }} />;
  const max = Math.max(1, ...data.map(d => d.value));
  const min = Math.min(0, ...data.map(d => d.value));
  const range = max - min || 1;
  const W = 100, H = height / 3;
  const stepX = data.length > 1 ? W / (data.length - 1) : W;
  const points = data.map((d, i) => {
    const x = i * stepX;
    const y = H - ((d.value - min) / range) * (H - 8) - 4;
    return { x, y, d };
  });
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaPath = `${path} L${W},${H} L0,${H} Z`;
  return (
    <div className="w-full" style={{ height }}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full" style={{ height }}>
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity="0.25" />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#lineGrad)" />
        <path d={path} fill="none" stroke={accent} strokeWidth="1.5" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="1.4" fill={accent} vectorEffect="non-scaling-stroke" />
        ))}
      </svg>
      <div className="flex justify-between mt-2 text-[10px] text-cloud-500">
        {data.map((d, i) => (
          <div key={i} className="flex-1 text-center truncate px-1" title={`${d.label}: ${formatValue(d.value)}`}>{d.label}</div>
        ))}
      </div>
    </div>
  );
}

interface DonutProps {
  segments: { label: string; value: number; color: string }[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string;
}

export function Donut({ segments, size = 160, thickness = 18, centerLabel, centerValue }: DonutProps) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="flex items-center gap-5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#EEF2F7" strokeWidth={thickness} />
          {segments.map((s, i) => {
            const len = (s.value / total) * c;
            const el = (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={s.color}
                strokeWidth={thickness}
                strokeDasharray={`${len} ${c - len}`}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
              />
            );
            offset += len;
            return el;
          })}
        </svg>
        {(centerLabel || centerValue) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {centerValue && <span className="text-lg font-semibold text-navy-800">{centerValue}</span>}
            {centerLabel && <span className="text-[11px] text-cloud-500">{centerLabel}</span>}
          </div>
        )}
      </div>
      <div className="space-y-1.5">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ background: s.color }} />
            <span className="text-cloud-700">{s.label}</span>
            <span className="text-navy-700 font-medium ml-auto">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
