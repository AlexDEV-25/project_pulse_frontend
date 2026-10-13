import { useEffect, useState } from 'react';
import { getProjectDetailForEmployee } from '@/apis/ProjectApi';
import type { ProjectResponse } from '@/dto/response';
import DashboardFrame from '@/layouts/common/components/dashboard/DashboardFrame';
import EmployeeProjectTabs from '@/layouts/employee/components/EmployeeProjectTabs';
import { ProjectDetails } from '@/layouts/common/project-detail/ProjectDetails';

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
    return () => {
      active = false;
    };
  }, [projectId]);

  return (
    <DashboardFrame
      role="EMPLOYEE"
      onLogout={onLogout}
      activeMenu={`Chi tiết dự án ${projectId}`}
      onMenuChange={onMenuChange}
    >
      <div className="employee-project-detail-page">
        <button
          className="employee-project-back"
          type="button"
          onClick={() => onMenuChange('Dự án tham gia')}
        >
          ← Quay lại danh sách dự án
        </button>
        {error && <div className="employee-project-error">{error}</div>}
        {!project && !error ? (
          <div className="employee-project-state">
            Đang tải chi tiết dự án...
          </div>
        ) : project ? (
          <div className="employee-project-detail-layout">
            <section className="employee-project-detail-main">
              <header className="employee-project-detail-main-header">
                <div>
                  <p>Chi tiết dự án</p>
                  <h1>{project.projectName}</h1>
                </div>
                <span
                  className={`employee-project-status ${project.projectStatus.toLowerCase()}`}
                >
                  {project.projectStatus}
                </span>
              </header>
              <EmployeeProjectTabs projectId={projectId} project={project} />
            </section>
            <ProjectDetails project={project} role="EMPLOYEE" />
          </div>
        ) : null}
      </div>
    </DashboardFrame>
  );
}
