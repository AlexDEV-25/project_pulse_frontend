import type { ProjectResponse } from '@/dto/response';
import Icon from '@/layouts/common/components/ui/Icon';

const money = (value: number | null | undefined) =>
  `${(value ?? 0).toLocaleString('vi-VN')} Point`;
const date = (value: string | null | undefined) =>
  value ? new Date(value).toLocaleDateString('vi-VN') : '—';

const elapsedPercent = (
  startAt: string | null | undefined,
  endAt: string | null | undefined
) => {
  const start = startAt ? new Date(startAt).getTime() : NaN;
  const end = endAt ? new Date(endAt).getTime() : NaN;
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return 0;

  const elapsed = ((Date.now() - start) / (end - start)) * 100;
  return Math.round(Math.max(0, Math.min(100, elapsed)));
};

export function ProjectDetails({
  project,
}: {
  project: ProjectResponse | null;
}) {
  const progress = elapsedPercent(project?.startAt, project?.endAt);

  return (
    <aside className="project-detail-card">
      <h2>
        <Icon name="folder" size={20} />
        Chi tiết Dự án
      </h2>
      <p>
        <Icon name="folder" size={17} />
        <span><b>Dự án:</b> {project?.projectName ?? 'Đang tải...'}</span>
      </p>
      <p>
        <Icon name="user" size={17} />
        <span><b>Lead:</b> {project?.pmName ?? '—'} (PM)</span>
      </p>
      <p>
        <Icon name="status" size={17} />
        <span>
          <b>Status:</b>{' '}
          <span className="project-live-status">
            {project?.projectStatus === 'IN_PROGRESS'
              ? 'Đang thực hiện'
              : (project?.projectStatus ?? '—')}
          </span>
        </span>
      </p>
      <hr />
      <p>
        <Icon name="calendar" size={17} />
        <span><b>Start Date:</b> {date(project?.startAt)}</span>
      </p>
      <p>
        <Icon name="calendar" size={17} />
        <span><b>End Date:</b> {date(project?.endAt)}</span>
      </p>
      <div
        className="project-timeline"
        role="progressbar"
        aria-label="Thời gian đã trôi qua của dự án"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
      >
        <span style={{ width: `${progress}%` }} />
      </div>
      <div className="project-timeline-label">{progress}% thời gian đã qua</div>
      <hr />
      <p>
        <Icon name="coins" size={17} />
        <span><b>Client Budget:</b> {money(project?.clientBudget)}</span>
      </p>
      <p>
        <Icon name="wallet" size={17} />
        <span><b>Project Budget:</b> {money(project?.projectBudget)}</span>
      </p>
      <div className="project-description">
        <Icon name="file" size={17} />
        <span><b>Mô tả:</b> {project?.description || 'Chưa có mô tả.'}</span>
      </div>
    </aside>
  );
}
