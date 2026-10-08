import { useEffect, useState } from 'react';
import { createAllocation, deleteAllocation, getAllocationsByProject, updateAllocation } from '../../../apis/AllocationApi';
import { getPhasesByProject } from '../../../apis/PhaseApi';
import { getProjectMembers } from '../../../apis/ProjectMemberApi';
import type { AllocationResponse, PhaseResponse, ProjectMemberResponse } from '../../../dto/response';

const PAGE_SIZE = 5;
const point = (value: number) => value.toLocaleString('vi-VN', { maximumFractionDigits: 2 });

export function AllocationTable({ projectId, canManage = false }: { projectId: number; canManage?: boolean }) {
  const [rows, setRows] = useState<AllocationResponse[]>([]);
  const [phases, setPhases] = useState<PhaseResponse[]>([]);
  const [members, setMembers] = useState<ProjectMemberResponse[]>([]);
  const [keyword, setKeyword] = useState('');
  const [phaseId, setPhaseId] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AllocationResponse | null>(null);
  const [formPhaseId, setFormPhaseId] = useState('');
  const [formMemberId, setFormMemberId] = useState('');
  const [formPercentage, setFormPercentage] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = (nextKeyword = keyword, nextPhaseId = phaseId) => {
    setLoading(true); setError('');
    void getAllocationsByProject(projectId, { keyword: nextKeyword, phaseId: nextPhaseId ? Number(nextPhaseId) : undefined })
      .then((response) => { setRows(response.resultList ?? []); setPage(1); })
      .catch(() => setError('Không thể tải dữ liệu phân bổ nhân sự.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let active = true;
    Promise.allSettled([getAllocationsByProject(projectId), getPhasesByProject(projectId), getProjectMembers(projectId)])
      .then(([allocationResult, phaseResult, memberResult]) => {
        if (!active) return;
        if (allocationResult.status === 'fulfilled') setRows(allocationResult.value.resultList ?? []);
        if (phaseResult.status === 'fulfilled') setPhases(phaseResult.value.resultList ?? []);
        if (memberResult.status === 'fulfilled') setMembers(memberResult.value.resultList ?? []);
        if (allocationResult.status === 'rejected') setError('Không thể tải dữ liệu phân bổ nhân sự.');
        setLoading(false);
      });
    return () => { active = false; };
  }, [projectId]);

  const openCreate = () => { setEditing(null); setFormPhaseId(''); setFormMemberId(''); setFormPercentage(''); setFormOpen(true); setExpandedId(null); setError(''); };
  const openEdit = (row: AllocationResponse) => { setEditing(row); setFormPhaseId(String(row.phaseId)); setFormMemberId(String(row.memberId)); setFormPercentage(String(row.allocationPercentage)); setFormOpen(true); setExpandedId(null); setError(''); };
  const cancelForm = () => { setFormOpen(false); setEditing(null); setError(''); };

  const save = () => {
    const percentage = Number(formPercentage);
    if ((!editing && (!formPhaseId || !formMemberId)) || !percentage || percentage <= 0 || percentage > 100) {
      setError('Vui lòng chọn phase, nhân sự và nhập tỷ lệ từ 1 đến 100%.'); return;
    }
    setSaving(true); setError('');
    const request = editing
      ? updateAllocation(editing.id, { allocationPercentage: percentage })
      : createAllocation({ projectId, phaseId: Number(formPhaseId), memberId: Number(formMemberId), allocationPercentage: percentage });
    void request.then(() => { cancelForm(); load(); }).catch(() => setError(editing ? 'Không thể cập nhật phân bổ.' : 'Không thể thêm phân bổ.')).finally(() => setSaving(false));
  };

  const remove = (row: AllocationResponse) => {
    if (!window.confirm(`Xóa phân bổ của ${row.userName}?`)) return;
    setDeletingId(row.id); setError('');
    void deleteAllocation(row.id).then(() => { setRows((current) => current.filter((item) => item.id !== row.id)); if (expandedId === row.id) setExpandedId(null); })
      .catch(() => setError('Không thể xóa phân bổ.')).finally(() => setDeletingId(null));
  };

  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const visibleRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return <section className="allocation-panel">
    {!formOpen && <div className="allocation-toolbar"><label className="allocation-search"><span aria-hidden="true">⌕</span><input value={keyword} onChange={(event) => setKeyword(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && load()} placeholder="Tìm kiếm nhân sự..." aria-label="Tìm kiếm nhân sự" /></label><select value={phaseId} onChange={(event) => { setPhaseId(event.target.value); load(keyword, event.target.value); }} aria-label="Chọn giai đoạn"><option value="">Tất cả giai đoạn</option>{phases.map((phase) => <option key={phase.id} value={phase.id}>{phase.phaseName}</option>)}</select>{canManage && <button className="allocation-add-button" type="button" onClick={openCreate}>+ Thêm phân bổ</button>}</div>}
    {error && <div className="allocation-error">{error}</div>}
    {formOpen ? <div className="allocation-form"><h3>{editing ? 'Sửa phân bổ nhân sự' : 'Thêm phân bổ nhân sự'}</h3><p>{editing ? 'Chỉnh sửa tỷ lệ phân bổ cho nhân sự này.' : 'Chọn phase, nhân sự và nhập tỷ lệ phân bổ.'}</p><div className="allocation-form-fields"><label><span>Phase</span><select value={formPhaseId} onChange={(event) => setFormPhaseId(event.target.value)} disabled={Boolean(editing)}><option value="">Chọn phase</option>{phases.map((phase) => <option key={phase.id} value={phase.id}>{phase.phaseName}</option>)}</select></label><label><span>Nhân sự</span><select value={formMemberId} onChange={(event) => setFormMemberId(event.target.value)} disabled={Boolean(editing)}><option value="">Chọn nhân sự</option>{members.map((member) => <option key={member.id} value={member.id}>{member.userName} (ID: {member.userId})</option>)}</select></label><label><span>Tỷ lệ phân bổ (%)</span><input type="number" min="1" max="100" value={formPercentage} onChange={(event) => setFormPercentage(event.target.value)} placeholder="Ví dụ: 50" /></label></div><div className="allocation-form-actions"><button className="allocation-cancel-button" type="button" onClick={cancelForm} disabled={saving}>Hủy</button><button className="allocation-save-button" type="button" onClick={save} disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu'}</button></div></div> : <><div className="allocation-scroll"><table className="allocation-table"><thead><tr><th>Tên nhân viên</th><th>Giai đoạn tham gia</th><th>Tỷ lệ phân bổ</th><th>Point</th><th>Theo tỷ lệ phân bổ</th>{canManage && <th>Thao tác</th>}</tr></thead><tbody>{loading ? <tr><td colSpan={canManage ? 6 : 5} className="allocation-empty">Đang tải dữ liệu...</td></tr> : visibleRows.length === 0 ? <tr><td colSpan={canManage ? 6 : 5} className="allocation-empty">Chưa có dữ liệu phân bổ.</td></tr> : visibleRows.map((row) => { const percentage = Math.max(0, Math.min(100, row.allocationPercentage)); const tone = percentage >= 100 ? 'full' : percentage >= 70 ? 'high' : percentage >= 40 ? 'medium' : 'low'; const expanded = expandedId === row.id; return <><tr className={`allocation-data-row ${expanded ? 'expanded' : ''}`} key={row.id} onClick={() => setExpandedId(expanded ? null : row.id)}><td><div className="allocation-person"><span><b>{row.userName || 'Chưa cập nhật'}</b><small>ID: {row.userId}</small></span></div></td><td>{row.phaseName}</td><td><span className={`allocation-percent ${tone}`}>{percentage}%</span><div className="allocation-progress"><i style={{ width: `${percentage}%` }} /></div></td><td className="allocation-point">{point(Number(row.resourceRateSnapshot))}</td><td className="allocation-point allocation-total">{point(Number(row.allocationPoint))}</td>{canManage && <td><div className="allocation-actions"><button type="button" onClick={(event) => { event.stopPropagation(); openEdit(row); }}>Sửa</button><button className="danger" type="button" onClick={(event) => { event.stopPropagation(); remove(row); }} disabled={deletingId === row.id}>{deletingId === row.id ? '...' : 'Xóa'}</button></div></td>}</tr>{expanded && <tr className="allocation-detail-row" key={`${row.id}-detail`}><td colSpan={canManage ? 6 : 5}><div><b>Chi tiết phân bổ</b><span>Nhân sự: {row.userName} (ID: {row.userId})</span><span>Phase: {row.phaseName}</span><span>Tỷ lệ: {percentage}%</span><span>Point resource: {point(Number(row.resourceRateSnapshot))}</span><span>Point phân bổ: {point(Number(row.allocationPoint))}</span></div></td></tr>}</>; })}</tbody></table></div><footer className="allocation-footer"><span>Hiển thị {rows.length ? (page - 1) * PAGE_SIZE + 1 : 0}-{Math.min(page * PAGE_SIZE, rows.length)} trong {rows.length} phân bổ</span><div><button aria-label="Trang trước" disabled={page === 1} onClick={() => setPage((value) => value - 1)}>‹</button><b>{page}</b><button aria-label="Trang sau" disabled={page >= pages} onClick={() => setPage((value) => value + 1)}>›</button></div></footer></>}
  </section>;
}
