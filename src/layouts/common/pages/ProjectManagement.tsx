import { useCallback, useEffect, useState } from 'react';
import {
  createProject,
  deleteProject,
  getAllProjects,
  updateProject,
} from '@/apis/ProjectApi';
import { getProjectOverviewStatistics } from '@/apis/StatisticsApi';
import { getAllUsers } from '@/apis/UserApi';
import type {
  CreateProjectRequest,
  UpdateProjectRequest,
} from '@/dto/request';
import type {
  ProjectOverviewStatisticsResponse,
  ProjectResponse,
  UserResponse,
} from '@/dto/response';
import Table from '@/layouts/common/components/ui/Table';
import type { ProjectStatus } from '@/dto/enum';
import DashboardFrame from '@/layouts/common/components/dashboard/DashboardFrame';
import {
  ManagementFilterButton,
  ManagementSearch,
  ManagementSelect,
} from '@/layouts/common/components/dashboard/ManagementFilters';

const statusOptions: { value: ProjectStatus; label: string; color: string }[] =
  [
    { value: 'DRAFT', label: 'Bản nháp', color: 'draft' },
    { value: 'IN_PROGRESS', label: 'Đang thực hiện', color: 'progress' },
    { value: 'ON_HOLD', label: 'Tạm dừng', color: 'hold' },
    { value: 'DONE', label: 'Hoàn thành', color: 'done' },
    { value: 'CANCELLED', label: 'Đã hủy', color: 'cancelled' },
  ];
type FormState = {
  id?: number;
  projectName: string;
  pmId: string;
  startAt: string;
  endAt: string;
  clientBudget: string;
  projectBudget: string;
  description: string;
  projectStatus: ProjectStatus;
};
const emptyForm: FormState = {
  projectName: '',
  pmId: '',
  startAt: '',
  endAt: '',
  clientBudget: '0',
  projectBudget: '0',
  description: '',
  projectStatus: 'DRAFT',
};
const toInputDate = (value?: string | null) =>
  value ? value.slice(0, 10) : '';
const toApiDate = (value: string) => (value ? value.slice(0, 10) : '');
const money = (value: number | null | undefined) =>
  `${(value ?? 0).toLocaleString('vi-VN')} đ`;

