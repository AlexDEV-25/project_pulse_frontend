import { useEffect, useState } from 'react';
import {
  getInProgressProjectStatistics,
  getProjectEvAcStatistics,
  getProjectStatusStatistics,
  getStatisticsSummary,
} from '../../apis/StatisticsApi';
import type {
  InProgressProjectStatisticsResponse,
  ProjectEvAcStatisticResponse,
  ProjectStatusStatisticResponse,
  StatisticsSummaryResponse,
} from '../../dto/response';
import type { ProjectStatus } from '../../dto/enum';
import { DashboardFrame } from '../employee/EmployeeDashboard';
import StatCard from '../components/StatCard';
import DonutChart from '../components/DonutChart';
import EvmChart from '../components/EvmChart';
import { ProjectTable } from '../components/DashboardTable';
export default function PmDashboard({
  onLogout,
  activeMenu,
  onMenuChange,
}: {
  onLogout: () => void;
  activeMenu?: string;
  onMenuChange?: (label: string) => void;
}) {
  const [summary, setSummary] = useState<StatisticsSummaryResponse | null>(
    null
  );
  const [statuses, setStatuses] = useState<
    Record<ProjectStatus, ProjectStatusStatisticResponse>
  >({} as Record<ProjectStatus, ProjectStatusStatisticResponse>);
  const [evm, setEvm] = useState<Record<string, ProjectEvAcStatisticResponse>>(
    {}
  );
  const [projects, setProjects] = useState<
    InProgressProjectStatisticsResponse[]
  >([]);
  useEffect(() => {
    Promise.allSettled([
      getStatisticsSummary(),
      getProjectStatusStatistics(),
      getProjectEvAcStatistics(),
      getInProgressProjectStatistics(),
    ]).then(([a, b, c, d]) => {
      if (a.status === 'fulfilled') setSummary(a.value.result);
      if (b.status === 'fulfilled')
        setStatuses(
          b.value.result ??
            ({} as Record<ProjectStatus, ProjectStatusStatisticResponse>)
        );
      if (c.status === 'fulfilled') setEvm(c.value.result ?? {});
      if (d.status === 'fulfilled') setProjects(d.value.resultList ?? []);
    });
  }, []);
  const risk = projects.filter(
    (project) => (project.cpi ?? 1) < 1 || (project.spi ?? 1) < 1
  ).length;
  return (
    <DashboardFrame
      role="PM"
      onLogout={onLogout}
      activeMenu={activeMenu}
      onMenuChange={onMenuChange}
    >
      <div className="stat-grid pm-grid">
        <StatCard
          label="TỔNG SỐ DỰ ÁN"
          value={summary?.totalProject ?? '...'}
        />
        <StatCard
          label="DỰ ÁN QUÁ HẠN & SẮP ĐẾN HẠN"
          value={
            summary
              ? summary.totalOverdueProject +
                summary.totalNearingDeadlineProject
              : '...'
          }
          note={
            summary
              ? `${summary.totalOverdueProject} Quá Hạn, ${summary.totalNearingDeadlineProject} Sắp Hết Hạn`
              : undefined
          }
          tone="danger"
        />
        <StatCard label="DỰ ÁN RỦI RO EVM" value={risk} />
      </div>
      <div className="chart-grid">
        <section className="dash-panel chart-panel status-panel">
          <h2>BIỂU ĐỒ TRẠNG THÁI DỰ ÁN</h2>
          <DonutChart data={statuses} />
        </section>
        <section className="dash-panel chart-panel evm-panel">
          <h2>BIỂU ĐỒ EVM DỰ ÁN</h2>
          <EvmChart data={evm} />
        </section>
      </div>
      <ProjectTable rows={projects} role="PM" />
    </DashboardFrame>
  );
}
