import { useEffect, useMemo, useState } from 'react';
import { createAccount } from '../../apis/AuthApi';
import { getAllDepartments } from '../../apis/DepartmentApi';
import { getAllUsers, getUserStatistics, updateUser } from '../../apis/UserApi';
import type {
  CreateAccountRequest,
  UpdateUserRequest,
} from '../../dto/request';
import type { DepartmentResponse, UserResponse } from '../../dto/response';
import { DashboardFrame } from '../employee/EmployeeDashboard';
import { ManagementFilterButton, ManagementSearch } from '../components/ManagementFilters';

const roles = ['ADMIN', 'PM', 'EMPLOYEE'];
type DrawerMode = 'create' | 'edit' | 'detail';
type FormState = {
  id?: number;
  userName: string;
  email: string;
  password: string;
  position: string;
  departmentId: string;
  roles: string[];
  resourceRate: string;
};
const emptyForm: FormState = {
  userName: '',
  email: '',
  password: '',
  position: '',
  departmentId: '',
  roles: ['EMPLOYEE'],
  resourceRate: '0',
};

export default function UserManagement({
  onLogout,
  onMenuChange,
}: {
  onLogout: () => void;
  onMenuChange: (label: string) => void;
}) {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [departments, setDepartments] = useState<DepartmentResponse[]>([]);
  const [statistics, setStatistics] = useState<Record<string, number>>({});
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [keyword, setKeyword] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<number[]>([]);
  const [roleOpen, setRoleOpen] = useState(false);
  const [departmentOpen, setDepartmentOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [drawerMode, setDrawerMode] = useState<DrawerMode | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [showPassword, setShowPassword] = useState(false);
  const [confirmChange, setConfirmChange] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getAllUsers({
        keyword: keyword.trim() || undefined,
        roleNames: selectedRoles,
        departmentIds: selectedDepartments,
      });
      setUsers(response.resultList ?? []);
    } catch {
      setError('Không thể tải danh sách nhân sự. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    Promise.allSettled([getAllDepartments(), getUserStatistics()]).then(
      ([departmentsResult, statisticsResult]) => {
        if (departmentsResult.status === 'fulfilled')
          setDepartments(departmentsResult.value.resultList ?? []);
        if (statisticsResult.status === 'fulfilled') {
          setStatistics(statisticsResult.value.result?.usersByRole ?? {});
          setTotalUsers(statisticsResult.value.result?.totalUsers ?? null);
        }
      }
    );
  }, []);
  useEffect(() => {
    // Initial data synchronization for the screen.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const displayedTotal = useMemo(
    () =>
      totalUsers ??
      (Object.values(statistics).reduce((sum, value) => sum + value, 0) ||
        users.length),
    [statistics, totalUsers, users.length]
  );
  const updateForm = (patch: Partial<FormState>) =>
    setForm((current) => ({ ...current, ...patch }));
  const openCreate = () => {
    setForm({
      ...emptyForm,
      departmentId: departments[0] ? String(departments[0].id) : '',
    });
    setError('');
    setShowPassword(false);
    setDrawerMode('create');
  };
  const openUser = (user: UserResponse, mode: 'edit' | 'detail') => {
    setForm({
      id: user.id,
      userName: user.userName,
      email: user.email ?? '',
      password: '',
      position: user.position ?? '',
      departmentId: String(user.departmentId),
      roles: (user.roles ?? []).map((role) => role.name),
      resourceRate: String(user.resourceRate ?? 0),
    });
    setError('');
    setDrawerMode(mode);
  };
  const closeDrawer = () => {
    setDrawerMode(null);
    setConfirmChange(false);
    setForm(emptyForm);
    setError('');
  };
  const hasPermissionChanges =
    drawerMode === 'edit' &&
    users.some(
      (user) =>
        user.id === form.id &&
        (String(user.departmentId) !== form.departmentId ||
          (user.roles ?? [])
            .map((role) => role.name)
            .sort()
            .join() !== [...form.roles].sort().join())
    );
  const submitForm = async () => {
    if (
      !form.userName.trim() ||
      !form.email.trim() ||
      !form.departmentId ||
      !form.roles.length ||
      (drawerMode === 'create' && !form.password)
    ) {
      setError('Vui lòng điền đầy đủ các trường bắt buộc.');
      return;
    }
    if (hasPermissionChanges && !confirmChange) {
      setConfirmChange(true);
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (drawerMode === 'create') {
        const data: CreateAccountRequest = {
          email: form.email.trim(),
          password: form.password,
          roles: form.roles,
          userName: form.userName.trim(),
          position: form.position.trim(),
          resourceRate: Number(form.resourceRate) || 0,
          departmentId: Number(form.departmentId),
        };
        await createAccount(data);
      } else if (drawerMode === 'edit' && form.id) {
        const data: UpdateUserRequest = {
          id: form.id,
          userName: form.userName.trim(),
          position: form.position.trim(),
          resourceRate: Number(form.resourceRate) || 0,
          departmentId: Number(form.departmentId),
          roles: form.roles,
        };
        await updateUser(data);
      }
      closeDrawer();
      await loadUsers();
    } catch {
      setError(
        'Không thể lưu thông tin. Vui lòng kiểm tra dữ liệu và thử lại.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardFrame
      role="ADMIN"
      onLogout={onLogout}
      activeMenu="Quản lý nhân sự"
      onMenuChange={onMenuChange}
    >
      <div className="people-header">
        <div>
          <h1>Quản lý nhân sự</h1>
          <p>Theo dõi và quản lý nhân sự</p>
        </div>
        <button
          className="people-primary-button"
          type="button"
          onClick={openCreate}
        >
          ＋&nbsp; Thêm nhân sự mới
        </button>
      </div>
      <div className="people-summary-grid">
        <section className="people-summary-card">
          <div>
            <small>Tổng nhân sự</small>
            <strong>{displayedTotal.toLocaleString('vi-VN')}</strong>
          </div>
        </section>
        <section className="people-summary-card roles-summary">
          <div>
            <small>Phân loại vai trò</small>
            <div className="role-counts">
              {roles.map((role) => (
                <span key={role}>
                  <b>{role}</b>
                  <strong>{statistics[role] ?? 0}</strong>
                </span>
              ))}
            </div>
          </div>
        </section>
      </div>
      <section className="people-panel">
        <div className="people-filters">
          <ManagementSearch value={keyword} onChange={setKeyword} onSubmit={() => void loadUsers()} placeholder="Tìm kiếm nhân sự..." />
          <div className="filter-field">
            <button type="button" onClick={() => setRoleOpen(!roleOpen)}>
              {selectedRoles.length
                ? selectedRoles.join(', ')
                : 'Tất cả vai trò'}
              <b>⌄</b>
            </button>
            {roleOpen && (
              <div className="filter-menu">
                {roles.map((role) => (
                  <label key={role}>
                    <input
                      type="checkbox"
                      checked={selectedRoles.includes(role)}
                      onChange={() =>
                        setSelectedRoles((values) =>
                          values.includes(role)
                            ? values.filter((item) => item !== role)
                            : [...values, role]
                        )
                      }
                    />
                    {role}
                  </label>
                ))}
              </div>
            )}
          </div>
          <div className="filter-field">
            <button
              type="button"
              onClick={() => setDepartmentOpen(!departmentOpen)}
            >
              {selectedDepartments.length
                ? `${selectedDepartments.length} phòng ban`
                : 'Tất cả phòng ban'}
              <b>⌄</b>
            </button>
            {departmentOpen && (
              <div className="filter-menu">
                {departments.map((department) => (
                  <label key={department.id}>
                    <input
                      type="checkbox"
                      checked={selectedDepartments.includes(department.id)}
                      onChange={() =>
                        setSelectedDepartments((values) =>
                          values.includes(department.id)
                            ? values.filter((id) => id !== department.id)
                            : [...values, department.id]
                        )
                      }
                    />
                    {department.departmentName}
                  </label>
                ))}
              </div>
            )}
          </div>
          <ManagementFilterButton onClick={() => void loadUsers()} />
        </div>
        {error && !drawerMode && <div className="people-error">{error}</div>}
        <div className="people-table-wrap">
          <table className="people-table">
            <thead>
              <tr>
                <th>Avatar</th>
                <th>Họ và tên</th>
                <th>Email</th>
                <th>Chức vụ</th>
                <th>Phòng ban</th>
                <th>Vai trò</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="people-empty" colSpan={7}>
                    Đang tải danh sách...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td className="people-empty" colSpan={7}>
                    Không tìm thấy nhân sự phù hợp.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="people-row-clickable"
                    onClick={() => openUser(user, 'detail')}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        openUser(user, 'detail');
                      }
                    }}
                    tabIndex={0}
                    role="link"
                    aria-label={`Xem thông tin nhân sự ${user.userName}`}
                  >
                    <td>
                      <img
                        className="people-avatar"
                        src={user.avatarUrl || '/images/avatar-placeholder.png'}
                        alt=""
                        onError={(event) => {
                          event.currentTarget.style.display = 'none';
                          event.currentTarget.nextElementSibling?.classList.remove(
                            'hidden'
                          );
                        }}
                      />
                      <span className="avatar-fallback hidden">
                        {user.userName.slice(0, 1).toUpperCase()}
                      </span>
                    </td>
                    <td className="person-name">{user.userName}</td>
                    <td>{user.email ?? '—'}</td>
                    <td>{user.position || '—'}</td>
                    <td>
                      <span className="department-pill">
                        {user.departmentName}
                      </span>
                    </td>
                    <td>
                      <div className="role-pills">
                        {(user.roles ?? []).map((role) => (
                          <span
                            className={`role-pill role-${role.name.toLowerCase()}`}
                            key={role.name}
                          >
                            {role.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          type="button"
                          title="Chỉnh sửa"
                          aria-label={`Sửa thông tin ${user.userName}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            openUser(user, 'edit');
                          }}
                        >
                          <span aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
      {drawerMode && (
        <>
          <div className="drawer-backdrop" onClick={closeDrawer} />
          <aside className="people-drawer" role="dialog" aria-modal="true">
            <header className="drawer-header">
              <div>
                <h2>
                  {drawerMode === 'create'
                    ? 'Thêm nhân sự mới'
                    : drawerMode === 'edit'
                      ? `Chỉnh sửa hồ sơ: ${form.userName}`
                      : `Thông tin: ${form.userName}`}
                </h2>
                <p>
                  {drawerMode === 'detail'
                    ? 'Thông tin hồ sơ nhân sự'
                    : 'Nhập thông tin và lưu thay đổi'}
                </p>
              </div>
              <button
                type="button"
                className="drawer-close"
                onClick={closeDrawer}
                aria-label="Đóng"
              >
                ×
              </button>
            </header>
            <div className="drawer-body">
              <fieldset disabled={drawerMode === 'detail'}>
                <div className="drawer-section">
                  <h3>Thông tin cơ bản</h3>
                  <label>
                    Họ và tên <b>*</b>
                    <input
                      value={form.userName}
                      onChange={(event) =>
                        updateForm({ userName: event.target.value })
                      }
                    />
                  </label>
                  <label>
                    Email <b>*</b>
                    <input
                      type="email"
                      value={form.email}
                      disabled={drawerMode !== 'create'}
                      onChange={(event) =>
                        updateForm({ email: event.target.value })
                      }
                    />
                  </label>
                  {drawerMode === 'create' && (
                    <label>
                      Mật khẩu <b>*</b>
                      <span className="password-input">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={form.password}
                          onChange={(event) =>
                            updateForm({ password: event.target.value })
                          }
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? 'Ẩn' : 'Hiện'}
                        </button>
                      </span>
                    </label>
                  )}
                </div>
                <div className="drawer-section">
                  <h3>Vị trí &amp; Tổ chức</h3>
                  <label>
                    Chức vụ / Position
                    <input
                      placeholder="Ví dụ: junior, PM1, intern..."
                      value={form.position}
                      onChange={(event) =>
                        updateForm({ position: event.target.value })
                      }
                    />
                  </label>
                  <label>
                    Phòng ban <b>*</b>
                    <select
                      value={form.departmentId}
                      onChange={(event) =>
                        updateForm({ departmentId: event.target.value })
                      }
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
                    Vai trò <b>*</b>
                    <div className="drawer-role-selector">
                      {roles.map((role) => (
                        <button
                          type="button"
                          className={
                            form.roles.includes(role) ? 'selected' : ''
                          }
                          key={role}
                          onClick={() =>
                            updateForm({
                              roles: form.roles.includes(role)
                                ? form.roles.filter((item) => item !== role)
                                : [...form.roles, role],
                            })
                          }
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </label>
                </div>
                <div className="drawer-section">
                  <h3>Chi phí</h3>
                  <label>
                    Resource Rate <span className="field-hint">rate/h</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.resourceRate}
                      onChange={(event) =>
                        updateForm({ resourceRate: event.target.value })
                      }
                    />
                  </label>
                </div>
              </fieldset>
              {error && <div className="people-error">{error}</div>}
            </div>
            {drawerMode !== 'detail' && (
              <footer className="drawer-footer">
                <button
                  className="drawer-cancel"
                  type="button"
                  onClick={closeDrawer}
                >
                  Hủy
                </button>
                <button
                  className="people-primary-button"
                  type="button"
                  disabled={saving}
                  onClick={() => void submitForm()}
                >
                  {saving
                    ? 'Đang lưu...'
                    : drawerMode === 'create'
                      ? 'Tạo tài khoản'
                      : 'Lưu thay đổi'}
                </button>
              </footer>
            )}
            {confirmChange && (
              <div className="confirm-dialog">
                <h3>Xác nhận thay đổi quyền/phòng ban</h3>
                <p>
                  Hành động này sẽ thay đổi quyền truy cập hệ thống của nhân
                  viên này. Bạn có chắc chắn muốn tiếp tục?
                </p>
                <div>
                  <button type="button" onClick={() => setConfirmChange(false)}>
                    Hủy
                  </button>
                  <button
                    className="people-primary-button"
                    type="button"
                    onClick={() => void submitForm()}
                  >
                    Đồng ý
                  </button>
                </div>
              </div>
            )}
          </aside>
        </>
      )}
    </DashboardFrame>
  );
}
