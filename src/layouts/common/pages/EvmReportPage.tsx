import { useEffect, useState } from 'react';
import type { DashboardRole } from '@/layouts/common/components/navigation/Sidebar';
import DashboardFrame from '@/layouts/common/components/dashboard/DashboardFrame';
import Icon from '@/layouts/common/components/ui/Icon';
import { getAllProjects } from '@/apis/ProjectApi';
import {
  downloadProjectEvmCsv,
  getProjectEmployeesEvm,
  getProjectFinancialSummary,
  getProjectPhasesEvm,
} from '@/apis/FinanceApi';
import type {
  EmployeeEvmPerformanceResponse,
  PhaseEvmDetailResponse,
  ProjectEvmFinancialResponse,
  ProjectResponse,
} from '@/dto/response';
import EvmExecutiveCards from '@/layouts/common/components/evm/EvmExecutiveCards';
import EvmSCurveChart from '@/layouts/common/components/evm/EvmSCurveChart';
import EvmHealthMatrix from '@/layouts/common/components/evm/EvmHealthMatrix';
import EvmEmployeeSection from '@/layouts/common/components/evm/EvmEmployeeSection';
import EvmPhaseTable from '@/layouts/common/components/evm/EvmPhaseTable';
import '@/styles/dashboard/evm-report.css';

interface Props {
  role: DashboardRole;
  onLogout: () => void;
  onMenuChange?: (label: string) => void;
}