export default function ProjectManagement({
  role,
  onLogout,
  onMenuChange,
}: {
  role: 'ADMIN' | 'PM';
  onLogout: () => void;
  onMenuChange: (label: string) => void;
}) {
  const isAdmin = role === 'ADMIN';
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [pms, setPms] = useState<UserResponse[]>([]);
  const [statistics, setStatistics] =
    useState<ProjectOverviewStatisticsResponse | null>(null);
  const [keyword, setKeyword] = useState('');
  const [pmId, setPmId] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState<FormState>(emptyForm);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit' | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getAllProjects({
        keyword: keyword.trim() || undefined,
        pmId: pmId ? Number(pmId) : undefined,
        projectStatus: status || undefined,
      });
      setProjects(response.resultList ?? []);
    } catch {
      setError('Không thể tải danh sách dự án. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [keyword, pmId, status]);
  useEffect(() => {
    // Synchronize the server-backed table with active filters.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);
  useEffect(() => {
    void getProjectOverviewStatistics()
      .then((response) => setStatistics(response.result))
      .catch(() => undefined);
    if (isAdmin)
      void getAllUsers({ roleNames: ['PM'] })
        .then((response) => setPms(response.resultList ?? []))
        .catch(() => undefined);
  }, [isAdmin]);

  const openCreate = () => {
    setForm({ ...emptyForm, pmId: pms[0] ? String(pms[0].id) : '' });
    setDrawerMode('create');
    setError('');
  };
  const openEdit = (project: ProjectResponse) => {
    setForm({
      id: project.id,
      projectName: project.projectName,
      pmId: String(project.pmId),
      startAt: toInputDate(project.startAt),
      endAt: toInputDate(project.endAt),
      clientBudget: String(project.clientBudget ?? 0),
      projectBudget: String(project.projectBudget ?? 0),
      description: project.description ?? '',
      projectStatus: project.projectStatus,
    });
    setDrawerMode('edit');
    setError('');
  };
  const close = () => {
    setDrawerMode(null);
    setForm(emptyForm);
    setError('');
  };
  const submit = async () => {
    if (!form.projectName.trim() || !form.pmId) {
      setError('Vui lòng nhập tên dự án và chọn chủ nhiệm dự án.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const base = {
        projectName: form.projectName.trim(),
        pmId: Number(form.pmId),
        startAt: toApiDate(form.startAt),
        endAt: toApiDate(form.endAt),
        clientBudget: Number(form.clientBudget) || 0,
        projectBudget: Number(form.projectBudget) || 0,
        description: form.description.trim(),
      };
      if (drawerMode === 'create')
        await createProject(base satisfies CreateProjectRequest);
      else if (form.id)
        await updateProject(form.id, {
          ...base,
          projectStatus: form.projectStatus,
        } satisfies UpdateProjectRequest);
      close();
      await load();
    } catch {
      setError('Không thể lưu dự án. Vui lòng kiểm tra dữ liệu và thử lại.');
    } finally {
      setSaving(false);
    }
  };
  const remove = async (project: ProjectResponse) => {
    if (!window.confirm(`Xóa dự án “${project.projectName}”?`)) return;
    setDeletingId(project.id);
    try {
      await deleteProject(project.id);
      await load();
    } catch {
      setError('Không thể xóa dự án.');
    } finally {
      setDeletingId(null);
    }
  };
  const count = (value: ProjectStatus) =>
    statistics?.projectStatusCounts?.[value] ?? 0;
  const summary = statusOptions.map((item) => ({
    ...item,
    count: count(item.value),
  }));
  const openDetail = (projectId: number) =>
    onMenuChange(`Chi tiết dự án ${projectId}`);

  return (
    <DashboardFrame
      role={role}
      onLogout={onLogout}
      activeMenu="Quản lý Dự án"
      onMenuChange={onMenuChange}
    >
      <div className="project-page">
        <div className="project-header">
          <div>
            <h1>Quản lý dự án</h1>
            <p>Theo dõi và quản lý toàn bộ dự án</p>
          </div>
          {isAdmin && (
            <button
              className="project-primary"
              type="button"
              onClick={openCreate}
            >
              ＋&nbsp; Tạo dự án mới
            </button>
          )}
        </div>
        <div className="project-summary">
          <section className="project-total">
            <div>
              <small>Tổng số dự án</small>
              <strong>{statistics?.totalProject ?? '—'}</strong>
            </div>
          </section>
          {summary.map((item) => (
            <section key={item.value}>
              <small>
                <i className={`project-dot ${item.color}`} />
                {item.label}
              </small>
              <strong>{item.count}</strong>
            </section>
          ))}
        </div>
        <section className="project-panel">
          <div className="project-toolbar">
            <ManagementSearch
              value={keyword}
              onChange={setKeyword}
              onSearch={() => void load()}
              placeholder="Tìm kiếm dự án..."
            />
            {isAdmin && (
              <ManagementSelect
                value={pmId}
                onChange={setPmId}
                placeholder="Tất cả PM"
                options={pms.map((pm) => ({
                  value: String(pm.id),
                  label: pm.userName,
                }))}
              />
            )}
            <ManagementSelect
              value={status}
              onChange={setStatus}
              placeholder="Tất cả trạng thái"
              options={statusOptions.map((item) => ({
                value: item.value,
                label: item.label,
              }))}
            />
            <ManagementFilterButton onClick={() => void load()} />
          </div>
          {error && !drawerMode && <div className="project-error">{error}</div>}
          <div className="project-table-wrap">
            <Table className="project-table">
              <thead>
                <tr>
                  <th>Dự án</th>
                  {isAdmin && <th>Chủ nhiệm dự án</th>}
                  <th>Thời gian dự kiến</th>
                  <th>Trạng thái</th>
                  {isAdmin && <th>Ngân sách khách hàng</th>}
                  <th>Ngân sách dự án</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="project-empty" colSpan={isAdmin ? 7 : 5}>
                      Đang tải danh sách...
                    </td>
                  </tr>
                ) : projects.length === 0 ? (
                  <tr>
                    <td className="project-empty" colSpan={isAdmin ? 7 : 5}>
                      Chưa có dự án.
                    </td>
                  </tr>
                ) : (
                  projects.map((project) => {
                    const item = statusOptions.find(
                      (option) => option.value === project.projectStatus
                    );
                    return (
                      <tr
                        key={project.id}
                        className="project-row-clickable"
                        onClick={() => openDetail(project.id)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            openDetail(project.id);
                          }
                        }}
                        tabIndex={0}
                        role="link"
                        aria-label={`Xem chi tiết dự án ${project.projectName}`}
                      >
                        <td>
                          <b>{project.projectName}</b>
                        </td>
                        {isAdmin && (
                          <td>
                            <span className="pm-avatar">
                              {project.pmName?.charAt(0) ?? '?'}
                            </span>
                            {project.pmName ?? '—'}
                          </td>
                        )}
                        <td>
                          {project.startAt?.slice(0, 10) ?? '—'} –{' '}
                          {project.endAt?.slice(0, 10) ?? '—'}
                        </td>
                        <td>
                          <span
                            className={`project-status ${item?.color ?? ''}`}
                          >
                            {item?.label ?? project.projectStatus}
                          </span>
                        </td>
                        {isAdmin && <td>{money(project.clientBudget)}</td>}
                        <td>{money(project.projectBudget)}</td>
                        <td>
                          <div className="project-actions">
                            {isAdmin && (
                              <>
                                <button
                                  title="Chỉnh sửa"
                                  type="button"
                                  aria-label={`Sửa dự án ${project.projectName}`}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    openEdit(project);
                                  }}
                                >
                                  <svg viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="m4 16.5-.8 3.8 3.8-.8L18.5 8a2.1 2.1 0 0 0-3-3L4 16.5Zm10.1-9.1 3 3" />
                                  </svg>
                                </button>
                                <button
                                  title="Xóa"
                                  type="button"
                                  className="delete"
                                  aria-label={`Xóa dự án ${project.projectName}`}
                                  disabled={deletingId === project.id}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    void remove(project);
                                  }}
                                >
                                  <svg viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M5 7h14m-9 4v6m4-6v6M9 7V4h6v3m-9 0 1 13h10l1-13" />
                                  </svg>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </Table>
          </div>
        </section>
      </div>
      {drawerMode && (
        <>
          <div className="project-backdrop" onClick={close} />
          <aside className="project-drawer">
            <header>
              <div>
                <h2>
                  {drawerMode === 'create'
                    ? 'Tạo dự án mới'
                    : 'Chỉnh sửa dự án'}
                </h2>
                <p>Nhập thông tin dự án</p>
              </div>
              <button type="button" onClick={close}>
                ×
              </button>
            </header>
            <div className="project-form">
              <label>
                Tên dự án <b>*</b>
                <input
                  value={form.projectName}
                  onChange={(event) =>
                    setForm({ ...form, projectName: event.target.value })
                  }
                />
              </label>
              <label>
                Chủ nhiệm dự án <b>*</b>
                <select
                  value={form.pmId}
                  onChange={(event) =>
                    setForm({ ...form, pmId: event.target.value })
                  }
                >
                  {pms.map((pm) => (
                    <option key={pm.id} value={pm.id}>
                      {pm.userName}
                    </option>
                  ))}
                </select>
              </label>
              <div className="project-form-grid">
                <label>
                  Bắt đầu
                  <input
                    type="date"
                    value={form.startAt}
                    onChange={(event) =>
                      setForm({ ...form, startAt: event.target.value })
                    }
                  />
                </label>
                <label>
                  Kết thúc
                  <input
                    type="date"
                    value={form.endAt}
                    onChange={(event) =>
                      setForm({ ...form, endAt: event.target.value })
                    }
                  />
                </label>
              </div>
              <div className="project-form-grid">
                <label>
                  Ngân sách khách hàng
                  <input
                    type="number"
                    min="0"
                    value={form.clientBudget}
                    onChange={(event) =>
                      setForm({ ...form, clientBudget: event.target.value })
                    }
                  />
                </label>
                <label>
                  Ngân sách dự án
                  <input
                    type="number"
                    min="0"
                    value={form.projectBudget}
                    onChange={(event) =>
                      setForm({ ...form, projectBudget: event.target.value })
                    }
                  />
                </label>
              </div>
              {drawerMode === 'edit' && (
                <label>
                  Trạng thái
                  <select
                    value={form.projectStatus}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        projectStatus: event.target.value as ProjectStatus,
                      })
                    }
                  >
                    {statusOptions.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <label>
                Mô tả
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                />
              </label>
              {error && <div className="project-error">{error}</div>}
            </div>
            <footer>
              <button type="button" onClick={close}>
                Hủy
              </button>
              <button
                className="project-primary"
                type="button"
                disabled={saving}
                onClick={() => void submit()}
              >
                {saving ? 'Đang lưu...' : 'Lưu dự án'}
              </button>
            </footer>
          </aside>
        </>
      )}
    </DashboardFrame>
  );
}
