import { useEffect, useMemo, useState } from 'react';
import { getProjectTaskCostsFiltered } from '../../../apis/FinanceApi';
import type { TaskCostTransactionResponse } from '../../../dto/response';

type Props = {
  projectId: number;
  rows: TaskCostTransactionResponse[];
  loading: boolean;
  onFilter: (keyword: string, phaseId?: number) => void;
};
const hours = (workdays: number) =>
  (workdays * 8).toLocaleString('vi-VN', { maximumFractionDigits: 2 });
const points = (value: number) =>
  value.toLocaleString('vi-VN', { maximumFractionDigits: 2 });

export function ActualCostTable({
  projectId,
  rows: initialRows,
  loading: initialLoading,
  onFilter,
}: Props) {
  const [rows, setRows] = useState(initialRows);
  const [loading, setLoading] = useState(initialLoading);
  const [error, setError] = useState('');
  const [keyword, setKeyword] = useState('');
  const [phaseId, setPhaseId] = useState('');
  const phases = useMemo(
    () =>
      Array.from(
        new Map(rows.map((row) => [row.phaseId, row.phaseName])).entries()
      ),
    [rows]
  );
  const load = (nextKeyword = keyword, nextPhaseId = phaseId) => {
    setLoading(true);
    setError('');
    void getProjectTaskCostsFiltered(projectId, {
      keyword: nextKeyword.trim() || undefined,
      phaseId: nextPhaseId ? Number(nextPhaseId) : undefined,
    })
      .then((response) => setRows(response.resultList ?? []))
      .catch(() => setError('Không thể tải dữ liệu chi phí thực tế.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load('', '');
    // The table must reload when PM opens another project.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const submitFilter = (nextKeyword = keyword, nextPhaseId = phaseId) => {
    setPhaseId(nextPhaseId);
    load(nextKeyword, nextPhaseId);
    onFilter(nextKeyword, nextPhaseId ? Number(nextPhaseId) : undefined);
  };
  return (
    <section className="actual-cost-panel">
      <div className="actual-cost-toolbar">
        <label className="actual-cost-search">
          <span>⌕</span>
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && submitFilter()}
            placeholder="Tìm kiếm chi phí..."
          />
        </label>
        <select
          value={phaseId}
          onChange={(event) => {
            setPhaseId(event.target.value);
            submitFilter(keyword, event.target.value);
          }}
          aria-label="Chọn giai đoạn"
        >
          <option value="">Tất cả giai đoạn</option>
          {phases.map(([id, name]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>
      </div>
      {error && <div className="project-detail-error">{error}</div>}
      <div className="actual-cost-scroll">
        <table className="actual-cost-table">
          <thead>
            <tr>
              <th>
                <input type="checkbox" aria-label="Chọn tất cả" />
              </th>
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
                <td colSpan={7} className="cost-empty">
                  Đang tải dữ liệu chi phí...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="cost-empty">
                  Chưa có dữ liệu chi phí thực tế.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <input
                      type="checkbox"
                      aria-label={`Chọn nhân viên ${row.employeeName}`}
                    />
                  </td>
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
        </table>
      </div>
      <div className="actual-cost-footer">
        <span>Hiển thị {rows.length} khoản chi</span>
        <div>
          <button aria-label="Trang trước" disabled>
            ‹
          </button>
          <b>1</b>
          <button aria-label="Trang sau" disabled>
            ›
          </button>
        </div>
      </div>
    </section>
  );
}
