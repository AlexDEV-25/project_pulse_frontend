import { useState } from 'react';
import { ActualCostTable } from './ActualCostTable';
import { AllocationTable } from './AllocationTable';
import { EarningTable } from './EarningTable';
import { ProjectMemberTable } from './ProjectMemberTable';
import { ProgressPhase } from './ProgressPhase';
import { PhaseComponent } from './PhaseComponent';
import { TaskComponent } from './TaskComponent';
import type { TaskCostTransactionResponse } from '@/dto/response';

const adminTabs = [
  'Quản lý nhân sự',
  'Tiến độ & Giai đoạn',
  'Phân bổ nhân sự',
  'Chi phí thực tế',
  'Giá trị thu được',
];
const pmTabs = [
  'Quản lý nhân sự',
  'Giai đoạn',
  'Nhiệm vụ',
  'Phân bổ nhân sự',
  'Chi phí thực tế',
  'Giá trị thu được',
];

export function ProjectDetailTabs({
  rows,
  loading,
  onFilter,
  projectId,
  role,
}: {
  rows: TaskCostTransactionResponse[];
  loading: boolean;
  onFilter: (keyword: string, phaseId?: number) => void;
  projectId: number;
  role: 'ADMIN' | 'PM';
}) {
  const tabs = role === 'PM' ? pmTabs : adminTabs;
  const [active, setActive] = useState(tabs[0]);
  return (
    <section className="project-tabs-card">
      <nav className="project-detail-tabs">
        {tabs.map((tab) => (
          <button
            className={tab === active ? 'active' : ''}
            key={tab}
            onClick={() => setActive(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>
      {active === 'Quản lý nhân sự' ? (
        <ProjectMemberTable projectId={projectId} canManage={role === 'PM'} />
      ) : active === 'Tiến độ & Giai đoạn' ? (
        <ProgressPhase
          projectId={projectId}
          canManage={role === 'ADMIN' || role === 'PM'}
        />
      ) : active === 'Giai đoạn' ? (
        <PhaseComponent projectId={projectId} canManage={role === 'PM'} />
      ) : active === 'Nhiệm vụ' ? (
        <TaskComponent projectId={projectId} canManage={role === 'PM'} />
      ) : active === 'Phân bổ nhân sự' ? (
        <AllocationTable projectId={projectId} canManage={role === 'PM'} />
      ) : active === 'Chi phí thực tế' ? (
        <ActualCostTable
          rows={rows}
          loading={loading}
          onFilter={onFilter}
        />
      ) : active === 'Giá trị thu được' ? (
        <EarningTable projectId={projectId} canTransfer={role === 'PM'} />
      ) : (
        <div className="tab-placeholder">
          <h3>{active}</h3>
          <p>Nội dung của mục này sẽ được cập nhật theo dữ liệu dự án.</p>
        </div>
      )}
    </section>
  );
}
