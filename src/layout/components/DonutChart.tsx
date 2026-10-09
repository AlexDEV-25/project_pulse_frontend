import type { ProjectStatus } from '../../dto/enum';
import type { ProjectStatusStatisticResponse } from '../../dto/response';

const names: Record<string, string> = {
  IN_PROGRESS: 'IN_PROGRESS',
  DONE: 'DONE',
  DRAFT: 'DRAFT',
  ON_HOLD: 'ON_HOLD',
  CANCELLED: 'CANCELLED',
};
const colors: Record<string, string> = {
  IN_PROGRESS: '#4c9889',
  DONE: '#657582',
  DRAFT: '#579988',
  ON_HOLD: '#b65b56',
  CANCELLED: '#d6b878',
};
export default function DonutChart({
  data,
}: {
  data: Record<ProjectStatus, ProjectStatusStatisticResponse>;
}) {
  const entries = Object.entries(data).filter(([, value]) => value.count > 0);
  const total = entries.reduce((sum, [, value]) => sum + value.count, 0);
  let offset = 0;
  const gradient = entries
    .map(([key, value]) => {
      const start = offset;
      offset += (value.count / Math.max(total, 1)) * 100;
      return `${colors[key]} ${start}% ${offset}%`;
    })
    .join(', ');
  return (
    <div className="donut-layout">
      <div
        className="donut"
        style={{
          background: total ? `conic-gradient(${gradient})` : '#e5e7e8',
        }}
      >
        <span>{total}</span>
        <small>dự án</small>
      </div>
      <ul>
        {entries.map(([key, value]) => (
          <li key={key}>
            <i style={{ background: colors[key] }} />
            <span>{names[key] ?? key}</span>
            <b>
              {value.count} ({value.percentage}%)
            </b>
          </li>
        ))}
      </ul>
    </div>
  );
}
