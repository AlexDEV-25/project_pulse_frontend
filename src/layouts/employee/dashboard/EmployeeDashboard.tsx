import { useEffect, useState } from 'react';
import {
  getEmployeeProjectPointStatistics,
  getEmployeeStatisticsSummary,
  getEmployeeTaskStatistics,
} from '@/apis/StatisticsApi';
import type {
  EmployeeStatisticsSummaryResponse,
  EmployeeTaskStatisticsResponse,
} from '@/dto/response';
import StatCard from '@/layouts/common/components/dashboard/StatCard';
import PointChart from '@/layouts/common/components/dashboard/PointChart';
import { EmployeeTable } from '@/layouts/common/components/dashboard/DashboardTable';
import DashboardFrame from '@/layouts/common/components/dashboard/DashboardFrame';
export default function EmployeeDashboard({
  onLogout,
  activeMenu,
  onMenuChange,
}: {
  onLogout: () => void;
  activeMenu?: string;
  onMenuChange?: (label: string) => void;
}) {
  const [summary, setSummary] =
    useState<EmployeeStatisticsSummaryResponse | null>(null);
  const [points, setPoints] = useState<Record<string, number>>({});
  const [tasks, setTasks] = useState<EmployeeTaskStatisticsResponse[]>([]);
  useEffect(() => {
    Promise.allSettled([
      getEmployeeStatisticsSummary(),
      getEmployeeProjectPointStatistics(),
      getEmployeeTaskStatistics(),
    ]).then(([a, b, c]) => {
      if (a.status === 'fulfilled') setSummary(a.value.result);
      if (b.status === 'fulfilled') setPoints(b.value.result ?? {});
      if (c.status === 'fulfilled') setTasks(c.value.resultList ?? []);
    });
  }, []);
  return (
    <DashboardFrame
      role="EMPLOYEE"
      onLogout={onLogout}
      activeMenu={activeMenu}
      onMenuChange={onMenuChange}
    >
      <div className="stat-grid employee-grid">
        <StatCard
          label="TỔNG SỐ DỰ ÁN"
          value={summary?.totalProject ?? '...'}
        />
        <StatCard
          label="TỔNG POINT TÍCH LŨY"
          value={summary?.totalEarnedPoint ?? '...'}
        />
        <StatCard
          label="SỐ TASK ĐƯỢC GIAO"
          value={summary?.totalAssignedTask ?? '...'}
        />
        <StatCard
          label="TỔNG TASK HOÀN THÀNH"
          value={summary?.totalCompletedTask ?? '...'}
        />
      </div>
      <section className="dash-panel chart-panel employee-points">
        <h2>POINT KIẾM ĐƯỢC THEO DỰ ÁN</h2>
        <PointChart data={points} />
      </section>
      <EmployeeTable rows={tasks} />
    </DashboardFrame>
  );
}
