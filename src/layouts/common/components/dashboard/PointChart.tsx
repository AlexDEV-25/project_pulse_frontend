export default function PointChart({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(data);
  const max = 200;
  return (
    <div className="chart-scale-wrap point-scale-wrap">
      <div className="chart-scale">
        {[200, 150, 100, 50, 0].map((value) => (
          <span key={value}>{value}</span>
        ))}
      </div>
      <div className="point-chart">
        {entries.map(([name, value]) => (
          <div className="point-column" key={name}>
            <i
              style={{
                height: `${Math.min(Math.max((value / max) * 100, 2), 100)}%`,
              }}
            />
            <span>{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
