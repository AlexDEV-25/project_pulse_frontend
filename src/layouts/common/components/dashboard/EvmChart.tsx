import type { ProjectEvAcStatisticResponse } from '@/dto/response';
export default function EvmChart({
  data,
}: {
  data: Record<string, ProjectEvAcStatisticResponse>;
}) {
  const entries = Object.entries(data).slice(0, 8);
  const max = 1000;
  return (
    <>
      <div className="evm-legend">
        <span>
          <i className="ev" />
          EV
        </span>
        <span>
          <i className="ac" />
          AC
        </span>
      </div>
      <div className="chart-scale-wrap">
        <div className="chart-scale">
          {[1000, 800, 600, 400, 200, 0].map((value) => (
            <span key={value}>{value}</span>
          ))}
        </div>
        <div className="evm-chart">
          {entries.map(([name, item]) => (
            <div className="evm-group" key={name}>
              <div className="evm-bars">
                <i
                  className="ev"
                  style={{
                    height: `${Math.min(Math.max((item.ev / max) * 100, 2), 100)}%`,
                  }}
                />
                <i
                  className="ac"
                  style={{
                    height: `${Math.min(Math.max((item.ac / max) * 100, 2), 100)}%`,
                  }}
                />
              </div>
              <small>{name}</small>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
