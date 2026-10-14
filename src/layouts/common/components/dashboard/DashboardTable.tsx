import { useEffect, useState, type ReactNode } from 'react';
import type {
  EmployeeTaskStatisticsResponse,
  InProgressProjectStatisticsResponse,
} from '@/dto/response';
import { getAllProjects } from '@/apis/ProjectApi';
import Table from '@/layouts/common/components/ui/Table';
const date = (value: string) => {
  if (!value) return '-';
  const clean = value.split('T')[0];
  const parts = clean.split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleDateString('vi-VN');
};
const number = (value: number | null | undefined) =>
  value == null
    ? '-'
    : new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 }).format(
        value
      );
export function EmployeeTable({
  rows,
}: {
  rows: EmployeeTaskStatisticsResponse[];
}) {
  return (
    <TableShell title="DANH SÁCH TASK SẮP ĐẾN HẠN">
      <Table>
        <thead>
          <tr>
            <th>Tên Dự Án ↕</th>
            <th>Tên Task</th>
            <th>Ngày Kết Thúc</th>
            <th>Point</th>
            <th>Tiến độ</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 8).map((row) => (
            <tr key={`${row.projectName}-${row.taskName}`}>
              <td>{row.projectName}</td>
              <td>{row.taskName}</td>
              <td>{date(row.endAt)}</td>
              <td>{number(row.taskPoint)}</td>
              <td>
                <div
                  className={`progress progress-${row.progress > 70 ? 'green' : row.progress > 30 ? 'yellow' : 'red'}`}
                >
                  <i style={{ width: `${Math.min(row.progress, 100)}%` }} />
                  <b>{row.progress}%</b>
                </div>
              </td>
              <td className="action">→</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </TableShell>
  );
}
export function ProjectTable({
  rows,
  role,
  onSelectProject,
  onMenuChange,
}: {
  rows: InProgressProjectStatisticsResponse[];
  role: 'ADMIN' | 'PM';
  onSelectProject?: (projectId: number) => void;
  onMenuChange?: (label: string) => void;
}) {
  const [projectMap, setProjectMap] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    let active = true;
    void getAllProjects()
      .then((res) => {
        if (!active) return;
        const map = new Map<string, number>();
        (res.resultList ?? []).forEach((p) => {
          map.set(p.projectName.trim().toLowerCase(), p.id);
        });
        setProjectMap(map);
      })
      .catch(() => {
        // Fallback silently if projects cannot be loaded
      });
    return () => {
      active = false;
    };
  }, []);

  const handleRowClick = async (row: InProgressProjectStatisticsResponse) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let targetId = (row as any).projectId ?? (row as any).id;
    if (!targetId) {
      targetId = projectMap.get(row.projectName.trim().toLowerCase());
    }
    if (!targetId) {
      try {
        const res = await getAllProjects({ keyword: row.projectName.trim() });
        const match =
          res.resultList?.find(
            (p) =>
              p.projectName.trim().toLowerCase() ===
              row.projectName.trim().toLowerCase()
          ) ?? res.resultList?.[0];
        if (match) {
          targetId = match.id;
          setProjectMap((prev) => {
            const next = new Map(prev);
            next.set(row.projectName.trim().toLowerCase(), match.id);
            return next;
          });
        }
      } catch {
        // ignore
      }
    }

    if (targetId) {
      if (onSelectProject) {
        onSelectProject(targetId);
      } else if (onMenuChange) {
        onMenuChange(`Chi tiết dự án ${targetId}`);
      }
    }
  };

  return (
    <TableShell title="DANH SÁCH DỰ ÁN CẦN QUAN TÂM">
      <Table>
        <thead>
          <tr>
            <th>Tên Dự Án ↕</th>
            {role === 'ADMIN' && <th>PM</th>}
            <th>Ngày Kết Thúc</th>
            {role === 'ADMIN' && <th>Ngân sách Khách hàng</th>}
            <th>Ngân sách Dự án (BAC)</th>
            <th>CPI</th>
            <th>SPI</th>
            <th>Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 8).map((row) => (
            <tr
              key={row.projectName}
              className="project-row-clickable"
              onClick={() => void handleRowClick(row)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  void handleRowClick(row);
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`Xem chi tiết dự án ${row.projectName}`}
            >
              <td>
                <b>{row.projectName}</b>
              </td>
              {role === 'ADMIN' && <td>{row.pmName ?? '-'}</td>}
              <td>{date(row.endAt)}</td>
              {role === 'ADMIN' && <td>{number(row.clientBudget)}</td>}
              <td>{number(row.bac)}</td>
              <td>
                <em className={(row.cpi ?? 0) < 1 ? 'bad' : 'good'}>
                  CPI {number(row.cpi)}
                </em>
              </td>
              <td>
                <em className={(row.spi ?? 0) < 1 ? 'bad' : 'good'}>
                  SPI {number(row.spi)}
                </em>
              </td>
              <td>
                <em
                  className={
                    (row.cpi ?? 0) < 1 || (row.spi ?? 0) < 1 ? 'bad' : 'good'
                  }
                >
                  {row.scheduleStatus}
                </em>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </TableShell>
  );
}
function TableShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="dash-panel table-panel">
      <h2>{title}</h2>
      <div className="table-scroll">{children}</div>
      <p className="table-hint">
        Nhấn vào hàng để xem chi tiết Giai đoạn, Nhiệm vụ &amp; Tài chính.
      </p>
    </section>
  );
}
