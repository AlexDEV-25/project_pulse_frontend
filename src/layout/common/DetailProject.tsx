import { useEffect, useState } from 'react';
import { getProjectEvm, getProjectTaskCostsFiltered } from '../../apis/FinanceApi';
import { getProjectByIdForAdmin } from '../../apis/ProjectApi';
import type { EvmHealthResponse, ProjectResponse, TaskCostTransactionResponse } from '../../dto/response';
import { DashboardFrame } from '../employee/EmployeeDashboard';
import {
  EvmMetricCards,
  ProjectDetailTabs,
  ProjectDetails,
} from '../components/project-detail';

export default function DetailProject({
  role,
  onLogout,
  onMenuChange,
  projectId,
}: {
  role: 'ADMIN' | 'PM';
  onLogout: () => void;
  onMenuChange: (label: string) => void;
  projectId: number;
}) {
  const [project, setProject] = useState<ProjectResponse | null>(null);
  const [evm, setEvm] = useState<EvmHealthResponse | null>(null);
  const [costs, setCosts] = useState<TaskCostTransactionResponse[]>([]);
  const [loadingCosts, setLoadingCosts] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.allSettled([getProjectByIdForAdmin(projectId), getProjectEvm(projectId), getProjectTaskCostsFiltered(projectId)])
      .then(([projectResult, evmResult, costsResult]) => {
        if (!active) return;
        if (projectResult.status === 'fulfilled') setProject(projectResult.value.result ?? null);
        if (evmResult.status === 'fulfilled') setEvm(evmResult.value.result ?? null);
        if (costsResult.status === 'fulfilled') setCosts(costsResult.value.resultList ?? []);
        if (projectResult.status === 'rejected' || evmResult.status === 'rejected' || costsResult.status === 'rejected') setError('Không thể tải đầy đủ dữ liệu dự án.');
        setLoadingCosts(false);
      });
    return () => { active = false; };
  }, [projectId]);

  const filterCosts = (keyword: string, phaseId?: number) => {
    setLoadingCosts(true);
    void getProjectTaskCostsFiltered(projectId, { keyword: keyword.trim() || undefined, phaseId })
      .then((response) => setCosts(response.resultList ?? []))
      .catch(() => setError('Không thể tải dữ liệu chi phí thực tế.'))
      .finally(() => setLoadingCosts(false));
  };
  return (
    <DashboardFrame
      role={role}
      onLogout={onLogout}
      activeMenu="Chi tiết dự án"
      onMenuChange={onMenuChange}
    >
      <div className="project-detail-page">
        <header className="project-detail-header">
          <div>
            <div className="project-detail-title">
              <h1>Chi tiết dự án: {project?.projectName ?? 'Đang tải...'}</h1>
            </div>
          </div>
          <div className="project-detail-actions">
            <button className="detail-edit" type="button">
              ✎&nbsp; Chỉnh sửa
            </button>
            <button className="detail-delete" type="button">
              ♜&nbsp; Xóa
            </button>
          </div>
        </header>
        <section className="evm-summary">
          <EvmMetricCards evm={evm} />
        </section>
        {error && <div className="project-detail-error">{error}</div>}
        <div className="project-detail-layout">
          <ProjectDetailTabs projectId={projectId} role={role} rows={costs} loading={loadingCosts} onFilter={filterCosts} />
          <ProjectDetails project={project} />
        </div>
      </div>
    </DashboardFrame>
  );
}
