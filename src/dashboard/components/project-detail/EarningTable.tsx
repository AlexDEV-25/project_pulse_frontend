import { useEffect, useMemo, useState } from 'react';
import { getProjectMembers } from '../../../apis/ProjectMemberApi';
import { getPhasesByProject } from '../../../apis/PhaseApi';
import { getProjectEarningsFiltered, transferProjectEarning } from '../../../apis/FinanceApi';
import type { EarningTransactionResponse, PhaseResponse, ProjectMemberResponse } from '../../../dto/response';
import type { EarningTransactionType } from '../../../dto/enum';

const PAGE_SIZE = 5;
const points = (value: number) => Number(value ?? 0).toLocaleString('vi-VN', { maximumFractionDigits: 2 });

type Props = { projectId: number; canTransfer?: boolean };

export function EarningTable({ projectId, canTransfer = false }: Props) {
  const [rows, setRows] = useState<EarningTransactionResponse[]>([]);
  const [phases, setPhases] = useState<PhaseResponse[]>([]);
  const [members, setMembers] = useState<ProjectMemberResponse[]>([]);
  const [keyword, setKeyword] = useState('');
  const [phaseId, setPhaseId] = useState('');
  const [type, setType] = useState<EarningTransactionType | ''>('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [transferRow, setTransferRow] = useState<EarningTransactionResponse | null>(null);
  const [targetEmployeeId, setTargetEmployeeId] = useState('');
  const [transferPoints, setTransferPoints] = useState('');
  const [reason, setReason] = useState('');
  const [loadingForm, setLoadingForm] = useState(false);
  const [savingTransfer, setSavingTransfer] = useState(false);

  const load = (nextKeyword = keyword, nextPhaseId = phaseId, nextType = type) => {
    setLoading(true); setError('');
    void getProjectEarningsFiltered(projectId, { keyword: nextKeyword.trim() || undefined, phaseId: nextPhaseId ? Number(nextPhaseId) : undefined, earningTransactionType: nextType || undefined })
      .then((response) => { setRows(response.resultList ?? []); setPage(1); })
      .catch(() => setError('Không thể tải dữ liệu giá trị thu được.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    void Promise.allSettled([getProjectEarningsFiltered(projectId), getPhasesByProject(projectId)])
      .then(([earningResult, phaseResult]) => {
        if (earningResult.status === 'fulfilled') setRows(earningResult.value.resultList ?? []);
        if (phaseResult.status === 'fulfilled') setPhases(phaseResult.value.resultList ?? []);
        if (earningResult.status === 'rejected') setError('Không thể tải dữ liệu giá trị thu được.');
      }).finally(() => setLoading(false));
  }, [projectId]);

  const openTransfer = (row: EarningTransactionResponse) => {
    setTransferRow(row); setTargetEmployeeId(''); setTransferPoints(''); setReason(''); setError(''); setLoadingForm(true);
    void getProjectMembers(projectId)
      .then((response) => setMembers((response.resultList ?? []).filter((member) => member.userId !== row.employeeId)))
      .catch(() => setError('Không thể tải danh sách người nhận point.'))
      .finally(() => setLoadingForm(false));
  };

  const cancelTransfer = () => { setTransferRow(null); setTargetEmployeeId(''); setTransferPoints(''); setReason(''); setError(''); };

  const createTransfer = () => {
    if (!transferRow || !targetEmployeeId || !transferPoints || Number(transferPoints) <= 0) {
      setError('Vui lòng chọn người nhận và nhập số point hợp lệ.'); return;
    }
    if (Number(transferPoints) > Number(transferRow.points)) {
      setError('Số point chuyển không được lớn hơn point khả dụng.'); return;
    }
    setSavingTransfer(true); setError('');
    void transferProjectEarning(projectId, { sourceTransactionId: transferRow.id, targetEmployeeId: Number(targetEmployeeId), points: Number(transferPoints), reason: reason.trim() || undefined })
      .then(() => { cancelTransfer(); load(); })
      .catch(() => setError('Không thể tạo giao dịch transfer.'))
      .finally(() => setSavingTransfer(false));
  };

  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const visibleRows = useMemo(() => rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [page, rows]);

  return <section className="earning-panel">
    {!transferRow && <div className="earning-toolbar"><label className="earning-search"><span aria-hidden="true">⌕</span><input value={keyword} onChange={(event) => setKeyword(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && load()} placeholder="Tìm kiếm giao dịch..." aria-label="Tìm kiếm giao dịch" /></label><select value={phaseId} onChange={(event) => { setPhaseId(event.target.value); load(keyword, event.target.value, type); }} aria-label="Chọn giai đoạn"><option value="">Tất cả giai đoạn</option>{phases.map((phase) => <option key={phase.id} value={phase.id}>{phase.phaseName}</option>)}</select><select value={type} onChange={(event) => { const nextType = event.target.value as EarningTransactionType | ''; setType(nextType); load(keyword, phaseId, nextType); }} aria-label="Chọn loại giao dịch"><option value="">Tất cả loại giao dịch</option><option value="EARN">Earn</option><option value="TRANSFER">Transfer</option></select></div>}
    {error && <div className="earning-error">{error}</div>}
    {transferRow ? <div className="earning-transfer-form"><h3>Tạo giao dịch transfer</h3><p>Chuyển point từ <b>{transferRow.employeeName}</b> (tối đa {points(transferRow.points)} point).</p><div className="earning-transfer-fields"><label><span>Người nhận point</span><select value={targetEmployeeId} onChange={(event) => setTargetEmployeeId(event.target.value)} disabled={loadingForm}><option value="">{loadingForm ? 'Đang tải thành viên...' : 'Chọn người nhận'}</option>{members.map((member) => <option key={member.userId} value={member.userId}>{member.userName} (ID: {member.userId})</option>)}</select></label><label><span>Số point</span><input type="number" min="0.01" max={transferRow.points} step="0.01" value={transferPoints} onChange={(event) => setTransferPoints(event.target.value)} placeholder="Nhập số point" /></label><label className="earning-transfer-reason"><span>Lý do</span><textarea value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Nhập lý do chuyển point..." rows={3} /></label></div><div className="earning-transfer-actions"><button className="earning-cancel-button" type="button" onClick={cancelTransfer} disabled={savingTransfer}>Hủy</button><button className="earning-create-button" type="button" onClick={createTransfer} disabled={savingTransfer || loadingForm}>{savingTransfer ? 'Đang tạo...' : 'Tạo giao dịch transfer'}</button></div></div> : <><div className="earning-scroll"><table className="earning-table"><thead><tr><th>ID giao dịch</th><th>Tên nhân viên</th><th>Giai đoạn</th><th>Task / Công việc</th><th>Loại giao dịch</th><th>ID tham chiếu</th><th>Point</th>{canTransfer && <th>Thao tác</th>}</tr></thead><tbody>{loading ? <tr><td colSpan={canTransfer ? 8 : 7} className="earning-empty">Đang tải dữ liệu...</td></tr> : visibleRows.length === 0 ? <tr><td colSpan={canTransfer ? 8 : 7} className="earning-empty">Chưa có giao dịch phù hợp.</td></tr> : visibleRows.map((row) => <tr key={row.id}><td>#{String(row.id).padStart(3, '0')}</td><td><div className="earning-person"><b>{row.employeeName || 'Chưa cập nhật'}</b><small>ID: {row.employeeId}</small></div></td><td>{row.phaseName || '—'}</td><td>{row.taskName || '—'}</td><td><span className={`earning-type ${row.earningTransactionType.toLowerCase()}`}>{row.earningTransactionType === 'EARN' ? 'Earn' : 'Transfer'}</span></td><td>{row.referenceTransactionId ? `#${row.referenceTransactionId}` : '—'}</td><td className="earning-point">{points(row.points)}</td>{canTransfer && <td>{row.earningTransactionType === 'EARN' ? <button className="earning-transfer-button" type="button" onClick={() => openTransfer(row)}>Transfer</button> : <span>—</span>}</td>}</tr>)}</tbody></table></div><footer className="earning-footer"><span>Hiển thị {rows.length ? (page - 1) * PAGE_SIZE + 1 : 0}-{Math.min(page * PAGE_SIZE, rows.length)} trong {rows.length} giao dịch</span><div><button aria-label="Trang trước" disabled={page === 1} onClick={() => setPage((value) => value - 1)}>‹</button><b>{page}</b><button aria-label="Trang sau" disabled={page >= pages} onClick={() => setPage((value) => value + 1)}>›</button></div></footer></>}
  </section>;
}
