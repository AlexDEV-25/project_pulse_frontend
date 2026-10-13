import { useMemo, useState } from 'react';
import type { TaskCostTransactionResponse } from '@/dto/response';
import {
  ManagementFilterButton,
  ManagementSearch,
  ManagementSelect,
} from '@/layouts/common/components/dashboard/ManagementFilters';
import Table from '@/layouts/common/components/ui/Table';

type Props = {
  rows: TaskCostTransactionResponse[];
  loading: boolean;
  onFilter: (keyword: string, phaseId?: number) => void;
};
const hours = (workdays: number) =>
  (workdays * 8).toLocaleString('vi-VN', { maximumFractionDigits: 2 });
const points = (value: number) =>
  value.toLocaleString('vi-VN', { maximumFractionDigits: 2 });

export function ActualCostTable({
  rows,
  loading,
  onFilter,
}: Props) {
  const [keyword, setKeyword] = useState('');
  const [phaseId, setPhaseId] = useState('');
  const phases = useMemo(
    () =>
      Array.from(
        new Map(rows.map((row) => [row.phaseId, row.phaseName])).entries()
      ),
    [rows]
  );
  const submitFilter = (nextKeyword = keyword, nextPhaseId = phaseId) => {
    setPhaseId(nextPhaseId);
    onFilter(nextKeyword, nextPhaseId ? Number(nextPhaseId) : undefined);
  };
  return (
    <section className="actual-cost-panel">
      <div className="actual-cost-toolbar">
        <ManagementSearch
          value={keyword}
          onChange={setKeyword}
          onSearch={() => submitFilter()}
          placeholder="Tìm kiếm chi phí..."
          className="detail-filter-search"
        />
        <ManagementSelect
          value={phaseId}
          onChange={(nextPhaseId) => {
            setPhaseId(nextPhaseId);
            submitFilter(keyword, nextPhaseId);
          }}
          placeholder="Tất cả giai đoạn"
          options={phases.map(([id, name]) => ({
            value: String(id),
            label: name,
          }))}
          className="detail-filter-select"
        />
        <ManagementFilterButton onClick={() => submitFilter()} />
      </div>
      <Table
        className="actual-cost-table"
        wrapperClassName="actual-cost-scroll"
      >
        <thead>
          <tr>
            <th>Tên nhân viên</th>
            <th>Giai đoạn</th>
            <th>Task / Công việc</th>
            <th>Point</th>
            <th>Số giờ thực tế</th>
            <th>Point thực tế</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={6} className="cost-empty">
                Đang tải dữ liệu chi phí...
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={6} className="cost-empty">
                Chưa có dữ liệu chi phí thực tế.
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id}>
                <td>
                  <div className="cost-person">
                    <b>{row.employeeName || 'Chưa cập nhật'}</b>
                    <small>ID: {row.employeeId}</small>
                  </div>
                </td>
                <td>{row.phaseName}</td>
                <td>{row.taskName}</td>
                <td className="point-value">{points(row.points)}</td>
                <td>{hours(row.workdays)}</td>
                <td className="actual-value">{points(row.points)}</td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </section>
  );
}
