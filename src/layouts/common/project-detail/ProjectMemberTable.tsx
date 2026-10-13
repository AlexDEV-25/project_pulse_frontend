import { useEffect, useState } from 'react';
import { getAllDepartments } from '@/apis/DepartmentApi';
import {
  createProjectMember,
  deleteProjectMember,
  getProjectMembers,
} from '@/apis/ProjectMemberApi';
import { getAllUsers } from '@/apis/UserApi';
import type {
  DepartmentResponse,
  ProjectMemberResponse,
  UserResponse,
} from '@/dto/response';
import {
  ManagementFilterButton,
  ManagementSearch,
} from '@/layouts/common/components/dashboard/ManagementFilters';
import Table from '@/layouts/common/components/ui/Table';
import DeleteButton from '@/layouts/common/components/ui/DeleteButton';

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

export function ProjectMemberTable({
  projectId,
  canManage = false,
}: {
  projectId: number;
  canManage?: boolean;
}) {
  const [rows, setRows] = useState<ProjectMemberResponse[]>([]);
  const [keyword, setKeyword] = useState('');
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
      })
      .catch(() => setError('Không thể tải danh sách nhân sự của dự án.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    // Reload members when the selected project changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load(''); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

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
          <>
            <ManagementSearch
              value={keyword}
              onChange={setKeyword}
              onSearch={() => load(keyword)}
              placeholder="Tìm kiếm nhân sự..."
              className="detail-filter-search"
            />
            <ManagementFilterButton onClick={() => load(keyword)} />
          </>
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
          <Table
            className="member-table"
            wrapperClassName="member-scroll"
          >
            <thead>
              <tr>
                <th className="col-member-name">Tên nhân viên</th>
                <th className="col-member-pos">Chức vụ</th>
                <th className="col-member-point">Point</th>
                {canManage && <th className="col-member-action">Thao tác</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={canManage ? 4 : 3} className="member-empty">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={canManage ? 4 : 3} className="member-empty">
                    Chưa có nhân sự phù hợp.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id}>
                    <td className="col-member-name">
                      <div className="member-person">
                        <div className="member-avatar">
                          {getInitials(row.userName, row.userId)}
                        </div>
                        <div className="member-person-meta">
                          <b className="member-name">{row.userName || 'Chưa cập nhật'}</b>
                          <small className="member-id">ID: {row.userId}</small>
                        </div>
                      </div>
                    </td>
                    <td className="col-member-pos">
                      <span className="member-position-text">
                        {row.userPosition || 'Thành viên'}
                      </span>
                    </td>
                    <td className="col-member-point">
                      <span className="member-point-value">
                        {Number(row.userResourceRate ?? 0).toLocaleString(
                          'vi-VN'
                        )}
                      </span>
                    </td>
                    {canManage && (
                      <td className="col-member-action">
                        <DeleteButton
                          onClick={() => removeMember(row.id, row.userName)}
                          disabled={deletingId === row.id}
                          title={`Xóa ${row.userName} khỏi dự án`}
                          aria-label={`Xóa ${row.userName} khỏi dự án`}
                        />
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </Table>
          
        </>
      )}
    </section>
  );
}

