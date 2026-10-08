import { useEffect, useState } from 'react';
import { createPhase, deletePhase, getPhasesByProject, updatePhase } from '../../../apis/PhaseApi';
import type { CreatePhaseRequest, UpdatePhaseRequest } from '../../../dto/request';
import type { PhaseResponse } from '../../../dto/response';

const statusLabels: Record<PhaseResponse['status'], string> = {
  PLANNED: 'Chưa bắt đầu',
  IN_PROGRESS: 'Đang thực hiện',
  DONE: 'Hoàn thành',
};

const progress = (value: number | null | undefined) => Math.max(0, Math.min(100, Number(value) || 0));

const displayDate = (value: string) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('vi-VN');
};

const inputDateTime = (value: string) => value ? value.slice(0, 16) : '';
const requestDateTime = (value: string) => value.length === 10 ? `${value}T00:00:00` : value;

type Props = { projectId: number; canManage?: boolean };

export function PhaseComponent({ projectId, canManage = false }: Props) {
  const [phases, setPhases] = useState<PhaseResponse[]>([]);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PhaseResponse | null>(null);
  const [form, setForm] = useState({
    phaseName: '', startAt: '', endAt: '', phaseStatus: 'PLANNED' as PhaseResponse['status'],
    makeUpDates: [] as string[], offDates: [] as string[],
  });
  const [newMakeUpDate, setNewMakeUpDate] = useState('');
  const [newOffDate, setNewOffDate] = useState('');

  const load = (nextKeyword = keyword) => {
    setLoading(true);
    setError('');
    void getPhasesByProject(projectId, nextKeyword)
      .then((response) => setPhases(response.resultList ?? []))
      .catch(() => setError('Không thể tải danh sách giai đoạn.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let active = true;
    void getPhasesByProject(projectId)
      .then((response) => { if (active) setPhases(response.resultList ?? []); })
      .catch(() => { if (active) setError('Không thể tải danh sách giai đoạn.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [projectId]);

  const openCreate = () => {
    setEditing(null);
    setForm({ phaseName: '', startAt: '', endAt: '', phaseStatus: 'PLANNED', makeUpDates: [], offDates: [] });
    setNewMakeUpDate('');
    setNewOffDate('');
    setFormOpen(true);
    setError('');
  };

  const openEdit = (phase: PhaseResponse) => {
    setEditing(phase);
    setForm({ phaseName: phase.phaseName, startAt: inputDateTime(phase.startAt), endAt: inputDateTime(phase.endAt), phaseStatus: phase.status, makeUpDates: phase.makeUpDates ?? [], offDates: phase.offDates ?? [] });
    setNewMakeUpDate('');
    setNewOffDate('');
    setFormOpen(true);
    setError('');
  };

  const closeForm = () => { setFormOpen(false); setEditing(null); };

  const save = () => {
    if (!form.phaseName.trim() || !form.startAt || !form.endAt) {
      setError('Vui lòng nhập tên, ngày bắt đầu và ngày kết thúc của giai đoạn.');
      return;
    }
    if (new Date(form.startAt).getTime() > new Date(form.endAt).getTime()) {
      setError('Ngày bắt đầu không được sau ngày kết thúc.');
      return;
    }
    const data = {
      projectId,
      phaseName: form.phaseName.trim(),
      startAt: requestDateTime(form.startAt),
      endAt: requestDateTime(form.endAt),
      makeUpDates: form.makeUpDates,
      offDates: form.offDates,
    };
    setSaving(true);
    setError('');
    const request = editing
      ? updatePhase(editing.id, { ...data, phaseStatus: form.phaseStatus } satisfies UpdatePhaseRequest)
      : createPhase(data satisfies CreatePhaseRequest);
    void request.then(() => { closeForm(); load(); })
      .catch(() => setError(editing ? 'Không thể cập nhật giai đoạn.' : 'Không thể thêm giai đoạn.'))
      .finally(() => setSaving(false));
  };

  const addDate = (type: 'makeUpDates' | 'offDates') => {
    const value = type === 'makeUpDates' ? newMakeUpDate : newOffDate;
    if (!value || form[type].includes(value)) return;
    setForm((current) => ({ ...current, [type]: [...current[type], value].sort() }));
    if (type === 'makeUpDates') setNewMakeUpDate('');
    else setNewOffDate('');
  };

  const removeDate = (type: 'makeUpDates' | 'offDates', value: string) => {
    setForm((current) => ({ ...current, [type]: current[type].filter((date) => date !== value) }));
  };

  const remove = (phase: PhaseResponse) => {
    if (!window.confirm(`Xóa giai đoạn "${phase.phaseName}"?`)) return;
    setDeletingId(phase.id);
    setError('');
    void deletePhase(phase.id)
      .then(() => setPhases((current) => current.filter((item) => item.id !== phase.id)))
      .catch(() => setError('Không thể xóa giai đoạn.'))
      .finally(() => setDeletingId(null));
  };

  return <section className="phase-table-panel">
    {!formOpen && <div className="phase-toolbar">
      <label className="phase-search"><span aria-hidden="true">⌕</span><input value={keyword} onChange={(event) => setKeyword(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') load(); }} placeholder="Tìm kiếm giai đoạn..." aria-label="Tìm kiếm giai đoạn" /></label>
      {canManage && <button className="phase-add-button" type="button" onClick={openCreate}>+ Thêm giai đoạn</button>}
    </div>}
    {error && <div className="phase-table-error">{error}</div>}
    {formOpen ? <div className="phase-form">
      <h3>{editing ? 'Sửa giai đoạn' : 'Thêm giai đoạn'}</h3>
      <div className="phase-form-fields">
        <label><span>Tên giai đoạn</span><input value={form.phaseName} onChange={(event) => setForm({ ...form, phaseName: event.target.value })} /></label>
        <label><span>Ngày bắt đầu</span><input type="datetime-local" value={form.startAt} onChange={(event) => setForm({ ...form, startAt: event.target.value })} /></label>
        <label><span>Ngày kết thúc</span><input type="datetime-local" value={form.endAt} onChange={(event) => setForm({ ...form, endAt: event.target.value })} /></label>
        {editing && <label><span>Trạng thái</span><select value={form.phaseStatus} onChange={(event) => setForm({ ...form, phaseStatus: event.target.value as PhaseResponse['status'] })}><option value="PLANNED">Chưa bắt đầu</option><option value="IN_PROGRESS">Đang thực hiện</option><option value="DONE">Hoàn thành</option></select></label>}
      </div>
      <div className="phase-date-lists">
        <div className="phase-date-list"><strong>Ngày làm bù</strong><div className="phase-date-add"><input type="date" value={newMakeUpDate} onChange={(event) => setNewMakeUpDate(event.target.value)} /><button type="button" onClick={() => addDate('makeUpDates')}>Thêm</button></div><div className="phase-date-items">{form.makeUpDates.map((date) => <span key={date}>{date}<button type="button" onClick={() => removeDate('makeUpDates', date)} aria-label={`Xóa ngày làm bù ${date}`}>×</button></span>)}</div></div>
        <div className="phase-date-list"><strong>Ngày nghỉ</strong><div className="phase-date-add"><input type="date" value={newOffDate} onChange={(event) => setNewOffDate(event.target.value)} /><button type="button" onClick={() => addDate('offDates')}>Thêm</button></div><div className="phase-date-items">{form.offDates.map((date) => <span key={date}>{date}<button type="button" onClick={() => removeDate('offDates', date)} aria-label={`Xóa ngày nghỉ ${date}`}>×</button></span>)}</div></div>
      </div>
      <div className="phase-form-actions"><button type="button" onClick={closeForm} disabled={saving}>Hủy</button><button className="phase-save-button" type="button" onClick={save} disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu'}</button></div>
    </div> : <div className="phase-table-scroll"><table className="phase-table"><thead><tr><th>Tên phase</th><th>Ngày bắt đầu</th><th>Ngày kết thúc</th><th>Số ngày làm việc</th><th>Trạng thái</th><th>Tiến độ</th>{canManage && <th>Thao tác</th>}</tr></thead><tbody>
      {loading ? <tr><td colSpan={canManage ? 7 : 6} className="phase-table-empty">Đang tải dữ liệu...</td></tr> : phases.length === 0 ? <tr><td colSpan={canManage ? 7 : 6} className="phase-table-empty">Chưa có giai đoạn nào.</td></tr> : phases.map((phase) => { const value = progress(phase.progress); return <tr key={phase.id}><td className="phase-name-cell">{phase.phaseName}</td><td>{displayDate(phase.startAt)}</td><td>{displayDate(phase.endAt)}</td><td>{phase.workdays ?? 0}</td><td><span className={`phase-status phase-status-${phase.status.toLowerCase()}`}>{statusLabels[phase.status]}</span></td><td><div className="phase-table-progress"><div><i style={{ width: `${value}%` }} /></div><b>{value}%</b></div></td>{canManage && <td><div className="phase-actions"><button type="button" onClick={() => openEdit(phase)}>Sửa</button><button className="danger" type="button" onClick={() => remove(phase)} disabled={deletingId === phase.id}>{deletingId === phase.id ? '...' : 'Xóa'}</button></div></td>}</tr>; })}
    </tbody></table></div>}
  </section>;
}
