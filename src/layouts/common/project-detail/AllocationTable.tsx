import { useEffect, useState } from 'react';
import {
  createAllocation,
  deleteAllocation,
  getAllocationsByProject,
  updateAllocation,
} from '@/apis/AllocationApi';
import { getPhasesByProject } from '@/apis/PhaseApi';
import { getProjectMembers } from '@/apis/ProjectMemberApi';
import { getApiErrorMessage } from '@/apis/HttpClient';
import type {
  AllocationResponse,
  PhaseResponse,
  ProjectMemberResponse,
} from '@/dto/response';
import {
  ManagementFilterButton,
  ManagementSearch,
  ManagementSelect,
} from '@/layouts/common/components/dashboard/ManagementFilters';
import Table from '@/layouts/common/components/ui/Table';
import EditButton from '@/layouts/common/components/ui/EditButton';
import DeleteButton from '@/layouts/common/components/ui/DeleteButton';
import { AllocationDetailModal } from './AllocationDetailModal';

const point = (value: number) =>
  value.toLocaleString('vi-VN', { maximumFractionDigits: 2 });

function getInitials(name?: string, id?: number): string {
  if (!name || !name.trim()) return id ? `E${id}` : 'U';
  const clean = name.trim();
  const empMatch = clean.match(/^Employee\s*([0-9]+)$/i);
  if (empMatch) return `E${empMatch[1]}`;

  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function AllocationTable({
  projectId,
  canManage = false,
}: {
  projectId: number;
  canManage?: boolean;
}) {
  const [rows, setRows] = useState<AllocationResponse[]>([]);
  const [phases, setPhases] = useState<PhaseResponse[]>([]);
  const [members, setMembers] = useState<ProjectMemberResponse[]>([]);
  const [keyword, setKeyword] = useState('');
  const [phaseId, setPhaseId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDetail, setSelectedDetail] = useState<AllocationResponse | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AllocationResponse | null>(null);
  const [formPhaseId, setFormPhaseId] = useState('');
  const [formMemberId, setFormMemberId] = useState('');
  const [formPercentage, setFormPercentage] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = (nextKeyword = keyword, nextPhaseId = phaseId) => {
    setLoading(true);
    setError('');
    void getAllocationsByProject(projectId, {
      keyword: nextKeyword,
      phaseId: nextPhaseId ? Number(nextPhaseId) : undefined,
    })
      .then((response) => {
        setRows(response.resultList ?? []);
      })
      .catch(() => setError('Không thể tải dữ liệu phân bổ nhân sự.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let active = true;
    Promise.allSettled([
      getAllocationsByProject(projectId),
      getPhasesByProject(projectId),
      getProjectMembers(projectId),
    ]).then(([allocationResult, phaseResult, memberResult]) => {
      if (!active) return;
      if (allocationResult.status === 'fulfilled')
        setRows(allocationResult.value.resultList ?? []);
      if (phaseResult.status === 'fulfilled')
        setPhases(phaseResult.value.resultList ?? []);
      if (memberResult.status === 'fulfilled')
        setMembers(memberResult.value.resultList ?? []);
      if (allocationResult.status === 'rejected')
        setError('Không thể tải dữ liệu phân bổ nhân sự.');
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [projectId]);

  const openCreate = () => {
    setEditing(null);
    setFormPhaseId('');
    setFormMemberId('');
    setFormPercentage('');
    setFormOpen(true);
    setSelectedDetail(null);
    setError('');
  };
  const openEdit = (row: AllocationResponse) => {
    setEditing(row);
    setFormPhaseId(String(row.phaseId));
    setFormMemberId(String(row.memberId));
    setFormPercentage(String(row.allocationPercentage));
    setFormOpen(true);
    setSelectedDetail(null);
    setError('');
  };
  const cancelForm = () => {
    setFormOpen(false);
    setEditing(null);
    setError('');
  };

  const save = () => {
    const percentage = Number(formPercentage);
    if (
      (!editing && (!formPhaseId || !formMemberId)) ||
      !percentage ||
      percentage <= 0 ||
      percentage > 100
    ) {
      setError('Vui lòng chọn phase, nhân sự và nhập tỷ lệ từ 1 đến 100%.');
      return;
    }
    setSaving(true);
    setError('');
    const request = editing
      ? updateAllocation(editing.id, { allocationPercentage: percentage })
      : createAllocation({
          phaseId: Number(formPhaseId),
          memberId: Number(formMemberId),
          allocationPercentage: percentage,
        });
    void request
      .then(() => {
        cancelForm();
        load();
      })
      .catch((err: unknown) =>
        setError(
          getApiErrorMessage(
            err,
            editing ? 'Không thể cập nhật phân bổ.' : 'Không thể thêm phân bổ.'
          )
        )
      )
      .finally(() => setSaving(false));
  };

  const remove = (row: AllocationResponse) => {
    if (!window.confirm(`Xóa phân bổ của ${row.userName}?`)) return;
    setDeletingId(row.id);
    setError('');
    void deleteAllocation(row.id)
      .then(() => {
        setRows((current) => current.filter((item) => item.id !== row.id));
        if (selectedDetail?.id === row.id) setSelectedDetail(null);
      })
      .catch((err: unknown) =>
        setError(getApiErrorMessage(err, 'Không thể xóa phân bổ.'))
      )
      .finally(() => setDeletingId(null));
  };

  return (
    <section className="allocation-panel">
      {!formOpen && (
        <div className="allocation-toolbar">
          <ManagementSearch
            value={keyword}
            onChange={setKeyword}
            onSearch={() => load()}
            placeholder="Tìm kiếm nhân sự..."
            className="detail-filter-search"
          />
          <ManagementSelect
            value={phaseId}
            onChange={(nextPhaseId) => {
              setPhaseId(nextPhaseId);
              load(keyword, nextPhaseId);
            }}
            placeholder="Tất cả giai đoạn"
            options={phases.map((phase) => ({
              value: String(phase.id),
              label: phase.phaseName,
            }))}
            className="detail-filter-select"
          />
          <ManagementFilterButton onClick={() => load()} />
          {canManage && (
            <button
              className="allocation-add-button"
              type="button"
              onClick={openCreate}
            >
              + Thêm phân bổ
            </button>
          )}
        </div>
      )}
      {error && <div className="allocation-error">{error}</div>}
      {formOpen ? (
        <div className="allocation-form">
          <h3>{editing ? 'Sửa phân bổ nhân sự' : 'Thêm phân bổ nhân sự'}</h3>
          <p>
            {editing
              ? 'Chỉnh sửa tỷ lệ phân bổ cho nhân sự này.'
              : 'Chọn phase, nhân sự và nhập tỷ lệ phân bổ.'}
          </p>
          <div className="allocation-form-fields">
            <label>
              <span>Phase</span>
              <select
                value={formPhaseId}
                onChange={(event) => setFormPhaseId(event.target.value)}
                disabled={Boolean(editing)}
              >
                <option value="">Chọn phase</option>
                {phases.map((phase) => (
                  <option key={phase.id} value={phase.id}>
                    {phase.phaseName}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Nhân sự</span>
              <select
                value={formMemberId}
                onChange={(event) => setFormMemberId(event.target.value)}
                disabled={Boolean(editing)}
              >
                <option value="">Chọn nhân sự</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.userName} (ID: {member.userId})
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Tỷ lệ phân bổ (%)</span>
              <input
                type="number"
                min="1"
                max="100"
                value={formPercentage}
                onChange={(event) => setFormPercentage(event.target.value)}
                placeholder="Ví dụ: 50"
              />
            </label>
          </div>
          <div className="allocation-form-actions">
            <button
              className="allocation-cancel-button"
              type="button"
              onClick={cancelForm}
              disabled={saving}
            >
              Hủy
            </button>
            <button
              className="allocation-save-button"
              type="button"
              onClick={save}
              disabled={saving}
            >
              {saving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </div>
      ) : (
          <Table
            className="allocation-table"
            wrapperClassName="allocation-scroll"
          >
            <thead>
              <tr>
                <th className="col-alloc-name">Tên nhân viên</th>
                <th className="col-alloc-phase">Giai đoạn tham gia</th>
                <th className="col-alloc-rate">Tỷ lệ phân bổ</th>
                <th className="col-alloc-point">Point</th>
                <th className="col-alloc-total">Theo tỷ lệ phân bổ</th>
                {canManage && <th className="col-alloc-actions">Thao tác</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={canManage ? 6 : 5}
                    className="allocation-empty"
                  >
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={canManage ? 6 : 5}
                    className="allocation-empty"
                  >
                    Chưa có dữ liệu phân bổ.
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const percentage = Math.max(
                    0,
                    Math.min(100, row.allocationPercentage)
                  );
                  const tone =
                    percentage >= 100
                      ? 'full'
                      : percentage >= 70
                        ? 'high'
                        : percentage >= 40
                          ? 'medium'
                          : 'low';
                  const overloadedCount =
                    row.overloadedDates?.length ?? 0;
                  return (
                    <tr
                      key={row.id}
                      className="allocation-data-row"
                      onClick={() => setSelectedDetail(row)}
                      title="Nhấn để xem chi tiết phân bổ"
                    >
                      <td className="col-alloc-name">
                        <div className="allocation-person">
                          <div className="allocation-avatar">
                            {getInitials(row.userName, row.userId)}
                          </div>
                          <div className="allocation-person-meta">
                            <b className="allocation-name">
                              {row.userName || 'Chưa cập nhật'}
                            </b>
                            <small className="allocation-id">
                              ID: {row.userId}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td className="col-alloc-phase">
                        <span className="allocation-phase-text">
                          {row.phaseName || '—'}
                        </span>
                      </td>
                      <td className="col-alloc-rate">
                        <div className="allocation-rate-cell">
                          <span className={`allocation-percent ${tone}`}>
                            {percentage}%
                          </span>
                          <div className="allocation-progress">
                            <i style={{ width: `${percentage}%` }} />
                          </div>
                          {overloadedCount > 0 && (
                            <span
                              className="allocation-overload-badge"
                              title={`Quá tải ${overloadedCount} ngày trong phase`}
                            >
                              Quá tải ({overloadedCount} ngày)
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="col-alloc-point">
                        <span className="allocation-point-value">
                          {point(Number(row.resourceRateSnapshot))}
                        </span>
                      </td>
                      <td className="col-alloc-total">
                        <span className="allocation-total-value">
                          {point(Number(row.allocationPoint))}
                        </span>
                      </td>
                      {canManage && (
                        <td className="col-alloc-actions">
                          <div className="allocation-actions">
                            <EditButton
                              onClick={(event) => {
                                event.stopPropagation();
                                openEdit(row);
                              }}
                              title="Sửa phân bổ"
                              aria-label="Sửa phân bổ"
                            />
                            <DeleteButton
                              onClick={(event) => {
                                event.stopPropagation();
                                remove(row);
                              }}
                              disabled={deletingId === row.id}
                              title="Xóa phân bổ"
                              aria-label="Xóa phân bổ"
                            />
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
      )}

      {selectedDetail && (
        <AllocationDetailModal
          allocation={selectedDetail}
          onClose={() => setSelectedDetail(null)}
          onEdit={
            canManage
              ? () => {
                  const target = selectedDetail;
                  setSelectedDetail(null);
                  openEdit(target);
                }
              : undefined
          }
        />
      )}
    </section>
  );
}

