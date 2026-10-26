import type { ProjectEvmFinancialResponse } from '@/dto/response';
import Icon from '@/layouts/common/components/ui/Icon';

interface Props {
  summary: ProjectEvmFinancialResponse | null;
  role: 'ADMIN' | 'PM' | 'EMPLOYEE';
}

const formatMoney = (val?: number | null) => {
  if (val == null) return '0';
  return new Intl.NumberFormat('vi-VN').format(val);
};

const formatRatio = (val?: number | null) => {
  if (val == null) return '0.00';
  return val.toFixed(2);
};

export default function EvmExecutiveCards({ summary, role }: Props) {
  if (!summary) return null;

  const cpi = summary.cpi ?? 0;
  const spi = summary.spi ?? 0;
  const tcpi = summary.tcpi ?? 1;

  // Determine overall health status
  const isHealthy = cpi >= 1 && spi >= 1;
  const isCritical = cpi < 0.9 || spi < 0.9;
  const healthClass = isHealthy ? 'good' : isCritical ? 'danger' : 'warning';
  const healthLabel = isHealthy
    ? 'Vượt trội (Đúng tiến độ & Tiết kiệm)'
    : isCritical
      ? 'Báo động (Trễ hạn / Vượt chi phí)'
      : 'Cần theo dõi (Có biến động)';

  // Budget realization (EV / BAC)
  const evToBac = summary.evToBacRatio ?? 0;
  const vac = summary.vac ?? 0;

  // TCPI interpretation
  const tcpiTone = tcpi <= 1 ? 'good' : tcpi <= 1.2 ? 'warning' : 'danger';
  const tcpiHint =
    tcpi <= 1
      ? 'Thuận lợi: Đội ngũ có thể hoàn thành trong hạn mức'
      : tcpi <= 1.2
        ? 'Áp lực: Cần cải thiện năng suất làm việc'
        : 'Nguy cơ cao: Khó đạt mục tiêu ngân sách nếu không điều chỉnh';

  return (
    <section className="evm-cards-grid" aria-label="EVM Executive KPI Cards">
      {/* CARD 1: SỨC KHỎE EVM (CPI & SPI) */}
      <article className="evm-card">
        <div>
          <div className="evm-card-header">
            <span className="evm-card-title">Sức khỏe Dự án (CPI &amp; SPI)</span>
            <div className="evm-card-icon health">
              <Icon name="trend-up" size={18} />
            </div>
          </div>
          <div className="evm-card-value">
            CPI: {formatRatio(summary.cpi)} | SPI: {formatRatio(summary.spi)}
          </div>
          <div className="evm-card-sub">
            <span className={`evm-card-indicator ${healthClass}`}>
              {healthLabel}
            </span>
          </div>
        </div>
        <div style={{ marginTop: '16px', fontSize: '13px', color: '#65686b' }}>
          <div>EV: <strong style={{ color: '#253437' }}>{formatMoney(summary.ev)}</strong> / PV: <strong style={{ color: '#253437' }}>{formatMoney(summary.pv)}</strong></div>
          <div style={{ marginTop: '2px' }}>
            CV (Chi phí): <strong style={{ color: (summary.cv ?? 0) >= 0 ? '#25694c' : '#a62f33' }}>
              {(summary.cv ?? 0) >= 0 ? '+' : ''}{formatMoney(summary.cv)}
            </strong>
          </div>
        </div>
      </article>

      {/* CARD 2: TIẾN ĐỘ NGÂN SÁCH NỘI BỘ (EV / BAC) */}
      <article className="evm-card">
        <div>
          <div className="evm-card-header">
            <span className="evm-card-title">Ngân sách Nội bộ (EV / BAC)</span>
            <div className="evm-card-icon budget">
              <Icon name="target" size={18} />
            </div>
          </div>
          <div className="evm-card-value">
            {formatRatio(summary.evToBacRatio)}%
          </div>
          <div className="evm-card-sub">
            <span>BAC: <strong style={{ color: '#253437' }}>{formatMoney(summary.projectBudget)}</strong> điểm</span>
          </div>
        </div>
        <div>
          <div className="evm-progress-bar">
            <div
              className="evm-progress-fill"
              style={{
                width: `${Math.min(Math.max(evToBac, 0), 100)}%`,
                background: '#4d9188',
              }}
            />
          </div>
          <div style={{ marginTop: '8px', fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#65686b' }}>Dự báo chênh lệch (VAC):</span>
            <strong style={{ color: vac >= 0 ? '#25694c' : '#a62f33' }}>
              {vac >= 0 ? '+' : ''}{formatMoney(vac)}
            </strong>
          </div>
        </div>
      </article>

      {/* CARD 3: BIÊN LỢI NHUẬN HỢP ĐỒNG KHÁCH HÀNG (CLIENT MARGIN) */}
      <article className="evm-card">
        <div>
          <div className="evm-card-header">
            <span className="evm-card-title">Biên Lợi nhuận Hợp đồng KH</span>
            <div className="evm-card-icon margin">
              <Icon name="wallet" size={18} />
            </div>
          </div>
          {role === 'ADMIN' && summary.clientBudget != null ? (
            <>
              <div className="evm-card-value" style={{ color: '#4d9188' }}>
                {formatMoney(summary.currentMargin)}
              </div>
              <div className="evm-card-sub">
                <span className="evm-card-indicator good">
                  Tỷ suất: {formatRatio(summary.marginPercentage)}%
                </span>
                <span>/ KH: {formatMoney(summary.clientBudget)}</span>
              </div>
              <div style={{ marginTop: '14px', fontSize: '13px', color: '#65686b' }}>
                <div>Nghiệm thu: <strong style={{ color: '#253437' }}>{formatRatio(summary.evToClientBudgetRatio)}%</strong> giá trị hợp đồng</div>
                <div style={{ marginTop: '2px' }}>Dự kiến kết thúc: <strong style={{ color: '#253437' }}>{formatMoney(summary.forecastedMargin)}</strong></div>
              </div>
            </>
          ) : (
            <>
              <div className="evm-card-value" style={{ fontSize: '18px', color: '#65686b' }}>
                Bảo mật hợp đồng
              </div>
              <div className="evm-card-sub" style={{ marginTop: '8px', lineHeight: 1.4 }}>
                Chỉ tài khoản Quản trị viên (ADMIN) mới có quyền truy cập ngân sách thương mại từ khách hàng.
              </div>
              <div style={{ marginTop: '14px', fontSize: '13px', color: '#65686b' }}>
                Chi phí thực tế tiêu tốn (AC): <strong style={{ color: '#253437' }}>{formatMoney(summary.ac)}</strong>
              </div>
            </>
          )}
        </div>
      </article>

      {/* CARD 4: CHỈ SỐ ÁP LỰC VỀ ĐÍCH (TCPI & FORECAST) */}
      <article className="evm-card">
        <div>
          <div className="evm-card-header">
            <span className="evm-card-title">Áp lực Về đích (TCPI &amp; EAC)</span>
            <div className="evm-card-icon pressure">
              <Icon name="status" size={18} />
            </div>
          </div>
          <div className="evm-card-value">
            TCPI: {formatRatio(summary.tcpi)}
          </div>
          <div className="evm-card-sub">
            <span className={`evm-card-indicator ${tcpiTone}`}>
              {tcpi <= 1 ? 'Thuận lợi' : tcpi <= 1.2 ? 'Áp lực vừa' : 'Cảnh báo đỏ'}
            </span>
          </div>
        </div>
        <div style={{ marginTop: '14px', fontSize: '13px', color: '#65686b' }}>
          <div>Dự toán hoàn thành (EAC): <strong style={{ color: '#253437' }}>{formatMoney(summary.eac)}</strong></div>
          <div style={{ marginTop: '4px', fontSize: '12px', color: '#889096' }}>
            {tcpiHint}
          </div>
        </div>
      </article>
    </section>
  );
}

