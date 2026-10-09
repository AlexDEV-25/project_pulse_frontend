import { useCallback, useEffect, useState } from 'react';
import { getMyProjects } from '../apis/ProjectApi';
import type { ProjectResponse } from '../dto/response';
import { DashboardFrame } from './EmployeeDashboard';
import './employee-projects.css';

const statusLabels: Record<ProjectResponse['projectStatus'], string> = {
  DRAFT: 'Bản nháp',
  IN_PROGRESS: 'Đang thực hiện',
  ON_HOLD: 'Tạm dừng',
  DONE: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
};

const formatDate = (value: string | null) => {
  if (!value) return 'Chưa xác định';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value.slice(0, 10)
    : date.toLocaleDateString('vi-VN');
};

export default function EmployeeProjects({
  onLogout,
  onMenuChange,
}: {
  onLogout: () => void;
  onMenuChange: (label: string) => void;
}) {
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getMyProjects(keyword);
      setProjects(response.resultList ?? []);
    } catch {
      setError('Không thể tải danh sách dự án tham gia. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [keyword]);

  useEffect(() => {
    // Fetch server-backed data when the search term changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  return (
    <DashboardFrame
      role="EMPLOYEE"
      onLogout={onLogout}
      activeMenu="Dự án tham gia"
      onMenuChange={onMenuChange}
    >
      <div className="employee-project-page">
        <header className="employee-project-header">
          <div>
            <h1>Danh sách dự án đang tham gia</h1>
            <p>Các dự án bạn được phân công tham gia</p>
          </div>
          <div className="employee-project-toolbar">
            <label className="employee-project-search">
              <span aria-hidden="true">⌕</span>
              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && void load()}
                placeholder="Tìm kiếm dự án..."
                aria-label="Tìm kiếm dự án"
              />
            </label>
            <button type="button" onClick={() => void load()}>
              Bộ lọc
            </button>
          </div>
        </header>

        {error && <div className="employee-project-error">{error}</div>}
        {loading ? (
          <div className="employee-project-state">Đang tải danh sách dự án...</div>
        ) : projects.length === 0 ? (
          <div className="employee-project-state">Bạn chưa tham gia dự án nào.</div>
        ) : (
          <div className="employee-project-grid">
            {projects.map((project) => (
              <article className="employee-project-card" key={project.id}>
                <div className="employee-project-card-top">
                  <span className={`employee-project-status ${project.projectStatus.toLowerCase()}`}>
                    {statusLabels[project.projectStatus]}
                  </span>
                </div>
                <h2>{project.projectName}</h2>
                <p className="employee-project-manager">
                  Quản lý: <strong>{project.pmName ?? 'Chưa phân công'}</strong>
                </p>
                <p className="employee-project-description">
                  {project.description || 'Chưa có mô tả cho dự án này.'}
                </p>
                <div className="employee-project-meta">
                  <span><b>Bắt đầu</b>{formatDate(project.startAt)}</span>
                  <span><b>Hạn kết thúc</b>{formatDate(project.endAt)}</span>
                </div>
                <button
                  type="button"
                  className="employee-project-detail-button"
                  onClick={() => onMenuChange(`Chi tiết dự án ${project.id}`)}
                >
                  Xem chi tiết dự án <span aria-hidden="true">→</span>
                </button>
              </article>
            ))}
          </div>
        )}
      </div>
    </DashboardFrame>
  );
}
