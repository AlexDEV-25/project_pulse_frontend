import type { EvmHealthResponse } from '@/dto/response';
import Icon from '@/layouts/common/components/ui/Icon';

const money = (value: number | null | undefined) =>
  `${(value ?? 0).toLocaleString('vi-VN')} Point`;
const metricNumber = (value: number | null | undefined) =>
  value == null ? '—' : value.toFixed(2);

export function EvmMetricCards({ evm }: { evm: EvmHealthResponse | null }) {
  const metrics = [
    {
      label: 'Chỉ số Hiệu suất Chi phí (CPI)',
      value: metricNumber(evm?.cpi),
      hint: evm?.cpi != null && evm.cpi >= 1 ? 'Tốt' : 'Rủi ro',
      tone: evm?.cpi != null && evm.cpi >= 1 ? 'good' : 'risk',
      icon: evm?.cpi != null && evm.cpi >= 1 ? 'trend-up' : 'warning',
    },
    {
      label: 'Chỉ số Hiệu suất Lịch trình (SPI)',
      value: metricNumber(evm?.spi),
      hint: evm?.spi != null && evm.spi >= 1 ? 'Tốt' : 'Rủi ro',
      tone: evm?.spi != null && evm.spi >= 1 ? 'good' : 'risk',
      icon: evm?.spi != null && evm.spi >= 1 ? 'trend-up' : 'warning',
    },
    { label: 'Giá trị Thu được (EV)', value: money(evm?.ev) },
    { label: 'Chi phí Thực tế (AC)', value: money(evm?.ac) },
  ] as const;
  return (
    <section className="detail-metrics" aria-label="Chỉ số dự án">
      {metrics.map((metric) => (
        <article className="evm-metric" key={metric.label}>
          <div className="evm-metric-label">{metric.label}</div>
          {'icon' in metric && (
            <span className={`evm-metric-icon ${metric.tone}`}>
              <Icon name={metric.icon} size={18} />
            </span>
          )}
          <strong>{metric.value}</strong>
          {'hint' in metric && (
            <span className={`evm-metric-hint ${metric.tone}`}>
              {metric.hint}
            </span>
          )}
        </article>
      ))}
    </section>
  );
}
