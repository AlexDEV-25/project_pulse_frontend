import { useEffect, useState } from 'react';
import { getProjectDetailForEmployee } from '../apis/ProjectApi';
import type { ProjectResponse } from '../dto/response';
import { DashboardFrame } from './EmployeeDashboard';
import EmployeeProjectTabs from './components/EmployeeProjectTabs';

const formatDateTime = (value: string | null) => {
  if (!value) return 'Chưa xác định';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('vi-VN');
};

export default function EmployeeProjectDetail({
  projectId,
  onLogout,
  onMenuChange,
}: {
  projectId: number;
  onLogout: () => void;
  onMenuChange: (label: string) => void;
}) {
  const [project, setProject] = useState<ProjectResponse | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    void getProjectDetailForEmployee(projectId)
      .then((response) => active && setProject(response.result))
      .catch(() => active && setError('Không thể tải chi tiết dự án.'));
    return () => { active = false; };
  }, [projectId]);

  return (
    <DashboardFrame role="EMPLOYEE" onLogout={onLogout} activeMenu={`Chi tiết dự án ${projectId}`} onMenuChange={onMenuChange}>
      <div className="employee-project-detail-page">
        <button className="employee-project-back" type="button" onClick={() => onMenuChange('Dự án tham gia')}>
          ← Quay lại danh sách dự án
        </button>
        {error && <div className="employee-project-error">{error}</div>}
        {!project && !error ? (
          <div className="employee-project-state">Đang tải chi tiết dự án...</div>
        ) : project ? (
          <div className="employee-project-detail-layout">
            <section className="employee-project-detail-main">
              <header className="employee-project-detail-main-header">
                <div><p>Chi tiết dự án</p><h1>{project.projectName}</h1></div>
                <span className={`employee-project-status ${project.projectStatus.toLowerCase()}`}>{project.projectStatus}</span>
              </header>
              <EmployeeProjectTabs projectId={projectId} project={project} />
            </section>
            <aside className="employee-project-summary-card">
              <div className="employee-project-summary-heading"><h2>Chi tiết Dự án</h2><span aria-hidden="true">⚙</span></div>
              <h3>Chi tiết Dự án</h3>
              <div className="employee-summary-row"><span>Tên dự án</span><strong>{project.projectName}</strong></div>
              <div className="employee-summary-row"><span>Người phụ trách</span><strong>{project.pmName ?? 'Chưa phân công'} (PM)</strong></div>
              <div className="employee-summary-row"><span>Trạng thái</span><strong><em className={`employee-project-status ${project.projectStatus.toLowerCase()}`}>{project.projectStatus}</em></strong></div>
              <hr />
              <div className="employee-summary-row"><span>Ngày bắt đầu</span><strong>{formatDateTime(project.startAt)}</strong></div>
              <div className="employee-summary-row"><span>Ngày kết thúc</span><strong>{formatDateTime(project.endAt)}</strong></div>
              <div className="employee-summary-timeline"><i /><i /><i /></div>
              {project.description && <div className="employee-summary-description"><b>Mô tả:</b> {project.description}</div>}
            </aside>
          </div>
        ) : null}
      </div>
    </DashboardFrame>
  );
}
