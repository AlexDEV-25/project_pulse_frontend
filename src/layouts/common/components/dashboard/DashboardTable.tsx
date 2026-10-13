import type { ReactNode } from 'react';
import type {
  EmployeeTaskStatisticsResponse,
  InProgressProjectStatisticsResponse,
} from '@/dto/response';
import Table from '@/layouts/common/components/ui/Table';
const date = (value: string) =>
  value ? new Date(value).toLocaleDateString('vi-VN') : '-';
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
}: {
  rows: InProgressProjectStatisticsResponse[];
  role: 'ADMIN' | 'PM';
}) {
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
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 8).map((row) => (
            <tr key={row.projectName}>
              <td>{row.projectName}</td>
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
              <td className="action">→</td>
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
