import type { PhaseEvmDetailResponse } from '@/dto/response';
import Icon from '@/layouts/common/components/ui/Icon';

interface Props {
  phases: PhaseEvmDetailResponse[];
}

export default function EvmPhaseTable({ phases }: Props) {
  if (!phases || phases.length === 0) {
    return null;
  }

  const formatNumber = (val?: number | null) => {
    if (val == null) return '0';
    return val.toLocaleString('vi-VN');
  };

  const formatRatio = (val?: number | null) => {
    if (val == null) return 'N/A';
    return val.toFixed(2);
  };

  return (
    <div className="evm-table-panel">
      <div className="evm-panel-header">
        <div>
          <h3 className="evm-panel-title">
            <Icon name="file" size={18} />
            Bảng Chỉ số EVM Chi tiết Từng Giai đoạn (Phase Breakdown)
          </h3>
          <div className="evm-panel-subtitle">
            Theo dõi toàn diện các tham số PV, EV, AC, CV, SV, CPI, SPI của từng giai đoạn
          </div>
        </div>
      </div>

      <div className="evm-table-wrap">
        <table className="evm-table">
          <thead>
            <tr>
              <th>Giai đoạn (Phase)</th>
              <th>Thời gian</th>
              <th>Trạng thái</th>
              <th>Tiến độ</th>
              <th>BAC</th>
              <th>PV</th>
              <th>EV</th>
              <th>AC</th>
              <th>CV</th>
              <th>SV</th>
              <th>CPI</th>
              <th>SPI</th>
              <th>Lũy kế EV</th>
              <th>Lũy kế AC</th>
            </tr>
          </thead>
          <tbody>
            {phases.map((p) => {
              const cv = p.cv ?? 0;
              const sv = p.sv ?? 0;
              const cpi = p.cpi ?? 0;
              const spi = p.spi ?? 0;

              return (
                <tr key={p.phaseId}>
                  <td>
                    <strong style={{ color: '#253437' }}>{p.phaseName}</strong>
                  </td>
                  <td style={{ color: '#65686b', fontSize: '12px' }}>
                    {p.startAt ? p.startAt.slice(0, 10) : ''} → {p.endAt ? p.endAt.slice(0, 10) : ''}
                  </td>
                  <td>
                    <span className={`evm-badge-status ${p.status}`}>
                      {p.status === 'DONE'
                        ? 'Hoàn thành'
                        : p.status === 'IN_PROGRESS'
                          ? 'Đang chạy'
                          : p.status === 'PLANNED'
                            ? 'Kế hoạch'
                            : p.status}
                    </span>
                  </td>
                  <td>
                    <strong>{p.progress ?? 0}%</strong>
                  </td>
                  <td>{formatNumber(p.bac)}</td>
                  <td>{formatNumber(p.pv)}</td>
                  <td style={{ color: '#4d9188', fontWeight: 600 }}>{formatNumber(p.ev)}</td>
                  <td style={{ color: '#647380', fontWeight: 600 }}>{formatNumber(p.ac)}</td>
                  <td style={{ color: cv >= 0 ? '#25694c' : '#a62f33', fontWeight: 600 }}>
                    {cv >= 0 ? '+' : ''}{formatNumber(cv)}
                  </td>
                  <td style={{ color: sv >= 0 ? '#25694c' : '#a62f33', fontWeight: 600 }}>
                    {sv >= 0 ? '+' : ''}{formatNumber(sv)}
                  </td>
                  <td>
                    <span className={`evm-ratio-tag ${cpi >= 1 ? 'good' : 'bad'}`}>
                      {formatRatio(p.cpi)}
                    </span>
                  </td>
                  <td>
                    <span className={`evm-ratio-tag ${spi >= 1 ? 'good' : 'bad'}`}>
                      {formatRatio(p.spi)}
                    </span>
                  </td>
                  <td style={{ color: '#4d9188', fontWeight: 500 }}>{formatNumber(p.cumulativeEv)}</td>
                  <td style={{ color: '#647380', fontWeight: 500 }}>{formatNumber(p.cumulativeAc)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

