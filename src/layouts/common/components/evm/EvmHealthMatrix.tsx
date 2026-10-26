import type { PhaseEvmDetailResponse } from '@/dto/response';
import Icon from '@/layouts/common/components/ui/Icon';

interface Props {
  phases: PhaseEvmDetailResponse[];
}

export default function EvmHealthMatrix({ phases }: Props) {
  // Classify phases into 4 quadrants
  const q1Phases = phases.filter((p) => (p.cpi ?? 1) >= 1 && (p.spi ?? 1) >= 1);
  const q2Phases = phases.filter((p) => (p.cpi ?? 1) < 1 && (p.spi ?? 1) >= 1);
  const q3Phases = phases.filter((p) => (p.cpi ?? 1) >= 1 && (p.spi ?? 1) < 1);
  const q4Phases = phases.filter((p) => (p.cpi ?? 1) < 1 && (p.spi ?? 1) < 1);

  return (
    <div className="evm-panel">
      <div className="evm-panel-header">
        <div>
          <h3 className="evm-panel-title">
            <Icon name="layers" size={18} />
            Ma trận Phân loại Sức khỏe Phase
          </h3>
          <div className="evm-panel-subtitle">
            Phân bổ 4 góc phần tư theo cặp chỉ số hiệu suất chi phí &amp; tiến độ (CPI &amp; SPI)
          </div>
        </div>
      </div>

      <div className="evm-matrix-container">
        {/* Q2: Low CPI, High SPI */}
        <div className="evm-quadrant q2">
          <div className="evm-quadrant-header">
            <span className="evm-quadrant-title">Nhanh &amp; Vượt chi phí</span>
            <span className="evm-quadrant-crit">CPI &lt; 1, SPI ≥ 1</span>
          </div>
          <div className="evm-quadrant-points">
            {q2Phases.map((p) => (
              <span className="evm-phase-chip" key={p.phaseId}>
                {p.phaseName} ({p.cpi?.toFixed(2)} | {p.spi?.toFixed(2)})
              </span>
            ))}
            {q2Phases.length === 0 && (
              <span className="evm-phase-empty">
                Không có phase
              </span>
            )}
          </div>
        </div>

        {/* Q1: High CPI, High SPI */}
        <div className="evm-quadrant q1">
          <div className="evm-quadrant-header">
            <span className="evm-quadrant-title">Vượt trội &amp; Tiết kiệm</span>
            <span className="evm-quadrant-crit">CPI ≥ 1, SPI ≥ 1</span>
          </div>
          <div className="evm-quadrant-points">
            {q1Phases.map((p) => (
              <span className="evm-phase-chip" key={p.phaseId}>
                {p.phaseName} ({p.cpi?.toFixed(2)} | {p.spi?.toFixed(2)})
              </span>
            ))}
            {q1Phases.length === 0 && (
              <span className="evm-phase-empty">
                Không có phase
              </span>
            )}
          </div>
        </div>

        {/* Q4: Low CPI, Low SPI */}
        <div className="evm-quadrant q4">
          <div className="evm-quadrant-header">
            <span className="evm-quadrant-title">Báo động (Trễ &amp; Vượt ngân sách)</span>
            <span className="evm-quadrant-crit">CPI &lt; 1, SPI &lt; 1</span>
          </div>
          <div className="evm-quadrant-points">
            {q4Phases.map((p) => (
              <span className="evm-phase-chip" key={p.phaseId}>
                {p.phaseName} ({p.cpi?.toFixed(2)} | {p.spi?.toFixed(2)})
              </span>
            ))}
            {q4Phases.length === 0 && (
              <span className="evm-phase-empty">
                Không có phase
              </span>
            )}
          </div>
        </div>

        {/* Q3: High CPI, Low SPI */}
        <div className="evm-quadrant q3">
          <div className="evm-quadrant-header">
            <span className="evm-quadrant-title">Tiết kiệm &amp; Chậm trễ</span>
            <span className="evm-quadrant-crit">CPI ≥ 1, SPI &lt; 1</span>
          </div>
          <div className="evm-quadrant-points">
            {q3Phases.map((p) => (
              <span className="evm-phase-chip" key={p.phaseId}>
                {p.phaseName} ({p.cpi?.toFixed(2)} | {p.spi?.toFixed(2)})
              </span>
            ))}
            {q3Phases.length === 0 && (
              <span className="evm-phase-empty">
                Không có phase
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

