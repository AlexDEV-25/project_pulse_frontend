import { useEffect, useMemo, useState } from 'react';
import { getAllDepartments } from '../../../apis/DepartmentApi';
import {
  createProjectMember,
  deleteProjectMember,
  getProjectMembers,
} from '../../../apis/ProjectMemberApi';
import { getAllUsers } from '../../../apis/UserApi';
import type {
  DepartmentResponse,
  ProjectMemberResponse,
  UserResponse,
} from '../../../dto/response';

const PAGE_SIZE = 5;

export function ProjectMemberTable({
  projectId,
  canManage = false,
}: {
  projectId: number;
  canManage?: boolean;
}) {
  const [rows, setRows] = useState<ProjectMemberResponse[]>([]);
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [departments, setDepartments] = useState<DepartmentResponse[]>([]);
  const [departmentId, setDepartmentId] = useState('');
  const [departmentUsers, setDepartmentUsers] = useState<UserResponse[]>([]);
  const [userId, setUserId] = useState('');
  const [loadingForm, setLoadingForm] = useState(false);
  const [savingMember, setSavingMember] = useState(false);

  const load = (search = keyword) => {
    setLoading(true);
    setError('');
    void getProjectMembers(projectId, { keyword: search })
      .then((response) => {
        setRows(response.resultList ?? []);
        setPage(1);
      })
      .catch(() => setError('Không thể tải danh sách nhân sự của dự án.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(''); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const visibleRows = useMemo(
    () => rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [page, rows]
  );

  const openAddForm = () => {
    setIsAdding(true);
    setDepartmentId('');
    setDepartmentUsers([]);
    setUserId('');
    setError('');
    if (departments.length > 0) return;
    setLoadingForm(true);
    void getAllDepartments()
      .then((response) => setDepartments(response.resultList ?? []))
      .catch(() => setError('Không thể tải danh sách phòng ban.'))
      .finally(() => setLoadingForm(false));
  };

  const cancelAdd = () => {
    setIsAdding(false);
    setDepartmentId('');
    setDepartmentUsers([]);
    setUserId('');
    setError('');
  };

  const handleDepartmentChange = (value: string) => {
    setDepartmentId(value);
    setUserId('');
    setDepartmentUsers([]);
    setError('');
    if (!value) return;
    setLoadingForm(true);
    void getAllUsers({ departmentId: Number(value) })
      .then((response) => setDepartmentUsers(response.resultList ?? []))
      .catch(() => setError('Không thể tải danh sách nhân sự của phòng ban.'))
      .finally(() => setLoadingForm(false));
  };

  const saveMember = () => {
    if (!userId) {
      setError('Vui lòng chọn nhân sự cần thêm.');
      return;
    }
    setSavingMember(true);
    setError('');
    void createProjectMember({ projectId, userId: Number(userId) })
      .then(() => {
        cancelAdd();
        load('');
      })
      .catch(() => setError('Không thể thêm nhân sự vào dự án.'))
      .finally(() => setSavingMember(false));
  };

  const removeMember = (memberId: number, name: string) => {
    if (!window.confirm(`Xóa ${name} khỏi dự án?`)) return;
    setDeletingId(memberId);
    setError('');
    void deleteProjectMember(memberId)
      .then(() =>
        setRows((current) => current.filter((row) => row.id !== memberId))
      )
      .catch(() => setError('Không thể xóa nhân sự khỏi dự án.'))
      .finally(() => setDeletingId(null));
  };

  return (
    <section className="member-panel">
      <div className="member-toolbar">
        {!isAdding && (
          <label className="member-search">
            <span aria-hidden="true">⌕</span>
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && load(keyword)}
              placeholder="Tìm kiếm nhân sự..."
              aria-label="Tìm kiếm nhân sự"
            />
          </label>
        )}
        {canManage && !isAdding && (
          <button
            className="member-add-button"
            type="button"
            onClick={openAddForm}
          >
            + Thêm nhân sự
          </button>
        )}
      </div>
      {error && <div className="member-error">{error}</div>}
      {isAdding ? (
        <div className="member-add-form">
          <div className="member-add-form-heading">
            <h3>Thêm nhân sự vào dự án</h3>
            <p>Chọn phòng ban, sau đó chọn nhân sự cần thêm.</p>
          </div>
          <div className="member-add-fields">
            <label>
              <span>Phòng ban</span>
              <select
                value={departmentId}
                onChange={(event) => handleDepartmentChange(event.target.value)}
                disabled={loadingForm}
              >
                <option value="">Chọn phòng ban</option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.departmentName}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Nhân sự</span>
              <select
                value={userId}
                onChange={(event) => setUserId(event.target.value)}
                disabled={!departmentId || loadingForm}
              >
                <option value="">
                  {loadingForm ? 'Đang tải nhân sự...' : 'Chọn nhân sự'}
                </option>
                {departmentUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.userName} (ID: {user.id})
                  </option>
                ))}
              </select>
            </label>
          </div>
          {departmentId && !loadingForm && departmentUsers.length === 0 && (
            <p className="member-add-hint">
              Phòng ban này chưa có nhân sự phù hợp.
            </p>
          )}
          <div className="member-add-actions">
            <button
              className="member-cancel-button"
              type="button"
              onClick={cancelAdd}
              disabled={savingMember}
            >
              Hủy
            </button>
            <button
              className="member-save-button"
              type="button"
              onClick={saveMember}
              disabled={!userId || savingMember}
            >
              {savingMember ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="member-scroll">
            <table className="member-table">
              <thead>
                <tr>
                  <th>Tên nhân viên</th>
                  <th>Chức vụ</th>
                  <th>Point</th>
                  {canManage && <th>Thao tác</th>}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={canManage ? 4 : 3} className="member-empty">
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : visibleRows.length === 0 ? (
                  <tr>
                    <td colSpan={canManage ? 4 : 3} className="member-empty">
                      Chưa có nhân sự phù hợp.
                    </td>
                  </tr>
                ) : (
                  visibleRows.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <div className="member-person">
                          <b>{row.userName || 'Chưa cập nhật'}</b>
                          <small>ID: {row.userId}</small>
                        </div>
                      </td>
                      <td>{row.userPosition || '—'}</td>
                      <td>
                        {Number(row.userResourceRate ?? 0).toLocaleString(
                          'vi-VN'
                        )}
                      </td>
                      {canManage && (
                        <td>
                          <button
                            className="member-remove-button"
                            type="button"
                            onClick={() => removeMember(row.id, row.userName)}
                            disabled={deletingId === row.id}
                          >
                            {deletingId === row.id ? 'Đang xóa...' : 'Xóa'}
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <footer className="member-footer">
            <span>
              Hiển thị {rows.length ? (page - 1) * PAGE_SIZE + 1 : 0}-
              {Math.min(page * PAGE_SIZE, rows.length)} trong {rows.length}{' '}
              thành viên
            </span>
            <div>
              <button
                aria-label="Trang trước"
                disabled={page === 1}
                onClick={() => setPage((value) => value - 1)}
              >
                ‹
              </button>
              <b>{page}</b>
              <button
                aria-label="Trang sau"
                disabled={page >= pages}
                onClick={() => setPage((value) => value + 1)}
              >
                ›
              </button>
            </div>
          </footer>
        </>
      )}
    </section>
  );
}
