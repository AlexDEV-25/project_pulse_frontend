import { useState } from 'react';
import type { EmployeeEvmPerformanceResponse } from '@/dto/response';
import Icon from '@/layouts/common/components/ui/Icon';

interface Props {
  employees: EmployeeEvmPerformanceResponse[];
}

export default function EvmEmployeeSection({ employees }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  if (!employees || employees.length === 0) {
    return (
      <div className="evm-panel" style={{ textAlign: 'center', padding: '40px 20px' }}>
        <p style={{ color: '#65686b' }}>Chưa có dữ liệu giao dịch công việc của nhân sự trong dự án này.</p>
      </div>
    );
  }

  // Filter employees
  const filteredEmployees =
    selectedCategory === 'ALL'
      ? employees
      : employees.filter((emp) => emp.performanceCategory === selectedCategory);

  // Maximum EV or AC among employees to scale the comparative bars
  const maxVal = Math.max(
    ...employees.map((e) => Math.max(e.totalEv || 0, e.totalAc || 0)),
    100
  );

  // Summary rollups
  const totalProjectAc = employees.reduce((sum, e) => sum + (e.totalAc || 0), 0);
  const totalProjectEv = employees.reduce((sum, e) => sum + (e.totalEv || 0), 0);
  const totalNet = totalProjectEv - totalProjectAc;

  const categoryLabels: Record<string, string> = {
    STAR_PERFORMER: 'Hiệu suất cao',
    HEAVY_LIFTER: 'Chủ lực',
    BALANCED: 'Cân bằng',
    NEEDS_IMPROVEMENT: 'Cần tối ưu',
  };

  return (
    <div className="evm-panel">
      <div className="evm-emp-header">
        <div>
          <h3 className="evm-panel-title">
            <Icon name="users" size={18} />
            Hiệu suất Đóng góp &amp; Chi phí Nhân sự (EV vs AC)
          </h3>
          <div className="evm-panel-subtitle">
            So sánh giá trị điểm tạo ra (EV) với chi phí ngày công công ty chi trả (AC) cho từng thành viên
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="evm-category-tabs">
          <button
            type="button"
            className={`evm-cat-tab ${selectedCategory === 'ALL' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('ALL')}
          >
            Tất cả ({employees.length})
          </button>
          <button
            type="button"
            className={`evm-cat-tab ${selectedCategory === 'STAR_PERFORMER' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('STAR_PERFORMER')}
          >
            Hiệu suất cao ({employees.filter((e) => e.performanceCategory === 'STAR_PERFORMER').length})
          </button>
          <button
            type="button"
            className={`evm-cat-tab ${selectedCategory === 'HEAVY_LIFTER' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('HEAVY_LIFTER')}
          >
            Chủ lực ({employees.filter((e) => e.performanceCategory === 'HEAVY_LIFTER').length})
          </button>
          <button
            type="button"
            className={`evm-cat-tab ${selectedCategory === 'NEEDS_IMPROVEMENT' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('NEEDS_IMPROVEMENT')}
          >
            Cần tối ưu ({employees.filter((e) => e.performanceCategory === 'NEEDS_IMPROVEMENT').length})
          </button>
        </div>
      </div>

      {/* Aggregate Overview Bar */}
      <div className="evm-emp-summary-bar">
        <div>
          <span className="evm-summary-label">Tổng nhân sự: </span>
          <strong style={{ color: '#253437' }}>{employees.length} thành viên</strong>
        </div>
        <div>
          <span className="evm-summary-label">Tổng EV tạo ra: </span>
          <strong style={{ color: '#4d9188' }}>{totalProjectEv.toLocaleString('vi-VN')} điểm</strong>
        </div>
        <div>
          <span className="evm-summary-label">Tổng AC chi trả: </span>
          <strong style={{ color: '#647380' }}>{totalProjectAc.toLocaleString('vi-VN')} điểm</strong>
        </div>
        <div>
          <span className="evm-summary-label">Thặng dư đóng góp: </span>
          <strong style={{ color: totalNet >= 0 ? '#25694c' : '#a62f33' }}>
            {totalNet >= 0 ? '+' : ''}{totalNet.toLocaleString('vi-VN')} điểm
          </strong>
        </div>
      </div>

      {/* Employee Cards Grid */}
      <div className="evm-employee-grid">
        {filteredEmployees.map((emp) => {
          const evPercent = Math.min(Math.max(((emp.totalEv || 0) / maxVal) * 100, 2), 100);
          const acPercent = Math.min(Math.max(((emp.totalAc || 0) / maxVal) * 100, 2), 100);
          const net = emp.netValue || 0;
          const roi = emp.roi || 1;

          return (
            <article className="evm-emp-card" key={emp.userId}>
              {/* Profile Header */}
              <div className="evm-emp-profile">
                <div className="evm-emp-avatar-wrap">
                  {emp.avatarUrl ? (
                    <img src={emp.avatarUrl} alt={emp.userName} className="evm-emp-avatar" />
                  ) : (
                    <div className="evm-emp-avatar">
                      {emp.userName.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="evm-emp-name">{emp.userName}</div>
                    <div className="evm-emp-pos">
                      {emp.position || 'Thành viên'} • Rate: {emp.resourceRate ?? 0}/ngày
                    </div>
                  </div>
                </div>

                <span className={`evm-emp-badge ${emp.performanceCategory}`}>
                  {categoryLabels[emp.performanceCategory] || 'Cân bằng'}
                </span>
              </div>

              {/* Comparative Dual Bars: EV vs AC */}
              <div className="evm-emp-bars-wrap">
                {/* EV Bar */}
                <div className="evm-bar-row">
                  <div className="evm-bar-label">
                    <span>Giá trị tạo ra (EV)</span>
                    <strong style={{ color: '#4d9188' }}>
                      {emp.totalEv.toLocaleString('vi-VN')}
                    </strong>
                  </div>
                  <div className="evm-bar-track">
                    <div className="evm-bar-fill ev" style={{ width: `${evPercent}%` }} />
                  </div>
                </div>

                {/* AC Bar */}
                <div className="evm-bar-row">
                  <div className="evm-bar-label">
                    <span>Chi phí nhân sự (AC)</span>
                    <strong style={{ color: '#647380' }}>
                      {emp.totalAc.toLocaleString('vi-VN')}
                    </strong>
                  </div>
                  <div className="evm-bar-track">
                    <div className="evm-bar-fill ac" style={{ width: `${acPercent}%` }} />
                  </div>
                </div>
              </div>

              {/* Work stats */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#65686b' }}>
                <span>Ngày công: <strong style={{ color: '#253437' }}>{emp.totalWorkdays} ngày</strong></span>
                <span>Hoàn thành: <strong style={{ color: '#253437' }}>{emp.completedTasksCount} task</strong></span>
              </div>

              {/* Footer Net value & ROI */}
              <div className="evm-emp-footer">
                <div>
                  <span style={{ color: '#65686b' }}>Thặng dư: </span>
                  <span className={`evm-emp-net ${net >= 0 ? 'positive' : 'negative'}`}>
                    {net >= 0 ? '+' : ''}{net.toLocaleString('vi-VN')}
                  </span>
                </div>
                <div className="evm-emp-roi">
                  Hệ số ROI: <span style={{ color: roi >= 1 ? '#25694c' : '#a62f33' }}>{roi.toFixed(2)}x</span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

