import { useCallback, useEffect, useState } from 'react';
import {
  createDepartment,
  deleteDepartment,
  getAllDepartments,
  getDepartmentById,
  getDepartmentStatistics,
  updateDepartment,
} from '@/apis/DepartmentApi';
import type {
  DepartmentResponse,
  DepartmentStatisticsResponse,
} from '@/dto/response';
import type {
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
} from '@/dto/request';
import DashboardFrame from '@/layouts/common/components/dashboard/DashboardFrame';
import Table from '@/layouts/common/components/ui/Table';

type DrawerMode = 'create' | 'edit' | 'detail';
type FormState = { id?: number; departmentName: string; hidden: boolean };
const emptyForm: FormState = { departmentName: '', hidden: false };

export default function DepartmentManagement({
  onLogout,
  onMenuChange,
}: {
  onLogout: () => void;
  onMenuChange: (label: string) => void;
}) {
  const [departments, setDepartments] = useState<DepartmentResponse[]>([]);
  const [statistics, setStatistics] =
    useState<DepartmentStatisticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [drawerMode, setDrawerMode] = useState<DrawerMode | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [list, stats] = await Promise.all([
        getAllDepartments(),
        getDepartmentStatistics(),
      ]);
      setDepartments(list.resultList ?? []);
      setStatistics(stats.result);
    } catch {
      setError('Không thể tải danh sách phòng ban. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    // Initial data load is an intentional side effect of mounting the page.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const closeDrawer = () => {
    setDrawerMode(null);
    setError('');
  };
  const openCreate = () => {
    setForm(emptyForm);
    setError('');
    setDrawerMode('create');
  };
  const openDepartment = async (
    department: DepartmentResponse,
    mode: DrawerMode
  ) => {
    try {
      const response = await getDepartmentById(department.id);
      const item = response.result ?? department;
      setForm({
        id: item.id,
        departmentName: item.departmentName,
        hidden: item.hidden,
      });
      setDrawerMode(mode);
    } catch {
      setError('Không thể tải thông tin phòng ban.');
    }
  };
  const submit = async () => {
    if (!form.departmentName.trim()) {
      setError('Vui lòng nhập tên phòng ban.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (drawerMode === 'create') {
        const data: CreateDepartmentRequest = {
          departmentName: form.departmentName.trim(),
        };
        await createDepartment(data);
      } else if (drawerMode === 'edit' && form.id) {
        const data: UpdateDepartmentRequest = {
          departmentName: form.departmentName.trim(),
          hidden: form.hidden,
        };
        await updateDepartment(form.id, data);
      }
      closeDrawer();
      await load();
    } catch {
      setError('Không thể lưu phòng ban. Vui lòng kiểm tra lại.');
    } finally {
      setSaving(false);
    }
  };
  const remove = async (department: DepartmentResponse) => {
    if (!window.confirm(`Xóa phòng ban “${department.departmentName}”?`))
      return;
    setDeletingId(department.id);
    setError('');
    try {
      await deleteDepartment(department.id);
      await load();
    } catch {
      setError(
        'Không thể xóa phòng ban. Phòng ban có thể vẫn đang có nhân sự.'
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <DashboardFrame
      role="ADMIN"
      onLogout={onLogout}
      activeMenu="Quản lý Phòng ban"
      onMenuChange={onMenuChange}
    >
      <div className="department-page">
        <div className="department-header">
          <div>
            <h1>Quản lý phòng ban</h1>
            <p>Theo dõi tổ chức và nhân sự theo từng phòng ban</p>
          </div>
          <button
            className="department-primary"
            type="button"
            onClick={openCreate}
          >
            ＋&nbsp; Thêm phòng ban
          </button>
        </div>
        <div className="department-summary">
          <section>
            <small>Tổng số phòng ban</small>
            <strong>{statistics?.totalDepartments ?? '—'}</strong>
          </section>
          <section>
            <small>
              <i className="status-dot active" />
              Đang hoạt động
            </small>
            <strong>{statistics?.activeDepartments ?? '—'}</strong>
          </section>
          <section>
            <small>
              <i className="status-dot hidden" />
              Đang ẩn
            </small>
            <strong>{statistics?.hiddenDepartments ?? '—'}</strong>
          </section>
        </div>
        <section className="department-panel">
          {error && !drawerMode && (
            <div className="department-error">{error}</div>
          )}
          <div className="department-table-wrap">
            <Table className="department-table">
              <thead>
                <tr>
                  <th>Tên phòng ban</th>
                  <th>Trạng thái</th>
                  <th>Thành viên</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="department-empty" colSpan={4}>
                      Đang tải danh sách...
                    </td>
                  </tr>
                ) : departments.length === 0 ? (
                  <tr>
                    <td className="department-empty" colSpan={4}>
                      Chưa có phòng ban.
                    </td>
                  </tr>
                ) : (
                  departments.map((department) => (
                    <tr
                      key={department.id}
                      className="department-row-clickable"
                      onClick={() => void openDepartment(department, 'detail')}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          void openDepartment(department, 'detail');
                        }
                      }}
                      tabIndex={0}
                      role="link"
                      aria-label={`Xem chi tiết phòng ban ${department.departmentName}`}
                    >
                      <td>
                        <b>{department.departmentName}</b>
                      </td>
                      <td>
                        <span
                          className={`department-status ${department.hidden ? 'is-hidden' : 'is-active'}`}
                        >
                          <i />
                          {department.hidden ? 'Đang ẩn' : 'Đang hoạt động'}
                        </span>
                      </td>
                      <td>
                        <span className="member-pill">
                          {department.employeeCount} thành viên
                        </span>
                      </td>
                      <td>
                        <div className="department-actions">
                          <button
                            type="button"
                            title="Chỉnh sửa"
                            aria-label={`Sửa phòng ban ${department.departmentName}`}
                            onClick={(event) => {
                              event.stopPropagation();
                              void openDepartment(department, 'edit');
                            }}
                          >
                            <span aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            title="Xóa"
                            className="delete"
                            aria-label={`Xóa phòng ban ${department.departmentName}`}
                            disabled={deletingId === department.id}
                            onClick={(event) => {
                              event.stopPropagation();
                              void remove(department);
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
            </Table>
          </div>
        </section>
      </div>
      {drawerMode && (
        <>
          <div className="department-backdrop" onClick={closeDrawer} />
          <aside className="department-drawer" role="dialog" aria-modal="true">
            <header>
              <div>
                <h2>
                  {drawerMode === 'create'
                    ? 'Thêm phòng ban'
                    : drawerMode === 'edit'
                      ? 'Chỉnh sửa phòng ban'
                      : 'Chi tiết phòng ban'}
                </h2>
                <p>
                  {drawerMode === 'detail'
                    ? 'Thông tin phòng ban và số lượng nhân sự'
                    : 'Nhập thông tin phòng ban'}
                </p>
              </div>
              <button type="button" onClick={closeDrawer}>
                ×
              </button>
            </header>
            <div className="department-drawer-body">
              <label>
                Tên phòng ban <b>*</b>
                <input
                  disabled={drawerMode === 'detail'}
                  value={form.departmentName}
                  onChange={(event) =>
                    setForm({ ...form, departmentName: event.target.value })
                  }
                  placeholder="Ví dụ: Phòng Kỹ thuật"
                />
              </label>
              {drawerMode !== 'create' && (
                <>
                  <label>
                    Trạng thái
                    <select
                      className={
                        drawerMode === 'detail'
                          ? 'department-readonly-select'
                          : ''
                      }
                      disabled={drawerMode === 'detail'}
                      value={form.hidden ? 'hidden' : 'active'}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          hidden: event.target.value === 'hidden',
                        })
                      }
                    >
                      <option value="active">Đang hoạt động</option>
                      <option value="hidden">Đang ẩn</option>
                    </select>
                  </label>
                  {drawerMode === 'detail' && (
                    <div className="detail-count">
                      <span>Số nhân viên</span>
                      <strong>
                        {departments.find((item) => item.id === form.id)
                          ?.employeeCount ?? 0}
                      </strong>
                    </div>
                  )}
                </>
              )}
            </div>
            {error && <div className="department-error">{error}</div>}
            {drawerMode !== 'detail' && (
              <footer>
                <button type="button" onClick={closeDrawer}>
                  Hủy
                </button>
                <button
                  className="department-primary"
                  type="button"
                  disabled={saving}
                  onClick={() => void submit()}
                >
                  {saving
                    ? 'Đang lưu...'
                    : drawerMode === 'create'
                      ? 'Thêm phòng ban'
                      : 'Lưu thay đổi'}
                </button>
              </footer>
            )}
          </aside>
        </>
      )}
    </DashboardFrame>
  );
}