export default function EvmReportPage({ role, onLogout, onMenuChange }: Props) {
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  const [summary, setSummary] = useState<ProjectEvmFinancialResponse | null>(null);
  const [phases, setPhases] = useState<PhaseEvmDetailResponse[]>([]);
  const [employees, setEmployees] = useState<EmployeeEvmPerformanceResponse[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [exporting, setExporting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // 1. Load project list on mount
  useEffect(() => {
    getAllProjects()
      .then((res) => {
        const list: ProjectResponse[] =
          res.resultList ?? (res.result ? [res.result] : []);
        setProjects(list);
        if (list.length > 0) {
          // Priority to in-progress projects, otherwise pick first
          const inProgress = list.find((p) => p.projectStatus === 'IN_PROGRESS');
          setSelectedProjectId(inProgress ? inProgress.id : list[0].id);
        } else {
          setLoading(false);
        }
      })
      .catch((err) => {
        setError('Không thể tải danh sách dự án: ' + (err?.message || ''));
        setLoading(false);
      });
  }, []);

  // 2. Load EVM report data when project changes
  const fetchReportData = (projectId: number) => {
    setLoading(true);
    setError('');

    Promise.allSettled([
      getProjectFinancialSummary(projectId),
      getProjectPhasesEvm(projectId),
      getProjectEmployeesEvm(projectId),
    ])
      .then(([summaryRes, phasesRes, employeesRes]) => {
        if (summaryRes.status === 'fulfilled' && summaryRes.value.result) {
          setSummary(summaryRes.value.result);
        } else {
          setSummary(null);
        }

        if (phasesRes.status === 'fulfilled') {
          const raw = (phasesRes.value.result ?? phasesRes.value.resultList ?? []) as unknown;
          setPhases(Array.isArray(raw) ? (raw as PhaseEvmDetailResponse[]) : []);
        } else {
          setPhases([]);
        }

        if (employeesRes.status === 'fulfilled') {
          const raw = (employeesRes.value.result ?? employeesRes.value.resultList ?? []) as unknown;
          setEmployees(Array.isArray(raw) ? (raw as EmployeeEvmPerformanceResponse[]) : []);
        } else {
          setEmployees([]);
        }
      })
      .catch((err) => {
        setError('Đã xảy ra lỗi khi tải dữ liệu báo cáo: ' + (err?.message || ''));
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (selectedProjectId) {
      fetchReportData(selectedProjectId);
    }
  }, [selectedProjectId]);

  // Handle Export CSV
  const handleExportCsv = async () => {
    if (!selectedProjectId) return;
    const currentProject = projects.find((p) => p.id === selectedProjectId);
    const projectName = currentProject?.projectName || `Project_${selectedProjectId}`;

    setExporting(true);
    try {
      await downloadProjectEvmCsv(selectedProjectId, projectName);
    } catch (err: unknown) {
      alert('Không thể xuất báo cáo CSV: ' + ((err as Error)?.message || 'Lỗi server'));
    } finally {
      setExporting(false);
    }
  };

  const currentProject = projects.find((p) => p.id === selectedProjectId);

  return (
    <DashboardFrame
      role={role}
      onLogout={onLogout}
      activeMenu="Báo cáo EVM"
      onMenuChange={onMenuChange}
    >
      <div className="evm-report-shell">
        {/* TOOLBAR & CONTROLS */}
        <section className="evm-toolbar">
          <div className="evm-toolbar-left">
            <div className="evm-project-select">
              <label htmlFor="evm-project-dropdown">Dự án báo cáo:</label>
              <select
                id="evm-project-dropdown"
                className="evm-select-control"
                value={selectedProjectId ?? ''}
                onChange={(e) => setSelectedProjectId(Number(e.target.value))}
                disabled={loading || projects.length === 0}
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.projectName} {p.pmName ? `(PM: ${p.pmName})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {currentProject && (
              <span className={`evm-badge-status ${currentProject.projectStatus}`}>
                {currentProject.projectStatus === 'IN_PROGRESS'
                  ? 'Đang thực hiện'
                  : currentProject.projectStatus === 'DONE'
                    ? 'Hoàn thành'
                    : currentProject.projectStatus === 'DRAFT'
                      ? 'Bản nháp'
                      : currentProject.projectStatus}
              </span>
            )}
          </div>

          <div className="evm-toolbar-actions">
            <button
              type="button"
              className="evm-btn evm-btn-refresh"
              onClick={() => selectedProjectId && fetchReportData(selectedProjectId)}
              disabled={loading}
              title="Tải lại số liệu"
            >
              <Icon name="refresh" size={15} />
              Làm mới
            </button>

            <button
              type="button"
              className="evm-btn evm-btn-export"
              onClick={handleExportCsv}
              disabled={exporting || loading || !selectedProjectId}
              id="btn-export-evm-csv"
            >
              <Icon name="download" size={15} />
              {exporting ? 'Đang xuất CSV...' : 'Xuất Báo cáo CSV'}
            </button>
          </div>
        </section>

        {/* ERROR ALERT */}
        {error && (
          <div className="evm-error-banner">
            <Icon name="warning" size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* LOADING SKELETON */}
        {loading && (
          <div className="evm-loading-wrap">
            <Icon name="chart" size={32} className="evm-loading-icon" />
            <div className="evm-loading-text">Đang tổng hợp số liệu EVM &amp; Tài chính...</div>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && projects.length === 0 && (
          <div className="evm-empty-state">
            <Icon name="folder" size={42} className="evm-empty-icon" />
            <div className="evm-empty-title">Chưa có dự án nào trong hệ thống</div>
            <div>Hãy tạo dự án mới để bắt đầu theo dõi sức khỏe và chỉ số EVM.</div>
          </div>
        )}

        {/* MAIN REPORT DASHBOARD */}
        {!loading && selectedProjectId && (
          <>
            {/* 1. EXECUTIVE KPI FINANCIAL CARDS */}
            <EvmExecutiveCards summary={summary} role={role} />

            {/* 2. DUAL VISUAL PANELS: S-CURVE & HEALTH MATRIX */}
            <div className="evm-visual-panels">
              <EvmSCurveChart phases={phases} projectBudget={summary?.projectBudget} />
              <EvmHealthMatrix phases={phases} />
            </div>

            {/* 3. EMPLOYEE EV vs AC PERFORMANCE */}
            <EvmEmployeeSection employees={employees} />

            {/* 4. DETAILED PHASE BREAKDOWN TABLE */}
            <EvmPhaseTable phases={phases} />
          </>
        )}
      </div>
    </DashboardFrame>
  );
}
