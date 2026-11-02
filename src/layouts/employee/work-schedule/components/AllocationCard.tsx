import type { AllocationResponse } from '@/dto/response';

export default function AllocationCard({
  allocation,
}: {
  allocation: AllocationResponse;
}) {
  const percentage = Math.max(0, Math.min(100, allocation.allocationPercentage));
  return (
    <article className="schedule-allocation-card">
      <strong>{allocation.projectName}</strong>
      <span>{allocation.phaseName}</span>
      <div className="schedule-allocation-value">
        <span>Allocation</span>
        <b>{allocation.allocationPercentage}%</b>
      </div>
      <div className="schedule-progress" aria-label={`${percentage}% allocation`}>
        <i style={{ width: `${percentage}%` }} />
      </div>
    </article>
  );
}
